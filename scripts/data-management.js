// Data Management Module - Handles LocalStorage operations
// Manages user preferences, favorites, and interaction history

const STORAGE_KEYS = {
    FAVORITES: 'luba_my_heritage',
    PREFERENCES: 'luba_user_preferences',
    HISTORY: 'luba_interaction_history',
    VOTES: 'luba_community_votes',
    THEME: 'luba_theme'
};

// Default user preferences
const DEFAULT_PREFERENCES = {
    language: 'english',
    theme: 'light',
    artworkView: 'grid',
    autoplay: false
};

// Storage helper functions
const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
    }
};

// Favorites / "My Heritage" Collection
export const getFavorites = () => {
    return getFromStorage(STORAGE_KEYS.FAVORITES, {
        artifacts: [],
        recordings: [],
        artists: [],
        narratives: []
    });
};

export const addFavorite = (type, item) => {
    const favorites = getFavorites();
    
    if (!favorites[type]) {
        favorites[type] = [];
    }
    
    // Check if already favorited
    const exists = favorites[type].some(fav => fav.id === item.id);
    if (!exists) {
        favorites[type].push({
            id: item.id,
            name: item.name || item.title || 'Untitled',
            dateAdded: new Date().toISOString(),
            ...item
        });
        saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
        return true;
    }
    return false;
};

export const removeFavorite = (type, itemId) => {
    const favorites = getFavorites();
    
    if (favorites[type]) {
        favorites[type] = favorites[type].filter(item => item.id !== itemId);
        saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
        return true;
    }
    return false;
};

export const isFavorite = (type, itemId) => {
    const favorites = getFavorites();
    return favorites[type] ? favorites[type].some(item => item.id === itemId) : false;
};

export const getFavoriteCount = () => {
    const favorites = getFavorites();
    return Object.values(favorites).reduce((total, arr) => total + arr.length, 0);
};

// User Preferences
export const getPreferences = () => {
    return getFromStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
};

export const updatePreference = (key, value) => {
    const preferences = getPreferences();
    preferences[key] = value;
    saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
    
    // Apply theme immediately if changed
    if (key === 'theme') {
        applyTheme(value);
    }
    
    // Apply language immediately if changed
    if (key === 'language') {
        applyLanguage(value);
    }
    
    return preferences;
};

export const resetPreferences = () => {
    saveToStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    applyTheme(DEFAULT_PREFERENCES.theme);
    return DEFAULT_PREFERENCES;
};

// Interaction History (Recently Viewed)
export const getHistory = () => {
    return getFromStorage(STORAGE_KEYS.HISTORY, {
        artifacts: [],
        recordings: [],
        searches: []
    });
};

export const addToHistory = (type, item, maxItems = 20) => {
    const history = getHistory();
    
    if (!history[type]) {
        history[type] = [];
    }
    
    // Remove if already exists to avoid duplicates
    history[type] = history[type].filter(h => h.id !== item.id);
    
    // Add to beginning of array
    history[type].unshift({
        id: item.id,
        name: item.name || item.title || 'Untitled',
        viewedAt: new Date().toISOString(),
        thumbnail: item.thumbnail || item.image || null
    });
    
    // Keep only recent items
    history[type] = history[type].slice(0, maxItems);
    
    saveToStorage(STORAGE_KEYS.HISTORY, history);
    return history;
};

export const clearHistory = (type = null) => {
    if (type) {
        const history = getHistory();
        history[type] = [];
        saveToStorage(STORAGE_KEYS.HISTORY, history);
    } else {
        saveToStorage(STORAGE_KEYS.HISTORY, {
            artifacts: [],
            recordings: [],
            searches: []
        });
    }
};

// Community Voting
export const getVotes = () => {
    return getFromStorage(STORAGE_KEYS.VOTES, {
        currentWeek: getCurrentWeekKey(),
        votes: {}
    });
};

export const hasVoted = (itemId) => {
    const voteData = getVotes();
    const currentWeek = getCurrentWeekKey();
    
    // Reset votes if new week
    if (voteData.currentWeek !== currentWeek) {
        return false;
    }
    
    return voteData.votes.hasOwnProperty(itemId);
};

export const castVote = (itemId, itemData) => {
    const voteData = getVotes();
    const currentWeek = getCurrentWeekKey();
    
    // Reset votes for new week
    if (voteData.currentWeek !== currentWeek) {
        voteData.currentWeek = currentWeek;
        voteData.votes = {};
    }
    
    // Check if already voted this week (one vote per week)
    const alreadyVoted = Object.keys(voteData.votes).length > 0;
    if (alreadyVoted) {
        return { success: false, reason: 'already_voted_this_week' };
    }
    
    voteData.votes[itemId] = {
        itemId: itemId,
        name: itemData.name || itemData.title,
        votedAt: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.VOTES, voteData);
    return { success: true, voteData };
};

export const getMyVote = () => {
    const voteData = getVotes();
    const currentWeek = getCurrentWeekKey();
    
    if (voteData.currentWeek !== currentWeek) {
        return null;
    }
    
    const votes = Object.values(voteData.votes);
    return votes.length > 0 ? votes[0] : null;
};

// Helper function to get current week key
const getCurrentWeekKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
};

// Theme Management
export const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    saveToStorage(STORAGE_KEYS.THEME, theme);
};

export const getTheme = () => {
    return getFromStorage(STORAGE_KEYS.THEME, 'light');
};

export const toggleTheme = () => {
    const current = getTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    updatePreference('theme', newTheme);
    return newTheme;
};

// Language Management
export const applyLanguage = (language) => {
    document.documentElement.setAttribute('lang', language === 'french' ? 'fr' : 'en');
    // Dispatch event for other modules to update their content
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
};

// Export Statistics
export const getStorageStats = () => {
    const favorites = getFavorites();
    const history = getHistory();
    const votes = getVotes();
    
    return {
        totalFavorites: getFavoriteCount(),
        artifactsFavorited: favorites.artifacts.length,
        recordingsFavorited: favorites.recordings.length,
        artistsFavorited: favorites.artists.length,
        recentlyViewed: Object.values(history).reduce((total, arr) => total + arr.length, 0),
        hasVotedThisWeek: Object.keys(votes.votes).length > 0,
        storageUsed: new Blob([JSON.stringify(localStorage)]).size
    };
};

// Clear all data
export const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    return true;
};

// Export data for researcher's export tool
export const exportUserData = () => {
    const data = {
        exportDate: new Date().toISOString(),
        favorites: getFavorites(),
        preferences: getPreferences(),
        history: getHistory(),
        votes: getVotes(),
        stats: getStorageStats()
    };
    
    return data;
};

export const downloadUserData = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luba-culture-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

// Initialize on load
export const initializeStorage = () => {
    // Apply saved theme
    const theme = getTheme();
    applyTheme(theme);
    
    // Apply saved language
    const preferences = getPreferences();
    if (preferences.language) {
        applyLanguage(preferences.language);
    }
    
    console.log('Storage initialized:', getStorageStats());
};

// Export all functions
export default {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteCount,
    getPreferences,
    updatePreference,
    resetPreferences,
    getHistory,
    addToHistory,
    clearHistory,
    getVotes,
    hasVoted,
    castVote,
    getMyVote,
    applyTheme,
    getTheme,
    toggleTheme,
    applyLanguage,
    getStorageStats,
    clearAllData,
    exportUserData,
    downloadUserData,
    initializeStorage
};
