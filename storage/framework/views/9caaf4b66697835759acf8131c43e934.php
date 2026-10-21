<?php
    $tones = [
        'info'    => ['#1e3a5f', '#eaf0f7', 'i'],
        'success' => ['#15803d', '#e8f6ee', '✓'],
        'warning' => ['#b45309', '#fdf3e3', '!'],
        'danger'  => ['#b91c1c', '#fdecec', '✕'],
    ];
    [$accent, $tint, $glyph] = $tones[$m['tone']] ?? $tones['info'];
    $navy = $brand['navy']; $gold = $brand['gold'];
    $font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

    // Logo: hosted URL if configured; else embedded in the real message ($message exists when sending);
    // else (browser previews) a data URI so previews look identical.
    $logoPath = $logo['path'] ?? null;
    $logoSrc  = null;
    if (!empty($logo['url'])) {
        $logoSrc = $logo['url'];
    } elseif ($logoPath && is_file($logoPath)) {
        $logoSrc = (isset($message) && is_object($message) && method_exists($message, 'embed'))
            ? $message->embed($logoPath)
            : 'data:' . (mime_content_type($logoPath) ?: 'image/jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath));
    }
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title><?php echo e($m['subject']); ?></title>
    <style>
        body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
        table { border-collapse:collapse; }
        img { border:0; }
        a { color:<?php echo e($navy); ?>; }
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
    
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef1f6;font-size:1px;line-height:1px;">
        <?php echo e($m['preheader'] ?: $m['title']); ?><?php echo str_repeat('&#8199;&zwnj;', 30); ?>

    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;">
        <tr><td align="center" style="padding:28px 12px;">

            <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
                
                <tr>
                    <td class="px" align="center" style="background:#ffffff;padding:28px 36px 20px;border-radius:16px 16px 0 0;">
                        <?php if($logoSrc): ?>
                            <img src="<?php echo e($logoSrc); ?>" alt="<?php echo e($logo['alt'] ?? $brand['name']); ?>" width="150" style="display:block;margin:0 auto;width:150px;max-width:150px;height:auto;border:0;outline:none;font-family:<?php echo e($font); ?>;font-size:18px;font-weight:700;color:<?php echo e($navy); ?>;">
                        <?php else: ?>
                            <div style="font-family:<?php echo e($font); ?>;font-size:20px;font-weight:800;color:<?php echo e($navy); ?>;letter-spacing:.3px;"><?php echo e($brand['name']); ?></div>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr><td style="background:<?php echo e($navy); ?>;height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>
                <tr><td style="background:<?php echo e($gold); ?>;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

                
                <tr>
                    <td class="px" style="background:#ffffff;padding:38px 36px 14px;font-family:<?php echo e($font); ?>;color:#1f2937;">

                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr>
                            <td width="46" height="46" align="center" valign="middle" style="width:46px;height:46px;background:<?php echo e($tint); ?>;border-radius:23px;color:<?php echo e($accent); ?>;font-size:22px;font-weight:800;font-family:<?php echo e($font); ?>;"><?php echo e($glyph); ?></td>
                        </tr></table>

                        <h1 style="margin:0 0 6px;font-size:25px;line-height:1.25;color:<?php echo e($navy); ?>;font-weight:800;letter-spacing:-.3px;"><?php echo e($m['title']); ?></h1>

                        <?php if($m['greeting']): ?>
                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#374151;"><?php echo e($m['greeting']); ?></p>
                        <?php endif; ?>

                        <?php $__currentLoopData = $m['intro']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $line): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#374151;"><?php echo e($line); ?></p>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <?php if(!empty($m['facts'])): ?>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;background:#f8f9fb;border:1px solid #e8ebf0;border-radius:12px;">
                                <?php $__currentLoopData = $m['facts']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $label => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <tr>
                                        <td class="fact-l" style="padding:12px 18px;font-size:13px;color:#6b7280;width:38%;vertical-align:top;border-bottom:<?php echo e($loop->last ? '0' : '1px solid #eceef2'); ?>;"><?php echo e($label); ?></td>
                                        <td class="fact-r" style="padding:12px 18px;font-size:14px;color:#111827;font-weight:600;text-align:right;vertical-align:top;border-bottom:<?php echo e($loop->last ? '0' : '1px solid #eceef2'); ?>;word-break:break-word;"><?php echo e($value); ?></td>
                                    </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </table>
                        <?php endif; ?>

                        <?php if($m['notice']): ?>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;"><tr>
                                <td style="background:<?php echo e($tint); ?>;border-left:4px solid <?php echo e($accent); ?>;border-radius:8px;padding:14px 18px;font-size:14px;line-height:1.6;color:#374151;"><?php echo e($m['notice']); ?></td>
                            </tr></table>
                        <?php endif; ?>

                        <?php if($m['cta']): ?>
                            <table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr>
                                <td align="center" style="background:<?php echo e($navy); ?>;border-radius:10px;">
                                    <a href="<?php echo e($m['cta']['url']); ?>" target="_blank" style="display:inline-block;padding:14px 30px;font-family:<?php echo e($font); ?>;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;border-bottom:3px solid <?php echo e($gold); ?>;"><?php echo e($m['cta']['label']); ?></a>
                                </td>
                            </tr></table>
                            <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all;">Button not working? Copy this link: <?php echo e($m['cta']['url']); ?></p>
                        <?php endif; ?>

                        <?php $__currentLoopData = $m['outro']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $line): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <p style="margin:20px 0 0;font-size:15px;line-height:1.65;color:#4b5563;"><?php echo e($line); ?></p>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <p style="margin:26px 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">With love in Christ,<br><strong style="color:<?php echo e($navy); ?>;"><?php echo e($brand['short']); ?> Family</strong></p>
                    </td>
                </tr>

                
                <tr>
                    <td class="px" style="background:#f6f7fa;padding:22px 36px 26px;border-radius:0 0 16px 16px;border-top:1px solid #e8ebf0;font-family:<?php echo e($font); ?>;font-size:12px;line-height:1.7;color:#8a919e;text-align:center;">
                        <div style="font-weight:700;color:#5b6472;"><?php echo e($brand['name']); ?></div>
                        <div style="font-style:italic;"><?php echo e($brand['tagline']); ?></div>
                        <div style="margin-top:10px;">
                            Questions? <a href="mailto:<?php echo e($supportEmail); ?>" style="color:<?php echo e($navy); ?>;text-decoration:underline;"><?php echo e($supportEmail); ?></a>
                            &nbsp;·&nbsp; <a href="<?php echo e($portalUrl); ?>" style="color:<?php echo e($navy); ?>;text-decoration:underline;">Open the portal</a>
                        </div>
                        <?php if($recipient): ?>
                            <div style="margin-top:10px;">This email was sent to <?php echo e($recipient); ?>.</div>
                        <?php endif; ?>
                        <?php if($unsubscribeUrl): ?>
                            <div style="margin-top:6px;">This is a copy of a notification in your portal. <a href="<?php echo e($unsubscribeUrl); ?>" style="color:#8a919e;text-decoration:underline;">Stop these email copies</a></div>
                        <?php endif; ?>
                        <div style="margin-top:10px;color:#b0b6c0;">&copy; <?php echo e($year); ?> <?php echo e($brand['name']); ?></div>
                    </td>
                </tr>
            </table>

        </td></tr>
    </table>
</body>
</html>
<?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/emails/message.blade.php ENDPATH**/ ?>