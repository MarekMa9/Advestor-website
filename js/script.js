/* =============================================
   ADVESTOR.SK - Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');


  /* --- Services carousel --- */
  const servicesCards = document.querySelector('.services-cards');
  const btnPrev = document.getElementById('svc-prev');
  const btnNext = document.getElementById('svc-next');

  if (servicesCards && btnNext && btnPrev) {
    const scrollAmount = 323; // card width + gap
    btnNext.addEventListener('click', () => {
      servicesCards.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    btnPrev.addEventListener('click', () => {
      servicesCards.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }

  /* --- Case studies tabs --- */
  const caseData = [
    {
      tab: 'TechVision s.r.o.',
      client: 'TechVision s.r.o.',
      category: 'SaaS / Technologie',
      desc: 'Komplexná SEO stratégia kombinovaná s content marketingom a PPC kampaňami. Optimalizácia konverzného lievika a redesign landing pages.',
      result: 'Za 6 mesiacov sme dosiahli 4x návratnosť investície a stabilný organický rast.',
      chart1Src: 'https://www.figma.com/api/mcp/asset/039857b8-53d8-42ec-ae1e-b365086f1fb5',
      chart2Src: 'https://www.figma.com/api/mcp/asset/9bf66c35-8e96-414b-a430-a63a77b79798',
      growth: '+244%',
      barsBefore: [15, 20, 18, 22, 17, 25],
      barsAfter:  [35, 50, 62, 70, 80, 95],
    },
    {
      tab: 'NovaFlow a.s.',
      client: 'NovaFlow a.s.',
      category: 'E-commerce',
      desc: 'Kompletná správa sociálnych sietí kombinovaná s platenou reklamou na Meta a Google. A/B testovanie reklám a optimalizácia konverzií.',
      result: 'Zvýšenie predajov o 180% za 4 mesiace pri znížení nákladov na akvizíciu o 35%.',
      chart1Src: 'https://www.figma.com/api/mcp/asset/039857b8-53d8-42ec-ae1e-b365086f1fb5',
      chart2Src: 'https://www.figma.com/api/mcp/asset/9bf66c35-8e96-414b-a430-a63a77b79798',
      growth: '+180%',
      barsBefore: [10, 12, 14, 18, 20, 22],
      barsAfter:  [25, 38, 52, 64, 75, 88],
    },
    {
      tab: 'DataPulse Group',
      client: 'DataPulse Group',
      category: 'B2B / Technologie',
      desc: 'LinkedIn marketing, content stratégia a lead generation kampane zamerané na firemných klientov v oblasti dátovej analytiky.',
      result: 'Nárast kvalifikovaných B2B leadov o 320% a skrátenie sales cyklu o 40%.',
      chart1Src: 'https://www.figma.com/api/mcp/asset/039857b8-53d8-42ec-ae1e-b365086f1fb5',
      chart2Src: 'https://www.figma.com/api/mcp/asset/9bf66c35-8e96-414b-a430-a63a77b79798',
      growth: '+320%',
      barsBefore: [8, 10, 11, 14, 12, 16],
      barsAfter:  [22, 35, 48, 62, 72, 90],
    },
  ];

  let activeTab = 0;
  let casePage = 1;

  const tabBtns = document.querySelectorAll('.tab-btn');
  const paginationText = document.getElementById('case-page');

  function updateCaseStudy(index) {
    const d = caseData[index];
    document.getElementById('case-client').textContent = d.client;
    document.getElementById('case-category').textContent = d.category;
    document.getElementById('case-desc').textContent = d.desc;
    document.getElementById('case-result-text').innerHTML = `<strong>Výsledok:</strong> <span>${d.result}</span>`;
    document.getElementById('case-growth').textContent = d.growth;

    // Update bar chart
    const bars = document.querySelectorAll('.bar--after');
    const barsBefore = document.querySelectorAll('.bar--before');
    d.barsAfter.forEach((h, i) => {
      if (bars[i]) bars[i].style.height = h + '%';
    });
    d.barsBefore.forEach((h, i) => {
      if (barsBefore[i]) barsBefore[i].style.height = h + '%';
    });

    // Update tabs
    tabBtns.forEach((btn, i) => {
      btn.className = 'tab-btn ' + (i === index ? 'tab-btn--active' : 'tab-btn--inactive');
    });

    casePage = index + 1;
    if (paginationText) paginationText.textContent = casePage + ' / ' + caseData.length;
  }

  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      activeTab = i;
      updateCaseStudy(i);
    });
  });

  const casePrev = document.getElementById('case-prev');
  const caseNext = document.getElementById('case-next');

  if (casePrev) casePrev.addEventListener('click', () => {
    activeTab = (activeTab - 1 + caseData.length) % caseData.length;
    updateCaseStudy(activeTab);
  });
  if (caseNext) caseNext.addEventListener('click', () => {
    activeTab = (activeTab + 1) % caseData.length;
    updateCaseStudy(activeTab);
  });

  /* --- Smooth anchor links --- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const navSections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveNavLink(activeId) {
    navLinks.forEach(link => {
      const isActive = activeId && link.getAttribute('href') === `#${activeId}`;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveNavLink() {
    const navOffset = (nav ? nav.offsetHeight : 0) + 24;
    let activeSectionId = '';

    navSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navOffset && rect.bottom > navOffset) {
        activeSectionId = section.id;
      }
    });

    setActiveNavLink(activeSectionId);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navOffset = (nav ? nav.offsetHeight : 0) + 16;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: 'smooth',
        });
      }
    });
  });

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  window.addEventListener('resize', updateActiveNavLink);

  /* --- Mobile hamburger menu --- */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileOverlay = document.getElementById('nav-mobile-overlay');

  hamburger?.addEventListener('click', function () {
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isOpen));
    mobileOverlay?.setAttribute('aria-hidden', String(isOpen));
    mobileOverlay?.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  mobileOverlay?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileOverlay.setAttribute('aria-hidden', 'true');
      mobileOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* --- Portfolio overlay (mobile tap toggle + button actions) --- */
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  portfolioItems.forEach(item => {
    const overlay = item.querySelector('.portfolio-overlay');
    const url = item.dataset.url;
    let videos = [];
    try { videos = JSON.parse(item.dataset.videos || '[]'); } catch (e) { /* ignore */ }

    // Mobile: tap card to toggle overlay
    item.addEventListener('click', e => {
      if (!isTouchDevice()) return;
      // If clicking a button inside overlay, don't toggle
      if (e.target.closest('.portfolio-overlay-btn')) return;
      e.preventDefault();

      // Close other overlays
      document.querySelectorAll('.portfolio-overlay.is-active').forEach(o => {
        if (o !== overlay) o.classList.remove('is-active');
      });
      overlay.classList.toggle('is-active');
    });

    // Button: open web
    item.querySelectorAll('[data-action="open-web"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    // Button: play video
    item.querySelectorAll('[data-action="play-video"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (videos.length) openVideoPlayer(videos);
      });
    });
  });

  // Close mobile overlays when tapping outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.portfolio-item')) {
      document.querySelectorAll('.portfolio-overlay.is-active').forEach(o => {
        o.classList.remove('is-active');
      });
    }
  });

  /* --- Fullscreen Video Player --- */
  const videoOverlay = document.getElementById('videoPlayerOverlay');
  const videoEl = document.getElementById('videoPlayerVideo');
  const videoCloseBtn = document.getElementById('videoPlayerClose');
  const swipeHint = document.getElementById('videoSwipeHint');
  const pauseOverlay = document.getElementById('videoPauseOverlay');

  let currentVideos = [];
  let currentVideoIndex = 0;
  let isTransitioning = false;

  function openVideoPlayer(videos) {
    currentVideos = videos;
    currentVideoIndex = 0;
    loadVideo(currentVideoIndex);
    videoOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateSwipeHint();
    pauseOverlay.classList.remove('is-visible');
  }

  function closeVideoPlayer() {
    videoOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
    currentVideos = [];
    pauseOverlay.classList.remove('is-visible');
  }

  function loadVideo(index) {
    videoEl.src = currentVideos[index];
    videoEl.load();
    videoEl.play().catch(() => {});
    pauseOverlay.classList.remove('is-visible');
  }

  // Click video to pause/play
  if (videoEl) {
    videoEl.addEventListener('click', () => {
      if (isTransitioning) return;
      if (videoEl.paused) {
        videoEl.play();
        pauseOverlay.classList.remove('is-visible');
      } else {
        videoEl.pause();
        pauseOverlay.classList.add('is-visible');
      }
    });
  }

  // Click pause overlay to resume
  if (pauseOverlay) {
    pauseOverlay.addEventListener('click', () => {
      videoEl.play();
      pauseOverlay.classList.remove('is-visible');
    });
  }

  // Click swipe hint to go to next video
  if (swipeHint) {
    swipeHint.addEventListener('click', () => goToVideo(1));
  }

  function updateSwipeHint() {
    if (currentVideoIndex >= currentVideos.length - 1) {
      swipeHint.classList.add('is-hidden');
    } else {
      swipeHint.classList.remove('is-hidden');
    }
  }

  function goToVideo(direction) {
    // direction: 1 = next, -1 = previous
    const nextIndex = currentVideoIndex + direction;
    if (nextIndex < 0 || nextIndex >= currentVideos.length || isTransitioning) return;

    isTransitioning = true;
    const outClass = direction === 1 ? 'slide-up-out' : 'slide-down-out';
    const inClass = direction === 1 ? 'slide-up-in' : 'slide-down-in';

    videoEl.classList.add(outClass);

    setTimeout(() => {
      videoEl.pause();
      videoEl.classList.remove(outClass);
      currentVideoIndex = nextIndex;
      loadVideo(currentVideoIndex);
      videoEl.classList.add(inClass);
      updateSwipeHint();

      setTimeout(() => {
        videoEl.classList.remove(inClass);
        isTransitioning = false;
      }, 400);
    }, 400);
  }

  // Close button
  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeVideoPlayer);
  }

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && videoOverlay.classList.contains('is-open')) {
      closeVideoPlayer();
    }
  });

  // Auto-advance on video end
  if (videoEl) {
    videoEl.addEventListener('ended', () => {
      if (currentVideoIndex < currentVideos.length - 1) {
        setTimeout(() => goToVideo(1), 800);
      } else {
        setTimeout(closeVideoPlayer, 800);
      }
    });
  }

  // Mouse wheel navigation
  if (videoOverlay) {
    videoOverlay.addEventListener('wheel', e => {
      if (!videoOverlay.classList.contains('is-open')) return;
      e.preventDefault();
      if (e.deltaY > 0) goToVideo(1);
      else if (e.deltaY < 0) goToVideo(-1);
    }, { passive: false });
  }

  // Touch swipe navigation
  let touchStartY = 0;
  let touchEndY = 0;

  if (videoOverlay) {
    videoOverlay.addEventListener('touchstart', e => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    videoOverlay.addEventListener('touchend', e => {
      touchEndY = e.changedTouches[0].screenY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToVideo(1);   // swipe up = next
        else goToVideo(-1);            // swipe down = previous
      }
    }, { passive: true });
  }

  // Mouse drag navigation
  let dragStartY = 0;
  let isDragging = false;

  if (videoOverlay) {
    videoOverlay.addEventListener('mousedown', e => {
      if (e.target.closest('.video-player-close')) return;
      isDragging = true;
      dragStartY = e.screenY;
    });

    videoOverlay.addEventListener('mousemove', e => {
      if (isDragging) e.preventDefault();
    });

    videoOverlay.addEventListener('mouseup', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = dragStartY - e.screenY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToVideo(1);
        else goToVideo(-1);
      }
    });
  }

  /* --- Init --- */
  updateCaseStudy(0);
  updateActiveNavLink();
});
