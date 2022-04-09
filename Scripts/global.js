function backendHttpRequest(path, params, callback)
{
    var sessionId = localStorage.getItem("sessionId");
    var url = "http://https://canvas-backend.azurewebsites.net/Canvas/" + path;
    var result = $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "json",
        async: true,
        success: function(data) {
            callback(data);
        }
    });
}

function initGoogle() {
    gapi.load('auth2', function() {
        gapi.auth2.init();
    });
}