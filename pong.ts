import { interval, fromEvent, from, zip, range, pipe,merge } from 'rxjs'
import { map, scan, filter,flatMap, take, concat} from 'rxjs/operators'

function pong(paddleSize:string,difficulty:string) {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
  

    // sets for paddle size and difficult level according to the User Recommendation.Paddle size update if between 30<=size<=100 
    (Number(paddleSize) >= 30) && (Number(paddleSize) <= 100)? setPaddleSize(paddleSize) : setPaddleSize(String(80))
    const ballSpeedAccordingToDifficullty = difficulty === "easy"? 4 : difficulty=== "hard"? 6 : 5

    //this function updates the new size of the paddle according to User if its valid
    function setPaddleSize(size:string):void{
      //Getting the UserPaddle and CompPaddle using id
      const UserPaddle = document.getElementById("UserPaddle");
      const CompPaddle = document.getElementById("ComPaddle");
      
      // sets for paddle size according to the User Recommendation
      UserPaddle.setAttribute("height",size) 
      CompPaddle.setAttribute("height",size)

    }
    

    // get the svg canvas element
    const svg = document.getElementById("canvas")!;
    // getting svg width to set middle boundary
    const svgWidth = Number(svg.getAttribute("width"))

    // Setting Middle boundary of the game
    function CreateMiddleBoundary(x: number, y: number,w:number,h:number,color="white"):void {
      const boundaryLine = document.createElementNS(svg.namespaceURI, "rect");
      boundaryLine.setAttribute("x", String(x));
      boundaryLine.setAttribute("y", String(y));
      boundaryLine.setAttribute("width", String(w));
      boundaryLine.setAttribute("height", String(h));
      boundaryLine.setAttribute("fill", color);
      svg.appendChild(boundaryLine);
     
   }
  // Creates the lines of middle boundary with gaps of 25
  range(25,775).pipe( filter( x => x%25 === 0) ).subscribe(y => CreateMiddleBoundary(svgWidth/2,y,5,15))
    
  
  // Its made inorder so we can make initial state of the paddles 
  type PaddleState = Readonly<{
    x: number;
    y: number;
    height: number;
    width: number;
    svgwidth: number;
  }>
  // if user given height is valid it return the user setted height otherwise return default paddle height which is 80 
  const h = (Number(paddleSize) >= 30 && Number(paddleSize) <= 100)? Number(paddleSize) : 80

  // inital state created for the paddle
  const initialUserPaddleState: PaddleState = { x: 50, y: 350,width: 8,height:h,svgwidth: svgWidth };

  // Does not allow the paddle to move out of svg and form new paddle state
  function PaddleMovement(s:PaddleState, changeY:number): PaddleState {
    return { ...s,  
      y: (changeY < 0)? (s.y + changeY) >=0 ? s.y+changeY : s.y : (s.y + changeY)<= (s.svgwidth-s.height) ? s.y+changeY: s.y // checks that paddle doesnt go outside the canvas
    }
  }
  // update the position of paddle in SVG
  function updatePaddleeView(state: PaddleState,name:string): void {
    const paddle = document.getElementById(name);
    paddle.setAttribute("y",String(state.y))
  }

  // Checking which keyboard key is pressed so the state of paddle can be changed
  const UP$ = fromEvent<KeyboardEvent>(document, 'keypress').pipe(
            map(e => e.key),
            filter(key => ((key === 'w') || (key === 's'))),// Only accepts w and s for userInput
            map(key => key==='w'? -20 : 20),
            scan(PaddleMovement,initialUserPaddleState))
          .subscribe(x=>updatePaddleeView(x,"UserPaddle"))

  // gets the ball from html file
  const ball = document.getElementById("ball")

  // created inorder to form initial state of the ball
  type ballState = Readonly<{
    cx: number;
    cy: number;
    r: number;
    Newspeed:number
    Originalspeed: number// used to reset ball to orginl speed once it goes out of svg
    velocityY: number
    velocityX: number
  }>
  // This function detects collision between ball and player
  function collision(s:ballState):boolean{
    
    // gets the elements from html file according to their id
    const User = document.getElementById("UserPaddle"),
          Computer = document.getElementById("ComPaddle"),
          Canvas = document.getElementById("canvas"),
          CanvasWidth = Number(Canvas.getAttribute("width"))

    // Decides where is the ball present and according to that chooses the player with which ball can collide with
    const player = s.cx < (CanvasWidth/2) ? User : Computer 

    // gets the coordinates of top of the player Paddle
    const PlayerTop = Number(player.getAttribute("y")),

    //gets the  coordinates of bottom side of the player paddle  
    PlayerBottom = PlayerTop + Number(player.getAttribute("height")),

    // gets the coordinates of left side of the player paddle
    PlayerLeft = Number(player.getAttribute("x")),
    
    // gets the coordinates of right side of the player paddle
    PlayerRight = PlayerLeft + Number(player.getAttribute("width"))
    
    // gets the coordinates of top of the ball
    const ballTop = s.cy - s.r,

    // gets the coordinates of bottom of the ball
    ballBottom = s.cy + s.r,

    // gets the coordinates of left side of the ball
    ballLeft = s.cx - s.r,

    // gets the coordinates of right side of the ball
    ballRight = s.cx + s.r

    // decides if the ball collided with player paddle
    return ballRight> PlayerLeft && ballTop < PlayerBottom && ballLeft < PlayerRight && ballBottom > PlayerTop;
  }
  
  // This function returns a ball state in which velocity of ball is changed according to the angle it collided with the paddle,speed of ball is increased 
  //and the direction of ball is changed
  function ballPositionAfterCollision(s:ballState):ballState{
  // This get the html elements from their ids
   const User = document.getElementById("UserPaddle"),
         Computer = document.getElementById("ComPaddle"),
         Canvas = document.getElementById("canvas"),
         CanvasWidth = Number(Canvas.getAttribute("width")),

  // Detects if computer paddle or user paddle collided
         p = s.cx < (CanvasWidth/2) ? User : Computer,
  
  // Calculates the collision point 
         collidePoint = (s.cy - (Number(p.getAttribute("y")) + Number(p.getAttribute("height"))/2)) / (Number(p.getAttribute("height"))/2),

  // Calulates the angle with which the ball deflect
         AngleRadian = (Math.PI/4) * collidePoint,

  // Decide which direction should the ball  go after collision by detecting from canvas size that if user collided with all or the computer
         direction =  s.cx < (CanvasWidth/2) ? 1 : -1,

  // Calulate new VelocityY and VelocityX for the ball
         ballVelocityX = direction * s.Newspeed * Math.cos(AngleRadian),
         ballVelocityY = s.Newspeed * Math.sin(AngleRadian)

  // returns new ballState with new cx,cy direction,speed and velocity of ball
         return{...s,
          velocityX: ballVelocityX,
          velocityY: ballVelocityY,
          Newspeed:  s.Originalspeed === 4? s.Newspeed + 0.3 : s.Originalspeed === 5? s.Newspeed + 0.6 : s.Newspeed + 0.7,// sets speed increment according to the difficulty level
          cy: s.cy + ballVelocityY,
          cx: s.cx + ballVelocityX
         }
  }

  // This function decides if there was collision with paddle or with the upper and lower walls or if the ball needs to be reseted to the center as a player has scored 
  function ballMovement(state:ballState):ballState{
    // getting svg width
    const Canvas = document.getElementById("canvas"),
    CanvasWidth = Number(Canvas.getAttribute("width"))

    return collision(state) ? ballPositionAfterCollision(state) :  (state.cx -state.r)< 0 ? resetBallIncScore(state,"CompScore") : (state.cx +state.r)> CanvasWidth? resetBallIncScore(state,"UserScore") : NoCollisionBallSate(state)
    
  }

  // This function  increments the score of the player who scored.It returns ballState in which cx of the ball is positioned at center of svg but cy at different random 
  //position in svg,it also resest the ball velocities,speed and causes ball to move toward the scorer after the player scores.
  function resetBallIncScore(s:ballState,Scorer: "UserScore" | "CompScore"):ballState{
    // getting svg width
    const Canvas = document.getElementById("canvas"),
    CanvasWidth = Number(Canvas.getAttribute("width"))

    document.getElementById(Scorer).textContent = String(Number(document.getElementById(Scorer).textContent) + 1)// increases the score of the player who scored

    // return new ballState with reseted velocities and speed and at center of cannvas with different positions at y axis
    return{...s,
           cx: 400,
           cy: Math.floor(Math.random()*CanvasWidth),
           Newspeed: s.Originalspeed,
           velocityX:  (s.velocityX <0)? s.Originalspeed : -s.Originalspeed,
           velocityY: s.Originalspeed
           
     
    }

  }

  // This function returns ballState in which it changes VelocityY and VelocityX of ball and the VelocityY is changed to opposite direction if it collide with upper 
  // and lower boundary of svg
  function NoCollisionBallSate(state:ballState):ballState{
    // getting svg width
    const Canvas = document.getElementById("canvas"),
    CanvasWidth = Number(Canvas.getAttribute("width"))
    return{...state,
      velocityY:  (state.cy + state.r > CanvasWidth && (state.velocityY > 0) )? 
      -state.velocityY : (state.cy- state.r <  0  && state.velocityY < 0)? 
       -state.velocityY : state.velocityY,
      cy: state.cy + state.velocityY,
      cx: state.cx + state.velocityX
    }

  }

  // updates the ballViews in svg
  function updateBallview(s:ballState):void{
    const ball = document.getElementById("ball");
    ball.setAttribute("cy",String(s.cy))
    ball.setAttribute("cx",String(s.cx))
  }
  // initial state of the ball is formed
  const InitalballState:ballState= {cx:400,cy:400,r:10,Newspeed:ballSpeedAccordingToDifficullty,Originalspeed:ballSpeedAccordingToDifficullty,velocityY:ballSpeedAccordingToDifficullty,velocityX:ballSpeedAccordingToDifficullty};

  // This observable allows ball to move according to different scenarios and stops if score of any player is 7
  const Ball$ = interval(12).pipe(
              scan(ballMovement,InitalballState))
              .subscribe(updateBallview)

  // Inital Computer Paddle state is formed 
  const InitialComputerPaddle:PaddleState = { x: 742, y: 350,width: 8,height: h,svgwidth:svgWidth};
  // get Compaddle from html using id
  const CompPaddle = document.getElementById("ComPaddle");


  // Movement of computer paddle towards ball effectiveness according to difficulty
  const PaddleMovementEffectiveness:number = ballSpeedAccordingToDifficullty === 4? 17 : ballSpeedAccordingToDifficullty === 5? 12 : 10

  // This causes the computer paddle to move according to the ball 
  const CP$ = interval(PaddleMovementEffectiveness).pipe(
                map(_ => ball.getAttribute("cx")),
                map(_=> Number(CompPaddle.getAttribute("y"))),
                map(YcordinatCP=> (Number(ball.getAttribute("cy")) - (YcordinatCP + (InitialComputerPaddle.height)/2))*0.1),// calculate where the Computer pannel should move according to ball with 0.1 
                scan(PaddleMovement,InitialComputerPaddle))
              .subscribe(x =>updatePaddleeView(x,"ComPaddle"))

  // gets the text element in html by id            
  const WinnerPosition = document.getElementById("Winner")
  const RestartText = document.getElementById("Restart")

  //This interval runs when any of the player scored 7 and chooses the side on which Winner should be written.Along with that it tells the user to press r to restart the game and 
  // unsubscribe the calls which caused movement of ball,UserPAddle and ComputerPaddle
  const DetectWinnerAndUnsubSribe$=interval(10).pipe(
                    filter(_ => ((7 === Number(document.getElementById("CompScore").textContent)) || (7 === Number(document.getElementById("UserScore").textContent)))),
                    map(_ => UP$.unsubscribe()),
                    map(_ => CP$.unsubscribe()),
                    map(_ => Ball$.unsubscribe()),
                    map(_ => (7 === Number(document.getElementById("CompScore").textContent))? WinnerPosition.setAttribute("x","500") : WinnerPosition.setAttribute("x","100")),
                    map(_ => WinnerPosition.textContent= "Winner"),
                    map(_ => RestartText.textContent="Press R To Restart Game"))
              .subscribe(_ => _)
  

  // this function resets the score and the userpaddle to the center and removes the winner and reset text
  function restartGame():void{
        const UserPaddle = document.getElementById("UserPaddle")
          UserPaddle.setAttribute("y","400")
          document.getElementById("Winner").textContent=""
          document.getElementById("CompScore").textContent ="0"
          document.getElementById("UserScore").textContent= "0"
          document.getElementById("Restart").textContent=""
  }
  
  //The following works when score of any player has reached 7 and the user press r to restart the game
  fromEvent<KeyboardEvent>(document, 'keypress').pipe(
    map(e => e.key),
    filter(key => key === "r"),
    filter(_ => ((7 === Number(document.getElementById("CompScore").textContent)) || (7 === Number(document.getElementById("UserScore").textContent)))),
    map(_ => DetectWinnerAndUnsubSribe$.unsubscribe()),
    map(_ => restartGame()))
    .subscribe(_=>  pong(prompt("Please Enter Paddle Size for Pong Game between 30 and 100 inclusive", "80"),
                    prompt("Please choose difficulty level from Easy,Medium,Hard", "Medium").toLowerCase()))
    
  }
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      // ask for paddle size and Difficulty:
      fromEvent(document,"click").pipe(take(1)).subscribe(_ => pong(prompt("Please Enter Paddle Size for Pong Game between 30 and 100 inclusive", "80"),
                                                                    prompt("Please choose difficulty level from Easy,Medium,Hard", "Medium").toLowerCase()))
    }
  
  

