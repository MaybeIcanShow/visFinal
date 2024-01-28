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

map.on('click', function(e){
    lat = (Math.floor(parseFloat(e.latlng.lat) / 0.25) * 0.25).toFixed(2);
    lon = (Math.floor(parseFloat(e.latlng.lng) / 0.25) * 0.25).toFixed(2);
    console.log("click");
    fileReader(isVector, varName, 7, lon, lat, date.value).then(function (result){
        var data = result;
        console.log(data, lat, lon);
        var marker = L.popup().setLatLng(e.latlng)
            .setContent(createD3ChartContent(data, varName, isVector, lat, lon))
            .openOn(map);
    });
});


function fileReader(isVector = 0, varName = 'salinity', days = 7, lon = 140, lat = 22.25, currentDate = '2023-7-12') {
    console.log(isVector);
    var timedelta = -Math.floor(days / 2);
    if (!isVector) { // Scalar
        console.log("scalar")
        let i = 1;
        var promises = [];
        while (i <= days) {
            var tempDate = dateCalculate(currentDate, timedelta);
            for (let hour = 0; hour <= 18; hour += 6) {
                var path = `../static/data/${varName}/${tempDate.year}/${tempDate.month}/${tempDate.day}/${hour}.asc`;
                var promise = new Promise(function (resolve, reject) {
                    d3.text(path)
                        .then(function (data) {
                            var lines = data.split('\n').map(str => str.trimEnd());
                            var colCount = parseInt(lines[0].split(" ")[1]);
                            var rowCount = parseInt(lines[1].split(" ")[1]);
                            var minLon = parseFloat(lines[2].split(" ")[1]);
                            var minLat = parseFloat(lines[3].split(" ")[1]);
                            var cellsize = parseFloat(lines[4].split(" ")[1]);
                            var notVal = parseInt(lines[5].split(" ")[1]);
                            var rowIndex = rowCount - (lat - minLat) / cellsize + 5;
                            var colIndex = (lon - minLon) / cellsize;
                            var tempValue = parseFloat(lines[rowIndex].split(" ")[colIndex]);
                            if (tempValue == notVal) {
                                tempValue = 0;
                            }
                            resolve(tempValue);
                        })
                        .catch(function (error) {
                            console.log(error);
                            resolve(0);
                        });
                });
                promises.push(promise);
            }
            timedelta++;
            i++;
        }
        return Promise.all(promises)
            .then(function (dataArray) {
                console.log(dataArray);
                // Execute other code here
                return dataArray;
            });
    } else {
        return fileReader(0, `${varName}_uo`, days, lon, lat, currentDate).then(function(u){
            return fileReader(0, `${varName}_vo`, days, lon, lat, currentDate).then(function(v){
                var norm = [];
                var dir = [];
                for(let i = 0; i < 4 * days ; i++){
                    norm[i] = Math.sqrt(u[i] ** 2 + v[i] ** 2);
                    dir[i] = Math.atan2(v[i], u[i]) > 0 ? Math.atan2(v[i], u[i]) : Math.atan2(v[i], u[i]) + 2 * Math.PI;
                }
                return [norm, dir];
            });
        });
    }
}






function dateCalculate(date, timeDelta){
    var currentTimestamp = Date.parse(date);
    // console.log(currentTimestamp);
    var resTimestamp = currentTimestamp + timeDelta * 86400000;
    resTimestamp = new Date(resTimestamp);

    var resDate = {
        'year': resTimestamp.getFullYear(),
        'month': resTimestamp.getMonth() + 1,
        'day': resTimestamp.getDate()
    }
    return resDate
}




