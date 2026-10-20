<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Receipt {{ $payment->receipt_number }}</title>
    <style>
        :root { --navy:#1e3a5f; --gold:#c9a84c; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; }
        * { box-sizing: border-box; }
        body { margin:0; background:#f3f4f6; color:var(--ink); font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
        .sheet { max-width:720px; margin:32px auto; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.08); overflow:hidden; }
        header { background:var(--navy); color:#fff; padding:28px 36px; display:flex; justify-content:space-between; align-items:flex-end; border-bottom:4px solid var(--gold); }
        header h1 { margin:0; font-size:20px; letter-spacing:.04em; }
        header small { color:#cbd5e1; display:block; margin-top:4px; }
        .no { text-align:right; } .no strong { display:block; font-size:18px; color:var(--gold); }
        .body { padding:32px 36px; }
        .amount { text-align:center; padding:22px; background:#f9fafb; border:1px dashed var(--gold); border-radius:10px; margin-bottom:28px; }
        .amount span { display:block; color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.1em; }
        .amount strong { font-size:36px; color:var(--navy); }
        dl { display:grid; grid-template-columns:160px 1fr; gap:0; margin:0; }
        dt, dd { padding:10px 0; border-bottom:1px solid var(--line); margin:0; }
        dt { color:var(--muted); } dd { font-weight:600; }
        footer { padding:20px 36px 32px; color:var(--muted); font-size:12px; display:flex; justify-content:space-between; gap:16px; }
        .actions { text-align:center; margin:0 0 32px; } .actions button { background:var(--navy); color:#fff; border:0; padding:10px 22px; border-radius:8px; font-size:14px; cursor:pointer; }
        @media print { body { background:#fff; } .sheet { box-shadow:none; margin:0; border-radius:0; } .actions { display:none; } }
        @media (max-width:560px) { dl { grid-template-columns:1fr; } dt { border:0; padding-bottom:0; } header { flex-direction:column; align-items:flex-start; gap:12px; } .no { text-align:left; } }
    </style>
</head>
<body>
<div class="sheet">
    <header>
        <div><h1>HEARTFELT INTERNATIONAL MINISTRIES</h1><small>Official payment receipt</small></div>
        <div class="no"><small>Receipt no.</small><strong>{{ $payment->receipt_number }}</strong></div>
    </header>
    <div class="body">
        <div class="amount"><span>Amount received</span><strong>{{ $payment->currency }} {{ number_format((float) $payment->amount, 2) }}</strong></div>
        <dl>
            <dt>Received from</dt><dd>{{ $payment->user?->name }}</dd>
            <dt>Contribution</dt><dd>{{ $payment->type?->getLabel() }}</dd>
            <dt>Zone / Region</dt><dd>{{ $payment->zone?->name ?? '—' }} / {{ $payment->zone?->region?->name ?? '—' }}</dd>
            <dt>Payment method</dt><dd>{{ $payment->method?->getLabel() ?? '—' }}</dd>
            @if($payment->transaction_id)<dt>Transaction ID</dt><dd>{{ $payment->transaction_id }}</dd>@endif
            <dt>Date</dt><dd>{{ ($payment->paid_at ?? $payment->created_at)->format('d M Y, H:i') }}</dd>
            <dt>Reference</dt><dd>{{ $payment->reference }}</dd>
            <dt>Received by</dt><dd>{{ ($payment->confirmedBy ?? $payment->recordedBy)?->name ?? '—' }}</dd>
        </dl>
    </div>
    <footer>
        <span>Thank you for your faithful giving. This receipt is computer-generated and valid without a signature.</span>
        <span>Issued {{ now()->format('d M Y') }}</span>
    </footer>
</div>
<div class="actions"><button onclick="window.print()">Print receipt</button></div>
</body>
</html>
