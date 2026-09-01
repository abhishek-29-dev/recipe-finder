import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, X, Bookmark, BookmarkCheck, CookingPot, Dices, Clock, Globe,
  Utensils, Tag, History, Flame, ListChecks, ListOrdered, ExternalLink, Play,
} from "lucide-react";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

// Fallback meals are used where the API can't help: the deterministic
// Chef's Pick of the Day and any offline scenario.
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

/* A deterministic daily pick: the same recipe all day, a new one tomorrow. */
function recipeOfTheDay() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FALLBACK_MEALS[h % FALLBACK_MEALS.length];
}

async function readJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

const searchByName = (term, signal) =>
  readJson(`${API_BASE}/search.php?s=${encodeURIComponent(term)}`, signal).then((d) => d.meals || []);

const searchByIngredient = (ing, signal) =>
  readJson(`${API_BASE}/filter.php?i=${encodeURIComponent(ing)}`, signal).then((d) => d.meals || []);

const searchByCuisine = (area, signal) =>
  readJson(`${API_BASE}/filter.php?a=${encodeURIComponent(area)}`, signal).then((d) => d.meals || []);

// TheMealDB's area filter is flaky: the exact query string that works varies
// (e.g. "India" works, but "Indian" and "American" return nothing). Keep a
// curated set of popular cuisines mapped to the query that actually returns
// meals, labelled with the name a person would type.
const CUISINES = [
  { label: "Indian", query: "India" },
  { label: "Italian", query: "Italian" },
  { label: "British", query: "British" },
  { label: "Spanish", query: "Spanish" },
  { label: "Thai", query: "Thai" },
  { label: "Chinese", query: "Chinese" },
  { label: "Turkish", query: "Turkish" },
  { label: "Vietnamese", query: "Vietnamese" },
  { label: "Japanese", query: "Japanese" },
  { label: "Jamaican", query: "Jamaican" },
  { label: "Mexican", query: "Mexican" },
  { label: "Greek", query: "Greek" },
  { label: "Moroccan", query: "Moroccan" },
  { label: "Portuguese", query: "Portuguese" },
  { label: "Egyptian", query: "Egyptian" },
];

const fetchRandom = () =>
  readJson(`${API_BASE}/random.php`).then((d) => d.meals?.[0] || null);

const lookupMeal = (id) =>
  readJson(`${API_BASE}/lookup.php?i=${id}`).then((d) => d.meals?.[0] || null);

// TheMealDB keeps exactly one spelling per dish (e.g. "Biryani"), so common
// transliteration variants of the same word come up empty. Map each variant to
// its canonical spelling so a search for "biriyani" still finds biryani.
const SPELLING_ALIASES = {
  biriyani: "biryani",
  briyani: "biryani",
  kabab: "kebab",
  bhel: "bhel puri",
};

// Expand a query into the list of single-word name searches worth trying,
// adding each word's canonical spelling where a variant was typed.
function expandToCandidateQueries(term) {
  const words = term.split(/\s+/).filter((w) => w.length > 1);
  const queries = [];
  for (const w of words) {
    queries.push(w);
    const alias = SPELLING_ALIASES[w.toLowerCase()];
    if (alias) queries.push(alias);
  }
  return queries;
}

// De-duplicate recipe lists by meal ID, preserving first-seen order.
const dedupeMeals = (list) => [...new Map(list.map((m) => [m.idMeal, m])).values()];

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function useStoredState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed instanceof Array ? new Set(parsed) : parsed;
      }
    } catch { /* ignore corrupt storage */ }
    return initial;
  });
  useEffect(() => {
    try {
      const toStore = state instanceof Set ? [...state] : state;
      if (toStore.size === 0 && !Array.isArray(toStore)) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(toStore));
    } catch { /* storage unavailable */ }
  }, [key, state]);
  return [state, setState];
}

