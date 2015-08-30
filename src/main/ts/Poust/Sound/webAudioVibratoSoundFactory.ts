﻿function webAudioVibratoSoundFactory(
    audioContext: AudioContext, 
    startFrequency: number, 
    endFrequency: number,
    vibrations: number, 
    durationSeconds: number
): ISound {

    return function () {

        var now = audioContext.currentTime;

        var oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(startFrequency, now);
        oscillator.frequency.linearRampToValueAtTime(endFrequency, now + durationSeconds);
        oscillator.type = 'square';
        oscillator.start();

        var gain = audioContext.createGain();
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.1, now + durationSeconds * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, now + durationSeconds * 0.2);
        gain.gain.linearRampToValueAtTime(0, now + durationSeconds);

        var vibrato = audioContext.createOscillator();
        vibrato.frequency.value = vibrations / durationSeconds;
        vibrato.type = 'sawtooth';
        vibrato.start();

        var vibratoGain = audioContext.createGain();
        vibratoGain.gain.value = -1000;

        oscillator.connect(gain);
        //gain.connect(vibratoGain);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.detune);
        gain.connect(audioContext.destination);

        setTimeout(function () {
            oscillator.disconnect();
            gain.disconnect();
            vibratoGain.disconnect();
            oscillator.stop();
            vibrato.stop();
        }, durationSeconds * 1000);


    }

}