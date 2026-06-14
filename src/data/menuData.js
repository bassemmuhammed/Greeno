export const CATEGORIES = ["All", "Salads", "Bowls", "Smoothies", "Treats"];

export const MENU_ITEMS = [
  {
    id: 1,
    name: "Grilled Quinoa Bowl",
    desc: "Quinoa, avocado, roasted chickpeas, cherry tomatoes, lemon-tahini dressing",
    price: 145, cal: 420,
    tags: ["Vegan", "High Protein"],
    color: "#8FA888", category: "Bowls",
    available: true,
  },
  {
    id: 2,
    name: "Grilled Salmon Salad",
    desc: "Norwegian salmon, mixed greens, fennel, quinoa, dill sauce",
    price: 195, cal: 380,
    tags: ["Omega-3", "Low Carb"],
    color: "#D98B5F", category: "Salads",
    available: true,
  },
  {
    id: 3,
    name: "Green Detox Juice",
    desc: "Spinach, green apple, cucumber, mint, ginger, lemon",
    price: 65, cal: 110,
    tags: ["Detox", "Sugar Free"],
    color: "#8FA888", category: "Smoothies",
    available: true,
  },
  {
    id: 4,
    name: "Citrus Avocado Salad",
    desc: "Mixed leaves, orange segments, avocado, toasted almonds, citrus vinaigrette",
    price: 130, cal: 310,
    tags: ["Vegan", "Gluten Free"],
    color: "#D98B5F", category: "Salads",
    available: true,
  },
  {
    id: 5,
    name: "Mango Protein Smoothie",
    desc: "Mango, banana, almond milk, plant protein, chia seeds",
    price: 80, cal: 240,
    tags: ["High Protein", "Vegan"],
    color: "#8FA888", category: "Smoothies",
    available: true,
  },
  {
    id: 6,
    name: "Energy Date Bites",
    desc: "Dates, almonds, oats, cacao, shredded coconut",
    price: 55, cal: 160,
    tags: ["No Sugar Added", "Vegan"],
    color: "#D98B5F", category: "Treats",
    available: false,
  },
];

export const DAILY_SPECIAL = {
  id: 99,
  name: "Buddha Bowl",
  desc: "Roasted sweet potato, kale, edamame, brown rice, peanut-ginger sauce",
  price: 120, originalPrice: 150, cal: 450,
  tags: ["Vegan", "Today Only"],
  color: "#D98B5F", category: "Bowls",
  available: true,
};

export const RESTAURANT_CONFIG = {
  name:          "greenó",
  tagline:       "Eat Clean. Live Green.",
  whatsapp:      "201234567890", // country code, no + or spaces
  deliveryFee:   20,
  minOrder:      100,
  deliveryTime:  "30–45 min",
  openHour:      8,
  closeHour:     23,
};

export const MOCK_ORDERS = [
  { id: 1042, time: "12:48 PM", items: "1x Grilled Quinoa Bowl, 1x Green Detox Juice", total: 210, status: "Delivered",         phone: "010 1111 2222" },
  { id: 1041, time: "12:31 PM", items: "2x Mango Protein Smoothie",                      total: 160, status: "Delivered",         phone: "012 3333 4444" },
  { id: 1040, time: "12:10 PM", items: "1x Grilled Salmon Salad",                        total: 195, status: "Out for delivery",  phone: "011 5555 6666" },
  { id: 1039, time: "11:52 AM", items: "1x Citrus Avocado Salad, 1x Energy Date Bites", total: 185, status: "Preparing",         phone: "010 7777 8888" },
  { id: 1038, time: "11:30 AM", items: "3x Green Detox Juice",                           total: 195, status: "Delivered",         phone: "015 9999 0000" },
];

export const WEEKLY_SALES = [320, 410, 295, 480, 530, 610, 470];

export const ORDER_STEPS = [
  { key: "placed",    label: "Order Placed",     desc: "We've received your order"          },
  { key: "preparing", label: "Preparing",         desc: "Our kitchen is cooking it fresh"    },
  { key: "delivery",  label: "Out for Delivery",  desc: "On its way to you"                 },
  { key: "delivered", label: "Delivered",          desc: "Enjoy your meal!"                  },
];

// Demo auto-advance timings (ms). Replace with realtime updates when backend is ready.
export const STEP_DURATIONS = [4000, 8000, 8000];
