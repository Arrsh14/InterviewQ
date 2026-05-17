import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="/Users/arrshtripathi/Desktop/interviewiq/backend/.env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)