function webAudioGunSoundFactory(audioContext: AudioContext, sound: ISound): ISound {
    var sampleDurationSeconds = 0.35;
    var frameCount = sampleDurationSeconds * audioContext.sampleRate;
    var buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frameCount; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    return function (intensity: number) {
        // set up the frequency
        var now = audioContext.currentTime;
        var durationSeconds = sampleDurationSeconds + (Math.random() - 0.5) * 0.1;

        var staticNode = audioContext.createBufferSource();
        staticNode.buffer = buffer;
        staticNode.loop = true;

        var filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.value = 600 + Math.random() * 200;

        //decay
        var gain = audioContext.createGain();
        var decay = durationSeconds * 0.2 + Math.random() * 0.05;
        linearRampGain(gain, now, intensity + Math.random() * 0.1, 0.1 * intensity + Math.random() * 0.05, durationSeconds * 0.002, decay, null, durationSeconds); 

        staticNode.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);


        // die
        setTimeout(function () {
            filter.disconnect();
            staticNode.disconnect();
            staticNode.stop();
        }, durationSeconds * 1000);



        staticNode.start();
        if (sound) {
            sound(intensity);
        }
    }

}

