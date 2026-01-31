# state.py

sessions = {}

def get_session(session_id: str):
    """
    Returns an existing session or creates a new one.
    Ensures greeting (START) always comes first.
    """
    if session_id not in sessions:
        sessions[session_id] = {
            "step": "START",      # controls conversation flow
            "profile": {},       # stores user data
            "flags": {           # for fraud / kyc / checks
                "pan_verified": False,
                "kyc_verified": False,
                "fraud_risk": False
            }
        }
    return sessions[session_id]


def reset_sessions():
    """
    Clears all sessions (used by /reset endpoint)
    """
    sessions.clear()
