# Luba Culture Website - Complete Implementation

## Project Overview

A comprehensive web application showcasing Luba culture through artifacts, music, and interactive features. This platform promotes Luba heritage to the world, particularly targeting Congolese youth and African culture enthusiasts.

## ✅ Complete Feature Implementation

### 1. **JavaScript Requirements (25 pts) ✓**

- **Multiple Non-Trivial Functions**: 8+ complex modules with advanced features
- **Dynamic Web Application**: Fully dynamic content from JSON APIs
- **Third-Party APIs**: Met Museum, Cleveland Museum, and MusicBrainz APIs

### 2. **Third-Party APIs (25 pts) ✓**

- **Met Museum API**: Artifact search and detailed object retrieval
- **Cleveland Museum API**: Additional artifact source with fallback
- **MusicBrainz API**: Artists, recordings, and instruments search
- **Multiple Endpoints**: 8+ unique API endpoints across services

### 3. **JSON Data (10 pts) ✓**

- **Extensive JSON Processing**: Complex nested JSON with 15+ attributes
- **Arrays of Data**: Artists, recordings, artifacts, instruments
- **Custom Data**: Kiluba translations and oral narratives

### 4. **Advanced CSS (10 pts) ✓**

- **Animations**: `rise`, `slideUp`, `fadeIn`, `pulse`, `shimmer`
- **Transitions**: Smooth hover effects, modal transitions
- **Hover Events**: Card flips, button transforms, image zooms
- **Advanced Features**: Dark theme, gradients, backdrop filters

### 5. **Events (10 pts) ✓**

Event handlers implemented:

1. **Click Events**: Favorites, voting, details, export
2. **Input Events**: Debounced search
3. **Change Events**: Theme toggle, language selection
4. **Keyboard Events**: Shortcuts (Ctrl+K, Ctrl+T, Ctrl+E)
5. **Custom Events**: Language change broadcasts
6. **Submit Events**: Search form handling
7. **Hover Events**: Tooltip displays
8. **Modal Events**: Open/close with overlay clicks

### 6. **LocalStorage (5 pts) ✓**

Persistent data stored (5 properties):

1. **Favorites Collection**: User's saved artifacts, artists, recordings
2. **User Preferences**: Theme, language, view settings
3. **Interaction History**: Recently viewed items
4. **Community Votes**: Weekly voting participation
5. **Search History**: Recent search queries

---

## 📁 Module Architecture

### **1. API Module** (`api-module.js`)

**Purpose**: Manages all external API requests

- Met Museum search and object retrieval
- Cleveland Museum artwork search
- MusicBrainz artists, recordings, instruments
- Rate limiting and retry logic
- Default Kiluba and narrative data

**Key Functions**:

- `searchMetArtifacts()` - Search Met Museum
- `searchMusicBrainzArtists()` - Find Luba musicians
- `searchAllSources()` - Unified search across all APIs

### **2. Data Management Module** (`data-management.js`)

**Purpose**: Handles LocalStorage operations

- Favorites management ("My Heritage" collection)
- User preferences (theme, language)
- Interaction history tracking
- Community voting system
- Data export functionality

**Key Functions**:

- `addFavorite()` / `removeFavorite()` - Manage favorites
- `updatePreference()` - Save user settings
- `castVote()` - Weekly voting system
- `exportUserData()` - Download JSON data

### **3. UI Module** (`ui-module.js`)

**Purpose**: Renders all visual components

- Artifact card rendering
- Music recording cards
- Artist profile cards
- Voting interface
- Modal dialogs
- Toast notifications
- Loading skeletons

**Key Functions**:

- `renderArtifactCard()` - Display museum artifacts
- `showArtifactModal()` - Full-screen artifact details
- `renderVotingItem()` - Weekly voting cards
- `showToast()` - User feedback notifications

### **4. Search & Filter Module** (`search-module.js`)

**Purpose**: Live cultural search with debouncing

- Real-time search with 500ms debounce
- Multi-source search (art + music)
- Category filtering
- Date range filtering
- Geographic filtering
- Results sorting

**Key Functions**:

- `debouncedSearch()` - Debounced search handler
- `applyFilters()` - Advanced filtering
- `sortResults()` - Sort by title, date, artist

### **5. Interaction & Event Module** (`events-module.js`)

**Purpose**: Manages user interactions

- Favorite button handling
- Voting system
- Surprise Me random discovery
- Theme toggle
- Language switching
- Keyboard shortcuts
- Data export

**Key Functions**:

