<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_all_active_services(): void
    {
        Service::create(['name' => 'Corte Masculino', 'duration_min' => 30, 'active' => true]);
        Service::create(['name' => 'Inactive Service', 'duration_min' => 30, 'active' => false]);

        $response = $this->getJson('/api/services');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'duration_min']]]);
    }

    public function test_it_returns_empty_array_when_no_services(): void
    {
        $response = $this->getJson('/api/services');

        $response->assertOk()
            ->assertExactJson(['data' => []]);
    }
}
