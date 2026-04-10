<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'admin@vitabe.com'],
            [
                'name' => 'Admin vitabe',
                'password' => \Illuminate\Support\Facades\Hash::make('vitabe@2026'),
            ]
        );

        // Cria o token apenas se ainda não existir
        if (! $user->tokens()->where('name', 'frontend')->exists()) {
            $user->tokens()->create([
                'name' => 'frontend',
                'token' => hash('sha256', env('FRONTEND_API_TOKEN', 'vitabe-dev-token')),
                'abilities' => ['*'],
            ]);
        }

        $this->call(ServiceSeeder::class);
    }
}
