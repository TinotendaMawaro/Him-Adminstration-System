<?php

namespace App\Http\Controllers;

use App\Services\Community\MediaStore;
use Illuminate\Http\Request;

/** Legacy endpoint kept for the pastor/HOD portals: stores the photo through the same content-checked cloud store as everything else. */
class ProfilePictureController extends Controller
{
    public function upload(Request $request, MediaStore $store)
    {
        $request->validate(['profile_picture' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:4096']);

        $stored = $store->storeImage($request->file('profile_picture'));
        $request->user()->update(['profile_photo' => $stored['url']]);

        return response()->json(['message' => 'Profile picture updated successfully', 'profile_pic' => $stored['url']]);
    }
}
