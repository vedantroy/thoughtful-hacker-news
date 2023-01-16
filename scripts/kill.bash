#! /usr/bin/env bash
set -euxo pipefail

fuser -k -n tcp $1