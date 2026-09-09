# Suresh Senanayake Physics Classes — Official Website & Brand

Official static website and brand assets for **Suresh Senanayake Physics Classes** (Gampaha, Sri Lanka).

Conducted in both **English Medium** and **Sinhala Medium** for G.C.E. Advanced Level (A/L) and Ordinary Level (O/L) students.

---

## 🌟 Features

- **Semantic HTML5 & Modern CSS:** Plain static files, no framework or build steps needed.
- **Bilingual Interface:** Working English ↔ Sinhala instant toggle with memory.
- **Mobile-First Responsive Design:** Optimized for smartphones, tablets, and desktop displays.
- **Client-Side Inquiry System:** Direct WhatsApp and mailto email generation.
- **Instant GitHub Pages Ready:** Deployable directly from repository root.

---

## 📂 Project Structure

```text
├── index.html           # Main single-page website
├── style.css            # Responsive CSS stylesheet
├── script.js            # Bilingual switcher, UI logic & dynamic CMS hydration
├── data/
│   └── content.json     # Single source of truth for site copy, timetable & classes
├── admin/
│   ├── index.html       # Serverless password-protected Admin Panel
│   ├── admin.css        # Dashboard styling & layout
│   └── admin.js         # GitHub REST API & ImgBB API controller
├── logo.png             # Horizontal vector logo
├── logo.svg             # Source vector logo
├── logo-light.svg       # Dark-background optimized logo
├── favicon.png          # 512x512 tab & mobile app icon
├── favicon.svg          # Vector favicon
├── desktop_preview.png  # Desktop screenshot
└── mobile_preview.png   # Mobile screenshot
```

---

## 🛠️ Serverless Admin CMS (`/admin/`)

The website features a **zero-server content management dashboard** located at `/admin/` that allows the teacher or administrator to update timetable schedules, add/edit/delete classes, upload photos, and modify bilingual English/Sinhala copy without touching source code or needing a backend database.

### 🔑 Security & Architecture
- **Direct GitHub REST API:** Updates are committed directly to `data/content.json` on the repository `main` branch via GitHub's API.
- **Client-Side Token Security:** Your GitHub Personal Access Token is stored strictly in browser temporary `sessionStorage` and is **never** committed to files or sent to third parties.
- **UTF-8 Safe Sinhala Encoding:** Base64 conversion uses `TextEncoder` byte streams, preventing corruption of Sinhala Unicode characters (`\u0D80`–`\u0DFF`).
- **Flyer & Photo Uploads:** Integrated with free [ImgBB API](https://api.imgbb.com/) to host images directly with one click.

### 🚀 How to Use the Admin Panel
1. Generate a GitHub Personal Access Token (PAT):
   - GitHub → **Settings** → **Developer Settings** → **Personal Access Tokens** → **Fine-grained tokens**.
   - Select repository `kanchu12345/class`.
   - Under **Repository permissions**, set **Contents** to *Access: Read and write*.
2. Open `https://kanchu12345.github.io/class/admin/` (or open `admin/index.html` locally).
3. Enter your token and click **Connect to GitHub CMS**.
4. Make changes to class schedules or website text.
5. Click **Commit & Publish to GitHub**. GitHub Pages will rebuild and deploy the site automatically in 1–2 minutes!

---

## 🚀 GitHub Pages Deployment

1. Go to **Settings** > **Pages** in this repository.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**. The website and admin panel will be live in ~1-2 minutes!

