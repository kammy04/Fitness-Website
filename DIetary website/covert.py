import pandas as pd
import json

# Load CSV file
df = pd.read_csv("foods.csv")

# Clean & fill missing values — match capitalized columns
for col in ["Calories", "Protein", "Carbs", "Fat"]:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# Standard serving size conversions (in grams)
serving_conversions = {
    "100g": 100,
    "1 tbsp": 15,
    "1 tsp": 5,
    "1 cup": 240,
    "1 oz": 28.35,
    "1 lb": 453.6,
    "1 egg (large)": 50,
    "1 banana (medium)": 118,
    "1 apple (medium)": 182,
    "1 slice of bread": 25
}

# Convert to food dicts
foods = []
for _, row in df.iterrows():
    food = {
        "name": row["Name"],
        "keyword": row["Keyword"],
        "calories": float(row["Calories"]),
        "protein": float(row["Protein"]),
        "carbs": float(row["Carbs"]),
        "fat": float(row["Fat"]),
        "servings": serving_conversions.copy()
    }
    foods.append(food)

# Output to JS format
js_code = "const foods = " + json.dumps(foods, indent=2) + ";"

with open("foods.js", "w") as f:
    f.write(js_code)

print("✅ foods.js created with", len(foods), "foods.")
