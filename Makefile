.PHONY: lint build test

lint:
	cd ../.. && npm run lint -- --filter=customizacao

build:
	cd ../.. && npm run build

test:
	cd ../.. && npm test -- --filter=customizacao
