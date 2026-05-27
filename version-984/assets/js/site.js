(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var menuPanel = document.querySelector('[data-menu-panel]');

    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function () {
            menuPanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var yearButtons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-year]'));
        var activeYear = '';
        var queryName = root.getAttribute('data-read-query');

        if (queryName && input) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get(queryName);
            if (queryValue) {
                input.value = queryValue;
            }
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var year = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !activeYear || year === activeYear;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || '';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
})();
