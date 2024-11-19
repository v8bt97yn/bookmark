const secretKey = "mySecretKey"; // Replace with a stronger key for production
const copyButton = document.getElementById("copy-link");
const addButton = document.getElementById("add-bookmark");
const submitButton = document.getElementById("submit-bookmark");
const addForm = document.getElementById("add-form");
const searchBox = document.getElementById("search-box");
const bookmarkGrid = document.getElementById("bookmark-grid");
const toast = document.getElementById("toast");

let bookmarks = getQueryStringData();

// Parse query string
function getQueryStringData() {
    const params = new URLSearchParams(window.location.search);
    const encryptedData = params.get("data");
    if (encryptedData) {
        try {
            const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedData);
        } catch (error) {
            showToast("Failed to decrypt query string", "error");
        }
    }
    return [];
}

// Update query string in the URL
function updateQueryString(bookmarks) {
    const data = JSON.stringify(bookmarks);
    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    const newQueryString = `?data=${encodeURIComponent(encryptedData)}`;
    history.replaceState(null, "", newQueryString);
}

// Show toast message
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// Normalize URL (add protocol if missing)
function normalizeURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
}

// Render bookmarks
function renderBookmarks(bookmarksToRender) {
    bookmarkGrid.innerHTML = "";
    bookmarksToRender.forEach((bookmark, index) => {
        const { url, image, title, description, tags } = bookmark;

        const bookmarkEl = document.createElement("div");
        bookmarkEl.className = "bookmark";

        // Delete Icon
        const deleteIcon = document.createElement("span");
        deleteIcon.className = "delete-icon";
        deleteIcon.innerHTML = "&#10006;"; // "X" icon
        deleteIcon.title = "Delete Bookmark";
        deleteIcon.onclick = () => {
            if (confirm("Are you sure you want to delete this bookmark?")) {
                bookmarks.splice(index, 1);
                updateQueryString(bookmarks);
                renderBookmarks(bookmarks);
                showToast("Bookmark deleted successfully!");
            }
        };

        const img = document.createElement("img");
        img.src = image;
        img.alt = title;
        img.onclick = () => window.open(normalizeURL(url), "_blank", "noopener,noreferrer");

        const details = document.createElement("div");
        details.className = "bookmark-details";

        const titleEl = document.createElement("h3");
        titleEl.textContent = title;

        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = description;

        const tagsEl = document.createElement("div");
        tagsEl.className = "tags";
        tagsEl.textContent = tags ? `Tags: ${tags}` : "";

        details.appendChild(titleEl);
        details.appendChild(descriptionEl);
        details.appendChild(tagsEl);

        bookmarkEl.appendChild(deleteIcon); // Add the delete icon
        bookmarkEl.appendChild(img);
        bookmarkEl.appendChild(details);
        bookmarkGrid.appendChild(bookmarkEl);
    });
}


// Show and hide the popup form
addButton.addEventListener("click", () => {
    addForm.style.display = addForm.style.display === "none" || !addForm.style.display ? "block" : "none";
});

// Add a new bookmark
submitButton.addEventListener("click", () => {
    let url = document.getElementById("url-input").value.trim();
    const image = document.getElementById("image-input").value.trim();
    const title = document.getElementById("title-input").value.trim();
    const description = document.getElementById("description-input").value.trim();
    const tags = document.getElementById("tags-input").value.trim();

    if (!url || !image || !title) {
        showToast("URL, Image, and Title are required.", "error");
        return;
    }

    url = normalizeURL(url);

    bookmarks.push({ url, image, title, description, tags });
    updateQueryString(bookmarks);
    renderBookmarks(bookmarks);

    // Clear inputs and close the form
    document.getElementById("url-input").value = "";
    document.getElementById("image-input").value = "";
    document.getElementById("title-input").value = "";
    document.getElementById("description-input").value = "";
    document.getElementById("tags-input").value = "";
    addForm.style.display = "none";
    showToast("Bookmark added successfully!");
});

// Copy encrypted URL to clipboard
copyButton.addEventListener("click", () => {
    const encryptedData = new URLSearchParams(window.location.search).get("data");
    if (encryptedData) {
        navigator.clipboard.writeText(window.location.href)
            .then(() => showToast("Encrypted link copied to clipboard!"))
            .catch(() => showToast("Failed to copy the link", "error"));
    }
});

// Search functionality
searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.trim();
    const regex = new RegExp(searchTerm, "i");
    const filteredBookmarks = bookmarks.filter(({ url, title, description, tags }) =>
        regex.test(url) || regex.test(title) || regex.test(description) || regex.test(tags)
    );
    renderBookmarks(filteredBookmarks);
});

// Initialize app
renderBookmarks(bookmarks);

// Close form when clicking outside
document.addEventListener("click", (event) => {
    if (!addForm.contains(event.target) && event.target !== addButton) {
        addForm.style.display = "none";
    }
});
