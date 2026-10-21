<?php $__env->startSection('title', 'Email preferences'); ?>
<?php $__env->startSection('content'); ?>
    <div class="center">
        <h1><?php echo e($subscribed ? 'You are subscribed again' : 'You are unsubscribed'); ?></h1>
        <p>
            <?php if($subscribed): ?>
                We will email <strong><?php echo e($email); ?></strong> a copy of your portal notifications again.
            <?php else: ?>
                We will no longer email <strong><?php echo e($email); ?></strong> copies of portal notifications. You will still receive receipts, security alerts and password resets, and notifications still appear in your portal.
            <?php endif; ?>
        </p>
        <a class="btn" href="<?php echo e($portalUrl); ?>">Go to my portal</a>
        <a class="btn alt" href="<?php echo e($toggleUrl); ?>"><?php echo e($subscribed ? 'Stop email copies' : 'Undo — send me email copies again'); ?></a>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('portal.shell', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/emails/preference.blade.php ENDPATH**/ ?>