import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load the env file relative to this script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(script_dir, '.env'))

def get_mock_schemes(profile: dict) -> list:
    """Returns realistic mock government schemes based on user profile as a fallback."""
    age = profile.get('age', 21)
    state = profile.get('state', 'Tamil Nadu')
    category = profile.get('category', 'General')
    income = profile.get('income', 'Below ₹1L')
    goal = profile.get('goal', 'Education / Scholarship')

    schemes = []

    if goal == "Education / Scholarship":
        if category in ["SC", "ST", "OBC"] and income in ["Below ₹1L", "₹1L–₹3L"]:
            schemes.append({
                "name": "Post-Matric Scholarship Scheme",
                "benefit": "100% tuition fee waiver and monthly maintenance allowance up to ₹1,200.",
                "eligibility": f"SC/ST/OBC students studying in class 11 or above. Family income must be under ₹2.5 Lakhs.",
                "apply_url": "https://scholarships.gov.in"
            })
        schemes.append({
            "name": "Central Sector Scheme of Scholarship (CSSS)",
            "benefit": "₹12,000 per year for graduation, ₹20,000 per year for post-graduation.",
            "eligibility": "Students above the 80th percentile in Class 12 board exams. Family income under ₹4.5 Lakhs.",
            "apply_url": "https://scholarships.gov.in"
        })
        schemes.append({
            "name": f"State Merit Scholarship ({state})",
            "benefit": "Financial assistance of ₹5,000 to ₹10,000 per academic year for higher studies.",
            "eligibility": f"Permanent resident of {state}, enrolled in a recognized college with good academic standing.",
            "apply_url": "https://scholarships.gov.in"
        })
    elif goal == "Start a Business":
        schemes.append({
            "name": "Pradhan Mantri Mudra Yojana (PMMY)",
            "benefit": "Collateral-free business loans up to ₹10 Lakhs (Shishu: up to ₹50k, Kishor: up to ₹5L, Tarun: up to ₹10L).",
            "eligibility": "Any Indian citizen starting a non-farm, income-generating small business.",
            "apply_url": "https://www.udyamimitra.in"
        })
        if category in ["SC", "ST"] or age >= 18:  # Target women/SC/ST for StandUp India
            schemes.append({
                "name": "Stand-Up India Scheme",
                "benefit": "Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield enterprises.",
                "eligibility": "SC/ST or female entrepreneurs above 18 years of age. At least 51% stake must be held by SC/ST/Woman.",
                "apply_url": "https://www.standupmitra.in"
            })
        schemes.append({
            "name": "PMEGP (Prime Minister's Employment Generation Programme)",
            "benefit": "Subsidy up to 35% of the project cost for setting up new manufacturing or service units.",
            "eligibility": "Individuals above 18 years of age. Minimum 8th standard pass for projects above ₹10 Lakhs.",
            "apply_url": "https://www.kviconline.gov.in"
        })
    elif goal == "Farming":
        schemes.append({
            "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "benefit": "Direct benefit transfer of ₹6,000 per year paid in three equal installments of ₹2,000.",
            "eligibility": "Small and marginal farmer families holding cultivable land in India.",
            "apply_url": "https://pmkisan.gov.in"
        })
        schemes.append({
            "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "benefit": "Low-premium crop insurance covering crop damage due to natural disasters, pests, or diseases.",
            "eligibility": "All farmers growing notified crops in notified areas, including tenant farmers.",
            "apply_url": "https://pmfby.gov.in"
        })
        schemes.append({
            "name": "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
            "benefit": "Up to 55% subsidy for drip and sprinkler irrigation equipment to optimize water usage.",
            "eligibility": "Farmers owning agricultural land with access to water source.",
            "apply_url": "https://pmksy.gov.in"
        })
    elif goal == "Get a Job":
        schemes.append({
            "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
            "benefit": "Free skill training, assessment, and certification with job placement assistance.",
            "eligibility": "Unemployed youth or school/college dropouts looking for industry-relevant skill training.",
            "apply_url": "https://www.pmkvyofficial.org"
        })
        schemes.append({
            "name": "MGNREGA (Rural Employment Guarantee)",
            "benefit": "Guaranteed 100 days of manual wage employment per financial year.",
            "eligibility": "Adult members of rural households willing to do unskilled manual work.",
            "apply_url": "https://nrega.nic.in"
        })
        schemes.append({
            "name": "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
            "benefit": "Free vocational training and assured placement in organized sector jobs.",
            "eligibility": "Rural youth aged between 15 and 35 years from poor families.",
            "apply_url": "http://ddugky.gov.in"
        })
    else:  # Housing
        schemes.append({
            "name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
            "benefit": "Interest subsidy up to 6.5% on home loans (CLSS) or direct grant up to ₹1.5 Lakhs.",
            "eligibility": "Families belonging to EWS/LIG/MIG categories who do not own a pucca house in India.",
            "apply_url": "https://pmaymis.gov.in"
        })
        schemes.append({
            "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
            "benefit": "Financial assistance of ₹1.2 Lakhs in plains and ₹1.3 Lakhs in hilly/difficult areas for house construction.",
            "eligibility": "Socio-economically backward households in rural areas without a permanent dwelling.",
            "apply_url": "https://pmayg.nic.in"
        })

    return schemes

def find_schemes(profile: dict, client_api_key: str = None) -> list:
    """Finds government schemes matching the user profile using Gemini or mock database fallback."""
    # Determine which API Key to use
    api_key = client_api_key or os.getenv("GEMINI_API_KEY")

    # If the key is not set or looks like a placeholder, use mock fallback immediately to save time and API errors
    if not api_key or api_key.startswith("AQ.") or "YOUR_KEY" in api_key:
        print("Using local mock scheme finder fallback (API key missing or invalid).")
        return get_mock_schemes(profile)

    try:
        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash as the stable production model name
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        You are an Indian government scheme advisor. 
        Analyze the following user profile and return a list of 3 to 4 matching schemes:
        - Age: {profile.get('age')}
        - State: {profile.get('state')}
        - Category: {profile.get('category')}
        - Annual Family Income: {profile.get('income')}
        - Goal/Need: {profile.get('goal')}

        Provide the output in JSON format only. The JSON must be a list of objects, where each object has exactly these fields:
        - "name": The name of the scheme (with official acronym if available)
        - "benefit": Clear description of the financial or material benefits they get
        - "eligibility": The specific criteria that makes them qualify based on their profile
        - "apply_url": The official website link to apply for this scheme

        Return ONLY the JSON array. Do not include markdown formatting or backticks.
        """

        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        raw_text = response.text.strip()
        # Strip code block symbols if model ignored the request to not include them
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`").strip()
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        data = json.loads(raw_text)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "schemes" in data:
            return data["schemes"]
        else:
            raise ValueError("Invalid format returned from Gemini")

    except Exception as e:
        print(f"Error querying Gemini API: {e}. Falling back to mock generator.")
        return get_mock_schemes(profile)