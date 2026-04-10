# Vitabe — Sistema de Agendamento de Serviços

> Sistema completo de agendamento para o segmento de beleza e saúde, com backend API RESTful, frontend SPA e infraestrutura containerizada.

> English version available upon request.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Laravel (PHP) | 11.x (PHP 8.3) |
| Frontend | React + TypeScript + Vite | 18.3 / 5.5 / 5.4 |
| Estilização | Tailwind CSS | 3.4 |
| Banco de Dados | PostgreSQL | 16 (Alpine) |
| Autenticação | Laravel Sanctum | 4.0 |
| Container | Docker Compose | - |
| Web Server | Nginx | Alpine |
| Runtime Node | Node.js | 20 (Alpine) |

---

## Inicialização Rápida

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas livres: `8000` (API), `5173` (Frontend dev), `5433` (PostgreSQL)

### Setup em 3 comandos

```bash
# 1. Clone o repositório
git clone <repo-url> && cd vitabe-assessment

# 2. Suba todos os containers
make up

# 3. Gere a APP_KEY, rode migrations e seeds
make fresh
```

Acesse:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api/services
- **PostgreSQL**: `localhost:5433` (user: `vitabe` / password: `secret`)

### Referência de Comandos `make`

| Comando | Descrição |
|---------|-----------|
| `make up` | Builda e sobe todos os containers (`docker compose up --build -d`) |
| `make down` | Para e remove containers |
| `make restart` | Reinicia os containers |
| `make fresh` | Gera APP_KEY + `migrate:fresh --seed` (reset completo do banco) |
| `make seed` | Executa apenas os seeders (sem resetar tabelas) |
| `make test` | Roda todos os testes PHPUnit |
| `make test-filter` | Roda um teste específico (pede o filtro interativamente) |
| `make shell` | Abre bash no container PHP |
| `make lint` | Verifica formatação PSR-12 com Laravel Pint |
| `make logs` | Acompanha logs de todos os containers em tempo real |
| `make build` | Builda o frontend para produção (`npm run build`) |
| `make prod-up` | Builda frontend + sobe em modo produção (porta 80) |
| `make prod-down` | Para os containers de produção |

### Sobre Testes e Banco de Dados

Os testes PHPUnit utilizam o trait `RefreshDatabase` do Laravel, que executa `migrate:fresh` no banco de testes. Para **não destruir os dados de desenvolvimento**, o projeto configura um banco de dados isolado:

- **Desenvolvimento**: `vitabe` (porta 5433)
- **Testes**: `vitabe_test` (criado automaticamente via `docker/postgres/init.sql`)

O `phpunit.xml` define `DB_DATABASE=vitabe_test`, garantindo que `make test` nunca afete os seeds ou dados do banco principal.

> **Nota**: Se os containers foram criados antes dessa configuração, remova o volume do postgres para recriar o banco de testes:
> ```bash
> make down
> docker volume rm vitabe-assessment_pgdata
> make up && make fresh
> ```

---

## Estrutura do Projeto

```
vitabe-assessment/
├── docker/
│   ├── nginx/
│   │   ├── default.conf          # Nginx dev (proxy para PHP-FPM)
│   │   └── prod.conf             # Nginx prod (SPA + API na porta 80)
│   ├── php/
│   │   └── Dockerfile            # PHP 8.3-FPM + extensões PostgreSQL
│   └── postgres/
│       └── init.sql              # Cria banco vitabe_test para PHPUnit
├── backend/                      # Laravel 11
│   ├── app/
│   │   ├── Enums/BusinessHours.php
│   │   ├── Exceptions/SlotUnavailableException.php
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AppointmentController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   └── ServiceController.php
│   │   │   ├── Requests/StoreAppointmentRequest.php
│   │   │   └── Resources/
│   │   │       ├── AppointmentResource.php
│   │   │       └── ServiceResource.php
│   │   ├── Models/
│   │   │   ├── Appointment.php
│   │   │   ├── Service.php
│   │   │   └── User.php
│   │   ├── Notifications/AppointmentConfirmation.php
│   │   └── Services/AppointmentService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── ServiceSeeder.php
│   ├── routes/api.php
│   ├── tests/Feature/
│   │   ├── AppointmentApiTest.php
│   │   └── ServiceApiTest.php
│   └── bootstrap/app.php
├── frontend/                     # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/client.ts         # HTTP client com auth token
│   │   ├── components/
│   │   │   ├── AppointmentForm.tsx   # Wizard 3 etapas
│   │   │   ├── AppointmentList.tsx   # Lista com modo admin
│   │   │   ├── DateTimePicker.tsx    # Calendário + slots
│   │   │   ├── ServiceSelector.tsx   # Grid de serviços
│   │   │   ├── StepIndicator.tsx     # Progresso visual
│   │   │   └── Toast.tsx            # Notificações
│   │   ├── hooks/
│   │   │   ├── useAppointments.ts
│   │   │   └── useServices.ts
│   │   └── types/index.ts
│   ├── public/logo.png
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
├── .env.example
└── README.md
```