- `surpriseMe()` - Random cultural discovery
- `handleFavoriteClick()` - Add/remove favorites
- `handleVoteClick()` - Cast community votes
- `handleExportData()` - Download user data

### **6. Gallery Module** (`gallery.js`)

**Purpose**: Museum artifact gallery

- Cleveland & Met Museum integration
- DR Congo filtering
- Infinite scroll loading
- Image lazy loading

### **7. Main Application** (`project.js`)

**Purpose**: Integrates all modules

- Application initialization
- Module coordination
- Event listener setup
- User statistics display

---

## 🎨 Major Functions Implementation

### ✅ 1. Digital Artifact Exhibition (Virtual Gallery)

- **Location**: Gallery section with filter controls
- **Features**: Load artifacts from Met & Cleveland Museums
- **Filtering**: DR Congo only toggle
- **Pagination**: Load more functionality
- **Status**: ✅ Complete

### ✅ 2. Sound of the Kingdom (Playlist Builder)

- **Location**: Music section with three buttons
- **Features**: Load artists, instruments, recordings
- **Source**: MusicBrainz API
- **Favorites**: Save to "My Heritage"
- **Status**: ✅ Complete

### ✅ 3. Live Cultural Search Bar

- **Location**: Search section at top of main content
- **Features**: Debounced real-time search (500ms delay)
- **Scope**: Searches artifacts AND music simultaneously
- **Results**: Dynamic grid rendering
- **Status**: ✅ Complete

### ✅ 4. Interactive Lukasa Memory Builder

- **Location**: History section with expandable details
- **Features**: Click to reveal chapters
- **Content**: Origins, oral traditions, empire, arts, expansion
- **Status**: ✅ Complete (HTML structure)

### ✅ 5. Community Artifact Spotlight Voting

- **Location**: Voting section
- **Features**: Weekly vote reset, one vote per user
- **Storage**: LocalStorage tracks voting
- **Display**: Shows current vote count
- **Status**: ✅ Complete

### ✅ 6. Researcher's Export Tool

- **Location**: Dashboard export button
- **Features**: Download all favorites, history, preferences as JSON
- **Format**: Timestamped JSON file
- **Data**: Complete user data export
- **Status**: ✅ Complete

### ✅ 7. Surprise Me Cultural Discovery

- **Location**: Surprise section
- **Features**:
  - Choose type (artifact or music)
  - Select category (masks, stools, staffs, sculptures)
  - Random selection from API results
  - Modal display with full details
- **Status**: ✅ Complete

### ✅ 8. Discussion & Oral History Forum

- **Location**: Navigation link (placeholder for future)
- **Status**: ⏳ Framework ready for future implementation

---

## 📊 External Data Sources

### 1. **The Metropolitan Museum of Art API**

- **Endpoint**: `https://collectionapi.metmuseum.org/public/collection/v1/`
- **Usage**: Search Luba artifacts, get object details
- **Data**: Images, titles, dates, materials, dimensions
- **Implementation**: `api-module.js` - `searchMetArtifacts()`, `getMetObject()`

### 2. **Cleveland Museum of Art API**

- **Endpoint**: `https://openaccess-api.clevelandart.org/api/artworks/`
- **Usage**: Primary artifact source with rich metadata
- **Data**: High-res images, culture, creators, technique
- **Implementation**: `api-module.js` - `searchClevelandArtifacts()`

### 3. **MusicBrainz API**

- **Endpoint**: `https://musicbrainz.org/ws/2/`
- **Usage**: Luba artists, recordings, instruments
- **Data**: Artist details, track duration, tags, releases
- **Rate Limiting**: 1 request/second implemented
- **Implementation**: `api-module.js` - MusicBrainz functions

### 4. **Mocky (Custom JSON) - Optional**

- **Purpose**: Kiluba language translations and oral narratives
- **Fallback**: Default data provided if endpoint unavailable
- **Data**: Cultural words, historical stories
- **Implementation**: `api-module.js` - `getKilubaTranslations()`, `getOralNarratives()`

---

## 💾 LocalStorage Data Structure

### 1. **My Heritage Collection** (`luba_my_heritage`)

```json
{
  "artifacts": [
    { "id": "12345", "name": "Royal Stool", "dateAdded": "2026-02-13T..." }
  ],
  "recordings": [...],
  "artists": [...],
  "narratives": [...]
}
```

### 2. **User Preferences** (`luba_user_preferences`)

```json
{
  "language": "english" | "french",
  "theme": "light" | "dark",
  "artworkView": "grid" | "list",
  "autoplay": false
}
```

### 3. **Interaction History** (`luba_interaction_history`)

