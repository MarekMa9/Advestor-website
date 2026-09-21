<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/config.php';
require __DIR__ . '/ruz.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$name     = trim($_POST['name']     ?? '');
$company  = trim($_POST['company']  ?? '');
$ico      = preg_replace('/\D/', '', $_POST['ico'] ?? '');
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$industry = trim($_POST['industry'] ?? '');
$problem  = trim($_POST['problem']  ?? '');
$revenue  = trim($_POST['revenue']  ?? '');
$effort   = trim($_POST['effort']   ?? '');
$website  = trim($_POST['website']  ?? '');
$social   = trim($_POST['social']   ?? '');
$accent   = ($_POST['accent'] ?? '') === 'blue' ? 'blue' : 'green'; // farba podstránky formulára

// Formulár „Vývoj aplikácií“
$projectType = trim($_POST['projectType'] ?? '');
$description = trim($_POST['description'] ?? '');
$phase       = trim($_POST['phase']       ?? '');

if (!$name || !$email || !$phone || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Vyplňte všetky povinné polia (meno, email, telefón).']);
    exit;
}

$industryMap = [
    'ecommerce' => 'E-commerce',
    'saas'      => 'SaaS / Tech',
    'services'  => 'Služby',
    'other'     => 'Iné',
];
$revenueMap = [
    'do-5000'       => 'Do 5 000 €',
    '5000-20000'    => '5 000 € – 20 000 €',
    '20000-100000'  => '20 000 € – 100 000 €',
    'nad-100000'    => 'Nad 100 000 €',
    'startup'       => 'Ešte nepredávame (start-up)',
];
$effortMap = [
    'dynamicky' => 'Rozumiem a som pripravený na dynamickú spoluprácu.',
    'pasivny'   => 'Mám obmedzené kapacity, preferujem pasívny prístup.',
];

$industryLabel = $industryMap[$industry] ?? $industry;
$revenueLabel  = $revenueMap[$revenue]   ?? $revenue;
$effortLabel   = $effortMap[$effort]     ?? $effort;

