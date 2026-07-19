<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function showLogin()
    {
        return response()->json(['ok' => true]);
    }

    public function login(Request $request)
    {
        $payload = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $payload['username'])->orWhere('name', $payload['username'])->first();
        if (!$user || !Hash::check($payload['password'], $user->password)) {
            throw ValidationException::withMessages(['username' => ['Username atau password salah.']]);
        }

        // Session-based auth
        Auth::login($user);

        return response()->json([
            'ok' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function me()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(null, 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }
}

