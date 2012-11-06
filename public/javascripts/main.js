var states = StateMachine.create({
    initial: 'Idle',
    events: [
	{ name: 'run',from:'Idle',to:'StartScreen'},
	{ name: 'loadGuide',from: 'StartScreen', to: 'Preroll'},
	{ name: 'startCountdown', from: ['Preroll','Postroll'], to: 'Countdown'},
	{ name: 'startCapture', from: 'Countdown', to: 'PrepareForCapture'},
	{ name: 'beginInput', from: 'Waiting', to: 'InputInProgress'},
	{ name: 'moreInput', from: 'InputInProgress', to: 'InputInProgress'},
	{ name: 'endInput', from: 'InputInProgress', to: 'PostInput'},
	{ name: 'waitTimeout', from: 'Waiting', to: 'InputTimedOut'},
	{ name: 'startWaiting', from: ['PostInput','InputTimedOut','PrepareForCapture'],to: 'Waiting'},
	{ name: 'endCapture', from: 'PostInput', to:'SendCapture'},
	{ name: 'endScreen', from: 'SendCapture', to: 'Postroll'}
    ]
});
var fingerSprite;
var DELAY = 10000;
var loopFnId;
var cuePlayer;
var aoVideoPlayer;

function loopPlayer(audioElem,delay){
    return setInterval(function(){audioElem.play()},delay);
}

function stopLoop(loopId){
    clearInterval(loopId);
}

function loadCue(url,player){
    if (player.src.indexOf(url) == -1){
	player.src = url;
	// new Audio() method
	//var player = new Audio(url);
	var loadTime = start(createTimer());
	instrument(player,url,loadTime);
	player.load();
    }
}

function instrument(player,url,loadTime){
    player.addEventListener('loadstart',function f(){
	console.log("loadCue: Media "+url+" has started loading "+lap(loadTime) + " since start");
	player.removeEventListener('loadstart',f,false);
    });
    player.addEventListener('loadeddata',function f(){
	console.log("loadCue: Media "+url+" can play "+lap(loadTime) + " since start");
	player.removeEventListener('loadeddata',f,false);
    });

    player.addEventListener('canplaythrough',function f(){
	console.log("loadCue: Media "+url+" can be played through."+lap(loadTime) + " since start");
	player.removeEventListener('canplaythrough',f,false);

    });
    return player;
}

    /*
      This should only be called in a function one of whose parent
      in the call chain is a user-initiated event handler OR a media
      event handler. (Compatibility with iOS Safari)
     */
function playCue(url,player){
	stopLoop(loopFnId);
	console.debug("loopFnId is "+loopFnId);
	if (player.src.indexOf(url) == -1){
	    console.debug("new media requested!");
	    loadCue(url,player);
	}
	setTimeout( //Another call necessary for iOS to play files smoothly?
	    function(){
		loopFnId = loopPlayer(player,DELAY);
		player.play();},10);
}

function getBackendPlayer(cue){
    var cueType = cue.type;
    if (cueType == "audio"){
	return cuePlayer;
    } else if (cueType == "aovideo"){
	return aoVideoPlayer;
    }
}

function cuePaths(cues){
    var results = new Array();
    for (var k in cues){
	results[k] = cues[k].data;
    }
    return results;
}