function SearchBar({ query, setQuery, mode, setMode, onCommit }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ember-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onCommit(); }}
          placeholder={mode === "ingredient" ? "Search by an ingredient — garlic, chicken, lemon..." : "Search a dish — e.g. curry, tacos, carbonara..."}
          className="w-full bg-white border border-ember-200 rounded-lg py-2.5 pl-10 pr-10 text-sm text-ink placeholder-ember-400/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-400 transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ember-400 hover:text-ink-soft"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center bg-white border border-ember-100 rounded-lg p-1 shadow-sm">
        {["name", "ingredient"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              mode === m ? "bg-ember-600 text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {m === "name" ? "Dish" : "Ingredient"}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ meal, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <div className="bg-white border border-ember-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-ember-300 transition-all">
      <div className="relative aspect-video cursor-pointer" onClick={() => onOpen(meal)}>
        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal.idMeal); }}
          className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur p-1.5 rounded-md shadow-sm text-ink-soft hover:text-ember-600 transition"
          aria-label="Toggle favorite"
        >
          {isFavorite ? <BookmarkCheck className="w-4 h-4 text-ember-600" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-3.5 cursor-pointer" onClick={() => onOpen(meal)}>
        <h3 className="text-sm font-semibold text-ink leading-snug mb-1">{meal.strMeal}</h3>
        <p className="text-xs text-ink-soft">{meal.strArea || "International"} &middot; {meal.strCategory || "Dish"}</p>
      </div>
    </div>
  );
}

function DetailModal({ meal, onClose }) {
  if (!meal) return null;
  return <DetailContent meal={meal} onClose={onClose} />;
}

