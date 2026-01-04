.PHONY: dev build serve install clean stop tunnel deploy

# Development server with hot reload
dev: stop
	cd imposter-game && pnpm dev

# Build static export
build:
	cd imposter-game && pnpm build

# Serve the built static files locally
serve: stop build
	cd imposter-game/out && python3 -m http.server 3000

# Install dependencies
install:
	cd imposter-game && pnpm install

# Clean build artifacts
clean:
	rm -rf imposter-game/out imposter-game/.next

# Stop any process on port 3000
stop:
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Expose local server via ngrok for phone testing
tunnel:
	ngrok http 3000

# Deploy to Vercel (first run: vercel login)
deploy:
	cd imposter-game && vercel --prod
