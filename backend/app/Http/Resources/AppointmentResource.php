<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_name' => $this->client_name,
            'starts_at' => $this->starts_at->format('Y-m-d H:i:s'),
            'ends_at' => $this->ends_at->format('Y-m-d H:i:s'),
            'duration_snapshot' => $this->duration_snapshot,
            'service' => new ServiceResource($this->whenLoaded('service')),
        ];
    }
}
