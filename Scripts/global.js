var backendUrl = "canvas-backend-bengurion.herokuapp.com";

function backendHttpRequest(path, params, callback)
{
    var url = "https://" + backendUrl + "/Canvas/" + path;
    $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "json",
        async: true,
        complete: function (xhr, status) {
            callback(xhr.responseText, status);
        }
    });
}

function initGoogle() {
    gapi.load('auth2', function() {
        gapi.auth2.init();
    });
}