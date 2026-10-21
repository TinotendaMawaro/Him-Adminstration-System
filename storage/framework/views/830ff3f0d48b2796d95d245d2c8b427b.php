<?php
    $rows = $this->getRows();
    $cols = ['tithes' => 'Tithes', 'offerings' => 'Offerings', 'seeds' => 'Seeds', 'building_fund' => 'Building', 'missions' => 'Missions', 'partnership' => 'Partnership', 'other' => 'Other'];
    $money = fn ($v) => '$' . number_format((float) $v, 2);
    $grand = $rows->sum('total');
?>

<?php if (isset($component)) { $__componentOriginal166a02a7c5ef5a9331faf66fa665c256 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal166a02a7c5ef5a9331faf66fa665c256 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament-panels::components.page.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament-panels::page'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="w-full md:max-w-xl"><?php echo e($this->form); ?></div>
        <?php if (isset($component)) { $__componentOriginal6330f08526bbb3ce2a0da37da512a11f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6330f08526bbb3ce2a0da37da512a11f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.button.index','data' => ['tag' => 'a','href' => $this->exportUrl(),'icon' => 'heroicon-o-arrow-down-tray','color' => 'gray']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['tag' => 'a','href' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($this->exportUrl()),'icon' => 'heroicon-o-arrow-down-tray','color' => 'gray']); ?>Export CSV <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6330f08526bbb3ce2a0da37da512a11f)): ?>
<?php $attributes = $__attributesOriginal6330f08526bbb3ce2a0da37da512a11f; ?>
<?php unset($__attributesOriginal6330f08526bbb3ce2a0da37da512a11f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6330f08526bbb3ce2a0da37da512a11f)): ?>
<?php $component = $__componentOriginal6330f08526bbb3ce2a0da37da512a11f; ?>
<?php unset($__componentOriginal6330f08526bbb3ce2a0da37da512a11f); ?>
<?php endif; ?>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!--[if BLOCK]><![endif]--><?php $__currentLoopData = [['Total', $grand], ['Tithes', $rows->sum('tithes')], ['Offerings', $rows->sum('offerings')], ['Seeds', $rows->sum('seeds')]]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as [$label, $value]): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php if (isset($component)) { $__componentOriginalee08b1367eba38734199cf7829b1d1e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalee08b1367eba38734199cf7829b1d1e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.section.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::section'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                <div class="text-sm text-gray-500 dark:text-gray-400"><?php echo e($label); ?></div>
                <div class="text-2xl font-bold tracking-tight"><?php echo e($money($value)); ?></div>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $attributes = $__attributesOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $component = $__componentOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__componentOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
    </div>

    <?php if (isset($component)) { $__componentOriginalee08b1367eba38734199cf7829b1d1e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalee08b1367eba38734199cf7829b1d1e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.section.index','data' => ['heading' => 'By zone and region','description' => 'Built automatically from receipted payments. Voided and pending payments are excluded.']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::section'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['heading' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute('By zone and region'),'description' => 'Built automatically from receipted payments. Voided and pending payments are excluded.']); ?>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
                        <th class="py-2 pr-4">Zone</th>
                        <!--[if BLOCK]><![endif]--><?php $__currentLoopData = $cols; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><th class="px-3 py-2 text-right"><?php echo e($label); ?></th><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
                        <th class="px-3 py-2 text-right">Total</th>
                        <th class="px-3 py-2 text-right">Givers</th>
                    </tr>
                </thead>
                <tbody>
                <!--[if BLOCK]><![endif]--><?php $__empty_1 = true; $__currentLoopData = $rows->groupBy('region'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $region => $zones): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr class="bg-gray-50 font-semibold dark:bg-white/5">
                        <td class="py-2 pr-4"><?php echo e($region); ?></td>
                        <!--[if BLOCK]><![endif]--><?php $__currentLoopData = $cols; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><td class="px-3 py-2 text-right"><?php echo e($money($zones->sum($key))); ?></td><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
                        <td class="px-3 py-2 text-right"><?php echo e($money($zones->sum('total'))); ?></td>
                        <td class="px-3 py-2 text-right"><?php echo e($zones->sum('contributors')); ?></td>
                    </tr>
                    <!--[if BLOCK]><![endif]--><?php $__currentLoopData = $zones; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $z): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <tr class="border-b border-gray-100 dark:border-white/5">
                            <td class="py-2 pl-4 pr-4 text-gray-600 dark:text-gray-300"><span class="font-mono text-xs text-gray-400"><?php echo e($z->zone_code); ?></span> <?php echo e($z->zone); ?></td>
                            <!--[if BLOCK]><![endif]--><?php $__currentLoopData = $cols; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><td class="px-3 py-2 text-right tabular-nums"><?php echo e((float) $z->$key ? $money($z->$key) : '—'); ?></td><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
                            <td class="px-3 py-2 text-right font-medium tabular-nums"><?php echo e((float) $z->total ? $money($z->total) : '—'); ?></td>
                            <td class="px-3 py-2 text-right tabular-nums"><?php echo e($z->contributors ?: '—'); ?></td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="<?php echo e(count($cols) + 3); ?>" class="py-8 text-center text-gray-500">No zones found.</td></tr>
                <?php endif; ?><!--[if ENDBLOCK]><![endif]-->
                </tbody>
                <tfoot>
                    <tr class="border-t-2 border-gray-300 font-bold dark:border-white/20">
                        <td class="py-3 pr-4">Grand total</td>
                        <!--[if BLOCK]><![endif]--><?php $__currentLoopData = $cols; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><td class="px-3 py-3 text-right"><?php echo e($money($rows->sum($key))); ?></td><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><!--[if ENDBLOCK]><![endif]-->
                        <td class="px-3 py-3 text-right"><?php echo e($money($grand)); ?></td>
                        <td class="px-3 py-3 text-right"><?php echo e($rows->sum('contributors')); ?></td>
                    </tr>
                </tfoot>
            </table>
        </div>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $attributes = $__attributesOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $component = $__componentOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__componentOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal166a02a7c5ef5a9331faf66fa665c256)): ?>
<?php $attributes = $__attributesOriginal166a02a7c5ef5a9331faf66fa665c256; ?>
<?php unset($__attributesOriginal166a02a7c5ef5a9331faf66fa665c256); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal166a02a7c5ef5a9331faf66fa665c256)): ?>
<?php $component = $__componentOriginal166a02a7c5ef5a9331faf66fa665c256; ?>
<?php unset($__componentOriginal166a02a7c5ef5a9331faf66fa665c256); ?>
<?php endif; ?>
<?php /**PATH C:\Users\tmawa\Documents\GitHub\HIM-Administration-System\resources\views/filament/pages/contributions-ledger.blade.php ENDPATH**/ ?>