function createD3ChartContent(data, varName, isVector, lat, lon) {
    if (!isVector) {
        var popupContent = document.createElement('div');
        popupContent.innerHTML = `<h3 style="text-align: center">${varName} in (${lat}°, ${lon}°) </h3>`;


        // D3 line chart creation code
        var chartContainer = document.createElement('div');
        var svg = d3.select(chartContainer).append('svg')
            .attr('width', 300)
            .attr('height', 200);

        // Define margins and dimensions for the chart area
        var margin = { top: 20, right: 20, bottom: 30, left: 40 };
        var width = +svg.attr('width') - margin.left - margin.right;
        var height = +svg.attr('height') - margin.top - margin.bottom;

        // Create scales for x and y axes
        var xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([d3.min(data) - 0.05 * (d3.max(data) - d3.min(data)), d3.max(data) + 0.05 * (d3.max(data) - d3.min(data))])
            .range([height, 0]);

        // Create axes
        var xAxis = d3.axisBottom(xScale);
        var yAxisLeft = d3.axisLeft(yScale);

        // Append group elements for axes
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
            .call(xAxis);

        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(yAxisLeft);

        // Create line generator
        var line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d));

        // Append path for the line
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr('d', line);

        // Example of coloring a segment of the line
        var segmentData = data.slice(Math.floor(data.length / 8) * 4, Math.floor(data.length / 8) * 4 + 4);
        svg.append('path')
            .datum(segmentData)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('transform', `translate(${margin.left + Math.floor(data.length / 8) * 4 * 240 / (data.length - 1)}, ${margin.top})`)
            .attr('d', line);

        // Label for x-axis
        svg.append('text')
            .attr('x', width + margin.left)
            .attr('y', height + margin.top + margin.bottom) // Positioned at the bottom, slightly above the axis
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('t');

        // Label for y-axis
        svg.append('text')
            .attr('x', -height / 2)
            .attr('y', -margin.left) // Positioned on the left side, slightly to the right of the axis
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('sea');

        // Legend
        var legend = svg.append('g')
            .attr('transform', `translate(${width - 80}, ${margin.top})`);

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', 'blue');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .style('font-size', '12px')
            .text(varName);

        popupContent.appendChild(chartContainer);
        return popupContent;
    } else {
        var norm = data[0];
        var dir = data[1];

        var popupContent = document.createElement('div');
        popupContent.innerHTML = `<h3 style="text-align: center">${varName} in (${lat}°, ${lon}°) </h3>`;






        // D3 line chart creation code
        var chartContainer = document.createElement('div');
        var svg = d3.select(chartContainer).append('svg')
            .attr('width', 300)
            .attr('height', 200);

        // Define margins and dimensions for the chart area
        var margin = { top: 20, right: 40, bottom: 30, left: 40 };
        var width = +svg.attr('width') - margin.left - margin.right;
        var height = +svg.attr('height') - margin.top - margin.bottom;

        // Create scales for x and y axes
        var xScale = d3.scaleLinear()
            .domain([0, norm.length - 1])
            .range([0, width]);

        var normYScale = d3.scaleLinear()
            .domain([d3.min(norm) - 0.05 * (d3.max(norm) - d3.min(norm)), d3.max(norm) + 0.05 * (d3.max(norm) - d3.min(norm))])
            .range([height, 0]);

        var dirYScale = d3.scaleLinear()
            .domain([d3.min(dir) - 0.05 * (d3.max(dir) - d3.min(dir)), d3.max(dir) + 0.05 * (d3.max(dir) - d3.min(dir))])
            .range([height, 0]);

        // Create axes
        var xAxis = d3.axisBottom(xScale);
        var yAxisLeft = d3.axisLeft(normYScale);
        var yAxisRight = d3.axisRight(dirYScale);

        // Append group elements for axes
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
            .call(xAxis);

        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(yAxisLeft);

        svg.append('g')
            .attr('transform', `translate(${width + margin.left}, ${margin.top})`)
            .call(yAxisRight);

        // Create line generators
        var normLine = d3.line()
            .x((d, i) => xScale(i))
            .y(d => normYScale(d));

        var dirLine = d3.line()
            .x((d, i) => xScale(i))
            .y(d => dirYScale(d));

        // Append path for the lines
        svg.append('path')
            .datum(norm)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr('d', normLine);

        svg.append('path')
            .datum(dir)
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr('d', dirLine);

        // Label for x-axis
        svg.append('text')
            .attr('x', width + margin.left)
            .attr('y', height + margin.top + margin.bottom) // Positioned at the bottom, slightly above the axis
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('t');

        // Label for y-axes
        svg.append('text')
            .attr('x', -height / 2)
            .attr('y', -margin.left) // Positioned on the left side, slightly to the right of the axis
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('norm');

        svg.append('text')
            .attr('x', width + height / 2)
            .attr('y', -margin.left + 20) // Positioned on the right side, slightly to the left of the axis
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('dir');

        // Legend
        var legend = svg.append('g')
            .attr('transform', `translate(${width - 80}, ${margin.top})`);

        legend.append('rect')
            .attr('x', 70)
            .attr('y', 0)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', 'blue');

        legend.append('text')
            .attr('x', 90)
            .attr('y', 10)
            .style('font-size', '12px')
            .text('norm');

        legend.append('rect')
            .attr('x', 30)
            .attr('y', 0)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', 'green');

        legend.append('text')
            .attr('x', 50)
            .attr('y', 10)
            .style('font-size', '12px')
            .text('dir');

        // 计算垂直线的起点和终点坐标
        var xCoord1 = xScale(Math.floor(data[0].length / 8) * 4) + margin.left;// x 坐标为 12 对应的位置
        var xCoord2 = xScale((Math.floor(data[0].length / 8) * 4) + 4) + margin.left;// x 坐标为 16 对应的位置
        console.log(Math.floor(data.length / 8));
        var yStart = margin.top; // 垂直线的起点为图表区域的顶部
        var yEnd = height + margin.top; // 垂直线的终点为图表区域的底部

// 在 SVG 中添加垂直于 y 轴的直线
// 在 SVG 中添加虚线
        svg.append('line')
            .attr('x1', xCoord1) // 设置起点的 x 坐标
            .attr('y1', yStart) // 设置起点的 y 坐标
            .attr('x2', xCoord1) // 设置终点的 x 坐标，与起点相同以绘制垂直线
            .attr('y2', yEnd) // 设置终点的 y 坐标
            .attr('stroke', 'red') // 设置直线的颜色
            .attr('stroke-width', 2) // 设置直线的宽度
            .attr('stroke-dasharray', '5,5'); // 设置虚线样式

        svg.append('line')
            .attr('x1', xCoord2) // 设置起点的 x 坐标
            .attr('y1', yStart) // 设置起点的 y 坐标
            .attr('x2', xCoord2) // 设置终点的 x 坐标，与起点相同以绘制垂直线
            .attr('y2', yEnd) // 设置终点的 y 坐标
            .attr('stroke', 'red') // 设置直线的颜色
            .attr('stroke-width', 2) // 设置直线的宽度
            .attr('stroke-dasharray', '5,5'); // 设置虚线样式



        popupContent.appendChild(chartContainer);
        return popupContent;
    }
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
        var windDiv = document.getElementById('seaWind');
        var windPannelDiv = document.getElementById('seaWindInPanel');
        windPannelDiv.innerText = dataUnit[varName];
        windDiv.innerText = dataUnit[varName];

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
    'seaWater': [1, 0],
    'salinity': [35, 30],
    'thetao': [35, 15],
    'precipitation': [5, 0],
    'pressure': [103, 98]
};

