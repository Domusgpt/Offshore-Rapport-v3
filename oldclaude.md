# Offshore Rapport v3 - Project Setup & Deployment Guide (for claudecode agent)

## 1. Goal

The primary goal is to automate the setup of the **`Offshore-Rapport-v3`** static website project. This involves:
1.  Structuring existing code files from a specified source directory into the correct project layout, renaming artifacts from `v2` if necessary.
2.  Initializing a Git repository and committing the structured files.
3.  Creating a new repository on GitHub and pushing the initial commit.
4.  Deploying the static site using Fly.io via its CLI (`flyctl`).

## 2. Context & Current State

-   **Source Files:** A collection of HTML, CSS, JS, and JSON (`.json.txt`) files exist in a user-specified directory (e.g., `~/storage/shared/offshore-rapport-v0.3/`). These files represent the code generated previously (may contain "v2" references).
-   **Desired Outcome:** A fully structured project directory (`~/projects/Offshore-Rapport-v3/`) containing all necessary files, tracked by Git, mirrored on a new GitHub repository, and deployed as a static site on Fly.io.
-   **Environment:** Termux on Android.
-   **Key Files for Deployment:** `Dockerfile`, `nginx.conf`, and `fly.toml` are expected to be among the source files and are crucial for Fly.io deployment.
-   **Target Structure:**
    ```
    Offshore-Rapport-v3/  <-- Updated Name
    ├── css/
    │   ├── base/
    │   │   ├── _reset.css
    │   │   └── _typography.css
    │   ├── components/
    │   │   ├── buttons.css
    │   │   ├── cards.css
    │   │   └── navigation.css
    │   ├── layout.css
    │   ├── variables.css
    │   ├── animations.css
    │   └── main.css
    ├── data/
    │   ├── articles.json
    │   ├── authors.json
    │   └── categories.json
    ├── js/
    │   ├── dashboard/
    │   │   └── dashboard.js
    │   ├── main.js
    │   ├── data-loader.js
    │   ├── article-renderer.js
    │   ├── animation-manager.js
    │   ├── content-filter.js
    │   └── tag-filter.js
    ├── index.html
    ├── article.html
    ├── category.html
    ├── dashboard.html
    ├── Dockerfile
    ├── fly.toml
    ├── netlify.toml
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── claude.md # This file (updated)
    └── .gitignore
    ```

## 3. Prerequisites & Assumptions (Agent)

-   You are operating within a Termux shell environment.
-   Required command-line tools are installed and authenticated: `git`, `gh`, `flyctl`.
-   Standard shell utilities (`mkdir`, `mv`, `cd`, `cat`, `echo`, `ls`) are available.
-   The user will provide the exact path to the source directory.
-   The user has active GitHub and Fly.io accounts.

## 4. Step-by-Step Instructions (Agent Actions)

**Please execute these steps sequentially. Confirm paths and required inputs with the user where indicated.**

**Step 4.1: Define Paths & Create Directories**
   - Define `SOURCE_DIR`: **Ask the user for the exact path** (e.g., `~/storage/shared/offshore-rapport-v0.3`). *Verify this path exists.*
   - Define `PROJECT_DIR`: Set the target project path (e.g., `~/projects/Offshore-Rapport-v3`).
   - Create `PROJECT_DIR` and subdirectories:
     ```bash
     # (Agent executes)
     PROJECT_DIR="~/projects/Offshore-Rapport-v3" # Confirm with user if needed
     mkdir -p "${PROJECT_DIR}/css/base"
     mkdir -p "${PROJECT_DIR}/css/components"
     mkdir -p "${PROJECT_DIR}/data"
     mkdir -p "${PROJECT_DIR}/js/dashboard"
     echo "Created project directories in ${PROJECT_DIR}"
     ```

**Step 4.2: Move and Rename Files**
   - **Inform the user:** "Moving files and renaming where necessary (e.g., `.json.txt` -> `.json`, adjusting potential 'v2' references)."
   - Use `mv` commands for *each expected file*. Adapt source filenames based on what the user confirmed they downloaded.
   - **Handle Renaming Explicitly:**
     - `mv "${SOURCE_DIR}/authors.json.txt" "${PROJECT_DIR}/data/authors.json"`
     - `mv "${SOURCE_DIR}/catagories.json.txt" "${PROJECT_DIR}/data/categories.json"`
     - `mv "${SOURCE_DIR}/articles-json.txt" "${PROJECT_DIR}/data/articles.json"`
     - `mv "${SOURCE_DIR}/js-main.js" "${PROJECT_DIR}/js/main.js"`
     - `mv "${SOURCE_DIR}/*-jscontent-filter.js" "${PROJECT_DIR}/js/content-filter.js"`
     - *... (Explicit `mv` for all other JS, CSS, HTML, config files based on the target v3 structure)*
     - **Ensure `Dockerfile`, `fly.toml`, `nginx.conf`, `package.json`, etc., are moved.**
   - **Check for "v2" in moved filenames/paths if relevant and rename to "v3" if found and appropriate.** (This might be less common for filenames but check paths).
   - **Provide feedback:** List files moved or report errors.

