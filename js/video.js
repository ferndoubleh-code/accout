/* ============================================================
   Smart Video Player — cinematic office introduction
   ============================================================ */
(function () {
  'use strict';

  var SCENES = [
    { kind: 'card', dur: 5,
      html: '<div class="svp-card-in"><div class="svp-kicker">BALANCEPRO CONSULTING</div><h2>สำนักงานบัญชีแบแลนซ์โปร คอนซัลติ้ง</h2><p>วิดีโอแนะนำสำนักงาน</p></div>' },
    { kind: 'img', dur: 7, src: 'images/v2-building.webp', kb: 'in',
      cap: 'สำนักงานบัญชีแบแลนซ์โปร คอนซัลติ้ง พร้อมให้บริการธุรกิจทุกประเภท' },
    { kind: 'img', dur: 8, src: 'images/v2-office-wide.webp', kb: 'pan',
      cap: 'บรรยากาศการทำงานภายในสำนักงาน ทีมงานพร้อมดูแลธุรกิจของคุณ' },
    { kind: 'img', dur: 7, src: 'images/v2-meeting.webp', kb: 'in',
      cap: 'ประชุมทีมทุกสัปดาห์ วางแผนงานบัญชีและภาษีร่วมกัน' },
    { kind: 'img', dur: 8, src: 'images/v2-desk-work.webp', kb: 'pan',
      cap: 'บันทึกบัญชีอย่างละเอียด ถูกต้องตามมาตรฐานบัญชี' },
    { kind: 'img', dur: 7, src: 'images/v2-documents.webp', kb: 'in',
      cap: 'จัดเก็บเอกสารอย่างเป็นระบบ ค้นหาง่าย ปลอดภัย' },
    { kind: 'img', dur: 7, src: 'images/v2-consult.webp', kb: 'pan',
      cap: 'ให้คำปรึกษาบัญชีและภาษีกับลูกค้าแบบตัวต่อตัว' },
    { kind: 'img', dur: 7, src: 'images/v2-call.webp', kb: 'in',
      cap: 'ทีมงานพร้อมตอบทุกข้อสงสัย ติดต่อได้ตลอด' },
    { kind: 'img', dur: 7, src: 'images/v2-handshake.webp', kb: 'pan',
      cap: 'เราเป็น Business Partner ที่เติบโตไปด้วยกันกับธุรกิจของคุณ' },
    { kind: 'img', dur: 7, src: 'images/v2-team.webp', kb: 'in',
      cap: 'ทีมงานแบแลนซ์โปร คอนซัลติ้ง พร้อมดูแลบัญชีและภาษีให้ธุรกิจคุณ' },
    { kind: 'card', dur: 10,
      html: '<div class="svp-card-in"><h2>ให้แบแลนซ์โปร คอนซัลติ้งดูแลบัญชีและภาษีของคุณ</h2><p>โทร 081-994-9980 &nbsp;\u00B7&nbsp; Line : @smartaccount</p><div class="svp-kicker">ปรึกษาฟรี ไม่มีค่าใช้จ่าย</div></div>' }
  ];

  var root, stage, layers, caption, progress, tCur, tTot, btnPlay, btnMute, btnFull, btnClose;
  var idx = -1, elapsed = 0, playing = false, raf = null, lastT = 0, muted = false;
  var total = SCENES.reduce(function (s, sc) { return s + sc.dur; }, 0);

  /* ---------- ambient music (WebAudio) ---------- */
  var AC = null, master = null, chordTimer = null;
  var CHORDS = [
    [220.0, 277.18, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 293.66],
    [164.81, 196.0, 246.94]
  ];
  var chordIdx = 0;
  function startAudio() {
    try {
      if (!AC) {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        master = AC.createGain();
        master.gain.value = muted ? 0 : 0.045;
        master.connect(AC.destination);
      }
      if (AC.state === 'suspended') AC.resume();
      if (!chordTimer) playChord();
    } catch (e) { /* no audio support */ }
  }
  function playChord() {
    var freqs = CHORDS[chordIdx % CHORDS.length];
    chordIdx++;
    var now = AC.currentTime;
    freqs.forEach(function (f, i) {
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = i === 0 ? f / 2 : f;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(i === 0 ? 0.9 : 0.55, now + 2.2);
      g.gain.setValueAtTime(i === 0 ? 0.9 : 0.55, now + 5.5);
      g.gain.linearRampToValueAtTime(0, now + 8.2);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now + 8.4);
    });
    chordTimer = setTimeout(function () { chordTimer = null; if (playing && AC) playChord(); }, 7800);
  }
  function stopAudioSoon() {
    if (chordTimer) { clearTimeout(chordTimer); chordTimer = null; }
  }

  /* ---------- helpers ---------- */
  function fmt(t) {
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }
  function sceneStart(i) {
    var s = 0;
    for (var k = 0; k < i; k++) s += SCENES[k].dur;
    return s;
  }

  /* ---------- render ---------- */
  function buildScene(sc, layer) {
    layer.innerHTML = '';
    layer.className = 'svp-layer' + (sc.kb ? ' kb-' + sc.kb : '');
    if (sc.kind === 'card') {
      var d = document.createElement('div');
      d.className = 'svp-card';
      d.innerHTML = sc.html;
      layer.appendChild(d);
    } else {
      var im = new Image();
      im.className = 'svp-img';
      im.style.animationDuration = sc.dur + 's';
      im.src = sc.src;
      layer.appendChild(im);
    }
  }
  function showScene(i) {
    idx = i;
    var sc = SCENES[i];
    var back = layers[0].classList.contains('active') ? layers[1] : layers[0];
    buildScene(sc, back);
    back.classList.add('active');
    layers.forEach(function (l) { if (l !== back) l.classList.remove('active'); });
    caption.textContent = sc.cap || '';
    caption.style.opacity = sc.cap ? 1 : 0;
  }

  /* ---------- loop ---------- */
  function tick(now) {
    if (!playing) return;
    var dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    elapsed += dt;
    if (elapsed >= total) { elapsed = total; render(); pause(true); showEnd(); return; }
    var acc = 0, found = false;
    for (var i = 0; i < SCENES.length; i++) {
      if (elapsed < acc + SCENES[i].dur) {
        if (i !== idx) showScene(i);
        found = true; break;
      }
      acc += SCENES[i].dur;
    }
    if (!found) { render(); pause(true); return; }
    render();
    raf = requestAnimationFrame(tick);
  }
  function render() {
    progress.style.width = (elapsed / total * 100) + '%';
    tCur.textContent = fmt(elapsed);
  }
  function play() {
    if (playing) return;
    if (elapsed >= total) { elapsed = 0; idx = -1; showScene(0); root.classList.remove('ended'); }
    playing = true;
    root.classList.add('playing');
    btnPlay.innerHTML = ICON_PAUSE;
    lastT = performance.now();
    startAudio();
    raf = requestAnimationFrame(tick);
  }
  function pause(ended) {
    playing = false;
    root.classList.remove('playing');
    btnPlay.innerHTML = ICON_PLAY;
    if (raf) cancelAnimationFrame(raf);
    stopAudioSoon();
    if (ended && elapsed >= total) root.classList.add('ended');
  }
  function showEnd() { showScene(SCENES.length - 1); }

  /* ---------- controls ---------- */
  function seek(e) {
    var r = progress.parentElement.getBoundingClientRect();
    var p = (e.clientX - r.left) / r.width;
    elapsed = Math.max(0, Math.min(1, p)) * total;
    var acc = 0;
    for (var i = 0; i < SCENES.length; i++) {
      if (elapsed < acc + SCENES[i].dur) { if (i !== idx) showScene(i); break; }
      acc += SCENES[i].dur;
    }
    render();
  }
  function toggleMute() {
    muted = !muted;
    btnMute.innerHTML = muted ? ICON_MUTED : ICON_VOL;
    if (master) master.gain.value = muted ? 0 : 0.045;
  }
  function toggleFull() {
    if (!document.fullscreenElement) { root.requestFullscreen && root.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
  }
  function open() {
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    elapsed = 0; idx = -1;
    showScene(0); render();
    play();
  }
  function close() {
    pause(false);
    root.classList.remove('open');
    document.body.style.overflow = '';
  }
  function onKey(e) {
    if (!root.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === ' ') { e.preventDefault(); playing ? pause(false) : play(); }
  }

  var ICON_PLAY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  var ICON_VOL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  var ICON_MUTED = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/></svg>';
  var ICON_FULL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  var ICON_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    root = document.createElement('div');
    root.id = 'svp';
    root.innerHTML =
      '<div class="svp-shell">' +
        '<div class="svp-stage">' +
          '<div class="svp-layer"></div><div class="svp-layer"></div>' +
          '<div class="svp-caption"></div>' +
          '<div class="svp-bar"><div class="svp-fill"></div></div>' +
          '<div class="svp-ctrl">' +
            '<button class="svp-btn svp-play" aria-label="เล่น/พัก">' + ICON_PLAY + '</button>' +
            '<span class="svp-time"><b>0:00</b> / ' + fmt(total) + '</span>' +
            '<span class="svp-sp"></span>' +
            '<button class="svp-btn svp-mute" aria-label="เสียง">' + ICON_VOL + '</button>' +
            '<button class="svp-btn svp-full" aria-label="เต็มจอ">' + ICON_FULL + '</button>' +
            '<button class="svp-btn svp-close" aria-label="ปิด">' + ICON_CLOSE + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    layers = root.querySelectorAll('.svp-layer');
    caption = root.querySelector('.svp-caption');
    progress = root.querySelector('.svp-fill');
    tCur = root.querySelector('.svp-time b');
    tTot = root.querySelector('.svp-time');
    btnPlay = root.querySelector('.svp-play');
    btnMute = root.querySelector('.svp-mute');
    btnFull = root.querySelector('.svp-full');
    btnClose = root.querySelector('.svp-close');

    btnPlay.addEventListener('click', function () { playing ? pause(false) : play(); });
    btnMute.addEventListener('click', toggleMute);
    btnFull.addEventListener('click', toggleFull);
    btnClose.addEventListener('click', close);
    root.querySelector('.svp-bar').addEventListener('click', seek);
    stage = root.querySelector('.svp-stage');
    stage.addEventListener('click', function (e) {
      if (e.target.closest('.svp-ctrl') || e.target.closest('.svp-bar')) return;
      playing ? pause(false) : play();
    });
    document.addEventListener('keydown', onKey);

    /* preload */
    SCENES.forEach(function (sc) { if (sc.kind === 'img') { var im = new Image(); im.src = sc.src; } });

    window.SmartVideoPlayer = { open: open, close: close };
  });
})();
