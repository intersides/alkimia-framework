"use strict";
import prompts from "prompts";
import fs from "js-better-fs";
import path from "path";
import ModulesMaker from "./modulesMaker.js";

const {
  moduleMaker,
  html,
  scss,
  playgroundHtml,
  playgroundJS
} = ModulesMaker;


import { utilities } from "@alkimia/lib";

export default function createComponent(_props){
  const props = {
    srcDir: "app",
    env: "test",
    withPlayground: false
  };

  utilities.transfer(_props, props);

  return new Promise(async(resolve, reject) => {

    const dirResponse = await prompts({
      type: "text",
      name: "dir",
      message: "Directory ",
      initial: props.srcDir || "src"
    });

    const modulePath = path.join(process.cwd(), `${dirResponse.dir}/`);

    const nameResponse = await prompts({
      type: "text",
      name: "componentName",
      message: "Name"
    });

    //cleanup the name
    let componentName = "";
    const nameParts = nameResponse["componentName"].trim().split(" ");
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
      message: "Needs a dom",
      initial: false
    });

    const includePlayground = await prompts({
      type: "confirm",
      name: "withPlayground",
      message: "Include playgorund",
      initial: false
    });

    const includeStatesSample = await prompts({
      type: "confirm",
      name: "withStatesSample",
      message: "Include States Sample",
      initial: false
    });

    const assetsGenerator = moduleGenerator({
      name: componentName,
      withPlayground:includePlayground["withPlayground"] || false,
      withDom: includeDom["withDom"] || false,
      withStatesSample:includeStatesSample["withStatesSample"] || false
    });
   

    await fs.writeFile(`${modulePath}${componentName}/${componentName}.js`, assetsGenerator.js);

    let nodePackage = null;
    if(includePlayground["withPlayground"]){
      await fs.writeFile(`${modulePath}${componentName}/playground/index.js`, assetsGenerator.playgroundJS);
      await fs.createDir(`${modulePath}${componentName}/playground`);
      nodePackage = {
        description: "generated support file",
        scripts: {}
      };
    }

    if(includeDom["withDom"]){
      await fs.writeFile(`${modulePath}${componentName}/${componentName}.scss`, assetsGenerator.scss);
      await fs.writeFile(`${modulePath}${componentName}/${componentName}.html`, assetsGenerator.html);
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


  const params = utilities.transfer(_params, {
    name: null,
    withPlayground: true,
    withDom: false,
    withStatesSample: false
  });

  if(typeof params.name !== "string" || params.name === ""){
    throw new Error("module name is required");
  }

  const moduleElementId = params.name.toLowerCase() + "-element";
  const moduleName = params.name[0].toUpperCase() + params.name.substring(1);

  return {
    js: moduleMaker(moduleElementId, moduleName, params.withDom, params.withPlayground, params.withStatesSample),
    scss: scss(moduleName),
    html: html(moduleName, params.withStatesSample),
    playgroundHtml: playgroundHtml(moduleName),
    playgroundJS: playgroundJS(moduleName, params.withDom)
  };
}
