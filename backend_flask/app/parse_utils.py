# app/parse_utils.py
import re
from difflib import get_close_matches
import json
import os


def load_known_ingredients():
    try:
        data_folder = os.path.join(os.path.dirname(__file__), "data")
        json_file_path = os.path.join(data_folder, "known_ingredients.json")
        
        with open(json_file_path, "r") as f:
            ingredients = json.load(f)
        return ingredients
    except FileNotFoundError:
        print("Known ingredients file not found.")
        return []

my_known_ingredients = load_known_ingredients()

def fuzzy_correct(word, known_words, cutoff=0.8):
    matches = get_close_matches(word, known_words, n=1, cutoff=cutoff)
    return matches[0] if matches else word

def find_keyword_fuzzy(full_text, keyword="ingredients", cutoff=0.8):
    lower = full_text.lower()
    tokens = lower.split()
    best_match = get_close_matches(keyword, tokens, n=1, cutoff=cutoff)
    return lower.find(best_match[0]) if best_match else -1


def parse_ingredients_section_v2(ingredient_section, known_ingredients=None, debug=False):
    """
    - Insert a comma after each ')' if there's no comma right after it
    - Split on commas
    - Remove parentheses content
    - Merge hyphen-split words
    - Remove extraneous punctuation
    - Fuzzy-match to known ingredients
    """
    if known_ingredients is None:
        known_ingredients = []

    text_with_comma = re.sub(r"\)(?![,.\)])", "),", ingredient_section)
    raw_tokens = [x.strip() for x in text_with_comma.split(",") if x.strip()]

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
        token_no_paren = re.sub(r"\(.*?\)", "", token)
        token_clean = re.sub(r"[^a-zA-Z0-9\s\-/]", "", token_no_paren).strip().lower()

        if token_clean:
            if known_ingredients:
                best = get_close_matches(token_clean, known_ingredients, n=1, cutoff=0.75)
                if best:
                    token_clean = best[0]

            if debug:
                print(f"OCR token => {token} => matched => {token_clean}")

            final_tokens.append(token_clean)

    return final_tokens

def extract_ingredients_v2(all_text, known_ingredients=None, debug=False):
    """
    Fuzzy search for 'ingredients', then parse until next period.
    """
    if known_ingredients is None:
        known_ingredients = []

    idx = find_keyword_fuzzy(all_text, keyword="ingredients", cutoff=0.7)
    if idx == -1:
        if debug:
            print("No 'ingredients' found in text.")
        return []

    start_idx = idx + len("ingredients")
    if start_idx < len(all_text) and all_text[start_idx] in [":", " ", ";"]:
        start_idx += 1

    substring = all_text[start_idx:]
    period_pos = substring.find(".")
    if period_pos != -1:
        ingredient_section = substring[:period_pos]
    else:
        ingredient_section = substring

    parsed_ingredients = parse_ingredients_section_v2(
        ingredient_section,
        known_ingredients=known_ingredients,
        debug=debug
    )
    return parsed_ingredients