/* ── SMTP factory ─────────────────────────────────────────────────── */
function makeMailer(): PHPMailer {
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = 'smtp.gmail.com';
    $m->SMTPAuth   = true;
    $m->Username   = 'marek@advestor.sk';
    $m->Password   = advestorConfig()['smtp_password'] ?? '';
    $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port       = 587;
    $m->CharSet    = 'UTF-8';
    $m->setFrom('info@advestor.sk', 'Advestor.sk');
    return $m;
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

/* ── Farby e-mailov ───────────────────────────────────────────────────
   Svetlý bielo-sivý vzhľad, akcent podľa podstránky, z ktorej prišiel
   formulár: zelená (domov, vývoj aplikácií) alebo modrá (*-blue).
   Svetlozelený text je na bielom nečitateľný — odkazy majú tmavší odtieň. */
function emailTheme(string $accent): array {
    $blue = $accent === 'blue';
    return [
        'accent'   => $blue ? '#3B82F6' : '#BEEC1B',
        'onAccent' => $blue ? '#FFFFFF' : '#111111',
        'link'     => $blue ? '#2563EB' : '#4D7C0F',
        'logo'     => 'https://advestor.sk/images/advestor-logo-dark-' . ($blue ? 'blue' : 'green') . '.png',
        'check'    => 'https://advestor.sk/images/' . ($blue ? 'checkmark-blue.png' : 'checkmark.png'),
    ];
}

const EMAIL_FONT   = 'font-family:Arial,Helvetica,sans-serif;';
const EMAIL_LABEL  = 'margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#71717A;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;';
const EMAIL_VALUE  = 'margin:0;font-size:15px;line-height:1.6;color:#18181B;font-family:Arial,Helvetica,sans-serif;';
const EMAIL_TILE   = 'background:#F7F7F8;border:1px solid #ECECEE;border-radius:10px;padding:16px 20px;';

/** Spoločná kostra: svetlé pozadie, biela karta s akcentovým pásom, responzívne paddingy. */
function emailShell(string $title, string $inner, array $t, string $footer, string $afterCard = ''): string {
    return <<<HTML
<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>$title</title>
<style>
  @media (max-width: 600px) {
    .outer { padding: 20px 8px !important; }
    .card  { padding: 28px 18px !important; }
    .tile  { padding: 12px 14px !important; }
    .gl    { padding-right: 4px !important; }
    .gr    { padding-left: 4px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;">
<tr><td class="outer" align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding:0 0 24px;text-align:center;">
    <img src="{$t['logo']}" alt="Advestor.sk" width="110" height="69" border="0" style="display:block;margin:0 auto;">
  </td></tr>

  <!-- Card -->
  <tr><td class="card" style="background:#FFFFFF;border:1px solid #E4E4E7;border-top:4px solid {$t['accent']};border-radius:16px;padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
$inner
    </table>
  </td></tr>
$afterCard
  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#A1A1AA;{$t['font']}">$footer</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;
}

/** Vnorená dlaždica so sivým pozadím (na mobile menší padding cez .tile). */
function emailTile(string $html): string {
    return "
      <tr><td style='padding:0 0 12px;'>
        <div class='tile' style='" . EMAIL_TILE . "'>$html</div>
      </td></tr>";
}

/* ── Agency e-mail template ───────────────────────────────────────── */
function agencyEmail(
    string $name, string $company, string $email, string $phone,
    string $industry, string $problem, string $revenue, string $effort,
    string $website, string $social, array $extra = [], string $ico = '', ?array $ruz = null,
    string $accent = 'green'
): string {
    $t = emailTheme($accent) + ['font' => EMAIL_FONT];
    $L = EMAIL_LABEL; $V = EMAIL_VALUE; $F = EMAIL_FONT;
    $link = "color:{$t['link']};text-decoration:none;";

    $n  = h($name);   $co = h($company);
    $em = h($email);  $ph = h($phone);
    $web = h($website); $soc = h($social);

    // Kontakt
    $blocks = emailTile(
        "<p style='margin:0;font-size:20px;font-weight:700;color:#111111;$F'>$n</p>"
        . ($co ? "<p style='margin:4px 0 0;font-size:14px;color:#52525B;$F'>$co</p>" : '')
        . "<p style='margin:10px 0 0;font-size:14px;$F'><a href='mailto:$em' style='$link'>$em</a>"
        . " &nbsp;&middot;&nbsp; <a href='tel:$ph' style='$link'>$ph</a></p>"
    );

    // Firma z registra – IČO z našepkávača, obrat a zisk z RÚZ, odkaz na FinStat (len pre nás)
    if ($ico !== '') {
        $eur = fn(int $v) => ($v < 0 ? '−' : '') . number_format(abs($v), 0, ',', '&nbsp;') . '&nbsp;€';
        $finstat = 'https://www.finstat.sk/' . rawurlencode($ico);
        $title = ($ruz ? 'Hospodárenie ' . h($ruz['year']) : 'Hospodárenie za minulý rok') . ' &nbsp;·&nbsp; IČO ' . h($ico);
        $figures = $ruz
            ? "<p style='$V'>Obrat: <strong>" . $eur($ruz['revenue']) . "</strong></p>"
              . "<p style='$V'>" . ($ruz['profit'] < 0 ? 'Strata' : 'Zisk') . ": <strong style='color:" . ($ruz['profit'] < 0 ? '#DC2626' : '#18181B') . ";'>" . $eur($ruz['profit']) . "</strong></p>"
            : "<p style='margin:0;font-size:14px;color:#71717A;$F'>nezistené – závierka nie je v RÚZ v štruktúrovanej podobe</p>";
        $blocks .= emailTile(
            "<p style='$L'>$title</p>$figures"
            . "<p style='margin:12px 0 0;'><a href='$finstat' style='display:inline-block;background:{$t['accent']};color:{$t['onAccent']};text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;$F'>Zobraziť na FinStat →</a></p>"
        );
    }

    // Jednoduché polia [nadpis => hodnota] v poradí ako doteraz
    $fields = ['Odvetvie' => $industry, 'Marketingový problém / cieľ' => $problem, 'Mesačný obrat' => $revenue, 'Partnerstvo' => $effort];
    foreach ($fields as $label => $value) {
        if ($value === '') continue;
        $blocks .= emailTile("<p style='$L'>" . h($label) . "</p><p style='$V'>" . nl2br(h($value)) . "</p>");
    }

    if ($web || $soc) {
        $webCell = $web ? "<p style='$L'>Web</p><a href='$web' style='$link font-size:14px;$F'>$web</a>" : '';
        $socCell = $soc ? "<p style='$L'>Sociálne siete</p><p style='margin:0;font-size:14px;color:#18181B;$F'>$soc</p>" : '';
        $blocks .= "
      <tr><td style='padding:0 0 12px;'>
        <table width='100%' cellpadding='0' cellspacing='0'><tr>
          <td class='gl' width='50%' valign='top' style='padding-right:6px;'>" . ($webCell ? "<div class='tile' style='" . EMAIL_TILE . "'>$webCell</div>" : '') . "</td>
          <td class='gr' width='50%' valign='top' style='padding-left:6px;'>" . ($socCell ? "<div class='tile' style='" . EMAIL_TILE . "'>$socCell</div>" : '') . "</td>
        </tr></table>
      </td></tr>";
    }

    // Ďalšie polia (napr. formulár Vývoj aplikácií) – [nadpis => hodnota]
    foreach ($extra as $label => $value) {
        if ($value === '') continue;
        $blocks .= emailTile("<p style='$L'>" . h($label) . "</p><p style='$V'>" . nl2br(h($value)) . "</p>");
    }

    $inner = "
      <tr><td style='padding:0 0 4px;'>
        <h1 style='margin:0;font-size:26px;font-weight:700;color:#111111;letter-spacing:-0.5px;$F'>Nový dopyt z webu</h1>
      </td></tr>
      <tr><td style='padding:0 0 24px;'>
        <p style='margin:0;font-size:13px;color:#71717A;$F'>Prišiel nový vyplnený formulár na <a href='https://advestor.sk' style='$link'>advestor.sk</a></p>
      </td></tr>
$blocks";

    return emailShell('Nový dopyt z webu', $inner, $t, '© 2026 Advestor GROUP s.r.o. &nbsp;&middot;&nbsp; Automatická notifikácia');
}

/* ── Client confirmation e-mail template ─────────────────────────── */
function clientEmail(string $name, string $accent = 'green'): string {
    $t = emailTheme($accent) + ['font' => EMAIL_FONT];
    $F = EMAIL_FONT;
    $n = h($name);
    $p = "margin:0 0 14px;font-size:15px;color:#52525B;line-height:1.7;$F";

    $inner = "
      <tr><td align='center' style='padding:8px 0 28px;'>
        <img src='{$t['check']}' width='88' height='88' alt='' style='display:block;border:0;'>
      </td></tr>
      <tr><td align='center' style='padding:0 0 6px;'>
        <h1 style='margin:0;font-size:28px;font-weight:700;color:#111111;letter-spacing:-0.8px;$F'>Kontaktný formulár</h1>
      </td></tr>
      <tr><td align='center' style='padding:0 0 32px;'>
        <p style='margin:0;font-size:18px;font-weight:500;color:#52525B;$F'>bol úspešne odoslaný</p>
      </td></tr>
      <tr><td style='padding:0 0 28px;'><hr style='border:none;border-top:1px solid #E4E4E7;margin:0;'></td></tr>
      <tr><td style='padding:0 0 4px;'>
        <p style='$p'>Dobrý deň, <strong style='color:#111111;'>$n</strong>,</p>
        <p style='$p'>ďakujeme za vyplnenie kontaktného formulára. Vaša správa sa dostala k nám a my ju čoskoro spracujeme.</p>
        <p style='margin:0;font-size:15px;color:#52525B;line-height:1.7;$F'>Ozveme sa Vám do <strong style='color:{$t['link']};'>48 hodín</strong>.</p>
      </td></tr>";

    $contact = "
  <!-- Contact box -->
  <tr><td style='padding:12px 0 0;'>
    <table cellpadding='0' cellspacing='0' style='width:100%;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;'>
    <tr><td class='tile' style='padding:20px 24px;'>
      <p style='margin:0 0 4px;font-size:12px;color:#71717A;$F'>Máte otázky? Napíšte nám priamo:</p>
      <a href='mailto:info@advestor.sk' style='color:{$t['link']};text-decoration:none;font-size:15px;font-weight:600;$F'>info@advestor.sk</a>
    </td></tr>
    </table>
  </td></tr>
";

    return emailShell('Ďakujeme za záujem – Advestor.sk', $inner, $t, '© 2026 Advestor GROUP s.r.o. &nbsp;&middot;&nbsp; Všetky práva vyhradené', $contact);
}

/* ── Send both e-mails ────────────────────────────────────────────── */
$errors = [];

$appFields = [
    'Typ projektu'        => $projectType,
    'Popis projektu'      => $description,
    'Fáza projektu'       => $phase,
];
$appAltBody = '';
foreach ($appFields as $label => $value) {
    if ($value !== '') $appAltBody .= "\n$label: $value";
}

// Obrat a zisk z RÚZ – len do e-mailu pre nás, pri výpadku RÚZ ostane „nezistený“
$ruz = $ico !== '' ? ruzLastFinancials($ico) : null;
$registryAltBody = $ico !== ''
    ? "\nIČO: $ico"
      . ($ruz
          ? "\nObrat {$ruz['year']}: " . number_format($ruz['revenue'], 0, ',', ' ') . ' €'
            . "\n" . ($ruz['profit'] < 0 ? 'Strata' : 'Zisk') . " {$ruz['year']}: " . number_format($ruz['profit'], 0, ',', ' ') . ' €'
          : "\nObrat a zisk: nezistené")
      . "\nFinStat: https://www.finstat.sk/$ico"
    : '';

// Email 1 – Agency notification
try {
    $m = makeMailer();
    $m->addAddress('marek@advestor.sk', 'Marek');
    $m->addAddress('martin@advestor.sk', 'Martin');
    $m->isHTML(true);
    $m->Subject = 'Nový dopyt z webu – ' . $name . ($company ? " ($company)" : '');
    $m->Body    = agencyEmail($name, $company, $email, $phone, $industryLabel, $problem, $revenueLabel, $effortLabel, $website, $social, $appFields, $ico, $ruz, $accent);
    $m->AltBody = "Nový dopyt\nMeno: $name\nEmail: $email\nTel: $phone" . ($company ? "\nFirma: $company" : '') . $registryAltBody . ($website ? "\nWeb: $website" : '') . ($social ? "\nSociálne: $social" : '') . $appAltBody;
    $m->send();
} catch (Exception $e) {
    $errors[] = 'agency';
}

// Email 2 – Client confirmation
try {
    $m = makeMailer();
    $m->addAddress($email, $name);
    $m->isHTML(true);
    $m->Subject = 'Ďakujeme za váš záujem – Advestor.sk';
    $m->Body    = clientEmail($name, $accent);
    $m->AltBody = "Dobrý deň, $name,\n\nďakujeme za vyplnenie formulára. Ozveme sa Vám do 48 hodín.\n\nTím Advestor.sk\nmarek@advestor.sk";
    $m->send();
} catch (Exception $e) {
    $errors[] = 'client';
}

if (count($errors) === 2) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Chyba pri odosielaní. Skúste znova alebo nás kontaktujte priamo.']);
} else {
    echo json_encode(['success' => true]);
}
