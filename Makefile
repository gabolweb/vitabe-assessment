.PHONY: up down fresh install test seed logs restart shell lint build prod-up prod-down prod-seed reset prod-reset

# ---------------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------------
up:
	docker compose up --build -d

down:
	docker compose down

reset:
	docker compose down -v --rmi local
	rm -f backend/.env frontend/.env

restart:
	docker compose restart

logs:
	docker compose logs -f

# ---------------------------------------------------------------------------
# Backend — Laravel
# ---------------------------------------------------------------------------
install:
	docker exec php composer install
	docker exec node npm install

fresh:
	docker exec php cp .env.example .env
	docker exec node cp .env.example .env
	docker exec php composer install
	docker exec node npm install
	docker exec php php artisan key:generate --force
	docker exec php php artisan migrate:fresh --seed

seed:
	docker exec php php artisan db:seed --force

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
	docker compose up -d php postgres node
	@echo "Waiting for database..."
	@docker exec php sh -c 'until php artisan db:monitor --databases=pgsql; do sleep 1; done'
	docker exec php cp .env.example .env
	docker exec node cp .env.example .env
	docker exec php php artisan key:generate --force
	docker exec php composer install --no-dev --optimize-autoloader
	docker exec php php artisan migrate --force
	docker exec node npm install
	docker exec node npm run build
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
	docker exec php php artisan config:cache
	docker exec php php artisan route:cache

prod-seed: seed

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-reset:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --rmi local
	rm -f backend/.env frontend/.env
