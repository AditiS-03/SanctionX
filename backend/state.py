sessions = {}

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {
            "step": "START",
            "profile": {},
            "flags": {}
        }
    return sessions[session_id]

def reset_sessions():
    sessions.clear()