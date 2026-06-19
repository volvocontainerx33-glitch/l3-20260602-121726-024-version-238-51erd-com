(function() {
  var mobileButton = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function() {
      var isOpen = mobileNav.classList.toggle("is-open");
      mobileButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      var index = Number(dot.getAttribute("data-slide") || "0");
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(activeSlide + 1);
    }, 6200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));

  panels.forEach(function(panel) {
    var input = panel.querySelector(".movie-search");
    var year = panel.querySelector(".year-filter");
    var type = panel.querySelector(".type-filter");
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = panel.querySelector(".empty-tip") || scope.querySelector(".empty-tip");

    function valueOf(name, card) {
      return (card.getAttribute(name) || "").toLowerCase();
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value.toLowerCase() : "";
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = [
          valueOf("data-title", card),
          valueOf("data-region", card),
          valueOf("data-type", card),
          valueOf("data-genre", card)
        ].join(" ");
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || valueOf("data-year", card) === selectedYear.toLowerCase();
        var matchesType = !selectedType || valueOf("data-type", card).indexOf(selectedType) !== -1;
        var matches = matchesKeyword && matchesYear && matchesType;

        card.classList.toggle("is-hidden", !matches);

        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("moviePlayButton");
  var panel = document.getElementById("moviePlayerPanel");
  var hlsInstance = null;
  var hasLoaded = false;

  if (!video || !button || !panel || !source) {
    return;
  }

  function beginPlayback() {
    button.classList.add("is-hidden");

    if (!hasLoaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {
            button.classList.remove("is-hidden");
          });
        });
      } else {
        video.src = source;
      }

      hasLoaded = true;
    }

    video.play().catch(function() {
      button.classList.remove("is-hidden");
    });
  }

  button.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    beginPlayback();
  });

  panel.addEventListener("click", function(event) {
    if (event.target === panel || event.target === video) {
      beginPlayback();
    }
  });

  video.addEventListener("play", function() {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function() {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
