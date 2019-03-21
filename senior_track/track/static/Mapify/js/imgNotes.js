/*
 * imgNotes
 * 
 *
 * Copyright (c) 2013 Wayne Mogg
 * Licensed under the MIT license.
 */
(function($) {
	$.widget("wgm.imgNotes", {
		options: {
			zoom: 1,
			zoomStep: 0.1,
			zoomable: true,
			canEdit: false,  //If this is true you can add/move/delete markers, else you can only view it.
			editMode: false, //If this is true you can add/move/delete markers, else you can only view it.
			topLatLng:{lat:0.51,lng:0.52},
			botLatLng:{lat:0.53,lng:0.54},
			markersLatLng:[{
				lat:0.5,
				lng:0.5,
				note:"Default note."
			}],
			marker:{
				src:"marker_black.png",
				width:27,
				height:40,
				textSize:12,
				textColor:'#000'
			},
			vAll: "middle",
			hAll: "middle",
/*
 * Default callback to create a marker indicating a note location
 *	See the examples for more elaborate alternatives.
 */
			onAdd: function() {
				this.options.vAll = "bottom";
				this.options.hAll = "middle";
				return  $(document.createElement('span')).addClass("marker notSelected").html(this.noteCount);
			},
/*
 *	Default callback when the marker is clicked and the widget has canEdit = true
 *	Opens a dialog with a textarea to write a note.
 *	See the examples for a more elaborate alternative that includes a WYSIWYG editor
 */
			onEdit: function(ev, elem) {
				var $elem = $(elem);
				$('#NoteDialog').remove();
				return $('<div id="NoteDialog"></div>').dialog({
					title: "Note Editor",
					resizable: false,
					modal: true,
					height: "300",
					width: "450",
					position: { my: "left bottom", at: "right top", of: elem},
					buttons: {
						"Save": function() {
							var txt = $('textarea', this).val();
//			Put the editied note back into the data area of the element
//			Very important that this step is included in custom callback implementations
							$elem.data("note", txt);
							$(this).dialog("close");
						},
						"Delete": function() {
							$elem.trigger("remove");
							$(this).dialog("close");
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					},
					open: function() {
						$(this).css("overflow", "hidden");
						var textarea = $('<textarea id="txt" style="height:100%; width:100%;">');
						$(this).html(textarea);
//			Get the note text and put it into the textarea for editing
						textarea.val($elem.data("note"));
					}
				});				
			},
			onEditMarker:function(ev,elem){ //testing, remove when done
				console.log(elem);
				var $elem = $(elem.selected);
				var $allElem = $(elem.all); 
				var toggle = elem.toggle;
				var $img = $(this.img);

				//Reset all previous transformation on the markers
				$.each($allElem, function() { 
					var $elem1 = $(this);
					$elem1.data("selected",false);
					var pos = $img.imgViewer("imgToView",$elem1.data("relx"),$elem1.data("rely"));
					if(pos){
						if($elem1.data("id")==$elem.data("id")){ console.log("Enable dragging for marker "+$elem.data("id"));
							$elem1.data("selected",true);
							//Enable dragging
							$elem1.draggable("enable");
							$elem1.removeClass("notSelected");
							$elem1.addClass("selected");
						}else{
							//Disable dragging
							$elem1.draggable("disable");
							$elem1.removeClass("selected");
							$elem1.addClass("notSelected");
						}
					}
				});

				console.log("selected marker - "+$elem.data("id"));
			},
/*
 *	Default callback when the marker is clicked and the widget has canEdit = false
 *	Opens a dialog displaying the contents of the marker's note
 *	See examples for alternatives such as using tooltips.
 */
			onShow: function(ev, elem) {
				var $elem = $(elem);
				$('#NoteDialog').remove();
				return $('<div id="NoteDialog"></div>').dialog({
					modal: false,
					resizable: false,
					height: 300,
					width: 250,
					position: { my: "left bottom", at: "right top", of: elem},
					buttons: {
						"Close" : function() {
							$(this).dialog("close");
						}
					},
					open: function() {
//Get the note text and put it into the textarea for editing
						$(this).html($elem.data("note"));
						$(this).closest(".ui-dialog").find(".ui-dialog-titlebar:first").hide();
						
					},
					close: function() {
						$(this).dialog("destroy");
					}
				});
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
						'background-image': 'url('+this.options.marker.src+')',
						'font-size':this.options.marker.textSize+'px',
						color:this.options.marker.textColor,
						width:this.options.marker.width+"px",
						height:this.options.marker.height+"px",
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
				$.each(this.notes, function() {
					self.options.onUpdateMarker.call(self, this);
				});
			},
		},
		
		_create: function() {
			var self = this;
			if (!this.element.is("img")) {
				$.error('imgNotes plugin can only be applied to img elements');
			}
			//The note/marker elements
			self.notes = [];

			//The number of notes
			self.noteCount = 0;
			
			//The original img element
			self.img = self.element[0];
			var $img = $(self.img);

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
							onClick: function(ev, imgv) { console.log("this is imgv");console.log(imgv);
								if (self.options.editMode) { 
									ev.preventDefault();
									var rpos = imgv.cursorToImg(ev.pageX, ev.pageY); console.log(rpos);
									if (rpos) {
										var elem = self.addNote(rpos.x, rpos.y);
										//self._trigger("onEdit", ev, elem);
										//self._trigger("onEditMarker",ev,elem);
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

			//Have the image a droppable object so that markers can be dropped after dragging.
			$img.droppable({
				drop: function(ev,ui){
					var yOffset = ui.draggable.data("yOffset");
					var xOffset = ui.draggable.data("xOffset");

					var rpos = $(self.img).imgViewer("viewToImg",ui.position.left+xOffset, ui.position.top+yOffset);

					//Update the marker's new position
					ui.draggable.data("relx",rpos.x).data("rely",rpos.y);
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


		/*
		 * Resets "selected"'s data and the css for all markers
		 */
		resetSelected:function(){ console.log("reseting selected");			
			var self = this;
			
			$.each(self.notes, function() { 
				var $elem = $(this);
				$elem.data("selected",false);
				$elem.removeClass("selected");
				$elem.addClass("notSelected");
			});
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
		 *	Add a note
		 */
		addNote: function(relx, rely, text) { console.log("adding notes");
			var self = this;
			this.noteCount++;
			var elem = this.options.onAdd.call(this);
			var $elem = $(elem);
			$(this.img).imgViewer("addElem",elem);
			$elem.data("relx", relx).data("rely", rely).data("note", text).data("selected",false).data("id",this.noteCount);
			
			switch (this.options.vAll) {
				case "top": $elem.data("yOffset", 0); break;
				case "bottom": $elem.data("yOffset", self.options.marker.height); break;
				default: $elem.data("yOffset", Math.round(self.options.marker.height/2));
			}
			switch (this.options.hAll) {
				case "left": $elem.data("xOffset", 0); break;
				case "right": $elem.data("xOffset", self.options.marker.width); break;
				default: $elem.data("xOffset", Math.round(self.options.marker.width/2));
			}
			//Handle onClick on markers
			$elem.click(function(ev) {
				ev.preventDefault();
				if (self.options.editMode) {
					//self._trigger("onEdit", ev, elem);
					console.log("there are a total of "+self.notes.length+" markers");
					
					var selectedItem = (elem.data("selected"))? null : elem;
					self._trigger("onEditMarker",ev,{all:self.notes, selected:selectedItem});
				} else {
					//self._trigger("onShow", ev, elem);
				}
			});	
			//Handle dragging (default to disabled)
			$elem.draggable({
				//containment:".viewport",
				addClasses:false,
				cursor:"pointer",
				disabled:false,
				opacity:1, //not sure if this works
				stack:"span" //Ensures whatever marker that is being dragged will appear on top of all other markers ie: z-index
			});	
			$elem.draggable("disable");
			$elem.on("remove", function() {
				self._delete(elem);
			});
//			self.options.onUpdateMarker.call(self, elem);
			
			self.notes.push(elem);
			return elem;
		},
/*
 *	Number of notes
 */
		count: function() {
			return this.noteCount;
		},
/*
 *	Delete a note
 */
		_delete: function(elem) {
			this.notes = this.notes.filter(function(v) { return v!== elem; });
			$(elem).remove();
			$(this.img).imgViewer("update");
		},
/*
 *	Clear all notes
 */
		clear: function() {
			var self = this;
			$.each(self.notes, function() {
				var $elem = $(this);
				$elem.remove();
			});
			self.notes=[];
			self.noteCount = 0;
		},
/*
 *	Add notes from a javascript array
 */
		import: function(notes) {
			var self = this;
			$.each(notes, function() {
				self.addNote(this.x, this.y, this.note);
			});
			$(this.img).imgViewer("update");
		},
/*
 *	Add notes from a javascript array using lat lng coordinates instead of percentage
 */
		importLatLng: function(notes){
			var self = this;
			$.each(notes, function(){
				console.log("----Adding marker "+this.noteCount+" --------");
				console.log("topLat = "+self.options.topLatLng.lat+", lng = "+self.options.topLatLng.lng);
				console.log("botLat = "+self.options.botLatLng.lat+", lng = "+self.options.botLatLng.lng);
				console.log("marker lat = "+this.lat+", lng = "+this.lng);

				var percentY = (this.lat - self.options.topLatLng.lat)/(self.options.botLatLng.lat - self.options.topLatLng.lat);
				var percentX = (this.lng - self.options.topLatLng.lng)/(self.options.botLatLng.lng - self.options.topLatLng.lng);
				
				console.log("x% = "+percentX+", y% = "+percentY);
				console.log("----------------------------------------");
				self.addNote(percentX,percentY,this.note);
			});
			$(this.img).imgViewer("update");
		},
/*
 *	Export notes to an array
 */
		export: function() {
			var notes = [];
			$.each(this.notes, function() {
				var $elem = $(this);
				notes.push({
						x: $elem.data("relx"),
						y: $elem.data("rely"),
						note: $elem.data("note")
				});
			});
			return notes;
		}
	});
})(jQuery);
