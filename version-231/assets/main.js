const ready = (callback) => {
  if (document.readyState !== "loading") {
    callback();
    return;
  }

  document.addEventListener("DOMContentLoaded", callback);
};

ready(() => {
  setupMobileMenu();
  setupHeroCarousel();
  setupQuickSearch();
  setupFilters();
  setupPlayers();
});

function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  window.setInterval(() => {
    showSlide(current + 1);
  }, 6500);
}

function setupQuickSearch() {
  const forms = Array.from(document.querySelectorAll("[data-site-search]"));

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = form.querySelector("input");
      const query = input ? input.value.trim() : "";
      const target = query ? `./all.html?q=${encodeURIComponent(query)}` : "./all.html";

      window.location.href = target;
    });
  });
}

function setupFilters() {
  const cards = Array.from(document.querySelectorAll(".movie-card[data-title]"));

  if (cards.length === 0) {
    return;
  }

  const input = document.querySelector("[data-filter-input]");
  const yearSelect = document.querySelector("[data-filter-year]");
  const typeSelect = document.querySelector("[data-filter-type]");
  const resetButton = document.querySelector("[data-filter-reset]");
  const resultCount = document.querySelector("[data-result-count]");
  const emptyResult = document.querySelector("[data-empty-result]");
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (query && input) {
    input.value = query;
  }

  const getText = (card) => {
    return [
      card.dataset.title,
      card.dataset.year,
      card.dataset.type,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags
    ].join(" ").toLowerCase();
  };

  const applyFilter = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const year = yearSelect ? yearSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const matchesKeyword = keyword === "" || getText(card).includes(keyword);
      const matchesYear = year === "" || card.dataset.year === year;
      const matchesType = type === "" || card.dataset.type === type;
      const show = matchesKeyword && matchesYear && matchesType;

      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = `显示 ${visible} / ${cards.length}`;
    }

    if (emptyResult) {
      emptyResult.style.display = visible === 0 ? "block" : "none";
    }
  };

  [input, yearSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (input) {
        input.value = "";
      }

      if (yearSelect) {
        yearSelect.value = "";
      }

      if (typeSelect) {
        typeSelect.value = "";
      }

      applyFilter();
    });
  }

  applyFilter();
}

function setupPlayers() {
  const videos = Array.from(document.querySelectorAll("video[data-hls-src]"));

  videos.forEach((video) => {
    const source = video.dataset.hlsSrc;
    const shell = video.closest(".video-shell");
    const button = shell ? shell.querySelector("[data-play-button]") : null;
    let hlsInstance = null;

    const loadAndPlay = () => {
      if (!source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== source) {
          video.src = source;
        }

        video.play().catch(() => {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }

        video.play().catch(() => {});
      }
    };

    if (button) {
      button.addEventListener("click", () => {
        loadAndPlay();

        if (shell) {
          shell.classList.add("is-playing");
        }
      });
    }

    video.addEventListener("click", () => {
      if (video.paused) {
        loadAndPlay();
      }
    });

    video.addEventListener("play", () => {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", () => {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
  });
}
