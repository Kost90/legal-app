# #!/usr/bin/env sh
# set -e

# echo "[$(date)] Waiting for DB ${DB_HOST}:${DB_PORT:-5432} ..."
# # Ждем доступности порта БД
# ATTEMPTS=60
# SLEEP=2
# i=0
# while ! nc -z "${DB_HOST}" "${DB_PORT:-5432}"; do
#   i=$((i+1))
#   if [ "$i" -ge "$ATTEMPTS" ]; then
#     echo "DB is not up after $((ATTEMPTS*SLEEP))s. Giving up."
#     exit 1
#   fi
#   echo "DB not ready yet ($i/$ATTEMPTS). Sleeping ${SLEEP}s..."
#   sleep $SLEEP
# done

# # Если нужно — можно прогонять seed-скрипты здесь же
# echo "[$(date)] Running migrations..."
# npm run migration:run

# echo "[$(date)] Starting NestJS..."
# exec npm run start:prod

#!/bin/sh
set -e

echo "⏳ Waiting for Postgres..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 2
done

echo "🚀 Running migrations..."
npm run migration:run

echo "✅ Starting app..."
npm run start:prod
