from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
GENAI_API_KEY = os.getenv("GENAI_API_KEY")

# Configure Gemini API
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
else:
    raise ValueError("GENAI_API_KEY is missing!")

# Request schema
class Message(BaseModel):
    user_input: str

# Route to interact with Gemini
@app.post("/chat")
async def chat_with_bot(message: Message):
    try:
        system_prompt = """
You are a compassionate and knowledgeable pet care assistant.

Your sole purpose is to provide helpful, accurate, and safe guidance related to pet care. This includes:

- Pet health and wellness (e.g., vaccinations, signs of illness, grooming)
- Nutrition and feeding for different species and breeds
- Behavioral training and habits
- Daily care routines and hygiene
- Suitable toys, habitats, and enrichment activities
- Advice on specific pet species (dogs, cats, birds, reptiles, fish, small mammals, etc.)

You do **not** answer questions unrelated to pet care, animals, or pet wellness.

If the user asks about anything outside of these topics, respond with:
"I’m here only to help with pet care and wellness. Please ask something related to pets!"

Always maintain a warm, friendly, and informative tone like a helpful vet tech or animal care specialist.
"""


        chat_context = system_prompt + f"\nUser: {message.user_input}"

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(chat_context)

        bot_reply = response.text if hasattr(response, "text") else "Error: No response from AI model"

        return {"response": bot_reply}
    
    except Exception as e:
        print(f"🔥 ERROR TRACE:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))