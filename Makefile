build:
	npm install
	npm version 0.0.$(BUILD_NUMBER)
	npm publish