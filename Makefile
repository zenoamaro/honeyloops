usage:
	@echo build: builds the minified version


build:
	@uglifyjs honeyloops.js -c -m -o honeyloops.min.js