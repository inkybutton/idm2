var states = StateMachine.create({
    initial: 'Preroll',
    events: [
	{ name: 'startCapture', from: 'Preroll', to: 'PrepareForCapture'}, 
	{ name: 'beginInput', from: 'Waiting', to: 'InputInProgress'},
	{ name: 'moreInput', from: 'InputInProgress', to: 'InputInProgress'},
	{ name: 'endInput', from: 'InputInProgress', to: 'PostInput'},
	{ name: 'waitTimeout', from: 'Waiting', to: 'InputTimedOut'},
	{ name: 'startWaiting', from: ['PostInput','InputTimedOut','PrepareForCapture'],to: 'Waiting'},
	{ name: 'endCapture', from: 'PostInput', to:'SendCapture'}
    ]
});

var gestures = [
    {name: "play", cues:[{type:"audiogroup",data:[{url:"assets/cues/Play.ogg"},{url:"assets/cues/Play.aac"}]}],desc: "Play",captured: null},
    {name: "pause", url:"", desc: "Pause", captured: null}
    ];

var getNextIteratedGesture = createIterator(gestures);

/*
  This function generates a new array for the gesture capture
  that the draw functions can mutate and update.
*/
var getNextGesture = function(){
    var array = getNextIteratedGesture();
    if (array != null){
	array["capturedGesture"] = Array();
    }
    return array;
};

var cb_canvas = null;
var cb_ctx = null;
var cb_lastPoints = null;
var cb_easing = 0.4;
var currentGesture = Array();
var timer = createTimer();

var bgColour = "rgb(0,0,0)";
var penColour = "rgb(245,236,176)";
var labelColour = "rgb(255,255,255)";


function serialiseTouchPoints(touchevt,timer){
    var time = lap(timer);
    var touchesArray = Array();
    if (touchevt.touches != undefined && touchevt.touches != null){
	for (var i = 0;i < touchevt.touches.length;i++){
	    var touchCoords = getCoords(touchevt.touches[i]);
	    touchesArray[touchevt.touches[i].identifier] = touchCoords;
	}
	return {time: time,touches:touchesArray};
    } else {
	touchesArray[0] = getCoords(touchevt);
	return {time:time,touches:touchesArray};
    }
}	

function logTouch(serialisedTouch){
    console.log("Time: ",serialisedTouch.time,", and we have num touch points ",serialisedTouch.touches);
}

var inputCapture = function(container){
	return function(event,from,to,newGesturePosition){
	    //TODO Put handler code here
	    var serialised = serialiseTouchPoints(newGesturePosition,timer);
	    logTouch(serialised);
	    container.push(serialised);
	};
}

states.onbeginInput = function(event,from,to){
    if (states.can(event)){
	// This means we haven't entered InputInProgress. So this is when the first touch is fired.
	timer = start(timer);
    } else {
	return false;
    }
};

states.onPostInput = function(event,from,to){
    //cb_ctx.fillStyle = bgColour;
    //cb_ctx.fillRect(0,0,cb_canvas.width,cb_canvas.height);
    clearScreen(cb_canvas,cb_ctx,bgColour);
    var nextGesture = getNextGesture();
    if (nextGesture != null){
	states.startWaiting(nextGesture);
    } else {
	states.endCapture();
    }
};

states.onSendCapture = function(event,from,to){
    //Nullify all event handlers to prevent more input.
    cb_canvas.onmousedown = null;
    cb_canvas.onmouseup = null;

    cb_canvas.ontouchstart = null;
    cb_canvas.ontouchstop = null;
    cb_canvas.ontouchmove = null;
};

function playAudioCue(data){
    
}    

function performCue(cues){
    var results = new Array();
    for (var k in cues){
	if (cues[k].type == "audiogroup"){
	    results[k] = playAudioCue(cues[k].data);
	}
    }
    return results;
}

states.onstartWaiting = function(event,from,to,gesture){
    drawStatusText(gesture.desc,cb_ctx);
    gesture.captured = new Array();
    gesture.captured.desc = gesture.desc;
    performCue(gesture.cues);
    states.onmoreInput = inputCapture(gesture.captured);
};

states.onPrepareForCapture = function(){
    setupGestureCapture(document.getElementById("gestureCapture"));
    var g = getNextGesture();
    if (g != null){
	states.startWaiting(g);
    } else {
	// Gesture list is empty!
    }
}

