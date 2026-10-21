<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <?php if($refreshUrl): ?><meta http-equiv="refresh" content="5;url=<?php echo e($refreshUrl); ?>"><?php endif; ?>
    <title>
        <?php if($state === 'success'): ?> Payment received <?php elseif($state === 'failed'): ?> Payment not completed <?php else: ?> Checking your payment <?php endif; ?>
        · Heartfelt
    </title>
    <style>
        :root { --navy:#1e3a5f; --gold:#c9a84c; --ink:#1f2937; --muted:#6b7280; --ok:#15803d; --bad:#b91c1c; --warn:#b45309; }
        * { box-sizing:border-box; }
        body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; background:linear-gradient(160deg,#eef2f7,#f8f5ec);
               color:var(--ink); font:16px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
        .card { width:100%; max-width:460px; background:#fff; border-radius:18px; box-shadow:0 20px 50px -20px rgba(30,58,95,.35); overflow:hidden; text-align:center; }
        .top { background:#fff; padding:22px 18px 16px; border-bottom:4px solid var(--navy); box-shadow:0 3px 0 var(--gold); }
        .top img { display:block; margin:0 auto; width:150px; max-width:60%; height:auto; }
        .body { padding:34px 30px 28px; }
        .icon { width:72px; height:72px; border-radius:50%; margin:0 auto 18px; display:grid; place-items:center; font-size:34px; color:#fff; }
        .ok { background:var(--ok); } .bad { background:var(--bad); } .wait { background:var(--warn); }
        h1 { margin:0 0 6px; font-size:22px; letter-spacing:-.01em; }
        p { margin:0 0 6px; color:var(--muted); }
        .amount { font-size:34px; font-weight:800; color:var(--navy); margin:16px 0 4px; letter-spacing:-.02em; }
        dl { text-align:left; margin:22px 0 0; border-top:1px solid #e5e7eb; }
        dl div { display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
        dt { color:var(--muted); } dd { margin:0; font-weight:600; text-align:right; word-break:break-all; }
        .btn { display:inline-block; margin-top:24px; padding:12px 26px; border-radius:10px; background:var(--navy); color:#fff; text-decoration:none; font-weight:600; }
        .btn.alt { background:transparent; color:var(--navy); border:1px solid #cbd5e1; margin-left:8px; }
        .spin { animation:spin 1s linear infinite; display:inline-block; } @keyframes spin { to { transform:rotate(360deg); } }
        .note { font-size:12px; margin-top:18px; color:var(--muted); }
    </style>
</head>
<body>
<main class="card" role="status" aria-live="polite">
    <div class="top"><img src="<?php echo e(asset('images/logo.jpeg')); ?>" alt="Heartfelt International Ministries"></div>
    <div class="body">
        <?php if($state === 'success'): ?>
            <div class="icon ok">✓</div>
            <h1>Thank you — payment received</h1>
            <p>Your gift has been confirmed.</p>
            <div class="amount"><?php echo e($payment->currency); ?> <?php echo e(number_format((float) $payment->amount, 2)); ?></div>
            <dl>
                <div><dt>For</dt><dd><?php echo e($payment->type->getLabel()); ?></dd></div>
                <div><dt>Receipt no.</dt><dd><?php echo e($payment->receipt_number); ?></dd></div>
                <div><dt>Reference</dt><dd><?php echo e($payment->client_reference); ?></dd></div>
            </dl>
        <?php elseif($state === 'failed'): ?>
            <div class="icon bad">!</div>
            <h1>Payment not completed</h1>
            <p>No money was taken for this attempt. You can try again from your portal.</p>
            <dl><div><dt>Reference</dt><dd><?php echo e($payment->client_reference); ?></dd></div></dl>
        <?php else: ?>
            <div class="icon wait"><span class="spin">⟳</span></div>
            <h1>Checking your payment…</h1>
            <p>We are confirming it with PayMe. This usually takes a few seconds.</p>
            <?php if(!$refreshUrl): ?>
                <p>It is taking longer than usual. You do not need to pay again — we will keep checking and your receipt will appear in your portal as soon as it is confirmed.</p>
            <?php endif; ?>
            <dl><div><dt>Reference</dt><dd><?php echo e($payment->client_reference); ?></dd></div></dl>
        <?php endif; ?>

        <a class="btn" href="<?php echo e($portalUrl); ?>">Back to my portal</a>
        <?php if($state === 'pending' && !$refreshUrl): ?><a class="btn alt" href="<?php echo e(route('pay.return', ['reference' => $payment->client_reference])); ?>">Check again</a><?php endif; ?>
        <p class="note">Secure payment by PayMe · ClicknPay</p>
    </div>
</main>
</body>
</html>
<?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/payments/return.blade.php ENDPATH**/ ?>