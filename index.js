// ==== app inits

// aws
AWS = require('aws-sdk');
s3 = new AWS.S3();

// express
express = require('express');
app = express();

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

// in memory images
inMemoryImageStore = {
	updated: new Date().valueOf(),
	mostRecentImages: []
};

// update images if needed
app.use((req, res, next)=>{
	updateImagesV2();
	next();
});
updateImagesV2(true);



function updateImagesV2(_force){
	return new Promise((resolve, reject)=>{

		var now = new Date().valueOf();
		if(inMemoryImageStore.updated > now - (1000*60*60) && _force!=true ){ // one hours
			console.log("images keys were recently cached");
			return false;
		}else{
			console.log("fetching more recent keys");
		}

		// ==== get existing buckets
		s3.listBuckets({}, function(err, data) {
			if(err){console.log(err, err.stack);return false;}

			for (var bi = data.Buckets.length - 1; bi >= 0; --bi){
				Bucket = data.Buckets[bi];
				// skip static
				if(Bucket.Name=="gavin.taraplantwatcher.img.static"){
					continue;
				}
				// ==== get all keys in this bucket
				var params = {
					Bucket: Bucket.Name
				};
				s3.listObjects(params, function(err, data) {
					if(err){console.log(err, err.stack);return false;}

					for (var ci = data.Contents.length - 1; ci >= 0; --ci){
						storedObject = data.Contents[ci];
						var toPush = {bucket:data.Name, key:storedObject.Key};
						console.log("adding: ", toPush);
						inMemoryImageStore.mostRecentImages.push(toPush);
						inMemoryImageStore.updated = new Date().valueOf();

						if(ci==0){
							return resolve({success:"forced refresh"});
						}
					}// for each object end
				});
			}// for each bucket end

			return true;

		});// list buckets end

	});
}



// ==== routing start
// ==== routing start
app.get('/test', (req,res)=>{
	console.log("hello");
	res.send("hello");
});

app.get('/home', (req,res)=>{
	console.log("hello", req.query);
	if(req.query.refresh == "true"){
		updateImagesV2(true).then((resOb, rejOb)=>{
			// resolve
			res.render("index", {imageInfo:inMemoryImageStore});
		});

	}else{
		res.render("index", {imageInfo:inMemoryImageStore});	
	}
	
	
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
