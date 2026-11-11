// Basal Metabolic Rate (BMR) calculation based on the Harris-Benedict equation
function calculateBMR(weight, height, age, gender) {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Maintenance calories calculation based on activity level
function calculateMaintenanceCalories(bmr, activity) {
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extra: 1.9,
  };
  return bmr * activityFactors[activity];
}

// Calculate calorie requirements
function calculateCalories(weight, height, age, gender, activity) {
  const bmr = calculateBMR(weight, height, age, gender);
  const maintenance = calculateMaintenanceCalories(bmr, activity);
  return {
    maintenance: maintenance,
    deficit: maintenance - 500,
    surplus: maintenance + 500,
  };
}

// diff units
document.getElementById("height-unit").addEventListener("change", function () {
  const unit = this.value;
  if (unit === "ftin") {
    document.getElementById("height").style.display = "none";
    document.getElementById("height-ftin-fields").style.display = "block";
  } else {
    document.getElementById("height").style.display = "block";
    document.getElementById("height-ftin-fields").style.display = "none";
  }
});

// Save input values to localStorage on change
["height", "weight", "age", "gender", "activity", "unit-system", "height-unit", "weight-unit", "height-feet", "height-inches"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", () => {
      localStorage.setItem(id, el.value);
    });
  }
});


// Function to update the personalized plan based on user input
function updatePlan() {
  let height, weight;

  // Handle height unit conversion
  const heightUnit = document.getElementById("height-unit").value;
  if (heightUnit === "ftin") {
    const feet = parseFloat(document.getElementById("height-feet").value);
    const inches = parseFloat(document.getElementById("height-inches").value);
    height = (feet * 12 + inches) * 2.54; // to cm
  } else {
    height = parseFloat(document.getElementById("height").value);
  }

  // Handle weight unit conversion
  const weightUnit = document.getElementById("weight-unit").value;
  if (weightUnit === "lbs") {
    weight = parseFloat(document.getElementById("weight").value) * 0.453592;
  } else {
    weight = parseFloat(document.getElementById("weight").value);
  }

  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const activity = document.getElementById("activity").value;

  if (
    isNaN(height) ||
    isNaN(weight) ||
    isNaN(age) ||
    height <= 0 ||
    weight <= 0 ||
    age <= 0
  ) {
    alert("Please enter valid positive numbers for height, weight, and age.");
    return;
  }

  const calories = calculateCalories(weight, height, age, gender, activity);
  localStorage.setItem("calorieGoal", calories.maintenance.toFixed(0));
  const dietPlans = {
    Calorie_deficit: `<a href="./DIetary%20website/FoodDB.html">Consume about ${calories.deficit.toFixed(0)} kcal/day.</a>`,
    Calorie_surplus: `<a href="./DIetary%20website/FoodDB.html">Consume about ${calories.surplus.toFixed(0)} kcal/day.</a>`,
    Calorie_maintenance: `<a href="./DIetary%20website/FoodDB.html">Consume about ${calories.maintenance.toFixed(0)} kcal/day.</a>`,
  };
//So once the user clicks one of those links, the target page can retrieve the calorie value.  

  return dietPlans;
}

// Function to handle preference selection and update the plan
function selectPreference(type, preference) {
  if (type === "exercise") {
    document.getElementById("exercise-plan").innerHTML =
      workoutPlans[preference];
  } else if (type === "diet") {
    const dietPlans = updatePlan();
    if (dietPlans) {
      document.getElementById("diet-plan").innerHTML = dietPlans[preference];

      // ✅ Save the selected calorie goal to localStorage
      const text = dietPlans[preference];
      const match = text.match(/(\d+)\s?kcal/);
      if (match) {
        localStorage.setItem("calorieGoal", match[1]);
      }
    }
  }
}


function resetInputs() {
  const keys = ["height", "weight", "age", "gender", "activity", "unit-system", "height-unit", "weight-unit", "height-feet", "height-inches"];
  keys.forEach(id => {
    localStorage.removeItem(id);
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Optional: refresh to clear visual state
  location.reload();
}

const workoutPlans = {
  Aerobic:
    '<a href="./Aerobic%20website/Aerobic.html">Cycling, dancing, hiking, running, swimming, and walking.</a>',
  Resistance:
    '<a href="./Resistance%20website/Resistance.html">Free weights, weight machines.</a>',
  Flexibility:
    '<a href="./Flexibilty%20website/Flexibilty.html">Static stretching, dynamic stretching.</a>',
  Stability:
    '<a href="./Stability%20website/Stability.html">Body weight training, calisthenics, plyometrics, pilates.</a>',
};


// Restore saved inputs on load
window.addEventListener("DOMContentLoaded", () => {
  const keys = ["height", "weight", "age", "gender", "activity", "unit-system", "height-unit", "weight-unit", "height-feet", "height-inches"];
  keys.forEach(id => {
    const el = document.getElementById(id);
    const value = localStorage.getItem(id);
    if (el && value !== null) {
      el.value = value;
      el.dispatchEvent(new Event("input")); // trigger any UI logic (like showing ft/in)
    }
  });
});