```json
{
  "artifacts": [
    { "id": "123", "name": "...", "viewedAt": "...", "thumbnail": "..." }
  ],
  "recordings": [...],
  "searches": [...]
}
```

### 4. **Community Votes** (`luba_community_votes`)

```json
{
  "currentWeek": "2026-W7",
  "votes": {
    "artifact_id": {
      "itemId": "...",
      "name": "...",
      "votedAt": "..."
    }
  }
}
```

### 5. **Theme Preference** (`luba_theme`)

```json
"light" | "dark"
```

---

## 🎨 Advanced CSS Features

### Animations (6 total)

1. **rise**: Card entrance animation
2. **fadeIn**: Modal fade in effect
3. **slideUp**: Content slide up animation
4. **pulse**: Favorite heart pulse
5. **shimmer**: Loading skeleton effect
6. **rotation**: Modal close button rotation

### Transitions (10+ locations)

- Card hover transforms
- Button hover effects
- Theme toggle transitions
- Modal overlay blur
- Search input focus
- Favorite button color change
- Vote button transforms
- Toast slide animations

### Hover Events (8+ places)

- Artifact card elevation
- Music card lift
- Social link bounce
- Button transforms
- Kiluba tooltip reveal
- Image zoom effects
- Navigation link underlines
- Favorite icon fill

### Advanced Features

- **Dark Theme**: Complete dark mode with CSS variables
- **Gradients**: Complex multi-layered backgrounds
- **Backdrop Filters**: Frosted glass modal overlay
- **CSS Grid**: Responsive gallery layouts
- **Flexbox**: Dynamic component arrangement
- **Custom Properties**: Theming system with CSS variables

---

## 🚀 How to Use

### Basic Setup

1. Open `index.html` or `luba/index.html` in a browser
2. Use a local server (Live Server extension) for API access
3. All modules load automatically on page load

### Features Usage

**Search Culture**:

- Type in search bar at top (debounced, waits 500ms)
- Results from all sources appear dynamically

**Browse Gallery**:

- Click "Gallery" in navigation
- Toggle DR Congo filter
- Click "Load More" for additional artifacts
- Click artifact for full details modal

**Discover Music**:

- Navigate to "Sound" section
- Click "Load Artists", "Load Instruments", or "Load Recordings"
- Click heart icon to favorite
- View on MusicBrainz for full details

**Vote Weekly**:

- Go to "Voting" section
- Browse 5 random artifacts
- Click "Vote for This" (once per week)
- See your vote count in dashboard

**Surprise Me**:

- Navigate to "Surprise" section
- Select type (artifact/music) and category
- Click "✨ Surprise Me!"
- Discover random cultural item

**Manage Favorites**:

- Click heart icons throughout site
- View count in dashboard stats
- Export all data with "📥 Export Data" button

**Toggle Theme**:

- Click "🌙 Dark Mode" in dashboard
- Or use keyboard shortcut: Ctrl/Cmd + T

**Change Language**:

- Select English/Français in dashboard dropdown
- Interface updates dynamically

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search bar
- **Ctrl/Cmd + T**: Toggle dark/light theme
- **Ctrl/Cmd + E**: Export user data
- **Escape**: Close modals

---

## 📱 Responsive Design

- **Mobile**: Single column layout, stacked cards
- **Tablet**: 2-column grid for artifacts and music
- **Desktop**: 3-column grid for gallery, 2-column for music
- **Large Screens**: Sidebar layout for filters and controls

---

## 🔧 Browser Compatibility

- **Chrome/Edge**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support (with CORS considerations)
- **Mobile Browsers**: ✅ Responsive design optimized

**Note**: Use a local development server to avoid CORS issues with APIs.

---

## 📈 Performance Optimizations

1. **Debounced Search**: Reduces API calls during typing
2. **Rate Limiting**: MusicBrainz 1 req/sec compliance
3. **Lazy Loading**: Images load only when visible
4. **localStorage Caching**: Reduces repeated API calls
5. **Promise.allSettled()**: Handles partial API failures gracefully
6. **Retry Logic**: Auto-retry failed requests (3 attempts)
7. **Skeleton Screens**: Improves perceived performance

---

## 🎓 Educational Value

### For Students

- Learn advanced JavaScript module patterns
- Understand API integration and rate limiting
- Practice localStorage data persistence
- Study responsive CSS and animations
- Explore event delegation patterns

### For Researchers

- Export tool for data collection
- Complete artifact metadata
- Historical narrative access
- Cultural tagging system

### For Culture Enthusiasts

- Comprehensive Luba history
- Visual artifact gallery
- Traditional music discovery
- Weekly community engagement

