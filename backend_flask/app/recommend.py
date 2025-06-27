import pandas as pd
import json
import re
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from collections import OrderedDict

df = pd.read_csv("app/data/skincare_products.csv")

with open("app/data/known_ingredients.json") as f:
    raw_ingredients = json.load(f)
    known_ingredients = list(OrderedDict.fromkeys([i.lower() for i in raw_ingredients]))

def preprocess_ingredients(text):
    if not isinstance(text, str): return ""
    ingredients = re.split(r"[;,.]", text)
    cleaned = [i.strip().lower() for i in ingredients if i.strip()]
    return " ".join(cleaned)

df["cleaned_ingredients"] = df["ingredients"].apply(preprocess_ingredients)

vectorizer = CountVectorizer(vocabulary=[i.lower() for i in known_ingredients], binary=True)
ingredient_matrix = vectorizer.fit_transform(df["cleaned_ingredients"])

def simplify_name(name):
    return re.sub(r"\b\d+\s?(ml|g)\b", "", name.lower()).strip()

def recommend_products(input_ingredients, input_product_type=None, top_n=5):
    input_cleaned = " ".join([i.lower() for i in input_ingredients if i])
    input_vector = vectorizer.transform([input_cleaned])
    sims = cosine_similarity(input_vector, ingredient_matrix).flatten()

    df_copy = df.copy()
    df_copy["similarity"] = sims

    if input_product_type:
        df_copy = df_copy[df_copy["product_type"].str.lower() == input_product_type.lower()]

    if df_copy.empty:
        return []  

    top_recs = df_copy.sort_values(by="similarity", ascending=False)

    seen = set()
    deduped = []

    for _, row in top_recs.iterrows():
        simplified = simplify_name(row["product_name"])
        if simplified not in seen:
            seen.add(simplified)
            deduped.append({
                "product_name": row["product_name"],
                "product_url": row["product_url"],
                "product_type": row["product_type"],
                "price": row["price"]
            })
        if len(deduped) == top_n:
            break

    return deduped
