
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
