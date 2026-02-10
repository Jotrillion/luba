const yearEl = document.getElementById("currentyear");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const modifiedEl = document.getElementById("lastModified");
if (modifiedEl) {
    modifiedEl.textContent = `Last modified: ${document.lastModified}`;
}