---

## Endpoints da API

| Método | Endpoint | Auth | Sucesso | Erros |
|--------|----------|------|---------|-------|
| `GET` | `/api/services` | Nenhuma | `200` — lista serviços ativos | — |
| `GET` | `/api/appointments` | Nenhuma | `200` — lista agendamentos com serviço | — |
| `POST` | `/api/appointments` | Sanctum Bearer Token | `201` — agendamento criado | `401` `409` `422` |
| `DELETE` | `/api/appointments/{id}` | Sanctum Bearer Token | `204` — removido | `401` `404` |
| `POST` | `/api/auth/login` | Nenhuma | `200` — token + user | `401` `422` |
| `POST` | `/api/auth/logout` | Sanctum Bearer Token | `200` — sessão encerrada | `401` |

### Exemplos de uso (curl)

```bash
# Listar serviços
curl http://localhost:8000/api/services

# Login (obter token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vitabe.com","password":"vitabe@2026"}'

# Criar agendamento (com token)
curl -X POST http://localhost:8000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"client_name":"Maria Silva","service_id":1,"starts_at":"2027-12-15 10:00:00"}'

# Listar agendamentos
curl http://localhost:8000/api/appointments
```

---

## Mapeamento de Escopo: Requisito x Implementação x Teste

### Backend — Requisitos Obrigatórios

| # | Requisito | Status | Implementação | Testes que Garantem |
|---|-----------|--------|---------------|---------------------|
| 1 | `GET /services` — lista de serviços | **Cumprido** | `ServiceController@index` + `ServiceResource` | `test_it_lists_all_active_services`, `test_it_returns_empty_array_when_no_services` |
| 2 | `POST /appointments` — criar agendamento | **Cumprido** | `AppointmentController@store` + `AppointmentService` | `test_it_creates_appointment_with_valid_data` |
| 3 | `GET /appointments` — listar agendamentos | **Cumprido** | `AppointmentController@index` + `AppointmentResource` | `test_it_lists_appointments_with_service_data` |
| 4 | Serviço: id, nome, duração | **Cumprido** | Migration `services`: `id`, `name`, `duration_min` | Validação estrutural nos testes de listagem |
| 5 | Agendamento: id, nome_cliente, serviço_id, data_hora | **Cumprido** | Migration `appointments`: `id`, `client_name`, `service_id`, `starts_at` | `AppointmentResource` expõe `data_hora` como alias de `starts_at` |

### Regras de Negócio

| # | Regra | Status | Implementação | Testes que Garantem |
|---|-------|--------|---------------|---------------------|
| 6 | Não permitir horários já ocupados | **Cumprido** | Overlap query no `AppointmentService` | `test_it_rejects_exact_same_slot`, `test_it_rejects_overlapping_start`, `test_it_rejects_contained_within_existing`, `test_it_rejects_encompassing_existing` |
| 7 | Horário comercial 08:00–18:00 | **Cumprido** | `StoreAppointmentRequest` + `AppointmentService` | `test_it_rejects_before_business_hours`, `test_it_rejects_after_business_hours`, `test_it_rejects_at_exact_closing`, `test_it_rejects_service_exceeding_business_hours` |
| 8 | Validar campos obrigatórios | **Cumprido** | `StoreAppointmentRequest` (Form Request) | `test_it_rejects_missing_client_name`, `test_it_rejects_missing_service_id`, `test_it_rejects_missing_starts_at` |
| 9 | Retornar erros claros (JSON) | **Cumprido** | Exception handler + API Resources + status codes | Todos os testes de rejeição validam status codes e estrutura JSON |

