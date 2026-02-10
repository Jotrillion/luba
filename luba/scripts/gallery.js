const API_SOURCES = {
    cleveland: {
        search: "https://openaccess-api.clevelandart.org/api/artworks/?q=Luba&has_image=1&limit=100",
        type: "cleveland"
    },
    met: {
        search: "https://collectionapi.metmuseum.org/public/collection/v1/search?q=Luba&hasImages=true",
        type: "met"
    }
};

const pageSize = 12;
let currentSource = API_SOURCES.cleveland;

const grid = document.getElementById("gallery-grid");
const statusEl = document.getElementById("gallery-status");
const refreshBtn = document.getElementById("refresh-gallery");
const loadMoreBtn = document.getElementById("load-more");
const drcToggle = document.getElementById("filter-drc");

const state = {
    ids: [],
    cursor: 0,
    loading: false,
    drcOnly: drcToggle ? drcToggle.checked : false
};

const setStatus = (message) => {
    if (!statusEl) return;
    statusEl.textContent = message;
};

const shuffle = (items) => {
    for (let i = items.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
};

const buildCard = (artifact, index) => {
    const card = document.createElement("article");
    card.className = "artifact-card";
    card.style.setProperty("--delay", `${index * 60}ms`);

    let imageUrl, title, artist, date, medium, location, linkUrl, linkText;
    
    if (currentSource.type === "cleveland") {
        imageUrl = artifact.images?.web?.url || artifact.images?.print?.url || "";
        title = artifact.title || "Untitled";
        artist = artifact.creators?.map(c => c.description).join(", ") || "Unknown artist";
        date = artifact.creation_date || "Date unknown";
        medium = artifact.technique || "Medium not listed";
        location = "Cleveland Museum of Art";
        linkUrl = artifact.url || "";
        linkText = "View at Cleveland Museum";
    } else {
        imageUrl = artifact.primaryImageSmall || artifact.primaryImage;
        title = artifact.title || "Untitled";
        artist = artifact.artistDisplayName || "Unknown artist";
        date = artifact.objectDate || "Date unknown";
        medium = artifact.medium || "Medium not listed";
        location = artifact.department || "Collection";
        linkUrl = artifact.objectURL || "";
        linkText = "View at the Met";
    }

    card.innerHTML = `
        <figure>
            <div class="artifact-media">
                <img src="${imageUrl}" alt="${title}" loading="lazy" />
            </div>
            <figcaption>
                <h3>${title}</h3>
                <p class="artifact-meta">${artist} · ${date}</p>
                <p class="artifact-meta">${medium}</p>
                <p class="artifact-meta">${location}</p>
                ${linkUrl ? `<a class="artifact-link" href="${linkUrl}" target="_blank" rel="noreferrer">${linkText}</a>` : ""}
            </figcaption>
        </figure>
    `;

    return card;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, attempt = 0) => {
    try {
        const response = await fetch(url, { 
            mode: 'cors',
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        if (attempt < 2) {
            await wait(400 * (attempt + 1));
            return fetchJson(url, attempt + 1);
        }
        throw error;
    }
};

const fetchArtifact = async (id) => {
    if (currentSource.type === "met") {
        return fetchJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    }
    // Cleveland API returns full objects in search results
    return id;
};

const fetchIds = async () => {
    const scopeLabel = state.drcOnly ? "DR Congo" : "all Luba";
    setStatus(`Loading ${scopeLabel} collection...`);
    
    try {
        const data = await fetchJson(currentSource.search);
        
        if (currentSource.type === "cleveland") {
            const artifacts = data.data || [];
            console.log("Cleveland API returned:", artifacts.length, "artifacts");
            if (!artifacts.length) {
                setStatus("No Luba artifacts found.");
                return [];
            }
            return shuffle(artifacts);
        } else {
            const ids = data.objectIDs || [];
            console.log("Met API returned:", ids.length, "artifact IDs");
            if (!ids.length) {
                setStatus("No Luba artifacts found.");
                return [];
            }
            return shuffle(ids.slice());
        }
    } catch (error) {
        console.error("Primary API failed:", error);
        // Try fallback to Met API if Cleveland fails
        if (currentSource.type === "cleveland") {
            console.log("Cleveland API failed, trying Met Museum...");
            currentSource = API_SOURCES.met;
            return fetchIds();
        }
        throw error;
    }
};

const renderArtifacts = (artifacts) => {
    const fragment = document.createDocumentFragment();
    artifacts.forEach((artifact, index) => {
        const hasImage = currentSource.type === "cleveland" 
            ? artifact.images?.web?.url 
            : (artifact.primaryImageSmall || artifact.primaryImage);
        if (!artifact || !hasImage) return;
        fragment.appendChild(buildCard(artifact, index));
    });
    grid.appendChild(fragment);
};

const updateButtons = () => {
    loadMoreBtn.disabled = state.cursor >= state.ids.length;
};

const includesLuba = (artifact) => {
    if (currentSource.type === "cleveland") {
        const culture = (artifact.culture || []).join(" ").toLowerCase();
        const title = (artifact.title || "").toLowerCase();
        const description = (artifact.wall_description || "").toLowerCase();
        return culture.includes("luba") || title.includes("luba") || description.includes("luba");
    } else {
        const culture = (artifact.culture || "").toLowerCase();
        const title = (artifact.title || "").toLowerCase();
        const tags = (artifact.tags || []).map(tag => (tag?.term || "").toLowerCase()).join(" ");
        return culture.includes("luba") || title.includes("luba") || tags.includes("luba");
    }
};

const getLocationText = (artifact) => {
    if (currentSource.type === "cleveland") {
        return [
            artifact.culture?.join(" "),
            artifact.creation_date_earliest,
            artifact.creation_date_latest,
            artifact.department
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    } else {
        return [
            artifact.country,
            artifact.region,
            artifact.subregion,
            artifact.city,
            artifact.state,
            artifact.geographyType,
            artifact.locale,
            artifact.artistNationality,
            artifact.culture
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }
};

const isFromDrc = (artifact) => {
    const locations = getLocationText(artifact);
    const drcTerms = [
        "democratic republic",
        "d.r. congo",
        "drc",
        "congo",
        "zaire",
        "katanga",
        "kasai",
        "lualaba",
        "upemba",
        "shaba"
    ];

    return drcTerms.some((term) => locations.includes(term));
};

const hasGeoInfo = (artifact) => getLocationText(artifact).trim().length > 0;

const matchesFilter = (artifact) => {
    // When filter is off, show all artifacts (no Luba check needed since search is already for Luba)
    if (!state.drcOnly) return true;
    
    // When DR Congo filter is on, check if it includes Luba AND is from DRC (or lacks geo data)
    if (!includesLuba(artifact)) return false;
    return isFromDrc(artifact) || !hasGeoInfo(artifact);
};

const loadNextPage = async ({ reset = false } = {}) => {
    if (state.loading) return;
    state.loading = true;

    try {
        if (reset || !state.ids.length) {
            state.ids = await fetchIds();
            state.cursor = 0;
            grid.innerHTML = "";
        }

        if (!state.ids.length) {
            updateButtons();
            return;
        }

        const artifacts = [];

        while (artifacts.length < pageSize && state.cursor < state.ids.length) {
            const slice = state.ids.slice(state.cursor, state.cursor + pageSize);
            state.cursor += pageSize;

            let matches;
            if (currentSource.type === "cleveland") {
                // Cleveland returns full objects already
                matches = slice.filter((artifact) => {
                    const hasImage = artifact && artifact.images?.web?.url;
                    const passesFilter = matchesFilter(artifact);
                    return hasImage && passesFilter;
                });
                console.log("Cleveland batch:", slice.length, "items, matched:", matches.length);
            } else {
                // Met requires fetching each object
                const results = await Promise.allSettled(slice.map(fetchArtifact));
                matches = results
                    .filter((result) => result.status === "fulfilled")
                    .map((result) => result.value)
                    .filter((artifact) => artifact && matchesFilter(artifact));
                console.log("Met batch:", slice.length, "items, matched:", matches.length);
            }

            artifacts.push(...matches);
        }

        if (!artifacts.length && grid.children.length === 0) {
            const sourceName = currentSource.type === "cleveland" ? "Cleveland Museum" : "Met Museum";
            const message = state.drcOnly
                ? `No Luba artifacts from the Democratic Republic of the Congo were found in ${sourceName}. Try turning off the filter.`
                : `No Luba artifacts were found in ${sourceName}.`;
            setStatus(message);
            console.log("No matches found. Total IDs:", state.ids.length, "Filter:", state.drcOnly ? "DR Congo only" : "All");
            updateButtons();
            return;
        }

        if (!artifacts.length) {
            const message = state.drcOnly
                ? "No more matching Luba artifacts from the Democratic Republic of the Congo."
                : "No more matching Luba artifacts.";
            setStatus(message);
            updateButtons();
            return;
        }

        renderArtifacts(artifacts);

        const count = grid.children.length;
        const sourceName = currentSource.type === "cleveland" ? "Cleveland Museum" : "Met Museum";
        const summary = state.drcOnly
            ? `Showing ${count} Luba artifacts from the Democratic Republic of the Congo (${sourceName}).`
            : `Showing ${count} Luba artifacts (${sourceName}).`;
        setStatus(summary);
        updateButtons();
    } catch (error) {
        const isFile = window.location?.protocol === "file:";
        const message = isFile
            ? "Unable to load the collection. Open this page with a local server and try again."
            : "Unable to load the collection right now. Please try again in a moment.";
        const detail = error?.message ? ` (${error.message})` : "";
        setStatus(`${message}${detail}`);
        console.error("Gallery load failed:", error);
    } finally {
        state.loading = false;
    }
};

refreshBtn?.addEventListener("click", () => loadNextPage({ reset: true }));
loadMoreBtn?.addEventListener("click", () => loadNextPage());
drcToggle?.addEventListener("change", (event) => {
    state.drcOnly = event.target.checked;
    loadNextPage({ reset: true });
});

loadNextPage({ reset: true });
