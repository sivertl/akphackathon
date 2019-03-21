/*
 * mapify
 *
 * Copyright (c) 2015 Zhan H. Yap.
 * This code was modified using Wayne Mogg's imgNotes widget @ https://github.com/waynegm/imgmarker
 * Licensed under the MIT license.
 */
(function($) {
	$.widget("zhy.mapify", {
		options: {
			zoom: 1,
			zoomStep: 0.1,
			zoomable: true,
			editMode: false, //If this is true you can add/move/delete markers, else you can only view it.
			topLatLng: {
				lat:0, 
				lng:0
			},
			botLatLng: {
				lat:1, 
				lng:1
			},
			markersLatLng: [{
				lat:0.5,
				lng:0.5,
				note:"Default note."
			}],
			markerSrc: {
				src:"marker_black.png",
				width:27,
				height:40,
				textSize:12,
				textColor:'#000'
			},
			vAll: "middle",
			hAll: "middle",

			/*
			 * Default callback to create a marker.
			 */
			onAdd: function() {
				this.options.vAll = "bottom";
				this.options.hAll = "middle";
				return  $(document.createElement('span')).addClass("marker").html(this.markerCount);
			},

			/*
			 * Handles the onClick Marker's changes in data and CSS
			 */
			onEditMarker:function(ev,elem){ 
				var $elem = $(elem.selected); console.log("marker selected is id = "+$elem.data("id"));
				var $markerList = $(elem.all); console.log($markerList);
				var $img = $(this.img);
				
				//Reset all previous "selected" data on the markers
				$.each($markerList, function() { 
					var $elem1 = $(this);
					var pos = $img.imgViewer("imgToView",$elem1.data("relx"),$elem1.data("rely"));
					if(pos){ //This makes sure the marker is inside the viewport
						//$elem1.draggable("enable");
						$elem1Id = $elem1.data("id");
						$elemId = $elem.data("id"); console.log("comparing marker "+$elemId+" with marker "+$elem1Id);
						if($elem1.data("id") === $elem.data("id")){ console.log("Enable dragging for marker "+$elem1Id);
							$elem1.data("selected",true);
							//Enable dragging
							$elem1.draggable("enable");
							$elem1.addClass("selected");
						}else{ console.log("Disable dragging for marker "+$elem1Id);
							$elem1.data("selected",false);
							//Disable dragging
							$elem1.draggable("disable");
							$elem1.removeClass("selected");
						}
					}
				});
				console.log("------------------Done comparing------------------");
				//console.log("selected marker - "+$elem.data("id"));
			},
			onDragStart:function(e){ 
				//Nothing by default
			},
			onDrag:function(e){
				//Nothing by default
			},
			onDragStop:function(e){
				//Nothing by default
			},
			onMarkerClick:function(e){
				//Default onMarkerClick
				console.log("default on marker click");
			},

			/*
			 *	Default callback when the markers are repainted
			 */
			onUpdateMarker: function(elem) {
				var $elem = $(elem);
				var $img = $(this.img);
				var pos = $img.imgViewer("imgToView", $elem.data("relx"), $elem.data("rely"));
				if (pos) {
					$elem.css({
						//Marker's CSS property
						'background-image': 'url('+this.options.markerSrc.src+')',
						'font-size':this.options.markerSrc.textSize+'px',
						color:this.options.markerSrc.textColor,
						width:this.options.markerSrc.width+"px",
						height:this.options.markerSrc.height+"px",
						left: (pos.x - $elem.data("xOffset")),
						top: (pos.y - $elem.data("yOffset")),
					});
				}
			},

			/*
			 *	Default callback when the image view is repainted
			 */
			onUpdate: function() {
				var self = this;
				$.each(this.marker, function() {
					self.options.onUpdateMarker.call(self, this);
				});
			},
		},
		
		_create: function() {
			var self = this;
			if (!this.element.is("img")) {
				$.error('mapify plugin can only be applied to img elements');
			}
			//The marker elements
			self.marker = [];

			//The number of markers
			self.markerCount = 0;
			
			//The original img element
			self.img = self.element[0];
			var $img = $(self.img);

			//Boolean to prevent mouseUp from triggering onClick when dragging finishes
			self.isDragging = false;

			//Set the lat lng for top left and bottom right of image
			var $topLat = $('#topLeftLat'); 
			$topLat.val(self.options.topLatLng.lat);
			var $topLng = $('#topLeftLng');
			$topLng.val(self.options.topLatLng.lng);

			var $botLat = $('#bottomRightLat'); 
			$botLat.val(self.options.botLatLng.lat);
			var $botLng = $('#bottomRightLng');
			$botLng.val(self.options.botLatLng.lng);

			//Attach the imgViewer plugin for zooming and panning with a custon click and update callbacks
			$img.imgViewer({
							onClick: function(ev, imgv) {
								if (self.options.editMode) { 
									ev.preventDefault();
									var rpos = imgv.cursorToImg(ev.pageX, ev.pageY); console.log(rpos);
									if (rpos) {
										var latLng = self.convertPercentToLatLng(rpos.x, rpos.y);
										var elem = self.addMarker(rpos.x, rpos.y, latLng.lat, latLng.lng, "");
										self.options.onUpdate.call(self); //Repaint after adding a marker
									}
								}
							},
							onUpdate: function(ev, imgv) {
								self.options.zoom = imgv.options.zoom;
								self.options.onUpdate.call(self);
							},
							zoom: self.options.zoom,
							zoomStep: self.options.zoomStep,
							zoomable: self.options.zoomable
			});

			//Have the image a droppable object so that markers can be dropped onto it.
			$img.droppable({
				drop: function(ev,ui){
					var yOffset = ui.draggable.data("yOffset");
					var xOffset = ui.draggable.data("xOffset");

					var rpos = $(self.img).imgViewer("viewToImg",ui.position.left+xOffset, ui.position.top+yOffset);

					var latLng = self._trigger("convertPercentToLatLng", rpos.x, rpos.y);
					//Update the marker's new position
					ui.draggable.data("relx",rpos.x).data("rely",rpos.y).data("lat",latLng.lat).data("lng",latLng.lng);
				}
			});	

			$img.imgViewer("update");

			//Grab list of markers
			self.importLatLng(self.options.markersLatLng);
		},

		/*
		 *	Remove the plugin
		 */  
		destroy: function() {
			this.clear();
			$(this.img).imgViewer("destroy");
			$.Widget.prototype.destroy.call(this);
		},

		moveMarker:function(elem, lat, lng){ 
			var self = this;
			console.log("moving marker "+elem.data("id")+" to ("+lat+","+lng+")");

			var rel = self.convertLatLngToPercent(lat,lng);

			//Update the marker's new position
			elem.data("relx",rel.relx).data("rely",rel.rely).data("lat",lat).data("lng",lng);
			//console.log("moved marker to %("+rel.relx+","+rel.rely+")");
			$(self.img).imgViewer("update");
		},

		getSelectedMarker:function(){
			var self = this;
			var elem = null;
			$.each(self.marker, function(){
				var $elem = $(this);
				if($elem.data("selected")){ console.log("found 1 = "+$elem.data("id")); console.log($elem);
					elem = $elem;
				}
			});
			return elem;
		},

		/*
		 * Resets every marker's "selected"'s data, disable dragging, and its CSS
		 */
		resetSelected:function(){ console.log("reseting selected");			
			var self = this;
			$.each(self.marker, function(){
				var $elem = $(this);
				$elem.data("selected",false);
				$elem.removeClass("selected");
				$elem.draggable("disable");
			});
		},
		
		convertPercentToLatLng:function(relx, rely){
			var self = this;
			var lat = relx * (self.options.botLatLng.lat - self.options.topLatLng.lat) + self.options.topLatLng.lat;
			var lng = rely * (self.options.botLatLng.lng - self.options.topLatLng.lng) + self.options.topLatLng.lng;
			return {lat: this.roundToX(lat,6), lng: this.roundToX(lng,6)};
		},

		convertLatLngToPercent:function(lat, lng){
			var self = this;
			var relx = (lat - self.options.topLatLng.lat)/(self.options.botLatLng.lat - self.options.topLatLng.lat);
			var rely = (lng - self.options.topLatLng.lng)/(self.options.botLatLng.lng - self.options.topLatLng.lng);
			return {relx: relx, rely: rely};
		},

		roundToX:function(value, decimals){
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		},

		_setOption: function(key, value) {
			switch(key) {
				case 'vAll':
					switch(value) {
						case 'top': break;
						case 'bottom': break;
						default: value = 'middle';
					}
					break;
				case 'hAll':
					switch(value) {
						case 'left': break;
						case 'right': break;
						default: value = 'middle';
					}
					break;
			}
			var version = $.ui.version.split('.');
			if (version[0] > 1 || version[1] > 8) {
				this._super(key, value);
			} else {
				$.Widget.prototype._setOption.apply(this, arguments);
			}
			switch(key) {
				case 'zoom':
					$(this.img).imgViewer("option", "zoom", value);
					break;
				case 'zoomStep':
					$(this.img).imgViewer("option", "zoomStep", value);
					break;
				case 'zoomable':
					$(this.img).imgViewer("option", "zoomable", value);
					break;
			}
		},

		/*
		 *	Pan the view to be centred at the given relative image location
		 */
		panTo: function(relx, rely) {
			return $(this.img).imgViewer("panTo", relx, rely);
		},
			
		/*
		 *	Add a marker
		 */
		addMarker: function(relx, rely, lat, lng, text) { console.log("adding marker");
			var self = this;
			self.markerCount++;
			var elem = this.options.onAdd.call(this);
			var $elem = $(elem);
			$(this.img).imgViewer("addElem",elem);
			$elem.data("relx", relx)
				.data("rely", rely)
				.data("lat", lat)
				.data("lng", lng)
				.data("note", text)
				.data("selected",false)
				.data("id",self.markerCount);
			
			switch (this.options.vAll) {
				case "top": $elem.data("yOffset", 0); break;
				case "bottom": $elem.data("yOffset", self.options.markerSrc.height); break;
				default: $elem.data("yOffset", Math.round(self.options.markerSrc.height/2));
			}
			switch (this.options.hAll) {
				case "left": $elem.data("xOffset", 0); break;
				case "right": $elem.data("xOffset", self.options.markerSrc.width); break;
				default: $elem.data("xOffset", Math.round(self.options.markerSrc.width/2));
			}
			//Handle onClick on markers
			$elem.click(function(ev) {
				ev.preventDefault();
				if (self.options.editMode && !self.isDragging) {
					var selectedItem = ($elem.data("selected"))? null : elem;
					self._trigger("onEditMarker",ev,{selected:selectedItem, all: self.marker});
					self.options.onMarkerClick(selectedItem);
				}else{
					self.isDragging = false;
				}
			});	

			//Handle dragging (default to disabled)
			$elem.draggable({
				addClasses: false,
				cursor: "pointer",
				//disabled: false,
				opacity: 1, //not sure if this works
				stack: "span", //Ensures whatever marker that is being dragged will appear on top of all other markers ie: z-index
				start: function(ev, ui){
					self.isDragging = true;
					self.options.onDragStart({target: $(this)});
				},
				drag: function(ev, ui){
					self.isDragging = true;
					var yOffset = $(this).data("yOffset");
					var xOffset = $(this).data("xOffset");

					var rpos = $(self.img).imgViewer("viewToImg",ui.position.left+xOffset, ui.position.top+yOffset);
					var latLng = self.convertPercentToLatLng(rpos.x, rpos.y); 
					//Update the marker's new position
					$(this).data("relx",rpos.x).data("rely",rpos.y).data("lat",latLng.lat).data("lng",latLng.lng);

					self.options.onDrag({target: $(this)});
				},
				stop: function(ev, ui){
					self.isDragging = true;
					self.options.onDragStop({target: $(this)});
				},
			});	
			$elem.draggable("disable"); //disabled by default
			$elem.on("remove", function() {
				self._delete(elem);
			});
			//self.options.onUpdateMarker.call(self, elem);
			
			self.marker.push(elem);
			return elem;
		},
		
		/*
		 *	Number of markers
		 */
		count: function() {
			return this.markerCount;
		},
		
		/*
		 *	Delete a marker from Wayne Mogg
		 */
		_delete: function(elem) {
			this.marker = this.marker.filter(function(v) { return v!== elem; });
			$(elem).remove();
			$(this.img).imgViewer("update");
		},

		/*
		 *	Delete a marker from Zhan Yap
		 */
		deleteMarker:function(elem){
			this.marker = this.marker.filter(function(v) { return v.data("id")!= elem.data("id"); }); 
			$(elem).detach();
			$(this.img).imgViewer("update"); console.log("after deleting 1 marker, there is "+this.marker.length+" markers left");
		},
		
		/*
		 *	Clear all markers
		 */
		clear: function() {
			var self = this;
			$.each(self.marker, function() {
				var $elem = $(this);
				$elem.remove();
			});
			self.marker=[];
			self.markerCount = 0;
		},
		
		/*
		 *	Add marker from a javascript array
		 */
		import: function(marker) {
			var self = this;
			$.each(marker, function() {
				self.addMarker(this.x, this.y, this.note);
			});
			$(this.img).imgViewer("update");
		},
		
		/*
		 *	Add marker from a javascript array using lat lng coordinates instead of percentage
		 */
		importLatLng: function(marker){
			var self = this;
			$.each(marker, function(){
				console.log("----Adding marker "+self.markerCount+" --------");
				console.log("topLat = "+self.options.topLatLng.lat+", lng = "+self.options.topLatLng.lng);
				console.log("botLat = "+self.options.botLatLng.lat+", lng = "+self.options.botLatLng.lng);
				console.log("marker lat = "+this.lat+", lng = "+this.lng);

				var percentY = (this.lat - self.options.topLatLng.lat)/(self.options.botLatLng.lat - self.options.topLatLng.lat);
				var percentX = (this.lng - self.options.topLatLng.lng)/(self.options.botLatLng.lng - self.options.topLatLng.lng);
				
				console.log("x% = "+percentX+", y% = "+percentY);
				console.log("----------------------------------------");
				self.addMarker(percentX, percentY, this.lat, this.lng, this.note);
			});
			$(this.img).imgViewer("update");
		},

		/*
		 *	Export the marker list
		 */
		exportMarker:function(){
			return this.marker;
		},

		printSelected: function(){ //Debug only
			$.each(this.marker,function(){
				var $elem = $(this);
				console.log("Marker id = "+$elem.data("id")+" has selected = "+$elem.data("selected")+", draggable is disabled : "+$elem.draggable("option","disabled"));
			});
		},


	});
})(jQuery);
