# Fitness Website Project

**🔗 Live site: https://kammy04.github.io/Fitness-Website/**

This project is a comprehensive fitness platform aimed at helping users improve their overall health and wellness. The website provides information on different types of exercises, nutritional tips, and tools to track fitness goals.

---

## Problem Definition

Fitness and health are key components of a balanced lifestyle, yet finding accessible and reliable resources for fitness and nutrition can be challenging. Many existing platforms lack a comprehensive approach, focusing only on either exercise or diet without integrating both into a single user-friendly solution.

This project bridges that gap by providing a one-stop fitness hub that:
- Educates users on aerobic, flexibility, stability, and resistance exercises.
- Offers nutritional insights to complement physical fitness.
- Enables users to adopt a holistic approach to their health.

---

## Website Features

### 1. Personalized Plan (main page — `n2.html`)
- Enter height (cm or ft/in), weight (kg or lbs), age, gender and activity level; inputs are remembered between visits.
- Calorie targets for **deficit**, **maintenance** and **surplus**, calculated with the Mifflin-St Jeor BMR equation × an activity factor.
- Pick an exercise type to get a link to its guide page, plus a **suggested number of training days per week** for your activity level (updates when you change it).

### 2. Exercise Guides
- **Aerobic**, **Resistance**, **Flexibility** and **Stability** pages with calories burned per hour, step-by-step form instructions, and recommended reps/sets.
- Each exercise has a **▶ Watch how-to videos** link that opens a YouTube search for beginner technique in a new tab.

### 3. Food Search & Macro Tracker (`DIetary website/FoodDB.html`)
- Search a food database built from the **USDA FoodData Central** API (calories, protein, carbs and fat per 100 g). Results are ranked so names that start with your search come first, with duplicates removed.
- **Favourites & recent foods:** star a food to pin it, and the last 8 foods you opened appear as one-click chips under the search box.
- Choose an amount in grams (defaults to 100 g) or a serving such as "1 cup"; calculate macros or add the food to today's log.
- Daily goals for calories, protein, carbs and fat based on your weight, TDEE and dietary goal, with an over/under status line.
- **Daily log:** each day starts fresh, every entry is timestamped, and past days are kept in a **Past Days** history you can expand.
- **Saved meals:** save today's cart as a named meal (e.g. "Usual breakfast") and log all of it again later in one click.
- **Daily streak** of consecutive days with something logged, with an emoji that levels up (🌱 → 🔥 3 days → 💪 7 → 🏆 14 → 👑 30).
- Cart button with an item-count badge; remove single entries or reset today's cart.
- Add, edit and delete your own **custom foods**.

---

## Running Locally

The site is plain HTML, CSS and JavaScript — no build step. Serve the folder with any static server, for example:

```bash
cd Fitness-Website
python3 -m http.server 8000
```

Then open <http://localhost:8000/n2.html>. (VS Code's Live Server extension also works.)

### How data is stored
Everything is saved in the browser's `localStorage`, so it stays on your device and there is no account or server:

