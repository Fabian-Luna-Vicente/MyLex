from typing import TypedDict, Annotated, Optional
import operator

# Sub-tipos del State
class AIParticipant(TypedDict):
    participant_id: int
    persona_id: Optional[int]
    name: str
    role_prompt: str
    description: str
    example_responses: list[str]

class HumanParticipant(TypedDict):
    participant_id: int
    user_id: str
    name: str

class ChatMessagePayload(TypedDict):
    message_id: Optional[int]
    sender_participant_id: int
    sender_name: str
    is_ai: bool
    content: str
    timestamp: Optional[str]

class ReviewFeedback(TypedDict):
    is_valid: bool
    failed_criteria: list[str]
    correction_instructions: str

# ChatState
class ChatState(TypedDict):
    room_id: int
    conversation_language: str
    room_context: str
    room_summary: Optional[str]
    mentioned_ai_participant_ids: list[int]

    human_participants: list[HumanParticipant]
    ai_participants: list[AIParticipant]

    message_history: list[ChatMessagePayload]
    new_messages: Annotated[list[ChatMessagePayload], operator.add]

    vocabulary_targets: list[dict]

    ai_respondents_queue: list[int]
    current_ai_index: int

    current_draft: str

    correction_attempts: int
    max_correction_attempts: int
    last_review: Optional[ReviewFeedback]

    typing_delay_seconds: float

    pending_human_messages: Annotated[list[ChatMessagePayload], operator.add]
    should_interrupt: bool

    thread_id: str
    sent_messages: Annotated[list[ChatMessagePayload], operator.add]
