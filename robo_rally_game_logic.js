/***************
 * PART TWO - Create the player controlled robot and it's
 * properties (move and shoot)
 ***************/

/* NOTES TO REMEMBER
 * 1. Drawing to the canvas is expensive. Try to reuse as much as the image as you can for each frame.
 */

/* RESOURCES
 * 1. http://gamedev.tutsplus.com/tutorials/implementation/object-pools-help-you-reduce-lag-in-resource-intensive-games/
 * 2. http://gameprogrammingpatterns.com/object-pool.html
 * 3. http://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games
 * 4. http://www.kontain.com/fi/entries/94636/ (quote on performace)
 * 5. http://code.bytespider.eu/post/21438674255/dirty-rectangles
 * 6. http://www.html5rocks.com/en/tutorials/canvas/performance/
 */


/**
 * Initialize the Game and start it.
 */
var game = new Game();

function init() {
    if (game.init())
        game.start();
}


/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a 
 * singleton.
 */
var imageRepository = new function () {
    // Define images
    this.background = new Image();
    this.bluetile = new Image();

    // Ensure all images have loaded before starting the game
    var numImages = 2;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded === numImages) {
            window.init();
        }
    }
    this.background.onload = function () {
        imageLoaded();
    }
    this.bluetile.onload = function () {
        imageLoaded();
    }

    // Set images src
    this.background.src = "imgs/loveknot2.jpg";
    this.bluetile.src = "imgs/bluetile.png";    
}


/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up defualt variables
 * that all child objects will inherit, as well as the defualt
 * functions. 
 */
function Drawable() {
    this.init = function (x, y, width, height) {
        // Defualt variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    // Define abstract function to be implemented in child objects
    this.draw = function () {
    };
    this.move = function () {
    };
}


/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
function Background() {

    // Implement abstract function
    this.draw = function () {
        this.context.drawImage(imageRepository.background, this.x, this.y);
    };
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/**
 * Create the robot object that the player controls. The robot is
 * drawn on the "robot" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Robot() {
    this.speed = 46;
    this.moving = false;
    this.directionMoving = 1;

    this.draw = function () {
        this.context.drawImage(imageRepository.bluetile, this.x, this.y);
    };
    this.move = function () {
        // Determine if the action is move action
        if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {
            // The robot moved, so erase it's current image so it can
            // be redrawn in it's new location
            this.context.clearRect(this.x, this.y, this.width, this.height);

            // Update x and y according to the direction to move and
            // redraw the robot. Change the else if's to if statements
            // to have diagonal movement.
            if (KEY_STATUS.left) {
                this.x -= this.speed
                if (this.x <= 11) // Keep player within the screen
                    this.x = 11;
            } else if (KEY_STATUS.right) {
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width-9)
                    this.x = this.canvasWidth - this.width-9;
            } else if (KEY_STATUS.up) {
                this.y -= this.speed
                if (this.y <= 8)
                    this.y = 8;
            } else if (KEY_STATUS.down) {
                this.y += this.speed
                if (this.y >= this.canvasHeight - this.height-9)
                    this.y = this.canvasHeight - this.height-9;
            }

            // Finish by redrawing the robot
            this.draw();
        }

    };

}
Robot.prototype = new Drawable();


/**
* Creates the Game object which will hold all objects and data for
* the game.
*/
function Game() {
    /*
	 * Gets canvas information and context and sets up all game
	 * objects. 
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on browsers that do not support the canvas.
	 */
    this.init = function () {
        // Get the canvas elements
        this.bgCanvas = document.getElementById('background');
        this.robotCanvas = document.getElementById('robot');
        this.mainCanvas = document.getElementById('main');

        // Test to see if canvas is supported. Only need to
        // check one canvas
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');
            this.robotContext = this.robotCanvas.getContext('2d');
            this.mainContext = this.mainCanvas.getContext('2d');

            // Initialize objects to contain their context and canvas
            // information
            Background.prototype.context = this.bgContext;
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;

            Robot.prototype.context = this.robotContext;
            Robot.prototype.canvasWidth = this.robotCanvas.width;
            Robot.prototype.canvasHeight = this.robotCanvas.height;

            // Initialize the background object
            this.background = new Background();
            this.background.init(0, 0); // Set draw point to 0,0

            // Initialize the robot object
            this.robot = new Robot();
            // Set the robot to start near the bottom middle of the canvas
            var robotStartX = 11;
            var robotStartY = 8;
            this.robot.init(robotStartX, robotStartY, imageRepository.bluetile.width,
			               imageRepository.bluetile.height);

            return true;
        } else {
            return false;
        }
    };

    // Start the animation loop
    this.start = function () {
        this.robot.draw();
        animate();
    };
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
    requestAnimFrame(animate);
    game.background.draw();
    game.robot.move();   
}


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}

DIRECTIONS = {
    1: "up",
    2: "right",
    3: "down",
    4: "left",
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function (e) {
    // Firefox and opera use charCode instead of keyCode to
    // return which key was pressed.
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = true;
    }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function (e) {
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = false;
    }
}


/**	
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop, 
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (/* function */ callback, /* DOMElement */ element) {
			    window.setTimeout(callback, 1000 / 60);
			};
})();