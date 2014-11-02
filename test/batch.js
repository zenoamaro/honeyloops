/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should'),
	sinon = require('sinon'),
	HL = require('../honeyloops');


describe('batch()', function(){

	it('should return a wrapped function', function(){
		function probe() { /* ... */ }
		var batched = HL.batch(probe);
		batched.should.be.a.Function;
	});

	it('should schedule the execution of the handler', function(done){
		function probe() { done() }
		var batched = HL.batch(probe);
		batched();
	});

	it('should schedule only one execution per frame', function(done){
		var probe = sinon.spy(function(){
			probe.callCount.should.be.exactly(1);
			done();
		});
		var batched = HL.batch(probe);
		batched();
		batched();
		batched();
	});

	it('should schedule the function again once inside a frame', function(done){
		var probe = sinon.spy(function(){
			if (probe.calledOnce) {
				batched();
				batched();
				batched();
			} else {
				probe.callCount.should.be.exactly(2);
				done();
			}
		});
		var batched = HL.batch(probe);
		batched();
		batched();
		batched();
	});

	it('should pass the elapsed time to the handler', function(done){
		var batched = HL.batch(function(elapsed){
			elapsed.should.be.above(1);
			done();
		});
		batched();
	});

	it('should pass all arguments to the handler', function(done){
		var probe = sinon.spy(function(a, b, elapsed){
			probe.calledWith(probeA, probeB).should.be.ok;
			elapsed.should.be.above(1);
			done();
		});
		var probeA = {},
			probeB = {};
		var batched = HL.batch(probe);
		batched(probeA, probeB);
	});

	it('should be bound to the right context', function(done){
		var probe = sinon.spy(function(){
			probe.calledOn(context).should.be.ok;
			done();
		});
		var context = {};
		var batched = HL.batch(probe, context);
		batched();
	});

});