| Key | What it holds |
|---|---|
| `dailyLogs` | Food entries grouped by date (`"YYYY-MM-DD"`), each with a timestamp |
| `customFoods` | Foods you added yourself |
| `favorites`, `recentFoods` | Keys of starred and recently opened foods |
| `meals` | Saved meals (a snapshot of each item's amount and macros) |
| `userTDEE`, `userWeightLbs`, `goalMode` | Your saved daily-goal settings |

### Updating the food database
`DIetary website/foods.py` downloads foods from the USDA API into `foods.csv`, and `covert.py` converts that into `foods.js`, which the page loads. The API key is read from an environment variable so it is never committed:

```bash
export USDA_API_KEY="your-key-here"   # free key from https://fdc.nal.usda.gov/api-key-signup
python3 foods.py && python3 covert.py
```

---

### Deploying
The site is hosted on **GitHub Pages** straight from the `main` branch, so every push to `main` updates
the live site. `index.html` forwards the site root to the main page (`n2.html`).

---

## Next Steps

1. **Make the food diary easier to find.** Logs are already saved per day in the browser (`localStorage` key `dailyLogs`) and shown in the **Past Days** section of the food page, but nothing points users there. Possible additions: a "History" link at the top, a calendar or weekly view, and charts of calories and macros over time.
2. **Restructure the layout** so every feature is easy to discover: a navigation bar shared by all pages, a clear order on the food page (search → today → goals → meals → history), and a layout that works on phones.
3. **Choose a better food data source.** Options to compare:
   - *USDA FoodData Central (current):* free and authoritative, but we only pull the "Survey (FNDDS)" data type, one food at a time. Using the free bulk CSV downloads and adding the **Foundation** and **SR Legacy** data types would give more foods (e.g. plain "oats") and real portion sizes.
   - *Open Food Facts:* free and open, strong on **branded and packaged foods** with barcodes; data quality varies because it's crowd-sourced.
   - *Commercial APIs (e.g. Nutritionix, Edamam):* natural-language search ("2 eggs and toast") and large branded databases, but they need an account, and free tiers are limited.
4. **Track micronutrients against recommended daily levels.** The USDA data already includes fibre, sodium, sugar, vitamins and minerals; `foods.py` currently keeps only calories, protein, carbs and fat. Compare intake with the Dietary Reference Intakes (RDA/AI), which vary by age and sex.
5. **Refine the macro targets.** Currently: protein 0.8 g per lb of body weight, fat 25% of calories, carbs fill the remaining calories. To add: let users pick fat within the usual 20–35% of calories, and a **fibre** target of about 14 g per 1,000 kcal.
6. **User accounts with a real database.** Move data from `localStorage` to a backend (e.g. Firebase, Supabase, or a small server with PostgreSQL) so data follows the user across devices and the "Top 5" idea becomes possible.

---

## Solution Specification

### Technologies Used:
1. **Frontend**:
   - **HTML**: Structuring the content for easy navigation.
   - **CSS**: Styling the website for an attractive and user-friendly design.
   - **JavaScript**: Adding interactivity and dynamic features.

2. **Data and Tools**:
   - **Food Database**: Categorizes nutritional information for different dietary goals.
   - **Responsive Design**: Ensures compatibility across devices.

2. **Notebook Implementation**:
   - Includes a Jupyter Notebook file for backend or algorithmic operations related to tracking or analyzing fitness data.

---

## Testing and Analysis

### **User Feedback**:
- Positive reception for the easy navigation and comprehensive exercise categories.
- Users appreciated the visual appeal and intuitive layout.

### **Performance Testing**:
- Ensured quick load times and responsiveness across multiple devices.
- Verified functionality of all links and interactive elements.

---

## Conclusion and Future Directions

### Key Achievements:
- Built a user-centric platform that integrates exercise routines and nutritional guidance.
- Successfully combined aesthetics with functionality for a seamless user experience.

### Future Improvements:
1. **User Accounts**: Log in to keep your data across devices (today it lives in one browser's `localStorage`).
2. **Better serving sizes**: Use each food's real USDA portion weights instead of one shared list (e.g. "1 cup" is currently 240 g for every food).
2. **More gamification**: Badges for hitting macro goals, building on the daily streak.
3. **AI Integration**: Use machine learning to provide personalized workout and meal recommendations.

---

## References

- USDA FoodData Central API for food and nutrient data
- CSS Tricks and Mozilla Developer Network for Responsive Design Techniques
- Jupyter Notebook Documentation for backend implementation guidance

---

## Contact

For any inquiries, feel free to connect:

- **Email**: [ukaegbuc@mcmaster.ca](mailto:ukaegbuc@mcmaster.ca)
- **GitHub**: [kammy04](https://github.com/kammy04)

