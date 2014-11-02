/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should'),
	HL = require('../honeyloops');


describe('tag()', function(){

	it('should tag a function', function(){
		function probe() { /* ... */ }
		var uid = HL.tag(probe);
		should(uid).be.ok;
	});

	it('should tag a function with a given id', function(){
		function probe() { /* ... */ }
		var uidA = HL.tag(probe, 'my-uid'),
			uidB = HL.tag(probe),
			uidC = HL.tag(probe, 'my-new-uid'),
			uidD = HL.tag(probe);
		// Test generation and attachment.
		uidA.should.be.exactly(uidB);
		uidC.should.be.exactly(uidD);
		// Test that custom id always replaces.
		uidA.should.not.be.exactly(uidC);
	});

	it('should return the same tag for the same function', function(){
		function probe() { /* ... */ }
		var uidA = HL.tag(probe),
			uidB = HL.tag(probe);
		uidA.should.be.exactly(uidB);
	});

	it('should not return the same tag for different functions', function(){
		function probeA() { /* ... */ }
		function probeB() { /* ... */ }
		var uidA = HL.tag(probeA),
			uidB = HL.tag(probeB);
		uidA.should.not.be.exactly(uidB);
	});

	it('should not alter the behavior of the function', function(){
		function probe() { value += 1 }
		var value = 1;
		HL.tag(probe);
		probe();
		value.should.be.exactly(2);
	});

});