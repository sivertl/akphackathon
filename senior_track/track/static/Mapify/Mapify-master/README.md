# Mapify
Basic map/marker functionality but on an image.<br/>
This is a modification of Wayne Mogg's [imgNotes](https://github.com/waynegm/imgNotes) <br/><br/>
**Author**: Wayne Mogg<br/>
**Modified by** : Zhan Yap<br/>
**License** : MIT

##Usage
```html
//Include jQuery
<script type="text/javascript" src="js/jquery/jquery.js"></script>

//Include jQuery-UI for drag/drop
<script type="text/javascript" src="js/jquery/jquery-ui.js"></script>

//Include toe.js from https://github.com/visiongeist/toe.js
//toe.js is a tiny library based on jQuery to enable sophisticated gestures on touch devices
<script type="text/javascript" src="js/toe.min.js"></script>

//Include jQuery Mousewheel
<script type="text/javascript" src="js/jquery.mousewheel.min.js"></script>

//Include imgViewer from https://github.com/waynegm/imgViewer
<script type="text/javascript" src="js/imgViewer.min.js"></script>

//Include the CSS
<style type="text/css" media="all">@import "css/marker.css";</style>
```

Put an image element and a javascript block to attach the plugin to the image in the DOM
```html
<body>
    ...
    <img  class="image" src="example.png"/>              
    ...
    <script type="text/javascript">
        (function($) {
            $(document).ready(function() {
                $(".image").mapify();
            });
        })(JQuery);
    </script>
    ...
</body>
```

##Options
###zoomStep
* How much the zoom changes for each mousewheel click (positive number)
* Default : 0.1
* Example : To change each mousewheel click to 0.15 
```html
$(".image").mapify("option", "zoomStep", 0.15);
```

###zoom
* Get/Set the current zoom level of the image (>=1)
* Default : 1 (ie the entire image is visible) 
* Example : Display the image magnified 4X
```html
$(".image").mapify("option", "zoom", 4);
```

###zoomable
* Boolean to control if the image is zoomable
* Default : true
* Example : To disable image zooming
```html
$(".image").mapify("option", "zoomable", false);
```

###editMode
* Boolean to control if the image is editable or view only.
* Default : false
* Example : To enable edit mode
```html
$(".image").mapify("option", "editMode", true);
```

###vAll
* Controls the vertical positioning of the marker relative to the marker location. The change only affects markers subsequently inserted
* Valid Values: "top", "middle" or "bottom"
* Default: "middle"
* Example : Change the center point to "bottom"
```html
$(".image").mapify("option", "vAll", "bottom");
```

###hAll
* Controls the horizontal positioning of the marker relative to the marker location. The change only affects markers subsequently inserted
* Valid Values: "left", "middle" or "right"
* Default: "middle"
* Example : Change the center point to "right"
```html
$(".image").mapify("option", "hAll", "right");
```

**Important** : vAll and hAll is used concurrently to determine the center point of the marker image.

![Marker](/img/markerPosition.png)<br/>
**Example** : 
* **1** : {vAll: "top", hAll: "left"}
* **2** : {vAll: "top", hAll: "middle"}
* **3** : {vAll: "top", hAll: "right"}
* **4** : {vAll: "middle", hAll: "left"}
* **5** : {vAll: "middle", hAll: "middle"}
* **6** : {vAll: "middle", hAll: "right"}
* **7** : {vAll: "bottom", hAll: "left"}
* **8** : {vAll: "bottom", hAll: "middle"}
* **9** : {vAll: "bottom", hAll: "right"}

###topLatLng
*  The top left corner of the image's latitude & longitude
*  Default : {lat : 0, lng : 0}
*  Example : Set the top left corner of the image's latitude and longitude to 49.285546 and -123.119395 respectively.
```html
$(".image").mapify("option", "topLatLng", {
    lat: 49.285546,
    lng : -123.119395
});
```

###botLatLng
*  The bottom right corner of the image's latitude & longitude
*  Default : {lat : 1, lng : 1}
*  Example : Set the bottom right corner of the image's latitude and longitude to 49.284271 and -123.117394 respectively.
```html
$(".image").mapify("option", "botLatLng", {
    lat: 49.284271,
    lng : -123.117394
});
```

