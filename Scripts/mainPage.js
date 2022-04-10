var remainingTime;
$(function() {
    var sessionId = localStorage.getItem("sessionId");
    if (sessionId == null)
    {
        window.location.href = "login.html";
        return;
    }
    loadCanvas();
    setInterval(loadCanvas, 1000);
    backendHttpRequest("GetRemainingTime", { "sessionId": sessionId }, function(serverRemainingTime) {
        remainingTime = parseFloat(serverRemainingTime);
        setInterval(reduceRemainingTime, 1000);
    });
    updateTimerAndButton();
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
    var scaleChanged = false;
    if (delta < 0 && scale < 50)
    {
        scale += 1;
        scaleChanged = true;
    }
    else if (delta > 0 && scale > 1)
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
});

var canvasObject;
function loadCanvas()
{
    backendHttpRequest("GetCanvas", {}, function(canvas) {
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
var x,y;
function canvasClick(e)
{
    $("#pixel-info").show();
    var canvasx = e.offsetX;
    var canvasy = e.offsetY;
    x = Math.floor(canvasx / scale);
    y = Math.floor(canvasy / scale);
    var pixel = canvasObject.Pixels[x][y];
    var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
    $("#pixel-color").val(color);
    $("#pixel-color").prop("disabled", true);
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

function canvasMouseUp(event)
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
        var prevTransform = $("#canvas").css("transform");
        var prevTrasnsformX = parseInt(prevTransform.substring(prevTransform.indexOf("(") + 1, prevTransform.indexOf(",")));
        var prevTrasnsformY = parseInt(prevTransform.substring(prevTransform.indexOf(",") + 1, prevTransform.indexOf(")")));
        $("#canvas").css("transform", "translate(" + (prevTrasnsformX + offsetX) + "px, " + (prevTrasnsformY + offsetY) + "px)");
    }
}