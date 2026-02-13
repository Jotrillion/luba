// API Module - Manages all external API requests
// Handles Met Museum, MusicBrainz, and Mocky APIs

const API_CONFIG = {
    met: {
        search: "https://collectionapi.metmuseum.org/public/collection/v1/search",
        object: "https://collectionapi.metmuseum.org/public/collection/v1/objects"
    },
    cleveland: {
        search: "https://openaccess-api.clevelandart.org/api/artworks"
    },
    musicbrainz: {
        base: "https://musicbrainz.org/ws/2",
        userAgent: "LubaCulture/1.0 (info@lubaculture.com)"
    },
    mocky: {
        kiluba: "https://run.mocky.io/v3/your-kiluba-endpoint",
        narratives: "https://run.mocky.io/v3/your-narratives-endpoint"
    }
};

let lastMusicBrainzRequest = 0;
const MUSICBRAINZ_RATE_LIMIT = 1000; // 1 second between requests

// Generic fetch with retry logic
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                cache: "no-store"
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 400 * (i + 1)));
        }
    }
};

// Rate limiting for MusicBrainz
const rateLimitMusicBrainz = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastMusicBrainzRequest;
    if (timeSinceLastRequest < MUSICBRAINZ_RATE_LIMIT) {
        await new Promise(resolve => 
            setTimeout(resolve, MUSICBRAINZ_RATE_LIMIT - timeSinceLastRequest)
        );
    }
    lastMusicBrainzRequest = Date.now();
};

// Met Museum API functions
export const searchMetArtifacts = async (query = "Luba", hasImages = true) => {
    const params = new URLSearchParams({
        q: query,
        hasImages: hasImages
    });
    
    const data = await fetchWithRetry(`${API_CONFIG.met.search}?${params}`);
    return data.objectIDs || [];
};

export const getMetObject = async (objectId) => {
    return await fetchWithRetry(`${API_CONFIG.met.object}/${objectId}`);
};

export const getMetObjects = async (objectIds) => {
    const results = await Promise.allSettled(
        objectIds.map(id => getMetObject(id))
    );
    
    return results
        .filter(result => result.status === "fulfilled")
        .map(result => result.value)
        .filter(obj => obj && obj.primaryImage);
};

// Cleveland Museum API functions
export const searchClevelandArtifacts = async (query = "Luba", limit = 100) => {
    const params = new URLSearchParams({
        q: query,
        has_image: 1,
        limit: limit
    });
    
    const data = await fetchWithRetry(`${API_CONFIG.cleveland.search}?${params}`);
    return data.data || [];
};

// MusicBrainz API functions
export const searchMusicBrainzArtists = async (query = "luba", limit = 25, offset = 0) => {
    await rateLimitMusicBrainz();
    
    const params = new URLSearchParams({
        query: query,
        limit: limit,
        offset: offset,
        fmt: "json"
    });
    
    const data = await fetchWithRetry(
        `${API_CONFIG.musicbrainz.base}/artist?${params}`,
        {
            headers: {
                'User-Agent': API_CONFIG.musicbrainz.userAgent,
                'Accept': 'application/json'
            }
        }
    );
    
    return {
        count: data.count || 0,
        artists: data.artists || []
    };
};

export const searchMusicBrainzRecordings = async (query = "luba", limit = 25, offset = 0) => {
    await rateLimitMusicBrainz();
    
    const params = new URLSearchParams({
        query: query,
        limit: limit,
        offset: offset,
        fmt: "json"
    });
    
    const data = await fetchWithRetry(
        `${API_CONFIG.musicbrainz.base}/recording?${params}`,
        {
            headers: {
                'User-Agent': API_CONFIG.musicbrainz.userAgent,
                'Accept': 'application/json'
            }
        }
    );
    
    return {
        count: data.count || 0,
        recordings: data.recordings || []
    };
};

export const searchMusicBrainzInstruments = async (query = "luba", limit = 25, offset = 0) => {
    await rateLimitMusicBrainz();
    
    const params = new URLSearchParams({
        query: query,
        limit: limit,
        offset: offset,
        fmt: "json"
    });
    
    const data = await fetchWithRetry(
        `${API_CONFIG.musicbrainz.base}/instrument?${params}`,
        {
            headers: {
                'User-Agent': API_CONFIG.musicbrainz.userAgent,
                'Accept': 'application/json'
            }
        }
    );
    
    return {
        count: data.count || 0,
        instruments: data.instruments || []
    };
};

export const getMusicBrainzArtistDetails = async (artistId, includes = ['recordings', 'releases']) => {
    await rateLimitMusicBrainz();
    
    const params = new URLSearchParams({
        inc: includes.join('+'),
        fmt: "json"
    });
    
    return await fetchWithRetry(
        `${API_CONFIG.musicbrainz.base}/artist/${artistId}?${params}`,
        {
            headers: {
                'User-Agent': API_CONFIG.musicbrainz.userAgent,
                'Accept': 'application/json'
            }
        }
    );
};

