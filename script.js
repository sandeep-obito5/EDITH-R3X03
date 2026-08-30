/* =====================================================================
   EDITH-R3X — SITE INTERACTIONS
   Scroll-safe version
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------
     0. FORCE NORMAL PAGE SCROLL
     ------------------------------------------------------------- */

  document.documentElement.style.overflowY = 'auto';
  document.documentElement.style.overflowX = 'hidden';

  document.body.style.overflowY = 'auto';
  document.body.style.overflowX = 'hidden';

  /* -------------------------------------------------------------
     1. Reduced-motion gate
     ------------------------------------------------------------- */

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

      navToggle.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

    });

    primaryNav.querySelectorAll('a').forEach(function (link) {

      link.addEventListener('click', function () {

        primaryNav.classList.remove('is-open');

        navToggle.setAttribute(
          'aria-expanded',
          'false'
        );

      });

    });
  }

  /* -------------------------------------------------------------
     3. Header + Back To Top
     ------------------------------------------------------------- */

  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');

  var scrollTicking = false;

  function onScrollTick() {

    var scrollPosition = window.scrollY;

    if (header) {
      header.classList.toggle(
        'is-compact',
        scrollPosition > 24
      );
    }

    if (backToTop) {
      backToTop.classList.toggle(
        'is-visible',
        scrollPosition > 800
      );
    }

    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    function () {

      if (!scrollTicking) {

        window.requestAnimationFrame(
          onScrollTick
        );

        scrollTicking = true;
      }

    },
    { passive: true }
  );

  onScrollTick();

  /* -------------------------------------------------------------
     4. Back To Top
     ------------------------------------------------------------- */

  if (backToTop) {

    backToTop.addEventListener(
      'click',
      function () {

        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion
            ? 'auto'
            : 'smooth'
        });

      }
    );

  }

  /* -------------------------------------------------------------
     5. Smooth Scroll
     ------------------------------------------------------------- */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {

      link.addEventListener(
        'click',
        function (event) {

          var id = link.getAttribute('href');

          if (
            !id ||
            id === '#' ||
            id.length < 2
          ) {
            return;
          }

          var target = document.querySelector(id);

          if (!target) {
            return;
          }

          event.preventDefault();

          var headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;

          var top =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            12;

          window.scrollTo({
            top: top,
            behavior: prefersReducedMotion
              ? 'auto'
              : 'smooth'
          });

        }
      );

    });

  /* -------------------------------------------------------------
     6. Scroll Reveal
     ------------------------------------------------------------- */

  if (
    !prefersReducedMotion &&
    'IntersectionObserver' in window
  ) {

    var revealObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(function (entry) {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                'is-visible'
              );

              revealObserver.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -60px 0px'
        }
      );

    document
      .querySelectorAll('.reveal')
      .forEach(function (el) {

        if (el.closest('.hero')) {
          return;
        }

        revealObserver.observe(el);

      });

  }

  /* -------------------------------------------------------------
     7. Active Navigation
     ------------------------------------------------------------- */

  var navLinks =
    document.querySelectorAll('[data-nav-link]');

  var navSectionIds =
    Array.prototype.map.call(
      navLinks,
      function (link) {

        var href =
          link.getAttribute('href');

        return href
          ? href.replace('#', '')
          : '';

      }
    );

  var navSections =
    navSectionIds
      .map(function (id) {

        return document.getElementById(id);

      })
      .filter(Boolean);

  if (
    navSections.length &&
    'IntersectionObserver' in window
  ) {

    var sectionObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(function (entry) {

            if (entry.isIntersecting) {

              var id =
                entry.target.getAttribute('id');

              navLinks.forEach(function (link) {

                link.classList.toggle(
                  'is-active',
                  link.getAttribute('href') ===
                    '#' + id
                );

              });

            }

          });

        },
        {
          threshold: 0.3,
          rootMargin: '-10% 0px -50% 0px'
        }
      );

    navSections.forEach(function (section) {

      sectionObserver.observe(section);

    });

  }

  /* -------------------------------------------------------------
     8. Hero Parallax
     ------------------------------------------------------------- */

  var hero =
    document.querySelector('.hero');

  var canParallax =
    hero &&
    !prefersReducedMotion &&
    window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

  if (canParallax) {

    var depthLayers =
      hero.querySelectorAll('[data-depth]');

    var latestX = 0;
    var latestY = 0;
    var parallaxTicking = false;

    depthLayers.forEach(function (el) {

      el.style.setProperty(
        '--depth',
        el.getAttribute('data-depth') + 'px'
      );

    });

    function applyParallax() {

      depthLayers.forEach(function (el) {

        var depth =
          parseFloat(
            el.getAttribute('data-depth')
          ) || 0;

        var x =
          latestX * depth;

        var y =
          latestY * depth;

        el.style.transform =
          'translate3d(' +
          x +
          'px,' +
          y +
          'px,0)';

      });

      parallaxTicking = false;
    }

    hero.addEventListener(
      'mousemove',
      function (event) {

        var rect =
          hero.getBoundingClientRect();

        latestX =
          ((event.clientX - rect.left) /
            rect.width) -
          0.5;

        latestY =
          ((event.clientY - rect.top) /
            rect.height) -
          0.5;

        if (!parallaxTicking) {

          window.requestAnimationFrame(
            applyParallax
          );

          parallaxTicking = true;
        }

      }
    );

    hero.addEventListener(
      'mouseleave',
      function () {

        latestX = 0;
        latestY = 0;

        window.requestAnimationFrame(
          applyParallax
        );

      }
    );

  }

  /* -------------------------------------------------------------
     9. Mini Sequence
     ------------------------------------------------------------- */

  var miniSequence =
    document.getElementById(
      'miniSequence'
    );

  if (
    miniSequence &&
    'IntersectionObserver' in window
  ) {

    var miniSteps =
      miniSequence.querySelectorAll(
        '[data-step]'
      );

    var miniObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(function (entry) {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                'is-active'
              );

            }

          });

        },
        {
          threshold: 0.6
        }
      );

    miniSteps.forEach(
      function (step, index) {

        step.style.transitionDelay =
          prefersReducedMotion
            ? '0s'
            : index * 90 + 'ms';

        miniObserver.observe(step);

      }
    );

  }

  /* -------------------------------------------------------------
     10. Architecture Diagram
     ------------------------------------------------------------- */

  var archDiagram =
    document.getElementById(
      'archDiagram'
    );

  var archDetail =
    document.getElementById(
      'archDetail'
    );

  var archInfo = {

    root: {
      title: 'EDITH-R3X',
      body:
        'The platform root. Every subsystem below feeds situational data back up through this integration layer.',
      lines: [
        'line-root-sensing',
        'line-root-flight',
        'line-root-power'
      ]
    },

    sensing: {
      title: 'Sensing',
      body:
        'Optical, thermal and environmental sensors that observe the disaster environment in real time.',
      lines: [
        'line-root-sensing',
        'line-sensing-merge',
        'line-merge-processing',
        'line-processing-comm',
        'line-comm-response'
      ]
    },

    flight: {
      title: 'Flight Control',
      body:
        'Flight-control architecture responsible for stable, responsive aerial operation.',
      lines: [
        'line-root-flight',
        'line-flight-merge',
        'line-merge-processing',
        'line-processing-comm',
        'line-comm-response'
      ]
    },

    power: {
      title: 'Power',
      body:
        'Power architecture supporting the airframe, propulsion and onboard systems.',
      lines: [
        'line-root-power',
        'line-power-merge',
        'line-merge-processing',
        'line-processing-comm',
        'line-comm-response'
      ]
    },

    processing: {
      title: 'Onboard Processing',
      body:
        'Consolidates sensing, flight and power data into a single onboard information stream.',
      lines: [
        'line-processing-comm',
        'line-comm-response'
      ]
    },

    comm: {
      title: 'Communication',
      body:
        'Carries processed information from the platform toward response teams on the ground.',
      lines: [
        'line-comm-response'
      ]
    },

    response: {
      title: 'Response Team',
      body:
        'The human decision-makers EDITH-R3X is designed to support, not replace.',
      lines: []
    }

  };

  if (archDiagram && archDetail) {

    var archNodes =
      archDiagram.querySelectorAll(
        '.arch-node'
      );

    function clearArchState() {

      archNodes.forEach(function (node) {

        node.classList.remove(
          'is-active'
        );

        node.setAttribute(
          'aria-expanded',
          'false'
        );

      });

      archDiagram
        .querySelectorAll('.arch-line')
        .forEach(function (line) {

          line.classList.remove(
            'is-active'
          );

        });

    }

    function playSignal(lineId) {

      if (prefersReducedMotion) {
        return;
      }

      var motion =
        document.getElementById(
          'motion-' + lineId
        );

      var dot =
        archDiagram.querySelector(
          'circle[data-line="' +
          lineId +
          '"]'
        );

      if (!motion || !dot) {
        return;
      }

      dot.setAttribute(
        'opacity',
        '1'
      );

      try {
        motion.beginElement();
      } catch (e) {}

      window.setTimeout(
        function () {

          dot.setAttribute(
            'opacity',
            '0'
          );

        },
        1300
      );

    }

    archNodes.forEach(
      function (node) {

        node.addEventListener(
          'click',
          function () {

            var key =
              node.getAttribute(
                'data-node'
              );

            var info =
              archInfo[key];

            var alreadyActive =
              node.classList.contains(
                'is-active'
              );

            clearArchState();

            if (alreadyActive) {

              archDetail.innerHTML =
                '<p class="arch-detail-placeholder">' +
                'Select a node above to view its role in the platform.' +
                '</p>';

              return;
            }

            node.classList.add(
              'is-active'
            );

            node.setAttribute(
              'aria-expanded',
              'true'
            );

            if (info) {

              info.lines.forEach(
                function (lineId, index) {

                  var lineEl =
                    document.getElementById(
                      lineId
                    );

                  if (lineEl) {

                    lineEl.classList.add(
                      'is-active'
                    );

                  }

                  window.setTimeout(
                    function () {

                      playSignal(
                        lineId
                      );

                    },
                    index * 120
                  );

                }
              );

              archDetail.innerHTML =
                '<div class="arch-detail-content">' +
                  '<p class="arch-detail-title">' +
                    info.title +
                  '</p>' +
                  '<p class="arch-detail-body">' +
                    info.body +
                  '</p>' +
                '</div>';

            }

          }
        );

      }
    );

  }

  /* -------------------------------------------------------------
     11. Mission Flow
     ------------------------------------------------------------- */

  var flowTrack =
    document.getElementById(
      'flowTrack'
    );

  var flowFill =
    document.getElementById(
      'flowLineFill'
    );

  if (
    flowTrack &&
    'IntersectionObserver' in window
  ) {

    var flowStages =
      flowTrack.querySelectorAll(
        '[data-stage]'
      );

    var flowObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              var index =
                Array.prototype.indexOf.call(
                  flowStages,
                  entry.target
                );

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  'is-active'
                );

                if (flowFill) {

                  var pct =
                    ((index + 1) /
                      flowStages.length) *
                    100;

                  flowFill.style.width =
                    pct + '%';

                }

              }

            }
          );

        },
        {
          threshold: 0.4,
          rootMargin:
            '-10% 0px -10% 0px'
        }
      );

    flowStages.forEach(
      function (stage) {

        flowObserver.observe(stage);

      }
    );

  }

  /* -------------------------------------------------------------
     12. FINAL SCROLL SAFETY
     ------------------------------------------------------------- */

  window.addEventListener(
    'load',
    function () {

      document.documentElement.style.overflowY =
        'auto';

      document.body.style.overflowY =
        'auto';

    }
  );

})();