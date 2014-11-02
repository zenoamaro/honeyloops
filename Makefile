LINT=./node_modules/.bin/jshint
LINT_FLAGS=

TEST=./node_modules/.bin/mocha
SPEC_FLAGS=-R spec
COVERAGE_FLAGS=-R mocha-text-cov

MINIFY=./node_modules/.bin/uglifyjs
MINIFY_FLAGS=-c -m --comments '/Honeyloops/'


usage:
	@echo lint: lints the source
	@echo spec: runs the test specs
	@echo coverage: runs the code coverage test
	@echo test: lint, spec and coverage treshold test
	@echo build: builds the minified version

.PHONY: usage test lint


lint:
	@$(LINT) $(LINT_FLAGS) honeyloops.js

spec:
	@$(TEST) $(SPEC_FLAGS) test/index

coverage:
	@$(TEST) $(COVERAGE_FLAGS) test/index

test:
	@make lint
	@make spec SPEC_FLAGS="-R dot"
	@make coverage COVERAGE_FLAGS="-R travis-cov"

build: honeyloops.min.js

honeyloops.min.js: honeyloops.js
	@$(MINIFY) $(MINIFY_FLAGS) -o honeyloops.min.js honeyloops.js

