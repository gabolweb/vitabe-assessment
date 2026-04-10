<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private AppointmentService $appointmentService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return AppointmentResource::collection(
            Appointment::with('service')->get()
        );
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->appointmentService->create($request->validated());

        return (new AppointmentResource($appointment->load('service')))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Appointment $appointment): Response
    {
        $appointment->delete();

        return response()->noContent();
    }
}
