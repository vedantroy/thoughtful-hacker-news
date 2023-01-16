#! /usr/bin/env bash
set -euxo pipefail

set -a
source .env
set +a

curl -X POST -H "admin: $ADMIN_KEY" localhost:3000/api/admin/ingest