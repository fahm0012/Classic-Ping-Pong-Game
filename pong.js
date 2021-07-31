"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
    // get the svg canvas element
    const svg = document.getElementById("canvas");
    // Setting Middle boundary 
    const gap = 28;
    function CreateMiddleBoundary(x, y, w, h, color = "white") {
        const boundaryLine = document.createElementNS(svg.namespaceURI, "rect");
        boundaryLine.setAttribute("x", String(x));
        boundaryLine.setAttribute("y", String(y));
        boundaryLine.setAttribute("width", String(w));
        boundaryLine.setAttribute("height", String(h));
        boundaryLine.setAttribute("fill", color);
        svg.appendChild(boundaryLine);
    }
    rxjs_1.range(25, 775).pipe(operators_1.filter(x => x % 25 === 0)).subscribe(y => CreateMiddleBoundary(398, y, 5, 15));
    //Creating the paddle for the User.Some code is copied from week 4 Tutorial
    const UserPaddle = document.createElementNS(svg.namespaceURI, 'rect');
    Object.entries({
        x: 50, y: 350,
        width: 8, height: 60,
        fill: 'white',
        Score: 0
    }).forEach(([key, val]) => UserPaddle.setAttribute(key, String(val)));
    svg.appendChild(UserPaddle);
    // Take Keyboard key s to move th Userslider up and key w to move UserSlider up
    const step = 10;
    const keyboardReader = rxjs_1.merge(rxjs_1.fromEvent(document, 'keypress')
        .pipe(operators_1.map(e => e.key), operators_1.filter(key => (key === 'w')), operators_1.filter(key => Number(UserPaddle.getAttribute('y')) - step >= 0), operators_1.map(_ => () => UserPaddle.setAttribute('y', String(Number(UserPaddle.getAttribute('y')) - step)))), rxjs_1.fromEvent(document, 'keypress')
        .pipe(operators_1.map(e => e.key), operators_1.filter(key => (key === 's')), operators_1.filter(key => Number(UserPaddle.getAttribute('y')) + step <= 740), operators_1.map(_ => () => UserPaddle.setAttribute('y', String(Number(UserPaddle.getAttribute('y')) + step)))));
    keyboardReader.subscribe((method) => method());
    // ComputerPaddle
    const ComputerPaddle = document.createElementNS(svg.namespaceURI, 'rect');
    Object.entries({
        x: 742, y: 350,
        width: 8, height: 60,
        fill: 'white',
        Score: 0
    }).forEach(([key, val]) => ComputerPaddle.setAttribute(key, String(val)));
    svg.appendChild(ComputerPaddle);
    // Drawing the ball
    const ball = document.createElementNS(svg.namespaceURI, "circle");
    Object.entries({
        cx: 400, cy: 400,
        r: 10,
        fill: 'white',
        yCollisionUp: "false",
        yCollisionDown: "false",
        speed: 5,
        velocityY: 5,
        velocityX: 5
    }).forEach(([key, val]) => ball.setAttribute(key, String(val)));
    svg.appendChild(ball);
    // y cordinate ball handle
    rxjs_1.interval(10).pipe(operators_1.map(_ => ((Number(ball.getAttribute("cy")) + Number(ball.getAttribute("r"))) > 800 || (Number(ball.getAttribute("cy")) - Number(ball.getAttribute("r"))) < 0) ?
        -Number(ball.getAttribute("velocityY")) : Number(ball.getAttribute("velocityY"))), operators_1.map(x => ball.setAttribute("velocityY", String(x))))
        .subscribe(_ => ball.setAttribute("cy", String((Number(ball.getAttribute("cy")) + (Number(ball.getAttribute("velocityY")))))));
    // interval(10).pipe(
    //                   map(_=> (Number(ball.getAttribute("cy")) + Number(ball.getAttribute("r"))) > 800 ? ball.setAttribute("yCollisionDown","true"): undefined),
    //                   map(_ => ball.getAttribute("yCollisionDown") === "true" ? ball.setAttribute("velocityY","-2"): undefined),
    //                   map(_ => ball.getAttribute("yCollisionDown") === "true" ? ball.setAttribute("yCollisionUp","false") :undefined),
    //                   map(_ => (Number(ball.getAttribute("cy")) - Number(ball.getAttribute("r"))) < 0 ? ball.setAttribute("yCollisionUp","true"): undefined),
    //                   map(_ => ball.getAttribute("yCollisionUp") === "true" ? ball.setAttribute("yCollisionDown","false") :undefined),
    //                   map(_ => ball.getAttribute("yCollisionUp") === "true" ? ball.setAttribute("velocityY","2"): undefined))
    //             .subscribe(_ => ball.setAttribute("cy",String( (Number(ball.getAttribute("cy"))+ (Number(ball.getAttribute("velocityY")))))))
    rxjs_1.interval(10).subscribe(_ => ball.setAttribute("cx", String((Number(ball.getAttribute("cx"))) + (Number(ball.getAttribute("velocityX"))))));
    function collision(ball, player) {
    }
}
// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map