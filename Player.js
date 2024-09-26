export default class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;
  dinoRunImages = [];

  jumpPressed = false;
  jumpInProgress = false;
  falling = false;
  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;

  constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;

    this.x = 10 * scaleRatio;
    this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();
    this.standingStillImage.src = "images/hussam_standing.png";
    this.image = this.standingStillImage;

    const dinoRunImage1 = new Image();
    dinoRunImage1.src = "images/hussam_run.png";

    const dinoRunImage2 = new Image();
    dinoRunImage2.src = "images/hussam_standing.png";

    this.dinoRunImages.push(dinoRunImage1);
    this.dinoRunImages.push(dinoRunImage2);

    //keyboard
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);

    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);

    //touch
    window.removeEventListener("touchstart", this.touchstart);
    window.removeEventListener("touchend", this.touchend);

    window.addEventListener("touchstart", this.touchstart);
    window.addEventListener("touchend", this.touchend);

    // Use the function to get and log the microphone input volume
    getMicVolume((volume) => {
      if (volume > 30) {
        this.jumpPressed = true;
      } else {
        this.jumpPressed = false;
      }
    });

  }

  touchstart = () => {
    this.jumpPressed = true;
  };

  touchend = () => {
    this.jumpPressed = false;
  };

  keydown = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = true;
    }
  };

  keyup = (event) => {
    if (event.code === "Space") {
      this.jumpPressed = false;
    }
  };

  update(gameSpeed, frameTimeDelta) {
    this.run(gameSpeed, frameTimeDelta);

    if (this.jumpInProgress) {
      this.image = this.standingStillImage;
    }

    this.jump(frameTimeDelta);
  }

  jump(frameTimeDelta) {
    if (this.jumpPressed) {
      this.jumpInProgress = true;
    }

    if (this.jumpInProgress && !this.falling) {
      if (
        this.y > this.canvas.height - this.minJumpHeight ||
        (this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed)
      ) {
        this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
      } else {
        this.falling = true;
      }
    } else {
      if (this.y < this.yStandingPosition) {
        this.y += this.GRAVITY * frameTimeDelta * this.scaleRatio;
        if (this.y + this.height > this.canvas.height) {
          this.y = this.yStandingPosition;
        }
      } else {
        this.falling = false;
        this.jumpInProgress = false;
      }
    }
  }

  run(gameSpeed, frameTimeDelta) {
    if (this.walkAnimationTimer <= 0) {
      if (this.image === this.dinoRunImages[0]) {
        this.image = this.dinoRunImages[1];
      } else {
        this.image = this.dinoRunImages[0];
      }
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    }
    this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

}


async function getMicVolume(callback) {
  try {
      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create an AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a MediaStreamSource from the microphone input stream
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create an AnalyserNode for analyzing the audio data
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      // Connect the source to the analyser
      source.connect(analyser);
      
      // Create a buffer to hold the audio data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // A function to get the volume data
      function updateVolume() {
          analyser.getByteFrequencyData(dataArray);
          let values = 0;
          const length = dataArray.length;

          // Sum up all the frequency values
          for (let i = 0; i < length; i++) {
              values += dataArray[i];
          }

          // Calculate the average volume
          const average = values / length;

          // Invoke the callback with the volume value
          callback(average);

          // Call this function again to keep updating the volume
          requestAnimationFrame(updateVolume);
      }

      // Start the volume update loop
      updateVolume();

  } catch (err) {
      console.error('The following error occurred: ' + err);
  }
}