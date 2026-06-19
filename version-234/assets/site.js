document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHero();
  setupFilters();
  setupPlayers();
  applyQuerySearch();
});

function setupMobileMenu() {
  const button = document.querySelector(".mobile-menu-button");
  const panel = document.querySelector(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    const opened = panel.classList.toggle("open");
    button.setAttribute("aria-expanded", opened ? "true" : "false");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot) {
      const dotIndex = Number(dot.getAttribute("data-hero-dot"));
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function (event) {
      const target = event.currentTarget;
      show(Number(target.getAttribute("data-hero-dot")));
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      restart();
    });
  }

  show(0);
  restart();
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    const input = panel.querySelector("[data-filter-input]");
    const typeSelect = panel.querySelector("[data-type-filter]");
    const yearSelect = panel.querySelector("[data-year-filter]");
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const empty = scope.querySelector("[data-empty-state]");

    function matchYear(cardYear, selected) {
      if (!selected || selected === "全部") {
        return true;
      }
      if (selected.includes("-")) {
        const parts = selected.split("-").map(Number);
        const year = Number(cardYear);
        return year >= parts[0] && year <= parts[1];
      }
      return String(cardYear) === selected;
    }

    function run() {
      const query = input ? input.value.trim().toLowerCase() : "";
      const typeValue = typeSelect ? typeSelect.value : "全部";
      const yearValue = yearSelect ? yearSelect.value : "全部";
      let visible = 0;
      cards.forEach(function (card) {
        const search = (card.getAttribute("data-search") || "").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const year = card.getAttribute("data-year") || "";
        const okQuery = !query || search.includes(query);
        const okType = typeValue === "全部" || type.includes(typeValue);
        const okYear = matchYear(year, yearValue);
        const show = okQuery && okType && okYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", run);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", run);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", run);
    }
  });
}

function applyQuerySearch() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (!q) {
    return;
  }
  const input = document.querySelector("[data-filter-input]");
  if (!input) {
    return;
  }
  input.value = q;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll(".player"));
  players.forEach(function (player) {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const source = player.getAttribute("data-stream");
    let attached = false;

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    }

    function attachAndPlay() {
      hideOverlay();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!attached) {
          video.src = source;
          attached = true;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && Hls.isSupported()) {
        if (!attached) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          attached = true;
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!attached) {
        video.src = source;
        attached = true;
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attachAndPlay);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
    video.addEventListener("play", hideOverlay);
  });
}