###markersLatLng
* An array of markers to be inserted upon document ready into the image. The "note" property is the tooltip when hovering over the marker, it can be ignored.
* Default : [{lat : 0.5, lng : 0.5, note : "Default note."}]
* Example : Add 2 markers.
```html
$(".image").mapify("option", "markersLatLng", [
    {lat : 49.284893 , lng : -123.118376, note : "Intersection"},
    {lat : 49.285524 , lng : -123.118718, note : "Cactus Club" }
]);
```

###onAdd
* Callback triggered when a marker/note is added to the widget to allow developers to define their own markers. This will happen when notes are imported using the "import" method and when the user clicks on the widget in edit mode. Within the callback "this" refers to the imgNotes widget.
* Default: Inserts a numbered inverted black teardrop image aligned to point at the insertion point
* Callback Arguments: none
* Callback Returns: the new marker element
* Example:
```html
$(".image").imgNotes("option", "onAdd", function() {
    this.options.vAll = "bottom";
    this.options.hAll = "middle";
    return  $(document.createElement('span')).addClass("marker notSelected").html(this.markerCount);
});
```

###onEditMarker
* Callback triggered by a mouseclick on the marker, to select it or deselect it when the widget is in edit Mode (editMode: true).
* Default : Draws a dashed border around the marker when selected, otherwise empty.
* Callback Arguments:
    * ev: the click event
    * elem: the marker DOM element
    
###onUpdateMarker
* Callback triggered when a marker is redrawn. Within the callback "this" refers to the imgNotes widget.
* Default: Display the marker at its original size on the image positioned according to the vAll and hAll alignment options
* Callback Arguments:
    * elem: the marker DOM element
* Example
```html
$(".image").mapify({
        onUpdateMarker: function(elem) {
            var $elem = $(elem);
            var $img = $(this.img);
            var pos = $img.imgViewer("imgToView", $elem.data("relx"), $elem.data("rely"));
            var zoom = $img.imgViewer("option", "zoom");
            if (pos) {
                $elem.css({
                    left: (pos.x - $elem.data("xOffset")),
                    top: (pos.y - $elem.data("yOffset")),
                    position: "absolute",
                    transform: "scale(" + zoom + "," + zoom + ")"
                });
            }
        }
});
```

###onUpdate
* Callback triggered when the view is redrawn. Within the callback "this" refers to the imgNotes widget.
* Default: Display the markers by calling onUpdateMarker for each note
* Example
```html
$(".image").imgNotes({
        onUpdate: function() {
                var self = this;
                $.each(this.marker, function() {
                    self.options.onUpdateMarker.call(self, this);
                });
            }
});
```

###onDragStart
* jQuery's onDragStart event callback when start dragging a marker.
* Default : null
* Example : Logging to the console a message.
```html
    $(".image").mapify({
        ...
        onDragStart: function(){
            console.log("Override for on drag start.");
        }
        ...
    });
```

###onDrag
* jQuery's onDrag event callback when dragging a marker.
* Default : null
* Example : Logging to the console a message.
```html
    $(".image").mapify({
        ...
        onDrag: function(){
            console.log("Override for on dragging.");
        }
        ...
    });
```

###onDragStop
* jQuery's onDragStop event callback when stop dragging a marker.
* Default : null
* Example : Logging to the console a message.
```html
    $(".image").mapify({
        ...
        onDragStop: function(){
            console.log("Override for on drag stop.");
        }
        ...
    });
```

##Public Methods
###addMarker (needs to edit)
* Add a marker to the image.
    * Triggers the "onAdd" callback to insert the markup for the marker
    * Stores the marker location, id and text into the marker element
* Binds the click event of the marker element to trigger the onShow or onEdit callbacks dependant on the editMode option.
* Arguments:
    * relx: relative x image coordinate for the marker
    * rely: relative y image coordinate for the marker
    * note: the note text which can include html
* Returns the marker element
* Example
```html
elem = $(".image").mapify("addNote", 0.5,0.5,"Default note.");
```

###count
* Get the number of markers in the widget
* Arguments: none
* Returns: the number of markers in the widget
* Example
```html
count = $(".image").mapify("count");
```

###clear
* Delete all the markers from the widget
* Arguments: none
* Returns: the widget object for chainability
* Example
```html
$(".image").mapify("clear");
```
###moveMarker
* Move a marker to the position specified by the provided latitude, longitude
* Arguments:
	* elem: The marker to be move
	* lat: The new latitude
	* lng: The new longitude
