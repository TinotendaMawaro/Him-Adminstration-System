<?php

namespace App\Support;

/**
 * The ONLY way a link from a user becomes media in the app. Nothing else is ever embedded or fetched:
 *   - YouTube (watch, youtu.be, shorts, live, embed) and Vimeo links become video descriptors
 *   - images must be https and either have an image file extension or come from our own storage hosts
 * Anything else is rejected, so a member cannot embed an arbitrary site, a script, a tracking pixel over http, etc.
 */
class MediaLinks
{
    /** Hosts we store uploaded images on (see App\Services\MediaStore). */
    private const OWN_IMAGE_HOSTS = ['res.cloudinary.com', 'blob.vercel-storage.com', 'public.blob.vercel-storage.com'];

    public static function youtubeId(string $url): ?string
    {
        $url = trim($url);
        if (!preg_match('~^https?://(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)/~i', $url)) {
            return null;
        }

        $patterns = [
            '~youtu\.be/([A-Za-z0-9_-]{11})(?:[?&#/]|$)~i',
            '~[?&]v=([A-Za-z0-9_-]{11})(?:[&#]|$)~i',
            '~/(?:shorts|live|embed|v)/([A-Za-z0-9_-]{11})(?:[?&#/]|$)~i',
        ];
        foreach ($patterns as $p) {
            if (preg_match($p, $url, $m)) {
                return $m[1];
            }
        }

        return null;
    }

    public static function isShortLink(string $url): bool
    {
        return (bool) preg_match('~youtube\.com/shorts/~i', $url);
    }

    /** @return array{type:string,provider:string,video_id:string,url:string,embed:string,thumb:?string,short:bool}|null */
    public static function video(string $url): ?array
    {
        if ($id = self::youtubeId($url)) {
            return [
                'type' => 'video', 'provider' => 'youtube', 'video_id' => $id,
                'url' => "https://www.youtube.com/watch?v={$id}",
                'embed' => "https://www.youtube-nocookie.com/embed/{$id}?rel=0&modestbranding=1&playsinline=1",
                'thumb' => "https://i.ytimg.com/vi/{$id}/hqdefault.jpg",
                'short' => self::isShortLink($url),
            ];
        }

        if (preg_match('~^https?://(?:www\.)?vimeo\.com/(?:channels/[\w-]+/|groups/[\w-]+/videos/)?(\d{6,12})(?:[/?#]|$)~i', trim($url), $m)) {
            return [
                'type' => 'video', 'provider' => 'vimeo', 'video_id' => $m[1],
                'url' => "https://vimeo.com/{$m[1]}",
                'embed' => "https://player.vimeo.com/video/{$m[1]}?playsinline=1",
                'thumb' => null, 'short' => false,
            ];
        }

        return null;
    }

    public static function image(string $url): ?array
    {
        $url = trim($url);
        if (strlen($url) > 500 || !filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $path = strtolower((string) parse_url($url, PHP_URL_PATH));

        // Photos uploaded through the app are stored on our own disk in development (http is fine on a local machine).
        $appHost = strtolower((string) parse_url((string) config('app.url'), PHP_URL_HOST));
        if (app()->environment('local') && $host === $appHost && preg_match('~^/storage/community/[a-z0-9/_-]+\.(jpe?g|png|webp|gif)$~', $path)) {
            return ['type' => 'image', 'url' => $url];
        }
        if (!str_starts_with(strtolower($url), 'https://')) {
            return null;
        }
        $ownHost = collect(self::OWN_IMAGE_HOSTS)->contains(fn ($h) => $host === $h || str_ends_with($host, '.' . $h));

        if (!$ownHost && !preg_match('~\.(jpe?g|png|webp|gif|avif)$~', $path)) {
            return null;
        }

        return ['type' => 'image', 'url' => $url];
    }

    /** Parse a mixed list of links into media descriptors; throws nothing, returns [media, rejected]. */
    public static function parseMany(array $urls, int $maxImages = 4): array
    {
        $media = [];
        $rejected = [];
        $images = 0;
        $videos = 0;

        foreach ($urls as $u) {
            $u = (string) $u;
            if ($v = self::video($u)) {
                if ($videos++ === 0) {
                    $media[] = $v;
                } else {
                    $rejected[] = $u;
                }
            } elseif ($i = self::image($u)) {
                if ($images++ < $maxImages) {
                    $media[] = $i;
                } else {
                    $rejected[] = $u;
                }
            } else {
                $rejected[] = $u;
            }
        }

        return [$media, $rejected];
    }
}
