# app/skincare.py

INGREDIENT_GUIDE = {
    "dry": {
        "recommended": [
            "hyaluronic acid", "glycerin", "ceramides", "squalane", "panthenol", "urea",
            "sodium hyaluronate", "aloe vera", "lanolin", "tocopherol", "jojoba oil",
            "ceramide np", "ceramide ap", "ceramide eop", "petrolatum", "shea butter",
            "beta-glucan", "cholesterol", "dimethicone", "marula oil", "rosehip oil",
            "niacinamide", "trehalose", "allantoin", "centella asiatica", "sunflower oil",
            "cetearyl alcohol", "phytosphingosine", "argan oil", "moringa oil", "rice bran oil",
            "avocado oil", "mango butter", "soybean oil", "macadamia oil", "cucumber extract",
            "manuka honey", "hemp seed oil", "bisabolol", "sodium pca", "sorbitol"
        ],
        "avoid": [
            "denatured alcohol", "ethanol", "salicylic acid", "benzoyl peroxide", "fragrance",
            "menthol", "retinol (non-buffered)", "phenoxyethanol", "sulfates",
            "lactic acid (high concentration)", "clay", "tea tree oil", "kaolin", "witch hazel",
            "peppermint oil", "lemon oil", "eucalyptus", "citric acid", "alumina", "camphor"
        ]
    },

    "oily": {
        "recommended": [
            "niacinamide", "salicylic acid", "benzoyl peroxide", "clay", "zinc pca", "green tea",
            "retinol", "tea tree oil", "azelaic acid", "sulfur", "charcoal", "glycolic acid",
            "witch hazel", "camphor", "tartaric acid", "l-carnitine", "willow bark extract",
            "matricaria chamomilla", "algae extract", "resorcinol", "kaolin", "vitamin c",
            "allantoin", "gluconolactone", "gluconic acid", "eucalyptus globulus leaf extract",
            "n-acetyl glucosamine", "biotin", "grapeseed extract", "sage extract", "thymol",
            "caffeine", "licorice root", "propolis", "bakuchiol", "cinnamomum bark extract"
        ],
        "avoid": [
            "coconut oil", "mineral oil", "lanolin", "petrolatum", "silicones", "isopropyl myristate",
            "wheat germ oil", "oleic acid", "butyl stearate", "lauric acid", "stearic acid",
            "cetyl alcohol", "propylene glycol", "lanolate", "castor oil", "sorbitan oleate",
            "dimethicone (heavy)", "mango butter", "olive oil", "sheabutter (raw form)"
        ]
    },

    "normal": {
        "recommended": [
            "niacinamide", "hyaluronic acid", "glycerin", "vitamin c", "panthenol", "aloe vera",
            "tocopherol", "ceramides", "centella asiatica", "beta-glucan", "sodium pca",
            "squalane", "green tea", "caffeine", "rose water", "bisabolol", "allantoin",
            "lactic acid (low concentration)", "azelaic acid", "ferulic acid", "grapeseed oil",
            "bakuchiol", "glycolic acid", "n-acetyl glucosamine", "peptides", "bifida ferment lysate",
            "galactomyces ferment filtrate", "snail mucin", "resveratrol", "sodium lactate",
            "chamomile extract", "malic acid", "gluconolactone", "arginine", "copper peptides",
            "zinc gluconate", "mugwort extract"
        ],
        "avoid": [
            "strong fragrances", "harsh exfoliants", "sulfates", "high-concentration acids",
            "alcohol denat", "formaldehyde releasers", "bismuth oxychloride", "coal tar dyes",
            "lanolin (for some)", "polyethylene beads", "essential oils (in excess)",
            "dyes", "methylchloroisothiazolinone", "chlorphenesin", "ammonium lauryl sulfate"
        ]
    }
}




def analyze_product_for_skin_type(skin_type, ingredient_list):
    if skin_type not in INGREDIENT_GUIDE:
        return f"No knowledge base for skin type {skin_type}"

    recommended_list = INGREDIENT_GUIDE[skin_type]["recommended"]
    avoid_list = INGREDIENT_GUIDE[skin_type]["avoid"]

    present_recommended = [ing for ing in ingredient_list if ing in recommended_list]
    present_avoid = [ing for ing in ingredient_list if ing in avoid_list]

    summary = f"For {skin_type.upper()} skin:\n"
    if present_recommended:
        summary += f" - Good ingredients: {', '.join(present_recommended)}.\n"
    if present_avoid:
        summary += f" - Potentially problematic: {', '.join(present_avoid)}.\n"
    if not present_recommended and not present_avoid:
        summary += " - No major recommended or problematic ingredients detected.\n"

    return summary


def classify_ingredients_by_safety(skin_type, ingredient_list):
    guide = INGREDIENT_GUIDE.get(skin_type, {})
    safe = [x.lower() for x in guide.get("recommended", [])]
    harmful = [x.lower() for x in guide.get("avoid", [])]

    safety_map = {}

    for ingredient in ingredient_list:
        ing_lower = ingredient.lower()
        if ing_lower in safe:
            safety_map[ingredient] = "safe"
        elif ing_lower in harmful:
            safety_map[ingredient] = "harmful"
        else:
            safety_map[ingredient] = "neutral"

    return safety_map

def count_safety_levels(ingredient_info):
    counts = {"safe": 0, "harmful": 0, "neutral": 0, "unknown": 0}
    for item in ingredient_info.get("ingredients", []):
        safety_desc = item.get("safety", "").lower()

        if "harmful" in safety_desc or "avoid" in safety_desc or "risk" in safety_desc or "irritation" in safety_desc:
            counts["harmful"] += 1
        elif "safe" in safety_desc and "irritation" not in safety_desc:
            counts["safe"] += 1
        elif "mild" in safety_desc or "sensitive" in safety_desc or "patch test" in safety_desc:
            counts["neutral"] += 1
        else:
            counts["unknown"] += 1

    return counts


def compute_product_score(safety_counts):
    return (
        safety_counts.get("safe", 0) * 1 +
        safety_counts.get("neutral", 0) * 0 +
        safety_counts.get("harmful", 0) * -1
    )

def classify_product(score):
    if score >= 3:
        return "SAFE"
    elif score <= -2:
        return "HARMFUL"
    elif -2 < score < 3:
        return "NEUTRAL"
    else:
        return "UNKNOWN" 







