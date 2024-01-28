const colorSelectorPanelElement = document.getElementById('colorSelectorPanel');
const colorBarElement = document.getElementById('colorBar');
const closeSelector = document.getElementById('closeSelector');
const colorBarInPanelElement = document.getElementById('colorBarInPanel');
const clearColor = document.getElementById('clearColor');
var colorLoc = [0, 0.2, 0.4, 0.6, 0.8, 1]


var userData = readUserDataFromCookie();
if(userData){
    colorLoc = userData.colorLoc;
    colorScale = userData.colorScale;
}


// 绘制颜色条 -------------------------------------------------------------------------------------
function drawColorBar(canvasId, height, width, colorScale){
    var targerElement = document.getElementById(canvasId);
    var colorcontext = targerElement.getContext('2d');
    colorcontext.clearRect(0, 0, width, height);
    var colorX1 = 0;
    var colorX2 = 0;
    var colorY1 = 0;
    var colorY2 = height;
    var linearGradient = colorcontext.createLinearGradient(colorX1, colorY1, colorX2, colorY2);
    for(let i = 0; i < colorScale.length; ++i){
        linearGradient.addColorStop(colorLoc[i], colorScale[i]);
    }
    colorcontext.fillStyle = linearGradient;
    colorcontext.fillRect(0.25 * width, 0, width, height);
}

drawColorBar('colorBar', 200, 20, colorScale);
drawColorBar('colorBarInPanel', 300, 50, colorScale);



// 刻度标记--------------------------------------------------------------------------------------------
function drawTicks(canvasId, width, height){
    var targerElement = document.getElementById(canvasId);
    var windContext = targerElement.getContext('2d');
    windContext.fillStyle = '#000000';
    var ticksLabel = [];
    for(let i = 0; i < 6 ; i++){
        console.log(dataScale[varName]);
        ticksLabel[i] = dataScale[varName][1] + (dataScale[varName][0] - dataScale[varName][1]) * i / 5;
    }
    ticksLabel.reverse();
    windContext.beginPath();
    windContext.lineWidth = 0.5;
    var ticks = [0, 20, 40, 60, 80, 100]
    windContext.moveTo(0, 0);
    windContext.lineTo(0, height);
    for(let i = 0; i < ticks.length; ++i){
        windContext.moveTo(0, ticks[i] * height / 100);
        windContext.lineTo(5, ticks[i] * height / 100);
        windContext.fillText(ticksLabel[i], 5, ticks[i] * height / 100);
    }
    windContext.fillText(ticksLabel[0], 5, 10);

    windContext.stroke();
    windContext.closePath();
}

drawTicks('windDomain', 20, 200);

var windDomain = document.getElementById('windDomain');
var windDomainContext = windDomain.getContext("2d");


// 游标实现 -------------------------------------------------------------------------------------------------
var windDomainInPanelElement = document.getElementById('windDomainInPanel');
var windDomainInPaneContext = windDomainInPanelElement.getContext("2d");

var cursorY = 50;
var isDragging = false;

windDomainInPanelElement.addEventListener("mousedown", function (e){
    isDragging = true
});

windDomainInPanelElement.addEventListener("mousemove", function (e){
    if (isDragging){
        cursorY = e.clientY - windDomainInPanelElement.getBoundingClientRect().top;

        if(cursorY < 0){
            cursorY = 0;
        } else if(cursorY > windDomainInPanelElement.height){
            cursorY = canvas.height;
        }

        windDomainInPaneContext.clearRect(0, 0, windDomainInPanelElement.width, windDomainInPanelElement.height);

        drawTicks('windDomainInPanel', 30, 300 );
        drawSlider();

    }
});

windDomainInPanelElement.addEventListener("mouseup", function (e) {
    isDragging = false;
});

// 游标绘制 ---------------------------------------------------------------------------------------------
function drawSlider() {
    // 绘制游标矩形
    windDomainInPaneContext.fillStyle = "#FF0000";
    windDomainInPaneContext.fillRect(10, cursorY - 5, 10, 10);

    // 绘制游标三角形
    windDomainInPaneContext.beginPath();
    windDomainInPaneContext.moveTo(0, cursorY);
    windDomainInPaneContext.lineTo(10, cursorY + 5);
    windDomainInPaneContext.lineTo(10, cursorY - 5);
    windDomainInPaneContext.fillStyle = "#FF0000";
    windDomainInPaneContext.fill();
    windDomainInPaneContext.closePath();
}
drawTicks('windDomainInPanel', 30, 300 );
drawSlider();

// 颜色标记 --------------------------------------------------------------------------------------------------------
function drawTriangle(color, loc){
    var targetElement = document.getElementById('colorBarInPanel');
    var colorBarCTX = targetElement.getContext('2d');
    colorBarCTX.fillStyle = color;
    colorBarCTX.beginPath();
    colorBarCTX.moveTo(10, loc);
    colorBarCTX.lineTo(0, loc + 5);
    colorBarCTX.lineTo(0, loc - 5);
    colorBarCTX.fill();
    colorBarCTX.closePath();
};




// 面板的打开关闭 -----------------------------------------------------------------------------------------------------
colorBarElement.addEventListener('click',function (){
    colorSelectorPanelElement.style.display = 'block';
});

closeSelector.addEventListener('click', function (){
    colorSelectorPanelElement.style.display = 'none';
});



