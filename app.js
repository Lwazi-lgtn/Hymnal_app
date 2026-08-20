let hymns = [];
let filteredHymns = [];
let hymnsCache = null; //For Hymns Description json file

let currentPage = 1;
const itemsPerPage = 5;

const hymnList = document.getElementById("hymnList");
const searchInput = document.getElementById("searchInput");
const hymnDetails = document.getElementById("hymnDetails");
const hymnTitle = document.getElementById("hymnTitle");
const hymnLyrics = document.getElementById("hymnLyrics");
const backBtn = document.getElementById("backBtn");
const pagination = document.getElementById("pagination");
const noResults = document.getElementById("noResults");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const retryBtn = document.getElementById("retryBtn");

const verseSlideshow = document.getElementById("verseSlideshow");

const increaseFontBtn = document.getElementById("increaseFontBtn");
const decreaseFontBtn = document.getElementById("decreaseFontBtn");

const pageHeading = document.getElementById("pageHeading");
const pageSubheading = document.getElementById("pageSubheading");

const updateBanner = document.getElementById("updateBanner");
const updateReloadBtn = document.getElementById("updateReloadBtn");

// Alternating book-title messages for the slideshow (English ↔ isiXhosa)
const bookTitles = [
    "Song and Hymn Book of the Old Apostolic Church of Africa",
    "Incwadi yamaculo neeNgoma zeBandla Elidala labaPostile lase Afrika"
];

// ====================== HEADER / SUBTITLE SWAPPING ======================
const DEFAULT_HEADING = "Welcome to the OAC Hymnal";
const DEFAULT_SUBHEADING = "Experience the Power of Worship";

const HYMN_HEADING = "Let's all sing together";
const HYMN_SUBHEADING = "Singing together brings together individuals both physically and emotionally, going beyond just music.";

function setHeaderForHome() {
    if (!pageHeading || !pageSubheading) return;
    pageHeading.textContent = DEFAULT_HEADING;
    pageHeading.classList.remove("hidden");
    pageSubheading.textContent = DEFAULT_SUBHEADING;
}

function setHeaderForHymn() {
    if (!pageHeading || !pageSubheading) return;
    pageHeading.textContent = HYMN_HEADING;
    pageHeading.classList.remove("hidden");
    pageSubheading.textContent = HYMN_SUBHEADING;
}

// ====================== LOAD HYMNS (with retry) ======================
function loadHymns() {
    if (loading) loading.style.display = "block";
    if (loadingText) loadingText.textContent = "Loading hymns...";
    if (retryBtn) retryBtn.classList.add("hidden");

    fetch("hymns.json")
        .then(res => res.json())
        .then(data => {
            hymns = data;
            filteredHymns = [...data];
            displayHymns();
            if (loading) loading.style.display = "none";
        })
        .catch(err => {
            console.error(err);
            if (loadingText) loadingText.textContent = "Couldn't load hymns. Please check your connection and try again.";
            if (retryBtn) retryBtn.classList.remove("hidden");
        });
}

loadHymns();

if (retryBtn) {
    retryBtn.addEventListener("click", loadHymns);
}

