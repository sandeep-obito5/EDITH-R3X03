/* =====================================================================
   EDITH-R3X — SITE INTERACTIONS
   Vanilla JS. Sections:
     1. Reduced-motion gate
     2. Mobile navigation
     3. Nav compaction on scroll
     4. Smooth-scroll with fixed-header offset
     5. Scroll reveal (IntersectionObserver)
     6. Active nav-section indicator (IntersectionObserver)
     7. Hero parallax (cursor-driven)
     8. Mini sequence highlight (Section 03)
     9. System architecture diagram (Section 06, signature interaction)
    10. Mission flow scroll progress (Section 07)
    11. Back-to-top button
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------
     1. Reduced-motion gate
     ------------------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('js-reveal-ready');
  }

  /* -------------------------------------------------------------
     2. Mobile navigation
     ------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------------------------------------------------
     3. Nav compaction + back-to-top visibility (shared scroll tick)
     ------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  var scrollTicking = false;

  function onScrollTick() {
    if (header) header.classList.toggle('is-compact', window.scrollY > 24);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 800);
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScrollTick);
      scrollTicking = true;
    }
  }, { passive: true });
  onScrollTick();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* -------------------------------------------------------------
     4. Smooth-scroll anchors with fixed-header offset
     ------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------------------------
     5. Scroll reveal
     ------------------------------------------------------------- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      // Hero elements already animate via pure CSS on load; skip re-observing them.
      if (el.closest('.hero')) return;
      revealObserver.observe(el);
    });
  }

  /* -------------------------------------------------------------
     6. Active nav-section indicator
     ------------------------------------------------------------- */
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var navSectionIds = Array.prototype.map.call(navLinks, function (link) {
    return link.getAttribute('href').replace('#', '');
  });
  var navSections = navSectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (navSections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.5 });

    navSections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* -------------------------------------------------------------
     7. Hero parallax (cursor-driven, skipped on touch / reduced motion)
     ------------------------------------------------------------- */
  var hero = document.querySelector('.hero');
  var canParallax = hero && !prefersReducedMotion &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canParallax) {
    var depthLayers = hero.querySelectorAll('[data-depth]');
    depthLayers.forEach(function (el) {
      el.style.setProperty('--depth', el.getAttribute('data-depth') + 'px');
      el.style.transform = 'translate3d(calc(var(--mx, 0) * var(--depth, 0px)), calc(var(--my, 0) * var(--depth, 0px)), 0)';
    });

    var latestX = 0, latestY = 0, parallaxTicking = false;

    function applyParallax() {
      hero.style.setProperty('--mx', latestX.toFixed(3));
      hero.style.setProperty('--my', latestY.toFixed(3));
      parallaxTicking = false;
    }

    hero.addEventListener('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      latestX = ((event.clientX - rect.left) / rect.width) - 0.5;
      latestY = ((event.clientY - rect.top) / rect.height) - 0.5;
      if (!parallaxTicking) {
        window.requestAnimationFrame(applyParallax);
        parallaxTicking = true;
      }
    });

    hero.addEventListener('mouseleave', function () {
      latestX = 0; latestY = 0;
      window.requestAnimationFrame(applyParallax);
    });
  }

  /* -------------------------------------------------------------
     8. Mini sequence highlight (Section 03 — DEPLOY..RESPOND)
     Highlights each step in turn as the section scrolls through view.
     ------------------------------------------------------------- */
  var miniSequence = document.getElementById('miniSequence');
  if (miniSequence && 'IntersectionObserver' in window) {
    var miniSteps = miniSequence.querySelectorAll('[data-step]');
    var miniObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-active');
      });
    }, { threshold: 0.6 });
    miniSteps.forEach(function (step, index) {
      // Stagger-in even if all become visible near-simultaneously
      step.style.transitionDelay = prefersReducedMotion ? '0s' : (index * 90) + 'ms';
      miniObserver.observe(step);
    });
  }

  /* -------------------------------------------------------------
     9. System architecture diagram (signature interactive element)
     ------------------------------------------------------------- */
  var archDiagram = document.getElementById('archDiagram');
  var archDetail = document.getElementById('archDetail');

  var archInfo = {
    root: {
      title: 'EDITH-R3X',
      body: 'The platform root. Every subsystem below feeds situational data back up through this integration layer.',
      lines: ['line-root-sensing', 'line-root-flight', 'line-root-power']
    },
    sensing: {
      title: 'Sensing',
      body: 'Optical, thermal and environmental sensors that observe the disaster environment in real time.',
      lines: ['line-root-sensing', 'line-sensing-merge', 'line-merge-processing', 'line-processing-comm', 'line-comm-response']
    },
    flight: {
      title: 'Flight Control',
      body: 'Flight-control architecture responsible for stable, responsive aerial operation.',
      lines: ['line-root-flight', 'line-flight-merge', 'line-merge-processing', 'line-processing-comm', 'line-comm-response']
    },
    power: {
      title: 'Power',
      body: 'Power architecture supporting the airframe, propulsion and onboard systems.',
      lines: ['line-root-power', 'line-power-merge', 'line-merge-processing', 'line-processing-comm', 'line-comm-response']
    },
    processing: {
      title: 'Onboard Processing',
      body: 'Consolidates sensing, flight and power data into a single onboard information stream.',
      lines: ['line-processing-comm', 'line-comm-response']
    },
    comm: {
      title: 'Communication',
      body: 'Carries processed information from the platform toward response teams on the ground.',
      lines: ['line-comm-response']
    },
    response: {
      title: 'Response Team',
      body: 'The human decision-makers EDITH-R3X is designed to support, not replace.',
      lines: []
    }
  };

  if (archDiagram && archDetail) {
    var archNodes = archDiagram.querySelectorAll('.arch-node');

    function clearArchState() {
      archNodes.forEach(function (n) { n.classList.remove('is-active'); n.setAttribute('aria-expanded', 'false'); });
      archDiagram.querySelectorAll('.arch-line').forEach(function (l) { l.classList.remove('is-active'); });
    }

    function playSignal(lineId) {
      var motion = document.getElementById('motion-' + lineId);
      var dot = archDiagram.querySelector('circle[data-line="' + lineId + '"]');
      if (!motion || !dot || prefersReducedMotion) return;
      dot.setAttribute('opacity', '1');
      try { motion.beginElement(); } catch (e) { /* SMIL unsupported — line highlight still shows */ }
      window.setTimeout(function () { dot.setAttribute('opacity', '0'); }, 1300);
    }

    archNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        var key = node.getAttribute('data-node');
        var info = archInfo[key];
        var alreadyActive = node.classList.contains('is-active');

        clearArchState();

        if (alreadyActive) {
          archDetail.innerHTML = '<p class="arch-detail-placeholder">Select a node above to view its role in the platform.</p>';
          return;
        }

        node.classList.add('is-active');
        node.setAttribute('aria-expanded', 'true');

        if (info) {
          info.lines.forEach(function (lineId, i) {
            var lineEl = document.getElementById(lineId);
            if (lineEl) lineEl.classList.add('is-active');
            window.setTimeout(function () { playSignal(lineId); }, i * 120);
          });

          archDetail.innerHTML =
            '<div class="arch-detail-content">' +
              '<p class="arch-detail-title">' + info.title + '</p>' +
              '<p class="arch-detail-body">' + info.body + '</p>' +
            '</div>';
        }
      });
    });
  }

  /* -------------------------------------------------------------
     10. Mission flow scroll progress (Section 07)
     ------------------------------------------------------------- */
  var flowTrack = document.getElementById('flowTrack');
  var flowFill = document.getElementById('flowLineFill');

  if (flowTrack && 'IntersectionObserver' in window) {
    var flowStages = flowTrack.querySelectorAll('[data-stage]');
    var flowObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var index = Array.prototype.indexOf.call(flowStages, entry.target);
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          if (flowFill) {
            var pct = ((index + 1) / flowStages.length) * 100;
            flowFill.style.width = pct + '%';
          }
        }
      });
    }, { threshold: 0.6, rootMargin: '-10% 0px -10% 0px' });

    flowStages.forEach(function (stage) { flowObserver.observe(stage); });
  }
})();
