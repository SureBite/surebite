import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const CANONICAL_ALLERGENS = [
  'dairy', 'gluten', 'eggs', 'peanuts', 'tree_nuts', 'soy', 'fish',
  'shellfish', 'sesame', 'mustard', 'celery', 'lupin', 'molluscs', 'sulfites'
];

function cleanAndParseJSON(rawText) {
  let cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  let parsed;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    parsed = JSON.parse(cleaned.slice(firstBracket, cleaned.lastIndexOf(']') + 1));
  } else if (firstBrace !== -1) {
    parsed = JSON.parse(cleaned.slice(firstBrace, cleaned.lastIndexOf('}') + 1));
  } else {
    parsed = JSON.parse(cleaned);
  }

  if (!Array.isArray(parsed)) {
    const list = parsed.dishes || parsed.items || parsed.menu || Object.values(parsed).find(Array.isArray);
    if (!list) throw new Error('AI output does not contain an array of dishes.');
    parsed = list;
  }

  return parsed;
}

function sanitizeDishes(rawDishes) {
  return (Array.isArray(rawDishes) ? rawDishes : []).map((dish) => {
    const priceNum = typeof dish.price === 'number' ? dish.price : parseFloat(String(dish.price || '').replace(/[^0-9.]/g, ''));
    const diet = String(dish.dietaryType || '').toLowerCase().replace(/[\s-]/g, '_');
    const dietaryType = ['non_veg', 'nonveg'].includes(diet) ? 'non_veg' : ['egg', 'contains_egg', 'eggetarian'].includes(diet) ? 'egg' : 'veg';
    const allergens = Array.isArray(dish.allergens)
      ? [...new Set(dish.allergens.map((a) => String(a || '').toLowerCase().trim().replace(/[\s-]/g, '_')).filter((a) => CANONICAL_ALLERGENS.includes(a)))]
      : [];

    return {
      name: String(dish.name || 'Untitled Dish').trim(),
      description: String(dish.description || '').trim(),
      price: !isNaN(priceNum) && priceNum >= 0 ? priceNum : null,
      category: String(dish.category || 'Mains').trim() || 'Mains',
      dietaryType,
      allergens,
    };
  });
}

function toInlinePart(input, defaultMime = 'image/jpeg') {
  if (Buffer.isBuffer(input)) {
    return { inlineData: { data: input.toString('base64'), mimeType: defaultMime } };
  }
  if (input && Buffer.isBuffer(input.buffer)) {
    return { inlineData: { data: input.buffer.toString('base64'), mimeType: input.mimetype || defaultMime } };
  }
  if (typeof input === 'string') {
    const ext = path.extname(input).toLowerCase();
    const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
    return { inlineData: { data: fs.readFileSync(input).toString('base64'), mimeType: mime } };
  }
  throw new Error('Invalid image input: expected Buffer, Multer file object, or file path.');
}

export const extractMenuData = async (imagesInput, defaultMime = 'image/jpeg') => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in backend/.env');

  const genAI = new GoogleGenerativeAI(apiKey);
  const rawList = Array.isArray(imagesInput) ? imagesInput : [imagesInput];
  if (!rawList.length) throw new Error('Please upload at least one menu image.');

  const inlineDataParts = rawList.map((item) => toInlinePart(item, defaultMime));

  const prompt = `
You are an expert restaurant menu digitizer specializing in Indian and global cuisine.
Extract all dishes from the provided menu image(s) (which may be multiple pages or photos of the same menu) into a clean, unified JSON array of objects. Avoid duplicate dishes if photos overlap.

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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
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

      const result = await model.generateContent([prompt, ...inlineDataParts]);
      const rawDishes = cleanAndParseJSON(result.response.text());
      const sanitized = sanitizeDishes(rawDishes);

      if (sanitized.length === 0) {
        throw new Error('No dishes found in menu image(s).');
      }

      // Deduplicate dishes by name while preserving order
      const seen = new Set();
      return sanitized.filter((dish) => {
        const key = dish.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (error) {
      console.warn(`Extraction attempt with model '${modelName}' failed:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`Failed to extract data from image(s): ${lastError?.message || 'Service unavailable'}`);
};