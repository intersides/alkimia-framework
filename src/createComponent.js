"use strict";
const prompts = require('prompts');
const fs = require('js-better-fs');
const path = require('path');
const Utilities = require("@intersides/utilities");
const Console = require("@intersides/console");
const {moduleMaker, scss, playgroundHtml, playgroundJS} = require("./modulesMaker");

function createComponent(_props){
    let props = {
        srcDir:"app",
        env:"test"
    };
    Utilities.transferParams(_props, props);
    return new Promise(async (resolve, reject) => {

        const dirResponse = await prompts({
            type:"text",
            name: "dir",
            message: "Directory ",
            initial: props.srcDir || "src"
        });
        
        let modulePath = path.join(process.cwd(), `${dirResponse.dir}/`);
        
        const nameResponse =  await prompts({
            type:"text",
            name:"componentName",
            message:`Name`
        });

        //cleanup the name
        let componentName = "";
        let nameParts = nameResponse['componentName'].trim().split(" ");
        if(nameParts.length > 1){
            nameParts.forEach(_part=>{
                _part = _part.trim();
                if(_part.length > 0){
                    componentName += _part[0].toUpperCase() + _part.substring(1);
                }
            });
        }
        else{
            componentName = nameResponse['componentName'][0].toUpperCase() + nameResponse['componentName'].substring(1);
        }

        Console.debug("componentName:", componentName);


        const asSingletonChoice =  await prompts({
            type:"confirm",
            name:"singleton",
            message:`Is a singleton`,
            initial:false
        });

        const includeDom =  await prompts({
            type:"confirm",
            name:"withDom",
            message:`Needs a dom`,
            initial:false
        });

        let playgroundDir = `${dirResponse.dir}/${componentName}/playground`;

        let assetsGenerator = moduleGenerator({
            name:componentName,
            playgroundDir,
            isSingleton:asSingletonChoice["singleton"] || false,
            withDome:includeDom["withDom"] || false
        });

        await fs.writeFile(`${modulePath}${componentName}/${componentName}.mjs`, assetsGenerator.js);
        await fs.writeFile(`${modulePath}${componentName}/playground/index.mjs`, assetsGenerator.playgroundJS);

        await fs.createDir(`${modulePath}${componentName}/playground`);
        let nodePackage = {
            description: "generated support file",
            scripts: {}
        };
        if(includeDom["withDom"]){
            await fs.writeFile(`${modulePath}${componentName}/${componentName}.scss`, assetsGenerator.scss);
            await fs.writeFile(`${modulePath}${componentName}/${componentName}.html`, '');
            await fs.writeFile(`${modulePath}${componentName}/playground/index.html`, assetsGenerator.playgroundHtml);
            nodePackage.scripts["clear-dist"] = "rm -rf ./dist/*";
            nodePackage.scripts["playground"] = "npm run clear-dist && parcel --dist-dir ./dist ./index.html";
        }
        else{
            nodePackage.scripts["playground"] = "node ./index.mjs";
        }
        nodePackage.scripts["test"] = "echo \"Error: no test specified\" && exit 1";
        await fs.writeFile(`${modulePath}${componentName}/playground/package.json`, JSON.stringify(nodePackage, null, 4)  );


        //install the common utilities if not present
        let commonFile = path.join(modulePath, `common.mjs`);
        let utilityFile = path.join(__dirname, `Utilities.js`);
        if(! await fs.exists(commonFile)){
            Console.warn("common utility file should be added");
            let utilityFileContent = fs.readFile(utilityFile, {encoding:"utf8"});
            await fs.writeFile(commonFile, utilityFileContent);
        }

        Console.log(`${modulePath}${componentName} generated!`);

        resolve(props);
    });
}

function moduleGenerator(_params){

    let params = {
        name:null,
        playgroundDir:null,
        isSingleton:false,
        withDome:false
    }

    Utilities.transferParams(_params, params);

    if(typeof params.name !== "string" || params.name === ""){
        throw new Error("module name is required");
    }

    const moduleElementId = params.name.toLowerCase() + "-element";
    const moduleName = params.name[0].toUpperCase() + params.name.substring(1);

    return {
        js: moduleMaker.v2(moduleElementId, moduleName, params.isSingleton, params.withDome),
        // js: moduleMaker.v1(moduleElementId, moduleName),
        scss:scss(moduleName),
        playgroundHtml:playgroundHtml(moduleName),
        playgroundJS:playgroundJS(moduleName, params.withDome),
        packageBuildCommand:{
            key:`service_${_params.name}-playground`,
            cmd:`parcel --dist-dir ${_params.playgroundDir}/dist ${_params.playgroundDir}/index.html`
        }
    }
}

module.exports = createComponent;