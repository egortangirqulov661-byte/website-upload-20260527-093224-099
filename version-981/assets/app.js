(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setHidden(element, hidden) {
    if (element) {
      element.hidden = hidden;
    }
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var next = !mobileMenu.hidden;
      setHidden(mobileMenu, next);
      menuButton.textContent = next ? '☰' : '×';
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var resultsBox = qs('[data-search-results]');
  var searchForms = qsa('[data-search-form]');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function renderResults(query) {
    if (!resultsBox || !window.SITE_MOVIES) {
      return;
    }

    var term = normalize(query);

    if (!term) {
      setHidden(resultsBox, true);
      resultsBox.innerHTML = '';
      return;
    }

    var matches = window.SITE_MOVIES.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.category,
        movie.genre,
        movie.region,
        movie.year,
        movie.tags,
        movie.intro
      ].join(' '));

      return text.indexOf(term) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      resultsBox.innerHTML = '<h3>没有找到相关影片</h3>';
      setHidden(resultsBox, false);
      return;
    }

    resultsBox.innerHTML = '<h3>搜索结果</h3>' + matches.map(function (movie) {
      return '<a class="search-result" href="' + movie.url + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">' +
        '<div>' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span>' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>' +
        '<em>' + escapeHtml(movie.intro) + '</em>' +
        '</div>' +
        '</a>';
    }).join('');

    setHidden(resultsBox, false);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  searchForms.forEach(function (form) {
    var input = qs('input[name="q"]', form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderResults(input ? input.value : '');
    });

    if (input) {
      input.addEventListener('input', function () {
        renderResults(input.value);
      });

      input.addEventListener('focus', function () {
        renderResults(input.value);
      });
    }
  });

  document.addEventListener('click', function (event) {
    if (!resultsBox || resultsBox.hidden) {
      return;
    }

    var target = event.target;
    var insideSearch = searchForms.some(function (form) {
      return form.contains(target);
    });

    if (!resultsBox.contains(target) && !insideSearch) {
      setHidden(resultsBox, true);
    }
  });

  var video = qs('[data-player]');
  var overlay = qs('[data-play-overlay]');
  var status = qs('[data-player-status]');

  if (video) {
    var stream = video.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function writeStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attachStream() {
      if (started || !stream) {
        return;
      }

      started = true;
      writeStatus('正在加载影片');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          writeStatus('');
        }, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          writeStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            writeStatus('影片暂时无法加载');
          }
        });
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          writeStatus('点击视频继续播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
