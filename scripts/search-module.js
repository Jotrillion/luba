// Search & Filter Module - Handles search with debouncing and filtering
// Implements live cultural search bar with real-time filtering

import { searchAllSources } from './api-module.js';
import { renderArtifactCard, renderRecordingCard, renderLoadingSkeleton, renderEmptyState } from './ui-module.js';

// Debouncing configuration
const DEBOUNCE_DELAY = 500; // 500ms delay
let debounceTimer = null;
let currentSearchQuery = '';
let searchResults = {
    artifacts: [],
    recordings: [],
    artists: []
};

// Debounce function
export const debounce = (func, delay) => {
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
};

// Search function with debouncing
export const performSearch = async (query, options = {}) => {
    const {
        category = 'all',
        container = null,
        statusElement = null,
        minLength = 2
    } = options;
    
    // Validate query length
    if (query.trim().length < minLength) {
        if (statusElement) {
            statusElement.textContent = `Type at least ${minLength} characters to search...`;
        }
        if (container) {
            container.innerHTML = '';
        }
        return;
    }
    
    currentSearchQuery = query;
    
    // Show loading state
    if (statusElement) {
        statusElement.textContent = `Searching for "${query}"...`;
    }
    if (container) {
        container.innerHTML = '';
        container.appendChild(renderLoadingSkeleton(6));
    }
    
    try {
        // Determine what to search
        const searchOptions = {
            includeArt: category === 'all' || category === 'artifacts',
            includeMusic: category === 'all' || category === 'music',
            maxResults: 50
        };
        
        const results = await searchAllSources(query, searchOptions);
        
        // Store results
        searchResults = results;
        
        // Check if search query has changed during async operation
        if (currentSearchQuery !== query) {
            return; // Ignore outdated results
        }
        
        // Display results
        displaySearchResults(results, container, statusElement, category);
        
    } catch (error) {
        console.error('Search failed:', error);
        if (statusElement) {
            statusElement.textContent = 'Search failed. Please try again.';
        }
        if (container) {
            container.innerHTML = '';
            container.appendChild(renderEmptyState('Unable to complete search. Please try again.', '⚠️'));
        }
    }
};

// Create debounced search function
export const debouncedSearch = debounce(performSearch, DEBOUNCE_DELAY);

