import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Bookmark, BookmarkCheck, ChefHat } from "lucide-react";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";


const FALLBACK_MEALS = [
  {
    idMeal: "f1", strMeal: "Chicken Curry", strCategory: "Chicken", strArea: "Indian",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1525872624.jpg",
    strInstructions: "Sear the chicken, build a base of onion, garlic, ginger and tomato, stir in curry spices, then simmer with the chicken until tender and the sauce thickens.",
    strIngredient1: "Chicken thighs", strMeasure1: "600g",
    strIngredient2: "Onion", strMeasure2: "1 large",
    strIngredient3: "Garlic", strMeasure3: "3 cloves",
    strIngredient4: "Curry powder", strMeasure4: "2 tbsp",
    strIngredient5: "Tomato", strMeasure5: "2",
  },
  {
    idMeal: "f2", strMeal: "Spaghetti Carbonara", strCategory: "Pasta", strArea: "Italian",
    strMealThumb: "https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg",
    strInstructions: "Cook the pasta. Crisp the pancetta. Off the heat, toss the pasta with egg, cheese and pancetta so the residual heat creates a silky sauce, not scrambled eggs.",
    strIngredient1: "Spaghetti", strMeasure1: "400g",
    strIngredient2: "Pancetta", strMeasure2: "150g",
    strIngredient3: "Eggs", strMeasure3: "3",
    strIngredient4: "Parmesan", strMeasure4: "50g",
  },
  {
    idMeal: "f3", strMeal: "Beef Tacos", strCategory: "Beef", strArea: "Mexican",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529444830.jpg",
    strInstructions: "Brown the beef with onion and taco spices, warm the tortillas, then build each taco with beef, lettuce, cheese and salsa.",
    strIngredient1: "Ground beef", strMeasure1: "500g",
    strIngredient2: "Taco shells", strMeasure2: "8",
    strIngredient3: "Cheddar", strMeasure3: "100g",
    strIngredient4: "Lettuce", strMeasure4: "1 cup",
  },
  {
    idMeal: "f4", strMeal: "Margherita Pizza", strCategory: "Vegetarian", strArea: "Italian",
    strMealThumb: "https://www.themealdb.com/images/media/meals/x0lk951587671540.jpg",
    strInstructions: "Stretch the dough, spread a thin layer of tomato sauce, top with mozzarella and basil, then bake at the highest oven temperature until the crust blisters.",
    strIngredient1: "Pizza dough", strMeasure1: "1 ball",
    strIngredient2: "Mozzarella", strMeasure2: "150g",
    strIngredient3: "Tomato sauce", strMeasure3: "1/2 cup",
    strIngredient4: "Basil", strMeasure4: "handful",
  },
  {
    idMeal: "f5", strMeal: "Pad Thai", strCategory: "Noodles", strArea: "Thai",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529446226.jpg",
    strInstructions: "Soak the noodles, stir-fry with egg, tofu or shrimp, toss with the noodles and tamarind sauce, then finish with bean sprouts, peanuts and lime.",
    strIngredient1: "Rice noodles", strMeasure1: "200g",
    strIngredient2: "Tamarind paste", strMeasure2: "2 tbsp",
    strIngredient3: "Peanuts", strMeasure3: "1/4 cup",
    strIngredient4: "Bean sprouts", strMeasure4: "1 cup",
  },
  {
    idMeal: "f6", strMeal: "Greek Salad", strCategory: "Vegetarian", strArea: "Greek",
    strMealThumb: "https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg",
    strInstructions: "Chop cucumber, tomato, onion and pepper. Toss with olives, feta and a simple olive oil and lemon dressing.",
    strIngredient1: "Cucumber", strMeasure1: "1",
    strIngredient2: "Tomatoes", strMeasure2: "3",
    strIngredient3: "Feta", strMeasure3: "150g",
    strIngredient4: "Olives", strMeasure4: "1/2 cup",
  },
];

function searchFallback(term) {
  const q = term.trim().toLowerCase();
  const results = FALLBACK_MEALS.filter(
    (m) => m.strMeal.toLowerCase().includes(q) || m.strCategory.toLowerCase().includes(q) || m.strArea.toLowerCase().includes(q)
  );
  return results.length ? results : FALLBACK_MEALS;
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function SearchBar({ query, setQuery }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a dish — chicken, pasta, curry..."
        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function RecipeCard({ meal, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="relative aspect-video cursor-pointer" onClick={() => onOpen(meal)}>
        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal.idMeal); }}
          className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur p-1.5 rounded-md shadow-sm text-slate-500 hover:text-blue-600 transition"
          aria-label="Toggle favorite"
        >
          {isFavorite ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-3.5 cursor-pointer" onClick={() => onOpen(meal)}>
        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1">{meal.strMeal}</h3>
        <p className="text-xs text-slate-500">{meal.strArea || "International"} &middot; {meal.strCategory}</p>
      </div>
    </div>
  );
}

function DetailModal({ meal, onClose }) {
  if (!meal) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${measure?.trim() || ""} ${ing.trim()}`.trim());
  }
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-48 object-cover rounded-t-xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white shadow-sm p-1.5 rounded-md text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">{meal.strMeal}</h2>
          <p className="text-xs font-medium text-blue-600 mb-4">{meal.strCategory} &middot; {meal.strArea}</p>
          <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Ingredients</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-5 text-sm text-slate-600">
            {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Instructions</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{meal.strInstructions}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video bg-slate-100" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function RecipeSearchApp() {
  const [query, setQuery] = useState("pasta");
  const debouncedQuery = useDebouncedValue(query, 450);
  const [meals, setMeals] = useState([]);
  const [status, setStatus] = useState("idle");
  const [favorites, setFavorites] = useState(() => new Set());
  const [activeMeal, setActiveMeal] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const abortRef = useRef(null);

  const runSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setMeals([]);
      setStatus("idle");
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(term)}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      if (!data.meals) {
        setMeals([]);
        setStatus("empty");
      } else {
        setMeals(data.meals);
        setStatus("success");
      }
    } catch (err) {
      if (err.name !== "AbortError") setStatus("error");
    }
  }, []);

  useEffect(() => { runSearch(debouncedQuery); }, [debouncedQuery, runSearch]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleMeals = showFavoritesOnly ? meals.filter((m) => favorites.has(m.idMeal)) : meals;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-7 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ChefHat className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">Recipe Finder</h1>
            <p className="text-slate-500 text-xs">Search recipes and save your favorites</p>
          </div>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1"><SearchBar query={query} setQuery={setQuery} /></div>
          <button
            onClick={() => setShowFavoritesOnly((v) => !v)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium shadow-sm transition ${
              showFavoritesOnly
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Favorites ({favorites.size})
          </button>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {status === "error" && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-600 shadow-sm">
            Something went wrong reaching the recipe API. Try searching again.
          </div>
        )}

        {status === "empty" && (
          <div className="text-center py-16 text-slate-500 text-sm">No recipes found for "{query}".</div>
        )}

        {status === "success" && (
          showFavoritesOnly && visibleMeals.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">No favorites saved from this search yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {visibleMeals.map((meal) => (
                <RecipeCard
                  key={meal.idMeal}
                  meal={meal}
                  isFavorite={favorites.has(meal.idMeal)}
                  onToggleFavorite={toggleFavorite}
                  onOpen={setActiveMeal}
                />
              ))}
            </div>
          )
        )}

        {status === "idle" && (
          <div className="text-center py-16 text-slate-400 text-sm">Start typing to search for a recipe.</div>
        )}
      </div>
      <DetailModal meal={activeMeal} onClose={() => setActiveMeal(null)} />
    </div>
  );
}
