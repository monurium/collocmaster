# CollocMaster 🎓

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)

**An intelligent spaced repetition (SM-2) learning companion for *Cambridge English Collocations in Use* (Intermediate & Advanced).**

*Master natural English multi-word chunks effortlessly through intelligent flashcards, cloze quizzes, matching games, and comprehensive curriculum exploration.*

</div>

---

## 🌟 Key Features

### 1. 🧠 Smart Flashcards with SM-2 Spaced Repetition
* **SuperMemo SM-2 Algorithm:** Calculates optimal review intervals based on your recall accuracy (`Again`, `Hard`, `Good`, `Easy`).
* **Active Cloze Recall:** Type the missing collocation in context with instant feedback and keyboard shortcuts (`1`, `2`, `3`, `4`).
* **Educational Error Breakdown:** When you make a mistake, CollocMaster shows why it was incorrect and displays real common learner pitfalls from the Cambridge Learner Corpus.
* **Active Output Practice:** Expandable writing box allows you to create your own sentence with immediate automated detection.
* **Register Awareness:** Interactive context question trains you on where to use each phrase (*Everyday Conversation*, *Work / Academic*, *Formal Writing*).
* **Audio Pronunciation:** Integrated Web Speech API with adjustable speech speed (`0.6×` to `1.2×`) and optional auto-play.
* **Optional Turkish Reference:** Seamless toggle (`🇹🇷 Show TR` / `Hide TR`) for Turkish learners while keeping the primary interface 100% in immersive English.

### 2. 📝 Contextual Sentence Quizzes
* **Multiple-Choice Cloze Tests:** Practice 10-question quick quiz sessions drawn from your chosen units.
* **Sanitized Authentic Distractors:** Distractors are intelligently parsed from real learner errors or matching curriculum collocations, guaranteeing clean English options with zero clutter.
* **Multi-Unit Selector:** Select single or multiple units (e.g. Units 1, 2, and 3 together) to customize your practice scope.

### 3. 🧩 Collocation Match Game
* **Two-Column Chunk Connector:** Connect verbs/adjectives on the left with their natural noun/adverb partners on the right.
* **Permissive Semantic Matching:** Advanced matching engine prevents false mismatches when shared words appear on the board (e.g. `bitterly cold` vs `heavy cold` or `make an effort` vs `make a mistake`).
* **Combo Multiplier & Confetti:** Fast-paced gamified drills with timer, moves counter, combo streaks, and celebratory animations.

### 4. 📚 Cambridge Curriculum Units (1 – 60)
* **Comprehensive Syllabus:** All 60 units from *Cambridge English Collocations in Use* categorized into intuitive thematic clusters:
  * *Basics & Types* (Units 1–6)
  * *Verbs & Adverbs* (Units 7–16)
  * *Everyday Life* (Units 17–28)
  * *Work & Academic* (Units 29–42)
  * *Concepts & Functions* (Units 43–60)
* **Multi-Unit Selection:** Combine any combination of units across flashcard study, quizzes, and match games.
* **Unit Inspector:** Deep-dive into all collocations within a unit with example sentences, common mistakes, and audio pronunciation.

### 5. 🔍 Collocation Library & Search
* **Rich Corpus:** Over 640 curated core collocations enriched with CEFR level (`B1` to `C2`), 3,200+ contextual examples, collocations types, and synonyms.
* **Search with Turkish Keyboard Normalization:** Seamlessly finds English collocations even if typed on Turkish keyboard layouts (e.g. `ı`/`i`, `ğ`/`g`).
* **Multi-Facet Filters:** Filter by Level, Domain, Grammatical Type, and SRS Status (`Due`, `Learning`, `Mastered`, `Unseen`).
* **Custom Collocations:** Add your own collocations from personal reading notes with custom example sentences and unit mappings.

### 6. 📊 Progress Tracking & Data Sovereignty
* **30-Day Activity Heatmap:** GitHub-style daily review visualization.
* **Daily Goal Tracker:** Set customizable daily goals (5, 10, 15, 20, 30 cards) with visual progress meters.
* **100% Client-Side Privacy:** All review logs and intervals are stored in browser `localStorage`.
* **JSON Backup & Restore:** Export and import your entire progress with one click to transfer between computers or mobile devices.
* **PWA (Progressive Web App):** Installable on iOS (Safari Add to Home Screen) and Android/Chrome for a native app experience.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18 + TypeScript
* **State Management:** Zustand (with localStorage persistence)
* **Styling:** TailwindCSS + Custom CSS tokens (glassmorphism dark UI)
* **Animations:** Framer Motion + Canvas Confetti
* **Icons:** Lucide React
* **Build Tool:** Vite 5
* **Runtime / Package Manager:** Bun / npm

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.0+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/monurium/collocmaster.git
   cd collocmaster
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the local development server:**
   ```bash
   bun run dev
   # or
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   bun run build
   # or
   npm run build
   ```

---

## 📁 Project Structure

```
collocmaster/
├── public/                  # Static assets & PWA manifest icons
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AddCollocationModal.tsx  # Add custom collocation form
│   │   ├── AudioButton.tsx          # Web Speech TTS button
│   │   ├── Flashcard.tsx            # SM-2 active recall flashcard
│   │   ├── Heatmap.tsx              # 30-day activity heatmap
│   │   ├── InstallPwaPrompt.tsx     # PWA mobile install prompt
│   │   ├── MultiUnitModal.tsx       # Multi-unit selector modal
│   │   └── Navbar.tsx               # Top and mobile bottom navigation
│   ├── data/
│   │   └── seedData.ts              # Curated Cambridge corpus (640+ items)
│   ├── store/
│   │   └── useAppStore.ts           # Zustand store (SRS, logs, settings)
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   ├── audio.ts                 # TTS pronunciation & audio chimes
│   │   ├── mistakeParser.ts         # Distractor parsing & sanitization
│   │   ├── srsEngine.ts             # SuperMemo SM-2 interval algorithms
│   │   └── textHighlight.tsx        # Sentence highlighting & search normalization
│   ├── views/               # Route views
│   │   ├── Dashboard.tsx            # Hero, metrics, daily tip & modes
│   │   ├── Library.tsx              # Searchable collocation catalog
│   │   ├── MatchGame.tsx            # Collocation matching game
│   │   ├── QuizView.tsx             # Cloze sentence quiz
│   │   ├── Settings.tsx             # Preferences, data export/import, reset
│   │   ├── StudySession.tsx         # Active flashcard study queue
│   │   └── Units.tsx                # 60 curriculum units & explorer
│   ├── App.tsx              # Router and layout setup
│   └── main.tsx             # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📖 Pedagogical Background

CollocMaster is built on second language acquisition (SLA) principles (Nation 2001, Schmitt 2000, Boers 2013):
1. **Formulaic Sequences as Single Chunks:** Treating collocations as single multi-word units rather than isolated words drastically improves fluency and reduces processing load.
2. **Retrieval Practice:** Testing yourself via active recall and cloze production creates stronger memory traces than passive recognition.
3. **Spaced Repetition (SM-2):** Reviews are timed just before forgetting occurs, maximizing long-term retention efficiency.
4. **Error Discrimination:** Highlighting common L1 transfer errors (*e.g.* `make a mistake` vs `*do a mistake`) builds meta-linguistic awareness.

---

## 📄 License

MIT © 2026 CollocMaster. Based on the curriculum structure of *Cambridge English Collocations in Use* by Michael McCarthy and Felicity O'Dell.
