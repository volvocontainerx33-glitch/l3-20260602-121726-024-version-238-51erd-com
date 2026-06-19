(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5000);
    }
  }

  function readQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var cardList = document.querySelector('[data-card-list]');

  if (filterPanel && cardList) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var countNode = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

    if (input) {
      input.value = readQuery('q');
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var q = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchCategory = !category || haystack.indexOf(category) !== -1;
        var show = matchQuery && matchYear && matchCategory;
        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [input, yearSelect, categorySelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilter);
        node.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  function initPlayer(shell) {
    var raw = shell.getAttribute('data-player') || '{}';
    var config = {};

    try {
      config = JSON.parse(raw);
    } catch (error) {
      config = {};
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var source = config.src;

    if (!video || !button || !source) {
      return;
    }

    function startPlayback() {
      button.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {});
    }

    button.addEventListener('click', startPlayback);
  }

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  if (playerShells.length) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = function () {
      playerShells.forEach(initPlayer);
    };
    script.onerror = function () {
      playerShells.forEach(initPlayer);
    };
    document.head.appendChild(script);
  }
})();
