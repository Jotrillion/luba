// Interaction & Event Module - Manages all user interactions
// Handles clicks, favorites, voting, and surprise me feature

import { addFavorite, removeFavorite, isFavorite, castVote, hasVoted, addToHistory } from './data-management.js';
import { showArtifactModal, updateFavoriteButton, showToast } from './ui-module.js';
import { searchAllSources, getMetObject } from './api-module.js';

// Surprise Me - Random discovery feature
export const surpriseMe = async (criteria = {}) => {
    const {
        type = 'artifact', // 'artifact' or 'music'
        century = null,
        category = null,
        statusElement = null
    } = criteria;
    
    if (statusElement) {
        statusElement.textContent = 'Finding a surprise for you...';
    }
    
    try {
        // Build search query based on criteria
        let query = 'luba';
        if (category) query += ` ${category}`;
        if (century) query += ` ${century}th century`;
        
        const searchOptions = {
            includeArt: type === 'artifact',
            includeMusic: type === 'music',
            maxResults: 100
        };
        
        const results = await searchAllSources(query, searchOptions);
        
        let selectedItem = null;
        
        if (type === 'artifact' && results.artifacts.length > 0) {
            const randomIndex = Math.floor(Math.random() * results.artifacts.length);
            selectedItem = results.artifacts[randomIndex];
            
            // Add to history
            addToHistory('artifacts', {
                id: selectedItem.id || selectedItem.objectID,
                title: selectedItem.title,
                image: selectedItem.primaryImageSmall || selectedItem.images?.web?.url
            });
            
            // Show modal
            showArtifactModal(selectedItem);
            
        } else if (type === 'music' && results.recordings.length > 0) {
            const randomIndex = Math.floor(Math.random() * results.recordings.length);
            selectedItem = results.recordings[randomIndex];
            
            // Add to history
            addToHistory('recordings', {
                id: selectedItem.id,
                title: selectedItem.title
            });
            
            // Show music details
            showMusicDetails(selectedItem);
        }
        
        if (statusElement) {
            statusElement.textContent = selectedItem 
                ? `Discovered: ${selectedItem.title || selectedItem.name}`
                : 'No surprises found. Try different criteria.';
        }
        
        return selectedItem;
        
    } catch (error) {
        console.error('Surprise Me failed:', error);
        if (statusElement) {
            statusElement.textContent = 'Unable to find a surprise. Please try again.';
        }
        showToast('Unable to find a surprise. Please try again.', 'error');
        return null;
    }
};

// Show music details (simplified modal)
const showMusicDetails = (recording) => {
    const artists = recording['artist-credit']?.map(ac => ac.name).join(', ') || 'Unknown Artist';
    
    showToast(`🎵 ${recording.title} by ${artists}`, 'success', 5000);
    
    // Open MusicBrainz link
    window.open(`https://musicbrainz.org/recording/${recording.id}`, '_blank');
};

// Handle favorite button clicks
export const handleFavoriteClick = (event) => {
    const button = event.target.closest('.favorite-btn');
    if (!button) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const type = button.dataset.type;
    const itemId = button.dataset.id;
    
    const isCurrentlyFavorited = isFavorite(type, itemId);
    
    if (isCurrentlyFavorited) {
        // Remove from favorites
        const success = removeFavorite(type, itemId);
        if (success) {
            updateFavoriteButton(button, false);
            showToast('Removed from My Heritage', 'info');
        }
    } else {
        // Add to favorites
        const itemData = {
            id: itemId,
            type: type,
            name: button.closest('article')?.querySelector('h3')?.textContent || 'Untitled'
        };
        
        const success = addFavorite(type, itemData);
        if (success) {
            updateFavoriteButton(button, true);
            showToast('Added to My Heritage ❤️', 'success');
        }
    }
};

// Handle artifact details button clicks
export const handleDetailsClick = async (event) => {
    const button = event.target.closest('.artifact-details-btn');
    if (!button) return;
    
    event.preventDefault();
    
    const objectId = button.dataset.id;
    
    try {
        // Show loading toast
        showToast('Loading artifact details...', 'info', 1000);
        
        // Fetch full object details
        const artifact = await getMetObject(objectId);
        
        if (artifact) {
            // Add to history
            addToHistory('artifacts', {
                id: artifact.objectID,
                title: artifact.title,
                image: artifact.primaryImageSmall
            });
            
            // Show modal
            showArtifactModal(artifact);
        } else {
            showToast('Unable to load artifact details', 'error');
        }
    } catch (error) {
        console.error('Failed to load artifact:', error);
        showToast('Unable to load artifact details', 'error');
    }
};

