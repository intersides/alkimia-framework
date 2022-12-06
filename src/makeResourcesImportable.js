let fs  = require("fs");
let path = require("path");
let Utilities = require("@intersides/utilities");

function *retrieveStylesAndTemplates(_path){
    let result = fs.readdirSync(_path, {withFileTypes:true});
    for (const _appDirEntry of result) {
        if(_appDirEntry.isFile()){
            let extension = path.parse(_appDirEntry.name).ext;
            let isDesiredExtension = [".css", ".html", ".svg"].some(ext=>ext === extension);
            if(isDesiredExtension){
                let baseName = path.parse(_appDirEntry.name).name;
                let isDesiredName = !["index", "colors", "common", "fonts", "_buttons", "_loaders", "_modals", "_icons"].some(name=>name === baseName);
                if(isDesiredName){
                    yield path.join(_path, _appDirEntry.name);
                }
            }
        }
        else if(_appDirEntry.isDirectory()){
            let isDesiredDirectory = !["playground", "test", "dist"].some(name=>name === _appDirEntry.name);
            if(isDesiredDirectory){
                yield *retrieveStylesAndTemplates(path.join(_path, _appDirEntry.name));
            }
        }

    }
}

const prepareBundle = function(_params){
    console.debug("_params:", _params);

    let params = {
        srcDir:"app",
        env:"test"
    };
    Utilities.transferParams(_params, params);
    console.log("running make bundle using parameters:", params);

    for (const entry of retrieveStylesAndTemplates(`./${params.srcDir}`)) {
        let fileContent = fs.readFileSync(entry, {encoding:"utf-8"});
        if(process.env.BUILD_ENV === "test"){
            fs.writeFileSync(entry+".mjs", `export default \`\n${fileContent}\`;`, {encoding:"utf-8"});
        }
        else{
            // export default from "bundle-text:./AuthenticationWidget.css";
            let parsedFileLocation = path.parse(entry);
            let content = `import resourceAsString from "bundle-text:./${parsedFileLocation.base}";\n export default resourceAsString;`;
            fs.writeFileSync(entry+".mjs", content, {encoding:"utf-8"});
        }
        console.debug(entry, entry+".mjs");
    }

};




module.exports = prepareBundle;