var dataUnit = 
{
    'seaWind': '海风 m/s',
    'seaWater': '海流 m/s',
    'salinity': '盐度 10^-3',
    'thetao': '海水势温 ℃',
    'precipitation': '降水 mm',
    'pressure': '气压 kPa'
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

// control.removeLayer(animation);
// control.removeLayer(magnitude);
// control.removeLayer(direction);


function updateMap(varName, isVector, date){
    try{
        control.removeLayer(animation);
        control.removeLayer(magnitude);
        control.removeLayer(direction);
    } catch (error){
    }
    if(isVector){
        d3.text(`../static/data/${varName}_uo/${date.year}/${date.month}/${date.day}/${date.time}.asc`).then(function(u){
            d3.text(`../static/data/${varName}_vo/${date.year}/${date.month}/${date.day}/${date.time}.asc`).then(function (v) {
                vf = L.VectorField.fromASCIIGrids(u, v);
                s = vf.getScalarField("magnitude");
                magnitude = L.canvasLayer.scalarField(s, {
                    color: chroma.scale(colorScale).domain(dataScale[varName]),
                    opacity: 0.6,
                });
                if_add = false;
                map.eachLayer(function (layer) {
                    if (layer !== basemap && layer !== maplabel) {
                        map.removeLayer(layer);
                        if (layer == magnitude) {
                            if_add = true;
                        }
                    }
                });
                animation = L.canvasLayer
                    .vectorFieldAnim(vf, {
                        paths: 5000,
                        fade: 0.97,
                        maxAge: 100,
                        velocityScale: 1 / velocityScale.value,
                        color: color.value,
                        opacity: opacity.value,
                        width: width.value
                    })
                    .addTo(map);
                magnitude = L.canvasLayer.scalarField(s, {
                    color: chroma.scale(colorScale).domain(dataScale[varName]),
                    opacity: magnitude_opacity.value,
                });
                if (if_add) magnitude.addTo(map);
                direction = L.canvasLayer.scalarField(
                    vf.getScalarField("directionFrom"),
                    {
                        type: "vector",
                        color: "white",
                        vectorSize: 25,
                        arrowDirection: "from",
                    }
                );
                control.addOverlay(animation, "矢量图层");
                control.addOverlay(magnitude, "热力图层");
                control.addOverlay(direction, "风向");

            });
        });
    }
    else{
        map.eachLayer(function (layer) {
            if (layer !== basemap && layer !== maplabel) {
                map.removeLayer(layer);
            }
        });
        path = `../static/data/${varName}/${date.year}/${date.month}/${date.day}/${date.time}.asc`;
        d3.text(path).then(function(data){
            var s =  L.ScalarField.fromASCIIGrid(data);
            // var magnitude =
            magnitude = L.canvasLayer.scalarField(s, {
                color: chroma.scale(colorScale).domain(dataScale[varName]),
                opacity: 0.6,
            }).addTo(map);
        });
    }
}













initMap('seaWater', 1, testTime);




