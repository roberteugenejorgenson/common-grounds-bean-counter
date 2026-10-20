# The Bean Counter

This is the app we build together on camera in Module 3. Clone it, run it, and follow along lesson by lesson.

## The story

Common Grounds Coffee is a small roaster with four cafés: Downtown, Uptown, Design District, and Bishop Arts. Every Sunday night the shift leads text their weekly numbers — drinks sold, revenue, loyalty signups, bags of beans — and the owner copies them into a spreadsheet by hand. You've been asked to replace that ritual with one simple internal tool: The Bean Counter.

## Running it

You'll need [Node.js](https://nodejs.org) 22 or newer.

```bash
git clone <this repo>
cd common-grounds-bean-counter
npm install
npm run dev
```

Then open http://localhost:3000.

## Heads up: the app is intentionally non-functional

It looks finished — there's a form, a table, stat tiles — but nothing behind it works yet. Submitting the form does nothing, the table stays empty, and the tiles read "–". That's on purpose. Bringing this app to life is exactly what the module teaches.

## Where the data lives

Eight weeks of Common Grounds history is already in the project, at `data/entries.csv`. The app can't see it yet.

One tip for later: don't open that file in Excel while the app is running. Excel locks the file and the app won't be able to write to it. Ask Claude Code to show you the file instead.
