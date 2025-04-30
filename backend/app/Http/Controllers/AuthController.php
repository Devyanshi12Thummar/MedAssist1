<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    // 👉 Step 1: Send Password Reset Email
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // $status = Password::sendResetLink($request->only('email'));

        // return $status === Password::RESET_LINK_SENT
        //     ? response()->json(['status' => 'success', 'message' => __($status)])
        //     : response()->json(['status' => 'error', 'message' => __($status)], 400);

        $status = Password::sendResetLink(
            $request->only('email'),
            function ($user, $token) {
                $url = 'http://localhost:3000/reset-password/' . $token . '?email=' . urlencode($user->getEmailForPasswordReset());

        
                // Customize the email notification with this link
                $user->sendPasswordResetNotification($token, $url);
            }
        );
        return $status === Password::RESET_LINK_SENT
        ? response()->json(['status' => 'success', 'message' => __($status)])
        : response()->json(['status' => 'error', 'message' => __($status)], 400);


    }

    // 👉 Step 2: Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|confirmed|min:6',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['status' => 'success', 'message' => __($status)])
            : response()->json(['status' => 'error', 'message' => __($status)], 400);
    }
}
