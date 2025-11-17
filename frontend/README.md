# LearnTwin - EduDataHack Cyprus 2024

**Post-class reflection tool for personalized learning insights**

LearnTwin helps teachers understand their students' learning patterns by collecting post-class feedback and generating AI-powered recommendations.

---

## 🚀 Quick Start

### Prerequisites

Make sure you have **Node.js** installed (v16 or higher):
- Download from: https://nodejs.org/

Check if you have it:
```bash
node --version
npm --version
```

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd learntwin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:5173
```
(If port 5173 is taken, Vite will use 5174, 5175, etc.)

---

## 📱 How to Use

### For Students (Post-Class Reflection)

1. Navigate to: `http://localhost:5173/#/s/1234` (or any session code)
2. Enter your name
3. Select session number (1 or 2)
4. Tap feedback buttons to reflect on the class:
   - ✋ **Stuck** - Moments you felt confused
   - ✅ **Got it** - Moments you understood clearly
   - ⏸️ **Pause** - Times you needed a break
   - 💡 **Example?** - Times you wanted more examples
5. Set your overall confidence (1-5)
6. Submit

### For Teachers (Dashboard)

1. Navigate to: `http://localhost:5173/#/d/1234` (or any session code)
2. View class overview with all students
3. Toggle between **Session 1**, **Session 2**, or **Compare** mode
4. Click any student card to see:
   - Detailed session data
   - AI-generated insights
   - Progress over time

---

## 🎯 Demo URLs

- **Home:** http://localhost:5173/
- **Student View:** http://localhost:5173/#/s/1234
- **Teacher Dashboard:** http://localhost:5173/#/d/1234

The dashboard includes 6 mock students with pre-filled data for demo purposes.

---

## 📂 Project Structure

```
learntwin/
├── src/
│   ├── App.jsx              # Main router
│   ├── StudentView.jsx      # Student reflection form
│   ├── DashboardView.jsx    # Teacher dashboard
│   ├── mockData.js          # Sample student data
│   └── index.css            # All styling
├── public/
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Available Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Tech Stack

- **React** 18.3.1 - UI framework
- **Vite** 7.2.2 - Build tool
- **Plain CSS** - No framework dependencies
- **Hash-based routing** - Simple client-side routing

---

## 📊 Features

✅ Post-class student reflection form
✅ Teacher dashboard with class overview
✅ Session comparison (Session 1 vs Session 2)
✅ AI-generated personalized insights
✅ Privacy-first design (no PII required)
✅ Mobile responsive
✅ Works offline after initial load

---

## 🐛 Troubleshooting

### Port already in use
If you see "Port 5173 is in use", Vite will automatically try the next port (5174, 5175, etc.). Check the terminal output for the actual URL.

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser not updating
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Restart the dev server

---

## 👥 Team

**EduDataHack Cyprus 2024**
Project: LearnTwin - "Make understanding visible"

---

## 📄 License

Open source - MIT License

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

**Need help?** Check the terminal output for error messages or contact the team.