function performCue(cues){
    var results = new Array();
    for (var k in cues){
	var cueType = cues[k].type;
	if (cueType == "audio"){
	   //results[k] = playCue(cues[k].data,cuePlayer);
	    results[k] = playCue(cues[k].data,new Audio());
	} else if (cueType == "aovideo"){
	    results[k] = playCue(cues[k].data,aoVideoPlayer);
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

function TouchArray(touchevt,idTable){
    var touchesArray = new Array();
    if (touchevt.touches != undefined && touchevt.touches != null){
	for (var i = 0;i < touchevt.touches.length;i++){
	    var touchCoords = getCoords(touchevt.touches[i]);
	    var id = getId(idTable,touchevt.touches[i].identifier);
	    touchesArray.push({"fid":id,"coords":touchCoords});
	}
	return touchesArray;
    } else {
	touchesArray.push({"fid":0,"coords":getCoords(touchevt)});
	return touchesArray;
    }
}

function serialiseTouchPoints(touches,timer){
    var timeSoFar = lap(timer);
    return {time:lap(timer),touches:touches};
}	

function logTouch(serialisedTouch){
    console.log("Time: ",serialisedTouch.time,", and we have num touch points ",serialisedTouch.touches);
}

var inputCapture = function(container,idTable){
	return function(event,from,to,newGesturePosition){
	    clearScreen(cb_canvas,cb_ctx,bgColour);
	    var touches = TouchArray(newGesturePosition,idTable);
	    var serialised = serialiseTouchPoints(touches,timer);
	    drawFingers(cb_ctx,touches);
	    //logTouch(serialised);
	    container.push(serialised);
	};
}
		
states.onbeginInput = function(event,from,to){
	// First finger, starts the timer.
	timer = start(timer);
};

// onendInput is called whenever a finger stopped
// touching the screen. It determines whether all fingers
// have left the screen. If not, it cancels the event.
states.onbeforeendInput = function(event,from,to,touchevt){
    if (touchevt.touches != undefined){
//	console.log("End input called. Number of fingers on screen is now:"+touchevt.touches.length);
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
    cancelGestureListeners(canvas);
    canvas.style.display = "none";
    stopLoop(loopFnId);
    var capturedArr = new Array();
    for (idx in gestures) {
	capturedArr.push({"gid":gestures[idx].name,"captured":gestures[idx].captured});
    }
    console.log(capturedArr);
    // Naming convention for Play to bind to ScreenResolution.
    var data = {"screen.x": window.innerWidth, 
			 "screen.y": window.innerHeight,
			 "captured":JSON.stringify(capturedArr)};
    $.post("/submit",data,function(){
	//
    });
    states.endScreen(postroll);
};

var countdown;

function makeCountdown(time,tick,done){
    var intervalId = setInterval(function(){
	if (time != 0){
	    time--;
	    tick(time);
	} else {
	    clearInterval(intervalId);
	    done();
	}
    },1000);
}

states.onCountdown = function(){
    var countDisplay = countdown.getElementsByClassName("time")[0];
    var secs = 3;
    console.log(countDisplay);
    countDisplay.innerHTML = ""+secs;
    countdown.style.display = "block";
    makeCountdown(secs,function(t){
	countDisplay.innerHTML = ""+t;
    },
		   function(){
		       countdown.style.display = "none";
		       states.startCapture();
		   });
};

var postroll;
var restartButton;
states.onendScreen = function(e,from,to,postElem){
    postElem.style.display = "block";
    restartButton.addEventListener('click',function(){
	postElem.style.display = "none";
	states.startCountdown()},false);
}

states.onrun = function(event,from,to,prerollScreen,canvas,startButton,prerollPlayer,cuePlayer){
    startButton.addEventListener('click',function(e){
	e.preventDefault();
	prerollScreen.style.display = "none";
	states.loadGuide(prerollPlayer,canvas,cuePlayer);
	return false;
    });
    
}

function minimisePlayer(player){
    player.style.height = "1px";
    player.style.width = "1px";
    return player;
}

function restorePlayer(player){
    player.style.height = "auto";
    player.style.width = "auto";
    return player;
}

states.onloadGuide = function(e,from,to,player,canvas){
    console.log("Debug: onloadGuide now called.");
    document.getElementById("loadingMsg").style.display = "block";
    player.load();
    player.addEventListener('canplaythrough',function(){
	document.getElementById("loadingMsg").style.display = "none";
	player.style.display = "block";
	player.play();
    });
    player.addEventListener('ended',function endListener(){
	aoVideoPlayer = minimisePlayer(player);
	// Remove once fired.
	player.removeEventListener("ended",endListener,false);
	states.startCountdown();
    });	
}

states.onstartWaiting = function(event,from,to,gesture){
    gesture.captured = new Array();
    gesture.idTable = emptyIDHashtable();
    if (gesture.desc != undefined && gesture.desc != null){
	drawStatusText(gesture.desc,cb_ctx);
    }
    performCue(gesture.cues);
    states.onmoreInput = inputCapture(gesture.captured,gesture.idTable);
};


var canvas;
/*
  This should only be called in a function one of whose parents
  in the call chain is a user-initiated event handler OR a media
  event handler.
*/
states.onPrepareForCapture = function(){
    setupGestureCapture(canvas);
    getNextIteratedGesture = createIterator(gestures);
    var g = getNextGesture();
    
    // Preload the first gesture cue - for compatibility reason with iPad.
    loadCue(cuePaths(g.cues)[0],getBackendPlayer(g.cues[0]));
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
    loopFnId = loopPlayer(config.cuePlayer,DELAY);
    cuePlayer = config.cuePlayer;
    canvas = config.canvas;
    postroll = config.postrollScreen;
    countdown = config.countdown;
    restartButton = config.restartButton;
    fingerSprite = config.fingerSprite;
    states.run(config.prerollScreen,config.canvas,config.startButton,
	       config.introVideo,config.cuePlayer);
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
