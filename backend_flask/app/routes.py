#routes.py
import os
import numpy as np
import cv2
import easyocr
import json
import openai
from flask import Blueprint, request, jsonify
from app.ocr import preprocess_image_for_ocr, extract_ingredients
from app.parse_utils import my_known_ingredients
from app.skincare import analyze_product_for_skin_type
from app.image_quality import is_blurry, is_too_dark, is_skewed
from app.translation_utils import detect_language, translate_to_english
from app.image_quality import is_blurry, is_too_dark, is_skewed, is_low_contrast
from app.ocr import visualize_ocr_results, visualize_extracted_ingredients_side_by_side, visualize_classified_ingredients
from app.skincare import classify_ingredients_by_safety
from app.recommend import recommend_products
from app.skincare import count_safety_levels, compute_product_score, classify_product


main = Blueprint("main", __name__)
from app.model import predict_skin_type

main = Blueprint("main", __name__)


from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

reader = easyocr.Reader(['en', 'fr', 'it', 'de', 'es'], gpu=False)

'''
def get_ingredient_descriptions(final_ingredient_list):
    """
    Generate descriptions and safety warnings for the ingredients
    using OpenAI GPT-4o.
    """
    try:
        # Prepare the prompt for OpenAI API
        final_ingredient_string = ", ".join(final_ingredient_list)
        prompt = f"""You are given a list of ingredients for a product. For each ingredient, do the following: 
        1. Provide a short description of the ingredient (what it is, its purpose or benefits).
        2. Check if the ingredient has any potential safety concerns or health risks. 
        If it does, provide a warning. If the ingredient is safe, mention that it is safe for general use.

        The output should be in JSON format with the following structure:
        - "ingredients": A list of descriptions for each ingredient.
        - "safety": A list of safety warnings for potentially harmful ingredients.
        - "summary": A brief summary of the product, including any important safety information.

        ### For example ingredient List:
        Sodium Lauryl Sulfate, Glycerin, Vitamin C, Parabens

        Response Format:
        {{
          "ingredients": [
            {{"Sodium Lauryl Sulfate": "A surfactant commonly used in cleansing products for its ability to create foam. It helps in removing dirt and oil from the skin."}},
            {{"Glycerin": "A humectant that draws moisture into the skin, helping to keep it hydrated. It is commonly used in skincare products."}},
            {{"Vitamin C": "An antioxidant that brightens the skin and helps to reduce the appearance of fine lines and wrinkles."}},
            {{"Parabens": "A group of preservatives used in cosmetics to prevent microbial growth and extend shelf life."}}
          ],
          "safety": [
            {{"Sodium Lauryl Sulfate": "May cause irritation for sensitive skin types. If irritation occurs, discontinue use."}},
            {{"Parabens": "Some studies suggest that parabens may disrupt hormone function, but more research is needed to understand the full risks."}}
          ],
          "summary": "This product contains ingredients that are generally safe for most users. However, individuals with sensitive skin should be cautious of Sodium Lauryl Sulfate, and those concerned about hormone disruption may want to avoid products with parabens."
        }}

        The ingredient list is: {final_ingredient_string}
        """
        
        # Call OpenAI's API to get the completion
        completion = openai.ChatCompletion.create(
            model="gpt-4o",  # Using GPT-4
            messages=[
                {"role": "system", "content": "You are a knowledgeable assistant that helps analyze and provide information about cosmetic and skincare ingredients. You will describe each ingredient, check for potential safety concerns, and summarize the overall product."},
                {"role": "user", "content": prompt}
            ]
        )

        # Parse and return the response from OpenAI
        return completion.choices[0].message['content']

    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        return None
'''

def get_ingredient_descriptions(final_ingredient_list):
    """
    Generate descriptions and safety warnings for the ingredients
    using OpenAI GPT-4o, and return parsed JSON.
    """
    try:
        final_ingredient_string = ", ".join(final_ingredient_list)

        prompt = f"""
You are given a list of skincare ingredients. For each ingredient:
1. Provide a short description.
2. Mention if it's safe or if it may cause irritation/risk.

Return a valid JSON **object**, not markdown. Use this format:
{{
  "ingredients": [
    {{
      "name": "Ingredient Name",
      "description": "Short description.",
      "safety": "Safety note."
    }},
    ...
  ],
  "summary": "Overall product safety summary."
}}

Ingredient list: {final_ingredient_string}
        """

        completion = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You're a cosmetic ingredient safety assistant. Only respond with valid JSON."},
                {"role": "user", "content": prompt.strip()}
            ]
        )

        response_content = completion.choices[0].message['content'].strip()

        print("[DEBUG] Raw OpenAI response:", response_content[:300])

        if response_content.startswith("```json"):
            response_content = response_content.strip("```json").strip("```").strip()

        return json.loads(response_content)

    except Exception as e:
        print(f"[ERROR] Failed to parse OpenAI response: {e}")
        return None



@main.route("/")
def home():
    return "Welcome to the Skincare Analysis API!"

