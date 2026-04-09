.PHONY: up down fresh test seed logs

up:
	docker compose up --build -d

down:
	docker compose down

fresh:
	docker exec php php artisan key:generate --force
	docker exec php php artisan migrate:fresh --seed

test:
	docker exec php php artisan test

seed:
	docker exec php php artisan db:seed

logs:
	docker compose logs -f
