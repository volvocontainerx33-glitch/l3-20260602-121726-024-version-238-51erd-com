(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  var searchInputs = document.querySelectorAll('[data-search-input]');

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var rootSelector = input.getAttribute('data-search-root');
      var root = rootSelector ? document.querySelector(rootSelector) : document;
      var keyword = input.value.trim().toLowerCase();

      if (!root) {
        return;
      }

      root.querySelectorAll('[data-search-card]').forEach(function (card) {
        var content = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-filtered-out', keyword && content.indexOf(keyword) === -1);
      });
    });
  });
})();
