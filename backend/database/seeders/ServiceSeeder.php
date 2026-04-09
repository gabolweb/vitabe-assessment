<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Corte Feminino',         'duration_min' => 45],
            ['name' => 'Corte Masculino',        'duration_min' => 30],
            ['name' => 'Manicure',               'duration_min' => 30],
            ['name' => 'Pedicure',               'duration_min' => 45],
            ['name' => 'Hidratação Capilar',     'duration_min' => 60],
            ['name' => 'Design de Sobrancelha',  'duration_min' => 20],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}