### Frontend — Requisitos Obrigatórios

| # | Requisito | Status | Implementação |
|---|-----------|--------|---------------|
| 10 | Lista de serviços | **Cumprido** | `ServiceSelector.tsx` — grid com ícones, busca, loading skeleton |
| 11 | Formulário: Nome, Serviço (select), Data/Hora | **Cumprido** | `AppointmentForm.tsx` — wizard 3 etapas com calendário e time slots |
| 12 | Mensagem de sucesso ou erro | **Cumprido** | `Toast.tsx` — glass morphism, auto-dismiss, progress bar |

### Diferenciais (Não Obrigatórios)

| # | Diferencial | Status | Implementação | Justificativa |
|---|------------|--------|---------------|---------------|
| 13 | Integração com API externa (confirmação) | **Cumprido** | `AppointmentConfirmation` Notification via `mail` channel (com `MAIL_MAILER=log`) | Simula envio de confirmação; o log registra a notificação como se fosse um e-mail |
| 14 | Uso de Docker | **Cumprido** | `docker-compose.yml` com 4 serviços + `docker-compose.prod.yml` | Ambiente reproduzível, zero dependência local |
| 15 | Autenticação simples | **Cumprido** | Laravel Sanctum — login/logout + proteção de rotas POST/DELETE | Token-based, stateless, padrão Laravel |
| 16 | UI minimamente agradável | **Cumprido** | Tailwind CSS, glass morphism, animações, responsivo | Design system coeso com paleta brand/accent/surface |

---

## Decisões Técnicas

### Arquitetura: Por que Service Layer e não Repository?

| Decisão | Por quê | Onde |
|---------|---------|-----|
| **Service Layer** | Centraliza regras de negócio (cálculo de `ends_at`, detecção de overlap, disparo de notification) fora do controller. O controller fica apenas com orquestração HTTP. | `app/Services/AppointmentService.php` |
| **Sem Repository** | Para 2 models com queries simples, o Repository adiciona indireção sem valor. O Eloquent já é o data access layer. | — |
| **Form Request** | Isola toda validação de input em classe testável e reutilizável. Nenhuma validação inline no controller. | `app/Http/Requests/StoreAppointmentRequest.php` |
| **API Resources** | Controla a serialização JSON. O campo interno `starts_at` é exposto também como `data_hora` para compatibilidade com o escopo solicitado. | `app/Http/Resources/AppointmentResource.php` |
| **Custom Exception** | `SlotUnavailableException` é mapeada para HTTP 409 no `bootstrap/app.php`. Separa a semântica de negócio (slot ocupado) do código HTTP. | `app/Exceptions/SlotUnavailableException.php` |
| **BusinessHours Enum** | Elimina magic numbers (`8`, `18`) no código. Qualquer mudança de horário comercial é centralizada. | `app/Enums/BusinessHours.php` |

### Banco de Dados: Por que `starts_at` + `ends_at` + `duration_snapshot`?

| Campo | Por quê |
|-------|---------|
| `starts_at` | Nome técnico mais preciso que `data_hora`. O Resource mapeia ambos. |
| `ends_at` | Calculado no Service (`starts_at + duration_min`). Permite overlap queries eficientes sem recalcular em runtime. |
| `duration_snapshot` | Congela a duração do serviço no momento do agendamento. Se o serviço mudar de 30 para 45 minutos, agendamentos antigos não são afetados. |
| `active` (services) | Soft control: serviços inativos não aparecem para booking, mas agendamentos históricos mantêm o vínculo. Sem cascade delete. |
| `INDEX (starts_at, ends_at)` | Performance: a overlap query faz range scan nessas colunas. Essencial em tabelas com alto volume. |

