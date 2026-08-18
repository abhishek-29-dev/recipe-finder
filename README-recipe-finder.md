# Recipe Finder

A recipe search app built to practice the core fundamentals of React — components, props, state, and working with a public API.

## What it does

- Search for recipes by dish name (e.g. "chicken", "pasta", "curry")
- Debounced search input, so it doesn't fire a request on every keystroke
- Responsive card grid showing results with image, name, cuisine, and category
- Click a card to open a detail view with full ingredients and instructions
- Save recipes to a favorites list and filter to view just your favorites
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

## What I'd add next

- Pagination or infinite scroll instead of returning all results from a single search
- Persist favorites to `localStorage` so they survive a page refresh
- Filter by category or cuisine in addition to search
- A proper 404 / offline state if the API is unreachable

## Live demo

[Add your deployed link here after pushing to Vercel or Netlify]
