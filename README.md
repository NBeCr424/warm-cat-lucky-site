# Love Page

This is a static page for GitHub Pages.

## Local preview

Open `index.html` directly or run `serve.ps1`.

## Deploy to GitHub Pages

1. Login: `gh auth login`
2. Create and push repo:
   - `git add .`
   - `git commit -m "init love page"`
   - `gh repo create <repo-name> --public --source . --remote origin --push`
3. Enable Pages in repository settings (Deploy from branch `main` / root).

