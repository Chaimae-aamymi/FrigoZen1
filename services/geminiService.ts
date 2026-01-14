
import { GoogleGenAI, Type } from "@google/genai";
import { FoodCategory, Language } from "../types";

const API_KEY = process.env.API_KEY || "";

export const parseReceipt = async (base64Image: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = lang === 'ar' 
    ? "حلل هذه الفاتورة واستخرج قائمة المنتجات الغذائية. لكل منتج، قدر الفئة ومدة الحفظ الواقعية بالأيام من اليوم. استخرج الكمية كرقم (مثلاً 3 إذا كان هناك 3 تفاحات). الإجابة يجب أن تكون بصيغة JSON."
    : `Analyse ce ticket de caisse et extrais la liste des produits alimentaires achetés. Réponds en ${lang}. Pour chaque produit, estime une catégorie technique, une durée de conservation en jours, et surtout une quantité numérique précise (ex: 3 pour 3 yaourts).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              description: "Technical category name among: FRUITS_VEGGIES, DAIRY, MEAT_FISH, PANTRY, BEVERAGES, FROZEN, OTHER"
            },
            shelfLifeDays: { type: Type.NUMBER },
            quantity: { type: Type.STRING, description: "Description textuelle (ex: 500g)" },
            numericQuantity: { type: Type.NUMBER, description: "Nombre d'unités (ex: 3)" }
          },
          required: ["name", "category", "shelfLifeDays", "numericQuantity"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error parsing Gemini response", e);
    return [];
  }
};

export const translateIngredients = async (names: string[], targetLang: Language) => {
  if (names.length === 0) return {};
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Translate the following food ingredient names into ${targetLang}. 
  Return a JSON object where keys are the original names and values are the translations.
  Names: ${names.join(', ')}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Translation failed", e);
    return {};
  }
};

export const generateRecipeImage = async (recipeTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    // On force un prompt descriptif en anglais pour de meilleurs résultats avec le modèle d'image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality professional food photography of ${recipeTitle}. Appetizing, beautifully plated, close-up shot, soft natural kitchen lighting, 4k resolution.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

export const suggestRecipes = async (ingredients: string[], lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Ton rôle : Chef expert anti-gaspi.
    
    INGRÉDIENTS DISPONIBLES DANS LE FRIGO :
    ${ingredients.join(', ')}

    CONSIGNE CRITIQUE :
    1. Propose 3 recettes réalisables UNIQUEMENT avec les ingrédients cités ci-dessus.
    2. LANGUE DE RÉPONSE : Tu DOIS répondre exclusivement en "${lang}". 
       - INTERDICTION de mélanger l'anglais avec l'arabe ou le français.
       - Si lang='ar', TOUT le JSON doit être en arabe (titre, instructions, noms d'ingrédients).
       - Si lang='fr', TOUT le JSON doit être en français.

    FORMAT DE SORTIE : Réponds EXCLUSIVEMENT en JSON valide suivant le schéma fourni.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste des ingrédients à afficher" },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Étapes pas à pas" },
            prepTime: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error parsing recipe response", e);
    return [];
  }
};
