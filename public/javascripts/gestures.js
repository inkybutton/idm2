// Gestures that need to be captured.

var gestures = [
    {name: "play", cues:[{type:"audio",data:"public/assets/cues/Play.wav"}]},
    {name: "pause", cues:[{type:"audio",data:"public/assets/cues/Pause.wav"}]},
    {name: "back", cues:[{type:"audio",data:"public/assets/cues/Back.wav"}]},
    {name: "next", cues:[{type:"audio",data:"public/assets/cues/Next.wav"}]},
    {name: "poweroff", cues:[{type:"audio",data:"public/assets/cues/PowerOff.wav"}]},
    {name: "poweron", cues:[{type:"audio",data:"public/assets/cues/PowerOn.wav"}]},
    {name: "scrollbackward", cues:[{type:"audio",data:"public/assets/cues/ScrollBackward.wav"}]},
    {name: "scrollforward", cues:[{type:"audio",data:"public/assets/cues/ScrollForward.wav"}]},
    {name: "stop", cues:[{type:"audio",data:"public/assets/cues/Stop.wav"}]},
    {name: "volumedown", cues:[{type:"audio",data:"public/assets/cues/VolumeDown.wav"}]},
    {name: "volumeup", cues:[{type:"audio",data:"public/assets/cues/VolumeUp.wav"}]},
];

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
