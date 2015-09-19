# LD33 

And endless runner on a circular world

Playable build here

http://madmaw.github.io/LD33/js13k/index.html

## Tips and Tricks

### Basic

* Your character will always run forward
* Shooting has recoil, which can be used to accelerate and declerate (and jump higher), but not turn around
* You can wall jump, which will reverse direction
* Running into a wall while on the ground will also reverse direction

### Advanced

* When you first click, you will shoot one bullet, that has no recoil, when you release the click, you will shoot 4 bullets that do have recoil
* The distance the 4 bullets travel is a function of how long you held the mouse button for
* The faster you run, the higher you can jump
* Keeping the jump button held after jumping will make you jump higher 
* Pressing the jump button a second time while in air will make you jump when you hit an obstacle
* Larger enemies take multiple hits to die and have a brief period of invulnerability after being shot
* (Actually a bug) if you shoot an enemy from above at point-blank, it will die instantly, regardless of size
* Levels are randomly generated, however once generated they will not change between plays
* If you can get to difficulty level 10, the world generator is misconfigured and you can end up with massive gaps that are very hard to traverse (plus tons of enemies)
* I've never encountered a level that had a layout that I couldn't beat (enemies on the other hand...), but if you do, you can use the developer tools to delete the level entry from local storage and it will regenerate in a different layout

## Controls

### Desktop

Any key: jumps
Mouse: Shoots

### Touch

When on ground: touch below jumps
When on a wall: touch the wall to wall jump
Touch anywhere else: shoot
Multitouch is supported

### Both

Browser Back: go to the menu
Browser Refresh: reload the current level

## Post Mortem

### Tools

I used TypeScript to write the actual code. Probably a sacreligious thing to say, but I don't like JavaScript (or any dynamic language) that much and TypeScript takes the edge off it. While it does introduce some overheads of its own, it pays you back many times over as soon as you have to refactor something. 

A weird thing I noticed (unfortunately only after LD was finished) is that something in my stack was somehow compiling the TypeScript code every time I refreshed the browser. I never actually investigated how this was happening, but I assume this is some fancy new feature of Chrome. Anyway, it eliminates the biggest problem with using TS, which is manually compiling between each run. 

I used Visual Studio Community Edition. It's got the best TypeScript support of any IDE. Unfortunately the second-biggest drawback of TypeScript is that it doesn't really understand inheritance very well, so if your files get compiled in a different order to your inheritance heirarchy (almost guaranteed to happen), then you'll end up with invalid JavaScript and weird runtime errors. The only solution I'm aware of is to explicitly dictate the order in a dedicated reference file, fortunately Grunt-TS has tools to help with this. Anyway, the upshot of all that is I used VS to code, but not to build.

For the actual build I used Grunt. 

For the compression, I used Uglify initially, but moved to the Closure Compiler after I saw how poorly Uglify dealt with classes, which I had used liberally. The only issue there was that the way that TypeScript creates enums is incompatible with the Closure Compiler, so goodbye enums.

### In the beginning

So this game started out as a Ludum Dare game (hence why this repo is called LD33). I already had the basic concept in my head for what I wanted to do, which unfortunately didn't marry up with the LD33 theme very well, but I figured I could do a cosmetic thing at the end if I had time (I didn't).

I occasionally teach kids to code and the most common game we make is Flappy Bird and we use Stencyl to do it, so I've had a lot of time to think about endless runners. A few things had occurred to me independently 
* It would be nice to be able to learn the level and have warning of what's coming up
* Maybe you could do something where you could control your jumping using shooting
* I wonder if you could represent x and y in terms of angle and radius (which I later learned was called Polar Coordinates)

Anyway, the week before LD I realised that I could do all this in the one game! And, because I'd need to write a custom physics engine for the polar coordinates, I may as well enter it in JS13K too! 

### LD33

While I have written basic physics engines before, I've always done the collision detection by calculating the exact time that the collisions occur. Unfortunately I wasn't sure how well this would translate to polar coordinates, so I decided to play it safe and use the more common method of incrementally backing out of collisions. I tackled this on the first day as this seemed to be the biggest risk area in the game. 

In spite of introducing some subtle bugs that would later cause me headaches, it basically worked quite well and within 12 hours I had something. I still didn't know what I was making though, so the remainder of the weekend was spent trying to put in gameplay mechanics and seeing what worked. I originally wanted to make a Joust style game, hence the name Poust: Polar Joust. It only really started to be fun once I added in enemies and I was running out of time, so I integrated the shooting idea I mentioned before. It was really hard and the level design was brutal, it also looked very rough and didn't follow the theme at all, but I submitted it anyway

Original version: http://madmaw.github.io/LD33/dist/index.html

The comments and ratings on Ludum Dare were fairly unforgiving. 

http://ludumdare.com/compo/ludum-dare-33/?action=preview&uid=5068

An artist is never understood in his own time. 

### The descent into madness

As is the norm after finishing a Ludum Dare, I wanted to keep working on the game. My clients and job had other ideas, but I managed to make some time anyway at the expense of sleep, physical and mental health, a few slipped deadlines, etc... 

Rather than go through it in detail, here is my TODO list of enhancements that I made before I started to run out of space