### Por que não `EXCLUDE USING gist`?

A exclusion constraint do PostgreSQL com `btree_gist` garantiria integridade de overlap no nível do banco. Foi **removida do escopo** porque:

1. **Requer extensão** (`btree_gist`) — complicaria setup em ambientes sem acesso admin ao PostgreSQL
2. **PostgreSQL-only** — tornaria o schema não-portável
3. **Duplicação** — a validação já existe no Service Layer com cobertura de testes

Em produção, seria a **primeira melhoria**: a constraint no banco é a última linha de defesa contra race conditions em alta concorrência.

---

## Lógica de Agendamento — Detalhamento

### Detecção de Overlap (Sobreposição)

O algoritmo central está em `AppointmentService.php`:

```php
$conflict = Appointment::where('starts_at', '<', $endsAt)
                       ->where('ends_at', '>', $startsAt)
                       ->exists();
```

**Lógica**: `novo_início < existente_fim AND novo_fim > existente_início`

Essa condição cobre **todos os cenários de sobreposição**:

| Cenário | Existente | Novo | Resultado | Teste |
|---------|-----------|------|-----------|-------|
| Slot idêntico | 10:00–10:30 | 10:00–10:30 | **409 Conflito** | `test_it_rejects_exact_same_slot` |
| Overlap parcial (início) | 10:00–11:00 | 10:30–11:30 | **409 Conflito** | `test_it_rejects_overlapping_start` |
| Contido dentro do existente | 10:00–12:00 | 10:30–11:00 | **409 Conflito** | `test_it_rejects_contained_within_existing` |
| Engloba o existente | 10:30–11:00 | 10:00–12:00 | **409 Conflito** | `test_it_rejects_encompassing_existing` |
| **Adjacente** (borda) | 10:00–10:30 | 10:30–11:00 | **201 Permitido** | `test_it_allows_adjacent_appointments` |
| Mesmo dia, sem overlap | 10:00–10:30 | 14:00–14:30 | **201 Permitido** | `test_it_allows_non_overlapping_same_day` |
| Mesmo horário, datas diferentes | 15/12 10:00 | 16/12 10:00 | **201 Permitido** | `test_it_allows_same_time_different_dates` |

**Por que adjacente não é conflito?**
Quando `B.starts_at == A.ends_at` (10:30 == 10:30), a condição `B.starts_at < A.ends_at` é **falsa** (não é estritamente menor). Portanto o `WHERE` não retorna resultado e o agendamento é permitido.

### Validação de Horário Comercial

A validação acontece em **duas camadas**:

1. **Form Request** (`StoreAppointmentRequest`): Verifica se o `starts_at` está dentro de 08:00–17:59
2. **Service Layer** (`AppointmentService`): Verifica se o `ends_at` (início + duração) não excede 18:00

```
Exemplo crítico:
  Serviço: Hidratação Capilar (60 min)
  starts_at: 17:30 → passa no Form Request (17 < 18)
  ends_at:   18:30 → REJEITADO no Service Layer (ultrapassa 18:00)
  Resultado: 422 Unprocessable Entity
```

Esse edge case é coberto por `test_it_rejects_service_exceeding_business_hours`.

### Fluxo Completo de Criação

```
1. Request POST /api/appointments
   ↓
2. Middleware auth:sanctum → 401 se sem token
   ↓
3. StoreAppointmentRequest
   ├── client_name: required, string, max:255
   ├── service_id:  required, exists(services.id WHERE active=true)
   ├── starts_at:   required, format Y-m-d H:i:s, after:now
   └── after: hora >= 08 e hora < 18 → 422 se fora
   ↓
4. AppointmentService::create()
   ├── Busca service → calcula ends_at
   ├── Valida ends_at <= 18:00 → 422 se excede
   ├── Query overlap → 409 se conflito
   ├── Persiste appointment com duration_snapshot
   └── Dispara AppointmentConfirmation (notification)
   ↓
5. AppointmentResource → 201 JSON
```

