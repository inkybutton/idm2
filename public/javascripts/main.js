var states = StateMachine.create({
    initial: 'Idle',
    events: [
	{ name: 'run',from:'Idle',to:'StartScreen'},
	{ name: 'loadGuide',from: 'StartScreen', to: 'Preroll'},
	{ name: 'startCapture', from: 'Preroll', to: 'PrepareForCapture'},
	{ name: 'beginInput', from: 'Waiting', to: 'InputInProgress'},
	{ name: 'moreInput', from: 'InputInProgress', to: 'InputInProgress'},
	{ name: 'endInput', from: 'InputInProgress', to: 'PostInput'},
	{ name: 'waitTimeout', from: 'Waiting', to: 'InputTimedOut'},
	{ name: 'startWaiting', from: ['PostInput','InputTimedOut','PrepareForCapture'],to: 'Waiting'},
	{ name: 'endCapture', from: 'PostInput', to:'SendCapture'}
    ]
});
var DELAY = 10000;
var loopFnId;
var fingerSprite;
var playAudioCue;
var cuePlayer;
function AudioPlayer(elem){
    /*
      This should only be called in a function one of whose parent
      in the call chain is a user-initiated event handler OR a media
      event handler.
     */
    return function(url){
	stopLoop(loopFnId);
	console.debug("old media is "+elem.src+", new is "+url);
	if (elem.src.indexOf(url) == -1){
	    console.debug("new media requested!");
	    elem.src = url;
	    elem.load();
	}
	console.debug("old media requested!");
	setTimeout( //Another call necessary for iOS to play files smoothly?
	    function(){
		loopFnId = loopPlayer(cuePlayer,DELAY);
		elem.play();},10);
    };
}

function gestureAudioCuePath(g){
    var r = new Array();
    for (var k in g.cues){
	var cueType = g.cues[k].type;
	if (cueType == "audio"){
	    return g.cues[k].data;
	}
    }
    return r;
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
	    touchesArray.push({"fid":touchevt.touches[i].identifier,"coords":touchCoords});
	}
	return touchesArray;
    } else {
	touchesArray.push({"fid":0,"coords":getCoords(touchevt)});
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

function setupLoop(audioElem){
    var loop = function(){audioElem.play()};
    audioElem.addEventListener('ended',loop);
    return loop;
}

function loopPlayer(audioElem,delay){
    return setInterval(function(){audioElem.play()},delay);
}

function stopLoop(loopId){
    clearInterval(loopId);
}

states.onSendCapture = function(event,from,to){
    cancelGestureListeners(cb_canvas);
    stopLoop(loopFnId);
    //cuePlayer.removeEventListener("ended",loopFn,false);
    var capturedArr = new Array();
    for (idx in gestures) {
	capturedArr.push({"gid":gestures[idx].name,"captured":gestures[idx].captured});
//	capturedArr[gestures[idx].name] = gestures[idx].captured;
    }
    console.log(capturedArr);
    //var stringifiedData = JSON.stringify(capturedArr);
    // Naming convention for Play to bind to ScreenResolution.
    var data = {"screen.x": window.innerWidth, 
			 "screen.y": window.innerHeight,
			 "captured":JSON.stringify(capturedArr)};
    $.post("/submit",data,function(data){
	//alert(data);
    });
};

states.onrun = function(event,from,to,prerollScreen,canvas,startButton,prerollPlayer,cuePlayer){
    startButton.addEventListener('click',function(e){
	e.preventDefault();
	//states.startCapture();
	//canvas.style.display = "block";
	prerollScreen.style.display = "none";
	//states.startCapture();
	states.loadGuide(prerollPlayer,canvas,cuePlayer);
	return false;
    });
    
}

states.onloadGuide = function(e,from,to,player,canvas){
    player.style.display = "block";
    player.play();
    player.addEventListener('canplaythrough',function(){
	//canvas.style.display = "none";
	//player.style.display = "block";
	player.play();
    });
    player.addEventListener('ended',function(){
	player.style.display = "none";
	canvas.style.display = "block";
	states.startCapture();
    });	
}

states.onstartWaiting = function(event,from,to,gesture){
    gesture.captured = new Array();
    if (gesture.desc != undefined && gesture.desc != null){
	drawStatusText(gesture.desc,cb_ctx);
    }
    performCue(gesture.cues);
    states.onmoreInput = inputCapture(gesture.captured);
};



/*
  This should only be called in a function one of whose parent
  in the call chain is a user-initiated event handler OR a media
  event handler.
*/
states.onPrepareForCapture = function(){
    var canvas = document.getElementById("gestureCapture");
    setupGestureCapture(document.getElementById("gestureCapture"));
    var g = getNextGesture();
    // Preload the first gesture cue - for compatibility reason with iPad.
    cuePlayer.src = gestureAudioCuePath(g);

    cuePlayer.play();
    if (g != null){
	states.startWaiting(g);
    } else {
	// Gesture list is empty!
    }
}

function setupAudioErrorListener(player){
    player.addEventListener('error',function(e){
	console.log("error with audio occurred");
	console.log("error is "+player.error.code);
    });
}	

// Entry point
window.addEventListener('load', function(){
    var config = getConfig();
    //setupAudioErrorListener(config.cuePlayer);
    //loopFn = setupLoop(config.cuePlayer);
    loopFnId = loopPlayer(config.cuePlayer,DELAY);
    cuePlayer = config.cuePlayer;
    playAudioCue = AudioPlayer(config.cuePlayer);
    fingerSprite = config.fingerSprite;
    states.run(config.prerollScreen,config.canvas,config.startButton,
	       config.introVideo,config.cuePlayer);
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
	context.drawImage(fingerSprite.data,curr.coords.x-fingerSprite.centreX,curr.coords.y-fingerSprite.centreY);
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
