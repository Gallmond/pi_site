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
	var scrollHandler = (e)=>{
		console.log("mouse is moving");
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left; //x position within the element.
		var y = e.clientY - rect.top;  //y position within the element.

		x = Math.ceil(x);
		y = Math.ceil(y);

		var segment = ((x/640)*100);
		segment = segment/10;
		segment = Math.ceil(segment);

		if(segment-1 != window.prevSeg){
			window.frameAccess.children[segment-1].style.display = "";
			window.frameAccess.children[window.prevSeg].style.display = "none";
			window.prevSeg = segment-1;
		}
		


		db("x:"+x+" y:"+y+" seg:"+segment);
	}	

	frameHolder.addEventListener("mousemove", scrollHandler, false);
	frameHolder.addEventListener("touchmove", scrollHandler, false);

	//  a holder
	frame.className = "image_frame";
	frame.style.height = "480px";
	frame.style.width = "640px";

	// for each image, create an image tag
	var imageTags = [];
	<%_ for(var i = 0; i < images.length; i++){ -%>
	var image_<%= i%> = document.createElement('img');	
	image_<%= i%>.src = "https://s3.eu-west-2.amazonaws.com/gavinspicamstorage/<%= images[i] %>";
	<%_ if(i!=0){ -%>
	image_<%= i%>.style.display = "none";
	<%_ } -%>
	imageTags.push(image_<%= i%>);
	<%_ } -%>

	// put image tags into frame
	for(var i = 0; i < imageTags.length; i++){
		frame.appendChild(imageTags[i]);
	}

	// put frame in frameholder
	frameHolder.appendChild(frame);

}, false);