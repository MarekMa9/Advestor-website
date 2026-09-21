/* ============================================================
   Company autocomplete – názov firmy + IČO z obchodného registra
   (API Bilanc CRM nad kópiou RPO Štatistického úradu SR)
   Pripojí sa na každý input[name="company"] a pri výbere
   doplní skryté pole name="ico" do toho istého formulára.
   ============================================================ */
(function () {
  const API = 'https://bilancgroup.com/api/companies/search';
  const MIN_CHARS = 3;
  const DEBOUNCE_MS = 300;

  const css = `
    .ca-wrap { position: relative; }
    .ca-list {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
      margin: 0; padding: 6px; list-style: none;
      background: #141414; border: 1px solid var(--border-hover, rgba(255,255,255,0.15));
      border-radius: var(--radius-md, 12px); box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      max-height: 320px; overflow-y: auto;
    }
    .ca-item {
      display: flex; justify-content: space-between; align-items: center; gap: 16px;
      padding: 10px 12px; border-radius: 8px; cursor: pointer;
      font-size: 14px; line-height: 1.35; color: var(--white, #fff);
    }
    .ca-item[aria-selected="true"], .ca-item:hover { background: var(--primary-500-bg, rgba(255,255,255,0.06)); }
    .ca-name { display: block; }
    .ca-city { display: block; font-size: 12px; color: var(--dark-100, #888); margin-top: 2px; }
    .ca-ico { flex-shrink: 0; font-size: 13px; color: var(--dark-100, #888); font-variant-numeric: tabular-nums; }
    .ca-status { padding: 10px 12px; font-size: 13px; color: var(--dark-100, #888); }
    .ca-source { padding: 8px 12px 4px; font-size: 11px; color: var(--dark-200, #666); border-top: 1px solid var(--border, rgba(255,255,255,0.08)); margin-top: 4px; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function search(query, signal) {
    const res = await fetch(`${API}?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) throw new Error('company-search ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  function attach(input) {
    const wrap = document.createElement('div');
    wrap.className = 'ca-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const list = document.createElement('ul');
    list.className = 'ca-list';
    list.id = (input.id || 'company') + '-suggestions';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    wrap.appendChild(list);

    const icoField = document.createElement('input');
    icoField.type = 'hidden';
    icoField.name = 'ico';
    if (input.getAttribute('form')) icoField.setAttribute('form', input.getAttribute('form'));
    wrap.appendChild(icoField);

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');

    let items = [];
    let active = -1;
    let timer = null;
    let controller = null;

    const close = () => {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    };

    const showStatus = text => {
      list.innerHTML = `<li class="ca-status">${text}</li>`;
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };

    const render = () => {
      if (!items.length) return showStatus('Firmu sme v registri nenašli – môžete ju vpísať ručne.');
      list.innerHTML = items.map((c, i) => `
        <li class="ca-item" role="option" id="${list.id}-${i}" data-i="${i}" aria-selected="${i === active}">
          <span><span class="ca-name">${escapeHtml(c.name)}</span>${c.city ? `<span class="ca-city">${escapeHtml(c.city)}</span>` : ''}</span>
          <span class="ca-ico">${c.ico}</span>
        </li>`).join('') + '<li class="ca-source" aria-hidden="true">Zdroj: Register právnických osôb, Štatistický úrad SR</li>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-activedescendant', active >= 0 ? `${list.id}-${active}` : '');
    };

    const choose = i => {
      const c = items[i];
      if (!c) return;
      input.value = c.name;
      icoField.value = c.ico;
      close();
    };

    input.addEventListener('input', () => {
      icoField.value = ''; // ručná úprava ruší vybrané IČO
      clearTimeout(timer);
      if (controller) controller.abort();
      const q = input.value.trim();
      if (q.length < MIN_CHARS) return close();

      timer = setTimeout(async () => {
        controller = new AbortController();
        items = [];
        showStatus('Hľadám v obchodnom registri…');
        try {
          items = await search(q, controller.signal);
          active = -1;
          render();
        } catch (err) {
          if (err.name !== 'AbortError') close(); // pri výpadku API pole funguje ako obyčajný input
        }
      }, DEBOUNCE_MS);
    });

    input.addEventListener('keydown', e => {
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + items.length) % items.length; render(); }
      else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') close();
    });

    // mousedown, aby výber prebehol ešte pred blur
    list.addEventListener('mousedown', e => {
      const li = e.target.closest('.ca-item');
      if (li) { e.preventDefault(); choose(+li.dataset.i); }
    });

    input.addEventListener('blur', close);
  }

  document.querySelectorAll('input[name="company"]').forEach(attach);
})();
