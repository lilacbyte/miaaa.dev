# miaaa.dev

a basic personal landing page for me, has my interests, projects, and experiences in a json file so i can easily add, remove or edit entrees.

## running

```bash
cp .env.example .env
mkdir -p data
cp data-example/*.json data/
npm install
npm run dev
```

then open `http://localhost:3000`.

## customizing

- `data/projects.json`
    - add `"featured": true` to any project in `data/projects.json` to pin it to the top with a thumbtack icon.
- `data/links.json`
- `data/site.json`
- `public/img/*` (photos)
- `public/mus/*` (music)


