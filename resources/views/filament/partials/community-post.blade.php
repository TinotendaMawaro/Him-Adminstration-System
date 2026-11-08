<div class="space-y-4 text-sm">
    <div class="flex items-center gap-2 text-gray-500">
        <span class="font-semibold text-gray-950 dark:text-white">{{ $post->author?->name }}</span>
        <span>· {{ $post->created_at?->format('d M Y H:i') }}</span>
        @if ($post->channel)<span>· in {{ $post->channel->name }}</span>@endif
    </div>

    @if ($post->body)
        <div class="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-base dark:bg-white/5">{{ $post->body }}</div>
    @endif

    @foreach (($post->media ?? []) as $m)
        @if (($m['type'] ?? '') === 'image')
            <img src="{{ $m['url'] }}" alt="" class="max-h-72 rounded-lg" loading="lazy" referrerpolicy="no-referrer">
        @elseif (($m['type'] ?? '') === 'video')
            <a href="{{ $m['url'] }}" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline">Video: {{ $m['url'] }}</a>
        @endif
    @endforeach

    @if ($post->poll)
        <div class="rounded-lg border p-3 dark:border-white/10"><b>Poll:</b> {{ implode(' · ', $post->poll['options'] ?? []) }}</div>
    @endif

    <div class="text-xs text-gray-500">❤ {{ $post->likes_count }} · 💬 {{ $post->comments_count }} · ↻ {{ $post->reposts_count }} · 👁 {{ $post->views_count }} · status: <b>{{ $post->status }}</b></div>
</div>
