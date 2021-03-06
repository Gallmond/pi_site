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
app.use((req, res, next)=>{
   var data = "";
   req.on('data', (chunk)=>{ data += chunk})
   req.on('end', ()=>{
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
	updateImages();
	next();
});

// on first load
updateImages(true);


function setImages(_keysArray){
	inMemoryImageStore.mostRecentImages = _keysArray;
	inMemoryImageStore.updated = new Date().valueOf();
}
function updateImages(_force){
	return new Promise((resolve, reject)=>{

		var now = new Date().valueOf();
		if(inMemoryImageStore.updated > now - (1000*60*60) && _force!=true ){ // one hours
			var dateFromTS = new Date(inMemoryImageStore.updated).toUTCString();
			console.log("images keys were recently cached ["+dateFromTS+"]");
			return false;
		}else{
			console.log("fetching more recent keys");
		}

		// ==== get existing buckets
		allKeys = [];
		s3.listBuckets({}, function(err, data) {
			if(err){console.log(err, err.stack);return false;}

			// reverse throuch the buckets (ie, most recent is 0)
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

					// reverse throuch the contents (ie, most recent is 0)
					for (var ci = data.Contents.length - 1; ci >= 0; --ci){
						storedObject = data.Contents[ci];
						var toPush = {bucket:data.Name, key:storedObject.Key};
						console.log("adding: ", toPush);
						allKeys.push(toPush);

						if(ci==0){
							setImages(allKeys);
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
app.get('/', (req,res)=>{
	console.log("hello");
	res.send("hello");
});

app.get('/home', (req,res)=>{

	if(req.query.refresh == "true"){
		updateImages(true).then((resOb, rejOb)=>{
			// resolve
			res.render("index_v2", {imageInfo:inMemoryImageStore});
		});

	}else{
		res.render("index_v2", {imageInfo:inMemoryImageStore});	
	}
	
});

app.get('/home_v1', (req,res)=>{

	if(req.query.refresh == "true"){
		updateImages(true).then((resOb, rejOb)=>{
			// resolve
			res.render("index_v1", {imageInfo:inMemoryImageStore});
		});

	}else{
		res.render("index_v1", {imageInfo:inMemoryImageStore});	
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
