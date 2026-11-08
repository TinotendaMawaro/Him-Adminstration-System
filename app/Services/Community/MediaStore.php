<?php

namespace App\Services\Community;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Where uploaded photos live. On the server hosting (Vercel) the disk is read-only, so photos go to Vercel Blob
 * (set BLOB_READ_WRITE_TOKEN); on a normal server / local machine they go to storage/app/public/community.
 *
 * Whatever the person uploads is checked by CONTENT, not by its name: it must be a real JPEG/PNG/WebP/GIF of a sane
 * size. A renamed script, an SVG (which can carry scripts) or an oversized "image" is refused, and the stored file name
 * is random, so nothing the person typed ever becomes part of a URL or path.
 */
class MediaStore
{
    public const MAX_BYTES = 4_000_000;       // the app shrinks photos on the phone; anything bigger is refused
    private const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

    /** @return array{url: string, bytes: int} */
    public function storeImage(UploadedFile $file): array
    {
        if (!$file->isValid() || $file->getSize() > self::MAX_BYTES) {
            throw ValidationException::withMessages(['image' => 'That photo is too large. Please choose one under 4 MB.']);
        }

        $path = $file->getRealPath();
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path);
        $info = @getimagesize($path);

        if (!isset(self::TYPES[$mime]) || !$info || $info[0] < 16 || $info[1] < 16 || $info[0] > 8000 || $info[1] > 8000) {
            throw ValidationException::withMessages(['image' => 'Please upload a JPG, PNG, WebP or GIF photo.']);
        }

        $name = 'community/' . now()->format('Y/m') . '/' . Str::lower(Str::random(32)) . '.' . self::TYPES[$mime];
        $bytes = file_get_contents($path);

        $url = config('services.blob.token') ? $this->toBlob($name, $bytes, $mime) : $this->toDisk($name, $bytes);

        return ['url' => $url, 'bytes' => strlen($bytes)];
    }

    private function toDisk(string $name, string $bytes): string
    {
        Storage::disk('public')->put($name, $bytes);

        return url('/storage/' . $name);
    }

    private function toBlob(string $name, string $bytes, string $mime): string
    {
        try {
            $r = Http::withToken((string) config('services.blob.token'))
                ->withHeaders(['x-api-version' => '7', 'x-content-type' => $mime, 'x-add-random-suffix' => '0', 'x-cache-control-max-age' => '31536000'])
                ->withBody($bytes, $mime)->timeout(25)->put('https://blob.vercel-storage.com/' . $name)->throw();
        } catch (RequestException $e) {
            report($e);
            throw ValidationException::withMessages(['image' => 'Photo storage is unavailable right now. Please try again in a moment.']);
        }

        return (string) $r->json('url');
    }
}
