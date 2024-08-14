// Basal Metabolic Rate (BMR) calculation based on the Harris-Benedict equation
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }
  }
  
  // Maintenance calories calculation based on activity level
  function calculateMaintenanceCalories(bmr, activity) {
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
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
      surplus: maintenance + 500
    };
  }
  
  // Function to update the personalized plan based on user input
  function updatePlan() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;
  
    if (isNaN(height) || isNaN(weight) || isNaN(age) || height <= 0 || weight <= 0 || age <= 0) {
        alert("Please enter valid positive numbers for height, weight, and age.");
        return;
    }
  
    const calories = calculateCalories(weight, height, age, gender, activity);
  
    const dietPlans = {
      Calorie_deficit: `<a href="http://127.0.0.1:5500/gym-workout/DIetary%20website/FoodDB.html">Consume about ${calories.deficit.toFixed(0)} kcal/day.</a>`,
      Calorie_surplus: `<a href="http://127.0.0.1:5500/gym-workout/DIetary%20website/FoodDB.html">Consume about ${calories.surplus.toFixed(0)} kcal/day.</a>`,
      Calorie_maintenance: `<a href="http://127.0.0.1:5500/gym-workout/DIetary%20website/FoodDB.html">Consume about ${calories.maintenance.toFixed(0)} kcal/day.</a>`
    };

  
    return dietPlans;
  }
  
  // Function to handle preference selection and update the plan
  function selectPreference(type, preference) {
    const dietPlans = updatePlan();
    if (type === 'exercise') {
      document.getElementById('exercise-plan').innerHTML = workoutPlans[preference];
    } else if (type === 'diet') {
      document.getElementById('diet-plan').innerHTML = dietPlans[preference];
    }
  }
  
  const workoutPlans = {
    Aerobic: '<a href="http://127.0.0.1:5500/gym-workout/Aerobic%20website/Aerobic.html">Cycling, dancing, hiking, running, swimming, and walking.</a>',
    Resistance: '<a href="http://127.0.0.1:5500/gym-workout/Resistance%20website/Resistance.html">Free weights, weight machines.</a>',
    Flexibility: '<a href="http://127.0.0.1:5500/gym-workout/Flexibilty%20website/Flexibilty.html">Static stretching, dynamic stretching.</a>',
    Stability: '<a href="http://127.0.0.1:5500/gym-workout/Stability%20website/Stability.html">Body weight training, calisthenics, plyometrics, pilates.</a>'
  };
  