// This file is to be hosted on the API server. This has a function to invoke POST APIs which can not invoked using jsonp pattern
function createCORSRequest(method, url, isAsync) {
    var xmlhttp = null;
    if(/MSIE/i.test(navigator.userAgent)) {
        xmlhttp = new XDomainRequest();
        xmlhttp.open(method, url, isAsync);
        return xmlhttp;
    }
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        try {
        xmlhttp = new XMLHttpRequest();
        }
        catch(ex) { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if("withCredentials" in xmlhttp) {
        console.log("withCredentials: " + xmlhttp.withCredentials);
        //xmlhttp.withCredentials = true;
        xmlhttp.open(method, url, isAsync);
    }
    else if(typeof XDomainRequest != "undefined") {
        xmlhttp = new XDomainRequest();
        xmlhttp.open(method, url);
    }
    else {
        xmlhttp = null;
    }
    //xmlhttp.setRequestHeader("Access-Control-Request-Method", method);
    //xmlhttp.setRequestHeader("Content-Type", "text/json; charset=utf-8");
    //xmlhttp.setRequestHeader("X-Custom-Header", "value");

    return xmlhttp;
}

function invokePostAPI(url, postData, isAsync, asyncHandler) {
    var xmlhttp = createCORSRequest("POST", url, isAsync);
    if(isAsync) {
        xmlhttp.onreadystatechange = asyncHandler;
    }
    xmlhttp.send(postData);
    return xmlhttp;
}

function removeServerWaitMessage() {
    if(document.getElementById('__waitMessage__'))
        document.getElementById('onthisday-header').removeChild(document.getElementById('__waitMessage__'));
}

function invokeGetAPI(url, isAsync, asyncHandler, noWaitMessage) {
    var xmlhttp = createCORSRequest("GET", url, isAsync);
    if(!document.getElementById('__waitMessage__') && !noWaitMessage) {
        var mainElement = document.getElementById('onthisday-header');
        var warningElement = document.createElement('span');
        warningElement.id = "__waitMessage__";
        warningElement.style.color = "orange";
        warningElement.style.fontSize = "18px";
        warningElement.appendChild(document.createElement('br'));
        warningElement.appendChild(document.createTextNode('Waiting for response from server. Please wait...'));
        warningElement.appendChild(document.createElement('br'));
        mainElement.insertBefore(warningElement, mainElement.firstChild); 
    }
    if(isAsync && /MSIE/i.test(navigator.userAgent)) {
        xmlhttp.onload = asyncHandler;
    }
    else if(isAsync) {
        xmlhttp.onreadystatechange = asyncHandler;
    }
    xmlhttp.send();
    return xmlhttp;
}

function invokeDeleteAPI(url, isAsync, asyncHandler) {
    var xmlhttp = createCORSRequest("DELETE", url, isAsync);
    if(isAsync) {
        xmlhttp.onreadystatechange = asyncHandler;
    }
    xmlhttp.send();
    return xmlhttp;
}

function invokePutAPI(url, putData, isAsync, asyncHandler) {
    var xmlhttp = createCORSRequest("PUT", url, isAsync);
    if(isAsync) {
        xmlhttp.onreadystatechange = asyncHandler;
    }
    xmlhttp.send(postData);
    return xmlhttp;
}