**Step 4.3: Create `.gitignore`**
   - Navigate into the project directory: `cd "${PROJECT_DIR}"`
   - Create the `.gitignore` file (content same as before):
     ```bash
     # (Agent executes)
     cat << EOF > .gitignore
     # Node.js
     node_modules/
     # ... (rest of .gitignore content) ...
     EOF
     echo "Created .gitignore file."
     ```

**Step 4.4: Initialize Git & Commit**
   - Execute Git commands:
     ```bash
     # (Agent executes)
     git init
     git add .
     # Update commit message for v3
     git commit -m "Initial commit: Structure project files for v3"
     echo "Git repository initialized and initial v3 commit created."
     ```
   - Verify commit: `git log -1 --oneline`

**Step 4.5: Create and Push to GitHub Repository**
   - **Prompt User:** "Provide a name for the new GitHub repository (e.g., Offshore-Rapport-v3) and choose visibility."
   - Execute `gh repo create`:
     ```bash
     # (Agent executes, substituting user's choices)
     gh repo create Offshore-Rapport-v3 --public --source=. --remote=origin --push # Example for v3
     echo "Attempted to create GitHub repo 'Offshore-Rapport-v3' and push initial commit."
     ```
   - **Verify Remote:** `git remote -v` (Show output).

**Step 4.6: Deploy to Fly.io**
   - **Confirm Prerequisites:** `ls -l Dockerfile fly.toml`
   - **Launch App on Fly.io:**
     - **Prompt User:** "Fly.io needs an app name (suggesting `offshore-rapport-v3`) and region."
     - Execute `fly launch`:
       ```bash
       # (Agent executes)
       # Suggest offshore-rapport-v3 as app name
       fly launch --name YOUR_FLY_APP_NAME --region YOUR_CHOSEN_REGION --no-deploy --copy-config
       echo "Fly.io app configured."
       ```
   - **Deploy the App:**
     ```bash
     # (Agent executes)
     fly deploy
     ```
   - **Report Outcome:** Display the deployment URL or any errors.

## 5. Verification Steps (Agent)

-   Check `PROJECT_DIR` (`~/projects/Offshore-Rapport-v3/`) structure.
-   Run `git status` within `PROJECT_DIR`.
-   Run `git log -1 --oneline`.
-   Run `git remote -v`.
-   Report the Fly.io deployment URL.

## 6. Troubleshooting Notes (Agent)

-   (Same as before: check filenames, auth status, `flyctl` errors).

---

### 3. Revised Termux Command List (For User Execution) - Updated to v3

