<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class StatusController extends Controller
{
    public function index(): Response
    {
        $uptime = round(microtime(true) - (float)($_SERVER['REQUEST_TIME'] ?? microtime(true)), 3);
        $dbHealthy = $this->checkDatabase();

        return response(view('status', [
            'healthy' => $dbHealthy,
            'uptime' => $uptime,
        ]), 200, [
            'Content-Type' => 'text/html; charset=utf-8',
        ]);
    }

    private function checkDatabase(): bool
    {
        try {
            \DB::connection()->getPdo();
            return true;
        } catch (\Exception) {
            return false;
        }
    }
}
