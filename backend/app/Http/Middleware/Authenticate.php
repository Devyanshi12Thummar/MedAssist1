<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {

        if (!$request->expectsJson()) {
            return 'http://localhost:5173/login'; // or your deployed frontend URL
        }

        return null;

        // return $request->expectsJson() ? null : route('login');


    }
}
