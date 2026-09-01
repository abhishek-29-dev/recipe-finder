# The Ember Kitchen

A warm, artisan take on a recipe search app — built to practice the core fundamentals of React: components, props, state, and working with a public API.

## What it does

- **Chef's Pick of the Day** — a deterministic daily featured recipe (same dish all day, a new one tomorrow)
- **Search by dish or by ingredient** — toggle between name search and ingredient-based search (each uses a different TheMealDB endpoint)
- **Smart search fallbacks** — TheMealDB is Western-leaning and picky about spelling, so when a search comes up empty the app retries it as an ingredient search, then as word-by-word matches that are merged and de-duplicated, and finally against common spelling variants (so "biriyani" still finds Lamb Biryani)
- **Browse by cuisine** — a one-click strip of 15 cuisines (Indian, Italian, Thai, Japanese, …) that loads that region's recipes directly
- **Surprise me** — pulls a random recipe from TheMealDB in one click
- Debounced search input, so it doesn't fire a request on every keystroke
- A **sticky header bar** that keeps brand, search, and controls pinned while results scroll beneath
- Responsive card grid showing results with image, name, cuisine, and category
- **Category filter chips** — narrow any result set down to one category
- **Recent searches** — your last few searches persist as one-click chips
- Click a card to open a detail view with full ingredients, instructions, and tags
- Save recipes to a **favorites list that persists** across refreshes (localStorage), and filter to view just your favorites
- Loading skeletons while a search is in flight, and clear empty/error states

## Tech stack

- **React** (Vite)
- **[TheMealDB API](https://www.themealdb.com/api.php)** — free, public, no API key required
- **Tailwind CSS** for styling
- **lucide-react** for icons

## Running it locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in the terminal (usually `http://localhost:5173`).

## Live demo

   [https://recipe-finder-abhi-64da.vercel.app](https://recipe-finder-abhi-64da.vercel.app)