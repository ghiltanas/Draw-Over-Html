//default canvas
var myCanvas;

/*
mediante canvas lavoro su un contesto, ovvero un oggetto che rappresenta l'intera bitmap del canvas, mediantel'utilizzo
di fabricjs vado a manipolare invece degli oggetti direttamente, potendone modificare le proprietà in modo indipendente
*/

//layer between myCanvas and the drawed objects
var canvF;


//supporting structures
var gomma;
var rettangoli;
var cerchi;
var tempCanvF;

//flag
var gommaIn = false;

var elemento;
var posX;
var posY;

//generatore casuale di colore
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var rand_color = '#';
    for (var i = 0; i < 6; i++) {
        rand_color += letters[Math.floor(Math.random() * 16)];
    }
    return rand_color;
}

//initializing container, canvas and fabric canvas
function initF() {
    gommaIn = false;
    canvasContainer = document.createElement('div');
    document.body.appendChild(canvasContainer);
    canvasContainer.style.position = "absolute";
    canvasContainer.style.left = "0px";
    canvasContainer.style.top = "0px";
    canvasContainer.style.width = "100%";
    canvasContainer.style.height = "100%";
    canvasContainer.style.zIndex = "1000";
    superContainer = document.body;
    myCanvas = document.createElement('canvas');
    myCanvas.style.width = superContainer.scrollWidth + "px";
    myCanvas.style.height = superContainer.scrollHeight + "px";
    //scrollwidth include anche il padding, ma non il margin, il border e scrollbar, da il valore in pixel
    //la larghezza totale del contenitore
    //width indica la larghezza dell'area visibile di un oggetto
    myCanvas.width = superContainer.scrollWidth;
    myCanvas.height = superContainer.scrollHeight;
    myCanvas.style.position = 'absolute';
    canvasContainer.appendChild(myCanvas);
    canvF = new fabric.Canvas(myCanvas);
    tempCanvF = new fabric.Canvas(myCanvas);
    rettangoli = new fabric.Canvas(myCanvas);
    //options object has 2 property: e, the original event, and target, the(eventually) selected object
    //selected object always on top
    canvF.on('object:selected', function (options) {
        //remove target from the array, then put it on top and redraw
        canvF.bringToFront(options.target);
    });
    //need it for the eraser 
    canvF.on('object:moving', onChange);
    canvF.selection = false;
}

//custom colors
function defBackColor() {
    elemento = document.getElementById('rect');
    elemento.style.backgroundColor = "rgb(112, 210, 177)";
    elemento = document.getElementById('pencil');
    elemento.style.backgroundColor = "rgb(13, 155, 229)";
    elemento = document.getElementById('cerchio');
    elemento.style.backgroundColor = "rgb(3, 176, 176)";
    elemento = document.getElementById('gomma');
    elemento.style.backgroundColor = "blue";
    elemento = document.getElementById('anima');
    elemento.style.backgroundColor = "rgb(255, 117, 0)";
    elemento = document.getElementById('lnkDownload');
    elemento.style.backgroundColor = "red";
}

function drawRectF() {
    //flag di disegno a mano libera disattivato
    canvF.isDrawingMode = false;
    defBackColor();
    elemento = document.getElementById('rect');
    elemento.style.backgroundColor = "black";
    gommaIn = false;
    canvF.remove(gomma);
    var rect = new fabric.Rect();
    rect.left = 100;
    rect.top = 100;
    var coloreRect = getRandomColor();
    rect.fill = coloreRect;
    rect.width = 80;
    rect.height = 80;
    rect.borderColor = 'red';
    rect.cornerColor = 'green';
    rect.cornerSize = 20;
    rect.eraser = false;
    //controls invisible
    transparentCorners = false;
    rettangoli.add(rect);
    canvF.add(rect);

}

