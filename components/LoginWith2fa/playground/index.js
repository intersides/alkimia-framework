import LoginWith2fa from "../LoginWith2fa.js";
import AuthenticationService from "../../mocked-services/AuthenticationService/AuthenticationService";
const _vApp = document.createElement("app");
document.body.appendChild(_vApp);

const aus = AuthenticationService.getInstance();

const loginWith2fa = LoginWith2fa.getInstance();
loginWith2fa.appendTo(_vApp);
loginWith2fa.onSubmit = function(authParams){
  console.log("about to login with authParams", authParams);
  aus.login(authParams).then(response=>{
    console.log(">>:", response);
  }).catch(e=>{
    console.error(e);
  });
};
