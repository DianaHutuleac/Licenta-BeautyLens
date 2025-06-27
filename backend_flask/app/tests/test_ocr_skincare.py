#test_ocr_skincare.py
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import cv2
import numpy as np
from app.ocr import preprocess_image_for_ocr, extract_ingredients  
from app.parse_utils import my_known_ingredients  
from app.skincare import analyze_product_for_skin_type 
import easyocr
import openai 
from app.image_quality import is_blurry, is_too_dark, is_skewed
from app.translation_utils import detect_language, translate_to_english
from app.image_quality import is_blurry, is_too_dark, is_skewed, is_low_contrast

from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY") 


def get_ingredient_descriptions(final_ingredient_list):
    """
    Generate descriptions and safety warnings for the ingredients
    using OpenAI GPT-4.
    """
    try:
        final_ingredient_string = ", ".join(final_ingredient_list)
        prompt = f"""You are given a list of ingredients for a product. For each ingredient, do the following: 
        1. Provide a short description of the ingredient (what it is, its purpose or benefits).
        2. Check if the ingredient has any potential safety concerns or health risks. 
        If it does, provide a warning. If the ingredient is safe, mention that it is safe for general use.

        The output should be in JSON format with the following structure:
        - "ingredients": A list of descriptions for each ingredient.
        - "safety": A list of safety warnings for potentially harmful ingredients.
        - "summary": A brief summary of the product, including any important safety information.

        The ingredient list is: {final_ingredient_string}
        """
        
        completion = openai.ChatCompletion.create(
            model="gpt-4o",  
            messages=[
                {"role": "system", "content": "You are a knowledgeable assistant that helps analyze and provide information about cosmetic and skincare ingredients. You will describe each ingredient, check for potential safety concerns, and summarize the overall product."},
                {"role": "user", "content": prompt}
            ]
        )

        print("OpenAI Response:", completion.choices[0].message['content'])

        return completion.choices[0].message['content']

    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        return None

def save_side_by_side_comparison(original_img, processed_img, save_path="comparison.jpg"):
    # Convert grayscale to BGR so both images have 3 channels
    if len(processed_img.shape) == 2:
        processed_img = cv2.cvtColor(processed_img, cv2.COLOR_GRAY2BGR)

    if original_img.shape != processed_img.shape:
        processed_img = cv2.resize(processed_img, (original_img.shape[1], original_img.shape[0]))

    comparison = np.hstack((original_img, processed_img))
    cv2.imwrite(save_path, comparison)
    print(f"[INFO] Side-by-side comparison saved to: {save_path}")



def test_ocr_and_skin_analysis(image_path, skin_type):
    print("Starting the OCR and skin analysis...")

    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        print(f"Could not open image: {image_path}")
        return
    else:
        print(f"Image loaded successfully, shape: {image_bgr.shape}")

    cv2.imwrite("original_image.jpg", image_bgr)
    print("[INFO] Original image saved to: original_image.jpg")


    print("Checking image quality...")
    issues = []

    if image_bgr.shape[0] < 500 or image_bgr.shape[1] < 500:
        print("[INFO] Image too small. Upscaling for better OCR...")
        image_bgr = cv2.resize(image_bgr, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    if is_too_dark(image_bgr):
        issues.append("dark")

    if is_blurry(image_bgr):
        issues.append("blurry")

    if is_skewed(image_bgr):
        issues.append("skewed")

    if is_low_contrast(image_bgr):
        issues.append("low_contrast")


    if issues:
        print("⚠️ Image quality issues detected:")
        if "dark" in issues:
            print("Warning: The image is too dark. Please retake it in better lighting.")
        if "blurry" in issues:
            print("Warning: The image is too blurry. Please retake with better focus.")
        if "skewed" in issues:
            print("Warning: The image is skewed. Please take the photo straight-on.")
        if "low_contrast" in issues:
            print("Warning: The image has low contrast. Please retake it in better lighting with clearer text/background separation.")
        return

    
    processed_image = preprocess_image_for_ocr(image_bgr, save_path="preprocessed_image.jpg")  
    save_side_by_side_comparison(image_bgr, processed_image)

    processed_rgb = cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB)

    print("Running OCR...")
    reader = easyocr.Reader(['en', 'fr', 'it', 'de', 'es'], gpu=False)
    ocr_results = reader.readtext(processed_rgb, detail=1)

    if ocr_results:
        recognized_texts = [res[1] for res in ocr_results]
        all_text = " ".join(recognized_texts)
        if len(all_text.strip()) < 20:
            print("Warning: OCR text too short. Please retake the image with better focus.")
            return

        language = detect_language(all_text)
        print(f"[INFO] Detected language: {language}")

        if language != "en":
            print("[INFO] Translating text to English using GPT-4o...")
            all_text = translate_to_english(all_text)
            print("[INFO] Translation complete.")
        print("Extracted Text:", all_text)
    else:
        print("No text detected by OCR.")
        return

    print("Extracting ingredients...")
    final_ingredient_list = extract_ingredients(all_text, known_ingredients=my_known_ingredients)
    print("Extracted Ingredients:", final_ingredient_list)

    print("Generating ingredient descriptions...")
    ingredient_info = get_ingredient_descriptions(final_ingredient_list)
    print("Ingredient Descriptions:", ingredient_info)  

    print("Analyzing ingredients for skin type...")
    analysis_summary = analyze_product_for_skin_type(skin_type, final_ingredient_list)
    print("Skin Type Analysis:", analysis_summary)

if __name__ == "__main__":
    print("Starting the test script...")  
    
    image_path = "/Users/diana/my_app/backend_flask/app/tests/ingredients.jpg" 
    skin_type = "dry"  
    test_ocr_and_skin_analysis(image_path, skin_type)
