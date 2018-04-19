document.addEventListener('DOMContentLoaded', ()=>{ 
    
	var IMAGE_WIDTH = 640;
	var MIN_SEG_WIDTH = 2; // min 2 pix segment size
	var MAX_SEGS_ALLOWED = IMAGE_WIDTH/MIN_SEG_WIDTH;

	var db = (_str)=>{
		document.getElementById('debug').innerHTML=_str;
	}

	db("ON");

	// get frame holder
	var lightBoxHolder = document.getElementById('image_viewer_holder');
	lightBoxHolder.style.display = "none"; // hide during load

	var lightBox = document.createElement('div');
	window.frameAccess = lightBox;
	window.prevSeg = 0;
	window.maxSegs = (<%= imageInfo.mostRecentImages.length %>>MAX_SEGS_ALLOWED?MAX_SEGS_ALLOWED:<%= imageInfo.mostRecentImages.length %>);
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

		db("x:"+x+" y:"+y+" cur%:"+cursor_pt+" seg:"+segment+"/"+window.maxSegs+"/"+MAX_SEGS_ALLOWED);

		if(segment-1 != window.prevSeg){
			// child to show
			window.frameAccess.children[segment-1].style.display = "";;
			window.frameAccess.children[window.prevSeg].style.display = "none";;
			window.prevSeg = segment-1;
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
	<%_ for (var i = 0, l = imageInfo.mostRecentImages.length; i<l; i++){ -%>
	// <%= imageInfo.mostRecentImages[i].key %>
	var image_<%= i%> = document.createElement('img');	
	image_<%= i%>.src = "https://s3.eu-west-2.amazonaws.com/<%= imageInfo.mostRecentImages[i].bucket %>/<%= imageInfo.mostRecentImages[i].key %>";
	image_<%= i%>.dataset.bucketname = "<%= imageInfo.mostRecentImages[i].bucket %>";
	image_<%= i%>.dataset.key = "<%= imageInfo.mostRecentImages[i].key %>";
	image_<%= i%>.dataset.arrayIndex = "<%= i %>";
	<%_ if(i!=0){ -%>
	image_<%= i%>.style.display = "none";
	<%_ } -%>
	imageTags.push(image_<%= i%>);

	<%_ } -%>
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