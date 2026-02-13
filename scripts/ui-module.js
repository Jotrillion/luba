// UI Module - Handles rendering of all visual components
// Manages artifact gallery, music player, tooltips, and modals

import { isFavorite, addFavorite, removeFavorite } from './data-management.js';

// Render artifact card
export const renderArtifactCard = (artifact, index = 0) => {
    const card = document.createElement('article');
    card.className = 'artifact-card';
    card.style.setProperty('--delay', `${index * 60}ms`);
    card.dataset.objectId = artifact.id || artifact.objectID;
    
    const isCleveland = artifact.images && artifact.images.web;
    const imageUrl = isCleveland 
        ? (artifact.images?.web?.url || artifact.images?.print?.url)
        : (artifact.primaryImageSmall || artifact.primaryImage);
    
    const title = artifact.title || 'Untitled';
    const artist = isCleveland
        ? (artifact.creators?.map(c => c.description).join(', ') || 'Unknown artist')
        : (artifact.artistDisplayName || 'Unknown artist');
    const date = artifact.creation_date || artifact.objectDate || 'Date unknown';
    const medium = artifact.technique || artifact.medium || 'Medium not listed';
    const culture = artifact.culture || 'Luba';
    
    const favorited = isFavorite('artifacts', artifact.id || artifact.objectID);
    
    card.innerHTML = `
        <figure>
            <div class="artifact-media">
                <img src="${imageUrl}" alt="${title}" loading="lazy" />
                <button class="favorite-btn ${favorited ? 'favorited' : ''}" 
                        data-type="artifacts" 
                        data-id="${artifact.id || artifact.objectID}"
                        aria-label="Add to favorites">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <figcaption>
                <h3>${title}</h3>
                <p class="artifact-meta">${artist} · ${date}</p>
                <p class="artifact-meta">${medium}</p>
                <p class="artifact-meta culture-tag">${culture}</p>
                <button class="artifact-details-btn" data-id="${artifact.id || artifact.objectID}">
                    View Details
                </button>
            </figcaption>
        </figure>
    `;
    
    return card;
};

