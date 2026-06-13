from typing import Dict, Any

# "limit": -1 means unlimited
SUBSCRIPTION_LIMITS: Dict[str, Dict[str, Any]] = {
    "free": {
        "max_lists": 15,
        "max_words_per_list": 30,
        "daily_dict_words": 20,
        "weekly_dict_context_words": 30,
        "daily_grammar_analysis": 10,
        "daily_writing_corrections": 5,
        "max_ai_companions": 20,
        "max_companions_per_room": 1,
        "max_chat_rooms": 15,
        "daily_chat_messages": 20,  # normal and fluid combined
        "direct_mode_enabled": False,
        "daily_direct_mode_messages": 0,
        "max_linked_lists_per_room": 3,
        "daily_chat_grammar_corrections": 20,
        "daily_icebreakers": 10,
        "daily_fluid_corrections": 20,
        "daily_ai_pronunciation": 30
    },
    "pro": {
        "max_lists": 50,
        "max_words_per_list": 100,
        "daily_dict_words": 100,
        "weekly_dict_context_words": 150,
        "daily_grammar_analysis": 50,
        "daily_writing_corrections": 25,
        "max_ai_companions": 50,
        "max_companions_per_room": 3,
        "max_chat_rooms": 50,
        "daily_chat_messages": 100,
        "direct_mode_enabled": True,
        "daily_direct_mode_messages": 20,
        "max_linked_lists_per_room": 10,
        "daily_chat_grammar_corrections": 100,
        "daily_icebreakers": 50,
        "daily_fluid_corrections": 100,
        "daily_ai_pronunciation": 150
    },
    "premium": {
        "max_lists": -1,
        "max_words_per_list": 500,
        "daily_dict_words": -1, # Fair use handled separately or 500/1000 soft limit
        "weekly_dict_context_words": -1,
        "daily_grammar_analysis": -1,
        "daily_writing_corrections": -1,
        "max_ai_companions": -1,
        "max_companions_per_room": 5,
        "max_chat_rooms": -1,
        "daily_chat_messages": -1,
        "direct_mode_enabled": True,
        "daily_direct_mode_messages": -1,
        "max_linked_lists_per_room": -1,
        "daily_chat_grammar_corrections": -1,
        "daily_icebreakers": -1,
        "daily_fluid_corrections": -1,
        "daily_ai_pronunciation": -1
    }
}

# Soft Limits para el Fair Use del plan Premium
FAIR_USE_LIMITS = {
    "daily_dict_words": 1000,
    "daily_chat_messages": 500,
    "daily_ai_pronunciation": 500,
    "daily_grammar_analysis": 500,
    "daily_writing_corrections": 500,
    "daily_chat_grammar_corrections": 500,
    "daily_fluid_corrections": 500,
}

def get_user_limit(subscription_tier: str, limit_key: str) -> int:
    """Returns the limit for a given tier and key. Applies Fair Use limits for premium if unlimited."""
    tier_limits = SUBSCRIPTION_LIMITS.get(subscription_tier, SUBSCRIPTION_LIMITS["free"])
    limit = tier_limits.get(limit_key, 0)
    
    # Si es ilimitado (-1) y hay un fair use limit definido, usamos el fair use limit
    if limit == -1 and limit_key in FAIR_USE_LIMITS:
        return FAIR_USE_LIMITS[limit_key]
        
    return limit
