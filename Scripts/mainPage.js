var remainingTime;
$(function() {
    var sessionId = localStorage.getItem("sessionId");
    if (sessionId == null)
    {
        window.location.href = "login.html";
        return;
    }
    setInterval(loadCanvas, 1000);
    backendHttpRequest("GetRemainingTime", { "sessionId": sessionId }, function(serverRemainingTime) {
        remainingTime = serverRemainingTime;
        setInterval(reduceRemainingTime, 1000);
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
}

var scale = 1;
var lastScrollTop = 0;
function canvasScroll(e)
{
    var st = $(this).scrollTop();
    if (st > lastScrollTop)
    {
        if (scale < 5)
        {
            scale += 1;
            $("#canvas")[0].getContext("2d").scale(scale, scale);
            loadCanvas();
        }
    }
    else
    {
        if (scale > 1)
        {
            scale -= 1;
            $("#canvas")[0].getContext("2d").scale(scale, scale);
            loadCanvas();
        }
    }
    lastScrollTop = st;
}

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
                var color = "rgb(" + pixel.Red + "," + pixel.Green + "," + pixel.Blue + ")";
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
    var color = "rgb(" + pixel.Red + "," + pixel.Green + "," + pixel.Blue + ")";
    $("#pixel-color").val(color);
    $("#pixel-color").prop("disabled", true);
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
    var colorRGB = color.match(/\d+/g);
    var params = {
        "sessionId": localStorage.getItem("sessionId"),
        "x": x,
        "y": y,
        "red": colorRGB[1],
        "green": colorRGB[2],
        "blue": colorRGB[3]
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