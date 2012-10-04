var states = StateMachine.create({
    initial: 'Idle',
    events: [
	{ name: 'run',from:'Idle',to:'Preroll'},
	{ name: 'startCapture', from: 'Preroll', to: 'PrepareForCapture'},
	{ name: 'beginInput', from: 'Waiting', to: 'InputInProgress'},
	{ name: 'moreInput', from: 'InputInProgress', to: 'InputInProgress'},
	{ name: 'endInput', from: 'InputInProgress', to: 'PostInput'},
	{ name: 'waitTimeout', from: 'Waiting', to: 'InputTimedOut'},
	{ name: 'startWaiting', from: ['PostInput','InputTimedOut','PrepareForCapture'],to: 'Waiting'},
	{ name: 'endCapture', from: 'PostInput', to:'SendCapture'}
    ]
});

var fingerSprite;
var playAudioCue;
function AudioPlayer(elem){
    //console.debug(elem);
    return function(url){
	elem.src = url;
	elem.play();
    };
}

function performCue(cues){
    var results = new Array();
    for (var k in cues){
	var cueType = cues[k].type;
	if (cueType == "audiogroup"){
	}
	if (cueType == "audio"){
	    results[k] = playAudioCue(cues[k].data);
	}
    }
    return results;
}

var cb_canvas = null;
var cb_ctx = null;
var cb_lastPoints = null;
var cb_easing = 0.4;
var currentGesture = Array();
var timer = createTimer();

var bgColour = "rgb(0,0,0)";
var penColour = "rgb(245,236,176)";
var labelColour = "rgb(255,255,255)";

function TouchArray(touchevt){
    var touchesArray = new Array();
    if (touchevt.touches != undefined && touchevt.touches != null){
	for (var i = 0;i < touchevt.touches.length;i++){
	    var touchCoords = getCoords(touchevt.touches[i]);
	    // Gson does not allow getting keys, so making it a list of objects.
	    touchesArray.push({"id":touchevt.touches[i].identifier,"coords":touchCoords});
	    //touchesArray[touchevt.touches[i].identifier] = touchCoords;
	}
	return touchesArray;
    } else {
	//touchesArray[0] = getCoords(touchevt);
	touchesArray.push({"id":0,"coords":getCoords(touchevt)});
	return touchesArray;
    }
}

function serialiseTouchPoints(touches,timer){
    return {time:lap(timer),touches:touches};
}	

function logTouch(serialisedTouch){
    console.log("Time: ",serialisedTouch.time,", and we have num touch points ",serialisedTouch.touches);
}

var inputCapture = function(container){
	return function(event,from,to,newGesturePosition){
	    clearScreen(cb_canvas,cb_ctx,bgColour);
	    var touches = TouchArray(newGesturePosition);
	    var serialised = serialiseTouchPoints(touches,timer);
	    drawFingers(cb_ctx,touches);
	    //logTouch(serialised);
	    container.push(serialised);
	};
}
		
states.onbeginInput = function(event,from,to){
	// First finger, starts the timer.
	//alert("yep!")
	timer = start(timer);
};

// onendInput is called whenever a finger stopped
// touching the screen. It determines whether all fingers
// have left the screen. If not, it cancels the event.
states.onbeforeendInput = function(event,from,to,touchevt){
    if (touchevt.touches != undefined){
	console.log("End input called. Number of fingers on screen is now:"+touchevt.touches.length);
	if (touchevt.touches.length != 0){
	    return false;
	}
    }
};

states.onPostInput = function(event,from,to){
    clearScreen(cb_canvas,cb_ctx,bgColour);
    var nextGesture = getNextGesture();
    if (nextGesture != null){
	states.startWaiting(nextGesture);
    } else {
	states.endCapture();
    }
};

function cancelGestureListeners(canvas){
    //Nullify all event handlers to prevent more input.
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.ontouchstart = null;
    canvas.ontouchstop = null;
    canvas.ontouchmove = null;
}

states.onSendCapture = function(event,from,to){
    cancelGestureListeners(cb_canvas);
    var capturedArr = {};
    console.log(capturedArr);
    for (idx in gestures) {
	capturedArr[gestures[idx].name] = gestures[idx].captured;
    }
    console.log(capturedArr);
    //var stringifiedData = JSON.stringify(capturedArr);
    // Naming convention for Play to bind to ScreenResolution.
    var data = {"screen.x": window.innerWidth, 
			 "screen.y": window.innerHeight,
			 "captured":JSON.stringify(capturedArr)};
    $.post("/submit",data,function(data){
	alert(data);
    });
};

