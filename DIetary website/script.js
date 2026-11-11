// script.js — goals + tracker + cart toggle/removal + custom foods (add/edit/delete)

// ========== Storage-backed state ==========
const GRAM_LABEL    = 'g';   // label of the "grams" option in the unit dropdown
const DEFAULT_GRAMS = 100;   // starting amount when a food is selected

let customFoods   = JSON.parse(localStorage.getItem('customFoods') || '[]');
migrateCustomFoods(); // ensure ids & source
let combinedFoods = (typeof foods !== 'undefined' ? foods : []).concat(customFoods);

// Daily log: one list of entries per calendar day, so every day starts fresh
// but past days are kept for history and streaks.
//   localStorage 'dailyLogs' = { "2026-11-11": [ {name, amount, unit, macros, time}, ... ], ... }
// Totals are always worked out from the entries (see totalsFor), so they can
// never drift out of sync with what's actually in the log.
let dailyLogs     = JSON.parse(localStorage.getItem('dailyLogs') || '{}');
migrateOldCart();

let userTDEE      = parseFloat(localStorage.getItem('userTDEE'))      || null;
let userWeightLbs = parseFloat(localStorage.getItem('userWeightLbs')) || null;
let goalMode      = localStorage.getItem('goalMode') || 'maintenance';

let goals = computeGoals(userTDEE, userWeightLbs);

// ========== Elements ==========
const searchBox         = document.getElementById('search-box');
const resultsList       = document.getElementById('search-results');

const detailsCard       = document.getElementById('food-details');
const nameEl            = document.getElementById('food-name');
const brandEl           = document.getElementById('food-brand');
const macroList         = document.getElementById('macro-values');
const amountInput       = document.getElementById('amount');
const unitSelect        = document.getElementById('serving-select');
const calcBtn           = document.getElementById('calculate-btn');
const addBtn            = document.getElementById('add-selected-food');
const calcDisplay       = document.getElementById('calculated-macros');

const goalWeightInput   = document.getElementById('goal-weight-lbs');
const goalTDEEInput     = document.getElementById('goal-tdee');
const goalModeSelect    = document.getElementById('goal-mode');
const saveGoalsBtn      = document.getElementById('save-goals');

const goalCalEl         = document.getElementById('goal-calories');
const goalProtEl        = document.getElementById('goal-protein');
const goalCarbEl        = document.getElementById('goal-carbs');
const goalFatEl         = document.getElementById('goal-fat');
const caloriePolicyEl   = document.getElementById('calorie-policy');
const calorieStatusEl   = document.getElementById('calorie-status');

// Tracker UI elements (MISSING before)
const trackerCalEl  = document.getElementById('tracker-calories');
const trackerProtEl = document.getElementById('tracker-protein');
const trackerCarbEl = document.getElementById('tracker-carbs');
const trackerFatEl  = document.getElementById('tracker-fat');


const toggleCartBtn     = document.getElementById('toggle-cart-btn');
const cartBtnLabel      = document.getElementById('cart-btn-label');
const cartCountBadge    = document.getElementById('cart-count');
const cartHistorySection= document.getElementById('cart-history');
const cartHistoryList   = document.getElementById('cart-history-list');
const resetBtn          = document.getElementById('reset-cart');
const historyList       = document.getElementById('history-list');
const historyEmpty      = document.getElementById('history-empty');
const streakEl          = document.getElementById('streak-line');

const customForm        = document.getElementById('custom-food-form');
const cfName            = document.getElementById('cf-name');
const cfUnit            = document.getElementById('cf-unit');
const cfCal             = document.getElementById('cf-cal');
const cfCarb            = document.getElementById('cf-carb');
const cfProtein         = document.getElementById('cf-protein');
const cfFat             = document.getElementById('cf-fat');

// Edit panel
const editSection       = document.getElementById('edit-custom-section');
const editForm          = document.getElementById('edit-custom-form');
const efId              = document.getElementById('ef-id');
const efName            = document.getElementById('ef-name');
const efUnit            = document.getElementById('ef-unit');
const efCal             = document.getElementById('ef-cal');
const efCarb            = document.getElementById('ef-carb');
const efProtein         = document.getElementById('ef-protein');
const efFat             = document.getElementById('ef-fat');
const saveCustomChanges = document.getElementById('save-custom-changes');
const deleteCustomBtn   = document.getElementById('delete-custom-food');
const cancelEditBtn     = document.getElementById('cancel-edit');

let selectedFood = null;

// ========== Init ==========
prefillGoalForm();
updateGoalsUI();
refreshLogUI();

