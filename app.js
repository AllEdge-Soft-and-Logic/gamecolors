const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = document.getElementById("outline");

// Load image from URL param
const params = new URLSearchParams(window.location.search);
img.src = params.get("img");

// Resize canvas to image
img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
};

// Drawing
let painting = false;
let color = "#ff0000";
let size = 5;

document.getElementById("colorPicker").oninput = e => color = e.target.value;
document.getElementById("brushSize").oninput = e => size = e.target.value;

canvas.addEventListener("mousedown", () => painting = true);
canvas.addEventListener("mouseup", () => {
    painting = false;
    ctx.beginPath();
});
canvas.addEventListener("mousemove", draw);

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Clear
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Save image
function download() {
    const link = document.createElement("a");
    link.download = "coloring.png";
    link.href = canvas.toDataURL();
    link.click();
}