// Display search results
const displaySearchResults = (results, container, statusElement, category) => {
    if (!container) return;
    
    container.innerHTML = '';
    
    // Count total results
    const totalArtifacts = results.artifacts?.length || 0;
    const totalRecordings = results.recordings?.length || 0;
    const totalArtists = results.artists?.length || 0;
    const totalResults = totalArtifacts + totalRecordings + totalArtists;
    
    // Update status
    if (statusElement) {
        if (totalResults === 0) {
            statusElement.textContent = `No results found for "${currentSearchQuery}"`;
        } else {
            const parts = [];
            if (totalArtifacts > 0) parts.push(`${totalArtifacts} artifact${totalArtifacts !== 1 ? 's' : ''}`);
            if (totalRecordings > 0) parts.push(`${totalRecordings} recording${totalRecordings !== 1 ? 's' : ''}`);
            if (totalArtists > 0) parts.push(`${totalArtists} artist${totalArtists !== 1 ? 's' : ''}`);
            statusElement.textContent = `Found ${parts.join(', ')} for "${currentSearchQuery}"`;
        }
    }
    
    // Show empty state if no results
    if (totalResults === 0) {
        container.appendChild(renderEmptyState(`No results found for "${currentSearchQuery}"`, '🔍'));
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    // Render artifacts
    if (category === 'all' || category === 'artifacts') {
        results.artifacts.forEach((artifact, index) => {
            fragment.appendChild(renderArtifactCard(artifact, index));
        });
    }
    
    // Render recordings
    if (category === 'all' || category === 'music') {
        results.recordings.forEach((recording, index) => {
            fragment.appendChild(renderRecordingCard(recording, index + totalArtifacts));
        });
    }
    
    container.appendChild(fragment);
};

// Filter artifacts by category
export const filterByCategory = (items, category) => {
    if (!category || category === 'all') {
        return items;
    }
    
    const categoryLower = category.toLowerCase();
    
    return items.filter(item => {
        const title = (item.title || '').toLowerCase();
        const medium = (item.medium || item.technique || '').toLowerCase();
        const objectType = (item.objectName || item.classification || '').toLowerCase();
        const culture = Array.isArray(item.culture) 
            ? item.culture.join(' ').toLowerCase()
            : (item.culture || '').toLowerCase();
        
        const searchText = `${title} ${medium} ${objectType} ${culture}`;
        
        return searchText.includes(categoryLower);
    });
};

// Filter by date range
export const filterByDateRange = (items, startYear, endYear) => {
    if (!startYear && !endYear) {
        return items;
    }
    
    return items.filter(item => {
        const itemDate = item.objectDate || item.creation_date || '';
        const yearMatch = itemDate.match(/(\d{4})/);
        
        if (!yearMatch) return false;
        
        const year = parseInt(yearMatch[0]);
        
        if (startYear && year < startYear) return false;
        if (endYear && year > endYear) return false;
        
        return true;
    });
};

// Filter by geographic origin
export const filterByGeography = (items, region) => {
    if (!region || region === 'all') {
        return items;
    }
    
    const regionLower = region.toLowerCase();
    
    return items.filter(item => {
        const country = (item.country || '').toLowerCase();
        const geoRegion = (item.region || item.subregion || '').toLowerCase();
        const culture = Array.isArray(item.culture)
            ? item.culture.join(' ').toLowerCase()
            : (item.culture || '').toLowerCase();
        
        const geoText = `${country} ${geoRegion} ${culture}`;
        
        return geoText.includes(regionLower);
    });
};

// Advanced filter function
export const applyFilters = (items, filters = {}) => {
    let filtered = [...items];
    
    // Apply category filter
    if (filters.category) {
        filtered = filterByCategory(filtered, filters.category);
    }
    
    // Apply date range filter
    if (filters.startYear || filters.endYear) {
        filtered = filterByDateRange(filtered, filters.startYear, filters.endYear);
    }
    
    // Apply geography filter
    if (filters.geography) {
        filtered = filterByGeography(filtered, filters.geography);
    }
    
    // Apply custom filter function
    if (filters.customFilter && typeof filters.customFilter === 'function') {
        filtered = filtered.filter(filters.customFilter);
    }
    
    return filtered;
};

// Sort results
export const sortResults = (items, sortBy = 'relevance', order = 'asc') => {
    const sorted = [...items];
    
    sorted.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
            case 'title':
                valueA = (a.title || '').toLowerCase();
                valueB = (b.title || '').toLowerCase();
                break;
            case 'date':
                valueA = extractYear(a.objectDate || a.creation_date || '');
                valueB = extractYear(b.objectDate || b.creation_date || '');
                break;
            case 'artist':
                valueA = (a.artistDisplayName || a.creators?.[0]?.description || '').toLowerCase();
                valueB = (b.artistDisplayName || b.creators?.[0]?.description || '').toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
    });
    
    return sorted;
};

// Helper function to extract year from date string
const extractYear = (dateString) => {
    const match = dateString.match(/(\d{4})/);
    return match ? parseInt(match[0]) : 0;
};

// Initialize search bar
export const initializeSearchBar = (searchInput, resultsContainer, statusElement, options = {}) => {
    if (!searchInput) return;
    
    const {
        category = 'all',
        minLength = 2,
        placeholder = 'Search Luba culture...'
    } = options;
    
    searchInput.placeholder = placeholder;
    
    // Add input event listener with debouncing
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        debouncedSearch(query, {
            category,
            container: resultsContainer,
            statusElement,
            minLength
        });
    });
    
    // Clear button functionality
    const clearBtn = searchInput.nextElementSibling;
    if (clearBtn && clearBtn.classList.contains('search-clear')) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            if (resultsContainer) resultsContainer.innerHTML = '';
            if (statusElement) statusElement.textContent = '';
            searchInput.focus();
        });
    }
    
    console.log('Search bar initialized with debouncing');
};

// Get current search results
export const getSearchResults = () => {
    return { ...searchResults };
};

// Clear search
export const clearSearch = () => {
    currentSearchQuery = '';
    searchResults = {
        artifacts: [],
        recordings: [],
        artists: []
    };
    clearTimeout(debounceTimer);
};

// Export all functions
export default {
    debounce,
    performSearch,
    debouncedSearch,
    filterByCategory,
    filterByDateRange,
    filterByGeography,
    applyFilters,
    sortResults,
    initializeSearchBar,
    getSearchResults,
    clearSearch
};
