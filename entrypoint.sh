#!/usr/bin/env sh
set -e

echo "[$(date)] Waiting for DB ${DB_HOST}:${DB_PORT:-5432} ..."
# Ждем доступности порта БД
ATTEMPTS=60
SLEEP=2
i=0
while ! nc -z "${DB_HOST}" "${DB_PORT:-5432}"; do
  i=$((i+1))
  if [ "$i" -ge "$ATTEMPTS" ]; then
    echo "DB is not up after $((ATTEMPTS*SLEEP))s. Giving up."
    exit 1
  fi
  echo "DB not ready yet ($i/$ATTEMPTS). Sleeping ${SLEEP}s..."
  sleep $SLEEP
done

# Если нужно — можно прогонять seed-скрипты здесь же
echo "[$(date)] Running migrations..."
npm run migration:run

echo "[$(date)] Starting NestJS..."
exec npm run start:prod

# # new gpt:
# #!/usr/bin/env sh
# set -e

# echo "➡️  Waiting for database $DB_HOST:$DB_PORT ..."
# # Ждём готовности Postgres
# until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE"; do
#   echo "⏳ Postgres is unavailable - sleeping"
#   sleep 2
# done
# echo "✅ Postgres is ready"

# # Обновим схему перед каждым стартом
# echo "➡️  Running migrations..."
# npm run migration:run

# # Если в коде не учтены аргументы puppeteer — подхватываем их через env
# export PUPPETEER_ARGS="${PUPPETEER_ARGS}"

# echo "🚀 Starting NestJS on port ${PORT:-3030}"
# exec npm run start:prod