window.addEventListener('load', function(){
    //init();
    states.startCapture();
},false);

function createIterator(arrayToIterate){
    var i = 0;
    return function(){
	if (i <= arrayToIterate.length-1){
	    i++;
	   return arrayToIterate[i-1];
	} else {
	    return null;
	}
    };
}
/*
function clearScreen(canvas,context,colour){
    context.fillStyle = colour;
    context.fillRect(0,0,canvas.width,canvas.height);
}
*/

function drawStatusText(statusText,context){
    var oldColour = context.fillStyle;
    context.fillStyle = labelColour;
    context.fillText(statusText,10,50);
    context.fillStyle = oldColour;
}

/* Should only be called during 
InitialiseCapture phase!
*/
function setupGestureCapture(elem){
    setupGrowingCanvas(elem,window);
    var context = elem.getContext('2d');
    cb_canvas = elem;
    cb_ctx = context;
    clearScreen(cb_canvas,cb_ctx,bgColour);
    cb_lastPoints = Array();
    context.lineWidth = 2;
    //context.strokStyle = "rgb(239,242,177)";
    context.strokeStyle = penColour;
    //cb_canvas = context;
    context.beginPath();
    
    // For debugging on computer
    //elem.onmousedown = startDraw;
    elem.addEventListener('mousedown',startDraw);
    elem.addEventListener('mousedown',states.beginInput);
    elem.addEventListener('mousemove',drawMouse);
    elem.addEventListener('mouseup',stopDraw);
    //elem.onmouseup = stopDraw;
    elem.addEventListener('touchstart',startDraw);
    elem.addEventListener('touchstart',states.beginInput);
    //elem.ontouchstart = startDraw;
    elem.addEventListener('touchend',stopDraw);
    // elem.ontouchend = stopDraw;
    elem.addEventListener("touchmove",drawMouse);

}

/*
  Makes canvas the size of the container, and sets up a callback on the container
  to resize the canvas as the container grows or shrinks.
  The container is any element that implements addEventListener('resize',func),
  innerHeight and innerWidth.
  Used to make canvas fullscreen in this instance.
*/
function setupGrowingCanvas(canvas,container){
    if (container != null && container.addEventListener && container.innerHeight && container.innerWidth) {
	canvas.height = container.innerHeight;
	canvas.width = container.innerWidth;
	container.addEventListener("resize",function(){
	    canvas.height = container.innerHeight;
	    canvas.width = container.innerWidth;
	});
    } else {
	return false;
    }
}

function startDraw(e) {
	if (e.touches) {
		// Touch event
	    e.preventDefault();
		for (var i = 1; i <= e.touches.length; i++) {
			cb_lastPoints[i] = getCoords(e.touches[i - 1]); // Get info for finger #1
		}
	}
	else {
		// Mouse event
		cb_lastPoints[0] = getCoords(e);
	}
    states.beginInput();	
    return false;
}

// Called whenever cursor position changes after drawing has started
function stopDraw(e) {
    e.preventDefault();
    cb_canvas.onmousemove = null;
    states.endInput();
}

function drawMouse(e) {
	if (e.touches) {
		// Touch Enabled
		for (var i = 1; i <= e.touches.length; i++) {
			var p = getCoords(e.touches[i - 1]); // Get info for finger i
			cb_lastPoints[i] = drawLine(cb_lastPoints[i].x, cb_lastPoints[i].y, p.x, p.y);
		}
	}
	else {
		// Not touch enabled
		var p = getCoords(e);
		cb_lastPoints[0] = drawLine(cb_lastPoints[0].x, cb_lastPoints[0].y, p.x, p.y);
	}
	cb_ctx.stroke();
	cb_ctx.closePath();
	cb_ctx.beginPath();
	states.moreInput(e);
	return false;
}

// Draw a line on the canvas from (s)tart to (e)nd
function drawLine(sX, sY, eX, eY) {
	cb_ctx.moveTo(sX, sY);
	cb_ctx.lineTo(eX, eY);
	return { x: eX, y: eY };
}

// Get the coordinates for a mouse or touch event
function getCoords(e) {
	if (e.offsetX) {
		return { x: e.offsetX, y: e.offsetY };
	}
	else if (e.layerX) {
		return { x: e.layerX, y: e.layerY };
	}
	else {
		return { x: e.pageX - cb_canvas.offsetLeft, y: e.pageY - cb_canvas.offsetTop };
	}
}
