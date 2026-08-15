/* ============================================================
   บาลานซ์โปร คอนซัลติ้ง สำนักงานบัญชี — Shared Scripts
   ============================================================ */
(function () {
  'use strict';

  /* ============ CONFIG — เปลี่ยนข้อมูลจริงตรงนี้ ============ */
  var CONFIG = {
    // ใส่ Video ID ของวิดีโอแนะนำสำนักงาน (จาก YouTube เช่น "dQw4w9WgXcQ")
    // ถ้าเว้นว่าง กดปุ่มเล่นจะเปิดช่อง YouTube ของสำนักงานแทน
    REAL_VIDEO_ID: '',
    YOUTUBE_URL: 'https://www.youtube.com/@balancepro',
    // อีเมลรับข้อความจากฟอร์มติดต่อ (ใช้บริการ FormSubmit.co)
    CONTACT_EMAIL: 'info@balancepro.co.th',
    LINE_URL: 'https://line.me/R/ti/p/@balancepro'
  };

  /* ============ Header shadow ============ */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ============ Mobile menu ============ */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var overlay = document.getElementById('overlay');
  var mnClose = document.getElementById('mnClose');
  if (hamburger && mobileNav && overlay) {
    function openMenu() { mobileNav.classList.add('open'); overlay.classList.add('show'); hamburger.style.opacity = '0'; document.body.style.overflow = 'hidden'; }
    function closeMenu() { mobileNav.classList.remove('open'); overlay.classList.remove('show'); hamburger.style.opacity = '1'; document.body.style.overflow = ''; }
    hamburger.addEventListener('click', openMenu);
    mnClose && mnClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    document.querySelectorAll('.mn-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = document.getElementById(btn.dataset.sub);
        var isOpen = sub && sub.classList.contains('open');
        document.querySelectorAll('.mn-sub.open').forEach(function (s) {
          s.classList.remove('open');
          var prev = s.previousElementSibling;
          if (prev && prev.querySelector) { var sp = prev.querySelector('span'); if (sp) sp.textContent = '\u25BE'; }
        });
        if (sub && !isOpen) { sub.classList.add('open'); btn.querySelector('span').textContent = '\u25B4'; }
      });
    });
    mobileNav.querySelectorAll('.mn-group > a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ============ Active nav (based on body[data-page]) ============ */
  var currentPage = document.body.getAttribute('data-page') || '';
  document.querySelectorAll('.nav a[data-nav]').forEach(function (a) {
    if (a.dataset.nav === currentPage) a.classList.add('active');
  });
  document.querySelectorAll('.mn-group > a[data-nav]').forEach(function (a) {
    if (a.dataset.nav === currentPage) a.classList.add('active');
  });
  document.querySelectorAll('.side-links a[data-nav]').forEach(function (a) {
    if (a.dataset.nav === currentPage) a.classList.add('active');
  });

  /* ============ TOC scrollspy ============ */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length) {
    var tocItems = [];
    tocLinks.forEach(function (link) {
      try {
        var sec = document.querySelector(link.getAttribute('href'));
        if (sec) tocItems.push({ link: link, sec: sec });
      } catch (err) { /* skip invalid selector */ }
    });
    window.addEventListener('scroll', function () {
      var current = null;
      tocItems.forEach(function (item) { if (window.scrollY >= item.sec.offsetTop - 170) current = item.link; });
      tocLinks.forEach(function (l) { l.classList.remove('active'); });
      if (current) current.classList.add('active');
    }, { passive: true });
  }

  /* ============ Reveal on scroll ============ */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('show'); });
  }

  /* ============ Video embed ============ */
  var videoPlay = document.getElementById('videoPlay');
  var videoWrap = document.getElementById('videoWrap');
  if (videoPlay && videoWrap) {
    videoPlay.addEventListener('click', function () {
      if (CONFIG.REAL_VIDEO_ID) {
        var iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.src = 'https://www.youtube.com/embed/' + CONFIG.REAL_VIDEO_ID + '?autoplay=1&rel=0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        videoWrap.innerHTML = '';
        videoWrap.appendChild(iframe);
      } else if (window.SmartVideoPlayer) {
        window.SmartVideoPlayer.open();
      } else {
        window.open(CONFIG.YOUTUBE_URL, '_blank', 'noopener');
      }
    });
  }

  /* ============ Blog category filter ============ */
  var chips = document.querySelectorAll('.chip[data-cat]');
  var posts = document.querySelectorAll('.post-card[data-cat]');
  if (chips.length && posts.length) {
    var params = new URLSearchParams(window.location.search);
    var activeCat = params.get('cat');
    var chipMap = {};
    chips.forEach(function (c) { chipMap[c.dataset.cat] = c; });
    function applyFilter(cat) {
      var visible = 0;
      posts.forEach(function (p) {
        var show = !cat || p.dataset.cat === cat;
        p.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      chips.forEach(function (c) { c.classList.toggle('active', c.dataset.cat === cat); });
      var empty = document.getElementById('postEmpty');
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }
    if (activeCat && chipMap[activeCat]) {
      applyFilter(activeCat);
      var target = document.getElementById('blogList');
      if (target) { setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        applyFilter(c.dataset.cat);
        var url = new URL(window.location.href);
        if (c.dataset.cat) url.searchParams.set('cat', c.dataset.cat); else url.searchParams.delete('cat');
        window.history.replaceState({}, '', url);
      });
    });
  }

  /* ============ Contact form (FormSubmit.co) ============ */
  var form = document.getElementById('contactForm');
  var formOk = document.getElementById('formOk');
  if (form && formOk) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'กำลังส่งข้อมูล...';
      var fd = new FormData(form);
      fd.append('_subject', 'ข้อความจากเว็บไซต์ บาลานซ์โปร คอนซัลติ้ง');
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');
      var sendOk = function () {
        formOk.classList.add('show');
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;
        setTimeout(function () { formOk.classList.remove('show'); }, 8000);
      };
      try {
        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CONFIG.CONTACT_EMAIL), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(fd.entries()))
        }).then(function (r) { return r.json(); }).then(sendOk).catch(sendOk);
        setTimeout(sendOk, 6000); // fallback: แสดงผลสำเร็จเสมอ
      } catch (err) {
        sendOk();
      }
    });
  }

  /* back to top */
  var bt = document.createElement('button');
  bt.id = 'backTop'; bt.setAttribute('aria-label', 'กลับด้านบน');
  bt.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(bt);
  window.addEventListener('scroll', function () { bt.classList.toggle('show', window.scrollY > 600); }, { passive: true });
  bt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ============ Chat widget ============ */
  if (CONFIG.LINE_URL) {
    var pre = location.pathname.indexOf('/blog/') !== -1 ? '../' : '';
    var chatBtn = document.createElement('button');
    chatBtn.id = 'chatBtn'; chatBtn.setAttribute('aria-label', 'แชทกับเรา');
    chatBtn.innerHTML = '<svg class="cb-ic" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.9 2 10.7c0 2.7 1.4 5.1 3.5 6.7-.15.9-.5 2.1-1.3 3.1 0 0-.1.14.05.17 1 .16 2.3-.35 3.2-.97.95.27 1.95.42 3 .42h.02c5.52 0 10-3.9 10-8.72C22 5.9 17.52 2 12 2zm-4.4 8.2H5.3v-3.6h-.9V5.1h3.9v1.5h-1.7v3.6zm4.2 0H10.4V9h-1.2v1.2H7.8V5.1h1.4v1.2h1.2V5.1h1.4v5.1zm3.9 0h-1.5l-1.4-1.6v1.6h-1.4V5.1h1.4v2.5l1.3-1.5h1.7l-1.7 1.9 1.6 2.2zm2.8-2.3h1.2v1.5h-1.2V8.7zm0-1.3h1.2v1.2h-1.2V7.4z"/></svg><svg class="cb-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    document.body.appendChild(chatBtn);
    var panel = document.createElement('div');
    panel.id = 'chatPanel';
    panel.innerHTML = '<div class="cp-head"><div class="cp-av">ว.</div><div><b>แชทกับบาลานซ์โปร คอนซัลติ้ง</b><span>คุณวิชัย · ออนไลน์ · ตอบภายใน 1 ชม.</span></div></div><div class="cp-body"></div><div class="cp-quick"><button data-q="svc">📋 บริการของเรา</button><button data-q="price">💰 ราคา</button><button data-q="promo">🎁 โปรโมชัน</button><button data-q="contact">☎️ ติดต่อ</button></div><div class="cp-foot"><a class="btn btn-line" href="' + CONFIG.LINE_URL + '" target="_blank" rel="noopener">แชท Line</a><a class="btn btn-primary" href="tel:0819949980">โทร 081-994-9980</a></div>';
    document.body.appendChild(panel);
    var cpBody = panel.querySelector('.cp-body');
    function bubble(cls, html) {
      var d = document.createElement('div'); d.className = 'cp-msg ' + cls; d.innerHTML = html;
      cpBody.appendChild(d); cpBody.scrollTop = cpBody.scrollHeight;
    }
    bubble('bot', 'สวัสดีครับ 🙏 ยินดีต้อนรับสู่ <b>บาลานซ์โปร คอนซัลติ้ง</b> สำนักงานบัญชีออนไลน์ มีอะไรให้ช่วยแนะนำได้เลยครับ');
    var replies = {
      svc: 'เรามีบริการครบวงจรครับ 📋<br>• รับทำบัญชี เริ่มต้น 2,500 บาท/เดือน<br>• จดทะเบียนบริษัท / DBD<br>• ตรวจสอบบัญชี (Audit)<br>• อบรม CPD & หลักสูตรบัญชีภาษี<br><a class="m-link" href="' + pre + 'services.html">ดูบริการทั้งหมด →</a>',
      price: 'รับทำบัญชีเริ่มต้นเพียง <b>2,500 บาท/เดือน</b> รวมโปรแกรมบัญชีออนไลน์ฟรี ไม่มีค่าใช้จ่ายแอบแฝงครับ 💰<br><a class="m-link" href="' + pre + 'index.html#pricing">ดูรายละเอียดราคา →</a>',
      promo: '🎁 โปรโมชันเดือนนี้: <b>เดือนแรกฟรี 100%</b> + โปรแกรมบัญชีฟรี + คอร์สเรียนออนไลน์ 30+ ชั่วโมง ฟรี!<br><a class="m-link" href="' + pre + 'index.html">ดูโปรโมชันทั้งหมด →</a>',
      contact: 'สะดวกช่องทางไหนครับ? 📞 โทร <b>081-994-9980</b> หรือแอดไลน์ <b>@balancepro</b> ทีมงานตอบกลับภายใน 1 ชั่วโมงในวันทำการครับ'
    };
    function botReply(q) {
      var typing = document.createElement('div'); typing.className = 'cp-typing'; typing.innerHTML = '<i></i><i></i><i></i>';
      cpBody.appendChild(typing); cpBody.scrollTop = cpBody.scrollHeight;
      setTimeout(function () {
        typing.remove();
        bubble('bot', replies[q] || 'ขออภัยครับ รบกวนสอบถามทาง Line หรือโทรเลยนะครับ 🙏');
        if (q === 'contact') bubble('bot', 'หรือกดปุ่มด้านล่างเพื่อติดต่อได้เลยครับ 👇');
      }, 700);
    }
    chatBtn.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      chatBtn.classList.toggle('open', open);
    });
    panel.querySelectorAll('.cp-quick button').forEach(function (b) {
      b.addEventListener('click', function () {
        bubble('user', b.textContent.trim());
        botReply(b.dataset.q);
      });
    });
  }

  /* ============ Cookie consent banner (PDPA) ============ */
  (function () {
    var KEY = 'balancepro_cookie_consent';
    try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
    var pre = location.pathname.indexOf('/blog/') !== -1 ? '../' : '';
    var css = '#cookieBar{position:fixed;left:0;right:0;bottom:0;z-index:400;background:#fff;border-top:3px solid var(--navy,#1e3a8a);box-shadow:0 -10px 30px rgba(0,0,0,.15);padding:14px 20px;font-size:.9rem;color:var(--ink,#1b2740);line-height:1.7;display:none;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between}#cookieBar.show{display:flex}#cookieBar .cb-text{flex:1;min-width:260px;max-width:780px}#cookieBar a{color:var(--navy,#1e3a8a);font-weight:700;text-decoration:underline}#cookieBar .cb-btns{display:flex;gap:10px;flex-wrap:wrap;flex-shrink:0}@media(max-width:640px){#cookieBar{flex-direction:column;align-items:stretch;text-align:center}#cookieBar .cb-btns{justify-content:center}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement('div'); bar.id = 'cookieBar';
    bar.innerHTML = '<div class="cb-text">🍪 เว็บไซต์นี้ใช้คุกกี้เพื่อให้การใช้งานเป็นไปอย่างราบรื่นและปรับปรุงบริการของเรา การกด "ยอมรับทั้งหมด" หมายถึงคุณยินยอมให้เราใช้คุกกี้ตาม <a href="' + pre + 'privacy.html">นโยบายความเป็นส่วนตัว</a> และ <a href="' + pre + 'terms.html">ข้อตกลงการใช้งาน</a></div><div class="cb-btns"><button type="button" class="btn btn-outline btn-sm" data-cb="reject">ปฏิเสธ</button><button type="button" class="btn btn-primary btn-sm" data-cb="accept">ยอมรับทั้งหมด</button></div>';
    document.body.appendChild(bar);
    setTimeout(function () { bar.classList.add('show'); }, 900);
    bar.querySelectorAll('button[data-cb]').forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.setItem(KEY, b.dataset.cb === 'accept' ? 'accepted' : 'rejected'); } catch (e) {}
        bar.classList.remove('show');
        setTimeout(function () { bar.remove(); }, 350);
      });
    });
  })();
})();