// Display Hymns
function displayHymns() {
    hymnList.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredHymns.slice(start, end);

    if (pageItems.length === 0) {
        noResults.classList.remove("hidden");
        pagination.style.display = "none";
        return;
    } else {
        noResults.classList.add("hidden");
        pagination.style.display = "block";
    }

    pageItems.forEach(hymn => {
        const card = document.createElement("div");
        card.className = "hymn-card";
        card.innerHTML = `<strong>${hymn.number}:</strong> ${hymn.title}`;

        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Hymn ${hymn.number}: ${hymn.title}`);

        card.addEventListener("click", () => openHymn(hymn));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                openHymn(hymn);
            }
        });

        hymnList.appendChild(card);
    });

    updatePaginationButtons();
}

// ====================== FONT SIZE CONTROLS ======================
const FONT_SIZE_KEY = "oacHymnalFontSize";
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 17;
const FONT_STEP = 2;

let currentFontSize = parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
if (isNaN(currentFontSize)) {
    currentFontSize = DEFAULT_FONT_SIZE;
}

function applyFontSize() {
    if (hymnLyrics) hymnLyrics.style.fontSize = `${currentFontSize}px`;
}

if (increaseFontBtn) {
    increaseFontBtn.addEventListener("click", () => {
        currentFontSize = Math.min(MAX_FONT_SIZE, currentFontSize + FONT_STEP);
        localStorage.setItem(FONT_SIZE_KEY, currentFontSize);
        applyFontSize();
    });
}

if (decreaseFontBtn) {
    decreaseFontBtn.addEventListener("click", () => {
        currentFontSize = Math.max(MIN_FONT_SIZE, currentFontSize - FONT_STEP);
        localStorage.setItem(FONT_SIZE_KEY, currentFontSize);
        applyFontSize();
    });
}

function capitalize(word) {
    return word.toUpperCase();
}

function getLyricsText(hymn) {
    const lyrics = Array.isArray(hymn.lyrics)
        ? [...hymn.lyrics]
        : [hymn.lyrics];

    // Bold + capitalize the first word of the FIRST verse
    lyrics[0] = lyrics[0].replace(/^(\s*)(\S+)/, (match, leadingSpace, firstWord) => {
        return `${leadingSpace}<b>${capitalize(firstWord)}</b>`;
    });

    // Bold the last word of the LAST verse, if it has a " - " separator (The last word should be "Amen")
    const lastIndex = lyrics.length - 1;
    if (lyrics[lastIndex].lastIndexOf(" - ") !== -1) {
        lyrics[lastIndex] = lyrics[lastIndex].replace(
            /(\S+)(\s*)$/,
            "<b>$1</b>$2"
        );
    }

    // Prefix each verse with its number
    return lyrics
        .map((verse, index) => `
        <div class="verse">
            <span class="verse-number ${index === 0 ? 'bold-number' : ''}">
                ${index + 1}.
            </span>
            <span class="verse-text">${verse}</span>
        </div>`)
        .join("");
}

async function loadHymnsDescription() {
    if (hymnsCache) return hymnsCache;

    const response = await fetch('hymns-description.json');
    if (!response.ok) {
        throw new Error(`Failed to load hymns: ${response.status}`);
    }
    hymnsCache = await response.json();
    return hymnsCache;
}

async function getHymnDescription(number) {
    const hymns = await loadHymnsDescription();
    const hymn = hymns.find(h => h.number === number);
    return hymn ? hymn.description : null;
}

// OPEN HYMN
async function openHymn(hymn) {
    const desc = await getHymnDescription(hymn.number);
    hymnTitle.textContent = desc;
    hymnLyrics.innerHTML = getLyricsText(hymn);
    applyFontSize();

    hymnList.classList.add("hidden");
    verseSlideshow.classList.add("hidden");
    pagination.style.display = "none";
    searchInput.style.display = "none";

    hymnDetails.classList.remove("hidden");
    setHeaderForHymn();
}

backBtn.addEventListener("click", () => {
    hymnDetails.classList.add("hidden");

    hymnList.classList.remove("hidden");
    verseSlideshow.classList.remove("hidden");
    searchInput.style.display = "block";
    pagination.style.display = "block";
    setHeaderForHome();

    displayHymns();
});

// ====================== SEARCH (debounced) ======================
const SEARCH_DEBOUNCE_MS = 200;
let searchDebounceTimer = null;

function runSearch(rawValue) {
    currentPage = 1;
    const value = rawValue.trim().toLowerCase();

    filteredHymns = hymns.filter(hymn =>
        hymn.title.toLowerCase().includes(value) ||
        hymn.number.toString().includes(value)
    );

    displayHymns();
}

searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounceTimer);
    const value = e.target.value;
    searchDebounceTimer = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS);
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(searchDebounceTimer);
        runSearch(searchInput.value);
    }
});

document.getElementById("nextBtn").onclick = () => {
    const total = Math.ceil(filteredHymns.length / itemsPerPage);
    if (currentPage < total) currentPage++;
    displayHymns();
};

document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) currentPage--;
    displayHymns();
};

function updatePaginationButtons() {

    const totalPages = Math.ceil(filteredHymns.length / itemsPerPage);

    if (!hymnDetails.classList.contains("hidden") || totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "block";

    document.getElementById("prevBtn").style.display =
        currentPage === 1 ? "none" : "inline-block";

    document.getElementById("nextBtn").style.display =
        currentPage === totalPages ? "none" : "inline-block";
}

// Book-title slideshow (English ↔ isiXhosa)
let currentTitle = 0;
function showBookTitle() {
    const verseTextEl = document.getElementById("verseText");
    if (verseTextEl) {
        verseTextEl.textContent = bookTitles[currentTitle];
    }
    currentTitle = (currentTitle + 1) % bookTitles.length;
}
showBookTitle();
setInterval(showBookTitle, 5000);

// ====================== UPDATE BANNER + SERVICE WORKER ======================
if (updateReloadBtn) {
    updateReloadBtn.addEventListener("click", () => window.location.reload());
}

const isLocalDev = ["localhost", "127.0.0.1"].includes(location.hostname);

if ('serviceWorker' in navigator && !isLocalDev) {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        if (hadController && updateBanner) {
            updateBanner.classList.remove("hidden");
        }
    });

    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
} else if ('serviceWorker' in navigator && isLocalDev) {
    // Unregister any leftover service worker from earlier testing so local
    // dev (e.g. Live Server) never gets stuck serving stale cached files.
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
    });
}

// ====================== COPY / SELECTION PREVENTION ======================
// Deters casual copying of hymn/verse text. This is a soft deterrent only —
// it doesn't stop view-source, browser dev tools, or the Share button
// (which copies text on purpose, via the Web Share API / Clipboard API,
// not via DOM selection, so it's intentionally unaffected by this).
document.addEventListener("copy", (e) => {
    if (e.target && e.target.id === "searchInput") return; // allow copying from the search box
    e.preventDefault();
});
 
document.addEventListener("contextmenu", (e) => {
    if (e.target && e.target.id === "searchInput") return; // allow right-click in the search box
    e.preventDefault();
});
 
document.addEventListener("keydown", (e) => {
    const isCopyShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c";
    if (isCopyShortcut && (!e.target || e.target.id !== "searchInput")) {
        e.preventDefault();
    }
});