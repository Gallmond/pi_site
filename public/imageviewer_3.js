document.addEventListener('DOMContentLoaded', ()=>{ 

window.imgCache = <%- JSON.stringify(inMemoryBuckets) %>;
console.log(window.imgCache);

var options = {
	containerDiv: "viewer_container",
	controlsDiv: "viewer_controls",
	defaultRange: 10,
	img_width: 640,
	img_height: 480,

	loadOnViewOnly: true, 
	// true: only loads image src when it would be displayed on-screen.
	// false: loads image sources as soon as the range is set
}
window.lightBox = new lightBoxClass(options);


});// DOMContentLoaded end



function lightBoxClass(_options){
	this.options = _options;
	this.imgCache = window.imgCache;
	this.containerDiv = document.getElementById(this.options.containerDiv);
	this.controlsDiv = document.getElementById(this.options.controlsDiv);


	this.totalImages = window.imgCache.totalImages;
	this.viewableTags = [];
	this.keys = [];


	// show loader
	this.loadingPanel = document.createElement('img');
	this.loadingPanel.src = "/loading.jpg";
	this.loadingPanel.style.height = this.options.img_height+"px";
	this.loadingPanel.style.width = this.options.img_width+"px";
	this.loadingPanel.style.position = "absolute";
	this.containerDiv.appendChild(this.loadingPanel);


	// hide
	this.containerDiv.style.display = "hidden";


	// insert a tag for every image
	var imageCount = 0;
	for(var bucketName in this.imgCache.buckets){
		for (var i = 0; i < this.imgCache.buckets[bucketName].length; i++) {
			this.keys.push(this.imgCache.buckets[bucketName][i]);
			var srcString = "https://s3.eu-west-2.amazonaws.com/"+bucketName+"/"+this.imgCache.buckets[bucketName][i];
			var testImg = document.createElement('img');
			testImg.dataset.unloadedsrc = srcString;
			testImg.dataset.bucket = bucketName;
			testImg.dataset.key = this.imgCache.buckets[bucketName][i];
			testImg.dataset.iscached = "false"; // .complete returns true when it shouldn't
			testImg.onload = function(){ if(this.src!=undefined && this.src!=""){this.dataset.iscached = "true";} } // .complete returns true when it shouldn't
			testImg.style.height = this.options.img_height+"px";
			testImg.style.width = this.options.img_width+"px";
			testImg.style.position = "absolute";

			// load if in default range
			if(imageCount < this.options.defaultRange){
				testImg.src = srcString;
				this.viewableTags.push(testImg);
			}

			// display most recent by default
			if(imageCount!=0){
				testImg.style.display = "none";	
			}
			this.containerDiv.appendChild(testImg);
			imageCount++;
		}
	}
	// show
	this.containerDiv.style.display = "";


	// ========= functions to alter the viewable tags
	this.clearViewable = ()=>{
		// hide current
		for (var i = 0; i < this.viewableTags.length; i++) {
			this.viewableTags[i].style.display = "none";
		};
		this.viewableTags = [];
		console.log("cleared viewableTags");
	}
	this.displayRange = (_timestamp1, _timestamp2)=>{
		this.clearViewable();
		var from  = (_timestamp1 < _timestamp2 ? _timestamp1 : _timestamp2);
		var to = (_timestamp1 > _timestamp2 ? _timestamp1 : _timestamp2);
		var jsFrom = new Date(from);
		var jsTo = new Date(to);
		console.log("jsFrom", jsFrom);
		console.log("jsTo", jsTo);
		// ream through all keys (starting most recent, and compare dates
		for (var i = 0; i < this.keys.length; i++) {
			var keyJSDate = this.jsDateFromKey(this.keys[i]);
			console.log("keyJSDate", keyJSDate);

			if(keyJSDate < jsTo){ // now in range
				this.viewableTags.push( this.getTagFromKey(this.keys[i]) );
			} 

			if(keyJSDate < from){ // now out of range
				break;
			}
		}
		// load now if poss
		if(!this.loadOnViewOnly){
			for (var i = 0; i < this.viewableTags.length; i++) {
				this.loadSrc(this.viewableTags[i]); 
			}
		}
		// set first to visible
		this.viewableTags[0].style.display = "";
		console.log("updated viewableTags: "+this.viewableTags.length);
	}


	// ========= functions to load/display a tag
	this.show = (_segment)=>{
		if(this.viewableTags[_segment].src==undefined || this.viewableTags[_segment].src==""){
			this.loadSrc( this.viewableTags[_segment] );	
		}
		this.viewableTags[_segment].style.display = "";
		console.log("show tag", _segment);
	}
	this.hide = (_segment)=>{
		this.viewableTags[_segment].style.display = "none";
		console.log("hide tag", _segment);
	}


	// ======== add mouseover logic
	this.lastseg = 0;
	this.containerDiv.addEventListener("mousemove", (e)=>{
		e.stopPropagation(); // prevent bubbling
		var rect = e.target.getBoundingClientRect();
		var x = e.clientX - rect.left; //x position within the element.
		x = Math.ceil(x);
		// % of distance along the line the point is
		var cursor_pt = ((x/this.options.img_width)*100); // where IMAGE_WIDTH is line length
		cursor_pt = Math.ceil(cursor_pt); // rounded up
		// size of segments
		var segment_size = 100/this.viewableTags.length; 
		// number of the segment the point is in
		var cursor_segment = Math.ceil(cursor_pt/segment_size); 
		var segment = (cursor_segment!=0?cursor_segment:1);
		segment = (segment>this.viewableTags.length?this.viewableTags.length:segment);
		// invert segment (as the segments are number 0 being at the left)
		var segmentToUse = (this.viewableTags.length - (segment-1))-1;
		debug("x:"+x+" segCount:"+this.viewableTags.length+" sizeSeg:"+segment_size+" calcSec:"+cursor_segment+" inverted:"+segmentToUse);
		// can this segment be displayed?
		if(segmentToUse != this.lastseg){
			this.show(segmentToUse);
			this.hide(this.lastseg);
			this.lastseg = segmentToUse;
		}
	}, false);


	// ======== imcache manip functions
	this.jsDateFromKey = (_key)=>{
		var dateString = _key.substring(0, _key.indexOf("."));
		var YYYY = dateString.substring(0,4);
		var MM = dateString.substring(4,6);
		var DD = dateString.substring(6,8);
		var hh = dateString.substring(9,11);
		var mm = dateString.substring(11,13);
		var ss = dateString.substring(13,15);
		var UTCString = YYYY+"-"+MM+"-"+DD+"T"+hh+":"+mm+":"+ss+"Z"; //2011-04-11T10:20:30Z
		return new Date(UTCString);
	}
	this.getTagFromKey = (_key)=>{
		if(_key.indexOf(".jpg")==-1){
			_key+=".jpg";
		}
		return this.containerDiv.querySelector('[data-key="'+_key+'"]');
	}
	this.loadSrc = (_imgTag)=>{
		if(_imgTag.src == undefined || _imgTag.src == ""){
			_imgTag.src = _imgTag.dataset.unloadedsrc;
		}
	}

}



var debug = (_str)=>{
	document.getElementById('debug').innerHTML=_str;
};