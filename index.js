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


inMemoryBuckets = {
	buckets:{},
	lastUpdated:0,
	totalImages:0,
};

function getBucketNames(){
	return new Promise((resolve, reject)=>{
		var bucketNameArray = [];
		// get existing buckets
		s3.listBuckets({}, function(err, data) {
			if(err){
				console.log(err, err.stack);
				return reject({error:"error during getBucketNames", details:err});
			}
			// reverse throuch the buckets (ie, most recent is 0)
			for (var bi = data.Buckets.length - 1; bi >= 0; --bi){
				Bucket = data.Buckets[bi];
				bucketNameArray.push(Bucket.Name);
			}
			return resolve({success:"retrieved buckets", data:bucketNameArray});
		});
	});
}// getBucketNames end
function getBucketKeys(_bucketName){
	return new Promise((resolve, reject)=>{
		var keysArray = [];
		var params = {
			Bucket: _bucketName
		};
		s3.listObjectsV2(params, function(err, data) {
			if(err){
				console.log(err, err.stack);
				return reject({error:"error during getBucketKeys", details:err});
			}

			// reverse throuch the contents (ie, most recent is 0)
			for (var ci = data.Contents.length - 1; ci >= 0; --ci){
				storedObject = data.Contents[ci];
				keysArray.push(storedObject.Key);
			}// for each object end

			return resolve({success:"retrieved keys", data:keysArray, input:_bucketName});
		});
	});
}// getBucketKeysEnd
function populateInMemoryBuckets(_force){
	return new Promise((resolve, reject)=>{

		var now = new Date().valueOf();

		// check if it's been at least an hour since the last contents check
		if(inMemoryBuckets.lastUpdated > now - (1000*60*60) && _force!="true"){
			return resolve({success:"bucket contents were recently fetched", data:inMemoryBuckets});
		};

		// get all buckets
		getBucketNames().then((obj)=>{
			// getBucketNames resolve
			var bucketNamesArr = obj.data;

			var keysPromises = [];
			for (var i = 0; i < bucketNamesArr.length; i++) {
				// skip static
				if(bucketNamesArr[i].split(".").indexOf("static") != -1){
					continue;
				}
				// retrieve keys for this bucket
				keysPromises.push(getBucketKeys(bucketNamesArr[i]));
			}

			// for the keypromises
			Promise.all(keysPromises).then((objAr)=>{
				for (var i = 0; i < objAr.length; i++) {
					var keysArr = objAr[i].data;
					var bucketName = objAr[i].input;
					inMemoryBuckets.buckets[bucketName] = keysArr;
					inMemoryBuckets.totalImages+= keysArr.length;
				};
				inMemoryBuckets.lastUpdated = now;
				return resolve({success:"bucket contents were newly fetched", data:inMemoryBuckets})
			},(obj)=>{
				// a key promise failed
				return reject(obj);
			});

		},(obj)=>{
			// getBucketNames reject
			return reject(obj);
		});

	});
}// getBucketContents end




// ==== routing start
app.get('/', (req,res)=>{
	console.log("hello");
	res.send("hello");
});


app.get('/home', (req,res)=>{

	console.log("req.query", req.query);

	populateInMemoryBuckets(req.query.refresh).then((obj)=>{
		// populateInMemoryBuckets resolved
		//res.send("loaded buckets");
		res.render("index", {inMemoryBuckets:inMemoryBuckets});
	
	},(obj)=>{
		// populateInMemoryBuckets rejected
		console.log("error loading buckets on request", obj);
		res.send("error loading buckets on request");
	});


});


// any uncaptured ones
app.get('*', function (req, res) {
	res.status(404).send("page not found");
})
// ==== routing end



// ==== start listening
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
