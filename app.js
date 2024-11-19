const shareButton = document.getElementById("share-bookmarks");
const importButton = document.getElementById("import-bookmarks");
const addButton = document.getElementById("add-bookmark");
const searchBox = document.getElementById("search-box");
const bookmarkGrid = document.getElementById("bookmark-grid");
const toast = document.getElementById("toast");

let bookmarks = []; // Initialize bookmarks array

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
        const { url, image, description } = bookmark;

        const bookmarkEl = document.createElement("div");
        bookmarkEl.className = "bookmark";

        // Delete Icon
        const deleteIcon = document.createElement("span");
        deleteIcon.className = "delete-icon";
        deleteIcon.innerHTML = "&#10006;";
        deleteIcon.title = "Delete Bookmark";
        deleteIcon.onclick = () => {
            if (confirm("Are you sure you want to delete this bookmark?")) {
                bookmarks.splice(index, 1);
                renderBookmarks(bookmarks);
                showToast("Bookmark deleted successfully!");
            }
        };

        // Edit Icon
        const editIcon = document.createElement("span");
        editIcon.className = "edit-icon";
        editIcon.innerHTML = "&#9998;";
        editIcon.title = "Edit Bookmark";
        editIcon.onclick = () => {
            const editableBookmark = renderEditableBookmark(index, bookmark);
            bookmarkGrid.replaceChild(editableBookmark, bookmarkEl);
        };

        const img = document.createElement("img");
        img.src = image;
        img.alt = description;
        img.onclick = () => window.open(normalizeURL(url), "_blank", "noopener,noreferrer");

        const details = document.createElement("div");
        details.className = "bookmark-details";

        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = description;

        details.appendChild(descriptionEl);

        bookmarkEl.appendChild(deleteIcon);
        bookmarkEl.appendChild(editIcon);
        bookmarkEl.appendChild(img);
        bookmarkEl.appendChild(details);
        bookmarkGrid.appendChild(bookmarkEl);
    });
}

// Add Button Click Logic
addButton.addEventListener("click", () => {
    const newEditableBookmark = renderEditableBookmark(null);
    bookmarkGrid.appendChild(newEditableBookmark);
});

// Search functionality
searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.trim();
    const keywords = searchTerm.split(/\s+/).map(kw => kw.toLowerCase());

    const filteredBookmarks = bookmarks.filter(({ url, description }) => {
        const searchableText = `${url} ${description}`.toLowerCase();
        return keywords.every(keyword => searchableText.includes(keyword));
    });

    renderBookmarks(filteredBookmarks);
});

// Share to Clipboard
shareButton.addEventListener("click", async () => {
    try {
        const bookmarksData = JSON.stringify(bookmarks);
        const base64Data = btoa(bookmarksData);
        await navigator.clipboard.writeText(base64Data);
        showToast("Bookmarks shared to clipboard!");
    } catch (error) {
        showToast("Failed to share bookmarks.", "error");
    }
});

// Import from Clipboard
importButton.addEventListener("click", async () => {
    try {
        const base64Data = await navigator.clipboard.readText();
        const bookmarksData = JSON.parse(atob(base64Data));
        if (Array.isArray(bookmarksData)) {
            bookmarks = bookmarksData;
            renderBookmarks(bookmarks);
            showToast("Bookmarks imported from clipboard!");
        } else {
            showToast("Clipboard does not contain valid bookmarks.", "error");
        }
    } catch (error) {
        showToast("Failed to import bookmarks.", "error");
    }
});

// Render editable bookmark
function renderEditableBookmark(index, bookmark = {}) {
    const { url = "", image = "", description = "" } = bookmark;

    const bookmarkEl = document.createElement("div");
    bookmarkEl.className = "bookmark editable";

    bookmarkEl.innerHTML = `
        <input type="url" class="edit-url" placeholder="Enter URL" value="${url}" maxlength="250" required>
        <input type="url" class="edit-image" placeholder="Enter Image URL" value="${image}" maxlength="250" required>
        <textarea class="edit-description" placeholder="Enter Description" maxlength="250">${description}</textarea>
        <div class="edit-actions">
            <button class="save-bookmark">Save</button>
            <button class="cancel-bookmark">Cancel</button>
        </div>
    `;

    bookmarkEl.querySelector(".save-bookmark").onclick = () => {
        const updatedUrl = normalizeURL(bookmarkEl.querySelector(".edit-url").value.trim());
        const updatedImage = bookmarkEl.querySelector(".edit-image").value.trim();
        const updatedDescription = bookmarkEl.querySelector(".edit-description").value.trim();

        if (!updatedUrl || !updatedImage || !updatedDescription) {
            showToast("All fields are required.", "error");
            return;
        }

        if (index !== null) {
            bookmarks[index] = { url: updatedUrl, image: updatedImage, description: updatedDescription };
        } else {
            bookmarks.push({ url: updatedUrl, image: updatedImage, description: updatedDescription });
        }

        renderBookmarks(bookmarks);
        showToast(index !== null ? "Bookmark updated successfully!" : "Bookmark added successfully!");
    };

    bookmarkEl.querySelector(".cancel-bookmark").onclick = () => {
        if (index !== null) {
            renderBookmarks(bookmarks);
        } else {
            bookmarkEl.remove();
        }
    };

    return bookmarkEl;
}

// Initialize app
renderBookmarks(bookmarks);
