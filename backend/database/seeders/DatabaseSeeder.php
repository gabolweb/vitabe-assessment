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
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name'     => 'Admin VitaBee',
            'email'    => 'admin@vitabee.com',
            'password' => \Illuminate\Support\Facades\Hash::make('vitabee@2024'),
        ]);

        $user->tokens()->create([
            'name'       => 'frontend',
            'token'      => hash('sha256', 'vitabee-dev-token'),
            'abilities'  => ['*'],
        ]);

        $this->call(ServiceSeeder::class);
    }
}
