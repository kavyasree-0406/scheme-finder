import sys
import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from main import find_schemes
except ImportError:
    from backend.main import find_schemes

app = FastAPI(title="Government Scheme Finder API")

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Profile(BaseModel):
    age: int
    state: str
    category: str
    income: str
    goal: str

@app.post("/find-schemes")
async def find_schemes_endpoint(profile: Profile, x_gemini_key: Optional[str] = Header(None)):
    try:
        profile_dict = profile.model_dump()
        result = find_schemes(profile_dict, client_api_key=x_gemini_key)
        return {"schemes": result}
    except Exception as e:
        print(f"Error finding schemes in endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
