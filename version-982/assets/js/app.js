import { H as Hls } from "./hls-vendor.js";

const body = document.body;
const toggle = document.querySelector(".mobile-toggle");

if (toggle) {
    toggle.addEventListener("click", () => {
        body.classList.toggle("menu-open");
    });
}

document.querySelectorAll(".site-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        body.classList.remove("menu-open");
    });
});

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
    };

    const start = () => {
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const reset = () => {
        window.clearInterval(timer);
        start();
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.slide || 0));
            reset();
        });
    });

    showSlide(0);
    start();
}

const normalize = (value) => String(value || "").trim().toLowerCase();

const applyFilter = (input, list, countTarget) => {
    const keyword = normalize(input.value);
    let total = 0;
    let visible = 0;

    list.forEach((item) => {
        total += 1;
        const blob = normalize(`${item.dataset.title || ""} ${item.dataset.meta || ""} ${item.textContent || ""}`);
        const matched = !keyword || blob.includes(keyword);
        item.classList.toggle("hidden-by-search", !matched);
        if (matched) {
            visible += 1;
        }
    });

    if (countTarget) {
        countTarget.textContent = keyword ? `当前匹配 ${visible} 条内容` : "";
    }
};

const searchInput = document.querySelector("#search-input");

if (searchInput) {
    const list = Array.from(document.querySelectorAll(".searchable-list .movie-card, .searchable-list .rank-card"));
    const resultCount = document.querySelector(".result-count");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";

    searchInput.value = initial;
    applyFilter(searchInput, list, resultCount);

    searchInput.addEventListener("input", () => applyFilter(searchInput, list, resultCount));

    document.querySelectorAll(".search-chips button").forEach((button) => {
        button.addEventListener("click", () => {
            searchInput.value = button.dataset.keyword || "";
            applyFilter(searchInput, list, resultCount);
            searchInput.focus();
        });
    });

    const clearButton = document.querySelector(".clear-search");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            applyFilter(searchInput, list, resultCount);
            searchInput.focus();
        });
    }
}

document.querySelectorAll(".local-filter").forEach((input) => {
    const scope = input.closest("main") || document;
    const list = Array.from(scope.querySelectorAll(".searchable-list .movie-card, .searchable-list .rank-card"));
    input.addEventListener("input", () => applyFilter(input, list, null));
});

const startPlayer = (player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const url = player.getAttribute("data-stream-url");
    let attached = false;
    let hls = null;

    if (!video || !url) {
        return;
    }

    const attach = () => {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }

        video.src = url;
    };

    const play = () => {
        attach();
        if (overlay) {
            overlay.classList.add("hidden");
        }
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", () => {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    });

    video.addEventListener("ended", () => {
        if (overlay) {
            overlay.classList.remove("hidden");
        }
    });

    window.addEventListener("beforeunload", () => {
        if (hls) {
            hls.destroy();
        }
    });
};

document.querySelectorAll(".player").forEach(startPlayer);
