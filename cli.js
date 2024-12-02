#!/usr/bin/env node
import AlkimiaFramework from "./index.js";
import Alkimia from"@alkimia/utilities";
const Utilities = Alkimia.Utilities;

//TODO: move it into the InterSides utilities package ?
function extractOptionalArguments(_optionName) {
  let option = null;
  const optionParam = process.argv.filter(_entry => {
    return _entry.search(_optionName) === 0;
  })[0];
  if (optionParam) {
    let value = optionParam.split(_optionName)[1];
    if (Utilities.isNonemptyString(value)) {
      //convert string "true" or "false" into boolean true or false
      const isBoolean = (/^(true|false)$/i).test(value);
      if(isBoolean){
        value = value === "true";
      }
      option = value;
    }
  }
  return option;
}

const defaultSourceDir = "src";
const defaultEnvironment = "test";
const defaultPlaygroundSupport = false;

let userSpecifiedSourceDir = extractOptionalArguments("--srcDir=");
if(!userSpecifiedSourceDir){
  console.log(`user has not specified any directory, "${defaultSourceDir}" will be proposed`);
  userSpecifiedSourceDir = defaultSourceDir;
}

let userSpecifiedEnvironmentVar = extractOptionalArguments("--env=");
if(!userSpecifiedEnvironmentVar){
  console.log(`user has not specified any environment, "${defaultEnvironment}" will be proposed`);
  userSpecifiedEnvironmentVar = defaultEnvironment;
}

let userSpecifiedPlaygroundSupport = extractOptionalArguments("--withPlayground=");
if(!userSpecifiedPlaygroundSupport){
  console.log(`user has not specified if want to add playground support, defaulting to : "${defaultPlaygroundSupport}"`);
  userSpecifiedPlaygroundSupport = defaultPlaygroundSupport;
}

const props = {
  srcDir: userSpecifiedSourceDir,
  env: userSpecifiedEnvironmentVar,
  withPlayground: userSpecifiedPlaygroundSupport
};


(()=>{
  AlkimiaFramework.generateModule(props).then(_userProps=>{
    // Alkimia.bundleUp(_userProps);
  }).catch(_exc=>{
    console.error("Failed to generate module");
  });
})();
