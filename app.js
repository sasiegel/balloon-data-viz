// ------------------------------------------------------------------------
// STARTING DATA
const WIDTH = window.innerWidth;
const HEIGHT = WIDTH * (16 / 9);
const BALLOON_RADIUS = 24;
const STRING_SWAY_SPEED = 0.3;
const STRING_LENGTH = 100;
const STRING_MAX_SWAY = 15;
const BALLOON_FLOAT_RADIUS = 70;

// Starting cloud data
const clouds = [
  { x: WIDTH * 0.2, y: HEIGHT * 0.1, size: "large", speed: 0.3 },
  { x: WIDTH * 0.8, y: HEIGHT * 0.2, size: "small", speed: 0.1 },
];

// ------------------------------------------------------------------------
// EXAMPLE DATA
// User data
// how we parse date `new Date("2019-01-01T00:00:00.000Z")`
const userData = [
  {
    id: "honestabe",
    initials: "AL",
    name: "Abe Lincoln",
    team: 16,
    lastLogin: "2024-02-26T12:00:00.000Z",
  },
  {
    id: "georgewash",
    initials: "GW",
    name: "George Washington",
    team: 1,
    lastLogin: "2024-02-25T12:00:00.000Z",
  },
  {
    id: "fdr",
    initials: "FDR",
    name: "Franklin D Roosevelt",
    team: 32,
    lastLogin: "2024-02-27T16:00:00.000Z",
  },
  {
    id: "jfk",
    initials: "JFK",
    name: "John F Kennedy",
    team: 35,
    lastLogin: "2024-02-27T18:00:00.000Z",
  },
];

// Balloon data example
const balloons = userData.map((user) => {
  const lastLogin = new Date(user.lastLogin);
  const timeDiff = new Date() - lastLogin;
  const minDiff = timeDiff / (1000 * 60); // minutes since last login
  const minutesInDay = 24 * 60;
  // const heightModifier = 0; // TODO delete this and uncomment line below.
  const heightModifier = minDiff > minutesInDay ? 1 : minDiff / minutesInDay; // lower the diff the nearer to zero. zero is max balloon height. if diff > 24 then floor balloon.
  // Remember Y=0 is top of the canvas. Y=height is bottom of the canvas.
  // Max scene height balloons should reach is 20% of canvas height. Min scene height is 60% of canvas height. So modify the diff like so: (60%-20%)*0.18295 + 20% = 27.3% of canvas height.
  const yDestination = (heightModifier * 0.45 + 0.15) * HEIGHT;
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  return {
    text: user.initials,
    color: randomColor,
    x: WIDTH / 2 + (30 * Math.random() - 15),
    y: HEIGHT * 0.65 + (50 * Math.random() - 25),
    yDirection: -1,
    xDestination:
      (WIDTH - BALLOON_FLOAT_RADIUS * 2) * Math.random() + BALLOON_FLOAT_RADIUS,
    yDestination,
    xLocalDestination: -1,
    yLocalDestination: -1,
    stringSwayDirection: 1,
    stringSwayAmount: 0,
  };
});

function isValidLocalDestination(balloon) {
  // Check if instantiated.
  if (balloon.xLocalDestination < 0 || balloon.yLocalDestination < 0) {
    return false;
  }
  // Check if balloon has reached local destination.
  if (
    Math.sqrt(
      (balloon.x - balloon.xLocalDestination) ** 2 +
        (balloon.y - balloon.yLocalDestination) ** 2
    ) < 5
  ) {
    return false;
  }

  return true;
}

function isNearDestination(balloon) {
  if (
    Math.sqrt(
      (balloon.x - balloon.xDestination) ** 2 +
        (balloon.y - balloon.yDestination) ** 2
    ) <
    BALLOON_FLOAT_RADIUS + 5
  ) {
    return true;
  }
  return false;
}

