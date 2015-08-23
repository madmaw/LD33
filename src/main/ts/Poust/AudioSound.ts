module Poust {

    export class AudioSound implements ISound {


        public constructor(private _paths: string[]) {
            // attemp preload!
            for (var i in this._paths) {
                var path = this._paths[i];
                var audio = new Audio(path);
                audio.preload = "yes";
                audio.volume = 0;
                audio.play();
            }
        }

        public play(): void {
            var index = Math.floor(Math.random() * this._paths.length);
            var path = this._paths[index];
            var audio = new Audio(path);
            audio.play();
        }
    }

}