@main.route("/classify_skin", methods=["POST"])
def classify_skin():
    """
    Expects an image file in form-data (key="file").
    Returns JSON with the predicted skin type.
    """
    if "file" not in request.files:
        return jsonify({"error": "No 'file' in request"}), 400

    file = request.files["file"]
    image_bytes = file.read()
    np_array = np.frombuffer(image_bytes, np.uint8)
    image_bgr = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    predicted_type = predict_skin_type(image_bgr)
    return jsonify({"skin_type": predicted_type})

@main.route("/analyze_product", methods=["POST"])
def analyze_product():
    """
    Expects:
      - 'label_file': product label image (form-data)
      - 'skin_type': (dry, normal, oily, etc.) in the form-data
    Returns JSON with extracted ingredients and recommended/avoid info.
    """
    if "label_file" not in request.files:
        return jsonify({"error": "No 'label_file' in request"}), 400
    if "skin_type" not in request.form:
        return jsonify({"error": "No 'skin_type' in form data"}), 400

    skin_type = request.form["skin_type"].lower().strip()

    file = request.files["label_file"]
    image_bytes = file.read()
    np_array = np.frombuffer(image_bytes, np.uint8)
    image_bgr = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

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
        priority_map = {
            "blurry": 1,
            "dark": 2,
            "low_contrast": 3,
            "skewed": 4
        }

        error_messages = {
            "blurry": "The image is too blurry. Please retake with better focus.",
            "dark": "The image is too dark. Please retake it in better lighting.",
            "low_contrast": "The image has low contrast. Please retake it with clearer lighting and better background separation.",
            "skewed": "The image is skewed. Please take the photo straight-on."
        }

        top_issue = sorted(issues, key=lambda x: priority_map[x])[0]
        top_message = error_messages[top_issue]

        print("Returning 400 with:", json.dumps({
            "error": "Image quality issue detected.",
            "details": [top_message]
        }, indent=2))

        return jsonify({
            "error": "Image quality issue detected.",
            "details": [top_message]
        }), 400

    processed_image = preprocess_image_for_ocr(image_bgr)
    processed_rgb = cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB)
    ocr_results = reader.readtext(processed_rgb, detail=1)

    #visualize_ocr_results(processed_rgb, ocr_results, save_path="annotated_output.jpg")
    visualize_ocr_results(image_bgr, ocr_results, save_path="annotated_output.jpg")


    filtered_texts = [res[1] for res in ocr_results if res[2] > 0.5]  # Filter by confidence
    all_text = " ".join(filtered_texts)
    print(f"[INFO] Filtered OCR results (confidence > 0.5): {filtered_texts}")

    if len(all_text.strip()) < 20:
        return jsonify({"error": "Text could not be clearly extracted. Please retake the image with better focus."}), 400


    detected_lang = detect_language(all_text)
    print(f"[INFO] Detected language: {detected_lang}")

    original_text = all_text  

    if detected_lang != "en":
        print("[INFO] Translating text to English using GPT-4o...")
        all_text = translate_to_english(all_text)
        print("[INFO] Translation complete.")

    final_ingredient_list = extract_ingredients(all_text, known_ingredients=my_known_ingredients)

    # Save clean visual with ingredients listed on the side
    #visualize_extracted_ingredients_side_by_side(image_bgr, final_ingredient_list)

    # Step 1: Extract & classify ingredients
    ingredient_safety_map = classify_ingredients_by_safety(skin_type, final_ingredient_list)

    # Step 2: Annotate image with safety color-coded boxes
    visualize_classified_ingredients(
    image_bgr,
    ocr_results,
    ingredient_safety_map,
    save_path="classified_output.jpg",
    summary_path="classified_summary.json"
)



    # Generate ingredient descriptions using OpenAI GPT
    ingredient_info = get_ingredient_descriptions(final_ingredient_list)

    safety_counts = count_safety_levels(ingredient_info)
    product_score = compute_product_score(safety_counts)
    product_safety = classify_product(product_score)


    filtered_ingredients = []
    for ing in ingredient_info["ingredients"]:
        desc = ing.get("description", "").lower()
        if "misspelling" not in desc and "confusion" not in desc:
            filtered_ingredients.append(ing)

    ingredient_info["ingredients"] = filtered_ingredients

    if ingredient_info is None:
        return jsonify({"error": "Failed to generate ingredient descriptions"}), 500



    # Analyze for user's skin type
    analysis_summary = analyze_product_for_skin_type(skin_type, final_ingredient_list)

    recommendations = recommend_products(final_ingredient_list)


    response_payload = {
        "parsed_ingredients": final_ingredient_list,
        "ingredient_info": ingredient_info,
        "analysis_summary": analysis_summary,
        "detected_language": detected_lang,
        "ingredient_image_url": "clean_ingredients_output.jpg",
        "classified_image_url": "classified_output.jpg",
        "recommendations": recommendations,
        "safety_counts": safety_counts,
        "product_score": product_score,
        "product_safety": product_safety
    }

    print("[DEBUG] Final response JSON:", json.dumps(response_payload, indent=2))

    return jsonify(response_payload)