function updateLocalDestinations(balloon) {
  if (isNearDestination(balloon)) {
    // Pick a point on the circle around the destination point.
    const randomRadian = Math.random() * Math.PI * 2;
    balloon.xLocalDestination = Math.floor(
      balloon.x + BALLOON_FLOAT_RADIUS * Math.cos(randomRadian)
    );
    balloon.yLocalDestination = Math.floor(
      balloon.y + BALLOON_FLOAT_RADIUS * Math.sin(randomRadian)
    );
  } else {
    // angle = arctan2((yDest - y),(xDest - x))
    const directionalRadian = Math.atan2(
      balloon.yDestination - balloon.y,
      balloon.xDestination - balloon.x
    );
    balloon.xLocalDestination = Math.floor(
      balloon.x + BALLOON_FLOAT_RADIUS * Math.cos(directionalRadian)
    );
    balloon.yLocalDestination = Math.floor(
      balloon.y + BALLOON_FLOAT_RADIUS * Math.sin(directionalRadian)
    );
  }
}

function calculateSpeedModifier(balloon) {
  const distance = Math.sqrt(
    (balloon.xDestination - balloon.x) ** 2 +
      (balloon.yDestination - balloon.y) ** 2
  );
  const maxDistance = 200;
  if (distance > maxDistance) {
    return 1.0;
  } else {
    return (1 - distance / maxDistance) * 1.5 + 1.0;
  }
}

