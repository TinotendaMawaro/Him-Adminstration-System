<?php

namespace App\Support;

/**
 * A one-page "account credentials" PDF with a diagonal HEARTFELT watermark, written by hand (no PDF library is installed,
 * and this document only needs text, rectangles and one rotated word). The result is returned as a string and never stored:
 * it contains a password.
 */
class CredentialsPdf
{
    /** @param array{name: string, role: string, zone?: ?string, login_label: string, login: string, code?: ?string, password: string, issued_at: string, issued_by?: ?string, reason?: ?string} $c */
    public static function render(array $c): string
    {
        $W = 595; $H = 842;
        $s = '';

        // Watermark first, so everything else sits on top of it: a grid of light diagonal "HEARTFELT".
        $rad = deg2rad(35);
        $cos = round(cos($rad), 4); $sin = round(sin($rad), 4);
        $s .= "q 0.90 0.92 0.96 rg\nBT /F2 54 Tf\n";
        foreach ([[40, 90], [250, 250], [40, 410], [250, 570], [40, 730], [250, 890]] as [$x, $y]) {
            $s .= "{$cos} {$sin} -{$sin} {$cos} {$x} {$y} Tm (HEARTFELT) Tj\n";
        }
        $s .= "ET Q\n";

        // Header band
        $s .= "q 0.059 0.153 0.267 rg 0 742 {$W} 100 re f Q\n";
        $s .= "q 0.788 0.659 0.298 rg 0 738 {$W} 4 re f Q\n";
        $s .= self::text(48, 800, 'F2', 26, 'HEARTFELT', [1, 1, 1]);
        $s .= self::text(48, 776, 'F1', 11, 'INTERNATIONAL MINISTRIES', [0.91, 0.81, 0.54]);
        $s .= self::text(48, 752, 'F1', 10, 'Account credentials  |  CONFIDENTIAL', [0.8, 0.86, 0.95]);

        // Person
        $y = 690;
        $s .= self::text(48, $y, 'F2', 22, $c['name'], [0.06, 0.15, 0.27]);
        $s .= self::text(48, $y - 22, 'F1', 12, $c['role'] . (!empty($c['zone']) ? '   |   ' . $c['zone'] : ''), [0.35, 0.42, 0.52]);

        // Credentials box
        $boxTop = 620;
        $s .= "q 0.96 0.97 0.99 rg 0.82 0.86 0.92 RG 1 w 48 " . ($boxTop - 168) . " 499 168 re B Q\n";
        $rows = [[$c['login_label'], $c['login']]];
        if (!empty($c['code']) && $c['code'] !== $c['login']) { $rows[] = ['Code', $c['code']]; }
        $rows[] = ['Temporary password', $c['password']];
        $ry = $boxTop - 34;
        foreach ($rows as [$label, $value]) {
            $s .= self::text(66, $ry, 'F1', 9, strtoupper($label), [0.45, 0.5, 0.6]);
            $s .= self::text(66, $ry - 22, 'F3', 17, $value, [0.06, 0.15, 0.27]);
            $ry -= 56;
        }

        // Guidance
        $g = 430;
        $s .= self::text(48, $g, 'F2', 12, 'Please keep this safe', [0.06, 0.15, 0.27]);
        $lines = [
            '1. Sign in at the Heartfelt web portal or in the Heartfelt app with the details above.',
            '2. Change the temporary password straight away (Me > Security > Change password).',
            '3. Never share these details, send them in a message or take a screenshot of this page.',
            '4. Delete or shred this document once you have signed in.',
            '5. Heartfelt staff will never ask you for your password.',
        ];
        foreach ($lines as $i => $l) {
            $s .= self::text(48, $g - 22 - $i * 18, 'F1', 11, $l, [0.2, 0.25, 0.33]);
        }

        // Data protection notice
        $s .= "q 0.99 0.96 0.88 rg 0.9 0.8 0.5 RG 0.8 w 48 250 499 70 re B Q\n";
        $s .= self::text(62, 300, 'F2', 10, 'DATA PROTECTION', [0.55, 0.38, 0.05]);
        $s .= self::text(62, 284, 'F1', 9.5, 'This account gives access to personal information about members of the church. You are responsible', [0.3, 0.25, 0.1]);
        $s .= self::text(62, 271, 'F1', 9.5, 'for protecting it: use it only for your ministry duties, do not copy, photograph or forward it, and', [0.3, 0.25, 0.1]);
        $s .= self::text(62, 258, 'F1', 9.5, 'report any loss of this document or suspected misuse to head office immediately.', [0.3, 0.25, 0.1]);

        // Footer
        $s .= "q 0.82 0.86 0.92 RG 0.8 w 48 120 m 547 120 l S Q\n";
        $s .= self::text(48, 100, 'F1', 9, 'Issued: ' . $c['issued_at'] . (!empty($c['issued_by']) ? '   |   By: ' . $c['issued_by'] : '') . (!empty($c['reason']) ? '   |   ' . $c['reason'] : ''), [0.45, 0.5, 0.6]);
        $s .= self::text(48, 84, 'F1', 9, 'Heartfelt International Ministries  |  support@heartfeltonline.org', [0.45, 0.5, 0.6]);

        return self::assemble($s, $W, $H);
    }

    private static function text(float $x, float $y, string $font, float $size, string $text, array $rgb): string
    {
        return sprintf("BT /%s %s Tf %.3f %.3f %.3f rg %s %s Td (%s) Tj ET\n", $font, $size, $rgb[0], $rgb[1], $rgb[2], $x, $y, self::esc($text));
    }

    /** PDF strings: Latin-1 bytes with ( ) \ escaped. */
    private static function esc(string $t): string
    {
        $t = @iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $t) ?: preg_replace('/[^\x20-\x7E]/', '?', $t);

        return str_replace(['\\', '(', ')', "\r", "\n"], ['\\\\', '\\(', '\\)', '', ' '], $t);
    }

    private static function assemble(string $content, int $w, int $h): string
    {
        $objs = [];
        $objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objs[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
        $objs[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$w} {$h}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>";
        $objs[4] = '<< /Length ' . strlen($content) . " >>\nstream\n{$content}endstream";
        $objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        $objs[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
        $objs[7] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>';

        $out = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objs as $n => $body) {
            $offsets[$n] = strlen($out);
            $out .= "{$n} 0 obj\n{$body}\nendobj\n";
        }
        $xref = strlen($out);
        $out .= "xref\n0 " . (count($objs) + 1) . "\n0000000000 65535 f \n";
        foreach ($offsets as $o) {
            $out .= sprintf("%010d 00000 n \n", $o);
        }
        $out .= 'trailer << /Size ' . (count($objs) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $out;
    }
}
