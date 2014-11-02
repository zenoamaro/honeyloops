/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should'),
	sinon = require('sinon'),
	HL = require('../honeyloops');


describe('schedule()', function(){

	it('should schedule the function', function(done){
		var probe = sinon.spy(function(){
			probe.callCount.should.be.exactly(1);
			done();
		});
		HL.schedule(probe);
	});

	it('should schedule the function only once per frame', function(done){
		var probe = sinon.spy(function(){
			probe.callCount.should.be.exactly(1);
			done();
		});
		HL.schedule(probe);
		HL.schedule(probe);
		HL.schedule(probe);
	});

	it('should replace the previous schedule for a handler', function(done){
		var probeA = sinon.spy(function(){
			probeA.callCount.should.be.exactly(0);
			done();
		});
		var probeB = sinon.spy(function(){
			probeB.callCount.should.be.exactly(1);
			done();
		});
		// Tag handlers the same.
		HL.tag(probeB, HL.tag(probeA));
		HL.schedule(probeA);
		HL.schedule(probeB);
	});

	it('should schedule the function again once inside a frame', function(done){
		var probe = sinon.spy(function(){
			if (probe.calledOnce) {
				HL.schedule(probe);
				HL.schedule(probe);
				HL.schedule(probe);
			} else {
				probe.callCount.should.be.exactly(2);
				done();
			}
		});
		HL.schedule(probe);
		HL.schedule(probe);
		HL.schedule(probe);
	});

	it('should pass the elapsed time to the handler', function(done){
		function probe(elapsed) {
			var reference = Date.now() - startTime;
			elapsed.should.be.approximately(reference, 16);
			done();
		}
		var startTime = Date.now();
		HL.schedule(probe);
	});

});