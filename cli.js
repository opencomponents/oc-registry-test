#!/usr/bin/env node

'use strict';

const fs = require('fs');
const Mocha = require('mocha');

const registryTests = new Mocha({
	timeout: 60000,
	reporter: 'spec'
});

fs.readdirSync('./test/')
	.filter(file => file.substr(-3) === '.js')
	.forEach(file => registryTests.addFile(`./test/${file}`));

registryTests.run(() => {
	process.exit(0);
});