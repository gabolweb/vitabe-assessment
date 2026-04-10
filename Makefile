.PHONY: up down fresh test seed logs restart shell lint build

# ---------------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------------
up:
	docker compose up --build -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

# ---------------------------------------------------------------------------
# Backend — Laravel
# ---------------------------------------------------------------------------
fresh:
	docker exec php php artisan key:generate --force
	docker exec php php artisan migrate:fresh --seed

seed:
	docker exec php php artisan db:seed

test:
	docker exec php php artisan test

test-filter:
	@read -p "Filter: " f; docker exec php php artisan test --filter=$$f

shell:
	docker exec -it php bash

lint:
	docker exec php ./vendor/bin/pint --test

# ---------------------------------------------------------------------------
# Frontend — React + Vite
# ---------------------------------------------------------------------------
build:
	docker exec node npm run build

# ---------------------------------------------------------------------------
# Production
# ---------------------------------------------------------------------------
prod-up:
	docker exec node npm run build
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down
