document.addEventListener('DOMContentLoaded', ()=>{ 
    
	var db = (_str)=>{
		document.getElementById('debug').innerHTML=_str;
	}

	db("ON");

	// get frame holder
	var frameHolder = document.getElementById('image_viewer_holder');
	var frame = document.createElement('div');
	window.frameAccess = frame;
	window.prevSeg = 0;
	window.maxSegs = <%= imageInfo.mostRecentImages.length %>;
	var scrollHandler = (e)=>{
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left; //x position within the element.
		var y = e.clientY - rect.top;  //y position within the element.

		x = Math.ceil(x);
		y = Math.ceil(y);

		// % of distance along the line the point is
		var cursor_pt = ((x/640)*100); // where 640 is line length
		var cursor_pt = Math.ceil(cursor_pt); // rounded up

		// size of segments
		var segment_size = 100/window.maxSegs; 

		// number of the segment the point is in
		var current_segment = Math.ceil(cursor_pt/segment_size); 

		var segment = (current_segment!=0?current_segment:1);

		db("x:"+x+" y:"+y+"<br/>cur%:"+cursor_pt+" seg:"+segment+"/"+window.maxSegs);

		if(segment-1 != window.prevSeg){
			window.frameAccess.children[segment-1].style.display = "";
			window.frameAccess.children[window.prevSeg].style.display = "none";
			window.prevSeg = segment-1;
		}
		


		
	}	

	frameHolder.addEventListener("mousemove", scrollHandler, false);
	frameHolder.addEventListener("touchmove", scrollHandler, false);

	//  a holder
	frame.className = "image_frame";
	frame.style.height = "480px";
	frame.style.width = "640px";

	// for each image, create an image tag
	var imageTags = [];
	<%_ for (var i = imageInfo.mostRecentImages.length - 1; i >= 0; --i){ -%>
	// <%= imageInfo.mostRecentImages[i].key %>
	var image_<%= i%> = document.createElement('img');	
	image_<%= i%>.src = "https://s3.eu-west-2.amazonaws.com/<%= imageInfo.mostRecentImages[i].bucket %>/<%= imageInfo.mostRecentImages[i].key %>";
	<%_ if(i!=0){ -%>
	image_<%= i%>.style.display = "none";
	<%_ } -%>
	imageTags.push(image_<%= i%>);
	<%_ } -%>

	console.log("created image tags: ", imageTags.length);

	// put image tags into frame
	for(var i = 0; i < imageTags.length; i++){
		frame.appendChild(imageTags[i]);
	}

	// put frame in frameholder
	frameHolder.appendChild(frame);

}, false);