<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use App\Notifications\AppointmentConfirmation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_appointment_with_valid_data(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertCreated()
            ->assertJsonPath('data.ends_at', '2027-12-15 10:30:00')
            ->assertJsonPath('data.duration_snapshot', 30);

        $this->assertDatabaseHas('appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
        ]);

        Notification::assertSentTo(
            [auth()->user()],
            AppointmentConfirmation::class
        );
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
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 10:30:00',
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

    public function test_it_rejects_unauthenticated_request(): void
    {
        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertUnauthorized();
    }

    public function test_it_rejects_missing_client_name(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'service_id' => $service->id,
            'starts_at'  => '2027-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['client_name']);
    }

    public function test_it_rejects_missing_service_id(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_missing_starts_at(): void
    {
        Sanctum::actingAs(User::factory()->create());

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
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => 9999,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_invalid_datetime_format(): void
    {
        Sanctum::actingAs(User::factory()->create());

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
        Sanctum::actingAs(User::factory()->create());

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
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Inactive',
            'duration_min' => 30,
            'active'       => false,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);
    }

    public function test_it_rejects_before_business_hours(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 07:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_after_business_hours(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 18:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_at_exact_closing(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 18:00:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_service_exceeding_business_hours(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Hidratacao Capilar',
            'duration_min' => 60,
            'active'       => true,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 17:30:00',
        ])
            ->assertUnprocessable();
    }

    public function test_it_rejects_exact_same_slot(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_overlapping_start(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Feminino',
            'duration_min' => 60,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 11:00:00',
            'duration_snapshot' => 60,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:30:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_contained_within_existing(): void
    {
        Sanctum::actingAs(User::factory()->create());

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
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 12:00:00',
            'duration_snapshot' => 120,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $serviceB->id,
            'starts_at'   => '2027-12-15 10:30:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_rejects_encompassing_existing(): void
    {
        Sanctum::actingAs(User::factory()->create());

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
            'starts_at'         => '2027-12-15 10:30:00',
            'ends_at'           => '2027-12-15 11:00:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $serviceB->id,
            'starts_at'   => '2027-12-15 10:00:00',
        ])
            ->assertStatus(409);
    }

    public function test_it_allows_adjacent_appointments(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 10:30:00',
        ])
            ->assertCreated();
    }

    public function test_it_allows_non_overlapping_same_day(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-15 14:00:00',
        ])
            ->assertCreated();
    }

    public function test_it_allows_same_time_different_dates(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->create());

        $service = Service::create([
            'name'         => 'Corte Masculino',
            'duration_min' => 30,
            'active'       => true,
        ]);

        Appointment::create([
            'client_name'       => 'João Costa',
            'service_id'        => $service->id,
            'starts_at'         => '2027-12-15 10:00:00',
            'ends_at'           => '2027-12-15 10:30:00',
            'duration_snapshot' => 30,
        ]);

        $this->postJson('/api/appointments', [
            'client_name' => 'Maria Silva',
            'service_id'  => $service->id,
            'starts_at'   => '2027-12-16 10:00:00',
        ])
            ->assertCreated();
    }
}
