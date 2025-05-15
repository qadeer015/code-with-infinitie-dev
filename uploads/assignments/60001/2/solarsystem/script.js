const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Generate stars once
const starData = [];
for (let i = 0; i < 1000; i++) {
    starData.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4
    });
}

// Planet data
const orbitRadii = [];
const planets = [];

let dec = 1;
for (let i = 0; i < 8; i++) {
    dec -= 0.1;
    const radius = height * 0.5 * dec;
    orbitRadii.push(radius);
    if (i == 7) {
        //  Sun
    } else {
        planets.push({
            radius,
            angle: Math.random() * Math.PI * 2,
            speed: 0.005 + i * 0.001, // Inner planets move faster
            size: 20 - i,
            color: `hsl(${i * 40}, 100%, 50%)`
        });
    }


}

console.log("planets : ", planets);

// Sun data (center circle)
const sun = {
    radius: height * 0.5 * dec,
    color: "orangered"
};
console.log("sun : ", sun);
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw yellow background
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    for (let star of starData) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw orbits
    ctx.strokeStyle = "black";
    for (let radius of orbitRadii) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw sun
    ctx.beginPath();
    ctx.shadowColor = "orangered";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = sun.color;
    ctx.arc(width / 2, height / 2, sun.radius, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for planets
    ctx.shadowBlur = 0;

    // Draw and update planets
    for (let planet of planets) {
        const x = width / 2 + planet.radius * Math.cos(planet.angle);
        const y = height / 2 + planet.radius * Math.sin(planet.angle);

        ctx.beginPath();
        ctx.fillStyle = planet.color;
        ctx.arc(x, y, planet.size, 0, Math.PI * 2);
        ctx.fill();

        planet.angle += planet.speed;
    }

    requestAnimationFrame(draw);
}

draw();