states.onrun = function(event,from,to,prerollScreen,canvas,startButton){
    // for Mobile browsers, user intervention is needed to trigger loading
/*    player.style.display = "block";
    player.addEventListener('canplaythrough',function(){
	canvas.style.display = "none";
	player.style.display = "block";
	player.play();
    });
    player.addEventListener('ended',function(){
	player.style.display = "none";
	canvas.style.display = "block";
	states.startCapture();
    });	
*/
    startButton.addEventListener('click',function(e){
	e.preventDefault();
	states.startCapture();
	prerollScreen.style.display = "none";
	return false;
    });
    
}

states.onstartWaiting = function(event,from,to,gesture){
    gesture.captured = new Array();
    //gesture.captured.desc = gesture.desc;
    //gesture.captured.name = gesture.name;
    if (gesture.desc != undefined && gesture.desc != null){
	drawStatusText(gesture.desc,cb_ctx);
    }
    performCue(gesture.cues);
    states.onmoreInput = inputCapture(gesture.captured);
};

states.onPrepareForCapture = function(){
    var canvas = document.getElementById("gestureCapture");
    setupGestureCapture(document.getElementById("gestureCapture"));
    var g = getNextGesture();
    //drawFingerSprite(cb_ctx,0,0);
    if (g != null){
	states.startWaiting(g);
    } else {
	// Gesture list is empty!
    }
}

// Entry point
window.addEventListener('load', function(){
    var config = getConfig();
    playAudioCue = AudioPlayer(config.cuePlayer);
    fingerSprite = config.fingerSprite;
    states.run(config.prerollScreen,config.canvas,config.startButton);
    //states.startCapture();
},false);

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
    elem.style.display = "block";
    var context = elem.getContext('2d');
    cb_canvas = elem;
    cb_ctx = context;
    clearScreen(cb_canvas,cb_ctx,bgColour);
    cb_lastPoints = Array();
    context.lineWidth = 2;
    context.strokeStyle = penColour;
    context.beginPath();
    
    // For debugging on computer
    elem.onmousedown = startDraw;
    elem.onmouseup = stopDraw;

    elem.ontouchstart = startDraw;
    elem.ontouchend = stopDraw;
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

function drawFingers(context,touches){
    for (var touch in touches){
	var curr = touches[touch];
	context.drawImage(fingerSprite.data,curr.x-fingerSprite.centreX,curr.y-fingerSprite.centreY);
    }
}

function startDraw(e) {
    if (e.touches) {
	// Touch event
	e.preventDefault();
    }
    else {
	// Mouse event
	cb_canvas.onmousemove = drawMouse;
    }
    if (states.can('beginInput')){
	states.beginInput();	
    }
    return false;
}

// Called whenever cursor position changes after drawing has started
function stopDraw(e) {
    e.preventDefault();
    cb_canvas.onmousemove = null;
    states.endInput(e);
}

function drawMouse(e) {
	states.moreInput(e);
	return false;
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

//states.onSendCapture = function(event,from,to){
//    alert("hello");
//    var capturedArr = new Array();
//    for (idx in gestures){
	//	alert(gestures[idx]);
//	capturedArr.push(gestures[idx].captured);
//    }
//    var stringifiedData = JSON.stringify(capturedArr);
    //DownloadJSON2CSV(capturedArr);
//    alert(csvForGesture(capturedArr[0]));
//    var csv = csvForGestures(capturedArr);
    //line = line.slice(0,line.length-1); 	
    //var str += line + '\r\n';
//    window.open( "data:text/csv;charset=utf-8," + escape(csv))
//}

function csvForGesture(capturedGesture){
    var csv = "";
    csv += capturedGesture.name + ", \r\n";
    //alert(csv);
    for (idx in capturedGesture){
	if (capturedGesture[idx].time != undefined && capturedGesture[idx].touches != undefined){
	    csv += capturedGesture[idx].time + ",";
	 //   console.log("Idx is "+idx+", csv is now "+csv);
	    for (touchIdx in capturedGesture[idx].touches){
		var currPoint = capturedGesture[idx].touches[touchIdx];
		csv += "["+ currPoint.x + ","+ currPoint.y + "]" + ",";
	    }
	    csv += "\r\n";
	}
    }
    return csv;
}

function csvForGestures(gestures){
    var csv = "";
    for (idx in gestures){
	csv += csvForGesture(gestures[idx])
    }
    return csv;
}

function DownloadJSON2CSV(objArray)
{
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    
    var str = '';
    
    for (var i = 0; i < array.length; i++) {
        var line = '';
	
        for (var index in array[i]) {
            line += array[i][index] + ',';
        }
	
        // Here is an example where you would wrap the values in double quotes
        // for (var index in array[i]) {
        //    line += '"' + array[i][index] + '",';
        // }
	
        line.slice(0,line.Length-1); 
	
        str += line + '\r\n';
    }
    window.open( "data:text/csv;charset=utf-8," + escape(str))
}