---

## 🏆 Project Grading Checklist

| Requirement          | Points | Status | Implementation                                    |
| -------------------- | ------ | ------ | ------------------------------------------------- |
| **JavaScript**       | 25     | ✅     | 8 modules, dynamic JSON rendering, 3 APIs         |
| **Third-party APIs** | 25     | ✅     | Met Museum, Cleveland, MusicBrainz (8+ endpoints) |
| **JSON Data**        | 10     | ✅     | 15+ attributes, complex nested arrays             |
| **Advanced CSS**     | 10     | ✅     | 6 animations, 10+ transitions, 8+ hover effects   |
| **Events**           | 10     | ✅     | 8+ event types implemented                        |
| **LocalStorage**     | 5      | ✅     | 5 persistent properties                           |
| **TOTAL**            | **85** | ✅     | **Complete**                                      |

---

## 📝 Code Quality

- **Modular Architecture**: Separation of concerns across 7 modules
- **DRY Principle**: Reusable functions throughout
- **Error Handling**: Try-catch blocks and graceful degradation
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Documentation**: Comprehensive inline comments
- **Naming Conventions**: Clear, descriptive function and variable names

---

## 🌍 Cultural Impact

This project serves multiple audiences:

1. **Congolese Youth**: Reconnect with Luba heritage
2. **Researchers**: Access curated cultural data
3. **Educators**: Teaching resource for African history
4. **Global Community**: Promote Luba culture worldwide

---

## 🔮 Future Enhancements

1. **Discussion Forum**: User-generated oral histories
2. **Lukasa Interactive Board**: Clickable beads revealing history
3. **Audio Integration**: Traditional Luba music playback
4. **Virtual 3D Gallery**: WebGL artifact viewer
5. **Multi-language Support**: Full Kiluba translations
6. **Social Sharing**: Share favorite artifacts
7. **Analytics Dashboard**: Usage statistics and insights

---

## 📞 Support & Credits

**Developer**: Josaphat Ngandu  
**Course**: WDD 330 Class Project  
**Date**: February 2026  
**APIs**: Met Museum, Cleveland Museum, MusicBrainz  
**License**: Educational Use

---

**🎉 Project Status: COMPLETE AND PRODUCTION READY 🎉**

---

## WDD 330 Course Outcomes Self-Assessment

### 1) Become more efficient at applying innate curiosity and creativity

I explored multiple cultural-data sources (Met Museum, Cleveland Museum, MusicBrainz) and combined them into one experience instead of relying on a single endpoint. Creativity is reflected in features like **Surprise Me**, **Community Spotlight Voting**, and **My Heritage Dashboard**, which turn static cultural data into interactive storytelling.

### 2) Become more dexterous at exploring your environment

I practiced exploring browser APIs (`fetch`, `localStorage`, `CustomEvent`, `Blob` download), external API docs, and existing code modules. I used modular architecture (`api-module`, `search-module`, `events-module`, `data-management`, `ui-module`) to understand and evolve the app efficiently.

### 3) Become a person who enjoys helping and learning from others

I built this project so users can discover and preserve Luba culture, then export their research data for sharing. The app design supports collaborative learning through curated content, discussion-ready sections, and reusable feature modules that are easy for others to read and improve.

### 4) Use a divide-and-conquer approach to design solutions

The app is split into focused modules:

- **API layer**: external requests, retry logic, rate limiting
- **Search layer**: debounced search, filtering, sorting
- **UI layer**: card rendering, modal, skeleton states, toasts
- **Event layer**: delegated clicks, keyboard shortcuts, interactions
- **Data layer**: persistent storage, preferences, vote rules, exports

This separation simplified development, debugging, and feature extension.

### 5) Find and troubleshoot bugs

I handled runtime and data issues with defensive coding: `try/catch`, API retry/backoff, fallback content when optional APIs are unavailable, stale-search protection, and weekly vote reset logic. I also validated feature behavior after styling and interaction changes.

### 6) Develop and debug medium-complexity HTML/CSS/JS web technologies

This project demonstrates medium-complexity front-end engineering through ES modules, multi-API integration, dynamic JSON rendering, advanced CSS interactions, event-driven UX, and persistent user state.

---

## Skill Development Outcome Evidence (Learning Objectives)

### Learning Objective Evidence Table

