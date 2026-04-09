<?php

namespace App\Http\Requests;

use App\Enums\BusinessHours;
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
            'service_id'  => [
                'required',
                Rule::exists('services', 'id')->where('active', true),
            ],
            'starts_at'   => ['required', 'date_format:Y-m-d H:i:s', 'after:now'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            $startsAt = \Carbon\Carbon::parse($this->input('starts_at'));
            $hour = $startsAt->hour;

            if ($hour < BusinessHours::OPEN_HOUR->value) {
                $validator->errors()->add('starts_at', 'Fora do horario comercial.');
            }

            if ($hour >= BusinessHours::CLOSE_HOUR->value) {
                $validator->errors()->add('starts_at', 'Fora do horario comercial.');
            }
        });
    }
}