// 颜色删除 巨大bug-------心态爆炸--------------------------------------------------------------------------------------
colorBarInPanelElement.addEventListener('click', function (e){
    var loc = e.clientY - colorBarInPanelElement.getBoundingClientRect().top;
    loc = Math.floor(loc / 5 ) * 5;
    var dropIndex = colorLoc.findIndex(item => Math.abs(item - parseFloat(loc / 300).toFixed(2)) < 0.0001);
    console.log(loc / 300, dropIndex);
    if(dropIndex != -1 && dropIndex != 0 && dropIndex != colorLoc.length - 1) {
        colorLoc.splice(dropIndex, 1);
        colorScale.splice(dropIndex, 1);
        drawColorBar('colorBar', 200, 20, colorScale);
        drawColorBar('colorBarInPanel', 300, 50, colorScale);
        magnitude.setColor(chroma.scale(colorScale).domain([26.5, 1.5]));
        for(let i = 0; i < colorLoc.length; ++i){
            drawTriangle(colorScale[i], colorLoc[i] * colorBarInPanelElement.height); // 更新颜色标签
        }
        writeUserDataToCookie('joe', colorLoc, colorScale, 3);
    }

})

for(let i = 0; i< colorLoc.length; ++i){
    drawTriangle(colorScale[i], colorLoc[i] * colorBarInPanelElement.height); // 更新颜色标签
}


// 颜色选择器 ------------------------------------------------------------------------------------------
$("#colorSelector").spectrum({
    flat: true,
    showInput: true,
    showPalette: true,
    // togglePalette: true,
    // togglePaletteMoreText: 'more',
    // togglePaletteLessText: 'less',
    color: 'blanchedalmond',
    maxSelectionSize: 64,
    palette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"] ,
    ]
});

$("#colorSelector").on('move.spectrum', function(e, tinycolor) {
    var hexColor = tinycolor.toHexString();
    console.log(hexColor, Math.floor(cursorY / 5) * 5);
    var loc = Math.floor(cursorY / 5) * 5
    // drawTriangle(hexColor, loc);

    var insertIndex = 0;

    var replace = 0;
    for(let i = 0; i < colorLoc.length; ++i){
        // console.log(colorLoc[i] < loc / 300);
        if(colorLoc[i] - loc / 300 > 0.004) {
            insertIndex = i;
            console.log(colorLoc[i] - loc / 300);
            break;
        }
        else if(colorLoc[i] - loc / 300 < 0.004 && colorLoc[i] - loc / 300 > 0){
            replace = 1;
            insertIndex = i;
            break;
        }
    }
    if(replace){
        colorLoc[insertIndex] = parseFloat((loc / 300).toFixed(2));
        colorScale[insertIndex] = hexColor;
    }
    else{
        colorLoc.splice(insertIndex, 0, parseFloat((loc / 300).toFixed(2)));
        colorScale.splice(insertIndex, 0, hexColor);
    }
    drawColorBar('colorBar', 200, 20, colorScale);
    drawColorBar('colorBarInPanel', 300, 50, colorScale);
    for(let i = 0; i< colorLoc.length; ++i){
        drawTriangle(colorScale[i], colorLoc[i] * colorBarInPanelElement.height); // 更新颜色标签
    }
    console.log(colorLoc, colorScale);
    magnitude.setColor(chroma.scale(colorScale).domain([26.5, 1.5]));
    writeUserDataToCookie('joe', colorLoc, colorScale, 3);
});



clearColor.addEventListener('click',function (){
   colorScale = [
       "#FF0000", // 红色
       "#FF6600", // 橙红色
       "#FFCC00", // 黄色
       "#99FF00", // 淡绿色
       "#33CC33", // 绿色
       "#009900"
   ];
    colorLoc = [0, 0.2, 0.4, 0.6, 0.8, 1];
    writeUserDataToCookie('joe', colorLoc, colorScale, 3);
    drawColorBar('colorBar', 200, 20, colorScale);
    drawColorBar('colorBarInPanel', 300, 50, colorScale);
    for(let i = 0; i< colorLoc.length; ++i){
        drawTriangle(colorScale[i], colorLoc[i] * colorBarInPanelElement.height); // 更新颜色标签
    }
    magnitude.setColor(chroma.scale(colorScale).domain([26.5, 1.5]));
});




function writeUserDataToCookie(username, colorLoc, colorScale, expires) {
    // 读取已存在的 userData 或创建一个新的对象
    const existingUserData = readUserDataFromCookie() || {};

    // 更新已存在的 userData
    existingUserData.username = username;
    existingUserData.colorLoc = colorLoc;
    existingUserData.colorScale = colorScale;

    // 将对象转换为 JSON 字符串
    const userDataString = JSON.stringify(existingUserData);

    // 构建 cookie 字符串
    let cookieString = `userData=${encodeURIComponent(userDataString)}`;

    // 设置过期时间
    if (expires) {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + expires * 24 * 60 * 60 * 1000);
        cookieString += `;expires=${expirationDate.toUTCString()}`;
    }

    // 设置 cookie
    document.cookie = cookieString;
}








// 读取用户数据从 cookie
function readUserDataFromCookie() {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');

        if (cookieName.trim() === 'userData') {
            // 解析 JSON 字符串为对象
            return JSON.parse(decodeURIComponent(cookieValue));
        }
    }

    // 如果找不到名为 'userData' 的 cookie，则返回 null
    return null;
}

