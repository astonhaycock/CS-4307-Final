.PHONY: setup build serve

all: setup build serve

setup:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

build: setup
	@echo "Building frontend..."
	cd frontend && npm run build

serve: build
	@echo "Serving frontend and starting backend..."
	cd frontend && (serve -s build &)
	node index.js

clean:
	@echo "Cleaning up..."
	rm -rf frontend/build
	rm -rf frontend/node_modules
	