import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Canonical allergens recognized by SureBite
const CANONICAL_ALLERGENS = [
  'dairy', 'gluten', 'eggs', 'peanuts', 'tree_nuts', 'soy', 'fish',
  'shellfish', 'sesame', 'mustard', 'celery', 'lupin', 'molluscs', 'sulfites'
];

/**
 * Safely parses raw JSON output from the AI, handling markdown fences,
 * leading/trailing text, and nested wrapper objects.
 */
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Extract the JSON slice between brackets/braces if surrounded by commentary
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  let parsed;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = cleaned.lastIndexOf(']');
    parsed = JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
  } else if (firstBrace !== -1) {
    const lastBrace = cleaned.lastIndexOf('}');
    parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } else {
    parsed = JSON.parse(cleaned);
  }

  // If the AI returned an object wrapping the array (e.g. { dishes: [...] })
  if (!Array.isArray(parsed)) {
    if (Array.isArray(parsed.dishes)) parsed = parsed.dishes;
    else if (Array.isArray(parsed.items)) parsed = parsed.items;
    else if (Array.isArray(parsed.menu)) parsed = parsed.menu;
    else {
      const arrKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrKey) parsed = parsed[arrKey];
      else throw new Error('AI output does not contain an array of dishes.');
    }
  }

  return parsed;
}

/**
 * Normalizes and sanitizes dish fields to strictly match the Mongoose MenuItem schema.
 */
function sanitizeDishes(rawDishes) {
  return rawDishes.map((dish) => {
    const name = String(dish.name || 'Untitled Dish').trim();
    const description = String(dish.description || '').trim();

    // Ensure price is a clean number or null
    let price = null;
    if (typeof dish.price === 'number' && !isNaN(dish.price)) {
      price = dish.price;
    } else if (typeof dish.price === 'string') {
      const numeric = parseFloat(dish.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(numeric)) price = numeric;
    }

    const category = String(dish.category || 'Mains').trim() || 'Mains';

    // Normalize dietaryType strictly to 'veg', 'non_veg', or 'egg'
    let dietaryType = 'veg';
    const rawDiet = String(dish.dietaryType || '').toLowerCase().replace(/[\s-]/g, '_');
    if (rawDiet === 'non_veg' || rawDiet === 'nonveg') {
      dietaryType = 'non_veg';
    } else if (rawDiet === 'egg' || rawDiet === 'contains_egg' || rawDiet === 'eggetarian') {
      dietaryType = 'egg';
    } else {
      dietaryType = 'veg';
    }

    // Filter allergens strictly to CANONICAL_ALLERGENS
    let allergens = [];
    if (Array.isArray(dish.allergens)) {
      allergens = dish.allergens
        .map((a) => String(a || '').toLowerCase().trim().replace(/[\s-]/g, '_'))
        .filter((a) => CANONICAL_ALLERGENS.includes(a));
    }

    return {
      name,
      description,
      price,
      category,
      dietaryType,
      allergens: [...new Set(allergens)],
    };
  });
}

export const extractMenuData = async (imagePath) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in backend/.env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const imageAsBase64 = fs.readFileSync(imagePath).toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';

  const prompt = `
You are an expert restaurant menu digitizer specializing in Indian and global cuisine.
Extract all dishes from this menu image into a clean JSON array of objects.

Each dish object MUST strictly include:
- "name": (String) Name of the dish (e.g., "Aloo Paratha", "Paneer Tikka", "Dal Makhani").
- "description": (String) Brief description or ingredients listed on the menu. If none, return "".
- "price": (Number or null) Numerical price without currency symbols (e.g., 99 or 120.5). If not listed, return null.
- "category": (String) Section category (e.g., "Starters", "Mains", "Breads", "Desserts", "Beverages").
- "dietaryType": (String) Strictly one of: "veg", "non_veg", or "egg".
  * "veg": Vegetarian dishes containing vegetables, paneer, lentils, dairy, or grains.
  * "egg": Dishes containing egg (e.g., Egg Bhurji, Egg Curry, Egg Fried Rice).
  * "non_veg": Dishes containing chicken, mutton, fish, or seafood.
- "allergens": (Array of Strings) Chosen ONLY from this canonical 14 list:
  ["dairy", "gluten", "eggs", "peanuts", "tree_nuts", "soy", "fish", "shellfish", "sesame", "mustard", "celery", "lupin", "molluscs", "sulfites"].
  * For Indian cuisine: Paratha, Naan, Roti, Poori contain "gluten". Paneer, Ghee, Butter, Dahi, Cream contain "dairy". Dishes fried in mustard oil contain "mustard".

Return ONLY a raw JSON array. Do not include markdown code block formatting or commentary.
`;

  // Model cascade: Primary target is gemini-3.8-flash (recommended flagship free model),
  // with automated fallback to gemini-3.7-flash and gemini-3.5-flash-lite during free-tier capacity spikes.
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite'];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageAsBase64, mimeType } },
      ]);

      const responseText = result.response.text();
      const rawDishes = cleanAndParseJSON(responseText);
      const sanitized = sanitizeDishes(rawDishes);

      if (sanitized.length === 0) {
        throw new Error('No dishes found in menu image.');
      }

      return sanitized;
    } catch (error) {
      console.warn(`Extraction attempt with model '${modelName}' failed:`, error.message);
      lastError = error;
    }
  }

  console.error('All Gemini model attempts failed:', lastError);
  throw new Error(`Failed to extract data from image: ${lastError?.message || 'Service unavailable'}`);
};