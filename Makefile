.PHONY: backend frontend storybook db dev start

backend:
	cd backend && go run cmd/main.go

frontend:
	cd frontend && npm run dev

storybook:
	cd frontend && npm run storybook

db:
	docker-compose up

start:
	@echo "Starting backend and frontend in parallel..."
	@concurrently "make backend" "make frontend"
