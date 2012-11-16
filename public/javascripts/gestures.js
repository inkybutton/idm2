// Gestures that need to be captured.
// aovideo - Audio-only video - a video which does not have any 
// visual content. This is created to provide compatibility with
// how IDM2 is set up and iOS Safari limitations.

var gestures = [
    {name: "play", cues:[{type:"aovideo",data:"video/firstgesture.mp4"}]},
    //{name: "play", cues:[{type:"audio",data:"cues/Play.m4a"}]},
    {name: "pause", cues:[{type:"audio",data:"cues/Pause.m4a"}]},
    {name: "back", cues:[{type:"audio",data:"cues/Back.m4a"}]},
    {name: "next", cues:[{type:"audio",data:"cues/Next.m4a"}]},
    {name: "poweroff", cues:[{type:"audio",data:"cues/PowerOff.m4a"}]},
    {name: "poweron", cues:[{type:"audio",data:"cues/PowerOn.m4a"}]},
   // {name: "scrollbackward", cues:[{type:"audio",data:"cues/ScrollBackward.m4a"}]},
   // {name: "scrollforward", cues:[{type:"audio",data:"cues/ScrollForward.m4a"}]},
    {name: "stop", cues:[{type:"audio",data:"cues/Stop.m4a"}]},
    {name: "volumedown", cues:[{type:"audio",data:"cues/VolumeDown.m4a"}]},
    {name: "volumeup", cues:[{type:"audio",data:"cues/VolumeUp.m4a"}]},
];

function makeQueue(array){
    return {
	i:0,
	queue:array};
}

function peek(q){
    if (q.i < q.queue.length){
	return q.queue[q.i];
    } else {
	return null;
    }
}

function pop(q){
    if (q.i < q.queue.length){
	var popped = q.queue[q.i];
	q.i++;
	return popped;
    }else {
	return null;
    }
}

function nextGesture(q){
    var g = pop(q);
    if (g != null && (g["capturedGesture"] == undefined || g["capturedGesture"] == null)){
	g["capturedGesture"] = Array();
    }
    return g;
}

function peekGesture(q){
    var g = peek(q);   
    if (g != null && (g["capturedGesture"] == undefined || g["capturedGesture"] == null)){
	g["capturedGesture"] = Array();
    }
    return g;
}

/*
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

var getNextIteratedGesture = createIterator(gestures);


  This function generates a new array for the gesture capture
  that the draw functions can mutate and update.

var getNextGesture = function(){
    var array = getNextIteratedGesture();
    if (array != null){
	array["capturedGesture"] = Array();
    }
    return array;
};
*/
