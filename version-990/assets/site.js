(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function showHero(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showHero(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showHero(index + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function() {
      showHero(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var searchCount = document.querySelector("[data-search-count]");

  if (searchInput && searchCards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    searchInput.value = query;

    function filterCards() {
      var value = searchInput.value.trim().toLowerCase();
      var visible = 0;

      searchCards.forEach(function(card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (searchCount) {
        searchCount.textContent = value ? "匹配到 " + visible + " 部影片" : "输入关键词开始筛选影片";
      }
    }

    searchInput.addEventListener("input", filterCards);
    filterCards();
  }
})();

function bindPlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var loaded = false;

  if (!video || !streamUrl) {
    return;
  }

  function loadVideo() {
    if (!loaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var player = new Hls();
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    if (overlay) {
      overlay.hidden = true;
    }

    video.controls = true;
    video.play().catch(function() {});
  }

  if (overlay) {
    overlay.addEventListener("click", loadVideo);
  }

  video.addEventListener("click", function() {
    if (!loaded) {
      loadVideo();
    }
  });
}
