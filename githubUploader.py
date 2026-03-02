import subprocess
import os
import time

# --- Configuration ---
REPO_PATH = r'C:\Coding\WebDevelopment\CCCCCVendorDB'  # Path to your local repo
NODE_APP_PATH = 'server.js'             # Your Node entry file
GIT_BRANCH = 'main'

def run_command(command, description):
    """Helper to run shell commands and handle errors."""
    print(f"--- {description} ---")
    try:
        # shell=True is used here for Windows compatibility and convenience
        result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error during {description}: {e.stderr}")
        return False
    return True

def automate_deployment():
    # Change directory to the repo
    os.chdir(REPO_PATH)

    # 1. STOP the Node.js server
    # On Windows: Taskkill by image name. On Linux/Mac: 'pkill node'
    
    if os.name == 'nt':
        run_command("taskkill /f /im node.exe", "Stopping Node.js (Windows)")
    else:
        run_command("pkill node", "Stopping Node.js (Linux/Mac)")


    run_command("git add .", "Staging changes")
    run_command('git commit -m "Automated update before restart"', "Committing changes")
    if run_command(f"git push origin {GIT_BRANCH}", "Pushing to GitHub"):
        print("✅ GitHub updated successfully.")
    else:
        print("❌ Push failed, but proceeding with restart...")

    # 3. RESTART the Node.js server
   # print("--- Restarting Node.js ---")
    # Use subprocess.Popen so the script doesn't hang waiting for the server to close
    #subprocess.Popen(["node", NODE_APP_PATH], shell=True)
    
    #print(f"🚀 Deployment complete! {NODE_APP_PATH} is running.")
    

if __name__ == "__main__":
    automate_deployment()
