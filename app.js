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
    if ((this.id === 'image1' && nextImage === 1) || (this.id === 'image2' && nextImage === 2)) {
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
    if (imageId === 'image1') {
        pointColor = getRandomColor();
    }
    point.style.backgroundColor = pointColor;
    document.getElementById(imageId + "Container").appendChild(point);
}

// undo the last click
function undoLastClick() {
    if (nextImage === 1 && points2.length > 0) {
        points2.pop();
        nextImage = 2;
        $('#coordinatesList2').text(JSON.stringify(points2));
    } else if (nextImage === 2 && points1.length > 0) {
        points1.pop();
        nextImage = 1;
        $('#coordinatesList1').text(JSON.stringify(points1));
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
    if (this.id === 'image1') {
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
}

// set up the event listeners
$(document).ready(function () {
    $('#imageLoader1').change(handleImage);
    $('#imageLoader2').change(handleImage);
    $('#image1').click(handleClick);
    $('#image2').click(handleClick);
    $('#undoButton').click(undoLastClick);
    $('#clearButton').click(clearPoints);
    $('#saveButton').click(saveToCSV);
    $('#image1').mousemove(updateCursorPosition);
    $('#image2').mousemove(updateCursorPosition);
});