function DetailContent({ meal, onClose }) {
  const [checkedIngs, setCheckedIngs] = useState(new Set());

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push({ measure: measure?.trim() || "", name: ing.trim() });
  }

  // ThemeDB gives one long paragraph of instructions; break it into steps at
  // sentence boundaries so it reads like a real recipe method.
  const steps = meal.strInstructions
    .replace(/\r/g, "")
    .replace(/^\s*\d+\.\s*/gm, "") // strip existing line numbers like "1." so they don't create empty steps
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleIng = (i) =>
    setCheckedIngs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const done = checkedIngs.size;

  return (
    <div className="fixed inset-0 bg-[#2b241c]/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-ember-100 rounded-2xl shadow-xl max-w-3xl w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-52 object-cover rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white shadow-sm p-1.5 rounded-md text-ink-soft hover:text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-ink leading-snug">{meal.strMeal}</h2>
              <p className="text-xs font-medium text-ember-600 mt-1">{meal.strCategory} &middot; {meal.strArea || "International"}</p>
            </div>
            {meal.strTags && (
              <div className="flex flex-wrap gap-1.5">
                {meal.strTags.split(",").slice(0, 4).map((t) => (
                  <span key={t} className="text-[11px] bg-ember-50 text-ember-700 px-2 py-0.5 rounded-full">{t.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-[5fr_7fr]">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink uppercase tracking-wide">
                  <ListChecks className="w-4 h-4 text-ember-600" /> Ingredients
                </h4>
                <span className="text-xs font-medium text-ember-700 bg-ember-50 px-2 py-0.5 rounded-full">
                  {done}/{ingredients.length}
                </span>
              </div>
              {ingredients.length > 0 && (
                <div className="w-full h-1 bg-ember-100 rounded-full mb-3">
                  <div
                    className="h-1 bg-ember-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((done / ingredients.length) * 100)}%` }}
                  />
                </div>
              )}
              <ul className="bg-cream rounded-xl p-3.5 space-y-1">
                {ingredients.map((ing, i) => {
                  const isDone = checkedIngs.has(i);
                  return (
                    <li key={i}>
                      <label className="flex items-center gap-2.5 cursor-pointer py-1 group">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleIng(i)}
                          className="w-4 h-4 rounded accent-ember-600 shrink-0"
                        />
                        <span className={`text-sm ${isDone ? "text-ink-soft line-through" : "text-ink"}`}>
                          {ing.measure && <span className="font-medium">{ing.measure}</span>} {ing.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink uppercase tracking-wide mb-3">
                <ListOrdered className="w-4 h-4 text-ember-600" /> Method &middot; {steps.length} step{steps.length === 1 ? "" : "s"}
              </h4>
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-ember-600 text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-ink-soft leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {(meal.strSource || meal.strYoutube) && (
            <div className="mt-6 pt-4 border-t border-ember-100 flex flex-wrap gap-4 text-sm">
              {meal.strSource && (
                <a href={meal.strSource} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ember-700 hover:text-ember-800 font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Original recipe
                </a>
              )}
              {meal.strYoutube && (
                <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ember-700 hover:text-ember-800 font-medium">
                  <Play className="w-3.5 h-3.5" /> Watch the video
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-ember-100 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video bg-ember-100/70" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-ember-100/70 rounded w-3/4" />
        <div className="h-3 bg-ember-100/70 rounded w-1/2" />
      </div>
    </div>
  );
}

function DailyPick({ meal, onOpen }) {
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="bg-gradient-to-br from-ember-500 to-ember-800 rounded-2xl overflow-hidden shadow-lg mb-7">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-2/5 cursor-pointer" onClick={() => onOpen(meal)}>
          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-44 sm:h-full object-cover" />
        </div>
        <div className="flex-1 p-5 sm:p-6 text-white flex flex-col">
          <div className="flex items-center gap-1.5 text-ember-100 text-xs font-medium uppercase tracking-widest mb-2">
            <Flame className="w-3.5 h-3.5" /> Chef's Pick
          </div>
          <p className="text-[11px] text-ember-200 mb-1">{dateLabel}</p>
          <h2 className="text-xl sm:text-2xl font-semibold leading-tight mb-2">{meal.strMeal}</h2>
          <p className="text-sm text-ember-100 mb-4">{meal.strArea || "International"} &middot; {meal.strCategory}</p>
          <p className="text-sm text-cream/90 leading-relaxed mb-4 line-clamp-3">{meal.strInstructions}</p>
          <button
            onClick={() => onOpen(meal)}
            className="mt-auto self-start flex items-center gap-2 bg-white text-ember-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-ember-50 transition"
          >
            <Utensils className="w-3.5 h-3.5" /> See the recipe
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecipeSearchApp() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("name");
  const debouncedQuery = useDebouncedValue(query, 450);
  const [meals, setMeals] = useState([]);
  const [status, setStatus] = useState("idle");
  const [favorites, setFavorites] = useStoredState("ember-kitchen:favorites", new Set());
  const [history, setHistory] = useStoredState("ember-kitchen:history", []);
  const [activeMeal, setActiveMeal] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCuisine, setActiveCuisine] = useState("");
  const [dailyPick] = useState(() => recipeOfTheDay());
  const abortRef = useRef(null);

  const runSearch = useCallback(async (term, searchMode) => {
    if (!term.trim()) {
      setMeals([]);
      setStatus("idle");
      return;
    }
    setActiveCuisine(""); // a typed search takes over from cuisine browsing
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      if (searchMode === "name") {
        // TheMealDB can't match multi-word phrases, so if the exact-name
        // search finds nothing we retry more broadly: first as an ingredient,
        // then as a handful of single-word name searches whose results we merge.
        const results = await searchByName(term, controller.signal);
        if (controller.signal.aborted) return;
        if (results.length) {
          setMeals(results);
          setStatus("success");
          return;
        }
        // filter.php only takes a single ingredient, so only try this for a
        // single-word term.
        if (!/\s/.test(term)) {
          try {
            const asIngredient = await searchByIngredient(term, controller.signal);
            if (controller.signal.aborted) return;
            if (asIngredient.length) {
              setMeals(asIngredient);
              setStatus("success");
              return;
            }
          } catch { /* ingredient fallback isn't required to succeed */ }
        }

        const queries = expandToCandidateQueries(term);
        if (queries.length) {
          const partials = await Promise.allSettled(
            queries.map((q) => searchByName(q, controller.signal))
          );
          if (controller.signal.aborted) return;
          const merged = [];
          for (const r of partials) {
            if (r.status === "fulfilled") merged.push(...r.value);
          }
          if (merged.length) {
            // Keep a stable, de-duplicated set of matches.
            setMeals(dedupeMeals(merged));
            setStatus("success");
            return;
          }
        }
        setMeals([]);
        setStatus("empty");
      } else {
        // Ingredient search: filter.php only accepts a single ingredient, so a
        // multi-word query becomes several single-ingredient searches merged.
        const ingredients = term.split(/[,\s]+/).filter(Boolean);
        if (ingredients.length === 1) {
          const results = await searchByIngredient(term, controller.signal);
          if (controller.signal.aborted) return;
          if (!results.length) {
            // The term isn't a known ingredient — maybe it's a dish name typed
            // in ingredient mode; retry it as a name search (with aliases).
            const queries = expandToCandidateQueries(term);
            const partials = await Promise.allSettled(
              queries.map((q) => searchByName(q, controller.signal))
            );
            if (controller.signal.aborted) return;
            const merged = [];
            for (const r of partials) {
              if (r.status === "fulfilled") merged.push(...r.value);
            }
            if (merged.length) {
              setMeals(dedupeMeals(merged));
              setStatus("success");
              return;
            }
            setMeals([]);
            setStatus("empty");
          } else {
            setMeals(results);
            setStatus("success");
          }
        } else {
          const partials = await Promise.allSettled(
            ingredients.map((ing) => searchByIngredient(ing, controller.signal))
          );
          if (controller.signal.aborted) return;
          const merged = [];
          for (const r of partials) {
            if (r.status === "fulfilled") merged.push(...r.value);
          }
          if (merged.length) {
            setMeals([...new Map(merged.map((m) => [m.idMeal, m])).values()]);
            setStatus("success");
          } else {
            setMeals([]);
            setStatus("empty");
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") setStatus("error");
    }
  }, []);

  useEffect(() => { runSearch(debouncedQuery, mode); }, [debouncedQuery, mode, runSearch]);

  // Ingredient-search results come back without full details; fill them in on demand.
  const openMeal = useCallback(async (meal) => {
    if (!meal.strInstructions) {
      const full = await lookupMeal(meal.idMeal);
      if (full) meal = full;
    }
    setActiveMeal(meal);
  }, []);

  const addToHistory = (term) => {
    if (!term.trim()) return;
    setHistory((prev) => [term.trim(), ...prev.filter((t) => t !== term.trim())].slice(0, 6));
  };

  const surpriseMe = useCallback(async () => {
    setStatus("loading");
    const random = await fetchRandom();
    if (random) {
      setQuery("");
      setActiveCategory("All");
      setActiveCuisine("");
      openMeal(random);
      setStatus("idle");
    } else {
      setStatus("error");
    }
  }, [openMeal]);

  const chooseCuisine = useCallback(async (label) => {
    if (activeCuisine === label) {
      // Toggling off returns to the last search (if any).
      setActiveCuisine("");
      runSearch(debouncedQuery, mode);
      return;
    }
    const entry = CUISINES.find((c) => c.label === label);
    if (!entry) return;
    setActiveCuisine(label);
    setActiveCategory("All");
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      const results = await searchByCuisine(entry.query, controller.signal);
      if (controller.signal.aborted) return;
      if (results.length) {
        setMeals(results);
        setStatus("success");
      } else {
        setMeals([]);
        setStatus("empty");
      }
    } catch (err) {
      if (err.name !== "AbortError") setStatus("error");
    }
  }, [activeCuisine, debouncedQuery, mode, runSearch]);

  const categories = ["All", ...new Set(meals.map((m) => m.strCategory).filter(Boolean))];
  const visibleMeals = (
    showFavoritesOnly
      ? meals.filter((m) => favorites.has(m.idMeal))
      : meals
  ).filter((m) => activeCategory === "All" || m.strCategory === activeCategory);

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Full-width sticky control bar: brand on the left, search + actions on the right. */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-ember-100/70">
        <div className="w-full px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <CookingPot className="shrink-0 text-ember-600" size={30} strokeWidth={1.75} />
            <div className="leading-tight">
              <h1 className="text-base sm:text-lg font-semibold text-ink">The Ember Kitchen</h1>
              <p className="hidden sm:block text-ink-soft text-[9px]">Search, explore and save your favorites</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:ml-auto sm:max-w-xl min-w-0">
            <div className="flex-1 min-w-0"><SearchBar query={query} setQuery={setQuery} mode={mode} setMode={setMode} onCommit={() => addToHistory(query)} /></div>
            <button
              onClick={surpriseMe}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg border border-ember-100 bg-white text-sm font-medium text-ink-soft shadow-sm hover:border-ember-300 transition shrink-0"
              title="Get a random recipe"
            >
              <Dices className="w-3.5 h-3.5" /><span className="hidden md:inline">Surprise me</span>
            </button>
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg border text-sm font-medium shadow-sm transition shrink-0 ${
                showFavoritesOnly
                  ? "bg-ember-600 border-ember-600 text-white"
                  : "bg-white border-ember-100 text-ink-soft hover:border-ember-300"
              }`}
              title="Toggle favorites"
            >
              <Bookmark className="w-3.5 h-3.5" /><span className="hidden md:inline">Favorites ({favorites.size})</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-6">
        <DailyPick meal={dailyPick} onOpen={openMeal} />

        <div className="mb-4 flex items-center gap-2 flex-wrap text-xs">
          <span className="flex items-center gap-1.5 text-ink-soft font-medium"><Globe className="w-3.5 h-3.5 text-ember-400" /> Cuisine</span>
          {CUISINES.map((c) => (
            <button
              key={c.label}
              onClick={() => chooseCuisine(c.label)}
              className={`rounded-full px-3 py-1 border transition ${
                activeCuisine === c.label
                  ? "bg-ember-600 text-white border-ember-600"
                  : "bg-white text-ink-soft border-ember-100 hover:border-ember-300 hover:text-ember-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap text-xs text-ink-soft">
            <History className="w-3.5 h-3.5" />
            {history.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="bg-white border border-ember-100 rounded-full px-3 py-1 text-ink-soft hover:border-ember-300 hover:text-ember-600 transition"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {status === "success" && categories.length > 1 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap text-xs">
            <Tag className="w-3.5 h-3.5 text-ember-400" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 border transition ${
                  activeCategory === cat
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-ink-soft border-ember-100 hover:border-ember-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {status === "loading" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {status === "error" && (
          <div className="bg-white border border-ember-100 rounded-xl p-5 text-sm text-ink-soft shadow-sm">
            Something went wrong reaching the recipe API. Try searching again.
          </div>
        )}

        {status === "empty" && (
          <div className="text-center py-16 text-ink-soft text-sm">
            No {mode === "ingredient" ? "recipes with that ingredient" : "recipes"} for "{query}" — the recipe library is Western-leaning, so try a single word like "biryani" or "curry".
          </div>
        )}

        {status === "success" && (
          visibleMeals.length === 0 ? (
            <div className="text-center py-16 text-ink-soft text-sm">
              {showFavoritesOnly ? "No favorites in this search yet." : `No recipes in the "${activeCategory}" category.`}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleMeals.map((meal) => (
                <RecipeCard
                  key={meal.idMeal}
                  meal={meal}
                  isFavorite={favorites.has(meal.idMeal)}
                  onToggleFavorite={(id) =>
                    setFavorites((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    })
                  }
                  onOpen={openMeal}
                />
              ))}
            </div>
          )
        )}

        {status === "idle" && !showFavoritesOnly && (
          <div className="text-center py-14 text-ember-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-3 text-ember-300" />
            Start typing to search — or hit <span className="font-medium text-ink-soft">Surprise me</span>.
          </div>
        )}
      </div>
      <DetailModal meal={activeMeal} onClose={() => setActiveMeal(null)} />
    </div>
  );
}
