# 🌍 EARTH — Cinematic 3D Interactive Web Experience

A photorealistic, cinematic 3D Earth experience built with **Three.js**, **custom GLSL shaders**, and **Vite**. Features scroll-driven orbital camera transitions, procedural atmospheric Rayleigh scattering, dynamic golden night city lights, interactive 3D dossier modal, and responsive mobile-first glassmorphism UI.

---

## 🚀 How to Run from GitHub

You can run this project in two ways:
1. **[Run Locally on your Computer](#1-run-locally-on-your-computer)** (Development / Editing)
2. **[Deploy & Run Live on GitHub Pages](#2-deploy--run-live-on-github-pages-free-hosting)** (Live on the web for anyone to visit)

---

### 1. Run Locally on your Computer

#### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
- [Git](https://git-scm.com/) installed (optional, or download as ZIP).

#### Steps

1. **Clone the repository** (or download and extract the ZIP):
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   ```

2. **Navigate into the project folder**:
   ```bash
   cd YOUR_REPOSITORY_NAME
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   Click or open the local address displayed in the terminal:
   ```
   http://localhost:5173/
   ```

> **Tip (Windows)**: You can also double-click `start.bat` in the project root to install dependencies and launch the server automatically.

---

### 2. Deploy & Run Live on GitHub Pages (Free Hosting)

This repository includes a pre-configured **GitHub Actions workflow** (`.github/workflows/deploy.yml`) that automatically builds and deploys your website every time you push code to `main` or `master`.

#### 1-Minute Setup in GitHub:
1. Push your code to your GitHub repository (see [How to Push to GitHub](#3-how-to-push-your-code-to-github)).
2. On GitHub, go to your repository page and click **Settings** (top tab).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** > **Source**, select:
   👉 **`GitHub Actions`** (do *not* select "Deploy from a branch").
5. Go to the **Actions** tab in your repository: you will see the `Deploy to GitHub Pages` workflow running automatically!
6. Once finished (about 1 minute), your live website URL will be displayed:
   ```
   https://<your-username>.github.io/<repository-name>/
   ```

---

### 3. How to Push Your Code to GitHub

#### Option A: Using GitHub Desktop (Easiest - No Command Line)
1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Open GitHub Desktop and choose **File > Add Local Repository...**.
3. Select this project folder (`animation website`) and click **Add Repository** (or **Create a Repository** if prompted).
4. Click **Publish repository** to upload it directly to your GitHub account.

#### Option B: Using Git Command Line
In PowerShell or Terminal within this project directory:
```bash
# 1. Initialize git repository
git init

# 2. Add all files (respects .gitignore)
git add .

# 3. Create your first commit
git commit -m "Initial commit: Cinematic Earth 3D experience"

# 4. Set default branch to main
git branch -M main

# 5. Connect to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 🛠️ Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles production-ready bundle into `dist/` with relative asset paths (`base: './'`). |
| `npm run preview` | Runs local HTTP server to preview the compiled `dist/` production build. |

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages CI/CD workflow
├── public/                   # Static textures & audio assets
│   ├── earth_clouds_4096.jpg # Cloud map
│   ├── earth_day_4096.jpg    # High-resolution day map
│   ├── earth_night_4096.jpg  # City lights night map
│   ├── earth_normal_4096.jpg # Surface elevation normal map
│   └── space_bg.png          # High-depth starry skybox
├── src/
│   ├── audio/
│   │   └── SoundManager.js   # Web Audio API ambient spatial sound synthesis
│   ├── engine/
│   │   └── EarthEngine.js    # Three.js scene, camera choreography, & interaction
│   ├── shaders/
│   │   └── earthShaders.js   # Custom GLSL shaders (Rayleigh atmosphere & terrain)
│   ├── main.js               # Application orchestration & UI controller
│   └── style.css             # Glassmorphism UI, buttons, and animations
├── index.html                # Main HTML layout & modal dossiers
├── package.json              # Project dependencies & scripts
├── vite.config.js            # Vite configuration with relative base path for GitHub Pages
└── README.md                 # Project documentation
```