function updateBalloonPosition(balloon) {
  if (!isValidLocalDestination(balloon)) {
    updateLocalDestinations(balloon);
  }
  const speedModifier = calculateSpeedModifier(balloon);
  const balloonMagnitude = Math.sqrt(
    (balloon.xLocalDestination - balloon.x) ** 2 +
      (balloon.yLocalDestination - balloon.y) ** 2
  );
  balloon.x +=
    (balloon.xLocalDestination - balloon.x) /
    (balloonMagnitude * speedModifier);

  balloon.y +=
    (balloon.yLocalDestination - balloon.y) /
    (balloonMagnitude * speedModifier);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Canvas dimensions (9:16 ratio)
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  let frameCounter = 0;

  function drawBalloon(balloon) {
    ctx.fillStyle = balloon.color;
    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, BALLOON_RADIUS, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw string
    ctx.beginPath();
    ctx.moveTo(balloon.x, balloon.y + BALLOON_RADIUS);
    const stringTailOffset =
      balloon.xLocalDestination - balloon.x > 0 ? -10 : 10;
    ctx.bezierCurveTo(
      balloon.x + balloon.stringSwayAmount,
      balloon.y + BALLOON_RADIUS + STRING_LENGTH * 0.4,
      balloon.x - balloon.stringSwayAmount,
      balloon.y + BALLOON_RADIUS + STRING_LENGTH * 0.7,
      balloon.x + stringTailOffset,
      balloon.y + BALLOON_RADIUS + STRING_LENGTH
    );
    ctx.stroke();

    ctx.font = "18px Arial"; // Set font size and family
    ctx.fillStyle = "white"; // Text color
    ctx.textAlign = "center"; // Center the text horizontally
    ctx.fillText(balloon.text, balloon.x, balloon.y + 8); // TODO: the text is shaky because of this. I think it'd be better to create an image of text instead

    // For debugging balloon movement, uncomment the blow lines. They plot the balloons destination on the canvas.
    // ctx.font = "18px Arial";
    // ctx.fillStyle = "black";
    // ctx.fillText("X", balloon.xDestination, balloon.yDestination);
  }

  function drawBalloons(balloons) {
    balloons.forEach((balloon) => {
      updateBalloonPosition(balloon);

      // Draw and animate balloon and string
      drawBalloon(balloon);
      if (
        balloon.stringSwayAmount > STRING_MAX_SWAY ||
        balloon.stringSwayAmount < -STRING_MAX_SWAY
      ) {
        balloon.stringSwayDirection *= -1;
      }
      balloon.stringSwayAmount +=
        STRING_SWAY_SPEED * balloon.stringSwayDirection;
    });
  }

  function drawCloud(x, y, size) {
    ctx.beginPath();
    if (size === "large") {
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.arc(x + 25, y - 30, 35, 0, Math.PI * 2);
      ctx.arc(x - 25, y - 30, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 40, 0, Math.PI * 2);
      ctx.arc(x - 50, y, 40, 0, Math.PI * 2);
    } else {
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 15, 18, 0, Math.PI * 2);
      ctx.arc(x - 15, y - 15, 18, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 20, 0, Math.PI * 2);
      ctx.arc(x - 25, y, 20, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
  }

  function drawClouds(clouds) {
    // If less than 5 clouds then 2% chance to create a cloud off screen to the left.
    if (clouds.length < 5 && Math.random() > 0.98) {
      const cloudHeightVariance = 0.2 * Math.random() - 0.1;
      const size = Math.random() > 0.6 ? "large" : "small"; // 40% chance to create a large cloud
      let speed = 0.25 * Math.random();
      if (size === "large") {
        speed += 0.1;
      }
      clouds.push({
        x: -200,
        y: HEIGHT * (0.12 + cloudHeightVariance),
        size,
        speed,
      });
      // console.log(clouds); // uncomment for debugging clouds
    }

    // Update and draw clouds. Also create an array of clouds that are off the canvas for deletion.
    const indicesToRemove = clouds.reduce((indices, cloud, index) => {
      cloud.x += cloud.speed;
      drawCloud(cloud.x, cloud.y, cloud.size);
      if (cloud.x - 100 > WIDTH) {
        indices.push(index);
      }
      return indices;
    }, []);

    // Remove clouds that are off the canvas from the array.
    indicesToRemove.forEach((indexToRemove) => {
      clouds.splice(indexToRemove, 1);
    });
  }

  function drawBush(x, y) {
    ctx.fillStyle = "#006400";

    // Draw the ellipse for the base of the bush
    ctx.beginPath();
    ctx.ellipse(x, y, 50, 20, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the circles that make up the rest of the bush
    const circles = [
      { cx: x - 20, cy: y - 25, r: 20 },
      { cx: x + 20, cy: y - 25, r: 20 },
      { cx: x, cy: y - 20, r: 25 },
      { cx: x, cy: y - 35, r: 20 },
      { cx: x - 35, cy: y - 20, r: 15 },
      { cx: x + 35, cy: y - 20, r: 15 },
    ];

    circles.forEach(function (circle) {
      ctx.beginPath();
      ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  function drawVendor(x, y) {
    // Stall dimensions and position
    const roofWidth = 100;
    const roofHeight = 30;
    const armHeight = 30;

    // Draw stall roof
    ctx.fillStyle = "#B3A492"; // Brown color for the stall
    ctx.fillRect(x, y - roofHeight, roofWidth, roofHeight);

    // Draw stall legs
    ctx.strokeStyle = "#654321"; // Darker brown for the legs
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y); // Left leg
    ctx.lineTo(x + 10, y + armHeight);
    ctx.moveTo(x + roofWidth - 10, y); // Right leg
    ctx.lineTo(x + roofWidth - 10, y + armHeight);
    ctx.stroke();

    // Draw stall body
    ctx.fillStyle = "#776B5D";
    ctx.fillRect(x - 10, y + armHeight, 120, 60);
    ctx.fillStyle = "#D6C7AE";
    ctx.fillRect(x, y + armHeight + 10, 100, 50);
    ctx.font = "26px Monaco"; // Set font size and family
    ctx.fillStyle = "black"; // Text color
    ctx.textAlign = "center"; // Center the text horizontally
    ctx.fillText("MX", x + roofWidth * 0.5, y + armHeight + 45); // Adjust text position

    // Draw balloons
    const balloons = [
      { cx: x + 20, cy: y - roofHeight - 10, r: 10, color: "red" },
      { cx: x + 40, cy: y - roofHeight - 20, r: 12, color: "green" },
      { cx: x + 60, cy: y - roofHeight - 10, r: 10, color: "blue" },
      { cx: x + 80, cy: y - roofHeight - 20, r: 12, color: "yellow" },
    ];

    balloons.forEach(function (balloon) {
      ctx.fillStyle = balloon.color;
      ctx.beginPath();
      ctx.arc(balloon.cx, balloon.cy, balloon.r, 0, 2 * Math.PI);
      ctx.fill();

      // Draw strings
      ctx.beginPath();
      ctx.moveTo(balloon.cx, balloon.cy + balloon.r);
      ctx.lineTo(balloon.cx, y);
      ctx.strokeStyle = "gray";
      ctx.stroke();
    });
  }

  function drawFlower(x, y, color) {
    // Petal settings
    const petalWidth = 4.5;
    const petalHeight = 3;
    const petalDistance = petalWidth / 2;

    // Center settings
    const centerRadius = 2;
    const centerColor = "yellow";

    // Draw petals
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      // Calculate angle and position for each petal
      const angle = i * ((2 * Math.PI) / 5); // Divide the circle into 5 parts
      const petalX = x + Math.cos(angle) * petalDistance;
      const petalY = y + Math.sin(angle) * petalDistance;

      // Create ellipse for each petal
      ctx.ellipse(
        petalX,
        petalY,
        petalWidth,
        petalHeight,
        angle,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw flower center
    ctx.beginPath();
    ctx.fillStyle = centerColor;
    ctx.arc(x, y, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  async function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ------------------------------------------------------------------------
    // STATIC OBJECTS
    // Draw grass (bottom 35% of canvas)
    ctx.fillStyle = "#228B22"; // Grass green
    ctx.fillRect(0, HEIGHT * 0.65, WIDTH, HEIGHT * 0.35);

    // top left bush
    drawBush(WIDTH * 0.1, HEIGHT * 0.65);
    drawFlower(WIDTH * 0.06, HEIGHT * 0.63, "#e600ff");
    drawFlower(WIDTH * 0.13, HEIGHT * 0.65, "#ff7b00");
    drawFlower(WIDTH * 0.105, HEIGHT * 0.625, "#0011ff");
    // bottem left bush
    drawBush(WIDTH * 0.2, HEIGHT * 0.95);
    drawFlower(WIDTH * 0.17, HEIGHT * 0.925, "#e600ff");
    drawFlower(WIDTH * 0.205, HEIGHT * 0.929, "#ff7b00");
    drawFlower(WIDTH * 0.215, HEIGHT * 0.945, "#0011ff");
    // far right bush
    drawBush(WIDTH * 0.78, HEIGHT * 0.88);
    drawFlower(WIDTH * 0.8, HEIGHT * 0.86, "#e600ff");
    drawFlower(WIDTH * 0.76, HEIGHT * 0.88, "#ff7b00");
    drawFlower(WIDTH * 0.775, HEIGHT * 0.85, "#0011ff");

    drawVendor(WIDTH * 0.8, HEIGHT * 0.59);

    // ------------------------------------------------------------------------
    // FETCH DATA
    // if (frameCounter === 300) {
    //   let data = [];
    //   try {
    //     const res = await fetch("http://localhost:3000/users");
    //     console.log(res)
    //   } catch (error) {
    //     console.error(error);
    //   }
    //   frameCounter = 0;
    // } else {
    //   frameCounter += 1;
    // }

    // ------------------------------------------------------------------------
    // DYNAMIC OBJECTS
    // Moving clouds
    drawClouds(clouds);

    // Update and draw balloons
    drawBalloons(balloons);
  }

  // Animation loop at 30 FPS
  setInterval(draw, 1000 / 30);
});
