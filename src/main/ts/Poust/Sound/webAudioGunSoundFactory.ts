module Poust.Sound {

    export function webAudioGunSoundFactory(audioContext: AudioContext, sound: ISound): ISound {
        var sampleDurationSeconds = 0.35;
        var frameCount = sampleDurationSeconds * audioContext.sampleRate;
        var buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < frameCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return function () {
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
            gain.gain.value = 0;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4 + Math.random() * 0.1, now + durationSeconds * 0.002);
            gain.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.05, now + durationSeconds * 0.2 + Math.random() * 0.05);
            gain.gain.linearRampToValueAtTime(0, now + durationSeconds);


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
                sound();
            }
        }

    }

}