# DColumn 
Dynamic Columns Viewer

Dcolumns is Module that will split the web contents document automatically.
It offers the ability to be viewed by turning the split screen after the screen split. 

Requirement
--------------------------------------
* jQuery 2.x


How to build 
--------------------------------------

1. npm install

```bash
npm install
```

2. bower install

```bash
bower install
```

Usage
--------------------------------------

```html
<div id="contents">Long web contents.....</div>
```
```javascript
var viewer = new Dcolumns($("#contents"), {
	"nColumPadding" : 10,  // column padding
	"nMarginHeight" : 0,   // margin height
	"nMarginWidth" : 0,    // margin width
	"nAdjustAngle" : 45    // flicking angle

});
viewer.load();

```

Relese Note
--------------------------------------
v0.0.1 
* Module Open

Contributing
------------
Please send me a pull request so that this can be improved.

License
-------
This is released under the MIT license.
