#!/usr/bin/env node

'use strict';

const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');

const registryTests = new Mocha({
	timeout: 60000,
	reporter: 'spec'
});

fs.readdirSync(path.join(__dirname, './test/'))
	.filter(file => file.substr(-3) === '.js')
	.forEach(file => registryTests.addFile(path.join(__dirname, `./test/${file}`)));

registryTests.run(() => {
	process.exit(0);
});