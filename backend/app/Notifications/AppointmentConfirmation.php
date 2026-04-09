<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentConfirmation extends Notification
{
    public function __construct(
        private Appointment $appointment
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment Confirmation')
            ->line("Hi {$this->appointment->client_name}, your appointment has been scheduled.")
            ->line('Start: ' . $this->appointment->starts_at->toDateTimeString())
            ->line('End:   ' . $this->appointment->ends_at->toDateTimeString());
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
