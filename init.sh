#!/bin/bash
echo "Cleaning up old data..."
rm -rf /var/lib/postgresql/data/*
echo "Starting replication..."
PGPASSWORD=password pg_basebackup -h db-master -p 5432 -U replicator -D /var/lib/postgresql/data -Fp -Xs -P -R
echo "Starting PostgreSQL..."
docker-entrypoint.sh postgres