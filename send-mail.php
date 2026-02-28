<?php
require __DIR__ . '/vendor/autoload.php';

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
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$industry = trim($_POST['industry'] ?? '');
$problem  = trim($_POST['problem']  ?? '');
$budget   = trim($_POST['budget']   ?? '');
$timeline = trim($_POST['timeline'] ?? '');

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
$budgetMap = [
    '500-1000'  => '500 – 1 000 €',
    '1000-3000' => '1 000 – 3 000 €',
    '3000+'     => '3 000+ €',
];
$timelineMap = [
    'do-1m'    => 'Do 1 mesiaca',
    '1-3m'     => '1 – 3 mesiace',
    '3-6m'     => '3 – 6 mesiacov',
    'dlhodoby' => 'Dlhodobá spolupráca',
];

$industryLabel = $industryMap[$industry] ?? $industry;
$budgetLabel   = $budgetMap[$budget]     ?? $budget;
$timelineLabel = $timelineMap[$timeline] ?? $timeline;

/* ── SMTP factory ─────────────────────────────────────────────────── */
function makeMailer(): PHPMailer {
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = 'smtp.gmail.com';
    $m->SMTPAuth   = true;
    $m->Username   = 'marek@advestor.sk';
    $m->Password   = 'cywc yrfj qxir fncm';
    $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port       = 587;
    $m->CharSet    = 'UTF-8';
    $m->setFrom('marek@advestor.sk', 'Advestor.sk');
    return $m;
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

/* ── Agency e-mail template ───────────────────────────────────────── */
function agencyEmail(
    string $name, string $company, string $email, string $phone,
    string $industry, string $problem, string $budget, string $timeline
): string {
    $n  = h($name);   $co = h($company);
    $em = h($email);  $ph = h($phone);
    $ind = h($industry); $bu = h($budget); $ti = h($timeline);

    $companyLine = $co
        ? "<br><span style='font-size:14px;color:#888888;font-family:Arial,sans-serif;'>$co</span>"
        : '';

    $industryBlock = $ind ? "
      <tr><td style='padding:0 0 12px;'>
        <div style='background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;'>
          <p style='margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#888888;text-transform:uppercase;font-family:Arial,sans-serif;'>Odvetvie</p>
          <p style='margin:0;font-size:16px;color:#F5F5F5;font-family:Arial,sans-serif;'>$ind</p>
        </div>
      </td></tr>" : '';

    $problemBlock = $problem ? "
      <tr><td style='padding:0 0 12px;'>
        <div style='background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;'>
          <p style='margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#888888;text-transform:uppercase;font-family:Arial,sans-serif;'>Marketingový problém / cieľ</p>
          <p style='margin:0;font-size:15px;color:#F5F5F5;line-height:1.7;font-family:Arial,sans-serif;'>" . nl2br(h($problem)) . "</p>
        </div>
      </td></tr>" : '';

    $budgetTimelineBlock = '';
    if ($bu || $ti) {
        $buCell = $bu ? "
          <td width='50%' style='padding-right:6px;'>
            <div style='background:rgba(190,236,27,0.08);border:1px solid rgba(190,236,27,0.2);border-radius:10px;padding:16px 20px;'>
              <p style='margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#BEEC1B;text-transform:uppercase;font-family:Arial,sans-serif;'>Rozpočet</p>
              <p style='margin:0;font-size:16px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;'>$bu</p>
            </div>
          </td>" : '<td width="50%"></td>';

        $tiCell = $ti ? "
          <td width='50%' style='padding-left:6px;'>
            <div style='background:rgba(190,236,27,0.08);border:1px solid rgba(190,236,27,0.2);border-radius:10px;padding:16px 20px;'>
              <p style='margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#BEEC1B;text-transform:uppercase;font-family:Arial,sans-serif;'>Časový rámec</p>
              <p style='margin:0;font-size:16px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;'>$ti</p>
            </div>
          </td>" : '<td width="50%"></td>';

        $budgetTimelineBlock = "
      <tr><td style='padding:0 0 12px;'>
        <table width='100%' cellpadding='0' cellspacing='0'><tr>$buCell$tiCell</tr></table>
      </td></tr>";
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Nový dopyt z webu</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding:0 0 28px;text-align:center;">
    <img src="https://advestor.sk/images/Logo-advestor.svg" alt="Advestor.sk" width="110" height="69" border="0" style="display:block;margin:0 auto;">
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <tr><td style="padding:0 0 4px;">
        <h1 style="margin:0;font-size:26px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;letter-spacing:-0.5px;">Nový dopyt z webu</h1>
      </td></tr>
      <tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:13px;color:#666666;font-family:Arial,sans-serif;">Prišiel nový vyplnený formulár na advestor.sk</p>
      </td></tr>

      <tr><td style="padding:0 0 24px;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0;"></td></tr>

      <!-- Contact badge -->
      <tr><td style="padding:0 0 24px;">
        <table cellpadding="0" cellspacing="0" style="background:rgba(190,236,27,0.08);border:1px solid rgba(190,236,27,0.2);border-radius:12px;width:100%;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;">$n$companyLine</p>
          <p style="margin:8px 0 0;">
            <a href="mailto:$em" style="color:#BEEC1B;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">$em</a>
            &nbsp;&middot;&nbsp;
            <a href="tel:$ph" style="color:#BEEC1B;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;">$ph</a>
          </p>
        </td></tr>
        </table>
      </td></tr>

      $industryBlock
      $problemBlock
      $budgetTimelineBlock

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#444444;font-family:Arial,sans-serif;">© 2026 Advestor GROUP s.r.o. &nbsp;&middot;&nbsp; Automatická notifikácia</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;
}

/* ── Client confirmation e-mail template ─────────────────────────── */
function clientEmail(string $name): string {
    $n = h($name);

    return <<<HTML
<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ďakujeme za záujem – Advestor.sk</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding:0 0 28px;text-align:center;">
    <img src="https://advestor.sk/images/Logo-advestor.svg" alt="Advestor.sk" width="110" height="69" border="0" style="display:block;margin:0 auto;">
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:48px 40px;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <!-- Checkmark icon -->
      <tr><td align="center" style="padding:0 0 32px;">
        <table cellpadding="0" cellspacing="0">
        <tr><td width="88" height="88" align="center" valign="middle"
            style="background:#BEEC1B;border-radius:44px;font-size:44px;line-height:1;color:#0A0A0A;font-weight:900;font-family:Arial,sans-serif;text-align:center;padding:0;width:88px;height:88px;">
          &#10003;
        </td></tr>
        </table>
      </td></tr>

      <!-- Heading -->
      <tr><td style="padding:0 0 6px;">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;letter-spacing:-0.8px;">Kontaktný formulár</h1>
      </td></tr>
      <tr><td style="padding:0 0 36px;">
        <p style="margin:0;font-size:18px;font-weight:500;color:#CCCCCC;font-family:Arial,sans-serif;">bol úspešne odoslaný</p>
      </td></tr>

      <tr><td style="padding:0 0 32px;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0;"></td></tr>

      <!-- Message -->
      <tr><td style="text-align:left;padding:0 0 8px;">
        <p style="margin:0 0 14px;font-size:15px;color:#AAAAAA;font-family:Arial,sans-serif;line-height:1.7;">
          Ahoj <strong style="color:#FFFFFF;">$n</strong>,
        </p>
        <p style="margin:0 0 14px;font-size:15px;color:#AAAAAA;font-family:Arial,sans-serif;line-height:1.7;">
          ďakujeme za vyplnenie kontaktného formulára. Tvoja správa sa dostala k nám a my ju čoskoro spracujeme.
        </p>
        <p style="margin:0;font-size:15px;color:#AAAAAA;font-family:Arial,sans-serif;line-height:1.7;">
          Ozveme sa ti do <strong style="color:#BEEC1B;">48 hodín</strong> pracovného času.
        </p>
      </td></tr>

    </table>
  </td></tr>

  <!-- Contact box -->
  <tr><td style="padding:12px 0 0;">
    <table cellpadding="0" cellspacing="0" style="width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#555555;font-family:Arial,sans-serif;">Máš otázky? Napíš nám priamo:</p>
      <a href="mailto:marek@advestor.sk" style="color:#BEEC1B;text-decoration:none;font-size:15px;font-weight:600;font-family:Arial,sans-serif;">marek@advestor.sk</a>
    </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#444444;font-family:Arial,sans-serif;">© 2026 Advestor GROUP s.r.o. &nbsp;&middot;&nbsp; Všetky práva vyhradené</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;
}

/* ── Send both e-mails ────────────────────────────────────────────── */
$errors = [];

// Email 1 – Agency notification
try {
    $m = makeMailer();
    $m->addAddress('info@advestor.sk', 'Advestor');
    $m->isHTML(true);
    $m->Subject = 'Nový dopyt z webu – ' . $name . ($company ? " ($company)" : '');
    $m->Body    = agencyEmail($name, $company, $email, $phone, $industryLabel, $problem, $budgetLabel, $timelineLabel);
    $m->AltBody = "Nový dopyt\nMeno: $name\nEmail: $email\nTel: $phone";
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
    $m->Body    = clientEmail($name);
    $m->AltBody = "Ahoj $name,\n\nďakujeme za vyplnenie formulára. Ozveme sa ti do 48 hodín.\n\nTím Advestor.sk\nmarek@advestor.sk";
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
