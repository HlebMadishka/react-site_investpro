# Backend

## Запуск базы через Docker

```bash
docker compose up -d db
```

## Запуск проекта

```bash
npm run dev
```

React откроется на `http://localhost:5173`, API будет на `http://localhost:4000`.

## Проверка API

```bash
curl http://localhost:4000/api/health
```

## Подключение другой PostgreSQL базы

Поменяй `DATABASE_URL` в `.env`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
```

Схема лежит в `server/schema.sql`. При старте backend сам создаёт таблицы `investment_plans` и `leads`, если их ещё нет.
