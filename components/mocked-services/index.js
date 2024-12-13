import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { authenticator } from "otplib";

//NOTE doc: https://github.com/yeojz/otplib/blob/master/README.md#in-nodejs
const secret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";
const token = authenticator.generate(secret);

const usersDb = {
  "marco.falsitta@me.com" : {
    password: "cYpver-cubgo9-fozhap",
    twoFaEnabled:true
  }
};

const app = express();

const corsOptions = {
  origin: "http://localhost:5174", // allow from this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//NOTE: simulate timeouts
let loginTimeout = null;


app.post("/login", (req, res, next) => {

  if(loginTimeout){
    clearTimeout(loginTimeout);
  }

  const variableTimeout = ((Math.random() * 3) + 1) * 1000;

  loginTimeout = setTimeout(function(){

    if(usersDb[req.body.username]?.password !== req.body.password){
      console.error("wrong login");
      res.status(401).json({msg:"unauthorised"});
    }
    else{
      try {
        const isValid = authenticator.verify({ token:req.body.token, secret });
        res.json({msg:"OK", isValid});
      }
      catch (err) {
        console.error(err);
        res.status(401).json({msg:"unauthorised"});
      }
    }

  }, variableTimeout);

  next();

});

app.all( "/*", (req, res)=>{
  console.debug("request:", req.path, req.method, req.body);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
