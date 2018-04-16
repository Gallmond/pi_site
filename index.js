// ==== app inits

// aws
AWS = require('aws-sdk');

// express
express = require('express');
app = express();

// database
mongo = require('mongodb');

// templates
ejs = require('ejs');

// view engine
app.set('view engine','ejs');

// port
app.set('port', (process.env.PORT || 5000));

// undeclared paths search the public folder
app.use(express.static(__dirname + '/public'));

// grab body data and insert into request.rawBody
app.use(function(req, res, next){
   var data = "";
   req.on('data', function(chunk){ data += chunk})
   req.on('end', function(){
	   req.rawBody = data;
	   next();
   });
});

// update images if needed
app.use((req, res, next)=>{
	updateImages()
	next();
});


// === AWS start
// === AWS start
var now = new Date().valueOf();
inMemoryImageStore = {
	updated: now,
	mostRecentImages: []
}
var params = {
	Bucket: process.env.AMAZON_BUCKETNAME,
	Prefix: "2018" 
};
var s3 = new AWS.S3();
s3.listObjectsV2(params, (err, data)=>{
	if(err){console.log(err, err.stack);} 
	console.log("returned data:", data);

	var contents = data.Contents;
	for(var i = contents.length-1; i >= 0; i-- ){// reverse through images
		inMemoryImageStore.mostRecentImages.push(contents[i].Key);
		if(inMemoryImageStore.mostRecentImages.length>=10){
			break;
		}
	}
	inMemoryImageStore.mostRecentImages.reverse();
});
function updateImages(){
	var now = new Date().valueOf();
	if(now > inMemoryImageStore.updated - (1000*60*60*5)){ // five hours
		console.log("images keys were recently cached");
		return false;
	}else{
		console.log("fetching more recent keys");
	}
	var params = {
		Bucket: process.env.AMAZON_BUCKETNAME,
		Prefix: "2018" 
	};
	s3.listObjectsV2(params, (err, data)=>{
		if(err){console.log(err, err.stack);} 
		console.log("returned data:", data);

		var contents = data.Contents;
		for(var i = contents.length-1; i >= 0; i-- ){// reverse through images
			inMemoryImageStore.mostRecentImages.push(contents[i].Key);
			if(inMemoryImageStore.mostRecentImages.length>=10){
				break;
			}
		}

		inMemoryImageStore.mostRecentImages.reverse();
		inMemoryImageStore.updated = now;
	});
}
// === AWS start
// === AWS start



// ==== routing start
// ==== routing start
app.get('/test', (req,res)=>{
	console.log("hello");
	res.send("hello");
});

app.get('/home', (req,res)=>{
	console.log("hello");

	images = inMemoryImageStore.mostRecentImages;

	res.render("index", {images:images});
});

// any uncaptured ones
app.get('*', function (req, res) {
	res.status(404).send("page not found");
})
// ==== routing end
// ==== routing end


// ==== start listening
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
