/* Navgold Ltd rebuild — progressive enhancement only.
   Interactions differ from the original: hover-intent dropdowns with keyboard support,
   a right-hand mobile drawer with accordions, IntersectionObserver reveals and
   count-up statistics (the original used framer-motion on mount). */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var qa = doc.documentElement.hasAttribute('data-qa');

  /* ---------------------------------------------------------------- header */
  var header = doc.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -------------------------------------------------------- desktop menus */
  var items = [].slice.call(doc.querySelectorAll('.nav__item'));
  var closeTimer = null;

  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('is-open');
      var t = it.querySelector('.nav__trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('.nav__trigger');
    if (!trigger) return;

    function open() {
      closeAll(item);
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 901px)').matches) {
        window.clearTimeout(closeTimer);
        open();
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(min-width: 901px)').matches) {
        closeTimer = window.setTimeout(close, 140);
      }
    });
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (item.classList.contains('is-open')) close();
      else open();
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        var first = item.querySelector('.menu__link');
        if (first) first.focus();
      }
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      closeDrawer();
    }
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item')) closeAll(null);
  });

  /* -------------------------------------------------------------- drawer */
  var drawer = doc.querySelector('[data-drawer]');
  var burger = doc.querySelector('[data-burger]');

  function openDrawer() {
    if (!drawer || !burger) return;
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    doc.body.style.overflow = 'hidden';
    var firstLink = drawer.querySelector('.drawer__trigger');
    if (firstLink) firstLink.focus();
  }
  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeDrawer();
      else openDrawer();
    });
  }
  var drawerClose = doc.querySelector('[data-drawer-close]');
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

  [].slice.call(doc.querySelectorAll('.drawer__trigger')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.nextElementSibling;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });

  /* ------------------------------------------------------------- reveals */
  var revealables = [].slice.call(doc.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------- counters */
  function countUp(el) {
    var raw = el.getAttribute('data-count') || el.textContent;
    var match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!match) return;
    var prefix = match[1];
    var targetText = match[2];
    var suffix = match[3];
    var decimals = (targetText.split('.')[1] || '').length;
    var target = parseFloat(targetText.replace(/,/g, ''));
    if (!isFinite(target)) return;
    var start = performance.now();
    var duration = 1100;
    function frame(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = target * eased;
      var out = decimals
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString('en-GB');
      el.textContent = prefix + out + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = raw;
    }
    requestAnimationFrame(frame);
  }
  var counters = [].slice.call(doc.querySelectorAll('[data-count]'));
  if (qa || !counters.length || !('IntersectionObserver' in window) || reduce) {
    /* keep the final value in QA / reduced-motion / no-IO environments */
  } else {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* --------------------------------------------------------------- cookie */
  var bar = doc.querySelector('[data-cookie]');
  var KEY = 'ur-cookie-choice';
  try {
    if (bar && !localStorage.getItem(KEY)) {
      window.setTimeout(function () {
        bar.hidden = false;
        doc.body.classList.add('cookie-open');
      }, 900);
    }
  } catch (err) { /* storage blocked: keep the bar hidden */ }
  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch (err) {}
    if (bar) bar.hidden = true;
    doc.body.classList.remove('cookie-open');
  }
  var accept = doc.querySelector('[data-cookie-accept]');
  var reject = doc.querySelector('[data-cookie-reject]');
  if (accept) accept.addEventListener('click', function () { choose('analytics'); });
  if (reject) reject.addEventListener('click', function () { choose('essential'); });

  /* ----------------------------------------------------------------- share */
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else {
      fallback(text, done);
    }
  }
  function fallback(text, done) {
    var ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand('copy'); } catch (err) {}
    doc.body.removeChild(ta);
    done();
  }
  [].slice.call(doc.querySelectorAll('[data-share]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-share-url') || window.location.href;
      if (navigator.share) {
        navigator.share({ title: doc.title, url: url }).catch(function () {});
      } else {
        copy(url, function () {
          var label = btn.querySelector('span');
          if (label) {
            var prev = label.textContent;
            label.textContent = 'Link copied';
            window.setTimeout(function () { label.textContent = prev; }, 1800);
          }
        });
      }
    });
  });
  [].slice.call(doc.querySelectorAll('[data-copy]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-share-url') || window.location.href;
      copy(url, function () {
        var label = btn.querySelector('span');
        if (label) {
          var prev = label.textContent;
          label.textContent = 'Copied';
          window.setTimeout(function () { label.textContent = prev; }, 1800);
        }
      });
    });
  });

  /* ----------------------------------------------------------------- forms */
  /* Static build: forms compose a mailto: instead of posting to a server.
     Replace the mailto hand-off with a fetch() to your own endpoint if you
     want submissions delivered server-side. */
  [].slice.call(doc.querySelectorAll('[data-form]')).forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var honey = form.querySelector('input[name="websiteUrl"]');
      if (honey && honey.value) return; /* silently drop bots */
      var bad = [];
      [].slice.call(form.querySelectorAll('[required]')).forEach(function (input) {
        input.value = input.value.trim();
        var valid = input.checkValidity && input.checkValidity();
        if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) valid = false;
        input.setAttribute('aria-invalid', String(!valid));
        if (!valid) bad.push(input);
      });
      if (bad.length) {
        if (status) {
          status.textContent = 'Please complete the highlighted fields.';
          status.className = 'form__status is-err';
        }
        bad[0].focus();
        return;
      }
      var kind = form.getAttribute('data-form');
      var to = 'support@superfooduk.com';
      var lines = ['Hello Navgold Ltd,', ''];
      var subject = kind === 'audit' ? 'Free Amazon audit request' : 'Website enquiry';
      [].slice.call(form.querySelectorAll('input:not([name="websiteUrl"]), select, textarea')).forEach(function (field) {
        if (!field.name || !field.value) return;
        lines.push(field.name.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }) + ': ' + field.value);
      });
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) +
                 '&body=' + encodeURIComponent(lines.join('\n'));
      if (status) {
        status.textContent = kind === 'audit'
          ? 'Opening your email app — your audit request is ready to send.'
          : 'Opening your email app — your message is ready to send.';
        status.className = 'form__status is-ok';
      }
      window.location.href = href;
    });
  });
})();
