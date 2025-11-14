const STAR_COLOR = "#fff";
const STAR_SIZE = 2;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;
const X_Default_Velocity = -1;
const Y_Default_Velocity = 0.5;

const canvas = document.querySelector("#stars"), context = canvas.getContext("2d");

let scale = 0.1, width, height;

let stars = [];
let pointerX, pointerY;
let velocity = { x: 0, y: 0, tx: 0, ty: 0.003, z: 0.0008 };
let touchInput = true;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({x: 0, y: 0, z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)});
    }
}

function placeStar(star) {
    star.x = Math.random() * width;
    star.y = Math.random() * height;
}

function recycleStar(star) {
    let direction = "z";
    let vx = Math.abs(velocity.x), vy = Math.abs(velocity.y);

    if (vx > 1 || vy > 1) {
        let axis = vx > vy ? (Math.random() < vx / (vx + vy) ? "h" : "v") : (Math.random() < vy / (vx + vy) ? "v" : "h");
        direction = axis === "h" ? (velocity.x > 0 ? "l" : "r") : (velocity.y > 0 ? "t" : "b");
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);
    switch (direction) {
        case "z":
            star.z = 0.1;
            star.x = Math.random() * width;
            star.y = Math.random() * height;
            break;
        case "l":
            star.x = -OVERFLOW_THRESHOLD;
            star.y = height * Math.random();
            break;
        case "r":
            star.x = width + OVERFLOW_THRESHOLD;
            star.y = height * Math.random();
            break;
        case "t":
            star.x = width * Math.random();
            star.y = -OVERFLOW_THRESHOLD;
            break;
        case "b":
            star.x = width * Math.random();
            star.y = height + OVERFLOW_THRESHOLD;
            break;
    }
}

function resize() {
    scale = window.devicePixelRatio || 1;

    canvas.width = width = window.innerWidth * scale;
    canvas.height = height = window.innerHeight * scale;

    stars.forEach(placeStar);
}

function step() {
    context.clearRect(0, 0, width, height);

    update();
    render();

    requestAnimationFrame(step);
}

function update() {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;

    velocity.x += (velocity.tx - velocity.x) * 0.8;

    velocity.y += (velocity.ty - velocity.y) * 0.8;

    stars.forEach((star) => {
        star.x += velocity.x * star.z + X_Default_Velocity;
        star.y += velocity.y * star.z + Y_Default_Velocity;

        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        if (
            star.x < -OVERFLOW_THRESHOLD ||
            star.x > width + OVERFLOW_THRESHOLD ||
            star.y < -OVERFLOW_THRESHOLD ||
            star.y > height + OVERFLOW_THRESHOLD
        ) {
            recycleStar(star);
        }
    });
}

function render() {
    stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.globalAlpha = 0.5 + 0.5 * Math.random();
        context.strokeStyle = STAR_COLOR;

        context.moveTo(star.x, star.y);

        let tailX = velocity.x, tailY = velocity.y;

        if (Math.abs(tailX) < 0.1) tailX = 1;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;
        context.lineTo(star.x + tailX, star.y + tailY);
        context.stroke();
    });
}

function movePointer(x, y) {
    if (typeof pointerX === "number" && typeof pointerY === "number") {
        let ox = x - pointerX, oy = y - pointerY;
        velocity.tx = velocity.tx + (ox / 16) * scale * (touchInput ? 1 : -1);
        velocity.ty = velocity.ty + (oy / 16) * scale * (touchInput ? 1 : -1);
    }
    pointerX = x;
    pointerY = y;
}

function onMouseMove(event) {
    touchInput = false;
    movePointer(event.clientX, event.clientY);
}

function onTouchMove(event) {
    touchInput = true;
    movePointer(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
}

function onMouseLeave() {
    pointerX = null;
    pointerY = null;
}