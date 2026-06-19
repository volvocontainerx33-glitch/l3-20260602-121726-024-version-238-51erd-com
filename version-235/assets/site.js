document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroSlider();
  setupFilters();
  setupPlayers();
});

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function setupHeroSlider() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      start();
    });
  });

  showSlide(0);
  start();
}

function setupFilters() {
  const list = document.querySelector("[data-movie-list]");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const searchInput = document.querySelector("[data-search-input]");
  const yearSelect = document.querySelector("[data-filter-year]");
  const typeSelect = document.querySelector("[data-filter-type]");
  const regionSelect = document.querySelector("[data-filter-region]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (!list || cards.length === 0) {
    return;
  }

  fillSelect(yearSelect, uniqueValues(cards, "year").sort(function (a, b) {
    return Number(b) - Number(a);
  }));
  fillSelect(typeSelect, uniqueValues(cards, "type").sort());
  fillSelect(regionSelect, uniqueValues(cards, "region").sort());

  function apply() {
    const keyword = normalize(searchInput ? searchInput.value : "");
    const year = yearSelect ? yearSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";
    const region = regionSelect ? regionSelect.value : "";
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags
      ].join(" "));

      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedYear = !year || card.dataset.year === year;
      const matchedType = !type || card.dataset.type === type;
      const matchedRegion = !region || card.dataset.region === region;
      const matched = matchedKeyword && matchedYear && matchedType && matchedRegion;

      card.hidden = !matched;
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    }
  });
}

function uniqueValues(cards, key) {
  const values = new Set();

  cards.forEach(function (card) {
    const value = (card.dataset[key] || "").trim();
    if (value) {
      values.add(value);
    }
  });

  return Array.from(values);
}

function fillSelect(select, values) {
  if (!select) {
    return;
  }

  values.forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function setupPlayers() {
  const shells = Array.from(document.querySelectorAll("[data-player-shell]"));

  shells.forEach(function (shell) {
    const video = shell.querySelector("video[data-m3u8]");
    const button = shell.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    const source = video.dataset.m3u8;
    let initialized = false;

    function initializePlayer() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      initializePlayer();
      button.classList.add("hidden");
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("hidden");
      }
    });
  });
}
