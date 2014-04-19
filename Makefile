UGLIFYJS=uglifyjs
UGLIFYJS_FLAGS=-c -m --comments '/Honeyloops/'

usage:
	@echo build: builds the minified version

build: honeyloops.min.js

honeyloops.min.js: honeyloops.js
	$(UGLIFYJS) $(UGLIFYJS_FLAGS) -o honeyloops.min.js honeyloops.js