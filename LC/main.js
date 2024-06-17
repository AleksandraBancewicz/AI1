class Piece {
    constructor(x, y, number_id, canvasElement) {
        this.x = x;
        this.y = y;
        this.number_id = number_id;
        this.canvasElement = canvasElement;
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (!ev.target.firstChild) {
        ev.target.appendChild(document.getElementById(data));
        numberOfChildren = document.getElementById("solvingPiecesContainer").getElementsByTagName("*").length;
        if (numberOfChildren >= 32) {
            sendNotification();
        }
    }
}

function sendNotification() {
    if (!("Notification" in window)) {
        alert("Ta przeglądarka nie obsługuje powiadomień");
    }
    else if (Notification.permission === "granted") {
        var container = document.getElementById("solvingPiecesContainer").children;
        for (var i = 0; i < container.length; i++) {
            if (container[i].id.slice(-1) != container[i].children[0].id.slice(-1)) {
                var notification = new Notification("Niepoprawnie ułożone puzzle!");
                console.log("Niepoprawnie ulozone puzzle!")
                return;
            }
        }
        var notification = new Notification("Poprawnie ułożone puzzle")
        console.log("Poprawnie ulozone puzzle!")
        return;
    }
}

var map;

window.onload = function () {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoib3NrYXJ6dXQiLCJhIjoiY2t5bmU0azBwMmd1ODJ3cDB4c2s4bnI1NyJ9.smj5Jioo-qtBqMPB2OphJQ'
    }).addTo(map);
};

function getgeolocation() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 16);
        },
        () => {
            alert("Nie udalo sie pobrac geolokalizacji");
        }
    );
}

function takeimage() {
    var image = new Image();
    image.src = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${map.getCenter().lng},${map.getCenter().lat},${map.getZoom() - 1},0,0/900x400?logo=false&attribution=false&access_token=pk.eyJ1Ijoib3NrYXJ6dXQiLCJhIjoiY2t5bmU0azBwMmd1ODJ3cDB4c2s4bnI1NyJ9.smj5Jioo-qtBqMPB2OphJQ`;
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = cutImageUp;

    function cutImageUp() {
        widthOfOnePiece = image.width / 4;
        heightOfOnePiece = image.height / 4;
        var imagePieces = [];
        counter = 0;

        for (var y = 0; y < 4; ++y) {
            for (var x = 0; x < 4; ++x) {
                var canvas = document.createElement('canvas');
                canvas.width = widthOfOnePiece;
                canvas.height = heightOfOnePiece;
                var context = canvas.getContext('2d');
                context.drawImage(image, x * widthOfOnePiece, y * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);
                var imagePiece = new Piece(x, y, counter, canvas);
                imagePieces.push(imagePiece);
                counter = counter + 1;
            }
        }

        imagePieces = imagePieces.sort(function () { return 0.5 - Math.random(); });
        var container = document.getElementById("piecesContainer");
        document.getElementById("piecesContainer").innerHTML = '';
        document.getElementById("solvingPiecesContainer").innerHTML = '';

        for (var i = 0; i < imagePieces.length; i++) {
            var temp_img = new Image();
            temp_img.draggable = true;
            temp_img.ondragstart = drag;
            temp_img.src = imagePieces[i].canvasElement.toDataURL();
            temp_img.id = imagePieces[i].number_id;
            container.appendChild(temp_img);
        }

        var solvingPiecesContainer = document.getElementById("solvingPiecesContainer");

        for (var i = 0; i < 16; i++) {
            newDiv = document.createElement("div");
            newDiv.classList.add("pieceContainer");
            newDiv.classList.add("col-3");
            newDiv.id = `piece-container-${i}`;
            newDiv.ondrop = drop;
            newDiv.ondragover = allowDrop;
            solvingPiecesContainer.appendChild(newDiv);
        }
    }
}