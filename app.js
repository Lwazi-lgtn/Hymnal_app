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

const verseSlideshow = document.getElementById("verseSlideshow");
const dailyVerseBtn = document.getElementById("dailyVerseBtn");
const dailyVersesPage = document.getElementById("dailyVersesPage");
const dailyVersesBackBtn = document.getElementById("dailyVersesBackBtn");

const bibleVerses = [
    { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
    { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    { reference: "John 3:16", text: "For God so loved the world that He gave His only begotten Son." },
    { reference: "Proverbs 3:5", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
    { reference: "Isaiah 41:10", text: "Fear not, for I am with you." }
];

// Load Hymns
fetch("hymns.json")
    .then(res => res.json())
    .then(data => {
        hymns = data;
        filteredHymns = [...data];
        displayHymns();
    })
    .catch(err => console.error(err));

// Loading Indicator
    const loading = document.getElementById("loading");

    loading.style.display = "none";

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
        card.onclick = () => openHymn(hymn);
        hymnList.appendChild(card);
    });

    updatePaginationButtons();
}

// OPEN HYMN
function openHymn(hymn) {
    hymnTitle.textContent = `${hymn.number} - ${hymn.title}`;
    hymnLyrics.textContent = hymn.lyrics;

    // Hide home screen elements
    hymnList.classList.add("hidden");
    verseSlideshow.classList.add("hidden");
    dailyVersesPage.classList.add("hidden");
    dailyVerseBtn.style.display = "none";
    pagination.style.display = "none";
    searchInput.style.display = "none";

    hymnDetails.classList.remove("hidden");

    // Clear the search bar after selecting a hymn
    searchInput.value = "";
}

backBtn.addEventListener("click", () => {
    hymnDetails.classList.add("hidden");

    hymnList.classList.remove("hidden");
    verseSlideshow.classList.remove("hidden");
    dailyVerseBtn.style.display = "block";
    searchInput.style.display = "block";
    pagination.style.display = "block";

    currentPage = 1;
    filteredHymns = [...hymns];
    displayHymns();
});

// SEARCH
searchInput.addEventListener("input", (e) => {
    currentPage = 1;
    const value = e.target.value.toLowerCase();

    filteredHymns = hymns.filter(hymn =>
        hymn.title.toLowerCase().includes(value) ||
        hymn.number.toString().includes(value)
    );

    displayHymns();

    // Optional: Clear search bar after results show (uncomment if you want)
    // searchInput.value = "";
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
    dailyVersesPage.classList.remove("hidden");
});

dailyVersesBackBtn.addEventListener("click", () => {
    dailyVersesPage.classList.add("hidden");
    verseSlideshow.classList.remove("hidden");
    hymnList.classList.remove("hidden");
    searchInput.style.display = "block";
    dailyVerseBtn.style.display = "block";
    updatePaginationButtons();
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

// Initialize
window.addEventListener('load', () => {
    setTimeout(displayHymns, 300);
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });     

    }