//gravity for rects, easeOutBounce as easeIn function
function animaF() {
    defBackColor();
    elemento = document.getElementById('anima');
    elemento.style.backgroundColor = "black";
    //for each rects 
    rettangoli.forEachObject(function (obj) {
        //animate:proprietà da animare, intervallo,parametri:render the canvas onChange, durata animazione, funzione easin 
        obj.animate('top', myCanvas.height - obj.height, {
            onChange: canvF.renderAll.bind(canvF),
            duration: 2000,
            easing: fabric.util.ease.easeOutBounce
        });
    });
    
}

function drawCircleF() {
    canvF.isDrawingMode = false;
    gommaIn = false;
    defBackColor();
    elemento = document.getElementById('cerchio');
    elemento.style.backgroundColor = "black";
    canvF.remove(gomma);
    var circle = new fabric.Circle({ radius: 30, fill: getRandomColor(), top: myCanvas.height / 2, left: myCanvas.width / 2 });
    circle.borderColor = 'red';
    circle.cornerColor = 'green';
    circle.cornerSize = 20;
    circle.eraser = false;
    transparentCorners = false;
    canvF.add(circle);
}

function eraseF() {
    if (!gommaIn) {
        defBackColor();
        elemento = document.getElementById('gomma');
        elemento.style.backgroundColor = "black";
        //eraser svg path
        fabric.loadSVGFromURL('images/eraser9.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.2);
            //la posizione in alto a destra
            obj.left = myCanvas.width - obj.width * 0.2;
            obj.top = 50;
            gomma = obj;
            gomma.eraser = true;
            transparentCorners = false;
            gommaIn = true;
            canvF.isDrawingMode = false;
            gomma.hasBorders = false;
            gomma.hasControls = false;
            //settandolo a true, l'hit system è valutato sul perimetro esatto della figura
            perPixelTargetFind = true;
            canvF.add(gomma).renderAll();
            
        });
        
    }
    else {
        gommaIn = false;
        canvF.remove(gomma);
        elemento = document.getElementById('gomma');
        elemento.style.backgroundColor = "blue";
    }
}

function drawLineF() {
    canvF.isDrawingMode = !canvF.isDrawingMode;
    if (canvF.isDrawingMode) {
        defBackColor();
        elemento = document.getElementById('pencil');
        elemento.style.backgroundColor = "black";
        gommaIn = false;
        canvF.remove(gomma);
        freeDrawingBrush.color = getRandomColor();
        freeDrawingBrush.width = 10;
        perPixelTargetFind = true;
    }
    else {
        elemento = document.getElementById('pencil');
        elemento.style.backgroundColor = "rgb(13, 155, 229)";
    }
}

var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    var reader = new FileReader();
    //al termine del caricamento del file, viene generato l'evento load
    reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
            canvF.isDrawingMode = false;
            var imgInstance = new fabric.Image(img, {
                selectable: 1
            })
            if (imgInstance.width > myCanvas.width || imgInstance.height > myCanvas.height) {
                imgInstance.scale(0.4);
            }
            canvF.add(imgInstance);
            canvF.deactivateAll().renderAll();
        }
        
        //src specifica l'url dell'immagine
        img.src = event.target.result;
    }
    //leggo il file immagine come file binario
    reader.readAsDataURL(e.target.files[0]);
    if (gommaIn) {
        gommaIn = false;
        canvF.remove(gomma);
    }
    elemento.style.backgroundColor = "rgb(3, 176, 176)";
    elemento = document.getElementById('gomma');
}


var imageSaver = document.getElementById('lnkDownload');
imageSaver.addEventListener('click', saveImage, false);

function saveImage(e) {
    defBackColor();
    elemento = document.getElementById('lnkDownload');
    elemento.style.backgroundColor = "black";
    //serializzazione di canvF
    this.href = canvF.toDataURL({
        format: 'png',
        quality: 1.0
    });
    this.download = 'canvas.png'
}

//only if i'm the eraser, when i pass over another object i remove it
var onChange = function (options) {
    if (!options.target.eraser) {
        return;
    }
    //per aggiornare la control area dell'oggetto
    options.target.setCoords();
    canvF.forEachObject(function (obj) {
        if (!obj.eraser && options.target.intersectsWithObject(obj)) {
            canvF.remove(obj);
        }
    });
}

