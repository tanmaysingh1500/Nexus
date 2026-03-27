# GitHub Publication Guide

Use this checklist to publish Nexus as a clean public repository.

## 1) Final Safety Check

- Confirm no secrets are present in tracked files.
- Confirm temporary artifacts are ignored (`.playwright-mcp/`, `.next/`, virtual environments).
- Confirm the root README is current and accurate.

## 2) Create a Fresh Git History

Run from the project root (`Nexus/`):

```powershell
# Remove old git metadata/history from cloned source
Remove-Item -Recurse -Force .git

# Initialize a new repository
git init
git branch -M main

# Stage and commit
git add .
git commit -m "chore: initial public release"
```

## 3) Create a Public Repository on GitHub

1. In GitHub, click **New repository**.
2. Repository name: `nexus` (or your preferred name).
3. Visibility: **Public**.
4. Do NOT initialize with README, .gitignore, or license (already in local project).
5. Click **Create repository**.

## 4) Connect and Push

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 5) Optional: Add License

Add a license file before or after first push (for example, MIT).

## 6) Optional: Protect Main Branch

In GitHub repository settings:

- Enable branch protection on `main`
- Require pull request reviews for changes
- Require status checks before merge
