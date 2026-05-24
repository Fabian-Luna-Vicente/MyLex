import json
import asyncio
from langchain_core.runnables.config import RunnableConfig
from app.graph.state import ChatState, ReviewFeedback, ChatMessagePayload
from app.services.prompt_service import PromptService

class ChatGraphNodes:
    def __init__(self, ai_service, chat_repo):
        self.ai_service = ai_service
        self.chat_repo = chat_repo

    async def orchestrator_node(self, state: ChatState, config: RunnableConfig) -> dict:
        """
        Decides which AIs respond and in what order.
        """
        import random
        ai_participants = state["ai_participants"]
        
        human_participants = state.get("human_participants", [])
        
        if not ai_participants:
            return {"ai_respondents_queue": [], "current_ai_index": 0}
            
        # Check if any AI was explicitly mentioned
        mentioned_ids = state.get("mentioned_ai_participant_ids", [])
        
        # If there are at least 2 humans, only respond if explicitly mentioned
        if len(human_participants) >= 2:
            if mentioned_ids:
                return {
                    "ai_respondents_queue": mentioned_ids,
                    "current_ai_index": 0
                }
            else:
                return {"ai_respondents_queue": [], "current_ai_index": 0}

        # If there's 1 user and 1 AI, the AI ALWAYS responds
        if len(ai_participants) == 1:
            return {
                "ai_respondents_queue": [ai_participants[0]["participant_id"]],
                "current_ai_index": 0
            }
            
        # For multiple AIs, we use a smart router
        last_msg = ""
        if state["new_messages"]:
            last_msg = state["new_messages"][-1]["content"]
        elif state["message_history"]:
            last_msg = state["message_history"][-1]["content"]
            
        # Create dummy objects to match what select_ai_to_reply expects
        class DummyParticipant:
            def __init__(self, p):
                self.id = p["participant_id"]
                self.ai_name = p["name"]
                self.role = p["role_prompt"]
                self.ai_personality = p["description"]
                
        dummy_ais = [DummyParticipant(p) for p in ai_participants]
        
        selected_ids = await self.ai_service.select_ai_to_reply(
            state["room_context"],
            last_msg,
            dummy_ais
        )
        
        # The queue combines explicitly mentioned AIs (which always reply) and those selected by the router
        queue = []
        for pid in mentioned_ids:
            if pid not in queue:
                queue.append(pid)
        for pid in selected_ids:
            if pid not in queue:
                queue.append(pid)
                
        return {
            "ai_respondents_queue": queue,
            "current_ai_index": 0
        }

    async def generate_node(self, state: ChatState, config: RunnableConfig) -> dict:
        """
        Generates the AI's response draft.
        """
        ai_id = state["ai_respondents_queue"][state["current_ai_index"]]
        ai = next((p for p in state["ai_participants"] if p["participant_id"] == ai_id), None)
        
        if not ai:
            return {"current_draft": "Error: AI not found"}
            
        recent_msgs = state["message_history"][-5:] + state["new_messages"]
        chat_log = "\n".join([f'{m["sender_name"]}: {m["content"]}' for m in recent_msgs])
        
        vocab = [v["name"] for v in state.get("vocabulary_targets", [])]
        
        last_review = state.get('last_review') or {}
        review_feedback = last_review.get('correction_instructions', 'None')
        
        system_context = PromptService.get_generate_node_system_context(
            language=state['conversation_language'],
            name=ai['name'],
            description=ai['description'],
            role=ai['role_prompt'],
            review_feedback=review_feedback,
            room_summary=state.get('room_summary')
        )
        
        draft = await self.ai_service.generate_chat_response(
            user_message=f"Recent chat log:\n{chat_log}\n\nRespond as {ai['name']}.",
            context_words=vocab,
            system_context=system_context,
            language=state['conversation_language']
        )
        
        correction_attempts = state.get("correction_attempts", 0)
        if state.get("last_review"):
            correction_attempts += 1
            
        return {
            "current_draft": draft,
            "correction_attempts": correction_attempts
        }

    async def review_node(self, state: ChatState, config: RunnableConfig) -> dict:
        """
        Evaluates the draft for validity.
        """
        draft = state["current_draft"]
        ai_id = state["ai_respondents_queue"][state["current_ai_index"]]
        ai = next((p for p in state["ai_participants"] if p["participant_id"] == ai_id), None)
        
        prompt = PromptService.get_review_node_prompt(
            language=state['conversation_language'],
            role=ai['role_prompt'] if ai else 'None',
            message=draft
        )
        print("Prompt: ", prompt)
        try:
            resp_str = await self.ai_service._call_llm(prompt, "You are a strict evaluator. Return only JSON.", True, 0.1)
            parsed = json.loads(resp_str)
            review = ReviewFeedback(
                is_valid=parsed.get("is_valid", True),
                failed_criteria=parsed.get("failed_criteria", []),
                correction_instructions=parsed.get("correction_instructions", "")
            )
        except Exception as e:
            print(f"Review AI Error: {e}")
            review = ReviewFeedback(is_valid=True, failed_criteria=[], correction_instructions="")

        return {"last_review": review}

    async def send_node(self, state: ChatState, config: RunnableConfig) -> dict:
        """
        Saves and finalizes the message.
        """
        draft = state["current_draft"]
        ai_id = state["ai_respondents_queue"][state["current_ai_index"]]
        ai = next((p for p in state["ai_participants"] if p["participant_id"] == ai_id), None)
        
        saved_msg = await asyncio.to_thread(
            self.chat_repo.create_message,
            state["room_id"],
            ai_id,
            draft,
            "text"
        )
        
        msg_payload = ChatMessagePayload(
            message_id=saved_msg.id,
            sender_participant_id=ai_id,
            sender_name=ai["name"] if ai else "AI",
            is_ai=True,
            content=draft,
            timestamp=saved_msg.created_at.isoformat()
        )
        
        return {
            "sent_messages": [msg_payload],
            "new_messages": [msg_payload],
            "current_ai_index": state["current_ai_index"] + 1,
            "correction_attempts": 0,
            "last_review": None,
            "should_interrupt": False
        }