---

## Autenticação e Painel Admin

### Sanctum — Token-Based Auth

O sistema implementa autenticação via Laravel Sanctum com tokens de API:

- **Rotas públicas**: `GET /api/services`, `GET /api/appointments`, `POST /api/auth/login`
- **Rotas protegidas**: `POST /api/appointments`, `DELETE /api/appointments/{id}`, `POST /api/auth/logout`

### Credenciais do Seed

| Campo | Valor |
|-------|-------|
| Nome | Admin vitabe |
| E-mail | `admin@vitabe.com` |
| Senha | `vitabe@2026` |

O seed também cria um token de desenvolvimento (`vitabe-dev-token`) usado pelo frontend em modo público para criar agendamentos sem login.

### Modos do Frontend

| Modo | Acesso | Funcionalidades |
|------|--------|-----------------|
| **Público** | Sem login | Agendar serviço (wizard 3 etapas) + ver histórico |
| **Admin** | Login com e-mail/senha | Visualizar todos os agendamentos + excluir agendamentos |

O botão **"Admin"** no header abre um modal de login. Após autenticação, o token do Sanctum é armazenado no `localStorage` e enviado em todas as requisições via `Authorization: Bearer`.

---

## Frontend — Design System

### Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `brand` | `#00285c` | Header, botões primários, elementos selecionados, badges |
| `accent-500` | `#F97316` | Focus rings, progress bars, seleção de texto |
| `accent-50` → `accent-700` | Orange scale | Estados hover, backgrounds leves, gradientes |
| `surface-0` | `#FFFFFF` | Cards, inputs |
| `surface-50` | `#FAFAF9` | Background principal |
| `surface-100` | `#F5F4F2` | Body background |
| `surface-200` → `surface-400` | Warm neutrals | Bordas, dividers, texto secundário |
| `surface-500` → `surface-700` | Dark neutrals | Texto terciário, ícones |
| `surface-800` → `surface-900` | `#292524` → `#1C1917` | Texto principal |
| `selected-bg` | `#1C1917` | Estado selecionado (cards de serviço) |

### Tipografia

- **Font**: Inter (Google Fonts) — pesos 300, 400, 500, 600, 700
- **Fallback**: system-ui → -apple-system → sans-serif

### Componentes Visuais

| Componente | Características |
|-----------|-----------------|
| **Cards** | Glass morphism (`backdrop-blur: 12px`, `background: rgba(255,255,255,0.80)`), bordas sutis, hover com elevação |
| **Inputs** | Border radius 12px, focus ring laranja, estado de erro vermelho |
| **Botões** | Primary (navy com shadow), Ghost (transparente com borda), estados disabled |
| **Toast** | Glass effect, auto-dismiss com progress bar animada, tipos: success/error/warning |
| **Skeleton** | Shimmer animation para loading states |
| **Step Indicator** | Circles numerados com progress line animada, checkmarks em steps completos |
| **Calendar** | Grid 7 colunas, today highlight (blue ring), selected (navy bg), past dates disabled |
| **Time Slots** | Grid responsiva, slots calculados pela duração do serviço, seleção com navy bg |
| **Service Cards** | Grid com ícones SVG por categoria, search filter, seleção com checkmark |

### Animações

| Nome | Efeito | Duração |
|------|--------|---------|
| `fade-in` | Opacity 0→1 | 250ms |
| `slide-up` | Translate Y 6px→0 + fade | 300ms |
| `scale-in` | Scale 0.92→1 + fade | 200ms |
| `shimmer` | Gradient sweep | 1.8s loop |
| `progress` | ScaleX 1→0 | Configurável via CSS var |
| `stagger-delay` | Delay escalonado via `--stagger-delay` | 40ms por item |

### Responsividade

- **Mobile-first** com breakpoints Tailwind
- Calendar: stacked em mobile, side-by-side em desktop
- Service grid: 2 colunas mobile, 3 colunas desktop
- Time slots: 2 colunas mobile, 1 coluna desktop (sidebar)
- Header: nome do admin oculto em mobile

