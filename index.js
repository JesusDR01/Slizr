/**
 * @author Jesús Díaz Rivas
 */
const game = () => {
    const INITIAL_HEALTH = 15;
    const CIRCLE_RADIUS = 50;
    const MIN_SPEED = 1;
    const MAX_SPEED = 50;
    const MINUTES_TO_SURVIVE = 0;
    const SECONDS_TO_SURVIVE = 10;
    const defaultValues = [
        INITIAL_HEALTH,
        CIRCLE_RADIUS,
        MIN_SPEED,
        MAX_SPEED,
        MINUTES_TO_SURVIVE,
        SECONDS_TO_SURVIVE,
    ];
    setDefaultInputValues(defaultValues);

    var myCanvas = document.getElementById("micanvas1");
    var context = myCanvas.getContext("2d");

    var rect = drawMenu();
    let logoRotating = rotateImg(drawRotated);
    myCanvas.addEventListener("click", (evt) => {
        clearInterval(logoRotating);
        var [
            INITIAL_HEALTH,
            CIRCLE_RADIUS,
            MIN_SPEED,
            MAX_SPEED,
            MINUTES_TO_SURVIVE,
            SECONDS_TO_SURVIVE,
        ] = getInputValues();

        var mousePos = getMousePosRect(myCanvas, evt);
        if (isInside(mousePos, rect)) {
            context.clearRect(0, 0, 800, 800);
            var mouseX = 0;
            var mouseY = 0;
            var redCircle = new Circle(0, 0, CIRCLE_RADIUS, "red");
            myCanvas.addEventListener("mousemove", handleMouse);
            var score = INITIAL_HEALTH;
            var remainingTime = MINUTES_TO_SURVIVE * 60 + SECONDS_TO_SURVIVE;
            decreaseRemainingTime();
            animate();
        }
        function animate() {
            context.clearRect(0, 0, myCanvas.clientWidth, myCanvas.clientHeight);
            redCircle.update(getRandomInt(MIN_SPEED, MAX_SPEED));
            redCircle = spawnCircle(redCircle);
            score = punishPlayer(redCircle, score);
            drawRemainingTime(remainingTime);
            drawHealth(score);
            if (score > 0 && remainingTime > 0) {
                requestAnimationFrame(animate);
            } else {
                context.clearRect(0, 0, myCanvas.clientWidth, myCanvas.clientHeight);
                drawResultMessage(remainingTime, score);
                drawImgLogo();
                rect = drawPlayAgain();
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
                scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
            return [(evt.clientX - rect.left) * scaleX, (evt.clientY - rect.top) * scaleY];
        }
        function handleMouse(e) {
            //Cuando mueva el ratón voy a actualizar la posición X e Y en función del canvas
            [mouseX, mouseY] = getMousePos(this, e);
        }
        function getCanvasCoords(context, screenX, screenY) {
            let matrix = context.getTransform();
            var imatrix = matrix.invertSelf();
            let x = screenX * imatrix.a + screenY * imatrix.c + imatrix.e;
            let y = screenX * imatrix.b + screenY * imatrix.d + imatrix.f;
            return [x, y];
        }
        function spawnCircle(redCircle) {
            let { x: circleX, y: circleY } = redCircle;
            const SPAWN_DISTANCE = getRandomInt(100, 300);
            const SPAWN_DISTANCE_X = mouseX - SPAWN_DISTANCE;
            const SPAWN_DISTANCE_Y = mouseY - SPAWN_DISTANCE;

            if (circleX >= myCanvas.width || circleY >= myCanvas.height) {
                redCircle = new Circle(SPAWN_DISTANCE_X, SPAWN_DISTANCE_Y, CIRCLE_RADIUS, "red");
            }
            return redCircle;
        }
        function punishPlayer(redCircle, score) {
            //Por defecto mouseX y mouseY es 0, después de moverse el ratón comenzará el juego
            let { x: circleX, y: circleY } = redCircle;
            [mouseX, mouseY] = getCanvasCoords(context, mouseX, mouseY);
            mouseX = parseInt(mouseX);
            mouseY = parseInt(mouseY);

            let distX = mouseX - circleX;
            let distY = mouseY - circleY;
            let distMouseToCircle = Math.hypot(distX, distY);
            let hit = distMouseToCircle <= CIRCLE_RADIUS;

            displayEffects(score, myCanvas, hit);

            if (hit) {
                score--;
            }

            return score;
        }
        function decreaseRemainingTime() {
            setInterval(function () {
                if (remainingTime == 0) clearInterval(this);
                else remainingTime--;
            }, 1000);
        }
        function getInputValues() {
            return Array.from(document.querySelectorAll("input")).map((el) => parseInt(el.value));
        }
    });
    function drawResultMessage(remainingTime, score) {
        if (remainingTime == 0) {
            displayMessage("You won!!", "green", 425, 610);
            drawScore(score);
        } else {
            displayMessage("You lost...", "blue", 425, 535);
        }
    }

    function displayMessage(message, color, messagePosX, messagePoxY) {
        context.beginPath();
        context.stroke();
        context.fillStyle = color;
        context.textAlign = "center";
        context.font = "bold 90px Baloo Da";
        context.fillText(message, messagePosX, messagePoxY);
    }

    function drawPlayAgain() {
        let text = "Play again";
        let textPosX = 280;
        let rectPosX = 94;
        let rectWidth = 600;
        let circlePosX = 520;
        let circlePosY = 700;
        let line1PosY = 670;
        let fontSize = 80;
        let rect = drawPlayBtn(
            text,
            textPosX,
            rectPosX,
            rectWidth,
            circlePosX,
            circlePosY,
            line1PosY,
            fontSize
        );
        return rect;
    }

    function drawScore(score) {
        context.beginPath();
        context.stroke();
        context.fillStyle = "blue";
        context.textAlign = "center";
        context.font = "bold 90px Baloo Da";
        context.fillText(`Score: ${score}`, 425, 535);
    }

    function drawImgLogo() {
        let imgLogo = getImg();
        imgLogo.logoPosX = 115;
        imgLogo.logoPosY = 0;
        imgLogo.addEventListener("load", drawLogo);
    }

    function drawHealth(score) {
        context.fillStyle = "#1BFF16";
        context.textAlign = "center";
        context.font = "bold 30px Baloo Da";
        context.fillText(`Health Points: ${score}`, 640, 30);
    }

    function drawRemainingTime(remainingTime) {
        context.fillStyle = "#1BFF16";
        context.textAlign = "center";
        context.font = "bold 30px Baloo Da";
        context.fillText(`Time remaining: ${remainingTime}`, 656, 75);
    }

    function drawMenu() {
        
        let img = getImg();
        img.logoPosX = 0;
        img.logoPosY = 160;
        img.addEventListener("load", drawLogo);
        img.addEventListener("load", drawHeader);
        
        var playBtn = drawPlayBtn("Play");
       
        return playBtn;
    }
    function drawRotated(degrees){
        context.clearRect(10,180,630,460);
    
        // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
        context.save();
    
        // move to the center of the canvas
        context.translate(myCanvas.width/2,myCanvas.height/2);
        // context.translate(300,300);
    
        // rotate the canvas to the specified degrees
        context.rotate(-degrees*Math.PI/180);
    
        // draw the image
        // since the context is rotated, the image will be rotated also
        let img = getImg();
        img.logoPosX = 0;
        img.logoPosY = 140;
        // context.drawImage(img, this.logoPosX, this.logoPosY);
        context.translate(-10,-90);
        context.drawImage(img,-160,-70,300,300);
        // we’re done with the rotating so restore the unrotated context
        context.restore();
    }

    function drawPlayBtn(
        text,
        textPosX = 395,
        rectPosX = 295,
        rectWidth = 280,
        circlePosX = 525,
        circlePosY = 708,
        line1PosY = 680,
        fontSize = 90
    ) {
        let lineGrad = context.createLinearGradient(250, 222, 150, 280);
        lineGrad.addColorStop(0.15, "#2F73E6");
        lineGrad.addColorStop(0.45, "#8C52FF");
        context.fillStyle = lineGrad;
        context.strokeStyle = "#8C52FF";

        var rect = {
            x: rectPosX,
            y: 625,
            width: rectWidth,
            heigth: 150,
        };
        //make rectangle
        drawRect(rect, text, textPosX, fontSize);

        //make circle
        drawPlayCircle(circlePosX, circlePosY, line1PosY);
        return rect;
    }

    function drawPlayCircle(circlePosX, circlePosY, line1PosY) {
        let playPosX = circlePosX + 30;
        let playPosY = circlePosY - 3;
        let line1PosX = playPosX - 50;
        let line2PosX = line1PosX;
        let line2PosY = line1PosY + 60;

        context.fillStyle = "#2F73E6";
        context.beginPath();
        context.arc(circlePosX, circlePosY, 45, 0, 2 * Math.PI, false);
        context.fill();

        //make play button
        context.fillStyle = "#FF1616";
        context.beginPath();
        context.moveTo(playPosX, playPosY);
        context.lineTo(line1PosX, line1PosY);
        context.lineTo(line2PosX, line2PosY);
        context.fill();
    }

    function drawRect(rect, text, textPosX, fontSize) {
        context.beginPath();
        context.fillRect(rect.x, rect.y, rect.width, rect.heigth);
        context.stroke();
        context.fillStyle = "#1BFF16";
        context.textAlign = "center";
        context.font = `bold ${fontSize}px Baloo Da`;
        context.fillText(text, textPosX, 725);
    }

    function drawLogo() {
        context.drawImage(this, this.logoPosX, this.logoPosY);
    }

    function drawHeader() {
        context.drawImage(this, 159, 217, 139, 49, 0, 0, 800, 178);
    }

    function getImg() {
        let img = new Image();
        img.src = "./SlizrLogo.png";
        return img;
    }

    function isInside(pos, rect) {
        return (
            pos.x > rect.x &&
            pos.x < rect.x + rect.width &&
            pos.y < rect.y + rect.heigth &&
            pos.y > rect.y
        );
    }

    function getMousePosRect(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    function Circle(x, y, radius, color) {
        const DEFAULT_SPEED = 10;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = DEFAULT_SPEED;
        this.draw = function () {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
        };

        this.update = function (speed) {
            this.x += speed;
            this.y += speed;
            this.draw();
        };

        this.update(this.speed);
    }
};

window.addEventListener("DOMContentLoaded", game);

function rotateImg(drawRotated) {
    let i = 0;
    let interval = setInterval(() => {
        drawRotated(i++);
    }, 10);
    return interval;
}

function setDefaultInputValues(defaultValues) {
    const [
        INITIAL_HEALTH,
        CIRCLE_RADIUS,
        MIN_SPEED,
        MAX_SPEED,
        MINUTES_TO_SURVIVE,
        SECONDS_TO_SURVIVE,
    ] = defaultValues;

    const setDefaultValue = (selector, value) => {
        let input = document.querySelector(selector);
        input.setAttribute("value", value);
    };
    handleInputWheel();
    setDefaultValue("#health", INITIAL_HEALTH);
    setDefaultValue("#radius", CIRCLE_RADIUS);
    setDefaultValue("#minSpeed", MIN_SPEED);
    setDefaultValue("#maxSpeed", MAX_SPEED);
    setDefaultValue("#minutes", MINUTES_TO_SURVIVE);
    setDefaultValue("#seconds", SECONDS_TO_SURVIVE);
}

function handleInputWheel() {
    document
        .querySelectorAll("input")
        .forEach((el) => el.addEventListener("wheel", (el) => el.value++));
}

function displayEffects(score, myCanvas, hit) {
    let borderSize = 1;
    let background = 1;

    if (score < 10) {
        borderSize = 10 - score;
        background = 150 - 10 * score;
        myCanvas.style.backgroundColor = `rgb(${background},0,0)`;
    } else {
        myCanvas.style.backgroundColor = `white`;
    }

    if (hit) {
        myCanvas.style.border = `${borderSize}px solid red`;
    } else {
        myCanvas.style.border = "1px solid black";
    }
}