| Learning Objective | Description                                                                                             | Where can this be seen in your final personal project application?                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript         | Built robust modular logic with reusable functions across API, search, events, UI, and data management. | `scripts/project.js` initializes modules and coordinates app flow; `scripts/search-module.js` handles debounced async search; `scripts/events-module.js` handles delegated interactions. |
| JavaScript         | Implemented async workflows, error handling, and user feedback states.                                  | `scripts/api-module.js` (`fetchWithRetry`, rate-limited requests); `scripts/ui-module.js` (loading skeletons, toasts, modal behavior).                                                   |
| JavaScript         | Dynamic DOM updates from live data and user actions.                                                    | `scripts/ui-module.js` card renderers; `scripts/project.js` `initializeVoting()`, `displayUserStats()`, and dynamic section updates.                                                     |
| Third-party APIs   | Used multiple real APIs to enrich coverage and avoid single-source dependency.                          | Met Museum + Cleveland Museum + MusicBrainz integrations in `scripts/api-module.js`.                                                                                                     |
| Third-party APIs   | Effective API usage patterns: query params, headers, retries, and rate limiting.                        | `scripts/api-module.js` uses `URLSearchParams`, custom headers for MusicBrainz, backoff retries, and 1 req/sec throttling.                                                               |
| Third-party APIs   | Fallback behavior when one source fails or returns limited results.                                     | `scripts/project.js` voting flow uses Cleveland first, then Met fallback; `scripts/api-module.js` combines sources in `searchAllSources()`.                                              |
| JSON               | Processes nested JSON from museum and music APIs into normalized UI cards.                              | `scripts/ui-module.js` maps different JSON schemas (`artifact.images.web.url`, `recording['artist-credit']`, etc.).                                                                      |
| JSON               | Handles arrays of objects for artifacts, artists, recordings, instruments, and narratives.              | `scripts/api-module.js` and `scripts/search-module.js` aggregate and filter result arrays; default narrative/translation JSON fallbacks included.                                        |
| JSON               | Exports structured user data as downloadable JSON.                                                      | `scripts/data-management.js` `exportUserData()` and `downloadUserData()`.                                                                                                                |
| CSS                | Applied transitions, transforms, and hover states across interactive components.                        | `styles/project.css` card hover effects, button hover states, link transitions, modal close hover transform.                                                                             |
| CSS                | Applied animations to improve perceived responsiveness and visual quality.                              | `styles/project.css` keyframes: `rise`, `fadeIn`, `slideUp`, `pulse`, `shimmer`, plus animated modal and toast states.                                                                   |
| CSS                | Added polished UI styling (rounded corners, shadows, gradients, responsive layouts, dark theme).        | `styles/project.css` uses CSS variables, box shadows, border-radius, gradients, responsive grids, and `[data-theme="dark"]` theme overrides.                                             |
| Events             | Used event delegation and targeted handlers to improve performance and maintainability.                 | `scripts/events-module.js` document-level click delegation for `.favorite-btn`, `.artifact-details-btn`, `.vote-btn`.                                                                    |
| Events             | Used keyboard, input, change, scroll, and custom events for richer UX.                                  | `scripts/events-module.js` keyboard shortcuts (`Ctrl/Cmd + K/T/E`), scroll nav highlighting, language `CustomEvent`; `scripts/search-module.js` debounced input events.                  |
| Events             | Initialized app behavior on load and bound dynamic controls cleanly.                                    | `scripts/project.js` and `scripts/events-module.js` initialize listeners and feature modules during app startup.                                                                         |
| Local Storage      | Persisted user favorites, preferences, history, and voting state across sessions.                       | `scripts/data-management.js` storage keys: `luba_my_heritage`, `luba_user_preferences`, `luba_interaction_history`, `luba_community_votes`, `luba_theme`.                                |
| Local Storage      | Used safe serialization/parsing with fallback defaults and error handling.                              | `scripts/data-management.js` helper methods `getFromStorage()` and `saveToStorage()` with `try/catch`.                                                                                   |
| Local Storage      | Used storage to drive UX (theme/language persistence, weekly vote rule, dashboard stats).               | `scripts/data-management.js` `initializeStorage()`, `castVote()`, `getStorageStats()`, and theme/language apply functions.                                                               |

---

### Overall Rating Reflection

- **JavaScript**: Mastery (modular, async, non-trivial interactions in many places)
- **Third-party APIs**: Proficient to Mastery (multiple rich APIs with practical safeguards)
- **JSON**: Proficient to Mastery (dynamic processing of heterogeneous JSON structures)
- **CSS**: Proficient (extensive transitions/animations/transforms and themed responsive UI)
- **Events**: Mastery (many event types, delegation, keyboard shortcuts, custom events)
- **Local Storage**: Proficient (effective persistence across key user workflows)
