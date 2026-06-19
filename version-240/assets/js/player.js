(function () {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-target="movie-player"]');
  var state = document.querySelector('[data-player-state]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var ready = false;
  var hls = null;

  function updateState(text) {
    if (state) {
      state.textContent = text;
    }
  }

  function bindSource() {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      updateState('准备播放');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      updateState('准备播放');
      return;
    }

    video.src = source;
    ready = true;
    updateState('播放源已就绪');
  }

  function playVideo() {
    bindSource();

    if (button) {
      button.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        updateState('点击视频区域继续播放');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
    updateState('正在播放');
  });

  video.addEventListener('pause', function () {
    updateState('已暂停');
  });

  video.addEventListener('error', function () {
    updateState('加载中，请稍后重试');
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
