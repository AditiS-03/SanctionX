import requests
import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

API_URL = "https://openrouter.ai/api/v1/chat/completions"

def chat_assistant(user_message):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a banking loan assistant. Do not request documents. Only answer general questions."},
            {"role": "user", "content": user_message}
        ]
    }

    r = requests.post(API_URL, json=payload, headers=headers, timeout=15)
    data = r.json()
    return data["choices"][0]["message"]["content"]
