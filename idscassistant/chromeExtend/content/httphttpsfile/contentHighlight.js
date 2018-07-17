document.body.myConfig = {};
document.body.myKeywords = null;
//发送已经登录验证，如果登录继续执行
chrome.extension.sendMessage({ "action": "HAVE_LOGIN" }, function (response) {
    if (response.isLogin) {
        onLogin();
    }
});

//执行登录方法
function onLogin() {
    chrome.extension.sendMessage({ action: "GET_FUNCTIONALITY_LIST" }, function (config) {
        console.log("contentHighlight.js original config:", document.body.myConfig);
        console.log("contentHighlight.js received:", config);
        //把config参数放入公共变量
        document.body.myConfig = config;
        if (document.body.myConfig.isKeywordHighlightActive) {
            requestKeywords();
        }
    });
}

//发送已经关键字验证，如果有关键字继续执行
function requestKeywords() {
    chrome.runtime.sendMessage({ action: 'HAVE_KEYWORD' }, function (kw) {
        if (kw == null) {
            console.log("Content script get", kw.length, "keywords", kw);
            return;
        }
        document.body.myKeywords = kw;
        highlightKeyword(document.body.myKeywords);
    });
}

//接收"关键字"，点亮关键字函数
function highlightKeyword(kw) {
    if (kw == null) {
        console.log("There is no keywords");
        return;
    }
    //执行highlighter方法
    highlighter.highlight(document.body || document, kw);
    //监听DOM变化更新关键字
    document.body.addEventListener("DOMSubtreeModified", function (a) {
        if (document.body.myConfig.isKeywordHighlightActive) {
            highlighter.highlight(a.target, kw);
        }
    }, !0)
}


//接收事件
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "UPDATE_FUNCTIONALITY_SWITCH") {
        var config = msg;
        console.log("contentHighlight.js received: UPDATE_FUNCTIONALITY_SWITCH:", config.isKeywordHighlightActive);
        if (document.body.myConfig.isKeywordHighlightActive != config.isKeywordHighlightActive) {
            console.log("contentHighlight.js received isKeywordHighlightActive was changed to:", config.isKeywordHighlightActive);
            document.body.myConfig = config;

            if (config.isKeywordHighlightActive) {
                console.log("Highliting keywords");
                if (document.body.myKeywords == null) {
                    requestKeywords();
                } else {
                    highlightKeyword(document.body.myKeywords);
                }
            } else {
                console.log("Clearing keywords");
                highlighter.clearHighlighted(document.body || document)
            }
        }
        sendResponse(null);
        return true;
    }
    if (msg.action == "REFRESH_KEYWORDS") {
        console.log("contentHighlight.js received: REFRESH_KEYWORDS");
        document.body.myKeywords = msg.value;
        if (document.body.myConfig.isKeywordHighlightActive) {
            console.log("Clearing keywords");
            highlighter.clearHighlighted(document.body || document);
            console.log("Highliting keywords");
            highlightKeyword(document.body.myKeywords);
        }
        sendResponse(null);
        return true;
    }
});