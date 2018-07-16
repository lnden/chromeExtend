chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "FIND_IN_PAGES") {
        console.log("FindInPage content script received:", JSON.stringify(msg));
        $('body').removeSearch2();
        if (msg.value != "") {
            $('body').highlight2(msg.value);
        }
        sendResponse(null);
        return true;
    }

    if (msg.action == 'CLEAR_FIND_IN_PAGES') {
        $('body').removeSearch2();
        sendResponse(null);
        return true;
    }
});