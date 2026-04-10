<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vitabe API — Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', system-ui, sans-serif;
        }

        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: .5;
            }
        }

        .badge-status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
        }
    </style>
</head>

<body
    class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full my-8">
        <!-- Header -->
        <div class="text-center mb-12">
            <div class="mb-4 flex justify-center">
                <div
                    class="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
                    <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">vitabe</h1>
            <p class="text-slate-400 text-sm">Scheduling API</p>
        </div>

        <!-- Status Card -->
        <div class="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-2xl p-8 mb-6 shadow-2xl">
            <!-- Status Badge -->
            <div class="flex items-center justify-between mb-8">
                <span class="text-slate-300 text-sm font-medium">Status Geral</span>
                @if($healthy)
                    <div class="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span class="w-2 h-2 bg-emerald-400 rounded-full pulse"></span>
                        Online
                    </div>
                @else
                    <div class="badge-status bg-red-500/20 text-red-300 border border-red-500/30">
                        <span class="w-2 h-2 bg-red-400 rounded-full pulse"></span>
                        Offline
                    </div>
                @endif
            </div>

            <!-- Health Indicators -->
            <div class="space-y-4">
                <!-- API -->
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span class="text-sm text-slate-300">API</span>
                    </div>
                    <span class="text-xs font-medium text-emerald-400">Funcional</span>
                </div>

                <!-- Database -->
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 {{ $healthy ? 'bg-emerald-400' : 'bg-red-400' }} rounded-full"></div>
                        <span class="text-sm text-slate-300">Database</span>
                    </div>
                    <span class="text-xs font-medium {{ $healthy ? 'text-emerald-400' : 'text-red-400' }}">
                        {{ $healthy ? 'Conectado' : 'Desconectado' }}
                    </span>
                </div>

                <!-- Uptime -->
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span class="text-sm text-slate-300">Uptime</span>
                    </div>
                    <span class="text-xs font-medium text-blue-400">{{ number_format($uptime, 2) }}s</span>
                </div>
            </div>
        </div>

        <!-- API Documentation -->
        <div class="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl">
            <h3 class="text-sm font-semibold text-white mb-4">Endpoints</h3>
            <div class="space-y-2">
                <a href="/api/services"
                    class="block p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-left">
                    <div class="text-xs font-medium text-slate-400 mb-1">GET</div>
                    <div class="text-sm text-slate-200">/api/services</div>
                </a>
                <a href="/api/appointments"
                    class="block p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-left">
                    <div class="text-xs font-medium text-slate-400 mb-1">GET</div>
                    <div class="text-sm text-slate-200">/api/appointments</div>
                </a>
                <div class="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div class="text-xs font-medium text-slate-400 mb-1">POST (Auth Required)</div>
                    <div class="text-sm text-slate-200">/api/appointments</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-12 pb-8 text-center text-xs text-slate-500">
            <p>{{ config('app.name') }} — Laravel {{ \Illuminate\Foundation\Application::VERSION }}</p>
        </div>
    </div>
</body>

</html>