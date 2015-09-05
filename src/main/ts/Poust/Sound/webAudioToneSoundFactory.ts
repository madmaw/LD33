function webAudioToneSoundFactory(
    audioContext: AudioContext,
    oscillatorType: string,
    startFrequency: number, 
    endFrequency: number, 
    frequencyRange: number,
    attackSeconds: number, 
    decaySeconds: number,
    sustainSeconds: number,
    durationSeconds: number,
    volumeScale = 1.0
): ISound {

    return function (intensity: number) {



        var now = audioContext.currentTime;


        // base noise
        var oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(Math.max(1, startFrequency + frequencyRange * intensity), now);
        oscillator.frequency.linearRampToValueAtTime(Math.max(1, endFrequency + frequencyRange * intensity), now + durationSeconds);
        oscillator.type = oscillatorType;

        //decay
        var gain = audioContext.createGain();
        linearRampGain(gain, now, 0.2 * volumeScale, 0.1 * volumeScale, attackSeconds, decaySeconds, sustainSeconds, durationSeconds);

        // wire up
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
            
        // kill
        setTimeout(function () {
            oscillator.stop();
        }, durationSeconds * 1000);
    }
}

