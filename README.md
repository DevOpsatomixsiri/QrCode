# 🎓 ARIA — College AI Chatbot (Python / Flask)

**ARIA** is an AI-powered chatbot built for **Greenfield Institute of Technology & Management (GITM)** — specifically designed for BCA & MCA students. Built with Python Flask + Anthropic Claude API.

---

## ✨ Features
- 🤖 AI responses powered by Claude (Anthropic)
- 🎓 College-specific knowledge (BCA/MCA syllabus, placements, facilities, fees)
- 💬 Multi-turn conversation memory
- 🌐 English + Hindi + Hinglish support
- 🎨 Dark premium animated UI
- ⚡ 8 quick-action chips for common questions
- 🔄 New Chat / Reset feature
- ☁️ Deploy-ready for Render (free hosting)

---

## 📁 Project Structure

```
college-ai-chatbot/
├── app.py                 ← Flask backend + Anthropic AI + System Prompt
├── requirements.txt       ← Python packages
├── Procfile               ← For Render/Railway cloud deploy
├── .env.example           ← API key template
├── .gitignore             ← Prevents .env from going to GitHub
├── templates/
│   └── index.html         ← Full frontend UI
└── README.md
```

---

## 🚀 Step-by-Step Local Setup

### 1. Extract & Open folder
```bash
cd college-ai-chatbot
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### 3. Install packages
```bash
pip install -r requirements.txt
```

### 4. Create .env file
Copy `.env.example` → rename to `.env`
Then open it and add your key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```
Get free API key: https://console.anthropic.com

### 5. Run!
```bash
python app.py
```
Open browser: **http://localhost:5000** ✅

---

## ☁️ Deploy on Render (Free Live URL)

1. Push this folder to GitHub (`.env` stays local — gitignore handles it)
2. Go to **https://render.com** → Sign up → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Runtime: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Environment Variables → Add:
   - Key: `ANTHROPIC_API_KEY` → Value: your key
6. Click **Deploy** → Get live URL in ~3 minutes 🚀

---

## ✏️ Customize for Your Actual College

Open `app.py` and edit the `SYSTEM_PROMPT` section:

```python
# Change these placeholders:
- Name: Greenfield Institute of Technology & Management  →  [Your College Name]
- Location: [Your City, Your State, India]              →  [Actual Location]
- Affiliation: [Your University Name]                   →  [Actual University]
- Principal: Dr. [Principal Name]                       →  [Actual Name]
- HOD: Prof. [HOD Name]                                 →  [Actual Name]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.x, Flask |
| AI Engine | Anthropic Claude API |
| Frontend | HTML5, CSS3, Vanilla JS |
| Fonts | Google Fonts (Outfit + Space Mono) |
| Deploy | Render.com / Railway.app |
| Process | Gunicorn (production server) |

---

Made with ❤️ for college project demonstration.
