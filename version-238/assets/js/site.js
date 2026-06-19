(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (navButton && nav) {
      navButton.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    searchForms.forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var yearSelect = area.querySelector('[data-year-filter]');
      var typeSelect = area.querySelector('[data-type-filter]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

      var applyFilter = function () {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var typeValue = typeSelect ? typeSelect.value : '';

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var year = card.getAttribute('data-year') || '';
          var type = card.getAttribute('data-type') || '';
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var yearMatch = !yearValue || year === yearValue;
          var typeMatch = !typeValue || type === typeValue;
          card.classList.toggle('hide-card', !(keywordMatch && yearMatch && typeMatch));
        });
      };

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
      }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-overlay]');
      var stream = player.getAttribute('data-stream');
      var prepared = false;
      var hlsInstance = null;

      var prepare = function () {
        if (!video || !stream || prepared) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      };

      var start = function () {
        prepare();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (video) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
      };

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
