document.body.myConfig = {};
document.body.myKeywords = null;
chrome.extension.sendMessage({ "action": "HAVE_LOGIN" }, function (response) {
    if (response.isLogin) {
        onLogin();
    }
});

function onLogin() {
    chrome.extension.sendMessage({ action: "GET_FUNCTIONALITY_LIST" }, function (config) {
        console.log("contentHighlight.js original config:", document.body.myConfig);
        console.log("contentHighlight.js received:", config);
        document.body.myConfig = config;
        if (document.body.myConfig.isKeywordHighlightActive) {
            requestKeywords();
        }
    });
}

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

function highlightKeyword(kw) {
    if (kw == null) {
        console.log("There is no keywords");
        return;
    }
    highlighter.highlight(document.body || document, kw);
    document.body.addEventListener("DOMSubtreeModified", function (a) {
        if (document.body.myConfig.isKeywordHighlightActive) {
            highlighter.highlight(a.target, kw);
        }
    }, !0)
}

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