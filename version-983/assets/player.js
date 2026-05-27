(function () {
    function initPlayer(source) {
        var root = document.querySelector('[data-player-root]');
        if (!root) {
            return;
        }

        var video = root.querySelector('video');
        var button = root.querySelector('.player-start');
        var hls = null;
        var ready = false;

        function attach() {
            if (ready || !video) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            root.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    root.classList.remove('is-playing');
                });
            }
        }

        function toggle() {
            if (!ready || video.paused) {
                start();
            } else {
                video.pause();
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', toggle);
            video.addEventListener('play', function () {
                root.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                root.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initPlayer = initPlayer;
})();
