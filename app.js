// variables to store the list of points for each image
let points1 = [];
let points2 = [];

// variable to keep track of which image should be clicked on next
let nextImage = 1;
let pointColor = '#000000';

function handleImage(e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = document.getElementById(e.target.id.replace('Loader', ''));
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

// handle a click on an image
function handleClick(event) {
    if ((this.id === 'image1Canvas' && nextImage === 1) || (this.id === 'image2Canvas' && nextImage === 2)) {
        // calculate the coordinates of the click
        let rect = this.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        // add the coordinates to the appropriate list
        if (nextImage === 1) {
            points1.push({ x: x, y: y });
            nextImage = 2;
            $('#coordinatesList1').text(JSON.stringify(points1));
        } else {
            points2.push({ x: x, y: y });
            nextImage = 1;
            $('#coordinatesList2').text(JSON.stringify(points2));
        }
        // display the point on the image
        displayPoint(this.id, x, y);
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function displayPoint(imageId, x, y) {
    let point = document.createElement("div");
    point.classList.add("point");
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    if (imageId == 'image1Canvas') {
        pointColor = getRandomColor();
    }
    point.style.backgroundColor = pointColor;
    // Create a new div for the label
    let label = document.createElement("div");
    label.classList.add("label");
    // Set the position of the label to match the point
    label.style.left = `${x + 1}px`;
    label.style.top = `${y + 3}px`; 
    let pointNumber;
    // Set the text of the label to the number of the point
    if (imageId == 'image1Canvas') {
        pointNumber = points1.length;
    } else {
        pointNumber = points2.length;
    }
    label.textContent = pointNumber;
    // Set the color of the label to match the point
    label.style.color = pointColor;
    // Set unique IDs for the point and label
    point.id = `point${imageId.charAt(5)}_${pointNumber}`;
    label.id = `label${imageId.charAt(5)}_${pointNumber}`;
    // Append the point and the label to the container
    let container = document.getElementById(imageId.slice(0, 6) + "Container");
    container.appendChild(point);
    container.appendChild(label);
}


// undo the last click
function undoLastClick() {
    let imageContainer;
    if (nextImage === 1 && points2.length > 0) {
        points2.pop();
        nextImage = 2;
        document.getElementById('coordinatesList2').innerText = JSON.stringify(points2);
        imageContainer = document.getElementById('image2Container');
    } else if (nextImage === 2 && points1.length > 0) {
        points1.pop();
        nextImage = 1;
        document.getElementById('coordinatesList1').innerText = JSON.stringify(points1);
        imageContainer = document.getElementById('image1Container');
    }
    // Get the last point and label elements in the image container
    let points = imageContainer.getElementsByClassName('point');
    let labels = imageContainer.getElementsByClassName('label');
    // If there are any points or labels, remove the last one
    if (points.length > 0) {
        points[points.length - 1].remove();
    }
    if (labels.length > 0) {
        labels[labels.length - 1].remove();
    }
}

// save the points to a CSV file
function saveToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    for (let i = 0; i < Math.max(points1.length, points2.length); i++) {
        let row = [(points1[i] || {}).x, (points1[i] || {}).y, (points2[i] || {}).x, (points2[i] || {}).y].join(",");
        csvContent += row + "\r\n";
    }
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "points.csv");
    link.click();
}

// update the display of the cursor position
function updateCursorPosition(event) {
    // calculate the current position of the cursor on the image
    let rect = this.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    // update the display
    if (this.id === 'image1Canvas') {
        $('#cursorPosition1').text(`X: ${x}, Y: ${y}`);
    } else {
        $('#cursorPosition2').text(`X: ${x}, Y: ${y}`);
    }
}

function clearPoints() {
    points1 = [];
    points2 = [];
    nextImage = 1;
    $('#coordinatesList1').text(JSON.stringify(points1));
    $('#coordinatesList2').text(JSON.stringify(points2));
    $('.point').remove();
    $('.label').remove();
}

function drawGrid(imageId) {
    let canvas = document.getElementById(imageId + 'Canvas');
    let context = canvas.getContext('2d');
    let image = document.getElementById(imageId);

    // set the width and height of the canvas to match the image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    // calculate the size of each cell in the grid
    let cellWidth = canvas.width / 10;
    let cellHeight = canvas.height / 10;
    context.beginPath();
    // draw the vertical lines
    for (let i = 0; i <= 10; i++) {
        context.moveTo(i * cellWidth, 0);
        context.lineTo(i * cellWidth, canvas.height);
    }
    // draw the horizontal lines
    for (let i = 0; i <= 10; i++) {
        context.moveTo(0, i * cellHeight);
        context.lineTo(canvas.width, i * cellHeight);
    }
    context.lineWidth = 1;
    context.strokeStyle = "white";
    context.stroke();
}

// set up the event listeners
$(document).ready(function () {
    $('#imageLoader1').change(handleImage);
    $('#imageLoader2').change(handleImage);
    $('#image1Canvas').click(handleClick);
    $('#image2Canvas').click(handleClick);
    $('#undoButton').click(undoLastClick);
    $('#clearButton').click(clearPoints);
    $('#saveButton').click(saveToCSV);
    $('#image1Canvas').mousemove(updateCursorPosition);
    $('#image2Canvas').mousemove(updateCursorPosition);
});
