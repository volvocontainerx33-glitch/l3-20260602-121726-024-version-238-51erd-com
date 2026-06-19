(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupVideo();
  });

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var emptyState = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    var activeCategory = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visibleCount = 0;
      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var matchesText = !query || keywords.indexOf(query) !== -1;
        var matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
        var visible = matchesText && matchesCategory;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("show", visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  }

  function setupVideo() {
    var shell = document.querySelector("[data-video-shell]");
    var video = document.querySelector("[data-video]");
    var playButton = document.querySelector("[data-play]");
    if (!shell || !video || !playButton) {
      return;
    }
    var source = video.getAttribute("data-src");
    var hls = null;
    var loaded = false;

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      loadSource();
      shell.classList.add("playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("playing");
        });
      }
    }

    playButton.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
