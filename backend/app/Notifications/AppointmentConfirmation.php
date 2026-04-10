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
            ->subject('Confirmação de Agendamento')
            ->line("Olá {$this->appointment->client_name}, seu agendamento foi confirmado.")
            ->line('Início: ' . $this->appointment->starts_at->format('d/m/Y H:i'))
            ->line('Término: ' . $this->appointment->ends_at->format('d/m/Y H:i'));
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
