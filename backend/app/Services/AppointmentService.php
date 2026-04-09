<?php

namespace App\Services;

use App\Enums\BusinessHours;
use App\Exceptions\SlotUnavailableException;
use App\Models\Appointment;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function create(array $data): Appointment
    {
        $service = Service::findOrFail($data['service_id']);
        $startsAt = Carbon::parse($data['starts_at']);
        $endsAt = $startsAt->copy()->addMinutes($service->duration_min);

        // BIZ-04: ends_at must not exceed closing time
        $closeHour = BusinessHours::CLOSE_HOUR->value;
        if ($endsAt->hour > $closeHour || ($endsAt->hour === $closeHour && $endsAt->minute > 0)) {
            throw ValidationException::withMessages([
                'starts_at' => ['Servico excede o horario comercial.'],
            ]);
        }

        // Overlap detection: new_start < existing_end AND new_end > existing_start
        $conflict = Appointment::where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            throw new SlotUnavailableException();
        }

        return Appointment::create([
            'client_name'       => $data['client_name'],
            'service_id'        => $service->id,
            'starts_at'         => $startsAt,
            'ends_at'           => $endsAt,
            'duration_snapshot' => $service->duration_min,
        ]);
    }
}