// Handle vote button clicks
export const handleVoteClick = (event) => {
    const button = event.target.closest('.vote-btn');
    if (!button) return;
    
    event.preventDefault();
    
    const itemId = button.dataset.itemId;
    const itemCard = button.closest('.voting-card');
    const itemTitle = itemCard?.querySelector('h3')?.textContent || 'Unknown';
    
    // Check if already voted
    if (hasVoted(itemId)) {
        showToast('You have already voted this week!', 'warning');
        return;
    }
    
    // Cast vote
    const result = castVote(itemId, { id: itemId, name: itemTitle });
    
    if (result.success) {
        button.disabled = true;
        button.textContent = '✓ Voted';
        button.classList.add('voted');
        showToast(`Vote cast for "${itemTitle}"!`, 'success');
        
        // Update vote count display
        const voteCount = itemCard?.querySelector('.vote-count');
        if (voteCount) {
            const currentCount = parseInt(voteCount.textContent) || 0;
            voteCount.textContent = `${currentCount + 1} votes`;
        }
    } else if (result.reason === 'already_voted_this_week') {
        showToast('You can only vote once per week!', 'warning');
    }
};

// Handle theme toggle
export const handleThemeToggle = (event) => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('luba_theme', newTheme);
    
    showToast(`Switched to ${newTheme} mode`, 'info');
};

// Handle language toggle
export const handleLanguageToggle = (language) => {
    document.documentElement.setAttribute('lang', language === 'french' ? 'fr' : 'en');
    localStorage.setItem('luba_language', language);
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    
    showToast(`Language changed to ${language}`, 'info');
};

// Handle export data
export const handleExportData = () => {
    const favorites = JSON.parse(localStorage.getItem('luba_my_heritage') || '{}');
    const preferences = JSON.parse(localStorage.getItem('luba_user_preferences') || '{}');
    const history = JSON.parse(localStorage.getItem('luba_interaction_history') || '{}');
    
    const exportData = {
        exportDate: new Date().toISOString(),
        favorites,
        preferences,
        history
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luba-culture-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
};

// Initialize all event listeners
export const initializeEventListeners = () => {
    // Delegate event for favorite buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            handleFavoriteClick(e);
        }
    });
    
    // Delegate event for details buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.artifact-details-btn')) {
            handleDetailsClick(e);
        }
    });
    
    // Delegate event for vote buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.vote-btn')) {
            handleVoteClick(e);
        }
    });
    
    // Navigation active states
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all nav items
            document.querySelectorAll('.nav-list li').forEach(li => li.classList.remove('active'));
            // Add active class to clicked item's parent
            this.parentElement.classList.add('active');
        });
    });
    
    // Highlight nav on scroll
    window.addEventListener('scroll', () => {
        const sections = ['gallery', 'music', 'history', 'voting', 'surprise', 'forum'];
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-list li').forEach(li => li.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-list a[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.parentElement.classList.add('active');
                    }
                }
            }
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    // Language toggle
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            handleLanguageToggle(e.target.value);
        });
    }
    
    // Export data button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportData);
    }
    
    // Surprise Me button
    const surpriseBtn = document.getElementById('surprise-me-btn');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', async () => {
            const type = document.getElementById('surprise-type')?.value || 'artifact';
            const category = document.getElementById('surprise-category')?.value || null;
            const statusEl = document.getElementById('surprise-status');
            
            await surpriseMe({
                type,
                category,
                statusElement: statusEl
            });
        });
    }
    
    console.log('Event listeners initialized');
};

// Keyboard shortcuts
export const initializeKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            handleThemeToggle();
        }
        
        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            handleExportData();
        }
    });
    
    console.log('Keyboard shortcuts initialized');
};

// Track user interactions for analytics
export const trackInteraction = (type, data) => {
    console.log(`Interaction: ${type}`, data);
    // Could send to analytics service
};

// Export all functions
export default {
    surpriseMe,
    handleFavoriteClick,
    handleDetailsClick,
    handleVoteClick,
    handleThemeToggle,
    handleLanguageToggle,
    handleExportData,
    initializeEventListeners,
    initializeKeyboardShortcuts,
    trackInteraction
};
