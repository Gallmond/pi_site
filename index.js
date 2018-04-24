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
			console.log("images keys were recently cached");
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

app.get('/test', (req,res)=>{

	var inMemoryImageStore = {
		mostRecentImages: [{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T130001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T120001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T110001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T100001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T090001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T080001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T070001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T060001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180422T050001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T200001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T180001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T170001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T160001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T150001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T140002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T130001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T120001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T110001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T100001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T090001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T080001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T070001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T060001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180421T050001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T200002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T180001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T170001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T160002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T150001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T140001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T130001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T120001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T110001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T100001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T090001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T080001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T070002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T060001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180420T050001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T200002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T183032.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T181222.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T180001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T170001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T160001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T150001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T140001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T130001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T120001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T110001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T100001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T090001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T080001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T070001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T060001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180419T050001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T230001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T220001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T200002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T180001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T170001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T160001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T150001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T140001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T130001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T120001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T110001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T100001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T090001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T080002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T070001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T060001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180418T050001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T230001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T220001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T202847.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T200001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180417T183128.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T223331.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T220407.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T220001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T210001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T200002.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T190001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T183654.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T180001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T170001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T160001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T150001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T140001.jpg"},{"bucket":"gavin.taraplantwatcher.img.201804","key":"20180415T131312.jpg"}]
	}

	res.render("test", {imageInfo:inMemoryImageStore});	
	
});

app.get('/home', (req,res)=>{

	if(req.query.refresh == "true"){
		updateImages(true).then((resOb, rejOb)=>{
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
