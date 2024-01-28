let map = L.map("map");

map.createPane("tilePane");
map.getPane("tilePane").style.zIndex = 650;

// Basemap
let url = "../static/img/mapimg/{z}/{x}/{y}.png";
basemap = L.tileLayer(url, {
    maxZoom: 6,
    minZoom: 4,
    pane: "tilePane",
}).addTo(map);

maplabel = L.tileLayer("../static/img/maplabel/{z}/{x}/{y}.png", {
    maxZoom: 6,
    minZoom: 4,
    pane: "tilePane",
}).addTo(map);

map.getContainer().style.background = "rgba(164, 205, 255)";

var isVecotr = 0;

function upload(isVector){

}






















let width = document.getElementById("width");
width.addEventListener("input", function () {
    animation.options.width = width.value;
});

let color = document.getElementById("color");
color.addEventListener("input", function () {
    animation.options.color = color.value;
});

let velocityScale = document.getElementById("velocityScale");
velocityScale.addEventListener("input", function () {
    animation.options.velocityScale = 1 / velocityScale.value;
});

let opacity = document.getElementById("opacity");
opacity.addEventListener("input", function () {
    animation.setOpacity(opacity.value);
});

let magnitude_opacity = document.getElementById("magnitude_opacity");
magnitude_opacity.addEventListener("input", function () {
    magnitude.setOpacity(magnitude_opacity.value);
});


var varName = "salinity";
var isVector = 0;
const varOption = document.getElementsByName("varOption");
for (var i = 0; i < varOption.length; i++) {
    varOption[i].addEventListener('change', function() {
        // console.log('Selected value:', this.value);
        varName = this.value.split(" ")[0];
        if(this.value.split(" ")[1] == "vector") {
            isVector = 1;
        }else{
            isVector = 0;
        }
        // initMap(varName, isVector, testTime);
        updateMap(varName, isVector, testTime);
        windDomainInPaneContext.clearRect(0, 0, windDomainInPanelElement.width, windDomainInPanelElement.height);
        windDomainContext.clearRect(0, 0, windDomain.width, windDomain.height);
        drawTicks('windDomainInPanel', 30, 300 );
        drawSlider();
        drawTicks('windDomain', 20, 200);
    });
}




const testTime = {
    'year': 2023,
    'month': 7,
    'day': 1,
    'time': 0
}



let vf = null;
let s = null;
let magnitude = null;
let direction = null;
var animation = null;
let control = null;

// var salinityScale = [30, 35]
var dataScale = {
    'seaWind': [26.5, 1.5],
    'seaWater': [0, 1],
    'salinity': [35, 30],
    'thetao': [35, 15],
    'precipitation': [5, 0],
    'pressure': [103, 98]
};

var colorScale = [
    "#FF0000", // 红色
    "#FF6600", // 橙红色
    "#FFCC00", // 黄色
    "#99FF00", // 淡绿色
    "#33CC33", // 绿色
    "#009900"  // 深绿色
];





function initMap(varName, isVector, date){
    if(!isVector){
        path = `../static/data/${varName}/${date.year}/${date.month}/${date.day}/${date.time}.asc`;
        d3.text(path).then(function(data){
            var s =  L.ScalarField.fromASCIIGrid(data);
            // var magnitude =
            magnitude = L.canvasLayer.scalarField(s, {
                color: chroma.scale(colorScale).domain(dataScale[varName]),
                opacity: 0.6,
            }).addTo(map);
        });
        console.log(s);
    }
    else{
        d3.text(`../static/data/${varName}_uo/${date.year}/${date.month}/${date.day}/${date.time}.asc`).then(function(u){
            d3.text(`../static/data/${varName}_vo/${date.year}/${date.month}/${date.day}/${date.time}.asc`).then(function (v){
                vf = L.VectorField.fromASCIIGrids(u, v);
                s = vf.getScalarField("magnitude");
                magnitude = L.canvasLayer.scalarField(s, {
                    color: chroma.scale(colorScale).domain(dataScale[varName]),
                    opacity: 0.6,
                });
                direction = L.canvasLayer.scalarField(
                    vf.getScalarField("directionFrom"),
                    {
                        type: "vector",
                        color: "white",
                        vectorSize: 25,
                        arrowDirection: "from",
                    }
                );
                animation = L.canvasLayer.vectorFieldAnim(vf, {
                    paths: 5000,
                    fade: 0.97,
                    maxAge: 100,
                    color: "rgba(255, 255, 255, 0.7)",
                }).addTo(map);
                control = L.control.layers({},
                    {
                        矢量图层: animation,
                        热力图层: magnitude,
                        风向: direction,
                    },
                    {
                        position: "bottomleft",
                        collapsed: false,
                    }
                ).addTo(map);
                map.fitBounds(animation.getBounds());
            });
        });
    }
}


















