// load local settings
if(!process.env.APP_ENVIRONMENT || process.env.APP_ENVIRONMENT=="local"){
    var fs = require('fs');
    var envString = fs.readFileSync("./.env", {encoding:"utf-8"});
    var splitEnv = envString.split("\r\n");
    for(var i = 0; i<splitEnv.length; i++){
        var eIndex = splitEnv[i].indexOf("=");
        var left = splitEnv[i].substring(0,eIndex);
        var right = splitEnv[i].substring(eIndex+1);
        process.env[left] = right;
    }
}


console.log("process.env", process.env);


console.log("in awstest.js");


console.log("requiring AWS");
var AWS = require('aws-sdk');


console.log("creating new s3");
var s3 = new AWS.S3();


console.log("requesting ob list");
var params = {
    Bucket: process.env.AMAZON_BUCKETNAME, 
    Prefix: "2018"
};
s3.listObjectsV2(params, (err, data)=>{
    if(err){console.log(err, err.stack);} 

    console.log("returned data:", data);

});
