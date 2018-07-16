

function broadcastMessage(msg) {
    console.log("Boradcasting:", msg.action);
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, msg);
        }
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "GET_FUNCTIONALITY_LIST") {
        sendResponse(config);
        return true;
    }
    if (request.action == "CHNAGE_FUNCTIONALITY_SWITCH") {
        if (request.windowSwitchActive != undefined) {
            config.windowSwitchActive = request.windowSwitchActive;
        }

        if (request.isKeywordHighlightActive != undefined) {
            config.isKeywordHighlightActive = request.isKeywordHighlightActive;
        }

        if (request.webSearch != undefined) {
            config.webSearch = request.webSearch;
        }

        broadcastMessage(config);
    }
});