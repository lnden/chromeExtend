'use strict';

// chrome.browserAction.setBadgeText({text: chrome.runtime.getManifest().version});
function exit() {
    sessionStorage.clear();
    chrome.browserAction.setPopup({"popup": "login.html"});
    broadcastMessage({action: 'USER_EXIT'});
    fnLoginTimer();
}

function getUserNumber() {
    return sessionStorage.getItem('userNumber');
}

function getUserName() {
    return sessionStorage.getItem('userName');
}

function getTeamId() {
    return sessionStorage.getItem('teamId');
}

function getTeamName() {
    return sessionStorage.getItem('teamName');
}

function isLogin() {
    return getUserNumber() != undefined && getUserNumber() != null;
}

function getToken() {
    return sessionStorage.getItem('token');
}

function getHost() {
    return 'http://47.104.152.151:' + config.port + '/';
    //return 'http://192.168.0.105:8080/';
}

function isTesting() {
    return config.port == 8082;
}

function sendToServer(data, api, isPost, successCallback, failCallback) {
    var msg;
    if (data != null) {
        if (data.needing) {
            msg = data;
        } else {
            //是否需要stringify
            msg = JSON.stringify(data);
        }
    } else {
        msg = {};
    }
    console.log('SendingToServer:', JSON.stringify(data));
    $.ajax({
        type: isPost ? 'POST' : 'GET',
        url: getHost() + api,
        data: msg,
        headers: {token: getToken()},
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    })
        .done(function (response) {
            if (response.newToken != undefined) {
                console.log('Token updated');
                sessionStorage.setItem('token', response.newToken);
                sendToServer(data, api, isPost, successCallback, failCallback);
                return;
            }
            console.log('sendToServer done:', response);
            //localStorage.setItem('keyword', JSON.stringify(response));
            if (response.success) {
                successCallback(response);
            } else {
                if (failCallback) {
                    failCallback(response);
                } else {
                    NotifyError(response);
                }
            }
        })
        .fail(function (response) {
            console.log('Ajax failure:', JSON.stringify(response));
            if (data.retryTimes == undefined) {
                data.retryTimes = 1;
            } else {
                data.retryTimes++;
            }
            if (data.retryTimes <= 10) {
                setTimeout(function () {
                    sendToServer(data, api, isPost, successCallback, failCallback);
                }, data.retryTimes * 1000);
            } else {
                NotifyError('网络异常，请查看背景页控制台日志！');
            }
        });
}

// sendResponse was called synchronously. If you want to asynchronously use sendResponse,
// add return true; to the onMessage event handler.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == 'HAVE_LOGIN') {
        sendResponse({userName: getUserName(), isLogin: isLogin(), userNumber: getUserNumber()});
        return true;
    }
    if (request.action == 'LOGIN_SUCCESS') {
        console.log('background js received authenticated data:', request);
        sessionStorage.setItem('token', request.data.token);
        sessionStorage.setItem('userNumber', request.data.user.no);
        sessionStorage.setItem('userName', request.data.user.name);
        sessionStorage.setItem('teamId', request.teamId);
        sessionStorage.setItem('teamName', request.teamName);
        show(getUserName() + '登录成功');
        loginSuccess();
        sendResponse('登录成功');
        return true;
    }
    if (!isLogin()) {
        sendResponse(null);
        return true;
    }

    if (request.action == 'FIND_IN_PAGES' || request.action == 'CLEAR_FIND_IN_PAGES') {
        broadcastMessage(request);
        sendResponse(null);
        return true;
    }

    if (request.action == 'FETCH_DATA_FROM_SERVER') {
        var url = request.url;
        var data = request.params;
        var ispost = request.ispost;
        var showErr = request.showErr;
        var failCallback = showErr ? null : sendResponse;
        sendToServer(data, url, ispost, sendResponse, failCallback);
        return true;
    }
    if (request.action == 'AUDIT_SAVE_REQUEST') {
        var data = request.params;
        data.inspector = getUserNumber();
        sendToServer(data, 'videoQualityResult/add', true, sendResponse, null);
        return true;
    }
    if (request.action == 'GET_ILLUSTRATION') {
        var url = '/imageTextNotPassIllustrate/getIllustration';
        addIllustration = request.add;
        sendToServer(request, url, false, getIllustration, null);
        return true;
    }
    if (request.action == 'HAVE_KEYWORD') {
        if (GLOBAL_KEYWORDS != null) {
            console.log("Sending keywords to content script:", GLOBAL_KEYWORDS.length);
        }
        sendResponse(GLOBAL_KEYWORDS);
        return true;
    }

    if (request.action == 'KEYWORDS_UPDATE_TIME_REQUEST') {
        sendResponse(GLOBAL_KEYWORDS_TIMESTAMP);
        return true;
    }

    if (request.action == 'HAVE_SEARCH') {
        chrome.tabs.query({}, function (tabs) {
            var message = {isLogin: !!sessionStorage.getItem('token'), status: Status};
            for (var i = 0; i < tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });
    }
    return true;
});
var addIllustration = true;

function getIllustration(response) {
    response.add = addIllustration;
    sendMessageToContentImageText(response, getMsgFromContentImageText);
}

function sendMessageToContentImageText(response, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs[0] != undefined) {
            response.action = 'GET_ILLUSTRATIONBACK';
            chrome.tabs.sendMessage(tabs[0].id, response, callback);
        } else {
            NotifyError('Fail to send message to your tab, Please keep it active');
        }
    });
}

function getMsgFromContentImageText(response) {
    console.log(response);
}

show('IDSC工作助手已加载');

chrome.tabs.create({url: chrome.extension.getURL('login.html')});

function promptLogin() {
    show('请登录插件');
}

function fnLoginTimer() {
    var loginTimer = window.setInterval(function () {
        if (!isLogin()) {
            promptLogin();
        } else {
            console.log('Clearing login prompt timer:', loginTimer);
            window.clearInterval(loginTimer);
        }
    }, 5000);
}

fnLoginTimer();