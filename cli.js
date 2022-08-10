#!/usr/bin/env node
const Alkimia = require("./index");
const Utilities = require("@intersides/utilities");

//TODO: move it into the InterSides utilities package ?
function extractOptionalArguments(_optionName) {
	let option = null;
	let optionParam = process.argv.filter(_entry => {
		return _entry.search(_optionName) === 0;
	})[0];
	if (optionParam) {
		const value = optionParam.split(_optionName)[1];
		if (Utilities.isNonemptyString(value)) {
			option = value;
		}
	}
	return option;
}

const defaultSourceDir = "src";
const defaultEnvironment = "test";

let userSpecifiedSourceDir = extractOptionalArguments("--srcDir=");
let userSpecifiedEnvironmentVar = extractOptionalArguments("--env=");
if(!userSpecifiedSourceDir){
	console.log(`user has not specified any directory, "${defaultSourceDir}" will be proposed`);
	userSpecifiedSourceDir = defaultSourceDir;
}
if(!userSpecifiedEnvironmentVar){
	console.log(`user has not specified any environment, "${defaultEnvironment}" will be proposed`);
	userSpecifiedEnvironmentVar = defaultEnvironment;
}

let props = {
	srcDir: userSpecifiedSourceDir,
	env: userSpecifiedEnvironmentVar
};



(()=>{
	Alkimia.generateModule(props).then(_userProps=>{
		Alkimia.bundleUp(_userProps);
	}).catch(_exc=>{
		console.error("Failed to generate module");
	});
})();