* Touch controls should be context-aware, if you’re on the ground clicking on the bottom half of the screen should jump, similar with walls, anywhere on the left or right should wall jump
* Any key jumps
* Physics bug where things can fall through the ground needs to be fixed
* Move update method to after collision handling and movement so created entities don’t get left behind creator (bullets)
* Touch coordinates do not respect absolute positions, but instead rotate as the world rotates
* Seems to be a second, less horrible physics bug
* Some performance fixes 
* Bullets go faster
* Audio should use web audio API and be generated client-side
* There should be a noise on hitting a wall while jumping, also the player should look different
* Less psycho difficulty curve
* Falling should be slower when grinding against walls
* Player should be more interesting than a box
* Should show current direction of movement
* Should give visual cues as to available actions (can jump, can wall jump, can shoot in particular)
* Can reverse direction by shooting (no longer compounds)
* Switched to using closure compiler for compression 
* The browser back button and reload button respect the current level and can be able to be used to go back to the start or restart (back) the current level (refresh)
* Concentric circles level should “twist” for every difficulty level
* Restart on current level when dying
* Analytics should track individual levels
* Touch controls should shoot on release and decide if it’s a jump between touch and release
* Add enemy that works like a spike, but can be shot (maneater plant)
* Maybe incorporate more powerful shots when the touch is held longer
* Level select screen
* Better random level generation
* Ensure there is always a path to the exit 
* Merge terrain in level generation
* Handle screen resizing
* Store level info in a single JSON object, access through common functions
* Repeatable level generation using random number seed
* Make enemy generation use the size of the platform 
* Levels that have a lot of one kind of enemy
* Level where you have to maneuver all the way up, then all the way back down
* Center terrain around player
* Explicitly set values on saved json (avoid minification)
* Boss-like monsters

Boss monsters, I thought, had taken up the last space I had left. However through some terrible coding practices, I managed to free up enough space to add

* Add difficulty delta to mergeGridFactory
* Make player center on point when reset
* Larger enemies should deplete quantity available more, 
* Touch jump
* Upper limit on row gap
* big enemies should be chosen in preference to lots of small entities
* Remove getter/setter methods where appropriate

I wanted to have a lava monster that started to eat the level after a certain period of time, but I couldn't get the code small enough (several 100 bytes over), but I realised that I could make the platforms collapse after a period of time, which is almost the same thing. 

* Levels that start to implode after a given time
* Remove concept of sensor
* Remove code from bullets to set velocity of struck object and let physics engine do it
* Platforms should fall (even) slower
* Reduce complexity of timeout calculations (should be simple)
* Parameterize basetimeout and dring timeout? May bloat
* Remove code from AbstractLivingEntity to stop entity on no longer being stunned and let friction do it if required
* Wall collapse noise
* (allow compressor to) replace 999999+1 with scientific notation
* Have an entity type instead of using instanceof
* Centre aligned by default
* delete circular level factory (if I haven’t already?)
* Turn on shake and throbbing
* Merge AbstractEntity and AbstractPolarEntity
* Boom sound overlayed on falling sound
* Spike probability too low
* Merge BulletEntity and AbstractCartesianEntity
* Particles!
* Background 
* Test on firefox
* Turn off sounds if WebAudio not supported
* Touch jump lock
* Touch jump still frustrating, maybe scale area a bit higher
* Walls wider than floors
* Flapper should adjust flap height based on whether it hit the ceiling or floor

At this point, even sensible changes that should have reduced size, were increasing it, so I called it a day with 1 byte to spare. 

The compression tricks I used included
* removing/merging classes where possible
* removing getters/setters
* reducing the use of reserved words (which the Closure Compiler can't remove)
* replacing Math.PI with a global variable named pi (and pi2 for Math.PI * 2)
* merging all HTML/CSS/JS into one file using grunt-inline
* removing the end tags for HTML, BODY, HEAD, CANVAS and a couple of carefully chosen DIV elements
* reducing code. An interesting thing that happened on several occasions is that my smaller code ended up being better than the original algorithm
* removing/shortening string constants
* the latest version of grunt-zip doesn't do compression, so I had to roll back to an earlier version!
* turning classes into functions where possible (TypeScript allows you to specify interfaces that describe a single function and take up no space, which is a nice way of still treating your functions like classes)
* no images, everything is rendered using primitives
* removing features I didn't need (for example, I thought I needed the concept of a sensor in my physics engine, but it works fine without it)
* the CSS and HTML was a goldmine for freeing up space actually, shortening class names helped a lot, as well as using grunt-contrib-cssmin and grunt-contrib-htmlmin
* move specialized code into a common base class and remove the child class(es), which is bad practise to say the least
* removed the space in "GAME OVER" so it read "GAMEOVER" (put it back in because I had 2 bytes spare in the end)
* changed things like if(x!=null) to if(x) 
* created a global variable for window, which seemed to reduce space (Closure is worried you might reassign window to something else and won't do this automatically)
* wrote my own WebAudio sythesizers and passed them parameters to make a lot of different noises
* removed the check for webkitWebAudio, which didn't work anyway due to different method signatures
* didn't fix a bug where you can occasionally fall through the floor (actually never even tracked it down)
* didn't fix the point-blank instakill bug (which is a neat feature anyway, although it should generate blood particles, which it doesn't)

I tend to be a bit of a "fire-and-forget" programmer, rarely revisiting my own work, so it was a really good experience to have to go back over my code and try and squeeze every little bit of complexity out of it. I learned a lot. It was also nice to have a longer timeframe than 48 hours to polish my game after Ludum Dare, while not having so long (or so few constraints) that I could spend heaps of time stroking my chin, thinking of the best way to do something.