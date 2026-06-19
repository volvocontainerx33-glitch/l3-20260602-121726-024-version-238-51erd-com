(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }

    var cards = selectAll('.movie-card', grid);
    var queryInput = document.querySelector('[data-card-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var genreSelect = document.querySelector('[data-genre-filter]');
    var count = document.querySelector('[data-result-count]');

    if (queryInput && queryInput.hasAttribute('data-auto-query')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        queryInput.value = q;
      }
    }

    function matches(card) {
      var q = text(queryInput && queryInput.value);
      var y = yearSelect && yearSelect.value;
      var g = text(genreSelect && genreSelect.value);
      var haystack = text([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));

      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (y && card.getAttribute('data-year') !== y) {
        return false;
      }
      if (g && text(card.getAttribute('data-genre')).indexOf(g) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = '当前显示 ' + shown + ' 部影片';
      }
    }

    [queryInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupRankingFilter() {
    var input = document.querySelector('[data-ranking-filter]');
    var list = document.querySelector('[data-ranking-list]');
    if (!input || !list) {
      return;
    }

    var rows = selectAll('.ranking-row', list);
    input.addEventListener('input', function () {
      var q = text(input.value);
      rows.forEach(function (row) {
        var haystack = text(row.textContent + ' ' + row.getAttribute('data-title') + ' ' + row.getAttribute('data-year') + ' ' + row.getAttribute('data-genre'));
        row.classList.toggle('is-hidden', q && haystack.indexOf(q) === -1);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCardFilters();
    setupRankingFilter();
  });
})();
