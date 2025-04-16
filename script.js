// chunk randomize
const CHUNK_SIZE = 100;
let shuffledImages = [];
const loadMoreTrigger = document.getElementById("loadMoreTrigger");

// NOTE: Browsers can't read file directories. This must be done server-side (e.g. Node.js, PHP) to generate a JSON array of paths like:
// originalImages = [{ id: 1, src: './images/folder1/0001.jpg' }, ...];
const originalImages = Array.from({ length: 1444 }, (_, i) => ({
    id: i + 1,
    src: `./images/${String(i + 1).padStart(4, '0')}.webp`
}));
let currentImages = [...originalImages];

const gallery = document.getElementById("gallery");
const twoCol = document.getElementById("twoCol");
const threeCol = document.getElementById("threeCol");
const fourCol = document.getElementById("fourCol");
const oneCol = document.getElementById("oneCol");
const overlay = document.getElementById("overlay");
const overlayImg = document.getElementById("overlayImg");
const closeBtn = document.getElementById("closeBtn");
const themeToggle = document.getElementById("themeToggle");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    threshold: 0.2
});

let currentIndex = 0;

const openOverlay = (index) => {
    currentIndex = index;
    overlayImg.src = currentImages[index].src;
    overlay.classList.remove("closing");
    overlay.classList.add("active");
};

const showNextImage = () => {
    if (currentIndex !== null) {
        currentIndex = (currentIndex + 1) % currentImages.length;
        overlayImg.src = currentImages[currentIndex].src;
    }
};

const showPrevImage = () => {
    if (currentIndex !== null) {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        overlayImg.src = currentImages[currentIndex].src;
    }
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
    else if (e.key === "ArrowRight") showNextImage();
    else if (e.key === "ArrowLeft") showPrevImage();
});

const renderGallery = (imageArray) => {
    // Note: originalImages array must be pre-generated server-side
    gallery.innerHTML = "";
    imageArray.forEach(({ id, src }, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        const image = document.createElement("img");
        image.src = src;
        image.dataset.id = id;
        div.appendChild(image);
        
        const idLabel = document.createElement("div");
        idLabel.className = "photo-id";
        idLabel.textContent = id;
        div.appendChild(idLabel);
        
        div.addEventListener("click", () => {
            openOverlay(index);
        });
        gallery.appendChild(div);
        observer.observe(div);
    });
};

renderGallery(currentImages);

const closeOverlay = () => {
    overlay.classList.remove("active");
    overlay.classList.add("closing");
    setTimeout(() => {
        overlay.classList.remove("closing");
        overlayImg.src = "";
    }, 400);
};

closeBtn.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === overlayImg) closeOverlay();
});

const triggerGridTransition = () => {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => item.classList.remove('visible'));
    setTimeout(() => items.forEach(item => item.classList.add('visible')), 50);
}
;
const layoutButtons = [oneCol, twoCol, threeCol, fourCol];
const setActiveLayoutButton = (activeBtn) => {
    layoutButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
};

oneCol.addEventListener("click", () => {
    gallery.classList.remove("two-column", "three-column", "four-column", "huge-grid");
    gallery.classList.add("one-column");
    setActiveLayoutButton(oneCol);
    triggerGridTransition();
});

twoCol.addEventListener("click", () => {
    gallery.classList.remove("three-column", "four-column", "one-column", "huge-grid");
    gallery.classList.add("two-column");
    setActiveLayoutButton(twoCol);
    triggerGridTransition();
});

threeCol.addEventListener("click", () => {
    gallery.classList.remove("two-column", "four-column", "one-column", "huge-grid");
    gallery.classList.add("three-column");
    setActiveLayoutButton(threeCol);
    triggerGridTransition();
});

fourCol.addEventListener("click", () => {
    gallery.classList.remove("two-column", "three-column", "one-column", "huge-grid");
    gallery.classList.add("four-column");
    setActiveLayoutButton(fourCol);
    triggerGridTransition();
});

const shuffleToggle = document.getElementById("shuffleToggle");
const normalToggle = document.getElementById("normalToggle");
let isShuffled = false;

shuffleToggle.addEventListener("click", () => {
    isShuffled = true;
    startShuffledView();
    triggerGridTransition();
});

normalToggle.addEventListener("click", () => {
    currentImages = [...originalImages];
    isShuffled = false;
    renderGallery(currentImages);
    triggerGridTransition();
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

const renderChunk = () => {
    if (currentIndex >= shuffledImages.length) {
        sentinelObserver.disconnect();
        return;
    }
    const chunk = shuffledImages.slice(currentIndex, currentIndex + CHUNK_SIZE);
chunk.forEach(({ id, src }, index) => {
const div = document.createElement("div");
div.className = "gallery-item";
const image = document.createElement("img");
image.src = src;
image.dataset.id = id;
image.loading = "lazy";

const idLabel = document.createElement("div");
idLabel.className = "photo-id";
idLabel.textContent = id;

div.appendChild(image);
div.appendChild(idLabel);

div.addEventListener("click", () => {
    const absoluteIndex = currentImages.findIndex(img => img.src === src);
    openOverlay(absoluteIndex);
});
gallery.appendChild(div);
observer.observe(div);
});

currentIndex += CHUNK_SIZE;
};

const sentinelObserver = new IntersectionObserver((entries) => {
if (entries[0].isIntersecting) {
renderChunk();
}
}, {
rootMargin: "300px",
threshold: 0.1
});

const startShuffledView = () => {
gallery.innerHTML = "";
currentIndex = 0;
shuffledImages = [...originalImages].sort(() => Math.random() - 0.5);
renderChunk();
sentinelObserver.observe(loadMoreTrigger);
};

setActiveLayoutButton(twoCol);