// Render music recording card
export const renderRecordingCard = (recording, index = 0) => {
    const card = document.createElement('article');
    card.className = 'music-card';
    card.style.setProperty('--delay', `${index * 60}ms`);
    card.dataset.recordingId = recording.id;
    
    const artists = recording['artist-credit'] && recording['artist-credit'].length > 0
        ? recording['artist-credit'].map(ac => ac.name).join(', ')
        : 'Unknown Artist';
    
    let duration = '';
    if (recording.length) {
        const totalSeconds = Math.floor(recording.length / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const favorited = isFavorite('recordings', recording.id);
    
    card.innerHTML = `
        <div class="music-card-header">
            <h3>${recording.title}</h3>
            <span class="music-type">Recording</span>
        </div>
        <div class="music-card-body">
            <p><strong>Artist(s):</strong> ${artists}</p>
            ${duration ? `<p><strong>Duration:</strong> ${duration}</p>` : ''}
            ${recording.disambiguation ? `<p><strong>Note:</strong> ${recording.disambiguation}</p>` : ''}
            <div class="card-actions">
                <button class="favorite-btn ${favorited ? 'favorited' : ''}" 
                        data-type="recordings" 
                        data-id="${recording.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    ${favorited ? 'Favorited' : 'Favorite'}
                </button>
                <a href="https://musicbrainz.org/recording/${recording.id}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="music-link">View on MusicBrainz →</a>
            </div>
        </div>
    `;
    
    return card;
};

// Render artist card
export const renderArtistCard = (artist, index = 0) => {
    const card = document.createElement('article');
    card.className = 'music-card';
    card.style.setProperty('--delay', `${index * 60}ms`);
    card.dataset.artistId = artist.id;
    
    const lifeSpan = artist['life-span']
        ? `${artist['life-span'].begin || '?'} - ${artist['life-span'].end || 'present'}`
        : 'Unknown';
    
    const tags = artist.tags && artist.tags.length > 0
        ? artist.tags.map(t => t.name).join(', ')
        : 'None';
    
    const favorited = isFavorite('artists', artist.id);
    
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
            <div class="card-actions">
                <button class="favorite-btn ${favorited ? 'favorited' : ''}" 
                        data-type="artists" 
                        data-id="${artist.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    ${favorited ? 'Favorited' : 'Favorite'}
                </button>
                <a href="https://musicbrainz.org/artist/${artist.id}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="music-link">View on MusicBrainz →</a>
            </div>
        </div>
    `;
    
    return card;
};

// Render instrument card
export const renderInstrumentCard = (instrument, index = 0) => {
    const card = document.createElement('article');
    card.className = 'music-card';
    card.style.setProperty('--delay', `${index * 60}ms`);
    
    const tags = instrument.tags && instrument.tags.length > 0
        ? instrument.tags.map(t => t.name).join(', ')
        : 'None';
    
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
    
    return card;
};

// Render voting item
export const renderVotingItem = (item, index = 0) => {
    const card = document.createElement('article');
    card.className = 'voting-card';
    card.style.setProperty('--delay', `${index * 80}ms`);
    card.dataset.itemId = item.id;
    
    const imageUrl = item.primaryImageSmall || item.image || item.images?.web?.url || '';
    
    card.innerHTML = `
        <div class="voting-card-image">
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.title}" loading="lazy" />` : ''}
        </div>
        <div class="voting-card-content">
            <h3>${item.title || item.name}</h3>
            <p>${item.description || item.medium || ''}</p>
            <button class="vote-btn" data-item-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Vote for This
            </button>
        </div>
        <div class="vote-count">${item.votes || 0} votes</div>
    `;
    
    return card;
};

// Render Kiluba tooltip
export const renderKilubaTooltip = (word, translations) => {
    const tooltip = document.createElement('span');
    tooltip.className = 'kiluba-tooltip';
    tooltip.setAttribute('data-kiluba', word);
    
    tooltip.innerHTML = `
        <span class="kiluba-word">${word}</span>
        <span class="tooltip-content">
            <strong>English:</strong> ${translations.english}<br>
            <strong>French:</strong> ${translations.french}
        </span>
    `;
    
    return tooltip;
};

// Render modal for artifact details
export const showArtifactModal = (artifact) => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'artifact-modal';
    
    const isCleveland = artifact.images && artifact.images.web;
    const imageUrl = isCleveland
        ? (artifact.images?.web?.url || artifact.images?.print?.url)
        : artifact.primaryImage || artifact.primaryImageSmall;
    
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="Close modal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${imageUrl}" alt="${artifact.title}" />
                </div>
                <div class="modal-details">
                    <h2>${artifact.title || 'Untitled'}</h2>
                    <dl class="detail-list">
                        <dt>Artist</dt>
                        <dd>${artifact.artistDisplayName || artifact.creators?.map(c => c.description).join(', ') || 'Unknown'}</dd>
                        
                        <dt>Date</dt>
                        <dd>${artifact.objectDate || artifact.creation_date || 'Unknown'}</dd>
                        
                        <dt>Culture</dt>
                        <dd>${Array.isArray(artifact.culture) ? artifact.culture.join(', ') : artifact.culture || 'Luba'}</dd>
                        
                        <dt>Medium</dt>
                        <dd>${artifact.medium || artifact.technique || 'Not specified'}</dd>
                        
                        ${artifact.dimensions ? `<dt>Dimensions</dt><dd>${artifact.dimensions}</dd>` : ''}
                        
                        ${artifact.creditLine || artifact.department ? `
                            <dt>Collection</dt>
                            <dd>${artifact.creditLine || artifact.department}</dd>
                        ` : ''}
                    </dl>
                    
                    ${artifact.objectURL || artifact.url ? `
                        <a href="${artifact.objectURL || artifact.url}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn">View in Museum Collection</a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Escape key to close
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
};

// Render loading skeleton
export const renderLoadingSkeleton = (count = 6) => {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line shorter"></div>
            </div>
        `;
        fragment.appendChild(skeleton);
    }
    
    return fragment;
};

// Render empty state
export const renderEmptyState = (message, icon = '🔍') => {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
        <div class="empty-icon">${icon}</div>
        <p class="empty-message">${message}</p>
    `;
    return empty;
};

// Update favorite button state
export const updateFavoriteButton = (button, isFavorited) => {
    if (isFavorited) {
        button.classList.add('favorited');
        button.innerHTML = button.innerHTML.replace('Favorite', 'Favorited');
    } else {
        button.classList.remove('favorited');
        button.innerHTML = button.innerHTML.replace('Favorited', 'Favorite');
    }
};

// Show toast notification
export const showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('active'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// Export all functions
export default {
    renderArtifactCard,
    renderRecordingCard,
    renderArtistCard,
    renderInstrumentCard,
    renderVotingItem,
    renderKilubaTooltip,
    showArtifactModal,
    renderLoadingSkeleton,
    renderEmptyState,
    updateFavoriteButton,
    showToast
};