// If the page is left open past midnight, show the new day when the user comes back.
window.addEventListener('focus', refreshLogUI);

// ========== Daily log helpers ==========
// "YYYY-MM-DD" in the user's LOCAL time zone. (toISOString() would use UTC,
// which in Ontario flips to tomorrow's date at 7–8 PM.)
function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Turn "2026-11-11" back into a local Date. (new Date("2026-11-11") would
// be read as UTC midnight, i.e. the evening before in Ontario.)
function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12); // noon avoids daylight-saving edge cases
}

function todayEntries() {
  return dailyLogs[dateKey()] || [];
}

function saveLogs() {
  localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
}

function totalsFor(entries) {
  return entries.reduce((t, e) => ({
    calories: t.calories + e.macros.calories,
    protein:  t.protein  + e.macros.protein,
    carbs:    t.carbs    + e.macros.carbs,
    fat:      t.fat      + e.macros.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// Add entries to today's log (newest first) and redraw everything.
function logEntries(entries) {
  const key = dateKey();
  const now = Date.now();
  const stamped = entries.map(e => ({ ...e, time: now }));
  dailyLogs[key] = [...stamped, ...(dailyLogs[key] || [])];
  saveLogs();
  refreshLogUI();
}

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// One-time move of the old single cart ('cartHistory' + 'trackerTotals')
// into today's log, so nothing a user already logged is lost.
function migrateOldCart() {
  const old = JSON.parse(localStorage.getItem('cartHistory') || 'null');
  if (Array.isArray(old) && old.length) {
    const key = dateKey();
    dailyLogs[key] = [...(dailyLogs[key] || []), ...old.map(e => ({ ...e, time: e.time || null }))];
    saveLogs();
  }
  localStorage.removeItem('cartHistory');
  localStorage.removeItem('trackerTotals');
}

function refreshLogUI() {
  updateTrackerUI();
  updateCartHistoryUI();
  updateHistoryUI();
  updateStreakUI();
}

// ========== Daily streak ==========
// A day counts if at least one food was logged. If today has nothing yet,
// the streak is still "alive" from yesterday until midnight.
function currentStreak() {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // noon avoids daylight-saving edge cases
  const hasLog = () => (dailyLogs[dateKey(d)] || []).length > 0;

  if (!hasLog()) d.setDate(d.getDate() - 1); // today not logged yet
  let streak = 0;
  while (hasLog()) {
    streak++;
    d.setDate(d.getDate() - 1); // setDate handles month/year boundaries
  }
  return streak;
}

// Different emoji as the streak grows.
function streakEmoji(n) {
  if (n >= 30) return '👑';
  if (n >= 14) return '🏆';
  if (n >= 7)  return '💪';
  if (n >= 3)  return '🔥';
  return '🌱';
}

function updateStreakUI() {
  const n = currentStreak();
  const loggedToday = todayEntries().length > 0;
  if (n === 0) {
    streakEl.textContent = '🌱 Log a food today to start a streak!';
  } else if (!loggedToday) {
    streakEl.textContent = `${streakEmoji(n)} ${n}-day streak — log something today to keep it going!`;
  } else {
    streakEl.textContent = `${streakEmoji(n)} ${n}-day streak!`;
  }
}

// ========== Helpers ==========
function uid() {
  return 'cf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function migrateCustomFoods() {
  let changed = false;
  customFoods.forEach(f => {
    if (!f.id) { f.id = uid(); changed = true; }
    if (!f.source) { f.source = 'custom'; changed = true; }
    if (!f.servings) { f.servings = {}; changed = true; }
  });
  if (changed) localStorage.setItem('customFoods', JSON.stringify(customFoods));
}

function computeGoals(tdee, weightLbs) {
  const kcal    = Number.isFinite(tdee) ? tdee : 2000;
  const protein = Number.isFinite(weightLbs) ? weightLbs * 0.8 : 150;
  const fat     = (kcal * 0.25) / 9;
  let carbs     = (kcal - (protein * 4 + fat * 9)) / 4;
  if (!Number.isFinite(carbs) || carbs < 0) carbs = 0;
  return {
    calories: Math.round(kcal),
    protein:  Math.round(protein),
    carbs:    Math.round(carbs),
    fat:      Math.round(fat)
  };
}

function prefillGoalForm() {
  if (userWeightLbs) goalWeightInput.value = Math.round(userWeightLbs);
  if (userTDEE)      goalTDEEInput.value   = Math.round(userTDEE);
  goalModeSelect.value = goalMode;

  // Optional: hide the goal form if both exist
  if (userWeightLbs && userTDEE) {
    const goalSection = document.getElementById('goal-settings');
    if (goalSection) goalSection.style.display = 'none';
  }
}

function policyText() {
  if (goalMode === 'deficit')   return `Goal policy: eat at most ${goals.calories} kcal/day.`;
  if (goalMode === 'surplus')   return `Goal policy: eat at least ${goals.calories} kcal/day.`;
  return `Goal policy: eat about ${goals.calories} kcal/day.`;
}

function updateGoalsUI() {
  goalCalEl.textContent  = goals.calories;
  goalProtEl.textContent = goals.protein;
  goalCarbEl.textContent = goals.carbs;
  goalFatEl.textContent  = goals.fat;
  caloriePolicyEl.textContent = policyText();
  localStorage.setItem('dailyGoals', JSON.stringify(goals));
}

function updateStatusLine() {
  const diff = totalsFor(todayEntries()).calories - goals.calories;
  let msg = '';
  if (goalMode === 'deficit') {
    if (diff <= -50) msg = `Under by ${Math.abs(Math.round(diff))} kcal — nice for a deficit.`;
    else if (Math.abs(diff) < 50) msg = `On track (within ±50 kcal).`;
    else msg = `Over by ${Math.round(diff)} kcal — aim below ${goals.calories}.`;
  } else if (goalMode === 'surplus') {
    if (diff >= 50) msg = `Over by ${Math.round(diff)} kcal — good for a surplus.`;
    else if (Math.abs(diff) < 50) msg = `On track (within ±50 kcal).`;
    else msg = `Under by ${Math.abs(Math.round(diff))} kcal — aim above ${goals.calories}.`;
  } else {
    if (Math.abs(diff) < 50) msg = `On track (within ±50 kcal).`;
    else if (diff > 0) msg = `Over maintenance by ${Math.round(diff)} kcal.`;
    else msg = `Under maintenance by ${Math.abs(Math.round(diff))} kcal.`;
  }
  calorieStatusEl.textContent = msg;
}

function updateTrackerUI() {
  const t = totalsFor(todayEntries());
  trackerCalEl.textContent  = `Calories: ${t.calories.toFixed(1)} / ${goals.calories}`;
  trackerProtEl.textContent = `Protein: ${t.protein.toFixed(1)}g / ${goals.protein}g`;
  trackerCarbEl.textContent = `Carbs: ${t.carbs.toFixed(1)}g / ${goals.carbs}g`;
  trackerFatEl.textContent  = `Fat: ${t.fat.toFixed(1)}g / ${goals.fat}g`;
  updateStatusLine();
}

// One line of text for a logged entry, e.g.
// "7:42 PM · Banana — 100 g: 89.0 kcal, 1.1g P, 22.8g C, 0.3g F"
function entryText(entry) {
  const time = entry.time ? `${formatTime(entry.time)} · ` : '';
  return `${time}${entry.name} — ${formatQuantity(entry.amount, entry.unit)}: ` +
    `${entry.macros.calories.toFixed(1)} kcal, ` +
    `${entry.macros.protein.toFixed(1)}g P, ` +
    `${entry.macros.carbs.toFixed(1)}g C, ` +
    `${entry.macros.fat.toFixed(1)}g F`;
}

function updateCartHistoryUI() {
  const entries = todayEntries();
  cartHistoryList.innerHTML = '';
  entries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = entryText(entry); // textContent, not innerHTML: food names can be user-typed

    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.className   = 'remove-btn';
    btn.onclick     = () => removeCartItem(i);
    li.appendChild(btn);

    cartHistoryList.appendChild(li);
  });

  // Item-count badge on the cart button. Every cart change (add, remove,
  // reset, page load) calls this function, so the badge always matches.
  cartCountBadge.textContent = entries.length;
  cartCountBadge.hidden = entries.length === 0;
}

// Past days (newest first, up to 7), each expandable to show its entries.
// Uses <details>/<summary>, which opens and closes without any JavaScript.
function updateHistoryUI() {
  const today = dateKey();
  const pastKeys = Object.keys(dailyLogs)
    .filter(k => k !== today && dailyLogs[k].length)
    .sort()                      // "YYYY-MM-DD" strings sort in date order
    .reverse()
    .slice(0, 7);

  historyList.innerHTML = '';
  historyEmpty.hidden = pastKeys.length > 0;

  pastKeys.forEach(key => {
    const entries = dailyLogs[key];
    const t = totalsFor(entries);
    const label = keyToDate(key).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent =
      `${label} — ${Math.round(t.calories)} kcal · ${Math.round(t.protein)}g P · ` +
      `${Math.round(t.carbs)}g C · ${Math.round(t.fat)}g F (${entries.length} item${entries.length === 1 ? '' : 's'})`;
    details.appendChild(summary);

    const ul = document.createElement('ul');
    entries.forEach(e => {
      const li = document.createElement('li');
      li.textContent = entryText(e);
      ul.appendChild(li);
    });
    details.appendChild(ul);
    historyList.appendChild(details);
  });
}

// ========== Goals actions ==========
saveGoalsBtn.addEventListener('click', () => {
  const w = parseFloat(goalWeightInput.value);
  const t = parseFloat(goalTDEEInput.value);
  const mode = goalModeSelect.value;

  userWeightLbs = Number.isFinite(w) ? w : null;
  userTDEE      = Number.isFinite(t) ? t : null;
  goalMode      = mode;

  if (userWeightLbs) localStorage.setItem('userWeightLbs', String(userWeightLbs));
  else localStorage.removeItem('userWeightLbs');

  if (userTDEE) localStorage.setItem('userTDEE', String(userTDEE));
  else localStorage.removeItem('userTDEE');

  localStorage.setItem('goalMode', goalMode);

  goals = computeGoals(userTDEE, userWeightLbs);
  updateGoalsUI();
  refreshLogUI();
});

// ========== Cart toggle & removal ==========
toggleCartBtn.addEventListener('click', () => {
  const isHidden = getComputedStyle(cartHistorySection).display === 'none';
  cartHistorySection.style.setProperty('display', isHidden ? 'block' : 'none', 'important');
  // Change only the label; setting the whole button's text would wipe out the badge.
  cartBtnLabel.textContent = isHidden ? 'Hide Cart ✕' : 'Show Cart 🛒';
});

function removeCartItem(index) {
  const key = dateKey();
  if (!dailyLogs[key]) return;
  dailyLogs[key].splice(index, 1);
  saveLogs();
  refreshLogUI();
}

// Clears TODAY only; past days stay in the history.
resetBtn.addEventListener('click', () => {
  delete dailyLogs[dateKey()];
  saveLogs();
  refreshLogUI();
});

// ========== Search & selection ==========
function renderSearchResults() {
  const q = searchBox.value.trim().toLowerCase();
  resultsList.innerHTML = '';
  if (q.length < 2) return;
  combinedFoods
    .filter(f => f.name.toLowerCase().includes(q))
    .slice(0, 10)
    .forEach(food => {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = food.name;
      nameSpan.style.cursor = 'pointer';
      nameSpan.onclick = () => showDetails(food);
      li.appendChild(nameSpan);

      if (food.source === 'custom') {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.style.marginLeft = '8px';
        editBtn.onclick = (e) => {
          e.stopPropagation();
          openEditPanel(food);
        };
        li.appendChild(editBtn);
      }

      resultsList.appendChild(li);
    });
}
searchBox.addEventListener('input', renderSearchResults);

// Selected food details
function showDetails(food) {
  selectedFood = food;

  nameEl.textContent  = food.name;
  brandEl.textContent = food.brand || 'Generic';
  macroList.innerHTML = `
    <li><strong>Calories:</strong> ${food.calories} (per 100g)</li>
    <li><strong>Protein:</strong> ${food.protein}g</li>
    <li><strong>Carbs:</strong> ${food.carbs}g</li>
    <li><strong>Fat:</strong> ${food.fat}g</li>
  `;

  unitSelect.innerHTML = '';
  const baseOpt = document.createElement('option');
  baseOpt.value = 1;
  baseOpt.textContent = GRAM_LABEL;
  unitSelect.appendChild(baseOpt);

  const servings = food.servings || {};
  for (const [label, grams] of Object.entries(servings)) {
    if (label !== '100g' && label !== '1 g (per gram)') {
      const opt = document.createElement('option');
      opt.value = grams;
      opt.textContent = label;
      unitSelect.appendChild(opt);
    }
  }

  // Start at 100 g: the food data is per 100 g, like a nutrition label.
  amountInput.value = DEFAULT_GRAMS;
  calcDisplay.innerHTML = '';
  detailsCard.style.display = 'block';
}

// Switching unit resets the amount to a sensible starting value:
// 100 for grams, 1 for a serving like "1 cup" (otherwise 100 g -> 100 cups).
unitSelect.addEventListener('change', () => {
  amountInput.value = unitSelect.value === '1' ? DEFAULT_GRAMS : 1;
});

// "100 g" for grams, "2 × 1 cup" for other servings.
// Older cart entries saved the gram unit as '1 g (per gram)', so accept both.
function formatQuantity(amount, unit) {
  const isGrams = unit === GRAM_LABEL || unit === '1 g (per gram)';
  return isGrams ? `${amount} g` : `${amount} × ${unit}`;
}

function calculateMacrosForSelected() {
  if (!selectedFood) return null;
  const amt        = parseFloat(amountInput.value);
  const unitGram   = parseFloat(unitSelect.value);
  const gramsTotal = amt * unitGram;
  const factor     = gramsTotal / 100; // values are per 100g
  return {
    calories: selectedFood.calories * factor,
    protein:  selectedFood.protein  * factor,
    carbs:    selectedFood.carbs    * factor,
    fat:      selectedFood.fat      * factor
  };
}

calcBtn.addEventListener('click', () => {
  const m = calculateMacrosForSelected();
  if (!m) return;
  calcDisplay.innerHTML = `
    <li>Calories: ${m.calories.toFixed(1)}</li>
    <li>Protein: ${m.protein.toFixed(1)}g</li>
    <li>Carbs: ${m.carbs.toFixed(1)}g</li>
    <li>Fat: ${m.fat.toFixed(1)}g</li>
  `;
});

addBtn.addEventListener('click', () => {
  const m = calculateMacrosForSelected();
  if (!m) return;

  logEntries([{
    name:   selectedFood.name,
    amount: parseFloat(amountInput.value),
    unit:   unitSelect.options[unitSelect.selectedIndex].textContent,
    macros: m
  }]);
});

// ========== Add / Edit / Delete custom foods ==========
customForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newFood = {
    id: uid(),
    source: 'custom',
    name:   cfName.value.trim(),
    unit:   cfUnit.value,        // stored for reference; calc uses per-100g
    calories: +cfCal.value,
    carbs:    +cfCarb.value,
    protein:  +cfProtein.value,
    fat:      +cfFat.value,
    servings: {}
  };
  if (!newFood.name) return;

  customFoods.push(newFood);
  localStorage.setItem('customFoods', JSON.stringify(customFoods));
  combinedFoods = (typeof foods !== 'undefined' ? foods : []).concat(customFoods);

  customForm.reset();
  renderSearchResults();
});