```bash
#!/bin/bash

# === Offshore Rapport v3 Setup Script for Termux ===

# --- Prerequisites (Run these manually first if needed) ---
# pkg update && pkg upgrade -y
# pkg install git nodejs gh flyctl -y
# termux-setup-storage
# gh auth login
# fly auth login
# ---------------------------------------------------------

echo "Starting Offshore Rapport v3 project setup..."
echo "=============================================="

# --- 1. Define Variables (USER: PLEASE EDIT THESE!) ---
# !!! IMPORTANT: Change this to the exact location of your downloaded files !!!
SOURCE_DIR="${HOME}/storage/shared/offshore-rapport-v0.3" # Source might still be named v0.3

# Define where you want the final project to live - NOW v3
PROJECT_NAME="Offshore-Rapport-v3" # <--- Updated Name
PROJECT_DIR="${HOME}/projects/${PROJECT_NAME}"

# --- 2. Verify Source Directory ---
echo "Checking source directory: ${SOURCE_DIR}"
if [ ! -d "${SOURCE_DIR}" ]; then
  echo "❌ ERROR: Source directory '${SOURCE_DIR}' not found."
  echo "Please edit the SOURCE_DIR variable in this script and run again."
  exit 1
fi
echo "✅ Source directory found."

# --- 3. Create Project Structure ---
echo "Creating project directories in '${PROJECT_DIR}'..." # <-- Updated Name
mkdir -p "${PROJECT_DIR}/css/base"
mkdir -p "${PROJECT_DIR}/css/components"
mkdir -p "${PROJECT_DIR}/data"
mkdir -p "${PROJECT_DIR}/js/dashboard"
echo "✅ Project directories created."

# --- 4. Move and Rename Files ---
echo "Moving and renaming files into v3 structure..." # <-- Updated message

# Helper function (same as before)
move_file() {
  local source_pattern="$1"
  local target_path="$2"
  local full_source_path="${SOURCE_DIR}/${source_pattern}"
  local full_target_path="${PROJECT_DIR}/${target_path}"
  local found_files=$(find "${SOURCE_DIR}" -maxdepth 1 -name "${source_pattern}" -print -quit)
  if [ -n "$found_files" ]; then
    echo "  Moving '${source_pattern}' -> '${target_path}'"
    mv -v "$found_files" "$full_target_path"
  else
    echo "  ⚠️ Warning: Source file pattern '${source_pattern}' not found in ${SOURCE_DIR}. Skipping."
  fi
}

# Data Files
move_file "authors.json.txt"      "data/authors.json"
move_file "catagories.json.txt"   "data/categories.json"
move_file "articles-json.txt"     "data/articles.json"

# JS Files
move_file "dashboard.js"          "js/dashboard/dashboard.js"
move_file "tag-filter.js"         "js/tag-filter.js"
move_file "*-jscontent-filter.js" "js/content-filter.js"
move_file "animation-manager.js"  "js/animation-manager.js"
move_file "article-renderer.js"   "js/article-renderer.js"
move_file "js-main.js"            "js/main.js"
move_file "data-loader.js"        "js/data-loader.js"

# CSS Files
move_file "main.css"              "css/main.css"
move_file "variables.css"         "css/variables.css"
move_file "_reset.css"            "css/base/_reset.css"
move_file "_typography.css"       "css/base/_typography.css"
move_file "layout.css"            "css/layout.css"
move_file "animations.css"        "css/animations.css"
move_file "buttons.css"           "css/components/buttons.css"
move_file "cards.css"             "css/components/cards.css"
move_file "navigation.css"        "css/components/navigation.css"

# HTML Files
move_file "index.html"            "index.html"
move_file "article.html"          "article.html"
move_file "category.html"         "category.html"
move_file "dashboard.html"        "dashboard.html"

# Config/Other Files
move_file "Dockerfile"            "Dockerfile"
move_file "fly.toml"              "fly.toml"
move_file "nginx.conf"            "nginx.conf"
move_file "netlify.toml"          "netlify.toml"
move_file "package.json"          "package.json"
move_file "package-lock.json"     "package-lock.json"
move_file "README.md"             "README.md"
move_file "CLAUDE.md"             "claude.md" # Move the instructions file too

echo "✅ File moving process complete. Check warnings above."

# --- 5. Create .gitignore ---
echo "Creating .gitignore file..."
cd "${PROJECT_DIR}" || { echo "❌ ERROR: Failed to change directory to ${PROJECT_DIR}"; exit 1; }
# Create .gitignore content (same as before)
cat << EOF > .gitignore
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Environment variables
.env
.env.*
!.env.example

# OS generated files
.DS_Store
Thumbs.db

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF
echo "✅ .gitignore created."

# --- 6. Initialize Git & Push to GitHub ---
echo "Initializing Git repository..."
if [ -d ".git" ]; then
  echo "ℹ️ Git repository already initialized."
else
  git init || { echo "❌ ERROR: Failed to initialize Git."; exit 1; }
fi
git add .
echo "Creating initial v3 commit..." # <-- Updated message
git commit -m "Initial commit: Structure project files for v3"
echo "✅ Initial v3 commit created."
git status

echo "---------------------------------------------"
echo "Setting up GitHub repository..."
echo "Recommended repository name: ${PROJECT_NAME}" # <-- Updated Name
echo "---------------------------------------------"
gh repo create --source=. --remote=origin --push # gh will prompt for name/visibility

echo "Verifying GitHub remote connection..."
git remote -v
echo "✅ If 'origin' fetch/push URLs are shown above, GitHub setup is likely complete."

# --- 7. Deploy with Fly.io ---
echo "---------------------------------------------"
echo "Setting up Fly.io application..."
echo "Recommend app name: offshore-rapport-v3" # <-- Updated Name
echo "---------------------------------------------"
if [ ! -f "fly.toml" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ ERROR: fly.toml or Dockerfile not found. Cannot deploy."
    exit 1
fi
fly launch --no-deploy --copy-config
echo "Deploying application to Fly.io..."
fly deploy

# --- 8. Completion ---
echo "=============================================="
echo "✅ Project Setup (v3) and Deployment Attempt Complete!" # <-- Updated message
echo "Project Location: ${PROJECT_DIR}"
echo "Check GitHub for your new repository."
echo "Check the Fly.io deployment output above for your live URL."
echo ""
echo "Next Steps (Standard Workflow):"
echo "1. cd ${PROJECT_DIR}"
echo "2. Make code changes."
echo "3. git add ."
echo "4. git commit -m \"Your changes\""
echo "5. git push origin main" # Or your default branch
echo "6. fly deploy"
echo "=============================================="