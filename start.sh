#!/bin/sh
set -e

timeout 60 node node_modules/prisma/build/index.js migrate deploy >/tmp/migrate.log 2>&1 &
MIGRATE_PID=$!

HOSTNAME=0.0.0.0 PORT=3000 node server.js

wait $MIGRATE_PID || true
