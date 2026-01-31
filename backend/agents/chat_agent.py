import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

SYSTEM_PROMPT = """
You are SanctionX, a digital loan officer.
You must:
- NEVER request PAN, Aadhaar, or documents
- NEVER make eligibility decisions
- NEVER verify income
- ONLY answer general loan questions politely
- Redirect user back to the loan process when needed
"""

def chat_assist(user_message: str):
    response = client.chat.completions.create(
        model="openai/gpt-4.1-mini",  # or mistral / gemini via OpenRouter
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    return response.choices[0].message.content
