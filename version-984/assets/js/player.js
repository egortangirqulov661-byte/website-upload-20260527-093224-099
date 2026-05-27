import { H as Hls } from './video-player-dru42stk.js';

function showMessage(root, message) {
    var node = root.querySelector('[data-player-message]');
    if (!node) {
        return;
    }
    node.textContent = message;
    node.classList.add('visible');
}

function hideMessage(root) {
    var node = root.querySelector('[data-player-message]');
    if (!node) {
        return;
    }
    node.textContent = '';
    node.classList.remove('visible');
}

function playVideo(video, root) {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
            showMessage(root, '请再次点击播放器开始播放');
        });
    }
}

function attachHls(video, root) {
    var source = video.getAttribute('data-src');
    if (!source) {
        showMessage(root, '播放源暂不可用');
        return;
    }

    if (video.dataset.ready === '1') {
        playVideo(video, root);
        return;
    }

    hideMessage(root);

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.dataset.ready = '1';
            playVideo(video, root);
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                showMessage(root, '视频加载失败，请稍后重试');
            }
        });
        video._hlsInstance = hls;
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = '1';
        playVideo(video, root);
        return;
    }

    showMessage(root, '当前浏览器不支持 HLS 播放');
}

document.querySelectorAll('[data-player]').forEach(function (root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');

    if (!video || !button) {
        return;
    }

    button.addEventListener('click', function () {
        attachHls(video, root);
    });

    video.addEventListener('play', function () {
        root.classList.add('playing');
        hideMessage(root);
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            root.classList.remove('playing');
        }
    });

    video.addEventListener('ended', function () {
        root.classList.remove('playing');
    });
});
