module Poust.Sound {

    export function audioSoundFactory(paths: string[]) {

        // attempt preload!
        for (var i in paths) {
            var path = paths[i];
            var audio = new Audio(path);
            audio.preload = "yes";
            audio.volume = 0;
            audio.play();
        }

        return function() {
            var index = Math.floor(Math.random() * paths.length);
            var path = paths[index];
            var audio = new Audio(path);
            audio.play();
        }

    }

}