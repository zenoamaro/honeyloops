JSHINT=./node_modules/.bin/jshint
UGLIFYJS=./node_modules/.bin/uglifyjs
UGLIFYJS_FLAGS=-c -m --comments '/Honeyloops/'

usage:
	@echo lint: lints the source
	@echo build: builds the minified version

lint:
	$(JSHINT) honeyloops.js

build: honeyloops.min.js

honeyloops.min.js: honeyloops.js
	$(UGLIFYJS) $(UGLIFYJS_FLAGS) -o honeyloops.min.js honeyloops.js