#!/bin/sh
set -eu

pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
./manage.py migrate
./manage.py runserver 0.0.0.0:8000
