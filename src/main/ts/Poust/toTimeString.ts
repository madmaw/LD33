function toTimeString(timeMillis: number) {
    var timeSeconds = Math.floor(timeMillis / 1000);
    var timeMinutes = Math.floor(timeSeconds / 60);
    timeSeconds = timeSeconds % 60;
    var timeSecondsString = "" + timeSeconds;
    while (timeSecondsString.length < 2) {
        timeSecondsString = "0" + timeSecondsString;
    }
    return timeMinutes + ":" + timeSecondsString;
}

