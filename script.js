const accesskey = "F0aUDT-LA3hhltMHTwNBYeuL__x54DrME26NtYzpavk";

const searchform = document.querySelector("form");
const imgcontainer = document.querySelector(".images-container");
const searchinput = document.querySelector(".searchinp");
const loadbutton = document.querySelector(".loadbtn");
const modal = document.querySelector(".modal");
const modalImg = document.querySelector(".modal-img");
const closeBtn = document.querySelector(".close");
const modalDownload = document.querySelector(".modal-download");

let page = 1;
let currentQuery = "";

// Hide load button by default
loadbutton.style.display = "none";

// ✅ Toast Notification System
const toastContainer = document.createElement("div");
toastContainer.classList.add("toast-container");
document.body.appendChild(toastContainer);

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ✅ Safe Image Download Function (no new tab)
async function triggerDownload(photo) {
  try {
    showToast("Downloading image...", "info");

    // Notify Unsplash (required)
    await fetch(`${photo.links.download_location}?client_id=${accesskey}`);

    // Fetch the actual image file
    const response = await fetch(photo.urls.full);
    const blob = await response.blob();

    // Create hidden link for download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `unsplash-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    showToast("✅ Download started!", "success");
  } catch (err) {
    console.error("Download error:", err);
    showToast("⚠️ Download failed. Please try again.", "error");
  }
}

// ✅ Fetch and display images
const fetchimage = async (query, pageno = 1, restoreMode = false) => {
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=28&page=${pageno}&client_id=${accesskey}`;

  try {
    if (!restoreMode) {
      if (pageno === 1) {
        imgcontainer.innerHTML = `<p style="color:#ccc; text-align:center;">Loading images...</p>`;
      } else {
        loadbutton.textContent = "Loading...";
        loadbutton.disabled = true;
      }
    }

    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch images: ${response.status}`);

    const data = await response.json();

    if (pageno === 1 && !restoreMode) imgcontainer.innerHTML = "";

    if (data.results.length === 0 && pageno === 1) {
      imgcontainer.innerHTML = "<p>No images found. Try another search!</p>";
      loadbutton.style.display = "none";
      return;
    }

    renderImages(data.results);

    // ✅ Save to localStorage for persistence
    if (!restoreMode) {
      localStorage.setItem("lastSearch", query);
      localStorage.setItem("lastResults", JSON.stringify(data.results));
    }

    // Manage Load More
    if (data.total_pages && data.total_pages > pageno) {
      loadbutton.style.display = "block";
    } else {
      loadbutton.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    imgcontainer.innerHTML = `<p style="color:red;">⚠️ Failed to load images. Please try again later.</p>`;
    loadbutton.style.display = "none";
  } finally {
    loadbutton.textContent = "Load More";
    loadbutton.disabled = false;
  }
};

// ✅ Function to render image cards
function renderImages(results) {
  results.forEach((photo) => {
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("imagediv");

    const img = document.createElement("img");
    img.src = photo.urls.regular;
    img.alt = photo.alt_description || "";
    img.loading = "lazy";

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const downloadBtn = document.createElement("button");
    downloadBtn.classList.add("download-btn");
    downloadBtn.innerHTML = "⬇";
    downloadBtn.title = "Download Image";

    downloadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerDownload(photo);
    });

    overlay.appendChild(downloadBtn);

    img.addEventListener("click", () => {
      modal.style.display = "block";
      modalImg.src = photo.urls.full;
      modalDownload.onclick = () => triggerDownload(photo);
    });

    imageDiv.appendChild(img);
    imageDiv.appendChild(overlay);
    imgcontainer.appendChild(imageDiv);
  });
}

// ✅ Search form submit
searchform.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputText = searchinput.value.trim();

  if (inputText) {
    page = 1;
    currentQuery = inputText;
    fetchimage(currentQuery, page);
  } else {
    imgcontainer.innerHTML = `<h2>Please enter a search query.</h2>`;
    loadbutton.style.display = "none";
  }
});

// ✅ Load More
loadbutton.addEventListener("click", () => {
  if (currentQuery) {
    fetchimage(currentQuery, ++page);
  } else {
    imgcontainer.innerHTML = `<h2>Please search for something first!</h2>`;
    loadbutton.style.display = "none";
  }
});

// ✅ Modal close
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

let currentIndex = 0;
let allPhotos = [];

// Modify renderImages to track all photos
function renderImages(results) {
  allPhotos = results; // store all current photos

  results.forEach((photo, index) => {
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("imagediv");

    const img = document.createElement("img");
    img.src = photo.urls.regular;
    img.alt = photo.alt_description || "";
    img.loading = "lazy";

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const downloadBtn = document.createElement("button");
    downloadBtn.classList.add("download-btn");
    downloadBtn.innerHTML = "⬇";
    downloadBtn.title = "Download Image";

    downloadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerDownload(photo);
    });

    overlay.appendChild(downloadBtn);

    // ✅ Open preview container on click
    img.addEventListener("click", () => openPreview(index));

    imageDiv.appendChild(img);
    imageDiv.appendChild(overlay);
    imgcontainer.appendChild(imageDiv);
  });
}


