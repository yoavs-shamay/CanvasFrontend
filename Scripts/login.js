function onSignIn(googleUser)
{
    var idToken = googleUser.getAuthResponse().id_token;
    backendHttpRequest("Login", { "googleToken": idToken }, function(data) {
        localStorage.setItem("sessionId", data);
        window.location.href = "mainPage.html";
    });
}