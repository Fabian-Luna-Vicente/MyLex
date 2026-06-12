from langgraph.graph import StateGraph, END, START
from app.graph.state import ChatState
from app.graph.nodes import ChatGraphNodes

def build_chat_graph(ai_service, chat_repo):
    nodes = ChatGraphNodes(ai_service, chat_repo)
    builder = StateGraph(ChatState)

    builder.add_node("grammar_check", nodes.grammar_check_node)
    builder.add_node("orchestrator", nodes.orchestrator_node) 
    builder.add_node("generate",     nodes.generate_node)       
    builder.add_node("review",       nodes.review_node)         
    builder.add_node("send",         nodes.send_node)           

    def route_after_orchestrator(state: ChatState) -> str:
        if not state.get("ai_respondents_queue"):
            return "no_response"
        return "respond"

    def route_after_review(state: ChatState) -> str:
        review = state.get("last_review")
        if review is None or review.get("is_valid"):
            return "valid"
        if state.get("correction_attempts", 0) >= state.get("max_correction_attempts", 2):
            return "max_retries"
        return "retry"

    def route_after_send(state: ChatState) -> str:
        if state.get("should_interrupt") or state.get("pending_human_messages"):
            return "interrupt"
        next_index = state.get("current_ai_index", 0)
        if next_index < len(state.get("ai_respondents_queue", [])):
            return "more_ais"
        return "done"

    builder.add_edge(START, "grammar_check")
    builder.add_edge("grammar_check", "orchestrator")

    builder.add_conditional_edges(
        "orchestrator",
        route_after_orchestrator,
        {"respond": "generate", "no_response": END}
    )

    # Generator → Reviewer (always)
    builder.add_edge("generate", "review")

    # Reviewer → valid / retry / max_retries?
    builder.add_conditional_edges(
        "review",
        route_after_review,
        {"valid": "send", "retry": "generate", "max_retries": "send"}
    )

    # Shipping → More AIs / Interrupt / End?
    builder.add_conditional_edges(
        "send",
        route_after_send,
        {"more_ais": "generate", "interrupt": "send", "done": END}
    )

    return builder.compile()
