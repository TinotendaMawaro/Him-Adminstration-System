<?php echo strtoupper($brand['name']); ?>

------------------------------------------------------------

<?php echo $m['title']; ?>

<?php if($m['greeting']): ?>

<?php echo $m['greeting']; ?>

<?php endif; ?>
<?php $__currentLoopData = $m['intro']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $line): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

<?php echo $line; ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
<?php if(!empty($m['facts'])): ?>

<?php $__currentLoopData = $m['facts']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $label => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
<?php echo str_pad($label . ':', 22); ?><?php echo $value; ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
<?php endif; ?>
<?php if($m['notice']): ?>

NOTE: <?php echo $m['notice']; ?>

<?php endif; ?>
<?php if($m['cta']): ?>

<?php echo $m['cta']['label']; ?>:
<?php echo $m['cta']['url']; ?>

<?php endif; ?>
<?php $__currentLoopData = $m['outro']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $line): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

<?php echo $line; ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

With love in Christ,
<?php echo $brand['short']; ?> Family

------------------------------------------------------------
<?php echo $brand['name']; ?> - <?php echo $brand['tagline']; ?>

Questions? <?php echo $supportEmail; ?>

Portal: <?php echo $portalUrl; ?>

<?php if($recipient): ?>
Sent to <?php echo $recipient; ?>.
<?php endif; ?>
<?php if($unsubscribeUrl): ?>
Stop these email copies: <?php echo $unsubscribeUrl; ?>

<?php endif; ?>
<?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/emails/message-text.blade.php ENDPATH**/ ?>