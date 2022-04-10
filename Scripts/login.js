function onSignIn(googleUser)
{
    var idToken = googleUser.getAuthResponse().id_token;
    backendHttpRequest("Login", { "googleToken": idToken }, function(data, status) {
        if (status == "success")
        {
            localStorage.setItem("sessionId", data);
            window.location.href = "index.html";
        }
        else
        {
            $("#failed-message").show();
        }
    });
}