import anthropic
import os
from dotenv import load_dotenv

# Load the env file relative to this script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(script_dir, '.env'))
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def find_schemes(profile: dict) -> str:
    prompt = f"""
    You are a helpful Indian government scheme advisor.
    
    A user has the following profile:
    - Age: {profile['age']}
    - State: {profile['state']}
    - Category: {profile['category']}
    - Annual Family Income: {profile['income']}
    - Goal: {profile['goal']}
    
    Based on this profile, list 3-5 government schemes they qualify for.
    For each scheme mention:
    1. Scheme name
    2. What benefit they get
    3. Key eligibility condition
    4. Where to apply (website)
    
    Format each scheme clearly. Keep it simple and helpful.
    """
    
    message = client.messages.create(
        model="claude-3-5-sonnet-latest",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text