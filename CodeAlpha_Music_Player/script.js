/* ============================================
   PULSE PLAYER — Premium Music Player
   Core JavaScript Logic (Real Audio Files)
   ============================================ */

// ──────────────────────────────────────────────
// Playlist Data
// ──────────────────────────────────────────────
// ✅ HOW TO ADD YOUR OWN SONGS:
// 1. Drop your .mp3 files into the "assets/audio/" folder
// 2. (Optional) Add a cover image to "assets/images/"
// 3. Add a new object to this array following the format below
// 4. That's it! The player picks it up automatically.
//
// Fields:
//   id     — Unique number
//   title  — Song name shown in the UI
//   artist — Artist name shown in the UI
//   album  — Album name (used for alt-text)
//   cover  — Path to the album art image
//   src    — Path to the .mp3 audio file
// ──────────────────────────────────────────────

const playlist = [
    {
        id: 1,
        title: "Bikola",
        artist: "Kyelizo",
        album: "Bikola - Single",
        cover: "assets/images/album6.png",
        src: "assets/audio/Kyelizo-music-BIkola.mp3",
    },
    {
        id: 2,
        title: "Perfect (Nawanama)",
        artist: "Wrick Smotch ft. Bucha Man",
        album: "Perfect Cover",
        cover: "assets/images/album7.png",
        src: "assets/audio/Wrick-Smotch-Music-Perfect-Ed-Sheeran-Ed-Sheeran-Deluxe--Nawanama-featuring-Bucha-Man.mp3",
    },
];

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const state = {
    currentIndex: 0,
    isPlaying: false,
    isAutoplay: false,
    isShuffle: false,
    isRepeat: false,
    isMuted: false,
    volume: 0.8,
    previousVolume: 0.8,
    isDraggingProgress: false,
    isDraggingVolume: false,
};

// ──────────────────────────────────────────────
// Audio Element
// ──────────────────────────────────────────────
const audio = document.getElementById("audio-player");
let animationTimer = null;

