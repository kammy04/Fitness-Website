# Fitness Website Project

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
- Pick an exercise type to get a link to its guide page.

### 2. Exercise Guides
- **Aerobic**, **Resistance**, **Flexibility** and **Stability** pages with calories burned per hour, step-by-step form instructions, and recommended reps/sets.

### 3. Food Search & Macro Tracker (`DIetary website/FoodDB.html`)
- Search a food database built from the **USDA FoodData Central** API (calories, protein, carbs and fat per 100 g).
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
cd gym-workout
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

## Solution Specification

### Technologies Used:
1. **Frontend**:
   - **HTML**: Structuring the content for easy navigation.
   - **CSS**: Styling the website for an attractive and user-friendly design.
   - **JavaScript**: Adding interactivity and dynamic features.

2. **Data and Tools**:
   - **Food Database**: Categorizes nutritional information for different dietary goals.
   - **Responsive Design**: Ensures compatibility across devices.

3. **Notebook Implementation**:
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
1. **User Accounts**: Allow users to log in and track personal fitness goals.
2. **Advanced Nutrition Tools**: Implement calorie and macronutrient calculators.
3. **Gamification**: Add badges or rewards for completing exercise routines or meeting health goals.
4. **AI Integration**: Use machine learning to provide personalized workout and meal recommendations.

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

