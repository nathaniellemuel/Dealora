<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function wallet(Request $request)
    {
        $data = $request->validate([
            'wallet_address' => ['required', 'regex:/^0x[a-fA-F0-9]{40}$/'],
            'role' => ['nullable', 'in:client,freelancer'],
            'chain_id' => ['nullable', 'integer'],
        ]);

        $address = strtolower($data['wallet_address']);

        $user = User::where('wallet_address', $address)->first();

        if (! $user) {
            $user = User::create([
                'name' => substr($address, 0, 6).'...'.substr($address, -4),
                'wallet_address' => $address,
                'role' => $data['role'] ?? null,
                'nonce' => Str::random(16),
                'password' => null,
                'email' => null,
            ]);
        } elseif (! empty($data['role']) && $user->role !== $data['role']) {
            $user->update(['role' => $data['role']]);
        }

        $token = $user->createToken('wallet')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateRole(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', 'in:client,freelancer'],
        ]);

        $user = $request->user();
        $user->update(['role' => $data['role']]);

        return response()->json($user);
    }
}
