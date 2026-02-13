// Main Application File - Luba Culture Website
// Integrates all modules and initializes the application

import * as API from './api-module.js';
import * as DataManagement from './data-management.js';
import * as UI from './ui-module.js';
import * as Search from './search-module.js';
import * as Events from './events-module.js';

// MusicBrainz API Configuration (keeping existing code)
const MUSICBRAINZ_API = {
    baseUrl: "https://musicbrainz.org/ws/2",
    userAgent: "LubaCulture/1.0 (info@lubaculture.com)",
    format: "json"
};

// Rate limiting for MusicBrainz (max 1 request per second)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();
};

// Fetch JSON from MusicBrainz API
const fetchMusicBrainz = async (endpoint, params = {}) => {
    await waitForRateLimit();
    
    const queryParams = new URLSearchParams({
        fmt: MUSICBRAINZ_API.format,
        ...params
    });
    
    const url = `${MUSICBRAINZ_API.baseUrl}/${endpoint}?${queryParams}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': MUSICBRAINZ_API.userAgent,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`MusicBrainz API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("MusicBrainz fetch error:", error);
        throw error;
    }
};

// Search for Luba artists
export const searchLubaArtists = async (limit = 25, offset = 0) => {
    try {
        const data = await fetchMusicBrainz("artist", {
            query: 'artist:"luba" OR area:"luba" OR tag:"luba" OR area:"democratic republic of the congo"',
            limit: limit,
            offset: offset
        });
        
        console.log(`Found ${data.count} Luba artists`);
        return {
            count: data.count,
            offset: data.offset,
            artists: data.artists || []
        };
    } catch (error) {
        console.error("Error searching Luba artists:", error);
        return { count: 0, offset: 0, artists: [] };
    }
};

// Get detailed information about a specific artist
export const getArtistDetails = async (artistId, includes = ['recordings', 'releases', 'tags']) => {
    try {
        const data = await fetchMusicBrainz(`artist/${artistId}`, {
            inc: includes.join('+')
        });
        
        return data;
    } catch (error) {
        console.error(`Error fetching artist ${artistId}:`, error);
        return null;
    }
};

// Search for Luba recordings/music
export const searchLubaRecordings = async (limit = 25, offset = 0) => {
    try {
        const data = await fetchMusicBrainz("recording", {
            query: 'recording:"luba" OR artist:"luba" OR tag:"luba"',
            limit: limit,
            offset: offset
        });
        
        console.log(`Found ${data.count} Luba recordings`);
        return {
            count: data.count,
            offset: data.offset,
            recordings: data.recordings || []
        };
    } catch (error) {
        console.error("Error searching Luba recordings:", error);
        return { count: 0, offset: 0, recordings: [] };
    }
};

// Search for releases (albums) related to Luba
export const searchLubaReleases = async (limit = 25, offset = 0) => {
    try {
        const data = await fetchMusicBrainz("release", {
            query: 'release:"luba" OR artist:"luba" OR tag:"luba"',
            limit: limit,
            offset: offset
        });
        
        console.log(`Found ${data.count} Luba releases`);
        return {
            count: data.count,
            offset: data.offset,
            releases: data.releases || []
        };
    } catch (error) {
        console.error("Error searching Luba releases:", error);
        return { count: 0, offset: 0, releases: [] };
    }
};

// Search for instruments used in Luba music
export const searchLubaInstruments = async (limit = 25, offset = 0) => {
    try {
        const data = await fetchMusicBrainz("instrument", {
            query: 'instrument:"luba" OR tag:"luba" OR description:"luba" OR description:"congo"',
            limit: limit,
            offset: offset
        });
        
        console.log(`Found ${data.count} Luba instruments`);
        return {
            count: data.count,
            offset: data.offset,
            instruments: data.instruments || []
        };
    } catch (error) {
        console.error("Error searching Luba instruments:", error);
        return { count: 0, offset: 0, instruments: [] };
    }
};

