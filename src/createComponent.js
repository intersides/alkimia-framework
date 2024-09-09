"use strict";
const prompts = require("prompts");
const fs = require("js-better-fs");
const path = require("path");
const Utilities = require("@alkimia/utilities");
const {
  moduleMaker,
  scss,
  playgroundHtml,
  playgroundJS
} = require("./modulesMaker");

function createComponent(_props){
  let props = {
    srcDir: "app",
    env: "test",
    withPlayground: false
  };

  Utilities.transferParams(_props, props);

  return new Promise(async(resolve, reject) => {

    const dirResponse = await prompts({
      type: "text",
      name: "dir",
      message: "Directory ",
      initial: props.srcDir || "src"
    });

    let modulePath = path.join(process.cwd(), `${dirResponse.dir}/`);

    const nameResponse = await prompts({
      type: "text",
      name: "componentName",
      message: `Name`
    });

    //cleanup the name
    let componentName = "";
    let nameParts = nameResponse["componentName"].trim().split(" ");
    if(nameParts.length > 1){
      nameParts.forEach(_part => {
        _part = _part.trim();
        if(_part.length > 0){
          componentName += _part[0].toUpperCase() + _part.substring(1);
        }
      });
    }
    else{
      componentName = nameResponse["componentName"][0].toUpperCase() + nameResponse["componentName"].substring(1);
    }

    console.log("component will be named as:", componentName);

    const includeDom = await prompts({
      type: "confirm",
      name: "withDom",
      message: `Needs a dom`,
      initial: false
    });


    let assetsGenerator = moduleGenerator({
      name: componentName,
      withPlayground:props.withPlayground,
      withDom: includeDom["withDom"] || false
    });

    await fs.writeFile(`${modulePath}${componentName}/${componentName}.js`, assetsGenerator.js);

    let nodePackage = null;
    if(props.withPlayground){
      await fs.writeFile(`${modulePath}${componentName}/playground/index.js`, assetsGenerator.playgroundJS);
      await fs.createDir(`${modulePath}${componentName}/playground`);
      nodePackage = {
        description: "generated support file",
        scripts: {}
      };
    }

    if(includeDom["withDom"]){
      await fs.writeFile(`${modulePath}${componentName}/${componentName}.scss`, assetsGenerator.scss);
      await fs.writeFile(`${modulePath}${componentName}/${componentName}.html`, "");
      if(nodePackage){
        await fs.writeFile(`${modulePath}${componentName}/playground/index.html`, assetsGenerator.playgroundHtml);
        nodePackage.scripts[`playground-${componentName}`] = "vite";
      }
    }
    else{
      if(nodePackage){
        nodePackage.scripts[`playground-${componentName}`] = "node ./index.js";
      }
    }
    if(nodePackage){
      nodePackage.scripts["test"] = "echo \"Error: no test specified\" && exit 1";
      await fs.writeFile(`${modulePath}${componentName}/playground/package.json`, JSON.stringify(nodePackage, null, 4));
    }

    resolve(props);
  });
}

function moduleGenerator(_params){

  let params = {
    name: null,
    withPlayground: true,
    withDom: false
  };

  Utilities.transferParams(_params, params);

  if(typeof params.name !== "string" || params.name === ""){
    throw new Error("module name is required");
  }

  const moduleElementId = params.name.toLowerCase() + "-element";
  const moduleName = params.name[0].toUpperCase() + params.name.substring(1);

  let retVal ={
    js: moduleMaker(moduleElementId, moduleName, params.withDom),
    scss: scss(moduleName),
    playgroundHtml: playgroundHtml(moduleName),
    playgroundJS: playgroundJS(moduleName, params.withDom)
  };
  if(params.withPlayground){
    retVal.playgroundHtml = playgroundHtml(moduleName);
    retVal.playgroundJS = playgroundJS(moduleName, params.withDom);
  }

  return {
    js: moduleMaker(moduleElementId, moduleName, params.withDom),
    scss: scss(moduleName),
    playgroundHtml: playgroundHtml(moduleName),
    playgroundJS: playgroundJS(moduleName, params.withDom)
  };
}

module.exports = createComponent;
