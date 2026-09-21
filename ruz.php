<?php
/* ── Obrat a zisk firmy z Registra účtovných závierok (RÚZ) ──────────────
   Bezplatné API: https://www.registeruz.sk/cruz-public/home/api
   Z výkazu ziskov a strát poslednej riadnej závierky:
     • Úč POD (podvojné účtovníctvo, šablóna 699): obrat r. 01 „Čistý obrat“,
       zisk r. 61 „Výsledok hospodárenia po zdanení“
     • Úč MUJ (mikro účtovná jednotka, šablóna 687): obrat r. 02 + r. 03
       (tržby), zisk r. 38 „Výsledok hospodárenia po zdanení“
   Neziskovky, živnostníci v jednoduchom účtovníctve a veľké firmy s IFRS
   (len PDF) štruktúrovaný výkaz nemajú → null.
   ──────────────────────────────────────────────────────────────────── */

const RUZ_API = 'https://www.registeruz.sk/cruz-public/api';

/** Riadky výkazu ziskov a strát podľa ID šablóny: obrat = súčet riadkov, zisk = jeden riadok. */
const RUZ_ROWS = [
    699 => ['revenue' => [1],    'profit' => 61], // Čistý obrat; VH po zdanení
    687 => ['revenue' => [2, 3], 'profit' => 38], // Tržby z tovaru + výrobkov a služieb; VH po zdanení
];

function ruzGet(string $path): ?array {
    $ch = curl_init(RUZ_API . $path);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 3]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ($body !== false && $code === 200) ? json_decode($body, true) : null;
}

/**
 * Obrat a zisk (výsledok hospodárenia po zdanení, záporný = strata) za posledné vykázané obdobie.
 * Vracia ['revenue' => int, 'profit' => int, 'year' => '2025', 'period' => '2025-01 – 2025-12'] (€) alebo null.
 */
function ruzLastFinancials(string $ico): ?array {
    if (!preg_match('/^\d{6,8}$/', $ico)) return null;
    $deadline = microtime(true) + 12; // formulár nesmie čakať donekonečna

    $units = ruzGet('/uctovne-jednotky?zmenene-od=2000-01-01&ico=' . $ico)['id'] ?? [];
    $statementIds = [];
    foreach ($units as $unitId) {
        $unit = ruzGet('/uctovna-jednotka?id=' . (int)$unitId);
        if (!$unit || ($unit['stav'] ?? '') === 'ZMAZANÉ') continue;
        $statementIds = array_merge($statementIds, $unit['idUctovnychZavierok'] ?? []);
    }

    // Novšie závierky majú vyššie ID — stačí pozrieť posledné tri
    rsort($statementIds);
    $best = null;
    foreach (array_slice($statementIds, 0, 3) as $statementId) {
        if (microtime(true) > $deadline) break;
        $st = ruzGet('/uctovna-zavierka?id=' . (int)$statementId);
        if (!$st || !empty($st['konsolidovana']) || ($st['typ'] ?? '') !== 'Riadna') continue;
        if ($best && ($st['obdobieDo'] ?? '') <= $best['obdobieDo']) continue;

        foreach ($st['idUctovnychVykazov'] ?? [] as $reportId) {
            $report = ruzGet('/uctovny-vykaz?id=' . (int)$reportId);
            $rows = RUZ_ROWS[$report['idSablony'] ?? 0] ?? null;
            if (!$rows) continue;
            foreach ($report['obsah']['tabulky'] ?? [] as $table) {
                if (($table['nazov']['sk'] ?? '') !== 'Výkaz ziskov a strát') continue;
                // dáta sú po riadkoch, 2 stĺpce: bežné a predchádzajúce obdobie
                $cell = fn(int $row) => (int)($table['data'][($row - 1) * 2] ?? 0);
                $best = [
                    'revenue'   => array_sum(array_map($cell, $rows['revenue'])),
                    'profit'    => $cell($rows['profit']),
                    'obdobieDo' => $st['obdobieDo'] ?? '',
                    'year'      => substr($st['obdobieDo'] ?? '', 0, 4),
                    'period'    => ($st['obdobieOd'] ?? '') . ' – ' . ($st['obdobieDo'] ?? ''),
                ];
                break 2;
            }
        }
    }
    if (!$best) return null;
    unset($best['obdobieDo']);
    return $best;
}
