/* ── reCAPTCHA v3 ──────────────────────────────────────────────────────
   Neviditeľná ochrana formulárov. Google vyhodnotí správanie návštevníka
   a vráti token, ktorý send-mail.php overí na strane servera.
   Site key je verejný, tajný kľúč je v advestor-config.php (mimo gitu).
   ──────────────────────────────────────────────────────────────────── */
(function () {
  const SITE_KEY = '6Lf7UNUtAAAAAKJ1r1G92ABNdFjwVHscS1YzxLxg';

  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_KEY;
  script.async = true;
  document.head.appendChild(script);

  /** Token pre odosielaný formulár; pri výpadku reCAPTCHA vráti prázdny reťazec. */
  window.recaptchaToken = function (action) {
    return new Promise(resolve => {
      if (!window.grecaptcha || !window.grecaptcha.execute) { resolve(''); return; }
      try {
        grecaptcha.ready(() => {
          grecaptcha.execute(SITE_KEY, { action: action })
            .then(resolve, () => resolve(''));
        });
      } catch {
        resolve('');
      }
    });
  };
})();
