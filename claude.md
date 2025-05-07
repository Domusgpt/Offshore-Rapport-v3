# Offshore Rapport v3 - Project Setup & Deployment Guide (for claudecode agent in Proot Ubuntu)

## 1. Goal

Automate the setup/resumption of the **`Offshore-Rapport-v3`** static website project *within a Proot-Distro Ubuntu environment*. This involves:
1.  Accessing and structuring existing code files into the correct project layout within the Ubuntu filesystem.
2.  Initializing/completing Git setup and committing the structured files.
3.  Creating/verifying a GitHub repository and pushing the code.
4.  Deploying the static site using Fly.io via `flyctl` *from within Ubuntu*.

## 2. Context & Current State

-   **Execution Environment:** Proot-Distro Ubuntu running inside Termux.
-   **Source Files:** Located on Android shared storage, accessible from Ubuntu (e.g., `/storage/shared/offshore-rapport-v0.3/`). Path needs user confirmation.
-   **Target Project Directory:** Should already exist within the Ubuntu filesystem (e.g., `/home/<user>/projects/Offshore-Rapport-v3`). Path needs user confirmation. Setup was previously interrupted.
-   **Desired Outcome:** A fully structured and consistent project directory within Ubuntu, tracked by Git, mirrored on GitHub, and deployed on Fly.io.
-   **Project Version:** v3. Rename artifacts if necessary.
-   **Key Files:** `Dockerfile`, `nginx.conf`, `fly.toml` are needed for deployment.

## 3. Prerequisites & Assumptions (Agent)

-   Operating within the Proot-Distro Ubuntu shell.
-   Required tools (`git`, `gh`, `flyctl`, `curl`, `apt`) are installable or installed *within Ubuntu*.
-   User has provided correct paths for source files (shared storage) and target project directory (Ubuntu filesystem).
-   User has active GitHub and Fly.io accounts and has authenticated `gh` and `flyctl` *within Ubuntu*.

## 4. Step-by-Step Instructions (Agent Actions - Execute within Ubuntu)

**Step 4.1: Confirm Environment & Paths**
   - Run `uname -a` and `whoami` to confirm Ubuntu context.
   - **Ask User:** "Please confirm the *exact path inside this Ubuntu environment* to your existing project directory (e.g., `/home/your_ubuntu_user/projects/Offshore-Rapport-v3`):"
   - Define `PROJECT_DIR` based on user input.
   - **Ask User:** "Please confirm the *exact path inside Ubuntu* where the original downloaded source files are located (e.g., `/storage/shared/offshore-rapport-v0.3`):"
   - Define `SOURCE_DIR` based on user input. *Note: This might only be needed if files are missing from `PROJECT_DIR` and need to be copied again.*
   - Navigate to the project directory: `cd "${PROJECT_DIR}"`

**Step 4.2: Assess & Clean File System**
   - Run `ls -la`. Show the user the current file structure.
   - Check for potential duplicates or misplaced files from the interruption.
   - **Ask User:** "Do you see any duplicate or incorrect files here that need cleanup? Please specify." (Wait for user input before deleting anything).
   - *If files are missing from `PROJECT_DIR` but exist in `SOURCE_DIR`, copy them over using `cp` commands, applying necessary renames (`.json.txt`->`.json`, etc.).*

**Step 4.3: Install/Verify Tools**
   - Check for required tools:
     ```bash
     # (Agent executes)
     command -v git >/dev/null 2>&1 || { echo "Git not found. Installing..."; sudo apt-get update && sudo apt-get install -y git; }
     command -v gh >/dev/null 2>&1 || { echo "GitHub CLI not found. Please install manually (see https://github.com/cli/cli/blob/trunk/docs/install_linux.md)"; } # Agent might not have sudo or ability to add repo easily
     command -v flyctl >/dev/null 2>&1 || { echo "Flyctl not found. Installing..."; curl -L https://fly.io/install.sh | sh; echo 'export FLYCTL_INSTALL="/home/$(whoami)/.fly"; export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> ~/.bashrc; source ~/.bashrc; } # Standard install script
     # Verify after install attempt
     command -v git && command -v gh && command -v flyctl || echo "Warning: Some tools might still be missing or need path configuration."
     ```
   - Ensure user is logged in: `gh auth status` and `fly auth status` (inform user to log in if needed).

**Step 4.4: Assess & Complete Git Setup**
   - Execute assessment commands:
     ```bash
     # (Agent executes)
     git status
     git log -n 1 --oneline # Check if commits exist
     git remote -v
     ```
   - Report the output to the user.
   - **Complete Commit:**
     - If untracked/modified files exist: `git add .`
     - If changes are staged or no commit exists: `git commit -m "Complete v3 setup / Fix interrupted state"` (adjust message if initial commit exists).