* Returns: the widget object for chainability
* Example
```html
$(".image").mapify("moveMarker",$elem, 4.9,-123.45);
```
###getSelectedMarker
* Goes through the list of markers and returns the marker whose's data "selected" is true
* Arguments: non
* Returns: the marker
* Example
```html
marker = $(".image").mapify("getSelectedMarker");
```
###convertPercentToLatLng
* Converts the given x and y percent into latitude and longitude based on the topLatLng and botLatLng values
* Arguments:
	* relx: x% (ranges from 0 to 1)
	* rely: 1% (ranges from 0 to 1)
* Returns: {lat: (latitude to the 6th decimal), lng: (longitude to the 6th decimal)}
* Example
```html
latLng = $(".image").mapify("convertPercentToLatLng", 0.65, 0.75);
```

###convertLatLngToPercent
* Convert the given latitude and longitude into x and y percent based on the topLatLng and botLatLng values
* Arguments:
	* lat: latitude  (ranges from topLatLng.lat and botLatLng.lat values)
	* lng: longitude (ranges from topLatLng.lng and botLatLng.lng values)
* Returns: {relx: (value from 0 to 1), rely:(value from 0 to 1)}	
* Example
```html
percent = $(".image").mapify("convertLatLngToPercent", 49.432442, -123.434355);
```

###roundToX
* Round the value to the nearest x decimal
* Arguments:
	* value: the float value
	* decimals: the nearest decimal
* Returns: the value after being rounded into the nearest decimal
* Example
```html
value = $(".image").mapify("roundToX",123.33444566,6);
```

###deleteMarker
* Deletes the given marker
* Arguments:
	* elem: the marker element
* Returns: the widget object for chainability
* Example
```html
$(".image").mapify("deleteMarker",marker1);
```

###exportMarker
* Export the marker list
* Arguments: none
* Returns : the marker list
* Example
```html
markers = $(".image").mapify("exportMarker");
```

###resetSelected
* Resets all marker's "selected" data and its draggable to false.
* Arguments: none
* Returns : none
* Example
```html
$(".image").mapify("resetSelected");
```

###import (might delete)
* Add markers from a javascript array to the widget
* Arguments - a javascript array of marker objects: javascript [ { x: relative x image coordinate, y: relative y image coordinate, note: the note text },... ] 
* Returns: the widget object for chainability
* Example
```html
$(".image").mapify("import", [ 
    {x: 0.5, y:0.5, note:"AFL Grand Final Trophy"}, 
    {x: "0.322", y:"0.269", note: "Brisbane Lions Flag"},
    {x: "0.824", y: "0.593", note: "Fluffy microphone"}
]);
```

###importLatLng
* Add markers from a javascript array to the widget
* Arguments - a javascript array of marker objects : javascript [{lat: ..., lng: ..., note: the note text },...]
* Returns: the widget object for chainability
* Example
```html
$img.mapify("importLatLng", [
    {lat: 49.284893, lng:-123.118376, note:"Intersection"},
    {lat: 49.285524, lng:-123.118718, note:"Cactus Club"},
    {lat:49.285022 , lng: -123.118267, note:"Brandi Show Lounge"}
]);
```

###panTo
* Pan the view to be centred at the given relative image coordinates
* Arguments: relx: relative x image coordinate rely: relative y image coordinate
* Returns a javascript object with the relative image coordinates of the view centre after snapping the edges of the zoomed image to the view boundaries.
```html   
{ 
    x: view center relative x image coordinate, 
    y: view center relative y image coordinate
}
```
* Returns null if the relative image coordinates are not >=0 and <=1 and the view is not changed.
* Example:
```html
$(".image").mapifys("panTo", 0.5,0.0);
```

##License
This plugin is provided under the [MIT License](http://opensource.org/licenses/MIT). 

##Release History
###0.1
* Working release.

###0.2
* Create marker when onClick anywhere on the image and retrieving the correct latitide and longitude.

###0.3
* Ability to select marker and draw border around it to display to user that this marker is selected.
* Can drag and drop marker, but have to select the marker first.
* Drop marker into the correct latitude and longitude and have it remain there after redrawing.

###0.4
* Abiility to delete selected marker
* Ability to display selected marker's latitude and longitude into a textbox as it is being drag in real time.
* Ability to display selected marker's latitude and longitude into a textbox as it is clicked on.
	* If no marker is selected, that textbox is empty
* Ability to move the selected marker via textbox. If user enters a latitude or longitude that is outside that scope of the values of topLatLng and botLatLng, it will not move.

##Bugs
* If zoomable is set to true, and a marker is selected while zoomed in. After the user zooms out, it becomes not draggable eventhough the jquery draggable is not disable.