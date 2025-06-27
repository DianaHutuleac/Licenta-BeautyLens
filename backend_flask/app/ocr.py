# ocr.py
import cv2
import easyocr
import numpy as np
import re
from difflib import get_close_matches
import difflib
import json

reader = easyocr.Reader(['en', 'fr', 'it', 'de', 'es'], gpu=False) 
'''
def preprocess_image_for_ocr(input_path, debug=False):
    # 1. Read the image in color
    img_color = cv2.imread(input_path)
    if img_color is None:
        raise ValueError(f"Could not open {input_path}. Check file path.")

    if debug:
        print("Original image shape:", img_color.shape)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)

    # 3. Apply Otsu threshold
    _, otsu_result = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 4. Morphological Closing (Dilation followed by Erosion)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    closed = cv2.morphologyEx(otsu_result, cv2.MORPH_CLOSE, kernel)

    if debug:
        print("Processed image after Otsu and Morph Closing:")
        cv2.imshow("Processed Image", closed)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return closed
'''
'''
def preprocess_image_for_ocr(image_bgr, debug=False):
    """
    Preprocess the image for OCR.
    Accepts a NumPy array as input, no need for cv2.imread.
    """
    if image_bgr is None:
        raise ValueError("Input image is None. Check the image path or data.")

    if debug:
        print("Original image shape:", image_bgr.shape)

    # Step 1: Convert to grayscale
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    # Step 2: Apply Otsu threshold
    _, otsu_result = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Step 3: Morphological Closing (Dilation followed by Erosion)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    closed = cv2.morphologyEx(otsu_result, cv2.MORPH_CLOSE, kernel)

    if debug:
        print("Processed image after Otsu and Morph Closing:")
        cv2.imshow("Processed Image", closed)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return closed
'''

def preprocess_image_for_ocr(image_bgr, debug=False, save_path="preprocessed_image.jpg"):
    """
    Preprocess the image for OCR using adaptive thresholding.
    Accepts a NumPy array as input.
    """
    if image_bgr is None:
        raise ValueError("Input image is None. Check the image path or data.")

    if debug:
        print("Original image shape:", image_bgr.shape)

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    adaptive = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=8
    )

    if np.mean(adaptive) < 30 or np.mean(adaptive) > 225:
        print("[INFO] Fallback to Otsu thresholding")
        _, adaptive = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    closed = cv2.morphologyEx(adaptive, cv2.MORPH_CLOSE, kernel)

    if debug:
        print("Processed image after adaptive thresholding and Morph Closing:")
        cv2.imshow("Processed Image", closed)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    cv2.imwrite(save_path, closed)
    print(f"[INFO] Preprocessed image saved to: {save_path}")

    return closed


def extract_ingredients(all_text, known_ingredients=None):
    """
    Extracts ingredients from OCR text by looking for the 'ingredients' keyword and then parsing.
    """
    if known_ingredients is None:
        known_ingredients = []

    idx = find_keyword_fuzzy(all_text, keyword="ingredients", cutoff=0.7)
    if idx == -1:
        print("No fuzzy match for 'Ingredients' found in the recognized text.")
        return []

    start_idx = idx + len("ingredients")
    if start_idx < len(all_text) and all_text[start_idx] in [":", " ", ";"]:
        start_idx += 1

    substring_from_ingredients = all_text[start_idx:]
    period_pos = substring_from_ingredients.find(".")
    if period_pos != -1:
        ingredient_section = substring_from_ingredients[:period_pos]
    else:
        ingredient_section = substring_from_ingredients

    parsed_ingredients = parse_ingredients_section(ingredient_section, known_ingredients=known_ingredients)
    return parsed_ingredients

def find_keyword_fuzzy(full_text, keyword="ingredients", cutoff=0.8):
    lower = full_text.lower()
    tokens = lower.split()
    best_match = get_close_matches(keyword, tokens, n=1, cutoff=cutoff)
    return lower.find(best_match[0]) if best_match else -1

def parse_ingredients_section(ingredient_section, known_ingredients=None):
    if known_ingredients is None:
        known_ingredients = []

    unified_delimiters_text = ingredient_section.replace(";", ",")

    no_parentheses_text = re.sub(r"\(.*?\)", "", unified_delimiters_text)

    raw_tokens = [x.strip() for x in no_parentheses_text.split(",") if x.strip()]

    merged_tokens = []
    skip_next = False
    for i in range(len(raw_tokens)):
        if skip_next:
            skip_next = False
            continue
        token = raw_tokens[i]
        if token.endswith("-") and i < len(raw_tokens) - 1:
            next_token = raw_tokens[i+1]
            merged = token[:-1] + next_token
            merged_tokens.append(merged.strip())
            skip_next = True
        else:
            merged_tokens.append(token)

    final_tokens = []
    for token in merged_tokens:
        token_clean = re.sub(r"[^a-zA-Z0-9\s\-]", "", token).strip().lower()
        if token_clean:
            token_clean = fuzzy_correct(token_clean, known_ingredients, cutoff=0.75)
            final_tokens.append(token_clean)

    return final_tokens