---

## Docker — Ambiente de Desenvolvimento e Produção

### Desenvolvimento (`docker-compose.yml`)

4 containers orquestrados:

| Container | Imagem | Porta | Função |
|-----------|--------|-------|--------|
| `php` | PHP 8.3-FPM (custom) | 9000 (interno) | Backend Laravel |
| `nginx` | nginx:alpine | 8000 → 80 | Reverse proxy para PHP-FPM |
| `postgres` | postgres:16-alpine | 5433 → 5432 | Banco de dados principal + testes |
| `node` | node:20-alpine | 5173 → 5173 | Vite dev server (HMR) |

### Produção (`docker-compose.prod.yml`)

Overlay sobre o compose de desenvolvimento:

- **Nginx** na porta **80** serve o frontend buildado (`frontend/dist/`) como SPA estática
- Requisições `/api/*` são proxiadas para o PHP-FPM
- Container `node` é **desabilitado** (frontend é pré-buildado)
- PHP roda com `APP_ENV=production` e `APP_DEBUG=false`
- Assets estáticos com cache de 30 dias (`Cache-Control: public, immutable`)

```bash
# Build do frontend + subir em modo produção
make prod-up

# Acesse http://localhost (porta 80)
```

### Dockerfile PHP

- Base: `php:8.3-fpm`
- Extensões: `pdo`, `pdo_pgsql`, `pgsql`, `bcmath`
- Composer instalado via multi-stage copy

---

## Testes — Cobertura e Estratégia

### Abordagem: Feature Tests com PHPUnit

22 testes feature que validam o sistema end-to-end através da API HTTP. Nenhum teste unitário isolado — os feature tests já cobrem Models, Services, Requests e Controllers em conjunto.

```bash
make test
# ou filtrado:
docker exec php php artisan test --filter=it_allows_adjacent
```

### Mapeamento: Teste x Requisito

| Teste | Status HTTP | Valida |
|-------|------------|--------|
| `test_it_lists_all_active_services` | 200 | Endpoint GET /services + filtro active |
| `test_it_returns_empty_array_when_no_services` | 200 | Resposta vazia padronizada |
| `test_it_creates_appointment_with_valid_data` | 201 | Happy path + ends_at + duration_snapshot + notification |
| `test_it_lists_appointments_with_service_data` | 200 | Eager loading de service no listing |
| `test_it_rejects_unauthenticated_request` | 401 | Sanctum protege POST |
| `test_it_rejects_missing_client_name` | 422 | Validação required |
| `test_it_rejects_missing_service_id` | 422 | Validação required |
| `test_it_rejects_missing_starts_at` | 422 | Validação required |
| `test_it_rejects_nonexistent_service_id` | 422 | Validação exists |
| `test_it_rejects_invalid_datetime_format` | 422 | Validação date_format |
| `test_it_rejects_past_datetime` | 422 | Validação after:now |
| `test_it_rejects_inactive_service` | 422 | Validação exists + active |
| `test_it_rejects_before_business_hours` | 422 | 07:30 < 08:00 |
| `test_it_rejects_after_business_hours` | 422 | 18:30 >= 18:00 |
| `test_it_rejects_at_exact_closing` | 422 | 18:00 = closing |
| `test_it_rejects_service_exceeding_business_hours` | 422 | 60min @ 17:30 → ends_at 18:30 |
| `test_it_rejects_exact_same_slot` | 409 | Overlap idêntico |
| `test_it_rejects_overlapping_start` | 409 | Overlap parcial |
| `test_it_rejects_contained_within_existing` | 409 | Novo contido no existente |
| `test_it_rejects_encompassing_existing` | 409 | Novo engloba existente |
| `test_it_allows_adjacent_appointments` | 201 | Edge case: adjacente NÃO é overlap |
| `test_it_allows_non_overlapping_same_day` | 201 | Mesmo dia, horários distantes |
| `test_it_allows_same_time_different_dates` | 201 | Mesmo horário, datas diferentes |

