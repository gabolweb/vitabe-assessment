<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Notifications\Notification;

class AppointmentConfirmation extends Notification
{
    public function __construct(
        private Appointment $appointment
    ) {}

    public function via(object $notifiable): array
    {
        return ['log'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'client_name'    => $this->appointment->client_name,
            'starts_at'      => $this->appointment->starts_at->toDateTimeString(),
            'ends_at'        => $this->appointment->ends_at->toDateTimeString(),
        ];
    }
}
