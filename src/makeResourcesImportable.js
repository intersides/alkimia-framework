import fs from "fs";
import path from "fs";
import Utilities from "@alkimia/utilities";

function *retrieveStylesAndTemplates(_path){
  const result = fs.readdirSync(_path, {withFileTypes:true});
  for (const _appDirEntry of result) {
    if(_appDirEntry.isFile()){
      const extension = path.parse(_appDirEntry.name).ext;
      const isDesiredExtension = [".css", ".html", ".svg"].some(ext=>ext === extension);
      if(isDesiredExtension){
        const baseName = path.parse(_appDirEntry.name).name;
        const isDesiredName = !["index", "colors", "common", "fonts", "_buttons", "_loaders", "_modals", "_icons"].some(name=>name === baseName);
        if(isDesiredName){
          yield path.join(_path, _appDirEntry.name);
        }
      }
    }
    else if(_appDirEntry.isDirectory()){
      const isDesiredDirectory = !["playground", "test", "dist"].some(name=>name === _appDirEntry.name);
      if(isDesiredDirectory){
        yield *retrieveStylesAndTemplates(path.join(_path, _appDirEntry.name));
      }
    }

  }
}

export default function prepareBundle(_params){
  console.debug("_params:", _params);

  const params = {
    srcDir:"app",
    env:"test"
  };
  Utilities.transfer(_params, params);
  console.log("running make bundle using parameters:", params);

  for (const entry of retrieveStylesAndTemplates(`./${params.srcDir}`)) {
    const fileContent = fs.readFileSync(entry, {encoding:"utf-8"});
    if(process.env.BUILD_ENV === "test"){
      fs.writeFileSync(entry+".mjs", `export default \`\n${fileContent}\`;`, {encoding:"utf-8"});
    }
    else{
      // export default from "bundle-text:./AuthenticationWidget.css";
      const parsedFileLocation = path.parse(entry);
      const content = `import resourceAsString from "bundle-text:./${parsedFileLocation.base}";\n export default resourceAsString;`;
      fs.writeFileSync(entry+".mjs", content, {encoding:"utf-8"});
    }
    console.debug(entry, entry+".mjs");
  }

}
