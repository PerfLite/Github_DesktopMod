#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
source "$DIR/venv/bin/activate"
python "$DIR/app.py"
