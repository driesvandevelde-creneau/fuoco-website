
(function () {
  var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortOffers = ['Happy hours', 'Happy hours', 'Fiery ladies night · Happy hours', 'Steak. Wine. Fire. · Happy hours', 'Fuoco goes live · Happy hours', 'Happy hours', 'Fuoco brunch · Happy hours'];
  var longOffers = ['Happy hours 17.00–20.00', 'Happy hours 17.00–20.00', 'Fiery ladies night from 17.00 · Happy hours 17.00–20.00', 'Steak. Wine. Fire. from 17.00 · Happy hours 17.00–20.00', 'Fuoco goes live 20.00–23.00 · Happy hours 17.00–20.00', 'Happy hours 17.00–20.00', 'Fuoco brunch 14.00–17.00 · Happy hours 17.00–20.00'];
  var tonight = ['Happy hours 17.00–20.00', 'Happy hours 17.00–20.00', 'Fiery ladies night', 'Steak. Wine. Fire.', 'Fuoco goes live, 20.00', 'Happy hours 17.00–20.00', 'Fuoco brunch, 14.00'];
  var hours = ['17.00–01.00', '17.00–01.00', '17.00–01.00', '17.00–01.00', '17.00–01.00', '17.00–02.00', '14.00–02.00'];
  var t = new Date().getDay();

  function el(tag, cls, text, style) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    if (style) e.setAttribute('style', style);
    return e;
  }

  document.querySelectorAll('ul[data-week]').forEach(function (ul) {
    var long = ul.getAttribute('data-week') === 'long';
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var li = document.createElement('li');
      if (d === t) li.appendChild(el('span', 'hand', 'today', 'font-size: 30px; color: var(--desert);'));
      else li.appendChild(el('span', '', names[d], 'font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase;'));
      li.appendChild(el('span', '', (long ? longOffers : shortOffers)[d], 'font-size: 20px; line-height: 1.25; color: var(--black-pearl); min-width: 0;'));
      li.appendChild(el('span', '', (long ? 'Open ' : '') + hours[d], 'font-size: 15px;'));
      ul.appendChild(li);
    });
  });
  document.querySelectorAll('[data-today="tonight"]').forEach(function (s) { s.textContent = tonight[t]; });
  document.querySelectorAll('[data-today="hours"]').forEach(function (s) { s.textContent = hours[t]; });

  // Menus: same model as the maison-mathis.com menu reader
  var M = window.FU_MENUS || {};
  var ROOT = (document.querySelector('link[rel="stylesheet"]').getAttribute('href') || '').split('assets/')[0];
  Object.keys(M).forEach(function (k) { if (M[k].pages) M[k].pages = M[k].pages.map(function (p) { return ROOT + p; }); });
  var reader = document.getElementById('menuReader');
  if (reader) document.body.appendChild(reader);
  var rImg = document.getElementById('rImg'), rTitle = document.getElementById('rTitle'), rCount = document.getElementById('rCount');
  var rSwitch = document.getElementById('rSwitch'), rThumbs = document.getElementById('rThumbs');
  var rPrev = document.getElementById('rPrev'), rNext = document.getElementById('rNext'), rZoom = document.getElementById('rZoom');
  var rState = { key: null, i: 0 }, lastFocus = null;

  function renderBook(book, key, start) {
    var m = M[key], spread = book.querySelector('.mn-spread'), soon = book.querySelector('.mn-soon');
    var ctl = book.querySelector('.mn-ctl'), count = book.querySelector('.mn-count');
    var navs = book.querySelectorAll('.mn-nav');
    book.setAttribute('data-type', key);
    book._key = key; book._start = start;
    spread.innerHTML = '';
    if (!m.pages) {
      spread.hidden = true; ctl.hidden = true; soon.hidden = false;
      soon.querySelector('h3').textContent = m.title;
      return;
    }
    spread.hidden = false; ctl.hidden = false; soon.hidden = true;
    var n = m.pages.length;
    for (var p = start; p < Math.min(start + 2, n); p++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mn-pg'; b.style.aspectRatio = m.ratio;
      b.setAttribute('aria-label', 'Open page ' + (p + 1) + ' of the ' + m.title + ' menu in the reader');
      var im = document.createElement('img');
      im.src = m.pages[p]; im.alt = m.title + ' menu, page ' + (p + 1); im.decoding = 'async';
      b.appendChild(im);
      (function (page) { b.addEventListener('click', function () { openReader(key, page); }); })(p);
      spread.appendChild(b);
    }
    var last = Math.min(start + 2, n);
    count.textContent = (last - start > 1 ? 'Pages ' + (start + 1) + ' - ' + last : 'Page ' + (start + 1)) + ' of ' + n;
    navs[0].disabled = start === 0;
    navs[1].disabled = start + 2 >= n;
  }

  document.querySelectorAll('.mn-book').forEach(function (book) {
    renderBook(book, book.getAttribute('data-type'), 0);
    book.querySelectorAll('.mn-nav').forEach(function (nb) {
      nb.addEventListener('click', function () {
        renderBook(book, book._key, Math.max(0, book._start + 2 * Number(nb.getAttribute('data-dir'))));
      });
    });
  });

  document.querySelectorAll('.mn-loc').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var loc = btn.getAttribute('data-menu-loc');
      document.querySelectorAll('.mn-loc').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.mn-panel').forEach(function (p) { p.hidden = p.getAttribute('data-loc') !== loc; });
    });
  });

  document.querySelectorAll('.mn-panel').forEach(function (panel) {
    var book = panel.querySelector('.mn-book');
    panel.querySelectorAll('[data-menu-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        panel.querySelectorAll('[data-menu-tab]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        renderBook(book, btn.getAttribute('data-menu-tab'), 0);
      });
    });
    var readBtn = panel.querySelector('[data-read]');
    if (readBtn) readBtn.addEventListener('click', function () {
      var key = book._key;
      if (M[key].pages) openReader(key, book._start || 0);
      else book.querySelector('.mn-soon').scrollIntoView({ block: 'nearest' });
    });
  });

  function showPage() {
    var m = M[rState.key], n = m.pages.length;
    rImg.src = m.pages[rState.i];
    rImg.alt = m.title + ' menu, page ' + (rState.i + 1) + ' of ' + n;
    rTitle.textContent = m.title;
    rCount.textContent = 'Page ' + (rState.i + 1) + ' of ' + n;
    rPrev.disabled = rState.i === 0; rNext.disabled = rState.i === n - 1;
    rThumbs.querySelectorAll('.thumb').forEach(function (t, k) { t.setAttribute('aria-current', k === rState.i ? 'true' : 'false'); });
    rSwitch.querySelectorAll('.rbtn').forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-rtype') === rState.key ? 'true' : 'false'); });
    document.getElementById('rStage').scrollTop = 0;
  }
  function buildReader(key) {
    var m = M[key];
    rSwitch.innerHTML = '';
    Object.keys(M).forEach(function (k) {
      if (M[k].group !== m.group || !M[k].pages) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rbtn'; b.setAttribute('data-rtype', k); b.textContent = M[k].title;
      b.addEventListener('click', function () { rState = { key: k, i: 0 }; buildReader(k); showPage(); });
      rSwitch.appendChild(b);
    });
    rThumbs.innerHTML = '';
    m.pages.forEach(function (_, k) {
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'thumb'; t.textContent = k + 1;
      t.setAttribute('aria-label', 'Page ' + (k + 1));
      t.addEventListener('click', function () { rState.i = k; showPage(); });
      rThumbs.appendChild(t);
    });
  }
  function openReader(key, i) {
    lastFocus = document.activeElement;
    rState = { key: key, i: i };
    buildReader(key); showPage();
    reader.hidden = false; document.body.classList.add('reader-open');
    document.getElementById('rClose').focus();
  }
  function closeReader() {
    reader.hidden = true; document.body.classList.remove('reader-open');
    reader.classList.remove('zoomed'); rZoom.setAttribute('aria-pressed', 'false');
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-menu]').forEach(function (btn) {
    btn.addEventListener('click', function () { var k = btn.getAttribute('data-open-menu'); if (M[k] && M[k].pages) openReader(k, 0); });
  });
  document.querySelectorAll('.pk-tabs').forEach(function (list) {
    var ts = Array.prototype.slice.call(list.querySelectorAll('.pk-tab'));
    ts.forEach(function (t, i) {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      function pick(focus) { ts.forEach(function (o) { var on = o === t; o.setAttribute('aria-selected', on ? 'true' : 'false'); o.tabIndex = on ? 0 : -1; document.getElementById(o.getAttribute('aria-controls')).hidden = !on; }); if (focus) t.focus(); }
      t.addEventListener('click', function () { pick(false); });
      t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); ts[(i + d + ts.length) % ts.length].click(); ts[(i + d + ts.length) % ts.length].focus(); } });
    });
  });
  rPrev.addEventListener('click', function () { if (rState.i > 0) { rState.i--; showPage(); } });
  rNext.addEventListener('click', function () { if (rState.i < M[rState.key].pages.length - 1) { rState.i++; showPage(); } });
  rZoom.addEventListener('click', function () {
    var on = !reader.classList.contains('zoomed');
    reader.classList.toggle('zoomed', on); rZoom.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.getElementById('rClose').addEventListener('click', closeReader);
  document.addEventListener('keydown', function (e) {
    if (reader.hidden) return;
    if (e.key === 'Escape') closeReader();
    else if (e.key === 'ArrowRight') rNext.click();
    else if (e.key === 'ArrowLeft') rPrev.click();
  });



  // ===== Modern layer =====
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // header state
    var head = document.querySelector('.site-head'), heads = document.querySelectorAll('.site-head');
    function onScroll() {
      var y = window.pageYOffset || 0;
      Array.prototype.forEach.call(heads, function (h) { h.classList.toggle('is-scrolled', y > 30); });
      if (mbar) mbar.classList.toggle('show', y > 420);
    }
    // mobile menu
    var rows = document.querySelectorAll('.site-head__row'), row = rows[0], nav = document.querySelector('.site-nav');
    if (row && nav) {
      var burger = document.createElement('button');
      burger.type = 'button'; burger.className = 'burger'; burger.setAttribute('aria-label', 'Open menu'); burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = '<span></span>';
      var burgers = Array.prototype.map.call(rows, function (r, i) { var bb = i ? burger.cloneNode(true) : burger; r.appendChild(bb); return bb; });
      var mm = document.createElement('div'); mm.className = 'mmenu'; mm.id = 'mmenu';
      var mnav = nav.cloneNode(true); mnav.className = ''; mnav.setAttribute('aria-label', 'Mobile');
      mm.appendChild(mnav);
      Array.prototype.forEach.call(mnav.querySelectorAll('a'), function (a, i) { a.style.transitionDelay = (0.15 + i * 0.05) + 's'; });
      var foot = document.createElement('div'); foot.className = 'mmenu__foot';
      var book = row.querySelector('.btn'); if (book) { var b2 = book.cloneNode(true); b2.style.alignSelf = 'flex-start'; foot.appendChild(b2); }
      var p = document.createElement('p'); p.textContent = '+971 50 256 6425 · info@myfuoco.com'; foot.appendChild(p);
      mm.appendChild(foot);
      head.insertAdjacentElement('afterend', mm);
      burgers.forEach(function (bb) { bb.setAttribute('aria-controls', 'mmenu'); });
      function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        burgers.forEach(function (bb) { bb.setAttribute('aria-expanded', open ? 'true' : 'false'); bb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });
      }
      burgers.forEach(function (bb) { bb.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); }); });
      mm.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }
    // floating booking bar on phones
    var mbar = document.createElement('div'); mbar.className = 'mbar';
    var home = (document.querySelector('.site-head a[aria-label*="home"]') || {}).getAttribute ? document.querySelector('.site-head a[aria-label*="home"]').getAttribute('href') : '/';
    var base = (home.charAt(0) === '#' || home === './') ? '' : home;
    mbar.innerHTML = '<a href="' + base + '#menus">Menus</a><a class="on" href="https://widget.servmeco.com/?oid=1672">Book a table</a>';
    document.body.appendChild(mbar);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function setHH() { if (head) document.documentElement.style.setProperty('--hh', head.offsetHeight + 'px'); }
    setHH(); window.addEventListener('resize', setHH);

    // hero ember follows the pointer
    var xh = document.querySelector('.xhero');
    if (xh && !reduce) {
      xh.addEventListener('pointermove', function (e) {
        var r = xh.getBoundingClientRect();
        xh.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        xh.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    }

    // reveal below-the-fold content
    if (!reduce && 'IntersectionObserver' in window) {
      var sel = 'main section h2, main section .lead, main section .photo, main section .card, main section .grid-3 > *, main section .grid-4 > *, main section .week li, main section .btn-row, main section .ev-pack, main section .pk, main section .dk > *, main section .menu-wrap, .site-foot .grid-4 > *';
      var vh = window.innerHeight;
      var els = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
        return !el.closest('.xhero') && !el.closest('.reader') && el.getBoundingClientRect().top > vh * 0.95;
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(function (el) {
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty('--d', Math.min(sib, 6) * 0.08 + 's');
        el.classList.add('rv'); io.observe(el);
      });
    }

    // gentle parallax on photos
    if (!reduce) {
      var ph = Array.prototype.slice.call(document.querySelectorAll('main .photo img'));
      var ticking = false;
      function par() {
        var vh = window.innerHeight;
        ph.forEach(function (img) {
          var r = img.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var t = ((r.top + r.height / 2) - vh / 2) / vh;
          img.style.translate = '0 ' + (t * -28).toFixed(1) + 'px';
        });
        ticking = false;
      }
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
      par();
    }
  })();


  // Line-up: highlight today's offers
  (function () {
    var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    document.querySelectorAll('.lineup > li[data-days]').forEach(function (li) {
      if (li.getAttribute('data-days').split(' ').indexOf(day) < 0) return;
      li.classList.add('is-today');
      var e = li.querySelector('.eyebrow');
      if (e && !e.querySelector('.today-tag')) { var t = document.createElement('span'); t.className = 'today-tag'; t.textContent = 'Today'; e.appendChild(t); }
    });
  })();
  // Festive countdown to midnight 31 Dec 2026, Dubai (UTC+4)
  (function () {
    var cells = document.querySelectorAll('[data-cd]');
    if (!cells.length) return;
    var target = Date.UTC(2026, 11, 31, 20, 0, 0);
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var ms = Math.max(0, target - Date.now()), s = Math.floor(ms / 1000);
      var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      cells.forEach(function (c) { var k = c.getAttribute('data-cd'); c.textContent = k === 'd' ? v.d : pad(v[k]); });
    }
    tick(); setInterval(tick, 1000);
  })();
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

})();
