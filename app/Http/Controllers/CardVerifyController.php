<?php

namespace App\Http\Controllers;

use App\Services\IdCardService;
use Illuminate\Contracts\View\View;

/** The page a scanned ID-card QR code opens: public, minimal, never reveals anything private. */
class CardVerifyController extends Controller
{
    public function __invoke(string $token, IdCardService $cards): View
    {
        return view('cards.verify', ['card' => $cards->publicView($token)]);
    }
}
