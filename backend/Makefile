# Makefile for Django backend using uv

# Variables
VENV := .venv
PYTHON := $(VENV)/bin/python3
PIP := $(VENV)/bin/pip3
MANAGE := $(PYTHON) manage.py
REQS := requirements.txt

# Create virtual environment
venv:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip setuptools wheel

# Install dependencies
install: venv
	$(PIP) install -r $(REQS)

# Sync dependencies
sync-reqs:
	$(PIP) freeze > $(REQS)
	@echo "requirements.txt updated"

# Collect static files
collect-static:
	$(MANAGE) collectstatic --noinput

# Migrate
migrate:
	$(MANAGE) migrate

# Run local server
run:
	$(MANAGE) runserver

# Create new Django app
newapp:
	@read -p "App name: " appname; \
	$(MANAGE) startapp $$appname
