TEST=./node_modules/.bin/mocha
TEST_SPEC_FLAGS=-R spec
TEST_COVERAGE_FLAGS=-R mocha-text-cov

LINT=./node_modules/.bin/jshint
LINT_FLAGS=

MINIFY=./node_modules/.bin/uglifyjs
MINIFY_FLAGS=-c -m --comments '/Honeyloops/'


usage:
	@echo lint: lints the source
	@echo spec: runs the test specs
	@echo coverage: runs the code coverage test
	@echo test: lint, spec and coverage
	@echo build: builds the minified version

.PHONY: usage test lint


lint:
	@$(LINT) $(LINT_FLAGS) honeyloops.js

spec:
	@$(TEST) $(TEST_SPEC_FLAGS) test/index

coverage:
	@$(TEST) $(TEST_COVERAGE_FLAGS) test/index

test:
	@make lint
	@make spec
	@make coverage


build: honeyloops.min.js

honeyloops.min.js: honeyloops.js
	@$(MINIFY) $(MINIFY_FLAGS) -o honeyloops.min.js honeyloops.js

