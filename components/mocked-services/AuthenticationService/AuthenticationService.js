import { utilities } from "@alkimia/lib";

export default function AuthenticationService(args){

  const _params = utilities.transfer(args, {});

  const secret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";

  const instance = Object.create(AuthenticationService.prototype);

  /**
  *
  * @return {AuthenticationService}
  * @private
  */
  const _initialize = ()=>{
    
    _registerEvents();
    
    return instance;
  };

  function _registerEvents(){
  }

  instance.login = function(authParams){

    const {username, password} = authParams;

    return new Promise((resolve, reject)=>{
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const token = window.otplib.authenticator.generate(secret);

      const body = JSON.stringify({
        username,
        password,
        token
      });

      const requestOptions = {
        method: "POST",
        headers: headers,
        body: body,
        redirect: "follow"
      };

      fetch("http://localhost:3000/login", requestOptions)
        .then(response=>{
          resolve(response.json());
        }).then(json=>{
          resolve(json);
        })
        .catch(e=>{
          reject(e);
        });

    });

  };

  return _initialize();
}

/**
 *
 * @type {AuthenticationService}
 * @private
 */
let _instance = null;

AuthenticationService.getSingleton = function(_args=null) {
  if(!_instance){
    _instance = AuthenticationService(_args);
  }
  return _instance;
};

AuthenticationService.getInstance = function(_args) {
  return AuthenticationService(_args);
};
