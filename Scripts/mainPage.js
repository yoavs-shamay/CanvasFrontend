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
        remainingTime = serverRemainingTime;
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


//scale canvas when wheeling
$(document).on("mousewheel DOMMouseScroll", function(e) {
    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
    var scale = 1;
    if (delta < 0)
    {
        scale = 1.1;
    }
    else
    {
        scale = 0.9;
    }
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
    canvas.width = width * scale;
    canvas.height = height * scale;
});

var canvasObject;
function loadCanvas()
{
    backendHttpRequest("GetCanvas", {}, function(canvas) {
        canvasObject = JSON.parse(canvas);
        var width = canvasObject.Width;
        var height = canvasObject.Height;
        $("#canvas").attr("width", width);
        $("#canvas").attr("height", height);
        var pixels = canvasObject.Pixels;
        var ctx = $("#canvas")[0].getContext("2d");
        for (var i = 0; i < pixels.length; i++)
        {
            for (var j = 0; j < pixels[i].length; j++)
            {
                var pixel = pixels[i][j];
                var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
                ctx.fillStyle = color;
                ctx.fillRect(pixel.X, pixel.Y, 1, 1);
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
    x = e.offsetX;
    y = e.offsetY;
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