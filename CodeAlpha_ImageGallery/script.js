// Premium Image Data Source
const images = [
    { id: 1, category: 'Nature', title: 'Misty Mountains', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', size: 'tall' },
    { id: 2, category: 'Architecture', title: 'Modern Cityscape', src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop', size: 'wide' },
    { id: 3, category: 'Animals', title: 'Majestic Lion', src: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1200&auto=format&fit=crop', size: 'normal' },
    { id: 4, category: 'Nature', title: 'Autumn Forest', src: 'https://images.unsplash.com/photo-1440613905118-99b921706b5c?q=80&w=1200&auto=format&fit=crop', size: 'normal' },
    { id: 5, category: 'Architecture', title: 'Minimalist Interior', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop', size: 'tall' },
    { id: 6, category: 'Nature', title: 'Ocean Waves', src: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=1200&auto=format&fit=crop', size: 'normal' },
    { id: 7, category: 'Animals', title: 'Wild Elephant', src: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1200&auto=format&fit=crop', size: 'wide' },
    { id: 8, category: 'Nature', title: 'Desert Dunes', src: 'https://images.unsplash.com/photo-1682687982501-1e58f810143e?q=80&w=1200&auto=format&fit=crop', size: 'normal' },
    { id: 9, category: 'Architecture', title: 'Historic Bridge', src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop', size: 'normal' },
    { id: 10, category: 'Animals', title: 'Colorful Macaw', src: 'https://images.unsplash.com/photo-1552728089-57168a1524e9?q=80&w=1200&auto=format&fit=crop', size: 'tall' }
];

const categories = ['All', 'Nature', 'Architecture', 'Animals'];

// DOM Elements
const galleryContainer = document.getElementById('gallery');
const filtersContainer = document.getElementById('filters');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxOverlay = document.getElementById('lightbox-overlay');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loader = document.getElementById('lightbox-loader');

let currentFilter = 'All';
let filteredImages = [...images];
let currentImageIndex = 0;

// Initialize Application
function init() {
    renderFilters();
    renderGallery();
    setupEventListeners();
}

// Render Filter Buttons Dynamically
function renderFilters() {
    filtersContainer.innerHTML = '';
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.classList.add('filter-btn');
        if (category === currentFilter) btn.classList.add('active');
        btn.textContent = category;
        btn.addEventListener('click', () => {
            currentFilter = category;
            updateFilters();
            renderGallery();
        });
        filtersContainer.appendChild(btn);
    });
}

// Update Active Filter Styling
function updateFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Render Gallery Images
function renderGallery() {
    galleryContainer.innerHTML = '';
    
    if (currentFilter === 'All') {
        filteredImages = [...images];
    } else {
        filteredImages = images.filter(img => img.category === currentFilter);
    }

    filteredImages.forEach((img, index) => {
        const delay = index * 0.05; // Staggered animation for premium feel
        
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        if (img.size !== 'normal') item.classList.add(img.size);
        item.style.animationDelay = `${delay}s`;
        
        item.innerHTML = `
            <img src="${img.src}" alt="${img.title}" loading="lazy">
            <div class="gallery-item-overlay">
                <div class="overlay-content">
                    <div class="item-category">${img.category}</div>
                    <div class="item-title">${img.title}</div>
                </div>
            </div>
        `;

        item.addEventListener('click', () => openLightbox(index));
        galleryContainer.appendChild(item);
    });
}

// Lightbox Logic
function openLightbox(index) {
    currentImageIndex = index;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    updateLightboxContent();
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear image after fade out transition (0.4s) to prevent flicker on next open
    setTimeout(() => {
        lightboxImg.src = '';
        lightboxImg.classList.remove('loaded');
    }, 400); 
}

function updateLightboxContent() {
    const imgData = filteredImages[currentImageIndex];
    
    // Show loader and hide image until loaded
    loader.classList.add('active');
    lightboxImg.classList.remove('loaded');
    
    // Set the new source
    lightboxImg.src = imgData.src;
    lightboxImg.alt = imgData.title;
    lightboxCaption.textContent = imgData.title;

    // Fade in image once it's fully loaded
    lightboxImg.onload = () => {
        loader.classList.remove('active');
        lightboxImg.classList.add('loaded');
    };
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateLightboxContent();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxContent();
}

// Setup Event Listeners
function setupEventListeners() {
    closeBtn.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}

// Run the application
init();
