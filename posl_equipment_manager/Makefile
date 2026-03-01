.DEFAULT_GOAL := help

.PHONY: build
build: ## コンテナをビルド
	docker compose build

.PHONY: up
up: ## 開発コンテナを起動
	docker compose up -d

.PHONY: down
down: ## 開発コンテナを停止
	docker compose down

.PHONY: app
app: ## appコンテナに入る
	docker compose exec app sh

.PHONY: db
db: ## dbコンテナに入る
	docker compose exec db sh

.PHONY: logs
logs: ## 開発コンテナのログを表示
	docker compose logs -f

.PHONY: clean
clean: ## 開発コンテナ、ボリューム（DBデータ）を削除
	docker compose down -v

.PHONY: migrate
migrate: ## Prismaのマイグレーションを実行
	docker compose exec app npx prisma migrate dev --name init

.PHONY: generate
generate: ## Prismaクライアントを生成
	docker compose exec app npx prisma generate

.PHONY: seed
seed: ## PostgreSQLに初期データを投入
	docker compose exec app npx prisma db seed -- --environment development

.PHONY: studio
studio: ## Prisma Studioを起動
	docker compose exec app npx prisma studio --port 5555 --browser none

.PHONY: lint
lint: ## コードのリントを実行
	docker compose exec app npm run lint

.PHONY: format
format: ## コードのフォーマットを実行
	docker compose exec app npm run format

.PHONY: test
test: ## テストを実行
	docker compose exec app npm test

.PHONY: help
help: ## ヘルプを表示
	@echo "Usage: make [target]"
	@echo "targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
