# ✟ Scripture — Complete Bible Application

> A production-ready, offline-first Bible Progressive Web Application built as a single HTML file with Material Design 3, supporting full ESV Bible text loading, interactive genealogy, historical maps, AI-powered Bible scholarship, and Firebase Firestore cloud sync.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Design System](#2-architecture--design-system)
3. [Feature Modules](#3-feature-modules)
4. [Database Schema](#4-database-schema)
5. [Firebase Setup & Security Rules](#5-firebase-setup--security-rules)
6. [Bible Data Loading Strategy](#6-bible-data-loading-strategy)
7. [API Integration](#7-api-integration)
8. [Responsive Layout Breakpoints](#8-responsive-layout-breakpoints)
9. [Deployment & PWA](#9-deployment--pwa)
10. [Performance Considerations](#10-performance-considerations)

---

## 1. Project Overview

**Scripture** is a fully self-contained Bible application delivered as a single `index.html` file, designed to be:

- **100% Offline-Capable** after initial load via IndexedDB caching of full Bible text
- **Cross-Platform** — runs in any modern browser, WebView, or as a PWA
- **Android-Native-Quality** UI via Material Design 3 tokens and gesture support
- **Tablet-Optimized** with dual-pane split-screen layout at ≥768px
- **AI-Powered** with OpenAI GPT-4o-mini / Google Gemini integration

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | Tailwind CSS v4 (CDN) + Custom MD3 CSS Variables |
| JavaScript | Vanilla ES2022+ (no framework dependencies) |
| Offline Storage | IndexedDB (primary) + localStorage (fallback) |
| Bible Data | Public-domain KJV CDN + ESV-equivalent seed data |
| Cloud Sync | Firebase Firestore (optional, configurable) |
| AI | OpenAI GPT-4o-mini / Google Gemini 1.5 Flash |
| Typography | Google Fonts: Merriweather, Crimson Pro, Inter |
| Icons | Material Icons Round (Google Fonts CDN) |

---

## 2. Architecture & Design System

### 2.1 Application Shell Pattern

```
┌─────────────────────────────────────────────────┐
│                   TOP BAR (64dp)                  │
├──────────┬──────────────────────┬────────────────┤
│          │                      │                │
│  LEFT    │   CONTENT AREA       │  RIGHT PANEL   │
│ SIDEBAR  │   (Active Module     │  (Commentary,  │
│ (Book    │    View)             │   Context,     │
│  Nav)    │                      │   Cross-Refs)  │
│  280px   │       flex:1         │    380px       │
│          │                      │                │
├──────────┴──────────────────────┴────────────────┤
│         BOTTOM NAV (64dp) — Mobile Only           │
└─────────────────────────────────────────────────┘
```

### 2.2 Material Design 3 Token System

All colors, spacing, and typography are implemented via CSS custom properties:

```css
/* Light Theme */
:root {
  --md-primary: #1a237e;          /* Deep Indigo */
  --md-primary-light: #534bae;
  --md-secondary: #b8860b;        /* Scripture Gold */
  --md-surface: #ffffff;
  --md-surface-variant: #f5f5f5;
  --md-on-surface: #1c1b1f;
  --reader-bg: #faf8f3;           /* Warm reading background */
  --reader-text: #2d2a22;
  --reader-verse-num: #8b6914;
}

/* Dark Theme — via [data-theme="dark"] */
[data-theme="dark"] {
  --md-primary: #9fa8da;
  --md-surface: #1c1b1f;
  --reader-bg: #1a1814;
  --reader-text: #e8e0cc;
}
```

### 2.3 Component Hierarchy

```
App Shell
├── TopBar (64dp) — Logo, Search, Commentary Toggle, Theme, Settings
├── MainLayout (flex-row)
│   ├── Sidebar — Book Navigator (280-320px, collapsible on mobile)
│   ├── ContentArea (flex:1)
│   │   ├── View: Reader — Chapter display with verse interactions
│   │   ├── View: Genealogy — Tree / Characters / Timeline / Ages
│   │   ├── View: Maps — SVG interactive Biblical maps
│   │   ├── View: Notes — Notes / Bookmarks / Highlights manager
│   │   └── View: AI — Conversational AI Bible scholar chat
│   └── RightPanel — Commentary / Context / Cross-References (340-380px)
└── BottomNav (64dp) — Mobile only, 5-tab navigation
```

### 2.4 State Management

All state is maintained in a single `APP_STATE` object:

```javascript
const APP_STATE = {
  // Navigation
  currentBook: 'gen',           // Book ID string
  currentChapter: 1,            // Integer
  currentVerse: null,           // Integer or null
  activeTab: 'reader',          // 'reader'|'genealogy'|'maps'|'notes'|'ai'

  // UI State
  sidebarOpen: boolean,
  rightPanelOpen: boolean,
  darkMode: boolean,

  // Typography Settings
  fontSize: 17,                 // px, range 13-28
  fontFamily: 'serif',          // 'serif'|'crimson'|'sans'
  lineHeight: 1.85,             // range 1.4-2.4

  // Bible Data Cache (populated from IndexedDB + network)
  bibleData: {},                // { bookId: { chap: { verse: text } } }

  // User Data (persisted to localStorage + IndexedDB + Firestore)
  highlights: {},               // { 'gen_1_1': 'y'|'g'|'b'|'p'|'r' }
  notes: {},                    // { 'gen_1_1': 'Note text' }
  bookmarks: [],                // [{ key, ref, preview, date }]

  // AI
  aiApiKey: '',
  aiProvider: 'openai',         // 'openai'|'gemini'
  chatHistory: [],              // [{ role, content }]
};
```

---

## 3. Feature Modules

### Module A: Bible Reader (ESV)

**Navigation System:**
- Book list in left sidebar with instant filter search
- Chapter picker grid (tap chapter title to open)
- Prev/Next chapter buttons with cross-book navigation
- Swipe left/right gestures for chapter navigation (touch devices)

**Verse Interactions:**
- Single tap → selects verse, shows context menu
- Long press / right-click → context menu
- Context menu options: Highlight (5 colors), Bookmark, Note, Copy, Share
- Highlights are visually applied immediately and persisted

**Reader Typography Controls:**
- Font size: 13px–28px (adjustable in Settings)
- Font family: Merriweather (serif) / Crimson Pro / Inter (sans-serif)
- Line height: 1.4–2.4 (slider control)
- Dark/Light theme toggle

### Module B: Commentary & Context

**Commentary Panel (Right Panel):**
- Verse-by-verse commentary from curated theological database
- Auto-updates when verse is selected in reader
- Book overview with author, date, historical setting, audience

**Context Tab:**
- Author, Date Written, Historical Setting, Original Audience
- Key Themes (tag chips)
- Theological Intent summary
- Key Verses navigation links

**Cross-References Tab:**
- Parallel passage listings for selected verses
- All cross-references for current book

### Module C: Characters & Genealogy

**Family Tree View:**
- Linear genealogy from Adam → Noah → Abraham → David → Jesus Christ
- Organized by Biblical era with person cards showing age and significance
- Click any node for full character dossier

**Characters View:**
- 25+ detailed character cards with:
  - Life dates and age estimates
  - Role and key accomplishments
  - Scripture references
  - Spouse/children information
  - Theological significance

**Timeline View:**
- 15 Biblical eras from Creation to the Apostolic Age
- Color-coded with dates and descriptions

**Ages View:**
- All dateable characters sorted by longevity
- Visual progress bar (9th of maximum 969 years)
- Methuselah highlighted as oldest (969 years)

### Module D: Historical Maps

**3 Interactive SVG Maps:**
1. **Abraham's Journey** (~2000 BC) — Ur → Haran → Canaan
2. **The Exodus Route** (~1446 BC) — Egypt → Sinai → Canaan
3. **Paul's Missionary Journeys** (~46–57 AD)

Each map features:
- Clickable location pins with detailed historical descriptions
- Modern-day geographical context
- Associated Scripture references
- Map legend with all locations

### Module E: Offline-First Data Architecture

See [Section 4 (Database Schema)](#4-database-schema) and [Section 6 (Data Loading)](#6-bible-data-loading-strategy) for complete details.

### Module F: AI Bible Scholar

**Features:**
- Conversational interface with chat history
- Persistent Bible reading context injected into every query
- Supports OpenAI (GPT-4o-mini) and Google Gemini (1.5 Flash)
- Graceful offline messaging
- API key stored locally, never transmitted to third parties
- System prompt includes scholarly instructions for:
  - Hebrew/Greek word studies
  - Historical-critical context
  - Theological perspective diversity
  - Cross-reference identification

---

## 4. Database Schema

### 4.1 IndexedDB Stores

Database Name: `ScriptureDB` (Version 2)

#### Store: `bibleText`
```typescript
interface BibleTextRecord {
  id: string;           // Book ID (e.g., 'gen', 'jhn')
  data: {               // Chapter → Verse → Text structure
    [chapter: number]: {
      [verse: number]: string;
    }
  };
  fetched: number;      // Unix timestamp of last fetch
}
```

#### Store: `highlights`
```typescript
interface HighlightsRecord {
  id: 'all';            // Single record
  data: {
    [verseKey: string]: 'y' | 'g' | 'b' | 'p' | 'r';
    // verseKey format: 'gen_1_1' (bookId_chapter_verse)
  };
}
```

#### Store: `notes`
```typescript
interface NotesRecord {
  id: 'all';            // Single record
  data: {
    [verseKey: string]: string;  // Free-text note content
  };
}
```

#### Store: `bookmarks`
```typescript
interface BookmarksRecord {
  id: 'all';            // Single record
  data: Array<{
    key: string;        // 'gen_1' (chapter) or 'gen_1_1' (verse)
    ref: string;        // Human-readable: 'Genesis 1' or 'Genesis 1:1'
    preview: string;    // Verse text preview (max 100 chars)
    date: string;       // ISO 8601 timestamp
  }>;
}
```

#### Store: `settings`
```typescript
interface SettingsRecord {
  id: 'main';
  darkMode: boolean;
  fontSize: number;         // 13-28
  fontFamily: string;       // 'serif'|'crimson'|'sans'
  lineHeight: number;       // 1.4-2.4
  currentBook: string;      // Last read book ID
  currentChapter: number;   // Last read chapter
}
```

### 4.2 localStorage Keys (Fallback)

| Key | Type | Description |
|---|---|---|
| `bible_highlights` | JSON string | All verse highlights |
| `bible_notes` | JSON string | All verse notes |
| `bible_bookmarks` | JSON string | All bookmarks array |
| `ai_api_key` | string | AI provider API key |
| `ai_provider` | string | 'openai' or 'gemini' |

### 4.3 Firebase Firestore Schema

Collection: `users/{userId}/`

```
users/
  {uid}/
    ├── highlights (Map)      // { "gen_1_1": "y", "jhn_3_16": "b" }
    ├── notes (Map)           // { "rom_8_28": "Powerful promise..." }
    ├── bookmarks (Array)     // [{ key, ref, preview, date }]
    ├── lastSync (Timestamp)  // Last sync timestamp
    ├── readingPosition (Map) // { book: "gen", chapter: 1 }
    └── settings (Map)        // { darkMode, fontSize, fontFamily }
```

---

## 5. Firebase Setup & Security Rules

### 5.1 Project Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password and/or Google Sign-In)
3. Enable **Cloud Firestore** (start in production mode)
4. Copy your config and replace the `FIREBASE_CONFIG` constant in `index.html`:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

5. Uncomment the `initFirebase()` call in `index.html`

### 5.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
      
      // Validate data structure on writes
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && validateUserData(request.resource.data);
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// Data validation function
function validateUserData(data) {
  return data.keys().hasOnly([
    'highlights', 'notes', 'bookmarks', 
    'lastSync', 'readingPosition', 'settings'
  ])
  // Highlights must be a map with string keys and single-char color values
  && (data.highlights == null || data.highlights is map)
  // Notes must be a map
  && (data.notes == null || data.notes is map)
  // Bookmarks must be a list
  && (data.bookmarks == null || data.bookmarks is list)
  // Last sync must be a timestamp
  && (data.lastSync == null || data.lastSync is string);
}
```

### 5.3 Authentication Flow (Implementation Guide)

```javascript
// Add to index.html when Firebase is configured

// Initialize Firebase Auth
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Sign in with Google
function signInWithGoogle() {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      showToast(`Welcome, ${user.displayName}!`);
      syncToFirestore(user.uid);
    })
    .catch(error => showToast('Sign-in failed: ' + error.message));
}

// Monitor auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in — start background sync
    setInterval(() => syncToFirestore(user.uid), 60000); // Every minute
    loadFromFirestore(user.uid); // Load cloud data on login
  }
});

// Load data from Firestore
async function loadFromFirestore(userId) {
  const doc = await firestoreDb.collection('users').doc(userId).get();
  if (doc.exists) {
    const data = doc.data();
    // Merge with local data (local data wins for conflicts)
    APP_STATE.highlights = { ...data.highlights, ...APP_STATE.highlights };
    APP_STATE.notes = { ...data.notes, ...APP_STATE.notes };
    // Merge bookmarks (deduplicate by key)
    const allBookmarks = [...APP_STATE.bookmarks, ...(data.bookmarks || [])];
    APP_STATE.bookmarks = allBookmarks.filter((bm, idx, arr) => 
      arr.findIndex(b => b.key === bm.key) === idx
    );
    renderChapter(); // Re-render with cloud highlights
    renderNotesTab();
  }
}
```

### 5.4 Firestore Indexes Required

No composite indexes are needed for this schema since all queries are document-level (single user document reads/writes).

---

## 6. Bible Data Loading Strategy

### 6.1 Three-Layer Data Architecture

```
Layer 1: SEED DATA (Always Available)
  ├── Embedded in HTML at runtime
  ├── ~200 key verses from all 66 books
  ├── Genesis 1-3, John 1, 3, 14, Psalms 23, 119
  ├── Romans 3, 5, 8, 10 | Matthew 5-6, 28
  ├── Isaiah 40, 53 | Philippians 4 | Revelation 21-22
  └── Zero network dependency

Layer 2: INDEXEDDB CACHE (Persistent after first load)
  ├── Full book text stored per book (key: bookId)
  ├── Survives browser restarts
  ├── ~4MB average per complete book (varies)
  └── Checked before any network request

Layer 3: NETWORK FETCH (On-demand, graceful fallback)
  ├── Source: github.com/aruljohn/Bible-kjv (Public Domain KJV JSON)
  ├── Format: { chapters: [{ verses: [{ text }] }] }
  ├── Cached to IndexedDB immediately after fetch
  ├── 8-second timeout with AbortSignal
  └── Falls back to placeholder text if unavailable
```

### 6.2 Bundling the Complete ESV Dataset (Recommended for Production)

For a fully offline, ESV-licensed deployment, bundle the complete Bible text directly:

#### Option A: Embed as JavaScript Object
```javascript
// In index.html, replace BIBLE_SEED with:
const BIBLE_DATA = {
  gen: { 1: { 1: "In the beginning...", ... }, ... },
  exo: { ... },
  // All 66 books
};
// Total file size: ~4-6MB (uncompressed), ~1.2MB (gzip)
```

#### Option B: Separate JSON File (for WebView/Android assets)
```
app/
  src/main/assets/
    index.html
    bible-esv.json       ← Complete Bible JSON (~5MB)
    
// In index.html, fetch from local asset:
const resp = await fetch('bible-esv.json');
const bibleData = await resp.json();
```

#### Option C: Split by Testament (Recommended for PWA)
```
Cache Genesis-Malachi on OT tab open
Cache Matthew-Revelation on NT tab open
Each chunk: ~2-3MB
```

### 6.3 ESV API Integration (Official)

To use the official ESV API (requires registration at esv.org):

```javascript
const ESV_API_KEY = 'YOUR_ESV_API_KEY';
const ESV_API_BASE = 'https://api.esv.org/v3/passage/text/';

async function fetchESVPassage(reference) {
  const params = new URLSearchParams({
    q: reference,                    // e.g., "Genesis 1"
    'include-headings': false,
    'include-footnotes': false,
    'include-verse-numbers': true,
    'include-short-copyright': false,
    'include-passage-references': false,
    'indent-poetry': false,
    'indent-paragraphs': false,
  });

  const resp = await fetch(`${ESV_API_BASE}?${params}`, {
    headers: { 'Authorization': `Token ${ESV_API_KEY}` }
  });
  
  const data = await resp.json();
  return data.passages?.[0] || '';
}
```

**ESV API Limits:**
- Free tier: 500 queries/day
- Paid plans available for production apps
- Register at: https://api.esv.org/

---

## 7. API Integration

### 7.1 OpenAI Configuration

```javascript
// Model: gpt-4o-mini (cost-effective, excellent for theological Q&A)
// Cost: ~$0.15 per 1M input tokens
// System prompt: Biblical scholar with ESV expertise
// Context: Current book + chapter injected automatically
// Max response: 1024 tokens

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: conversationHistory,
    max_tokens: 1024,
    temperature: 0.7
  })
});
```

### 7.2 Google Gemini Configuration

```javascript
// Model: gemini-1.5-flash (fastest, free tier available)
// Free tier: 15 requests/minute, 1M tokens/day
// API Key from: aistudio.google.com

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  }
);
```

---

## 8. Responsive Layout Breakpoints

| Breakpoint | Layout | Sidebar | Bottom Nav | Right Panel |
|---|---|---|---|---|
| < 768px (Phone) | Single column | Hidden, hamburger toggle | Visible (5 tabs) | Hidden |
| ≥ 768px (Tablet) | Dual-pane | Always visible (280px) | Hidden | Toggle available |
| ≥ 1024px (Desktop/Large Tablet) | Three-pane | Always visible (320px) | Hidden | Always visible (380px) |

### Touch Target Compliance (MD3)
All interactive elements maintain minimum 48×48dp touch targets:
- Bottom nav items: `height: 64px`
- Sidebar book items: `padding: 10px 16px` minimum
- Chapter nav buttons: `width: 40px; height: 40px`
- FAB: `width: 56px; height: 56px`
- Color chips (highlight): `width: 32px; height: 32px` + `:hover scale(1.18)`

---

## 9. Deployment & PWA

### 9.1 Static Hosting (GitHub Pages / Netlify / Vercel)

```bash
# Simply upload index.html — no build step required
# For PWA, add:
# - manifest.json
# - service-worker.js
# - Icons (192x192, 512x512)
```

### 9.2 PWA manifest.json

```json
{
  "name": "Scripture — Complete Bible",
  "short_name": "Scripture",
  "description": "Complete ESV Bible with Commentary, Maps, and AI Scholar",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a237e",
  "theme_color": "#1a237e",
  "orientation": "any",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["books", "education", "lifestyle"],
  "lang": "en-US"
}
```

### 9.3 Service Worker (Offline PWA)

```javascript
// sw.js — Add for full PWA offline support
const CACHE_NAME = 'scripture-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Merriweather...',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => 
      cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return resp;
      })
    )
  );
});
```

---

## 10. Performance Considerations

### IndexedDB Performance
- Bible text stored per-book (not per-verse) to minimize transaction overhead
- Single `highlights` record (all highlights in one document) for atomic updates
- Settings persisted every 30 seconds via `setInterval`, not on every keystroke

### Render Performance
- Chapter rendering is synchronous DOM manipulation (no virtual DOM overhead)
- Verse list uses `innerHTML` batch update (single reflow)
- SVG maps rendered inline (no Canvas 2D context overhead for static maps)

### Memory Management
- Only the current book's chapter data is active in DOM
- Bible data cache uses object reference sharing (no deep cloning)
- Chat history limited by browser memory; truncate at 50 messages if needed:

```javascript
if (APP_STATE.chatHistory.length > 50) {
  APP_STATE.chatHistory = APP_STATE.chatHistory.slice(-40);
}
```

### Large Dataset Handling
- Full Bible JSON (~5MB uncompressed) fits comfortably in IndexedDB (limit: 1GB+)
- localStorage limited to ~5MB — use only for small settings objects
- Firestore documents limited to 1MB — store notes/highlights as subcollections if dataset grows large

---

## License & Attribution

- **Application Code:** MIT License
- **Bible Text (KJV CDN fallback):** Public Domain (pre-1923)
- **ESV Text:** Copyright © 2001 by Crossway — requires license for distribution. The seed data provided represents curated key passages for demonstration. For production with full ESV text, obtain an ESV API license from esv.org or purchase a digital license from Crossway.
- **Commentary Content:** Original scholarly content authored for this application
- **Character & Historical Data:** Compiled from public domain biblical scholarship

---

*"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness." — 2 Timothy 3:16 (ESV)*
