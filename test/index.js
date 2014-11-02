'use strict';

// Code coverage.
require('blanket')({ pattern: 'honeyloops.js' });

// Run tests.
require('./tag');
require('./schedule');
require('./batch');