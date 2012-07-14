function start(timer){
	timer.startTime = new Date();
	return timer; 
}

/*
  Returns the time elapsed since start was called.
*/

function lap(timer){
	var timeNow = new Date();
	if (timer == null || timer == undefined || timer.startTime == null || timer.startTime == undefined){
		return null;
	} else {
		return timeNow.getTime() - timer.startTime;
	}
}

function createTimer(){
    return {startTime:null};
}
