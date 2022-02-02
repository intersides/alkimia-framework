"use strict";
const prompts = require('prompts');
const fs = require('js-better-fs');
const path = require('path');

async function createComponent(){

    const bundlerChoice = await prompts({
        type:"select",
        name: "bundler",
        message: "Choose a bundler",
        choices:[
            {title: 'Snowpack', value:'snowpack'},
            {title: 'Parcel', value:'parcel'}
        ],
    });

    const dirResponse = await prompts({
        type:"text",
        name: "dir",
        message: "Choose the project directory ",
        initial: "src"
    });

    const typeResponse = await prompts({
        type:"select",
        name: "type",
        message: "Choose a type",
        choices:[
            {title: 'Widget', value:'widget'},
            {title: 'Service', value:'service'}
        ],
    });

    const nameResponse =  await prompts({
        type:"text",
        name:"componentName",
        message:`Choose ${typeResponse.type} name`
    });

    let callerDir = process.cwd();

    if(typeResponse.type === "widget"){

        let widgetsPath = path.join(callerDir, `${dirResponse.dir}/widgets/`);
        let directoryName = nameResponse["componentName"][0].toUpperCase() + nameResponse["componentName"].substring(1)+"Widget";

        let playgroundDir = `${dirResponse.dir}/widgets/${directoryName}/playground`;
        let assetsGenerator = widgetAssetsGenerator({
            name:nameResponse["componentName"],
            playgroundDir,
            bundler:bundlerChoice.bundler
        });

        await fs.writeFile(`${widgetsPath}${directoryName}/${directoryName}.mjs`, assetsGenerator.js);
        await fs.writeFile(`${widgetsPath}${directoryName}/${directoryName}.scss`, assetsGenerator.scss);
        await fs.writeFile(`${widgetsPath}${directoryName}/${directoryName}.htm`, '');

        if(bundlerChoice.bundler === "parcel"){
            //playground
            await fs.createDir(`${widgetsPath}${directoryName}/playground`);
            await fs.writeFile(`${widgetsPath}${directoryName}/playground/index.htm`, assetsGenerator.playgroundHtml);
            await fs.writeFile(`${widgetsPath}${directoryName}/playground/index.mjs`, assetsGenerator.playgroundJS);

            let packagePath = path.join(callerDir, "package.json");
            let packSource = fs.readFile( packagePath, {encoding:"utf8"});
            let pack = JSON.parse(packSource);
            pack.scripts[assetsGenerator.packageBuildCommand.key] = assetsGenerator.packageBuildCommand.cmd;
            await fs.writeFile(packagePath, JSON.stringify(pack, null, 4));

        }


        //install the common utilities if not present
        let commonFile = path.join(widgetsPath, `common.mjs`);
        let utilityFile = path.join(__dirname, `Utilities.js`);
        if(! await fs.exists(commonFile)){
            console.warn("common utility file should be added");
            let utilityFileContent = fs.readFile(utilityFile, {encoding:"utf8"});
            await fs.writeFile(commonFile, utilityFileContent);
        }


        // let withCustomElement = false;
        // const customElementChoice =  await prompts({
        //     type:"confirm",
        //     name:"withCustomElement",
        //     message:`Do you want to associate a custom element`
        // });
        // withCustomElement = customElementChoice["withCustomElement"];
        // console.log("withCustomElement:", withCustomElement);
        // if(withCustomElement){
        //     const customElementNameResponse =  await prompts({
        //         type:"text",
        //         name:"custom-element-name",
        //         initial:`${componentName['component-name'].toLowerCase()}-widget`,
        //         message:`Choose custom component name`
        //     });
        //
        //     console.log(customElementNameResponse);
        //
        // }

        console.log(`${widgetsPath}${directoryName} generated!`);

    }
    else if(typeResponse.type === "service"){

        const asSingletonChoice =  await prompts({
            type:"confirm",
            name:"singleton",
            message:`Is a singleton`,
            initial:true
        });
    }

}

function widgetAssetsGenerator(_params){

    if(typeof _params.name !== "string" || _params.name === ""){
        throw new Error("widget name is required");
    }

    let widgetName = _params.name[0].toUpperCase() + _params.name.substring(1);
    let widgetElementId = _params.name.toLowerCase() + "-widget";

    let bundler = _params.bundler;

    let importStyle = null;
    if(bundler === "snowpack"){
        importStyle = `./${widgetName}Widget.css`;
    }
    else if(bundler === "parcel"){
        importStyle = `bundle-text:./${widgetName}Widget.css`;
    }
    else{
        console.error("bundler not defined");
    }

    let importHtm = `./${widgetName}Widget.htm`;
    if(bundler === "parcel"){
        importHtm = `bundle-text:${importHtm}`;
    }

    return {
        js: `"use strict";
import { Utilities } from '../common.mjs';
import style from '${importStyle}'
import htmlTemplate from '${importHtm}';

let customElementElement = Utilities.createAndRegisterWidgetElement("${widgetName}Widget", '${widgetElementId}');

function _${widgetName}Widget(){

    let _vRoot = new customElementElement(style, htmlTemplate);

    function _initialize(){
        _initView();
        _registerEvents();
    }

    function _initView(){
    }

    function _registerEvents(){
    }

    return Object.freeze({
        init:_initialize,
        exportable:Object.seal({
            getView:()=>_vRoot
        })
    });

}

export let ${widgetName}Widget = Object.freeze({
    getInstance:()=>{
        let instance = new _${widgetName}Widget();
        instance.init();
        return instance.exportable;
    }
});`,
        scss:`
:host{}
.${widgetName}Widget{
}`,
        playgroundHtml:`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${widgetName} Widget</title>
</head>
<body>
<script type="module" src="index.mjs"></script>
</body>
</html>`,
        playgroundJS:`
import { ${widgetName}Widget } from '../${widgetName}Widget.mjs';

const _vApp = document.createElement("app");
document.body.appendChild(_vApp);
let widget = ${widgetName}Widget.getInstance();
_vApp.appendChild(widget.getView());`,
        packageBuildCommand:{
            key:`widget_${_params.name}-playground`,
            cmd:`parcel --dist-dir ${_params.playgroundDir}/dist ${_params.playgroundDir}/index.html`
        }
    }
}

module.exports = createComponent;
