document.addEventListener('DOMContentLoaded', ()=>{ 
    
	var IMAGE_WIDTH = 640;
	var MIN_SEG_WIDTH = 2; // min 2 pix segment size
	var MAX_SEGS_ALLOWED = IMAGE_WIDTH/MIN_SEG_WIDTH;

	var db = (_str)=>{
		document.getElementById('debug').innerHTML=_str;
	}

	db("ON");

	var retrievedImages = <%- JSON.stringify(imageInfo.mostRecentImages) %>;

	// get frame holder
	var lightBoxHolder = document.getElementById('image_viewer_holder');
	lightBoxHolder.style.display = "none"; // hide during load

	var lightBox = document.createElement('div');
	window.frameAccess = lightBox;
	window.prevSeg = 0;
	window.maxSegs = (retrievedImages.length>MAX_SEGS_ALLOWED?MAX_SEGS_ALLOWED:retrievedImages.length);
	var scrollHandler = (e)=>{
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left; //x position within the element.
		var y = e.clientY - rect.top;  //y position within the element.

		x = Math.ceil(x);
		y = Math.ceil(y);

		// % of distance along the line the point is
		var cursor_pt = ((x/IMAGE_WIDTH)*100); // where IMAGE_WIDTH is line length
		var cursor_pt = Math.ceil(cursor_pt); // rounded up

		// size of segments
		var segment_size = 100/window.maxSegs; 

		// number of the segment the point is in
		var current_segment = Math.ceil(cursor_pt/segment_size); 

		var segment = (current_segment!=0?current_segment:1);
		segment = (segment>window.maxSegs?window.maxSegs:segment);

		db("x:"+x+" y:"+y+" cur%:"+cursor_pt+" seg:"+segment+"/"+window.maxSegs+"/"+MAX_SEGS_ALLOWED);

		if(segment-1 != window.prevSeg){
			// child to show
			try{
				window.frameAccess.children[segment-1].style.display = "";;
				window.frameAccess.children[window.prevSeg].style.display = "none";;
				window.prevSeg = segment-1;
			}catch(e){
				console.log("segment:", segment);
				console.log("window.prevSeg:", window.prevSeg);
				console.log(e);
			}
			
		}
		
	}	

	lightBoxHolder.addEventListener("mousemove", scrollHandler, false);
	lightBoxHolder.addEventListener("touchmove", scrollHandler, false);

	//  a holder
	lightBox.className = "image_frame";
	lightBox.style.height = "480px";
	lightBox.style.width = "640px";

	// for each image, create an image tag (note mostRecentImages are 0=newest)
	var imageTags = [];
	window.imageTags = imageTags;
	for (var i = 0, l = retrievedImages.length; i<l; i++){
		var thisImage = document.createElement('img');	
		thisImage.src = "https://s3.eu-west-2.amazonaws.com/"+retrievedImages[i].bucket+"/"+retrievedImages[i].key;
		thisImage.dataset.bucketname = retrievedImages[i].bucket;
		thisImage.dataset.key = retrievedImages[i].key;
		thisImage.dataset.arrayIndex = i;
		if(i!=0){
			thisImage.style.display = "none";
		}
		imageTags.push(thisImage);
	}
	console.log("created image tags: ", imageTags.length);

	// put image tags into lightBox
	for(var i = 0; i < imageTags.length; i++){
		lightBox.prepend(imageTags[i]);
	}

	// put lightBox in lightBoxHolder
	lightBoxHolder.appendChild(lightBox);

	// check images are loaded
	function isCompleteTest(imageTag){
		return imageTag.complete;
	}
	if(imageTags.every(isCompleteTest)){ // if all loaded, reveal right away
		lightBoxHolder.style.display = ""; // reveal
	}else{ // otherwise set a job to check every 200 ms
		var loadCheckInterval = setInterval(function (_imageTags, _lightBoxHolder) {
			console.log("checking images");
			if(_imageTags.every(isCompleteTest)){
				console.log("images loaded");
				lightBoxHolder.style.display = ""; // reveal
		    	clearInterval(loadCheckInterval);
			}
		}, 200, imageTags, lightBoxHolder);
	}
	

}, false);