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


console.log("listing buckets");
s3.listBuckets({}, function(err, data) {
	if(err){console.log(err, err.stack);}

	console.log(data);
	/*
{ Buckets:
   [ { Name: 'gavin.taraplantwatcher.img.201804',
       CreationDate: 2018-04-17T18:09:32.000Z },
     { Name: 'gavin.taraplantwatcher.img.static',
       CreationDate: 2018-04-17T18:23:18.000Z },
     { Name: 'gavinspicamstorage',
       CreationDate: 2018-04-14T12:47:57.000Z } ],
  Owner:
   { DisplayName: 'gallmond',
     ID: 'f01e5fb7b8a7b94d5f1a1e6792df5a9e21333ffeb9be8a0b878e7c0b6831f977' } }
	*/

	for (var i=0, l=data.Buckets.length; i<l; i++){
		var thisBucketName = data.Buckets[i].Name;

		var params = {
			Bucket: thisBucketName
		};
		s3.listObjects(params, function(err, data) {
			if(err){console.log(err, err.stack);}

			console.log("thisBucketName CONTAINS:")
			console.log(data.Contents);

		});

	};


});