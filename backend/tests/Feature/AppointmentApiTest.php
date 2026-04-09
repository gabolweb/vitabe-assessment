<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_appointment_with_valid_data(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertCreated()
            ->assertJsonPath('data.ends_at', '2025-12-15 10:30:00')
            ->assertJsonPath('data.duration_snapshot', 30);

        $this->assertDatabaseHas('appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
        ]);
    }

    public function test_it_lists_appointments_with_service_data(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'Maria Silva',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->getJson('/api/appointments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'client_name',
                        'starts_at',
                        'ends_at',
                        'service' => [
                            'id',
                            'name',
                            'duration_min',
                        ],
                    ],
                ],
            ]);
    }

    public function test_it_rejects_missing_client_name(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'service_id' => $service->id,
            'starts_at'  => '2025-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['client_name']);
    }

    public function test_it_rejects_missing_service_id(): void
    {
        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_missing_starts_at(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['starts_at']);
    }

    public function test_it_rejects_nonexistent_service_id(): void
    {
        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => 9999,
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_invalid_datetime_format(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => 'not-a-date',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['starts_at']);
    }

    public function test_it_rejects_past_datetime(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2020-01-01 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['starts_at']);
    }

    public function test_it_rejects_inactive_service(): void
    {
        $service = Service::create([
            'name'         => 'Inactive',
            'duration_min' => 30,
            'active'       => false,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_before_business_hours(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 07:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_after_business_hours(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 18:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_at_exact_closing(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 18:00:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_service_exceeding_business_hours(): void
    {
        $service = Service::create([
            'name'         => 'Hidratacao Capilar',
            'duration_min' => 60,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 17:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_exact_same_slot(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_overlapping_start(): void
    {
        $service = Service::create([
            'name'         => 'Corte Feminino',
            'duration_min' => 60,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 11:00:00',
            'duration_snapshot' => 60,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 10:30:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_contained_within_existing(): void
    {
        $serviceA = Service::create([
            'name'         => 'Hidratacao Capilar',
            'duration_min' => 120,
            'active'       => true,
        ]);

        $serviceB = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $serviceA->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 12:00:00',
            'duration_snapshot' => 120,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $serviceB->id,
            'starts_at'   => '2025-12-15 10:30:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_encompassing_existing(): void
    {
        $serviceA = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $serviceB = Service::create([
            'name'         => 'Hidratacao Capilar',
            'duration_min' => 120,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $serviceA->id,
            'starts_at'         => '2025-12-15 10:30:00',
            'ends_at'           => '2025-12-15 11:00:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $serviceB->id,
            'starts_at'   => '2025-12-15 10:00:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_allows_adjacent_appointments(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 10:30:00',
        ])
            ->assertCreated();
    }

    public function test_it_allows_non_overlapping_same_day(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-15 14:00:00',
        ])
            ->assertCreated();
    }

    public function test_it_allows_same_time_different_dates(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2025-12-15 10:00:00',
            'ends_at'           => '2025-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2025-12-16 10:00:00',
        ])
            ->assertCreated();
    }
}
