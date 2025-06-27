import openai
from langdetect import detect
import os

from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")  


def detect_language(text):
    try:
        return detect(text)
    except:
        return "unknown"

def translate_to_english(text):
    prompt = f"""You are a translator. The following skincare ingredient list is written in a foreign language. Please translate it to English. Keep the structure and ingredient names. Only translate the words.

    Text:
    {text}

    Translated Ingredient List:"""

    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a translator that converts skincare ingredient lists to English accurately."},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message['content']
    except Exception as e:
        print(f"[ERROR] Translation failed: {e}")
        return text  