// Open edit panel
function openEditPanel(food) {
  efId.value      = food.id;
  efName.value    = food.name;
  efUnit.value    = food.unit || '100g';
  efCal.value     = food.calories;
  efCarb.value    = food.carbs;
  efProtein.value = food.protein;
  efFat.value     = food.fat;
  editSection.style.setProperty('display', 'block', 'important');
  // scroll into view for convenience
  editSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Save changes
editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = efId.value;
  const idx = customFoods.findIndex(f => f.id === id);
  if (idx === -1) return;

  const updated = {
    ...customFoods[idx],
    name:    efName.value.trim(),
    unit:    efUnit.value,
    calories:+efCal.value,
    carbs:   +efCarb.value,
    protein: +efProtein.value,
    fat:     +efFat.value
  };

  customFoods[idx] = updated;
  localStorage.setItem('customFoods', JSON.stringify(customFoods));
  combinedFoods = (typeof foods !== 'undefined' ? foods : []).concat(customFoods);

  // If the currently shown item is this one, refresh details
  if (selectedFood && selectedFood.id === id) {
    selectedFood = updated;
    showDetails(updated);
  }

  editSection.style.display = 'none';
  renderSearchResults();
});

// Delete custom food
deleteCustomBtn.addEventListener('click', () => {
  const id = efId.value;
  const idx = customFoods.findIndex(f => f.id === id);
  if (idx === -1) return;

  // If deleting the one being shown, hide details
  if (selectedFood && selectedFood.id === id) {
    detailsCard.style.display = 'none';
    selectedFood = null;
  }

  customFoods.splice(idx, 1);
  localStorage.setItem('customFoods', JSON.stringify(customFoods));
  combinedFoods = (typeof foods !== 'undefined' ? foods : []).concat(customFoods);

  editSection.style.display = 'none';
  renderSearchResults();
});

// Cancel edit
cancelEditBtn.addEventListener('click', () => {
  editSection.style.display = 'none';
});



// Stop the mouse wheel / trackpad from changing number inputs.
// Browsers change a focused <input type="number"> when you scroll over it,
// so un-focus it instead and let the scroll move the page as normal.
// One listener on the document covers every number box on the page
// (including ones added later), because wheel events bubble up.
document.addEventListener("wheel", (event) => {
  const el = event.target;
  if (el instanceof HTMLInputElement && el.type === "number" && el === document.activeElement) {
    el.blur();
  }
}, { passive: true });
