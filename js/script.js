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

  // ── Chart helpers ──────────────────────────────────────────────

  function buildSingleBarChart(container, labels, values, color = '#beec1b', unit = '') {
    const W = 500, H = 160, padX = 30, padY = 24, botPad = 8;
    const maxVal = Math.max(...values);
    const n = values.length;
    const barW = Math.floor((W - padX * 2) / n * 0.55);
    const gap  = Math.floor((W - padX * 2) / n);

    const barsHtml = values.map((v, i) => {
      const x = padX + i * gap + (gap - barW) / 2;
      const barH = Math.round((v / maxVal) * (H - padY - botPad));
      const y = H - botPad - barH;
      const num = v.toLocaleString('sk-SK');
      const formatted = unit === '€' ? `${num}${unit}` : unit ? `${num}${unit}` : num;
      return `
        <rect class="svgbar" x="${x}" y="${H - botPad}" width="${barW}" height="0"
          rx="3" fill="${color}" data-y="${y}" data-h="${barH}"
          style="transition:none"/>
        <text x="${x + barW/2}" y="${y - 6}" text-anchor="middle"
          fill="${color}" font-size="12" font-weight="700" font-family="inherit"
          opacity="0" class="svgbar-lbl">${formatted}</text>`;
    }).join('');

    const lblsHtml = labels.map((l, i) => {
      const cx = padX + i * gap + gap / 2;
      const pct = (cx / W * 100).toFixed(2);
      return `<div class="bar-label" style="position:absolute;left:${pct}%;transform:translateX(-50%);white-space:nowrap">${l}</div>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"
        style="width:100%;flex:1;overflow:visible;display:block;min-height:0">
        ${barsHtml}
      </svg>
      <div style="position:relative;height:20px;flex-shrink:0;border-top:1px solid rgba(255,255,255,0.05);margin-top:6px;overflow:visible">
        ${lblsHtml}
      </div>`;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      container.querySelectorAll('.svgbar').forEach(r => {
        r.style.transition = 'y 0.75s cubic-bezier(0.34,1.4,0.64,1), height 0.75s cubic-bezier(0.34,1.4,0.64,1)';
        r.setAttribute('y', r.dataset.y);
        r.setAttribute('height', r.dataset.h);
      });
      container.querySelectorAll('.svgbar-lbl').forEach((t, i) => {
        t.style.transition = `opacity 0.3s ${0.5 + i * 0.1}s`;
        t.setAttribute('opacity', '1');
      });
    }));
  }

  function buildAreaChart(container, labels, values, unit = '') {
    const W = 500, H = 160, padX = 20, padY = 20;
    const minV = Math.min(...values), maxV = Math.max(...values);
    const toX = i => padX + i * (W - padX * 2) / (values.length - 1);
    const toY = v => padY + (1 - (v - minV) / (maxV - minV)) * (H - padY * 2);

    const pts = values.map((v, i) => [toX(i), toY(v)]);

    let linePath = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i-1][0] + pts[i][0]) / 2;
      linePath += ` C${cx},${pts[i-1][1]} ${cx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
    }
    const areaPath = linePath + ` L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`;

    const dotsHtml = pts.map(([x, y], i) => {
      const num = values[i].toLocaleString('sk-SK');
      const formatted = unit ? `${num}${unit}` : num;
      return `
        <circle class="area-dot" cx="${x}" cy="${y}" r="4" fill="#beec1b" stroke="#111" stroke-width="2"
          style="opacity:0;transition:opacity 0.3s ${0.6 + i*0.07}s"/>
        <text x="${x}" y="${y - 10}" text-anchor="middle" fill="#beec1b"
          font-size="12" font-family="inherit" font-weight="700"
          style="opacity:0;transition:opacity 0.3s ${0.6 + i*0.07}s" class="area-val">${formatted}</text>`;
    }).join('');

    const lblsHtml = labels.map((l, i) => {
      const pct = (pts[i][0] / W * 100).toFixed(2);
      return `<div class="bar-label" style="position:absolute;left:${pct}%;transform:translateX(-50%);white-space:nowrap">${l}</div>`;
    }).join('');

    const uid = 'ag' + Math.random().toString(36).slice(2,7);

    container.innerHTML = `
      <div style="flex:1;min-height:0;overflow:hidden;position:relative">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;overflow:visible">
          <defs>
            <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#beec1b" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#beec1b" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="${areaPath}" fill="url(#${uid})" opacity="0" class="area-fill"
            style="transition:opacity 0.5s"/>
          <path d="${linePath}" fill="none" stroke="#beec1b" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round"
            class="area-line" style="stroke-dasharray:2000;stroke-dashoffset:2000;transition:stroke-dashoffset 1s ease"/>
          ${dotsHtml}
        </svg>
      </div>
      <div style="position:relative;height:20px;flex-shrink:0;border-top:1px solid rgba(255,255,255,0.05);margin-top:6px;overflow:visible">
        ${lblsHtml}
      </div>`;

    requestAnimationFrame(() => {
      container.querySelector('.area-line').style.strokeDashoffset = '0';
      container.querySelector('.area-fill').style.opacity = '1';
      container.querySelectorAll('.area-dot, .area-val').forEach(el => {
        el.style.opacity = '1';
      });
    });
  }

  function buildDonutChart(container, roas) {
    const maxRoas = 500;
    const pct = Math.min(roas / maxRoas, 1);
    const r = 90, cx = 130, cy = 110;
    const arcLen = Math.PI * r; // half circle
    const dash = arcLen * pct;

    container.innerHTML = `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px">
        <svg viewBox="0 0 260 150" style="width:100%;max-width:320px;overflow:visible">
          <defs>
            <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#beec1b" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#beec1b"/>
            </linearGradient>
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <!-- track -->
          <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}"
            fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14" stroke-linecap="round"/>
          <!-- value arc -->
          <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}"
            fill="none" stroke="url(#donutGrad)" stroke-width="14" stroke-linecap="round"
            style="stroke-dasharray:${arcLen};stroke-dashoffset:${arcLen};transition:stroke-dashoffset 1.2s cubic-bezier(0.34,1.1,0.64,1)"
            class="gauge-arc"/>
          <!-- glow dot -->
          <circle r="7" fill="#beec1b" filter="url(#glowFilter)"
            style="opacity:0;transition:opacity 0.3s 1.2s" class="gauge-dot"/>
          <!-- label -->
          <text x="${cx}" y="${cy - 18}" text-anchor="middle" fill="#beec1b"
            font-size="28" font-family="inherit" font-weight="900" class="gauge-num"
            style="opacity:0;transition:opacity 0.4s 0.8s">0%</text>
          <text x="${cx}" y="${cy + 2}" text-anchor="middle" fill="#777"
            font-size="12" font-family="inherit">rast vyplnení formulára</text>
        </svg>
      </div>`;

    requestAnimationFrame(() => {
      const arc = container.querySelector('.gauge-arc');
      arc.style.strokeDashoffset = arcLen - dash;

      // animate number
      const numEl = container.querySelector('.gauge-num');
      numEl.style.opacity = '1';
      let start = null;
      const duration = 1200;
      const animNum = (ts) => {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        numEl.textContent = Math.round(ease * roas) + '%';
        if (prog < 1) requestAnimationFrame(animNum);
      };
      requestAnimationFrame(animNum);

      // move dot along arc
      const dot = container.querySelector('.gauge-dot');
      dot.style.opacity = '1';
      const angle = Math.PI * pct; // 0=left, PI=right
      const dotX = cx - r * Math.cos(angle);
      const dotY = cy - r * Math.sin(angle);
      dot.setAttribute('cx', dotX);
      dot.setAttribute('cy', dotY);
    });
  }

  // ── Case data with real CSV values ─────────────────────────────
  const caseData = [
    {
      tab: 'Kúria na Táľoch',
      client: 'Kúria na Táľoch',
      slug: 'kuria-na-taloch',
      category: 'Horeca',
      desc: 'Spustili sme Google Ads a Google Display kampane zamerané na ľudí, ktorí aktívne vyhľadávajú pobyt na Táľoch a v Nízkych Tatrách.',
      result: '1058 % ROAS – každé 1 € investované do reklamy prinieslo viac ako 10 € v tržbách počas sezóny.',
      growth: '+1058 %',
      chartType: 'kuria',
      // CSV data: Sep, Oct, Nov
      chart1: {
        title: 'Tržby z reklám (€)',
        labels: ['Sep', 'Okt', 'Nov'],
        after: [4582, 4807, 6619],
        unit: '€',
      },
      chart2: {
        title: 'ROAS podľa mesiacov',
        labels: ['Sep', 'Okt', 'Nov'],
        values: [1173, 903, 1099],
        unit: '%',
      },
    },
    {
      tab: 'Kerapro',
      client: 'Kerapro',
      slug: 'kerapro',
      category: 'Rekonštrukcia kúpeľní',
      desc: 'Spustili sme Google Search kampane vo vyhľadávaní a zároveň optimalizovali komunikáciu na webe pre švajčiarsky trh. Cieľ bol jasný osloviť zákazníkov presne v momente, keď hľadajú obklady a služby obkladača.',
      result: '10× viac dopytov cez web - investícia do reklamy priniesla reálne zákazky a výsledky.',
      growth: '+400%',
      chartType: 'kerapro',
      chart1: {
        title: 'Leady cez web',
        labels: ['2024', '2025'],
        after: [2, 10],
        unit: '',
      },
      chart2: {
        title: 'Rast leadov po roku spolupráce',
        labels: ['2024', '2025'],
        values: [2, 10],
        unit: '',
      },
    },
    {
      tab: 'Digitálna televízia',
      client: 'Digitálna televízia',
      slug: 'digitalna-televizia',
      category: 'Streamovacia služba',
      desc: 'Pomocou Google Search, Google Display a Facebook kampaní sme zamerali reklamu na získanie nových zákazníkov pre digitálnu televíziu.',
      result: '3 500 nových účtov a 9× nárast mesačného obratu za 22 mesiacov.',
      growth: '+797%',
      chartType: 'playtv',
      chart1: {
        title: 'Mesačný obrat (€)',
        labels: ['7/24','10/24','3/25','7/25','1/26'],
        values: [1319, 1605, 2969, 3716, 5521],
        unit: '€',
      },
      chart2: {
        title: 'Noví zákazníci / mesiac',
        labels: ['7/24','10/24','3/25','7/25','1/26'],
        values: [84, 89, 110, 269, 303],
        unit: '',
      },
    },
  ];

  let activeTab = 0;
  let casePage = 1;

  const tabBtns = document.querySelectorAll('.tab-btn');
  const paginationText = document.getElementById('case-page');

  function renderCharts(index) {
    const d = caseData[index];
    const c1body = document.getElementById('chart1-body');
    const c2body = document.getElementById('chart2-body');
    const c1title = document.getElementById('chart1-title');
    const c2title = document.getElementById('chart2-title');
    const c1legend = document.getElementById('chart1-legend');

    // reset visibility
    document.getElementById('chart-card-1').style.display = '';
    document.getElementById('case-charts-container').style.gridTemplateColumns = '';

    c1title.textContent = d.chart1.title;
    c2title.textContent = d.chart2.title;

    if (d.chartType === 'kuria') {
      c1legend.style.display = 'none';
      buildSingleBarChart(c1body, d.chart1.labels, d.chart1.after, '#beec1b', d.chart1.unit);
      buildAreaChart(c2body, d.chart2.labels, d.chart2.values, d.chart2.unit);
    } else if (d.chartType === 'kerapro') {
      document.getElementById('chart-card-1').style.display = 'none';
      document.getElementById('case-charts-container').style.gridTemplateColumns = '1fr';
      buildDonutChart(c2body, 400);
    } else if (d.chartType === 'playtv') {
      c1legend.style.display = 'none';
      buildAreaChart(c1body, d.chart1.labels, d.chart1.values, d.chart1.unit);
      buildAreaChart(c2body, d.chart2.labels, d.chart2.values, d.chart2.unit);
    }
  }

  function updateCaseStudy(index) {
    const d = caseData[index];
    document.getElementById('case-client').textContent = d.client;
    const slugEl = document.getElementById('case-client-slug');
    if (slugEl) slugEl.textContent = d.slug;
    document.getElementById('case-category').textContent = d.category;
    document.getElementById('case-desc').textContent = d.desc;
    document.getElementById('case-result-text').innerHTML = `<strong>Výsledok:</strong> <span>${d.result}</span>`;
    document.getElementById('case-growth').textContent = d.growth;

    // Update tabs
    tabBtns.forEach((btn, i) => {
      btn.className = 'tab-btn ' + (i === index ? 'tab-btn--active' : 'tab-btn--inactive');
    });

    casePage = index + 1;
    if (paginationText) paginationText.textContent = casePage + ' / ' + caseData.length;

    renderCharts(index);
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

  // Initial render
  renderCharts(0);

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
