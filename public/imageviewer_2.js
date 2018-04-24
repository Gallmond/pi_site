document.addEventListener('DOMContentLoaded', ()=>{ 

	db = (_str)=>{
		document.getElementById('debug').innerHTML=_str;
	}

	var staticImageList = <%- JSON.stringify(imageInfo.mostRecentImages) %>

	// create a new lightbox object,
	var options = {
		holder_id: "image_viewer_holder", // ID of holding div
		img_width: 640, // width of images to display
		min_seg_width: 2, // minimum size of mouseover trigger segments
		img_history_length: 10, // default number of images history
		domain: "https://s3.eu-west-2.amazonaws.com",
		img_list: staticImageList,
	};
	window.lightBox = new lightBoxObject(options); 

	// attach listeners
	var addTenButton = document.getElementById("add_ten");
	addTenButton.addEventListener("click", function(){
		console.log("addTenButton clicked");
		window.lightBox.addhistory(10);
		console.log("addTenButton clicked end");
	}, false);

	// attach listeners
	var showNthButton = document.getElementById("nth_show");
	showNthButton.addEventListener("click", function(){
		// get selected amnt
		console.log("showNthButton clicked");
		var selector = document.getElementById("nth_select");
		var showEvery = selector.options[selector.selectedIndex].value;
		if(showEvery<2) showEvery = false;
		window.lightBox.onlyShow(showEvery);
		console.log("showNthButton clicked end");
	}, false);



});// DOMContentLoaded end

// lightbox object
var lightBoxObject = function(_options){

	// ======== init stuff
	this.options = _options;
	this.img_list = this.options.img_list;
	this.segment_count = this.options.img_history_length;
	this.onlyshownth = false;
	this.holder = document.getElementById(this.options.holder_id); // set holding div
	this.holder.style.display = "hidden"; // hide to begin with
	this.holder.logic = this;
	// image list
	for (var i = 0, l = this.img_list.length; i < l; i++) {
		// set dates
		var dateString = this.img_list[i].key.substring(0, this.img_list[i].key.indexOf("."));
		var YYYY = dateString.substring(0,4);
		var MM = dateString.substring(4,6);
		var DD = dateString.substring(6,8);
		var hh = dateString.substring(9,11);
		var mm = dateString.substring(11,13);
		var ss = dateString.substring(13,15);
		var UTCString = YYYY+"-"+MM+"-"+DD+"T"+hh+":"+mm+":"+ss+"Z"; //2011-04-11T10:20:30Z
		this.img_list[i]["jsdate"] = new Date(UTCString);
		this.img_list[i]["candisplay"] = (i < this.options.img_history_length);

		// create tags
		var thisImgTag = document.createElement("img");
		thisImgTag.dataset.imglistindex = i;
		thisImgTag.style.display = (i==0?"":"none");
		if(i < this.options.img_history_length){
			thisImgTag.src = this.options.domain+"/"+this.img_list[i].bucket+"/"+this.img_list[i].key;
		}

		// add to holder
		this.img_list[i]["imgtag"] = thisImgTag;
	};
	// reverse and add to holder
	for (var i = this.img_list.length - 1; i >= 0; i--) {
		this.holder.prepend(this.img_list[i].imgtag);
	};


	// ======== add mouseover logic
	this.lastseg = 0;
	this.holder.addEventListener("mousemove", (e)=>{
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left; //x position within the element.
		x = Math.ceil(x);
		// % of distance along the line the point is
		var cursor_pt = ((x/this.options.img_width)*100); // where IMAGE_WIDTH is line length
		cursor_pt = Math.ceil(cursor_pt); // rounded up
		// size of segments
		var segment_size = 100/this.segment_count; 
		// number of the segment the point is in
		var cursor_segment = Math.ceil(cursor_pt/segment_size); 
		var segment = (cursor_segment!=0?cursor_segment:1);
		segment = (segment>this.segment_count?this.segment_count:segment);
		// invert segment (as the segments are number 0 being at the left)
		var segmentToUse = (this.segment_count - (segment-1))-1;

		if(this.onlyshownth!=false){
			segmentToUse = segmentToUse*this.onlyshownth;
		}

		db("x:"+x+" segCount:"+this.segment_count+" sizeSeg:"+segment_size+" calcSec:"+cursor_segment+" inverted:"+segmentToUse);

		// can this segment be displayed?
		if(this.img_list[segmentToUse].candisplay && segmentToUse != this.lastseg){
			this.img_list[segmentToUse]["imgtag"].style.display = ""; // display this seg
			this.img_list[this.lastseg]["imgtag"].style.display = "none"; // hide the last one
			this.lastseg = segmentToUse;
		}

	}, false);


	// ==== add dynamic changes
	this.addhistory = (_numberToAdd)=>{ // adds N many more images into the array through the history
		if(this.options.img_history_length + _numberToAdd > this.img_list.size){
			console.log("no more images");
			return false;
		}
		this.options.img_history_length+= _numberToAdd;
		// go this many images back and load their srces
		var amt = 0;
		for(var i = 0, l = this.img_list.length; i < l; i++){
			if(!this.img_list[i].candisplay){
				this.img_list[i].candisplay = true;
				this.img_list[i]["imgtag"].src = this.options.domain+"/"+this.img_list[i].bucket+"/"+this.img_list[i].key;
				amt++;
			}
			if(amt >= _numberToAdd){
				this.segment_count = this.options.img_history_length; // all navigatable
				break;
			}

		}
		return true;
	};

	this.onlyShow = (_nth)=>{// only show every Nth image of displayable imgs. False to set all visible
		// for every loaded in image
		var numNowDisplayed = 0;
		for(var i = 0; i < this.options.img_history_length; i++){

			if(_nth == false){
				this.img_list[i].candisplay = true;
				numNowDisplayed++;
			}else{
				if((i%_nth) == 0){
					console.log("index ["+(i)+"] is a multiple of ["+(_nth)+"]");
					numNowDisplayed++;
				}
				this.img_list[i].candisplay = ((i%_nth) == 0);
			}
			
		}
		this.segment_count = numNowDisplayed;
		this.onlyshownth = _nth;
		console.log("this.segment_count ["+this.segment_count+"]");

	}

 
	this.holder.style.display = ""; // reveal
	return this;
}
