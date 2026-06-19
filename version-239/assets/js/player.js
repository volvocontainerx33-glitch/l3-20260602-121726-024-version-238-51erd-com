import { H as Hls } from './hls-vendor-dru42stk.js';

function setStatus(player, message) {
  var status = player.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function attachNative(video, source) {
  video.src = source;
  video.load();
  return Promise.resolve();
}

function attachHls(video, source, player) {
  if (!Hls || !Hls.isSupported()) {
    return Promise.reject(new Error('当前浏览器不支持 HLS.js 播放'));
  }

  var hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 60
  });

  hls.on(Hls.Events.ERROR, function (event, data) {
    if (data && data.fatal) {
      setStatus(player, '播放源加载失败，请检查网络或替换 m3u8 地址');
      hls.destroy();
    }
  });

  hls.loadSource(source);
  hls.attachMedia(video);
  player.__hls = hls;

  return new Promise(function (resolve) {
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      resolve();
    });
  });
}

function setupPlayer(player) {
  var video = player.querySelector('video');
  var start = player.querySelector('[data-player-start]');
  var source = player.getAttribute('data-hls');

  if (!video || !start || !source) {
    return;
  }

  start.addEventListener('click', function () {
    start.hidden = true;
    video.controls = true;
    setStatus(player, '正在加载 HLS 播放源...');

    var nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
    var attach = nativeHls ? attachNative(video, source) : attachHls(video, source, player);

    attach
      .then(function () {
        setStatus(player, '播放源已加载');
        return video.play();
      })
      .catch(function (error) {
        start.hidden = false;
        video.controls = false;
        setStatus(player, error && error.message ? error.message : '播放器初始化失败');
      });
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
