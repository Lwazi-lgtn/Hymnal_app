let hymns = [];
let filteredHymns = [];

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
const dailyVerseBtn = document.getElementById("dailyVerseBtn");
const dailyVersesPage = document.getElementById("dailyVersesPage");
const dailyVersesBackBtn = document.getElementById("dailyVersesBackBtn");

const increaseFontBtn = document.getElementById("increaseFontBtn");
const decreaseFontBtn = document.getElementById("decreaseFontBtn");
const shareBtn = document.getElementById("shareBtn");

const pageHeading = document.getElementById("pageHeading");
const pageSubheading = document.getElementById("pageSubheading");

const updateBanner = document.getElementById("updateBanner");
const updateReloadBtn = document.getElementById("updateReloadBtn");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");

const bibleVerses = [
    { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
    { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    { reference: "John 3:16", text: "For God so loved the world that He gave His only begotten Son." },
    { reference: "Proverbs 3:5", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
    { reference: "Isaiah 41:10", text: "Fear not, for I am with you." }
];

// ====================== DARK / LIGHT THEME ======================
const THEME_KEY = "oacHymnalTheme";

function getStoredOrPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);

    if (themeToggleBtn) {
        themeToggleBtn.setAttribute("aria-pressed", String(isDark));
        themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
    if (themeToggleIcon) {
        themeToggleIcon.textContent = isDark ? "☀️" : "🌙";
    }

    // Keep the mobile browser status bar color in sync with the active theme.
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#16283f" : "#1d3557");
    }
}

// index.html already set data-theme on <html> before first paint (to avoid
// a flash of the wrong theme); this just syncs the toggle button's
// icon/label to match, and re-applies whenever the user toggles manually.
let currentTheme = getStoredOrPreferredTheme();
applyTheme(currentTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, currentTheme);
        applyTheme(currentTheme);
    });
}

// If the user hasn't explicitly chosen a theme, keep following the system
// setting live (e.g. their OS switching to dark mode at sunset).
if (!localStorage.getItem(THEME_KEY) && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            currentTheme = e.matches ? "dark" : "light";
            applyTheme(currentTheme);
        }
    });
}

// ====================== HEADER / SUBTITLE SWAPPING ======================
const DEFAULT_HEADING = "Welcome to the OAC Hymnal";
const DEFAULT_SUBHEADING = "Experience the Power of Worship";

const HYMN_HEADING = "Let's all sing together";
const HYMN_SUBHEADING = "Singing together brings together individuals both physically and emotionally, going beyond just music.";

const DAILY_VERSE_HEADING = "John 3:16";
const DAILY_VERSE_SUBHEADING = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.";

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

function setHeaderForDailyVerses() {
    if (!pageHeading || !pageSubheading) return;
    pageHeading.textContent = DAILY_VERSE_HEADING;
    pageHeading.classList.remove("hidden");
    pageSubheading.textContent = DAILY_VERSE_SUBHEADING;
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
        card.innerHTML = `<strong>${hymn.number}</strong><br>${hymn.title}`;

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

// ====================== SHARE / COPY ======================
if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
        const shareText = `${hymnTitle.textContent}\n\n${hymnLyrics.textContent}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: hymnTitle.textContent, text: shareText });
            } catch (err) {
                // User cancelled the share sheet — not an error worth surfacing.
            }
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(shareText);
                flashShareFeedback("Copied!");
            } catch (err) {
                console.error(err);
                flashShareFeedback("Copy failed");
            }
            return;
        }

        window.prompt("Copy this text:", shareText);
    });
}

function flashShareFeedback(message) {
    if (!shareBtn) return;
    const original = shareBtn.textContent;
    shareBtn.textContent = message;
    shareBtn.disabled = true;
    setTimeout(() => {
        shareBtn.textContent = original;
        shareBtn.disabled = false;
    }, 1500);
}

// OPEN HYMN
function openHymn(hymn) {
    hymnTitle.textContent = `${hymn.number} - ${hymn.title}`;
    hymnLyrics.textContent = hymn.lyrics;
    applyFontSize();

    hymnList.classList.add("hidden");
    verseSlideshow.classList.add("hidden");
    dailyVersesPage.classList.add("hidden");
    dailyVerseBtn.style.display = "none";
    pagination.style.display = "none";
    searchInput.style.display = "none";

    hymnDetails.classList.remove("hidden");
    setHeaderForHymn();
}

backBtn.addEventListener("click", () => {
    hymnDetails.classList.add("hidden");

    hymnList.classList.remove("hidden");
    verseSlideshow.classList.remove("hidden");
    dailyVerseBtn.style.display = "block";
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

// Daily Verses
dailyVerseBtn.addEventListener("click", () => {
    verseSlideshow.classList.add("hidden");
    hymnList.classList.add("hidden");
    pagination.style.display = "none";
    searchInput.style.display = "none";
    dailyVerseBtn.style.display = "none";
    noResults.classList.add("hidden");
    dailyVersesPage.classList.remove("hidden");
    setHeaderForDailyVerses();
});

dailyVersesBackBtn.addEventListener("click", () => {
    dailyVersesPage.classList.add("hidden");
    verseSlideshow.classList.remove("hidden");
    hymnList.classList.remove("hidden");
    searchInput.style.display = "block";
    dailyVerseBtn.style.display = "block";
    setHeaderForHome();
    displayHymns();
});

// Verse Slideshow
let currentVerse = 0;
function showVerse() {
    document.getElementById("verseReference").textContent = bibleVerses[currentVerse].reference;
    document.getElementById("verseText").textContent = bibleVerses[currentVerse].text;
    currentVerse = (currentVerse + 1) % bibleVerses.length;
}
showVerse();
setInterval(showVerse, 10000);

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