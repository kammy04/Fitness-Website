import requests
import pandas as pd
import os
import time

# Read the key from the environment so it never gets committed.
# Set it in your terminal before running:  export USDA_API_KEY="your-key-here"
API_KEY = os.environ.get("USDA_API_KEY")
if not API_KEY:
    raise SystemExit("Set USDA_API_KEY first: export USDA_API_KEY=\"your-key-here\"")
search_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
detail_url_template = "https://api.nal.usda.gov/fdc/v1/food/{}?api_key={}"
csv_file = "foods.csv"

# Clear the CSV file before starting
open(csv_file, 'w').close()

# Updated food keyword list (no chicken for now)
food_keywords = [
    "chicken", "beef", "salmon", "tofu", "egg", "milk", "cheese", "yogurt",
    "banana", "apple", "berries", "potato", "rice", "bread", "pasta", 
    "beans", "lentils", "broccoli", "spinach", "carrot", "fish",
    "turkey", "pork", "shrimp", "tuna", "cod", "mackerel", "sardines", "duck", "lamb", "venison",
    "tempeh", "seitan", "edamame", "protein powder", "black beans", "chickpeas", "kidney beans", "cottage cheese",
    "oats", "quinoa", "bulgur", "couscous", "corn", "tortillas", "crackers", "cereal", "granola",
    "sweet potato", "yam", "barley", "bagel", "pancake", "muffin", "naan", "pita",
    "mango", "pineapple", "grapes", "watermelon", "cantaloupe", "oranges", "pears", "peaches",
    "plums", "dates", "raisins", "figs", "cherries", "kiwi", "lemon", "lime",
    "zucchini", "cucumber", "asparagus", "cauliflower", "mushrooms", "green beans", "kale",
    "arugula", "romaine", "lettuce", "cabbage", "eggplant", "bell peppers", "onions", "garlic",
    "peas", "avocado", "olive oil", "peanut butter", "almond butter", "chia seeds", "flax seeds",
    "walnuts", "almonds", "cashews", "sunflower seeds", "sesame seeds",
    "almond milk", "soy milk", "oat milk", "coconut milk", "cream cheese", "butter", "ghee", "greek yogurt",
    "chocolate", "ice cream", "cookies", "soda", "honey", "jam", "ketchup", "mayonnaise",
    "hot sauce", "salad dressing", "protein bar", "energy drink"
]

# Append results in batches
def append_to_csv(data):
    df = pd.DataFrame(data)
    if not df.empty:
        if os.path.exists(csv_file) and os.path.getsize(csv_file) > 0:
            df.to_csv(csv_file, mode='a', header=False, index=False)
        else:
            df.to_csv(csv_file, index=False)

# Main loop
for keyword in food_keywords:
    print(f"\n--- 🔍 Searching: {keyword} ---")
    page = 1
    batch = []

    while True:
        params = {
            "api_key": API_KEY,
            "query": keyword,
            #"dataType": ["Survey (FNDDS)", "Branded", "Foundation", "SR Legacy"],
            "dataType": ["Survey (FNDDS)"],
            "pageSize": 25,
            "pageNumber": page
        }

        try:
            response = requests.get(search_url, params=params)
            data = response.json()
            print(f"→ Page {page} for {keyword}: {len(data.get('foods', []))} foods found")
        except Exception as e:
            print(f"⚠️ Failed to fetch page {page} for {keyword}: {e}")
            break

        foods_list = data.get("foods", [])
        if not foods_list:
            break

        for item in foods_list:
            fdc_id = item["fdcId"]
            try:
                detail_url = detail_url_template.format(fdc_id, API_KEY)
                r = requests.get(detail_url)
                food = r.json()

                if not food.get("foodNutrients"):
                    continue

                nutrients = {
                    n.get("nutrient", {}).get("name", "Unknown"): n.get("amount")
                    for n in food.get("foodNutrients", [])
                }

                batch.append({
                    "Name": food.get("description", "Unknown"),
                    "Keyword": keyword,
                    "Brand": food.get("brandOwner", ""),
                    "Ingredients": food.get("ingredients", ""),
                    "Calories": nutrients.get("Energy") or "N/A",
                    "Protein": nutrients.get("Protein") or "N/A",
                    "Carbs": nutrients.get("Carbohydrate, by difference") or "N/A",
                    "Fat": nutrients.get("Total lipid (fat)") or "N/A"
                })

                print(f"✅ Added: {food.get('description')}")

                if len(batch) >= 50:
                    append_to_csv(batch)
                    print(f"💾 Appended 50 for {keyword}")
                    batch = []

                time.sleep(0.3)

            except Exception as e:
                print(f"⚠️ Error retrieving food detail for ID {fdc_id}: {e}")
                continue

        page += 1

    append_to_csv(batch)
    print(f"✅ Finished {keyword}")

print("\n🏁 Done fetching all foods.")
