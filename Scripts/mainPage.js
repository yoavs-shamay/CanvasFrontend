var remainingTime;
$(function() {
    var sessionId = localStorage.getItem("sessionId");
    if (sessionId == null)
    {
        window.location.href = "login.html";
        return;
    }
    backendHttpRequest("GetRemainingTime", { "sessionId": sessionId }, function(serverRemainingTime, status) {
        remainingTime = parseFloat(serverRemainingTime);
        setInterval(reduceRemainingTime, 1000);
        loadCanvas();
        setInterval(loadCanvas, 1000);
        updateTimerAndButton();
    });
});

function reduceRemainingTime()
{
    if (remainingTime > 0)
    {
        remainingTime -= 1/60;
        var minutes = Math.floor(remainingTime);
        var seconds = Math.floor((remainingTime - minutes) * 60);
        $("#timer").text(minutes + ":" + seconds);
    }
    updateTimerAndButton();
}

function updateTimerAndButton()
{
    if (remainingTime > 0)
    {
        $("#timer").show();
        $("#change-color-button").hide();
    }
    else
    {
        $("#timer").hide();
        if (!$("#save-button").is(":visible"))
        {
            $("#change-color-button").show();
        }
    }
}


var scale = 1;
$(document).on("mousewheel DOMMouseScroll", function(e) {
    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
    resizeCanvas(delta > 0);
});

function resizeCanvas(bigger)
{
    var scaleChanged = false;
    if (bigger && scale < 50)
    {
        scale += 1;
        scaleChanged = true;
    }
    else if (!bigger && scale > 1)
    {
        scale -= 1;
        scaleChanged = true;
    }
    if (scaleChanged)
    {
        $("#canvas").attr("width", canvasObject.Width * scale);
        $("#canvas").attr("height", canvasObject.Height * scale);
        loadCanvas();
    }
}

var canvasObject;
function loadCanvas()
{
    backendHttpRequest("GetCanvas", {}, function(canvas, status) {
        canvasObject = JSON.parse(canvas);
        var width = canvasObject.Width;
        var height = canvasObject.Height;
        $("#canvas").attr("width", width * scale);
        $("#canvas").attr("height", height * scale);
        var pixels = canvasObject.Pixels;
        var ctx = $("#canvas")[0].getContext("2d");
        for (var i = 0; i < pixels.length; i++)
        {
            for (var j = 0; j < pixels[i].length; j++)
            {
                var pixel = pixels[i][j];
                var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
                ctx.fillStyle = color;
                ctx.fillRect(pixel.X * scale, pixel.Y * scale, scale, scale);
            }
        }
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(x * scale, y * scale, scale, scale);
    });
}

function logout()
{
    var sessionId = localStorage.getItem("sessionId");
    localStorage.removeItem("sessionId");
    backendHttpRequest("Logout", {"sessionId": sessionId}, function(data) {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            window.location.href = "login.html";
        });
    });
}
var x = 0,y = 0;
function canvasClick(e)
{
    var pixel = canvasObject.Pixels[x][y];
    $("#pixel-info").show();
    var canvasx = e.offsetX;
    var canvasy = e.offsetY;
    if (canvasx < 0 || canvasy < 0 || canvasx > $("#canvas").width() || canvasy > $("#canvas").height())
    {
        $("#pixel-info").hide();
        return;
    }
    x = Math.floor(canvasx / scale);
    y = Math.floor(canvasy / scale);
    var pixel = canvasObject.Pixels[x][y];
    var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
    loadCanvas();
    $("#pixel-color").val(color);
    $("#pixel-color").prop("disabled", true);
    $("#pixel-coords").text("(" + x + "," + y + ")");
    $("#pixel-modifier").val(pixel.LastModifier);
    if (remainingTime > 0)
    {
        $("#timer").show();
        $("#change-color-button").hide();
    }
    else
    {
        $("#timer").hide();
        $("#change-color-button").show();
    }
    $("#save-button").hide();
}

function rgbToHex(red, green, blue)
{
    var rgb = blue | (green << 8) | (red << 16);
    return rgb.toString(16);
}

function changeColor()
{
    $("#pixel-color").prop("disabled", false);
    $("#change-color-button").hide();
    $("#save-button").show();
}

function saveColor()
{
    var color = $("#pixel-color").val();
    var colorRGB = hexToRgb(color);
    var params = {
        "sessionId": localStorage.getItem("sessionId"),
        "x": x,
        "y": y,
        "red": colorRGB[0],
        "green": colorRGB[1],
        "blue": colorRGB[2]
    };
    $("#pixel-color").prop("disabled", true);
    remainingTime = 5;
    $("#save-button").hide();
    $("#change-color-button").hide();
    $("#timer").show();
    $("#timer").text("5:00");
    backendHttpRequest("ChangePixel", params, function() {
        loadCanvas();
    });
}

function hexToRgb(color)
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

var downX, downY, mouseDown;
function canvasMouseDown(event)
{
    downX = event.offsetX;
    downY = event.offsetY;
    mouseDown = true;
}

function mouseUp(event)
{
    mouseDown = false;
}

function canvasMouseMove(event)
{
    if (mouseDown)
    {
        var canvasx, canvasy;
        canvasx = event.offsetX;
        canvasy = event.offsetY;
        var offsetX = canvasx - downX;
        var offsetY = canvasy - downY;
        var prevTransformX = parseInt($("#canvas").css("left"));
        var prevTransformY = parseInt($("#canvas").css("top"));
        var currentTransformX = prevTransformX + offsetX;
        var currentTransformY = prevTransformY + offsetY;
        var canvasDivHeight = $("#canvas-div").height();
        var canvasDivWidth = $("#canvas-div").width();
        var maxTransformX = canvasDivWidth - canvasObject.Width * scale;
        var maxTransformY = canvasDivHeight - canvasObject.Height * scale;
        var minTransformX = -canvasObject.Width * scale + canvasDivWidth;
        var minTransformY = -canvasObject.Height * scale + canvasDivHeight;
        if (currentTransformX > maxTransformX)
        {
            currentTransformX = maxTransformX;
        }
        else if (currentTransformX < minTransformX)
        {
            currentTransformX = minTransformX;
        }
        if (currentTransformY > maxTransformY)
        {
            currentTransformY = maxTransformY;
        }
        else if (currentTransformY < minTransformY)
        {
            currentTransformY = minTransformY;
        }
        $("#canvas").css("left", currentTransformX + "px");
        $("#canvas").css("top", currentTransformY + "px");
    }
}

var normalWidth = $(window).width();
var normalHeight = $(window).height();
//detect window zoom and prevent default
$(window).resize(function(event) {
    if ($(window).width() != normalWidth || $(window).height() != normalHeight)
    {
        event.preventDefault();
    }
    var isBigger = $(window).width() > normalWidth || $(window).height() > normalHeight;
    resizeCanvas(isBigger);
});
//detect zoom on mobile
$(document).on("touchmove", function(event) {
    var isBigger = $(window).width() > normalWidth || $(window).height() > normalHeight;
    resizeCanvas(isBigger);
    event.preventDefault();
}