// Mocky API functions for custom data
export const getKilubaTranslations = async () => {
    try {
        return await fetchWithRetry(API_CONFIG.mocky.kiluba);
    } catch (error) {
        console.warn("Kiluba translations not available, using defaults");
        return getDefaultKilubaData();
    }
};

export const getOralNarratives = async () => {
    try {
        return await fetchWithRetry(API_CONFIG.mocky.narratives);
    } catch (error) {
        console.warn("Oral narratives not available, using defaults");
        return getDefaultNarratives();
    }
};

// Default data when Mocky is not configured
const getDefaultKilubaData = () => ({
    words: [
        { kiluba: "Mwamudimu", english: "Greetings", french: "Salutations" },
        { kiluba: "Mulopwe", english: "King", french: "Roi" },
        { kiluba: "Lukasa", english: "Memory Board", french: "Planche de mémoire" },
        { kiluba: "Mbudye", english: "Secret Society", french: "Société secrète" },
        { kiluba: "Bamfumus", english: "Royal Nobles", french: "Nobles royaux" },
        { kiluba: "Bulumbu", english: "Spirit", french: "Esprit" },
        { kiluba: "Kasala", english: "Praise Poetry", french: "Poésie de louange" },
        { kiluba: "Nkongolo", english: "Rainbow King", french: "Roi arc-en-ciel" }
    ]
});

const getDefaultNarratives = () => ({
    stories: [
        {
            id: 1,
            title: "The Legend of Nkongolo and Mbidi Kiluwe",
            summary: "The foundational myth of the Luba Kingdom tells of Nkongolo, the Rainbow King, and his encounter with the hunter prince Mbidi Kiluwe.",
            fullText: "In ancient times, Nkongolo ruled the land with tyranny. When Mbidi Kiluwe, the refined hunter from the east, arrived, he brought new customs and royal traditions. Nkongolo's sister bore Mbidi's son, Kalala Ilunga, who would eventually challenge Nkongolo's reign and establish the sacred kingship of the Luba.",
            tags: ["origin", "kingship", "mythology"]
        },
        {
            id: 2,
            title: "The Birth of the Lukasa",
            summary: "How the Mbudye society created the memory board to preserve the kingdom's history.",
            fullText: "The Bambudye, keepers of royal memory, developed the Lukasa - a beaded board that maps the spiritual and political geography of the Luba kingdom. Each bead, shell, and carving represents kings, migrations, and sacred sites.",
            tags: ["lukasa", "mbudye", "history"]
        },
        {
            id: 3,
            title: "The Power of Bilumbu (Twin Spirits)",
            summary: "The spiritual significance of twins in Luba cosmology.",
            fullText: "Twins were considered manifestations of Bilumbu - powerful spirits that connect the living world to the ancestral realm. Their birth was celebrated with special ceremonies and they were believed to bring fortune to the kingdom.",
            tags: ["spirituality", "twins", "cosmology"]
        }
    ]
});

// Unified search function (searches all sources)
export const searchAllSources = async (query, options = {}) => {
    const {
        includeArt = true,
        includeMusic = true,
        maxResults = 50
    } = options;
    
    const results = {
        artifacts: [],
        recordings: [],
        artists: [],
        instruments: []
    };
    
    if (includeArt) {
        try {
            const [metIds, clevelandData] = await Promise.all([
                searchMetArtifacts(query),
                searchClevelandArtifacts(query)
            ]);
            
            const metObjects = await getMetObjects(metIds.slice(0, 10));
            results.artifacts = [...clevelandData, ...metObjects].slice(0, maxResults);
        } catch (error) {
            console.error("Art search failed:", error);
        }
    }
    
    if (includeMusic) {
        try {
            const [artistsData, recordingsData, instrumentsData] = await Promise.all([
                searchMusicBrainzArtists(query, 15),
                searchMusicBrainzRecordings(query, 15),
                searchMusicBrainzInstruments(query, 10)
            ]);
            
            results.artists = artistsData.artists;
            results.recordings = recordingsData.recordings;
            results.instruments = instrumentsData.instruments;
        } catch (error) {
            console.error("Music search failed:", error);
        }
    }
    
    return results;
};

// Export all functions
export default {
    searchMetArtifacts,
    getMetObject,
    getMetObjects,
    searchClevelandArtifacts,
    searchMusicBrainzArtists,
    searchMusicBrainzRecordings,
    searchMusicBrainzInstruments,
    getMusicBrainzArtistDetails,
    getKilubaTranslations,
    getOralNarratives,
    searchAllSources
};
