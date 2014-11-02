/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should'),
	HL = require('../honeyloops');


describe('batch()', function(){

	it('should return a wrapped function', function(){
		function probe() { /* ... */ }
		var batched = HL.batch(probe);
		batched.should.be.a.Function;
	});

	it('should schedule an execution', function(done){
		function probe() { done() }
		var batched = HL.batch(probe);
		batched();
	});

	it('should schedule only one execution', function(done){
		var calls = 0;
		function probe() {
			calls++;
			calls.should.be.exactly(1);
			done();
		}
		var batched = HL.batch(probe);
		batched();
		batched();
	});

	it('should schedule the function again once inside a frame', function(done){
		var calls = 0;
		function probe() {
			calls++;
			if (calls === 1) {
				batched();
				batched();
				batched();
			} else {
				calls.should.be.exactly(2);
				done();
			}
		}
		var batched = HL.batch(probe);
		batched();
		batched();
		batched();
	});

	it('should pass the elapsed time to the handler', function(done){
		function probe(elapsed) {
			elapsed.should.be.above(1);
			done();
		}
		var batched = HL.batch(probe);
		batched();
	});

	it('should pass all arguments to the handler', function(done){
		var probeA = {},
			probeB = {};
		function probe(a, b, elapsed) {
			a.should.be.exactly(probeA);
			b.should.be.exactly(probeB);
			elapsed.should.be.above(1);
			done();
		}
		var batched = HL.batch(probe);
		batched(probeA, probeB);
	});

	it('should be bound to the right context', function(done){
		var context = {};
		function probe() {
			/* jshint validthis: true */
			this.should.be.exactly(context);
			done();
		}
		var batched = HL.batch(probe, context);
		batched();
	});

});