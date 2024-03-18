document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var timer = new Date();
    var now = new Date();
    var secondsElapsed = now.getSeconds() - timer.getSeconds();
    var points = 0;
    var nextLevelYes = false;
    $("#points").sevenSeg({
        value: points,
        digits: 2,
        slant: 0,
        decimalPoint: true,
    });

    var aspectRatio, width, height;
    var image = new Image();
    image.src = "image/success.png"; // Replace 'image.png' with the path to your image
    image.onload = function () {
        aspectRatio = image.width / image.height;
        if (aspectRatio > 1) {
            width = 120;
            height = width / aspectRatio;
        } else {
            height = 120;
            width = height * aspectRatio;
        }
        update();
    };

    // Ball with bouncing motion
    var sun = {
        x: 100,
        y: 100,
        radius: 20,
        color: "yellow",
        dx: 2,
        dy: 2,
    };

    // Ball that follows the cursor
    var moon = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 22,
        color: "black",
    };

    function drawBall(ball) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }

    function update() {
        now = new Date();
        // Update bouncing ball position
        //sun.x += sun.dx;
        //sun.y += sun.dy;

        // Check for collision with walls
        if (sun.x + sun.radius > canvas.width || sun.x - sun.radius < 0) {
            sun.dx *= -1;
        }
        if (sun.y + sun.radius > canvas.height || sun.y - sun.radius < 0) {
            sun.dy *= -1;
        }

        // Clear canvas
        if (!nextLevelYes) {
            ctx.fillStyle = "rgb(205,240,255)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Draw bouncing ball

        var coPe = calculateCoveragePercentage();

        var gradient = 255 * (1 - coPe / 100);
        if (!nextLevelYes) {
            ctx.fillStyle = `rgba(${205 * (1 - coPe / 100)},${
                240 * (1 - coPe / 100)
            },${255 * (1 - coPe / 100)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawBall(sun);
            drawBall(moon);
        }
        if (coPe >= 100 ) {
            if (!nextLevelYes) {
                drawImageAtCursor(moon.x, moon.y);
                nextLevelYes = true;
                setTimeout(nextLevel, 1000);
            }
        }
        secondsElapsed = (now - timer) / 1000;
        $("#timer").sevenSeg({
            value: secondsElapsed.toFixed(1),
            digits: 6,
            slant: 0,
            decimalPoint: true,
        });
        if (calculateCoveragePercentage() <= 100 && nextLevelYes == false) {
            document.getElementById('coveragepercent').innerHTML = Math.round(calculateCoveragePercentage());
        }
        requestAnimationFrame(update);
    }

    function calculateCoveragePercentage() {
        // Calculate distance between the centers of the circles
        var distance = Math.sqrt(
            Math.pow(moon.x - sun.x, 2) + Math.pow(moon.y - sun.y, 2)
        );
        // Check if circles intersect
        let minDist = 1.4;
        if (distance < moon.radius + sun.radius && distance > minDist) {
            // Calculate area of intersection
            let r1 = sun.radius;
            let r2 = moon.radius;
            let d1 = (distance ** 2 - r1 ** 2 + r2 ** 2) / (2 * distance);
            let d2 = distance - d1;
            //console.log("d1" + d1 + " d2 " + d2);
            let chord = Math.sqrt(
                (-1 * distance + r1 + r2) *
                    (distance + r1 - r2) *
                    (distance - r1 + r2) *
                    (distance + r1 + r2)
            );
            if (isNaN(chord)) {
                chord = 0;
            }
            //console.log("chord: " + chord);
            let fraction1 = d1 / r2;
            let fraction2 = d2 / r1;
            if (fraction1 > 1) {
                fraction1 = 1;
            }
            if (fraction2 > 1) {
                fraction2 = 1;
            }
            if (fraction1 < -1) {
                fraction1 = -1;
            }
            if (fraction2 < -1) {
                fraction2 = -1;
            }
            let area =
                r1 ** 2 * Math.acos(fraction2) +
                r2 ** 2 * Math.acos(fraction1) -
                0.5 * chord;
            //console.log(d1/r2 + " d1/r2 and " + d2/r1 + " d2/r1");

            //console.log(Math.acos(fraction2)+ " first acos and second acos: " + Math.acos(d1/r2) + " and r1 ^ 2: " + r1 ** 2 + " and r2^2: " + r2**2);
            //console.log("Area: " + area);
            // Calculate percentage of bouncing ball covered by the blue ball
            let sunArea = Math.PI * Math.pow(sun.radius, 2);
            let coPe = (area / sunArea) * 100;
            return coPe;
        } else if (distance < minDist) {
            return minDist * 71.4285714 / distance;
        } else {
            return 0; // No overlap
        }
    }

    function drawImageAtCursor(x, y) {
        ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        console.log(width + " width " + height + " height");
    }

    // Event listener for mouse movement
    canvas.addEventListener("mousemove", function (event) {
        // Get the mouse position relative to the canvas
        let rect = canvas.getBoundingClientRect();
        moon.x = event.clientX - rect.left;
        moon.y = event.clientY - rect.top - (window.innerHeight * 0.05); // window.innerHeight * 0.05 = 5vh
    });

    canvas.addEventListener("touchmove", function (event) {
        let rect = canvas.getBoundingClientRect();
        let touch = event.touches[0];
        moon.x = touch.clientX - rect.left;
        moon.y = touch.clientY - rect.top - (window.innerHeight * 0.05); // window.innerHeight * 0.05 = 5vh
    });

    // Start animation loop

    function nextLevel() {
        console.log("WHY " + points);
        if (nextLevelYes) {
            points++;
            let prevX = sun.x;
            let prevY = sun.y;
            let minX = 0 + sun.radius; // Ensure the circle doesn't go off the left end
            let maxX = canvas.width - sun.radius; // Ensure the circle doesn't go off the right end
            let minY = 0 + sun.radius; // Ensure the circle doesn't go off the left end
            let maxY = canvas.height - sun.radius; // Ensure the circle doesn't go off the right end
            let randomX = prevX;
            while (Math.abs(prevX - randomX) < sun.radius) {
                randomX = minX + Math.random() * (maxX - minX);
            }
            let randomY = prevY;
            while (Math.abs(prevY - randomY) < sun.radius) {
                randomY = minY + Math.random() * (maxY - minY);
            }
            sun.x = randomX;
            sun.y = randomY;
            $("#points").sevenSeg({
                value: points,
                digits: 3,
                slant: 0,
                decimalPoint: true,
            });
        }
        nextLevelYes = false;
    }

    $(function () {
        var viewModel = {
            mainExampleValue: ko.observable(-5.234),
            testValue1: ko.observable(-12.4),
            testValue2: ko.observable(9876),
        };
        ko.applyBindings(viewModel);

        //$("#exampleSingle").sevenSeg({ value: 5 });
        //$("#exampleArray").sevenSeg({ digits: 5, value: 12.35 });

        // setInterval(function() {
        //     var value = +viewModel.mainExampleValue() + 0.001;
        //     viewModel.mainExampleValue(value.toFixed(3));
        // }, 100);

        //$("#testResizableDiv").resizable({aspectRatio: true});
        //$("#testSegInsideResizable").sevenSeg({value: 8});

        $("#testResizableArray").sevenSeg({
            digits: 4,
            slant: 0,
            decimalPoint: true,
        });
        //$("#testResizableDiv2").resizable({aspectRatio: true});
        // $("#testArray1").sevenSeg({
        // 	digits:5,
        // 	value:-98.76,
        // 	colorOff: "#003200",
        // 	colorOn: "Lime",
        // 	slant: 10
        // });

        // $("#btnCreate").click(function() {
        //     $("#testArray2").sevenSeg({digits:4, value:12.34});
        // });

        // $("#btnDestroy").click(function() {
        //     $("#testArray2").sevenSeg("destroy");
        // });

        window.prettyPrint && prettyPrint();
    });
});
