MOCHA=./node_modules/.bin/mocha
MOCHA_FLAGS=
JSHINT=./node_modules/.bin/jshint
JSHINT_FLAGS=
UGLIFYJS=./node_modules/.bin/uglifyjs
UGLIFYJS_FLAGS=-c -m --comments '/Honeyloops/'

.PHONY: usage test lint

usage:
	@echo lint: lints the source
	@echo test: runs the test suite
	@echo build: builds the minified version

test:
	$(MOCHA) $(MOCHA_FLAGS) test/index

lint:
	$(JSHINT) $(JSHINT_FLAGS) honeyloops.js

build: honeyloops.min.js

honeyloops.min.js: honeyloops.js
	$(UGLIFYJS) $(UGLIFYJS_FLAGS) -o honeyloops.min.js honeyloops.js