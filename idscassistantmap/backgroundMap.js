var pois = {};
var Status = {dituhmd: {value: true, type: 'radio4'}, ditukxd: {value: true, type: 'radio3'}};
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'CACHE_POI') {
        console.log('Cache:', request.poi, request.poiType);
        pois[request.poi] = request.poiType;
        return true;
    }

    if (request.action == 'REQUEST_TASK_TYPE') {
        console.log('Background received the task type request:', pois[request.poi]);
        sendResponse(pois[request.poi]);
        return true;
    }

    if (request.action == 'HAVE_DITU') {
        chrome.tabs.query({}, function(tabs) {
            var message = {status: Status};
            for (var i = 0; i < tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });
    }
});

chrome.extension.onConnect.addListener(function(port) {
    //tabs[port.sender.tab.id] = port;
    port.onMessage.addListener(function(msg) {
        if (msg.type === 'status') {
            Status[msg.name] = {
                value: msg.value,
                type: msg.domtype
            };
            chrome.tabs.query({}, function(tabs) {
                var message = {status: Status};
                for (var i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            });
        }
    });
});

show('IDSC工作助手已加载');
