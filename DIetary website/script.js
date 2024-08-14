document.addEventListener("DOMContentLoaded", function() {
    const cart = {};
    let calorieGoal = 0;
    let totalCalories = 0;

    const calorieGoalForm = document.getElementById('calorie-goal-form');
    const calorieGoalDisplay = document.getElementById('calorie-goal-display');
    const totalCaloriesDisplay = document.getElementById('total-calories');
    const summaryCaloriesDisplay = document.getElementById('summary-calories');
    const statusMessage = document.getElementById('status-message');

    if (calorieGoalForm) {
        calorieGoalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calorieGoal = parseInt(document.getElementById('calorie-goal').value);
            calorieGoalDisplay.innerText = calorieGoal;
            updateStatus();
        });
    }

/**
 * Adds an event listener to the form with the ID 'custom-food-form' to handle form submission.
 * When the form is submitted, it prevents the default form submission behavior,
 * retrieves the food foodName and calorie values from the form inputs, and calls the addFood function.
 */
document.getElementById('add-custom-food').addEventListener('click', function(event) {
    event.preventDefault();
    const foodName = document.getElementById('custom-food-name').value;
    const customFoodCalories = parseInt(document.getElementById('custom-food-calories').value, 10);
    addFood(foodName, customFoodCalories);
});

document.getElementById('remove-custom-food').addEventListener('click', function(event) {
    event.preventDefault();
    const foodName = document.getElementById('custom-food-name').value;
    const customFoodCalories = parseInt(document.getElementById('custom-food-calories').value, 10);
    removeFood(foodName, customFoodCalories);
});

    function addFood(foodName, calories) {
        if (!cart[foodName]) {
            cart[foodName] = { quantity: 0, calories: calories };
        }
        cart[foodName].quantity += 1;
        totalCalories += calories;
        updateCart();
        totalCaloriesDisplay.innerText = totalCalories;
        updateStatus();
    }

    function removeFood(foodName, calories) {
        if (cart[foodName] && cart[foodName].quantity > 0) {
            cart[foodName].quantity -= 1;
        if (cart[foodName].quantity === 0) {
                delete cart[foodName];
            }
        }
        totalCalories -= calories;
        updateCart();
        totalCaloriesDisplay.innerText = totalCalories;
        updateStatus();
    }

    function updateCart() {
        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = '';
        for (const [name, item] of Object.entries(cart)) {
            const li = document.createElement('li');
            li.textContent = `${name} - Quantity: ${item.quantity}`;
            cartItems.appendChild(li);
        }
        document.getElementById('total-calories').textContent = totalCalories;
    }

    function updateStatus() {
        const calorieDifference = calorieGoal - totalCalories;
        summaryCaloriesDisplay.innerText = totalCalories;
        if (calorieDifference >= -100 && calorieDifference <= 100) {
            statusMessage.innerText = "You're within your calorie goal!";
            statusMessage.style.color = "green";
        } else if (calorieDifference < -100) {
            statusMessage.innerText = "You've exceeded your calorie goal.";
            statusMessage.style.color = "red";
        } else {
            statusMessage.innerText = "You can eat a bit more to reach your goal.";
            statusMessage.style.color = "orange";
        }
    }



    window.resetTracker = function() {
        totalCalories = 0;
        totalCaloriesDisplay.innerText = totalCalories;
        summaryCaloriesDisplay.innerText = totalCalories;
        statusMessage.innerText = '';
    };

    window.addFood = addFood;
    window.removeFood = removeFood;
});
