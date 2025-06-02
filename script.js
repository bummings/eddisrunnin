const CHUNK_SIZE = 100;
let shuffledImages = [];
const loadMoreTrigger = document.getElementById("loadMoreTrigger");

const useProdImages = true; // Set this to true for production
// TODO: add a "staging" h1 to sidemenu to distinguish when workin locally

if (!useProdImages) {
    const stagingTag = document.createElement("div");
    stagingTag.textContent = "S";
    stagingTag.style.fontSize = "12px";
    stagingTag.style.opacity = "0.6";
    stagingTag.style.marginTop = "auto";
    stagingTag.style.alignSelf = "flex-end";
    stagingTag.style.fontFamily = "monospace";
    stagingTag.style.letterSpacing = "1px";
    const controls = document.querySelector('.controls');
    controls.appendChild(stagingTag);
    controls.style.background = 'salmon';
}

const getImageSrc = (i) =>
  useProdImages
    ? `https://eddisrunnin.hello-361.workers.dev/${String(i + 1).padStart(4, '0')}.webp`
    : `./images/${String(i + 1).padStart(4, '0')}.webp`;

// NOTE: Browsers can't read file directories. This must be done server-side (e.g. Node.js, PHP) to generate a JSON array of paths like:
// originalImages = [{ id: 1, src: './images/folder1/0001.jpg' }, ...];
const originalImages = Array.from({ length: 1444 }, (_, i) => ({
    id: i + 1,
    src: getImageSrc(i)
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

const drainObserver = new IntersectionObserver(entries => {
    let topMostVisible = null;
    let topOffset = Infinity;

    entries.forEach(entry => {
        if (entry.isIntersecting && entry.boundingClientRect.top < topOffset) {
            topOffset = entry.boundingClientRect.top;
            topMostVisible = entry.target;
        }
    });

    if (topMostVisible) {
        // Calculate index of visible element in the gallery
        const index = Array.prototype.indexOf.call(gallery.children, topMostVisible);
        const progress = Math.min(index / originalImages.length, 1);
        controls.style.background = `linear-gradient(to bottom, #E8E4DD ${progress * 100}%, salmon ${progress * 100}%)`;
        controls.style.transition = 'background 0.2s ease-out';
    }
}, {
    root: document.querySelector('.main'),
    threshold: 0.01
});

const controls = document.querySelector('.controls');

const main = document.getElementById('main') || document.querySelector('main');
// const updateSidebarGradient = () => {
//     const loaded = gallery.querySelectorAll('.gallery-item').length;
//     const total = originalImages.length;
//     const progress = Math.min(loaded / total, 1);
//     controls.style.background = `linear-gradient(to bottom, white ${progress * 100}%, salmon ${progress * 100}%)`;
//     controls.style.transition = 'background 0.4s ease';
// };

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
            const absoluteIndex = currentImages.findIndex(img => img.id === id);
            openOverlay(absoluteIndex);
        });
        gallery.appendChild(div);
        observer.observe(div);
        drainObserver.observe(div);
    });
    // updateSidebarGradient();
};

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
    const topItem = Array.from(gallery.children).find(div =>
        div.getBoundingClientRect().top >= 0 &&
        div.getBoundingClientRect().top <= window.innerHeight
    );
    const loadedCount = topItem
        ? Array.prototype.indexOf.call(gallery.children, topItem)
        : gallery.querySelectorAll('.gallery-item').length;
    isShuffled = true;
    const seen = originalImages.slice(0, loadedCount);
    const unseen = originalImages.slice(loadedCount);
    const shuffledUnseen = [...unseen].sort(() => Math.random() - 0.5);
    shuffledImages = [...seen, ...shuffledUnseen];
    currentImages = [...shuffledImages];
    currentIndex = loadedCount;
    gallery.innerHTML = "";
    const chunk = shuffledImages.slice(0, loadedCount);
    chunk.forEach(({ id, src }) => {
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
            const absoluteIndex = currentImages.findIndex(img => img.id === id);
            openOverlay(absoluteIndex);
        });
        gallery.appendChild(div);
        observer.observe(div);
        drainObserver.observe(div);
    });
    sentinelObserver.observe(loadMoreTrigger);
    triggerGridTransition();
});

normalToggle.addEventListener("click", () => {
    currentImages = [...originalImages];
    isShuffled = false;
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
            const absoluteIndex = currentImages.findIndex(img => img.id === id);
            openOverlay(absoluteIndex);
        });
        gallery.appendChild(div);
        observer.observe(div);
        drainObserver.observe(div);
    });

    currentIndex += CHUNK_SIZE;
    // updateSidebarGradient();
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
    currentImages = [...shuffledImages];
    renderChunk();
    sentinelObserver.observe(loadMoreTrigger);
};

const startNormalView = () => {
    gallery.innerHTML = "";
    currentIndex = 0;
    shuffledImages = [...originalImages]; // use shared buffer
    currentImages = [...shuffledImages];
    renderChunk();
    sentinelObserver.observe(loadMoreTrigger);
};

startNormalView();
setActiveLayoutButton(twoCol);