---

## Entregas Adicionais (Fora do Escopo)

| Entrega | O que é | Por que foi incluída |
|---------|---------|---------------------|
| `duration_snapshot` | Coluna que congela a duração do serviço no momento do agendamento | **Imutabilidade**: se o salão alterar a duração de "Corte Masculino" de 30 para 45 min, agendamentos passados não são afetados |
| `ends_at` calculado | Campo derivado de `starts_at + duration_min` | **Performance**: overlap queries sem recalcular em runtime; indexado com `starts_at` |
| `active` flag em services | Boolean para controlar disponibilidade sem deletar | **Integridade referencial**: serviços vinculados a agendamentos não podem ser deletados; `active=false` os remove da listagem |
| Feature tests PHPUnit | 22 testes cobrindo happy paths, validações, business hours e overlaps | **Confiança**: demonstra disciplina de engenharia; qualquer refactor futuro é protegido |
| `BusinessHours` Enum | Constantes tipadas para horários de funcionamento | **Legibilidade**: sem magic numbers `8` e `18` espalhados pelo código |
| `AppointmentConfirmation` | Notification Laravel disparada após agendamento | **Diferencial**: simula integração com API externa de confirmação |
| Banco de testes isolado | `vitabe_test` via init.sql do PostgreSQL | **DX**: testes não destroem dados de desenvolvimento |
| `docker-compose.prod.yml` | Overlay para produção | **Deploy-ready**: frontend buildado servido via Nginx na porta 80 |
| Modo Admin no frontend | Login/logout com Sanctum + exclusão de agendamentos | **Diferencial**: autenticação simples com UX completa |
| `DELETE /appointments/{id}` | Endpoint de exclusão protegido por auth | **Gestão**: admin pode remover agendamentos |
| Wizard 3 etapas | Formulário progressivo com step indicator | **UX**: reduz carga cognitiva, guia o usuário pelo fluxo |
| Glass morphism design | Cards com backdrop-blur, transparência, sombras | **UI premium**: visual contemporâneo e agradável |
| Skeleton loading | Shimmer animation durante carregamento | **Percepção**: feedback visual imediato, reduz sensação de lentidão |
| Error translation (frontend) | Mapeamento de mensagens Laravel → pt-BR no cliente | **Acessibilidade linguística**: erros técnicos traduzidos para linguagem humana amigável |

---

## Melhorias Futuras (Cenário de Produção)

| Melhoria | Impacto | Complexidade |
|----------|---------|-------------|
| `EXCLUDE USING gist` (PostgreSQL) | Integridade de overlap no banco — proteção contra race conditions | Média |
| Cache de serviços (Redis) | Reduz queries no endpoint mais acessado | Baixa |
| Rate limiting | Proteção contra abuso na API | Baixa |
| Testes E2E (Cypress/Playwright) | Validação do fluxo completo no browser | Alta |
| RBAC (Roles & Permissions) | Controle granular de acesso (admin, atendente, cliente) | Média |
| Queue para notifications | Desacoplar envio de confirmação do request cycle | Baixa |
| Paginação | Performance com alto volume de agendamentos | Baixa |
| Soft delete em appointments | Auditoria e recuperação de dados | Baixa |
| CI/CD pipeline | Testes automáticos + deploy | Média |
| Validação de fim de semana | Bloquear sábado/domingo (fora do escopo atual) | Baixa |
| Multi-profissional | Agenda por profissional, não global | Alta |

---

## Tempo de Desenvolvimento

| Frente | Estimativa |
|--------|-----------|
| Planejamento e documentação | ~1h |
| Docker + Makefile | ~1h |
| Migrations + Models + Seeders | ~30min |
| Feature tests (red phase) | ~1h30 |
| Service Layer + Validação (green phase) | ~2h |
| Controllers + Routes + Resources | ~1h |
| Frontend (React + Tailwind) | ~3h |
| Sanctum Auth + Notification | ~1h |
| README + revisão final | ~1h |
| **Total** | **~12h** |