// Get detailed information about a specific instrument
export const getInstrumentDetails = async (instrumentId) => {
    try {
        const data = await fetchMusicBrainz(`instrument/${instrumentId}`, {
            inc: 'tags+annotation'
        });
        
        return data;
    } catch (error) {
        console.error(`Error fetching instrument ${instrumentId}:`, error);
        return null;
    }
};

// Render artists to the page
export const displayArtists = (artists) => {
    const musicGrid = document.getElementById('music-grid');
    if (!musicGrid) return;
    
    if (!artists || artists.length === 0) {
        musicGrid.innerHTML = '<p class="no-results">No Luba artists found.</p>';
        return;
    }
    
    musicGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    artists.forEach((artist) => {
        const card = document.createElement('article');
        card.className = 'music-card';
        
        const lifeSpan = artist['life-span'] ? 
            `${artist['life-span'].begin || '?'} - ${artist['life-span'].end || 'present'}` : 
            'Unknown';
        
        const tags = artist.tags && artist.tags.length > 0 ? 
            artist.tags.map(t => t.name).join(', ') : 
            'None';
        
        card.innerHTML = `
            <div class="music-card-header">
                <h3>${artist.name}</h3>
                <span class="music-type">${artist.type || 'Artist'}</span>
            </div>
            <div class="music-card-body">
                <p><strong>Country:</strong> ${artist.country || 'Unknown'}</p>
                <p><strong>Active:</strong> ${lifeSpan}</p>
                ${artist.disambiguation ? `<p><strong>Note:</strong> ${artist.disambiguation}</p>` : ''}
                <p><strong>Tags:</strong> ${tags}</p>
                <a href="https://musicbrainz.org/artist/${artist.id}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="music-link">View on MusicBrainz →</a>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    musicGrid.appendChild(fragment);
};

// Render recordings to the page
export const displayRecordings = (recordings) => {
    const musicGrid = document.getElementById('music-grid');
    if (!musicGrid) return;
    
    if (!recordings || recordings.length === 0) {
        musicGrid.innerHTML = '<p class="no-results">No Luba recordings found.</p>';
        return;
    }
    
    musicGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    recordings.forEach((recording) => {
        const card = document.createElement('article');
        card.className = 'music-card';
        
        const artists = recording['artist-credit'] && recording['artist-credit'].length > 0 ? 
            recording['artist-credit'].map(ac => ac.name).join(', ') : 
            'Unknown Artist';
        
        let duration = '';
        if (recording.length) {
            const totalSeconds = Math.floor(recording.length / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        card.innerHTML = `
            <div class="music-card-header">
                <h3>${recording.title}</h3>
                <span class="music-type">Recording</span>
            </div>
            <div class="music-card-body">
                <p><strong>Artist(s):</strong> ${artists}</p>
                ${duration ? `<p><strong>Duration:</strong> ${duration}</p>` : ''}
                ${recording.disambiguation ? `<p><strong>Note:</strong> ${recording.disambiguation}</p>` : ''}
                <a href="https://musicbrainz.org/recording/${recording.id}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="music-link">View on MusicBrainz →</a>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    musicGrid.appendChild(fragment);
};

// Render instruments to the page
export const displayInstruments = (instruments) => {
    const musicGrid = document.getElementById('music-grid');
    if (!musicGrid) return;
    
    if (!instruments || instruments.length === 0) {
        musicGrid.innerHTML = '<p class="no-results">No Luba instruments found.</p>';
        return;
    }
    
    musicGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    instruments.forEach((instrument) => {
        const card = document.createElement('article');
        card.className = 'music-card';
        
        const tags = instrument.tags && instrument.tags.length > 0 ? 
            instrument.tags.map(t => t.name).join(', ') : 
            'None';
        
        card.innerHTML = `
            <div class="music-card-header">
                <h3>${instrument.name}</h3>
                <span class="music-type">${instrument.type || 'Instrument'}</span>
            </div>
            <div class="music-card-body">
                ${instrument.description ? `<p><strong>Description:</strong> ${instrument.description}</p>` : ''}
                ${instrument.disambiguation ? `<p><strong>Note:</strong> ${instrument.disambiguation}</p>` : ''}
                <p><strong>Tags:</strong> ${tags}</p>
                <a href="https://musicbrainz.org/instrument/${instrument.id}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="music-link">View on MusicBrainz →</a>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    musicGrid.appendChild(fragment);
};

// Example usage function - call this to test the API
export const loadLubaMusic = async () => {
    console.log("=== Loading Luba Music Data ===\n");
    
    console.log("Searching for Luba artists...");
    const artistsResult = await searchLubaArtists(10);
    displayArtists(artistsResult.artists);
    
    console.log("\n\nSearching for Luba recordings...");
    const recordingsResult = await searchLubaRecordings(10);
    displayRecordings(recordingsResult.recordings);
    
    console.log("\n\nSearching for Luba instruments...");
    const instrumentsResult = await searchLubaInstruments(10);
    displayInstruments(instrumentsResult.instruments);
    
    return {
        artists: artistsResult,
        recordings: recordingsResult,
        instruments: instrumentsResult
    };
};

// DOM event handlers
const setupEventListeners = () => {
    const musicStatus = document.getElementById('music-status');
    const loadArtistsBtn = document.getElementById('load-artists');
    const loadInstrumentsBtn = document.getElementById('load-instruments');
    const loadRecordingsBtn = document.getElementById('load-recordings');
    
    const setStatus = (message) => {
        if (musicStatus) musicStatus.textContent = message;
    };
    
    if (loadArtistsBtn) {
        loadArtistsBtn.addEventListener('click', async () => {
            setStatus('Loading Luba artists...');
            loadArtistsBtn.disabled = true;
            try {
                const result = await searchLubaArtists(25);
                displayArtists(result.artists);
                setStatus(`Found ${result.count} Luba artists. Showing ${result.artists.length}.`);
            } catch (error) {
                setStatus('Error loading artists. Please try again.');
                console.error(error);
            } finally {
                loadArtistsBtn.disabled = false;
            }
        });
    }
    
    if (loadInstrumentsBtn) {
        loadInstrumentsBtn.addEventListener('click', async () => {
            setStatus('Loading Luba instruments...');
            loadInstrumentsBtn.disabled = true;
            try {
                const result = await searchLubaInstruments(25);
                displayInstruments(result.instruments);
                setStatus(`Found ${result.count} Luba instruments. Showing ${result.instruments.length}.`);
            } catch (error) {
                setStatus('Error loading instruments. Please try again.');
                console.error(error);
            } finally {
                loadInstrumentsBtn.disabled = false;
            }
        });
    }
    
    if (loadRecordingsBtn) {
        loadRecordingsBtn.addEventListener('click', async () => {
            setStatus('Loading Luba recordings...');
            loadRecordingsBtn.disabled = true;
            try {
                const result = await searchLubaRecordings(25);
                displayRecordings(result.recordings);
                setStatus(`Found ${result.count} Luba recordings. Showing ${result.recordings.length}.`);
            } catch (error) {
                setStatus('Error loading recordings. Please try again.');
                console.error(error);
            } finally {
                loadRecordingsBtn.disabled = false;
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

// Make functions available globally for testing
window.MusicBrainz = {
    searchLubaArtists,
    getArtistDetails,
    searchLubaRecordings,
    searchLubaReleases,
    searchLubaInstruments,
    getInstrumentDetails,
    displayArtists,
    displayRecordings,
    displayInstruments,
    loadLubaMusic
};

// Application Initialization
const initializeApp = () => {
    console.log('Initializing Luba Culture application...');
    
    // Initialize storage and apply saved preferences
    DataManagement.initializeStorage();
    
    // Initialize event listeners
    Events.initializeEventListeners();
    Events.initializeKeyboardShortcuts();
    
    // Initialize search bar if present
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchStatus = document.getElementById('search-status');
    
    if (searchInput) {
        Search.initializeSearchBar(searchInput, searchResults, searchStatus, {
            category: 'all',
            placeholder: 'Search Luba culture, art, and music...'
        });
    }
    
    // Initialize Surprise Me feature
    initializeSurpriseMe();
    
    // Initialize Voting section
    initializeVoting();
    
    // Display user stats
    displayUserStats();
    
    console.log('Luba Culture application initialized successfully!');
};

// Initialize Surprise Me feature
const initializeSurpriseMe = () => {
    const surpriseBtn = document.getElementById('surprise-me-btn');
    if (!surpriseBtn) return;
    
    surpriseBtn.addEventListener('click', async () => {
        const typeSelect = document.getElementById('surprise-type');
        const categorySelect = document.getElementById('surprise-category');
        const statusEl = document.getElementById('surprise-status');
        
        const type = typeSelect?.value || 'artifact';
        const category = categorySelect?.value || null;
        
        await Events.surpriseMe({
            type,
            category,
            statusElement: statusEl
        });
    });
};

// Initialize Voting section
const initializeVoting = async () => {
    const votingGrid = document.getElementById('voting-grid');
    if (!votingGrid) return;
    
    try {
        // Fetch Luba artifacts from Cleveland Museum
        const artifacts = await API.searchClevelandArtifacts('Luba', 50);
        if (!artifacts || artifacts.length === 0) {
            // Fallback to Met Museum if Cleveland fails
            const artifactIds = await API.searchMetArtifacts('Luba', true);
            if (!artifactIds || artifactIds.length === 0) return;
            const randomIds = shuffleArray(artifactIds).slice(0, 5);
            const metArtifacts = await API.getMetObjects(randomIds);
            renderVotingCards(metArtifacts, votingGrid, 'met');
        } else {
            // Use Cleveland Museum artifacts
            const randomArtifacts = shuffleArray(artifacts).slice(0, 5);
            renderVotingCards(randomArtifacts, votingGrid, 'cleveland');
        }
        
        // Check if user has voted
        const myVote = DataManagement.getMyVote();
        if (myVote) {
            const statusEl = document.getElementById('voting-status');
            if (statusEl) {
                statusEl.textContent = `You voted for: ${myVote.name}`;
            }
        }
    } catch (error) {
        console.error('Failed to initialize voting:', error);
    }
};

// Render voting cards from either source
const renderVotingCards = (artifacts, container, source) => {
    container.innerHTML = '';
    artifacts.forEach((artifact, index) => {
        const isCleveland = source === 'cleveland';
        const votingCard = UI.renderVotingItem({
            id: isCleveland ? artifact.id : artifact.objectID,
            title: artifact.title || 'Untitled',
            description: isCleveland ? artifact.technique : artifact.medium,
            image: isCleveland ? artifact.images?.web?.url : artifact.primaryImageSmall,
            votes: Math.floor(Math.random() * 100) // Mock vote count
        }, index);
        container.appendChild(votingCard);
    });
};

// Display user statistics
const displayUserStats = () => {
    const statsContainer = document.getElementById('user-stats');
    if (!statsContainer) return;
    
    const stats = DataManagement.getStorageStats();
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.totalFavorites}</div>
            <div class="stat-label">Favorites</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.recentlyViewed}</div>
            <div class="stat-label">Recently Viewed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.hasVotedThisWeek ? 'Yes' : 'No'}</div>
            <div class="stat-label">Voted This Week</div>
        </div>
    `;
};

// Utility function to shuffle array
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export modules globally for console access
window.LubaCulture = {
    API,
    DataManagement,
    UI,
    Search,
    Events,
    MusicBrainz: window.MusicBrainz
};

console.log("Luba Culture application loaded. Access modules via window.LubaCulture");
