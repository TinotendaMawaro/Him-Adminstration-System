<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Cloudinary\Cloudinary;
use Cloudinary\Transformation\Resize;

class ProfilePictureController extends Controller
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Upload to Cloudinary
        $uploadedFileUrl = $this->cloudinary->uploadApi()->upload(
            $request->file('profile_picture')->getRealPath(),
            [
                'folder' => 'profile_pictures',
                'transformation' => [
                    'width' => 300,
                    'height' => 300,
                    'crop' => 'fill',
                ],
            ]
        )['secure_url'];

        // Update user profile picture
        $user->profile_photo = $uploadedFileUrl;
        $user->save();

        return response()->json([
            'message' => 'Profile picture updated successfully',
            'profile_pic' => $uploadedFileUrl,
        ]);
    }
}