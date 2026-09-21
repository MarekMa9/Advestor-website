<?php
/* ── Tajné údaje (heslá, tokeny) – mimo gitu aj mimo webového koreňa ──
   Server:  web/shared/advestor-config.php   (web/current → release_*)
   Lokálne: advestor-config.php vedľa tohto súboru (v .gitignore)
   Formát:  <?php return ['smtp_password' => '...'];
   ──────────────────────────────────────────────────────────────────── */
function advestorConfig(): array {
    static $config = null;
    if ($config === null) {
        $config = [];
        foreach ([dirname(__DIR__) . '/shared/advestor-config.php', __DIR__ . '/advestor-config.php'] as $file) {
            if (is_file($file)) {
                $config = include $file;
                break;
            }
        }
    }
    return $config;
}