**Step 4.5: Complete GitHub Setup**
   - Analyze `git remote -v` output.
   - **If `origin` is correct:** `git push -u origin main` (or `master`).
   - **If `origin` is missing/wrong:**
     - Ask user for repo name (e.g., `Offshore-Rapport-v3`) & visibility.
     - Check if repo exists: `gh repo view <repo_name>`
     - Create if needed: `gh repo create <repo_name> --visibility --source=. --remote=origin`
     - Fix remote if needed: `git remote remove origin` (if wrong), `git remote add origin <correct_url>`
     - Push: `git push -u origin main` (or `master`).
   - Report outcome.

**Step 4.6: Complete Fly.io Deployment**
   - Ask user for the expected Fly App Name (e.g., `offshore-rapport-v3`).
   - Check status: `fly status -a <app_name>`
   - **If App Doesn't Exist:** Launch it: `fly launch --name <app_name> --region <user_region> --no-deploy --copy-config` (prompt for region).
   - **Deploy:** `fly deploy`
   - Report the final deployment URL or errors.

## 5. Verification Steps (Agent)

- Confirm structure in `PROJECT_DIR` within Ubuntu.
- Report `git status`, `git log -1 --oneline`, `git remote -v`.
- Report the Fly.io deployment URL.

## 6. Troubleshooting Notes (Agent)

- Ubuntu `apt` might require `sudo`.
- `gh` and `flyctl` installation/authentication might need user intervention.
- Shared storage paths (`/storage/shared/`) are common but verify with the user.
- Report specific errors from `git`, `gh`, `flyctl`.

---

### 3. Revised Termux Commands for User - Ubuntu Context

**Instructions for YOU:**

1.  **Start Ubuntu:** Open Termux and start your Ubuntu distro:
    ```bash
    proot-distro login ubuntu
    ```
2.  **Inside Ubuntu:** Run the following commands.

```bash
#!/bin/bash -e # Exit on error

# === Offshore Rapport v3 Setup Script (RUN INSIDE PROOT UBUNTU) ===

echo "Running inside Proot Ubuntu..."
echo "User: $(whoami)"
echo "Hostname: $(hostname)"
echo "=============================================="

# --- 1. Update Ubuntu & Install Tools (if needed) ---
echo "Updating package lists..."
sudo apt-get update

echo "Checking/Installing Git..."
sudo apt-get install -y git

echo "Checking GitHub CLI (gh)..."
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Attempting installation..."
    # Add instructions from https://github.com/cli/cli/blob/trunk/docs/install_linux.md
    # Example using curl/apt:
    curl -fsSL https://cli.github.com/packages/githubcli-archive-key.asc | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.asc
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.asc] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update
    sudo apt-get install gh -y
else
    echo "GitHub CLI is already installed."
fi
# Ensure logged in
echo "Please ensure you are logged into GitHub CLI ('gh auth login'). Run it now if needed."
gh auth status || gh auth login

echo "Checking Fly.io CLI (flyctl)..."
if ! command -v flyctl &> /dev/null; then
    echo "Flyctl not found. Attempting installation..."
    curl -L https://fly.io/install.sh | sh
    # Add flyctl to PATH for the current session and future sessions
    export FLYCTL_INSTALL="/home/$(whoami)/.fly" # Adjust if installed elsewhere
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
    # Add to .bashrc for persistence
    if ! grep -q 'FLYCTL_INSTALL' ~/.bashrc; then
      echo '' >> ~/.bashrc
      echo '# Fly.io CLI Path' >> ~/.bashrc
      echo 'export FLYCTL_INSTALL="/home/$(whoami)/.fly"' >> ~/.bashrc
      echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> ~/.bashrc
      echo "Added flyctl to ~/.bashrc path. Run 'source ~/.bashrc' or restart shell."
    fi
    echo "Flyctl installed to ~/.fly/bin. Added to PATH for this session."
else
    echo "Flyctl is already installed."
fi
# Ensure logged in
echo "Please ensure you are logged into Fly CLI ('fly auth login'). Run it now if needed."
fly auth status || fly auth login


# --- 2. Define Project Path (USER: CONFIRM/EDIT THIS!) ---
# This should be the path INSIDE your Ubuntu environment
PROJECT_DIR="/home/$(whoami)/projects/Offshore-Rapport-v3" # Adjust username if needed

echo "Using project directory: ${PROJECT_DIR}"

# --- 3. Navigate to Project Directory ---
if [ ! -d "${PROJECT_DIR}" ]; then
  echo "❌ ERROR: Project directory '${PROJECT_DIR}' not found inside Ubuntu."
  echo "Did the previous agent run complete the directory creation?"
  echo "Please create it or correct the path and run again."
  exit 1
fi
cd "${PROJECT_DIR}" || exit

echo "✅ Successfully changed to ${PROJECT_DIR}."
echo "Current directory: $(pwd)"
echo ""

# --- 4. Provide Prompt to Agent ---
echo "You are now ready to provide the '/init' prompt (Ubuntu Context version)"
echo "to the claudecode agent to assess and complete the setup."
echo ""
echo "Example path for original source files (if agent asks): /storage/shared/offshore-rapport-v0.3"
echo "Confirm this path is accessible before telling the agent."
echo "(You can check with: ls /storage/shared/)"

# (The rest of the steps - git, gh, fly - will be handled by the agent based on the prompt)