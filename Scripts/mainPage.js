var remainingTime;
var prevDistance = 0;
$(function() {
    var sessionId = localStorage.getItem("sessionId");
    if (sessionId == null)
    {
        window.location.href = "login.html";
        return;
    }

    backendHttpRequest("CheckSessionId", {"sessionId": sessionId}, function(response, status) {
        if (response === "False")
        {
            localStorage.removeItem("sessionId");
            window.location.href = "login.html";
            return;
        }
        else
        {
            backendHttpRequest("GetRemainingTime", { "sessionId": sessionId }, function(serverRemainingTime, status) {
                remainingTime = parseFloat(serverRemainingTime);
                setInterval(reduceRemainingTime, 1000);
                loadCanvas();
                setInterval(loadCanvas, 1000);
                updateTimerAndButton();
            });
            var isMobile = false; 
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
                || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
                isMobile = true;
            }
            if (isMobile)
            {
                $("#canvas").on("touchstart", canvasTouchStart);
                $("#canvas").on("touchmove", canvasTouchMove);
                $("#canvas").on("touchend", canvasTouchEnd);
            }
        }
    });
});

const zeroPad = (num, places) => String(num).padStart(places, '0');

function reduceRemainingTime()
{
    if (remainingTime > 0)
    {
        remainingTime -= 1/60;
        var minutes = Math.floor(remainingTime);
        var seconds = Math.floor((remainingTime - minutes) * 60);
        $("#timer").text(minutes + ":" + zeroPad(seconds, 2));
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
var scaleRound = 1;
$(document).on("mousewheel DOMMouseScroll", function(e) {
    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
    resizeCanvas(delta > 0, 1);
});

function resizeCanvas(bigger, amount)
{
    var scaleChanged = false;
    if (bigger && scale < 50)
    {
        scale += amount;
        scaleChanged = true;
    }
    else if (!bigger && scale > 1)
    {
        scale -= amount;
        scaleChanged = true;
    }
    if (scaleChanged)
    {
        scaleRound = Math.round(scale);
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
        $("#canvas").attr("width", width * scaleRound);
        $("#canvas").attr("height", height * scaleRound);
        var pixels = canvasObject.Pixels;
        var ctx = $("#canvas")[0].getContext("2d");
        for (var i = 0; i < pixels.length; i++)
        {
            for (var j = 0; j < pixels[i].length; j++)
            {
                var pixel = pixels[i][j];
                var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
                ctx.fillStyle = color;
                ctx.fillRect(pixel.X * scaleRound, pixel.Y * scaleRound, scaleRound, scaleRound);
            }
        }
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(x * scaleRound, y * scaleRound, scaleRound, scaleRound);
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
    $("#change-pixel").show();
    var canvasx = e.offsetX;
    var canvasy = e.offsetY;
    if (canvasx < 0 || canvasy < 0 || canvasx > $("#canvas").width() || canvasy > $("#canvas").height())
    {
        $("#pixel-info").hide();
        $("#change-pixel").hide();
        return;
    }
    x = Math.floor(canvasx / scaleRound);
    y = Math.floor(canvasy / scaleRound);
    var pixel = canvasObject.Pixels[x][y];
    var color = "#" + ("000000" + rgbToHex(pixel.Red, pixel.Green, pixel.Blue)).slice(-6);
    loadCanvas();
    $("#pixel-color").val(color);
    $("#pixel-color").prop("disabled", true);
    $("#pixel-coords").text("(" + x + "," + y + ")");
    $("#pixel-modifier").text(pixel.LastModifier);
    if (pixel.LastModifier === "")
    {
        $("#modifier-info").hide();
    }
    else
    {
        $("#modifier-info").show();
    }
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
    $("#pixel-color").click();
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
    $("#save-button").hide();
    $("#change-color-button").hide();
    $("#timer").show();
    $("#timer").text("5:00");
    remainingTime = 5;
    backendHttpRequest("ChangePixel", params, function() {
        remainingTime = 5;
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
        var maxTransformX = canvasDivWidth - canvasObject.Width * scaleRound;
        var maxTransformY = canvasDivHeight - canvasObject.Height * scaleRound;
        var minTransformX = -canvasObject.Width * scaleRound + canvasDivWidth;
        var minTransformY = -canvasObject.Height * scaleRound + canvasDivHeight;
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

function canvasTouchStart(event)
{
    if (event.touches.length == 1) {
        var touch = event.originalEvent.touches[0];
        var r = canvas.getBoundingClientRect();
        var touch = event.touches[0];
        var x = touch.pageX - r.left;
        var y = touch.pageY - r.top;
        downX = x;
        downY = y;
        mouseDown = true;
    }
    prevDistance = 0;
}

function canvasTouchMove(e)
{
    if (e.touches.length === 2) {
        var x = e.originalEvent.touches[0].pageX;
        var y = e.originalEvent.touches[0].pageY;
        var x2 = e.originalEvent.touches[1].pageX;
        var y2 = e.originalEvent.touches[1].pageY;
        var distance = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));
        if (distance > prevDistance)
        {
            resizeCanvas(true, 0.2);
        }
        else if (distance < prevDistance)
        {
            resizeCanvas(false, 0.2);
        }
        prevDistance = distance;
    }
    else if (e.touches.length === 1) {
        var r = canvas.getBoundingClientRect();
        var touch = e.touches[0];
        var x = touch.pageX - r.left;
        var y = touch.pageY - r.top;
        canvasMouseMove({offsetX: x, offsetY: y});
    }
}

function canvasTouchEnd(e)
{
    mouseDown = false;
    prevDistance = 0;
}