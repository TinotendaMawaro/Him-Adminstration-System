<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Receipt <?php echo e($payment->receipt_number); ?></title>
    <style>
        :root { --navy:#1e3a5f; --gold:#c9a84c; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; }
        * { box-sizing: border-box; }
        body { margin:0; background:#f3f4f6; color:var(--ink); font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
        .sheet { max-width:720px; margin:32px auto; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.08); overflow:hidden; }
        header { background:#fff; padding:24px 36px 18px; display:flex; justify-content:space-between; align-items:center; border-bottom:4px solid var(--navy); box-shadow:0 3px 0 var(--gold); }
        header img { width:130px; height:auto; display:block; }
        header small { color:var(--muted); display:block; font-size:12px; letter-spacing:.06em; text-transform:uppercase; }
        .no { text-align:right; } .no strong { display:block; font-size:20px; color:var(--navy); }
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
        <div><img src="<?php echo e(asset('images/logo.jpeg')); ?>" alt="Heartfelt International Ministries"><small style="margin-top:6px">Official payment receipt</small></div>
        <div class="no"><small>Receipt no.</small><strong><?php echo e($payment->receipt_number); ?></strong></div>
    </header>
    <div class="body">
        <div class="amount"><span>Amount received</span><strong><?php echo e($payment->currency); ?> <?php echo e(number_format((float) $payment->amount, 2)); ?></strong></div>
        <dl>
            <dt>Received from</dt><dd><?php echo e($payment->user?->name); ?></dd>
            <dt>Contribution</dt><dd><?php echo e($payment->type?->getLabel()); ?></dd>
            <dt>Zone / Region</dt><dd><?php echo e($payment->zone?->name ?? '—'); ?> / <?php echo e($payment->zone?->region?->name ?? '—'); ?></dd>
            <dt>Payment method</dt><dd><?php echo e($payment->method?->getLabel() ?? '—'); ?></dd>
            <?php if($payment->transaction_id): ?><dt>Transaction ID</dt><dd><?php echo e($payment->transaction_id); ?></dd><?php endif; ?>
            <dt>Date</dt><dd><?php echo e(($payment->paid_at ?? $payment->created_at)->format('d M Y, H:i')); ?></dd>
            <dt>Reference</dt><dd><?php echo e($payment->reference); ?></dd>
            <dt>Received by</dt><dd><?php echo e(($payment->confirmedBy ?? $payment->recordedBy)?->name ?? '—'); ?></dd>
        </dl>
    </div>
    <footer>
        <span>Thank you for your faithful giving. This receipt is computer-generated and valid without a signature.</span>
        <span>Issued <?php echo e(now()->format('d M Y')); ?></span>
    </footer>
</div>
<div class="actions"><button onclick="window.print()">Print receipt</button></div>
</body>
</html>
<?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/receipts/show.blade.php ENDPATH**/ ?>