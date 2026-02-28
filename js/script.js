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

  /* --- Contact multi-step form --- */
  const steps = document.querySelectorAll('.step-item');
  const formStepPanels = document.querySelectorAll('.form-step-panel');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => {
      s.className = 'step-item ' + (i === index ? 'step-item--active' : 'step-item--inactive');
    });
    formStepPanels.forEach((p, i) => {
      p.style.display = i === index ? 'flex' : 'none';
    });
    currentStep = index;
  }

  steps.forEach((step, i) => {
    step.addEventListener('click', () => showStep(i));
  });

  const formNext = document.getElementById('form-next');
  const formPrev = document.getElementById('form-prev');

  if (formNext) formNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
  });
  if (formPrev) formPrev.addEventListener('click', () => {
    if (currentStep > 0) showStep(currentStep - 1);
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

  /* --- Init --- */
  updateCaseStudy(0);
  showStep(3); // Show contact info step (active in Figma)
  updateActiveNavLink();
});
