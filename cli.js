#!/usr/bin/env node

const createComponent = require("./index");

(async ()=>{
	await createComponent(process.argv[2]);
})();