// ──────────────────────────────────────────────
// DOM Elements
// ──────────────────────────────────────────────
const DOM = {
    albumArt: document.getElementById("album-art"),
    albumArtContainer: document.getElementById("album-art-container"),
    albumArtGlow: document.getElementById("album-art-glow"),
    songTitle: document.getElementById("song-title"),
    songArtist: document.getElementById("song-artist"),
    timeCurrent: document.getElementById("time-current"),
    timeDuration: document.getElementById("time-duration"),
    progressBarContainer: document.getElementById("progress-bar-container"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    progressBarBuffered: document.getElementById("progress-bar-buffered"),
    btnPlay: document.getElementById("btn-play"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnRepeat: document.getElementById("btn-repeat"),
    btnShuffle: document.getElementById("btn-shuffle"),
    btnAutoplay: document.getElementById("btn-autoplay"),
    btnPlaylistToggle: document.getElementById("btn-playlist-toggle"),
    btnVolume: document.getElementById("btn-volume"),
    volumeSliderContainer: document.getElementById("volume-slider-container"),
    volumeSliderFill: document.getElementById("volume-slider-fill"),
    volumeValue: document.getElementById("volume-value"),
    playlistSection: document.getElementById("playlist-section"),
    playlistEl: document.getElementById("playlist"),
    playlistCount: document.getElementById("playlist-count"),
    playerSection: document.getElementById("player-section"),
    visualizer: document.getElementById("visualizer"),
};

// ──────────────────────────────────────────────
// Playlist Rendering
// ──────────────────────────────────────────────
function renderPlaylist() {
    DOM.playlistEl.innerHTML = "";
    DOM.playlistCount.textContent = `${playlist.length} tracks`;

    playlist.forEach((song, index) => {
        const li = document.createElement("li");
        li.className = `playlist-item ${index === state.currentIndex ? "active" : ""}`;
        li.id = `playlist-item-${index}`;
        li.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="playlist-item-thumbnail" loading="lazy">
            <div class="playlist-item-info">
                <p class="playlist-item-title">${song.title}</p>
                <p class="playlist-item-artist">${song.artist}</p>
            </div>
            <span class="playlist-item-duration" data-index="${index}">--:--</span>
            <div class="playlist-item-playing">
                <span class="playing-bar"></span>
                <span class="playing-bar"></span>
                <span class="playing-bar"></span>
            </div>
        `;

        li.addEventListener("click", () => {
            changeSong(index);
            play();
        });

        DOM.playlistEl.appendChild(li);
    });

    // Pre-load durations for all tracks in the playlist
    preloadDurations();
}

/**
 * Pre-load durations for all playlist tracks.
 * Creates temporary Audio elements to read metadata without playing.
 */
function preloadDurations() {
    playlist.forEach((song, index) => {
        const tempAudio = new Audio();
        tempAudio.preload = "metadata";
        tempAudio.src = song.src;

        tempAudio.addEventListener("loadedmetadata", () => {
            const duration = tempAudio.duration;
            // Update the playlist item duration display
            const durationEl = document.querySelector(
                `.playlist-item-duration[data-index="${index}"]`
            );
            if (durationEl) {
                durationEl.textContent = formatTime(duration);
            }
            // If this is the currently loaded song, also update the main duration
            if (index === state.currentIndex && !audio.duration) {
                DOM.timeDuration.textContent = formatTime(duration);
            }
        });
    });
}

function updatePlaylistActive() {
    document.querySelectorAll(".playlist-item").forEach((item, index) => {
        item.classList.toggle("active", index === state.currentIndex);
    });
}

// ──────────────────────────────────────────────
// Song Loading
// ──────────────────────────────────────────────
function loadSong(index) {
    const song = playlist[index];

    // Update UI
    DOM.albumArt.src = song.cover;
    DOM.albumArt.alt = `${song.title} - ${song.album}`;
    DOM.songTitle.textContent = song.title;
    DOM.songArtist.textContent = song.artist;
    DOM.timeCurrent.textContent = "0:00";
    DOM.timeDuration.textContent = "--:--";
    DOM.progressBarFill.style.width = "0%";
    DOM.progressBarBuffered.style.width = "0%";

    // Set audio source
    audio.src = song.src;
    audio.load();

    // Animate transition
    DOM.playerSection.classList.add("song-transition");
    setTimeout(() => DOM.playerSection.classList.remove("song-transition"), 500);

    // Update playlist
    updatePlaylistActive();

    // Update document title
    document.title = `${song.title} — ${song.artist} | Pulse Player`;
}

function changeSong(index) {
    state.currentIndex = index;
    const wasPlaying = state.isPlaying;
    if (state.isPlaying) {
        pause();
    }
    loadSong(index);
    if (wasPlaying) {
        play();
    }
}

// ──────────────────────────────────────────────
// Playback Controls
// ──────────────────────────────────────────────
function play() {
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                state.isPlaying = true;
                updatePlayButton();
                DOM.albumArtContainer.classList.add("playing");
                startProgressAnimation();
                startVisualizer();
            })
            .catch((error) => {
                console.warn("Playback was prevented:", error);
                showToast("Click play to start audio");
            });
    }
}

function pause() {
    audio.pause();
    state.isPlaying = false;
    updatePlayButton();
    DOM.albumArtContainer.classList.remove("playing");
    stopProgressAnimation();
    stopVisualizer();
}

function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function playNext() {
    let nextIndex;

    if (state.isShuffle) {
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === state.currentIndex && playlist.length > 1);
    } else {
        nextIndex = (state.currentIndex + 1) % playlist.length;
    }

    changeSong(nextIndex);
    play();
}

function playPrev() {
    // If we're more than 3 seconds in, restart the current song
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        DOM.progressBarFill.style.width = "0%";
        DOM.timeCurrent.textContent = "0:00";
        return;
    }

    let prevIndex;
    if (state.isShuffle) {
        do {
            prevIndex = Math.floor(Math.random() * playlist.length);
        } while (prevIndex === state.currentIndex && playlist.length > 1);
    } else {
        prevIndex = (state.currentIndex - 1 + playlist.length) % playlist.length;
    }

    changeSong(prevIndex);
    play();
}

function updatePlayButton() {
    const iconPlay = DOM.btnPlay.querySelector(".icon-play");
    const iconPause = DOM.btnPlay.querySelector(".icon-pause");

    if (state.isPlaying) {
        iconPlay.classList.add("hidden");
        iconPause.classList.remove("hidden");
    } else {
        iconPlay.classList.remove("hidden");
        iconPause.classList.add("hidden");
    }
}

// ──────────────────────────────────────────────
// Audio Events
// ──────────────────────────────────────────────

// When metadata is loaded, update the duration display
audio.addEventListener("loadedmetadata", () => {
    DOM.timeDuration.textContent = formatTime(audio.duration);
});

// When the song ends naturally
audio.addEventListener("ended", () => {
    handleSongEnd();
});

// Update buffered progress as audio loads
audio.addEventListener("progress", () => {
    if (audio.buffered.length > 0 && audio.duration) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const percent = (bufferedEnd / audio.duration) * 100;
        DOM.progressBarBuffered.style.width = `${percent}%`;
    }
});

// ──────────────────────────────────────────────
// Progress Bar
// ──────────────────────────────────────────────
function startProgressAnimation() {
    stopProgressAnimation();

    function update() {
        if (!state.isPlaying || state.isDraggingProgress) {
            animationTimer = requestAnimationFrame(update);
            return;
        }

        if (audio.duration) {
            const progress = audio.currentTime / audio.duration;
            DOM.progressBarFill.style.width = `${progress * 100}%`;
            DOM.timeCurrent.textContent = formatTime(audio.currentTime);
        }

        animationTimer = requestAnimationFrame(update);
    }

    animationTimer = requestAnimationFrame(update);
}

function stopProgressAnimation() {
    if (animationTimer) {
        cancelAnimationFrame(animationTimer);
        animationTimer = null;
    }
}

function handleSongEnd() {
    if (state.isRepeat) {
        // Repeat current song
        audio.currentTime = 0;
        audio.play();
        DOM.progressBarFill.style.width = "0%";
        DOM.timeCurrent.textContent = "0:00";
    } else if (state.isAutoplay || state.currentIndex < playlist.length - 1) {
        playNext();
    } else {
        pause();
        audio.currentTime = 0;
        DOM.progressBarFill.style.width = "0%";
        DOM.timeCurrent.textContent = "0:00";
    }
}

function seekTo(clientX) {
    const rect = DOM.progressBarContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    if (audio.duration) {
        audio.currentTime = percent * audio.duration;
        DOM.progressBarFill.style.width = `${percent * 100}%`;
        DOM.timeCurrent.textContent = formatTime(audio.currentTime);
    }
}

// Progress bar interaction
DOM.progressBarContainer.addEventListener("mousedown", (e) => {
    state.isDraggingProgress = true;
    seekTo(e.clientX);
});

DOM.progressBarContainer.addEventListener("touchstart", (e) => {
    state.isDraggingProgress = true;
    seekTo(e.touches[0].clientX);
}, { passive: true });

document.addEventListener("mousemove", (e) => {
    if (state.isDraggingProgress) {
        seekTo(e.clientX);
    }
});

document.addEventListener("touchmove", (e) => {
    if (state.isDraggingProgress) {
        seekTo(e.touches[0].clientX);
    }
}, { passive: true });

document.addEventListener("mouseup", () => {
    state.isDraggingProgress = false;
});

document.addEventListener("touchend", () => {
    state.isDraggingProgress = false;
});

// ──────────────────────────────────────────────
// Volume Control
// ──────────────────────────────────────────────
function setVolume(value) {
    state.volume = Math.max(0, Math.min(1, value));
    audio.volume = state.volume;
    DOM.volumeSliderFill.style.width = `${state.volume * 100}%`;
    DOM.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;

    updateVolumeIcon();
    state.isMuted = state.volume === 0;
}

function updateVolumeIcon() {
    const high = DOM.btnVolume.querySelector(".icon-volume-high");
    const low = DOM.btnVolume.querySelector(".icon-volume-low");
    const mute = DOM.btnVolume.querySelector(".icon-volume-mute");

    high.classList.add("hidden");
    low.classList.add("hidden");
    mute.classList.add("hidden");

    if (state.volume === 0) {
        mute.classList.remove("hidden");
    } else if (state.volume < 0.5) {
        low.classList.remove("hidden");
    } else {
        high.classList.remove("hidden");
    }
}

function toggleMute() {
    if (state.isMuted) {
        setVolume(state.previousVolume || 0.8);
        state.isMuted = false;
    } else {
        state.previousVolume = state.volume;
        setVolume(0);
        state.isMuted = true;
    }
}

function seekVolume(clientX) {
    const rect = DOM.volumeSliderContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(percent);
}

DOM.volumeSliderContainer.addEventListener("mousedown", (e) => {
    state.isDraggingVolume = true;
    seekVolume(e.clientX);
});

DOM.volumeSliderContainer.addEventListener("touchstart", (e) => {
    state.isDraggingVolume = true;
    seekVolume(e.touches[0].clientX);
}, { passive: true });

document.addEventListener("mousemove", (e) => {
    if (state.isDraggingVolume) {
        seekVolume(e.clientX);
    }
});

document.addEventListener("touchmove", (e) => {
    if (state.isDraggingVolume) {
        seekVolume(e.touches[0].clientX);
    }
}, { passive: true });

document.addEventListener("mouseup", () => {
    state.isDraggingVolume = false;
});

document.addEventListener("touchend", () => {
    state.isDraggingVolume = false;
});

// ──────────────────────────────────────────────
// Toggle Features
// ──────────────────────────────────────────────
function toggleAutoplay() {
    state.isAutoplay = !state.isAutoplay;
    DOM.btnAutoplay.classList.toggle("active", state.isAutoplay);
    const badge = DOM.btnAutoplay.querySelector(".autoplay-badge");
    badge.textContent = state.isAutoplay ? "ON" : "OFF";
    showToast(state.isAutoplay ? "Autoplay enabled" : "Autoplay disabled");
}

function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    DOM.btnShuffle.classList.toggle("active", state.isShuffle);
    showToast(state.isShuffle ? "Shuffle enabled" : "Shuffle disabled");
}

function toggleRepeat() {
    state.isRepeat = !state.isRepeat;
    DOM.btnRepeat.classList.toggle("active", state.isRepeat);
    showToast(state.isRepeat ? "Repeat enabled" : "Repeat disabled");
}

function togglePlaylist() {
    DOM.playlistSection.classList.toggle("visible");
    DOM.btnPlaylistToggle.classList.toggle("active");
}

// ──────────────────────────────────────────────
// Audio Visualizer (Canvas)
// ──────────────────────────────────────────────
let visualizerAnimFrame = null;
const visualizerBars = 64;
let barHeights = new Array(visualizerBars).fill(0);

function initVisualizer() {
    const canvas = DOM.visualizer;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = 80;
    }

    resize();
    window.addEventListener("resize", resize);

    return ctx;
}

function startVisualizer() {
    const ctx = initVisualizer();
    const canvas = DOM.visualizer;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / visualizerBars;
        const time = Date.now() / 1000;

        for (let i = 0; i < visualizerBars; i++) {
            // Generate pseudo-random but musically pleasant bar heights
            const targetHeight =
                Math.sin(time * 2 + i * 0.3) * 0.3 +
                Math.sin(time * 3.7 + i * 0.5) * 0.2 +
                Math.sin(time * 1.3 + i * 0.8) * 0.15 +
                0.35;

            // Smooth interpolation
            barHeights[i] += (targetHeight * canvas.height - barHeights[i]) * 0.15;

            const x = i * barWidth;
            const height = Math.max(2, barHeights[i]);
            const y = canvas.height - height;

            // Create gradient for each bar
            const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
            const hue = 260 + (i / visualizerBars) * 60; // purple to pink
            gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 65%, 0.1)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 1, y, barWidth - 2, height);
        }

        visualizerAnimFrame = requestAnimationFrame(draw);
    }

    draw();
}

function stopVisualizer() {
    if (visualizerAnimFrame) {
        cancelAnimationFrame(visualizerAnimFrame);
        visualizerAnimFrame = null;
    }

    // Fade out bars
    const ctx = DOM.visualizer.getContext("2d");
    function fadeOut() {
        let allZero = true;
        for (let i = 0; i < visualizerBars; i++) {
            barHeights[i] *= 0.9;
            if (barHeights[i] > 0.5) allZero = false;
        }

        ctx.clearRect(0, 0, DOM.visualizer.width, DOM.visualizer.height);
        const barWidth = DOM.visualizer.width / visualizerBars;

        for (let i = 0; i < visualizerBars; i++) {
            const height = Math.max(0, barHeights[i]);
            const x = i * barWidth;
            const y = DOM.visualizer.height - height;

            const gradient = ctx.createLinearGradient(x, y, x, DOM.visualizer.height);
            const hue = 260 + (i / visualizerBars) * 60;
            gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.6)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 65%, 0.05)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 1, y, barWidth - 2, height);
        }

        if (!allZero) {
            requestAnimationFrame(fadeOut);
        }
    }

    fadeOut();
}

// ──────────────────────────────────────────────
// Toast Notifications
// ──────────────────────────────────────────────
let toastTimeout = null;

function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    if (toastTimeout) clearTimeout(toastTimeout);

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 400);
    }, 2000);
}

// ──────────────────────────────────────────────
// Utility Functions
// ──────────────────────────────────────────────
function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ──────────────────────────────────────────────
// Keyboard Controls
// ──────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "Space":
            e.preventDefault();
            togglePlay();
            break;
        case "ArrowRight":
            e.preventDefault();
            if (e.shiftKey) {
                playNext();
            } else {
                // Seek forward 5 seconds
                if (audio.duration) {
                    audio.currentTime = Math.min(
                        audio.currentTime + 5,
                        audio.duration
                    );
                }
            }
            break;
        case "ArrowLeft":
            e.preventDefault();
            if (e.shiftKey) {
                playPrev();
            } else {
                // Seek backward 5 seconds
                audio.currentTime = Math.max(audio.currentTime - 5, 0);
            }
            break;
        case "ArrowUp":
            e.preventDefault();
            setVolume(state.volume + 0.05);
            break;
        case "ArrowDown":
            e.preventDefault();
            setVolume(state.volume - 0.05);
            break;
        case "KeyM":
            toggleMute();
            break;
        case "KeyR":
            toggleRepeat();
            break;
        case "KeyS":
            toggleShuffle();
            break;
        case "KeyA":
            toggleAutoplay();
            break;
        case "KeyP":
            togglePlaylist();
            break;
    }
});

// ──────────────────────────────────────────────
// Event Listeners
// ──────────────────────────────────────────────
DOM.btnPlay.addEventListener("click", togglePlay);
DOM.btnNext.addEventListener("click", playNext);
DOM.btnPrev.addEventListener("click", playPrev);
DOM.btnRepeat.addEventListener("click", toggleRepeat);
DOM.btnShuffle.addEventListener("click", toggleShuffle);
DOM.btnAutoplay.addEventListener("click", toggleAutoplay);
DOM.btnPlaylistToggle.addEventListener("click", togglePlaylist);
DOM.btnVolume.addEventListener("click", toggleMute);

// Prevent default touch behavior on controls
document.querySelectorAll(".btn-play, .btn-control, .btn-icon").forEach((btn) => {
    btn.addEventListener("touchstart", (e) => {
        e.stopPropagation();
    }, { passive: true });
});

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────
function init() {
    loadSong(0);
    renderPlaylist();
    setVolume(state.volume);

    // Show playlist by default on larger screens
    if (window.innerWidth >= 768) {
        DOM.playlistSection.classList.add("visible");
        DOM.btnPlaylistToggle.classList.add("active");
    }

    // Initialize visualizer canvas size
    const canvas = DOM.visualizer;
    canvas.width = window.innerWidth;
    canvas.height = 80;
}

// Run initialization
init();
