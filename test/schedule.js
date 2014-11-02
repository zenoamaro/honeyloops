/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should'),
	HL = require('../honeyloops');


describe('schedule()', function(){

	it('should schedule the function', function(done){
		function probe() {
			done();
		}
		HL.schedule(probe);
	});

	it('should schedule the function only once per frame', function(done){
		var calls = 0;
		function probe() {
			calls++;
			calls.should.be.lessThan(2);
			done();
		}
		HL.schedule(probe);
		HL.schedule(probe);
		HL.schedule(probe);
	});

	it('should schedule the function again once inside a frame', function(done){
		var calls = 0;
		function probe() {
			calls++;
			if (calls === 1) {
				HL.schedule(probe);
				HL.schedule(probe);
				HL.schedule(probe);
			} else {
				calls.should.be.exactly(2);
				done();
			}
		}
		HL.schedule(probe);
		HL.schedule(probe);
		HL.schedule(probe);
	});

	it('should pass the elapsed time to the handler', function(done){
		var startTime = Date.now();
		function probe(elapsed) {
			var reference = Date.now() - startTime;
			elapsed.should.be.approximately(reference, 16);
			done();
		}
		HL.schedule(probe);
	});

});