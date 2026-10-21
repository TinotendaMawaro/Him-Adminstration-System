@php
    $tones = [
        'info'    => ['#1e3a5f', '#eaf0f7', 'i'],
        'success' => ['#15803d', '#e8f6ee', '✓'],
        'warning' => ['#b45309', '#fdf3e3', '!'],
        'danger'  => ['#b91c1c', '#fdecec', '✕'],
    ];
    [$accent, $tint, $glyph] = $tones[$m['tone']] ?? $tones['info'];
    $navy = $brand['navy']; $gold = $brand['gold'];
    $font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
@endphp
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $m['subject'] }}</title>
    <style>
        body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
        table { border-collapse:collapse; }
        img { border:0; }
        a { color:{{ $navy }}; }
        @media only screen and (max-width:620px) {
            .wrap { width:100% !important; }
            .px { padding-left:22px !important; padding-right:22px !important; }
            .btn a { display:block !important; }
            .fact-l, .fact-r { display:block !important; width:100% !important; text-align:left !important; }
            .fact-r { padding-top:0 !important; padding-bottom:12px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#eef1f6;">
    {{-- Inbox preview text (hidden) --}}
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef1f6;font-size:1px;line-height:1px;">
        {{ $m['preheader'] ?: $m['title'] }}{!! str_repeat('&#8199;&zwnj;', 30) !!}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;">
        <tr><td align="center" style="padding:28px 12px;">

            <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
                {{-- Header --}}
                <tr>
                    <td class="px" style="background:{{ $navy }};padding:26px 36px 22px;border-radius:16px 16px 0 0;border-bottom:4px solid {{ $gold }};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                            <td style="font-family:{{ $font }};color:#ffffff;">
                                <div style="font-size:11px;letter-spacing:3px;color:{{ $gold }};font-weight:700;text-transform:uppercase;">Heartfelt</div>
                                <div style="font-size:19px;font-weight:700;letter-spacing:.2px;margin-top:3px;">{{ $brand['name'] }}</div>
                            </td>
                        </tr></table>
                    </td>
                </tr>

                {{-- Card --}}
                <tr>
                    <td class="px" style="background:#ffffff;padding:38px 36px 14px;font-family:{{ $font }};color:#1f2937;">

                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr>
                            <td width="46" height="46" align="center" valign="middle" style="width:46px;height:46px;background:{{ $tint }};border-radius:23px;color:{{ $accent }};font-size:22px;font-weight:800;font-family:{{ $font }};">{{ $glyph }}</td>
                        </tr></table>

                        <h1 style="margin:0 0 6px;font-size:25px;line-height:1.25;color:{{ $navy }};font-weight:800;letter-spacing:-.3px;">{{ $m['title'] }}</h1>

                        @if($m['greeting'])
                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#374151;">{{ $m['greeting'] }}</p>
                        @endif

                        @foreach($m['intro'] as $line)
                            <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#374151;">{!! e($line) !!}</p>
                        @endforeach

                        @if(!empty($m['facts']))
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;background:#f8f9fb;border:1px solid #e8ebf0;border-radius:12px;">
                                @foreach($m['facts'] as $label => $value)
                                    <tr>
                                        <td class="fact-l" style="padding:12px 18px;font-size:13px;color:#6b7280;width:38%;vertical-align:top;border-bottom:{{ $loop->last ? '0' : '1px solid #eceef2' }};">{{ $label }}</td>
                                        <td class="fact-r" style="padding:12px 18px;font-size:14px;color:#111827;font-weight:600;text-align:right;vertical-align:top;border-bottom:{{ $loop->last ? '0' : '1px solid #eceef2' }};word-break:break-word;">{{ $value }}</td>
                                    </tr>
                                @endforeach
                            </table>
                        @endif

                        @if($m['notice'])
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;"><tr>
                                <td style="background:{{ $tint }};border-left:4px solid {{ $accent }};border-radius:8px;padding:14px 18px;font-size:14px;line-height:1.6;color:#374151;">{{ $m['notice'] }}</td>
                            </tr></table>
                        @endif

                        @if($m['cta'])
                            <table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr>
                                <td align="center" style="background:{{ $navy }};border-radius:10px;">
                                    <a href="{{ $m['cta']['url'] }}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:{{ $font }};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;border-bottom:3px solid {{ $gold }};">{{ $m['cta']['label'] }}</a>
                                </td>
                            </tr></table>
                            <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all;">Button not working? Copy this link: {{ $m['cta']['url'] }}</p>
                        @endif

                        @foreach($m['outro'] as $line)
                            <p style="margin:20px 0 0;font-size:15px;line-height:1.65;color:#4b5563;">{!! e($line) !!}</p>
                        @endforeach

                        <p style="margin:26px 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">With love in Christ,<br><strong style="color:{{ $navy }};">{{ $brand['short'] }} Family</strong></p>
                    </td>
                </tr>

                {{-- Footer --}}
                <tr>
                    <td class="px" style="background:#f6f7fa;padding:22px 36px 26px;border-radius:0 0 16px 16px;border-top:1px solid #e8ebf0;font-family:{{ $font }};font-size:12px;line-height:1.7;color:#8a919e;text-align:center;">
                        <div style="font-weight:700;color:#5b6472;">{{ $brand['name'] }}</div>
                        <div style="font-style:italic;">{{ $brand['tagline'] }}</div>
                        <div style="margin-top:10px;">
                            Questions? <a href="mailto:{{ $supportEmail }}" style="color:{{ $navy }};text-decoration:underline;">{{ $supportEmail }}</a>
                            &nbsp;·&nbsp; <a href="{{ $portalUrl }}" style="color:{{ $navy }};text-decoration:underline;">Open the portal</a>
                        </div>
                        @if($recipient)
                            <div style="margin-top:10px;">This email was sent to {{ $recipient }}.</div>
                        @endif
                        @if($unsubscribeUrl)
                            <div style="margin-top:6px;">This is a copy of a notification in your portal. <a href="{{ $unsubscribeUrl }}" style="color:#8a919e;text-decoration:underline;">Stop these email copies</a></div>
                        @endif
                        <div style="margin-top:10px;color:#b0b6c0;">&copy; {{ $year }} {{ $brand['name'] }}</div>
                    </td>
                </tr>
            </table>

        </td></tr>
    </table>
</body>
</html>
