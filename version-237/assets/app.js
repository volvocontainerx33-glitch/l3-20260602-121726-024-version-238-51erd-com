(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".cover-img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-empty");
    }, { once: true });
  });

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  var filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-item"));
    var searchInput = filterRoot.querySelector("[data-card-search]");
    var yearSelect = filterRoot.querySelector("[data-year-select]");
    var typeSelect = filterRoot.querySelector("[data-type-select]");
    var yearButtons = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-filter-year]"));
    var emptyState = filterRoot.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : "");
      var selectedYear = yearSelect ? yearSelect.value : "all";
      var selectedType = typeSelect ? typeSelect.value : "all";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = selectedYear === "all" || cardYear === selectedYear;
        var matchesType = selectedType === "all" || cardType === selectedType;
        var isVisible = matchesQuery && matchesYear && matchesType;

        card.style.display = isVisible ? "" : "none";

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        yearButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");

        if (yearSelect) {
          yearSelect.value = button.getAttribute("data-filter-year") || "all";
        }

        applyFilter();
      });
    });

    applyFilter();
  }
})();

function initMoviePlayer(mediaUrl, posterUrl) {
  var video = document.getElementById("movie-player");
  var posterButton = document.querySelector("[data-player-poster]");
  var playButton = document.querySelector("[data-player-play]");
  var muteButton = document.querySelector("[data-player-mute]");
  var fullButton = document.querySelector("[data-player-full]");
  var progressTrack = document.querySelector("[data-player-progress]");
  var progressValue = document.querySelector("[data-player-progress-value]");
  var timeText = document.querySelector("[data-player-time]");
  var streamReady = false;
  var hlsInstance = null;

  if (!video) {
    return;
  }

  if (posterButton && posterUrl) {
    posterButton.style.backgroundImage = "url('" + posterUrl + "')";
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ":" + String(rest).padStart(2, "0");
  }

  function updateTime() {
    var duration = Number.isFinite(video.duration) ? video.duration : 0;
    var current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    var percent = duration ? (current / duration) * 100 : 0;

    if (progressValue) {
      progressValue.style.width = percent + "%";
    }

    if (timeText) {
      timeText.textContent = formatTime(current) + " / " + formatTime(duration);
    }
  }

  function setupStream(callback) {
    if (streamReady) {
      if (callback) {
        callback();
      }
      return;
    }

    streamReady = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (callback) {
          callback();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
      video.addEventListener("loadedmetadata", function () {
        if (callback) {
          callback();
        }
      }, { once: true });
      video.load();
    } else {
      video.src = mediaUrl;
      if (callback) {
        callback();
      }
    }
  }

  function playVideo() {
    setupStream(function () {
      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (posterButton) {
            posterButton.classList.remove("is-hidden");
          }
        });
      }
    });

    if (posterButton) {
      posterButton.classList.add("is-hidden");
    }
  }

  function togglePlay() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  }

  function updatePlayIcon() {
    if (playButton) {
      playButton.textContent = video.paused ? "▶" : "❚❚";
    }
  }

  if (posterButton) {
    posterButton.addEventListener("click", playVideo);
  }

  if (playButton) {
    playButton.addEventListener("click", togglePlay);
  }

  video.addEventListener("click", togglePlay);
  video.addEventListener("play", updatePlayIcon);
  video.addEventListener("pause", updatePlayIcon);
  video.addEventListener("timeupdate", updateTime);
  video.addEventListener("loadedmetadata", updateTime);
  video.addEventListener("durationchange", updateTime);

  if (muteButton) {
    muteButton.addEventListener("click", function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? "🔇" : "🔊";
    });
  }

  if (fullButton) {
    fullButton.addEventListener("click", function () {
      var target = video.parentElement || video;

      if (target.requestFullscreen) {
        target.requestFullscreen();
      }
    });
  }

  if (progressTrack) {
    progressTrack.addEventListener("click", function (event) {
      var duration = Number.isFinite(video.duration) ? video.duration : 0;

      if (!duration) {
        return;
      }

      var rect = progressTrack.getBoundingClientRect();
      var ratio = (event.clientX - rect.left) / rect.width;
      video.currentTime = Math.max(0, Math.min(duration, ratio * duration));
      updateTime();
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });

  updatePlayIcon();
  updateTime();
}
