function backendHttpRequest(path, params, callback)
{
    var sessionId = localStorage.getItem("sessionId");
    var url = "https://canvas-backend.azurewebsites.net/Canvas/" + path;
    $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "json",
        async: true,
        complete: function (xhr, status) {
            callback(xhr.responseText);
        }
    });
}

function initGoogle() {
    gapi.load('auth2', function() {
        gapi.auth2.init();
    });
}