def fuzzy_correct(word, known_words, cutoff=0.8):
    matches = get_close_matches(word, known_words, n=1, cutoff=cutoff)
    return matches[0] if matches else word


def visualize_ocr_results(image, ocr_results, save_path="annotated_output.jpg", min_confidence=0.5):
    """
    Draw bounding boxes and OCR-detected text on the original image.
    Filters out low-confidence results.
    """
    annotated = image.copy()

    for (bbox, text, conf) in ocr_results:
        if conf < min_confidence:
            continue

        pts = np.array(bbox, dtype=np.int32)
        cv2.polylines(annotated, [pts], isClosed=True, color=(0, 255, 0), thickness=2)

        text_position = (int(pts[0][0]), int(pts[0][1]) - 10)
        cv2.putText(
            annotated, text.strip(), text_position,
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2
        )

    cv2.imwrite(save_path, annotated)
    print(f"[INFO] OCR annotated image saved to: {save_path}")
    return save_path


def visualize_extracted_ingredients_side_by_side(original_img, ingredients, save_path="clean_ingredients_output.jpg"):
    """
    Creates a side-by-side image:
    - Left: Original image
    - Right: White space with clean ingredient boxes
    """
    height, width, _ = original_img.shape
    panel_width = 600
    spacing = 50

    panel = np.ones((height, panel_width, 3), dtype=np.uint8) * 255

    y = spacing
    for ingredient in ingredients:
        cv2.rectangle(panel, (30, y), (panel_width - 30, y + 40), (0, 200, 0), 2)
        cv2.putText(panel, ingredient.upper(), (40, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 100, 0), 2)
        y += 60

    combined = np.hstack((original_img, panel))

    cv2.imwrite(save_path, combined)
    print(f"[INFO] Side-by-side ingredient image saved to: {save_path}")
    return save_path

def visualize_classified_ingredients(
    image,
    ocr_results,
    ingredient_safety,
    save_path="classified_output.jpg",
    summary_path="classified_summary.json",
    min_confidence=0.5,
    fuzzy_cutoff=0.75
):
    """
    Draw bounding boxes for OCR-detected ingredients with color-coded safety labels.
    Supports multiple matches per line, fuzzy ingredient matching, sorted labels,
    and saves a summary JSON with matched ingredients.
    """
    annotated = image.copy()

    color_map = {
        "safe": (0, 255, 0),        
        "harmful": (0, 0, 255),     
        "neutral": (0, 255, 255),   
        "unknown": (180, 180, 180)  
    }

    summary_matches = []

    known_ingredients = list(ingredient_safety.keys()) 

    for (bbox, text, conf) in ocr_results:
        if conf < min_confidence:
            continue

        text_clean = re.sub(r"[^a-zA-Z0-9\s\-]", "", text).lower()
        words = text_clean.split()

        matches = []

        for word in words:
            for ingr, safety in ingredient_safety.items():
                if word == ingr.lower():
                    matches.append((ingr, safety))
                    break
            else:
                close = difflib.get_close_matches(word, known_ingredients, n=1, cutoff=fuzzy_cutoff)
                if close:
                    matched_ingr = close[0]
                    matches.append((matched_ingr, ingredient_safety[matched_ingr]))

        if matches:
            priority = {"harmful": 0, "neutral": 1, "safe": 2}
            matches.sort(key=lambda x: priority.get(x[1], 3))

            label_text = ", ".join(f"{ingr} ({cls})" for ingr, cls in matches)

            top_class = matches[0][1]
            box_color = color_map.get(top_class, (255, 255, 255))

            pts = np.array(bbox, dtype=np.int32)
            cv2.polylines(annotated, [pts], isClosed=True, color=box_color, thickness=2)
            cv2.putText(
                annotated, label_text,
                (int(pts[0][0]), int(pts[0][1]) - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, box_color, 2
            )

            for ingr, cls in matches:
                summary_matches.append({"ingredient": ingr, "classification": cls})

    cv2.imwrite(save_path, annotated)
    print(f"[INFO] Classified ingredient image saved to: {save_path}")

    with open(summary_path, "w") as f:
        json.dump(summary_matches, f, indent=2)
    print(f"[INFO] Summary saved to: {summary_path}")

    return save_path








