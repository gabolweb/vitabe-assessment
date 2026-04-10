<?php

namespace App\Http\Requests;

use App\Enums\BusinessHours;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_name' => ['required', 'string', 'max:255'],
            'service_id' => [
                'required',
                Rule::exists('services', 'id')->where('active', true),
            ],
            'starts_at' => ['required', 'date_format:Y-m-d H:i:s', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'client_name.required' => 'O nome do cliente é obrigatório.',
            'client_name.max' => 'O nome deve ter no máximo 255 caracteres.',
            'service_id.required' => 'Selecione um serviço.',
            'service_id.exists' => 'O serviço selecionado não está disponível.',
            'starts_at.required' => 'Informe a data e o horário do agendamento.',
            'starts_at.date_format' => 'Formato de data inválido. Tente novamente.',
            'starts_at.after' => 'O horário selecionado já passou. Escolha uma data futura.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            $startsAt = Carbon::parse($this->input('starts_at'));
            $hour = $startsAt->hour;

            if ($hour < BusinessHours::OPEN_HOUR->value) {
                $validator->errors()->add('starts_at', 'O horário escolhido está fora do atendimento (08h às 18h).');
            }

            if ($hour >= BusinessHours::CLOSE_HOUR->value) {
                $validator->errors()->add('starts_at', 'O horário escolhido está fora do atendimento (08h às 18h).');
            }
        });
    }
}
