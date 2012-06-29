var states = StateMachine.create({
    initial: 'IntroMovie',
    events: [
	{ name: 'startCapture', from: 'IntroMovie', to: 'PrepareForCapture'}, 
	{ name: 'beginInput', from: 'Waiting', to: 'InputInProgress'},
	{ name: 'endInput', from: 'InputInProgress', to: 'PostInput'},
	{ name: 'waitTimeout', from: 'Waiting', to: 'InputTimedOut'},
	{ name: 'startWaiting', from: ['PostInput','InputTimedOut','PrepareForCapture'],to: 'Waiting'},
	{ name: 'endCapture', from: 'PostInput', to:'SendCapture'}
    ]
});

var gestures = [
    {name: "play", url:"", desc: "Play"},
    {name: "pause", url:"", desc: "Pause"}
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

var bgColour = "rgb(0,0,0)";
var penColour = "rgb(245,236,176)";
var labelColour = "rgb(255,255,255)";

states.onbeginInput = function(event,from,to){
    //alert("Input started!");
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

states.onstartWaiting = function(event,from,to,gesture){
    drawStatusText(gesture.desc);
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

function clearScreen(canvas,context,colour){
    context.fillStyle = colour;
    context.fillRect(0,0,canvas.width,canvas.height);
}

function drawStatusText(statusText){
    cb_ctx.fillStyle = labelColour;
    cb_ctx.fillText(statusText,10,50);
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
    elem.onmousedown = startDraw;
    elem.onmouseup = stopDraw;

    elem.ontouchstart = startDraw;
    elem.ontouchstop = stopDraw;
    elem.ontouchmove = drawMouse;

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
		for (var i = 1; i <= e.touches.length; i++) {
			cb_lastPoints[i] = getCoords(e.touches[i - 1]); // Get info for finger #1
		}
	}
	else {
		// Mouse event
		cb_lastPoints[0] = getCoords(e);
		cb_canvas.onmousemove = drawMouse;
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
    //alert("hello");
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
