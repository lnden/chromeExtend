
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!isLogin()) {
        sendResponse("用户未登录");        
        return true;
    }
    if (msg.action == "SAVE_AUDIT_RECORD"){
        var r = JSON.parse(msg.payload.request.body);
        var resp;
        try {
            resp = JSON.parse(msg.payload.response.body);
        } catch (err) {
            console.log("ERROR, it is already a json object?", err);
            resp = msg.payload.response.body;
        }
        sendResponse("SAVE_AUDIT_RECORD was received");

        if (r.f_video_reason == "[ASN]直接启用" && resp.ret == 0) {
            console.log("启用：", r.rowkey);
            requestVideoSource(r.rowkey, enableVideo);
            return true;
        }
        if (r.f_video_reason == "[ASN]启用并标注" && resp.ret == 0) {
            console.log("启用并标注：", r.rowkey);
            requestVideoSource(r.rowkey, enableAndTagVideo);
            return true;
        }
        if (r.f_video_reason == "[ASN]标注" && resp.ret == 0) {
            console.log("标注：", r.rowkey);
            requestVideoSource(r.rowkey, tagVideo);
            return true;
        }
        if (r.f_video_status == 0 && resp.ret == 0) {
            console.log("禁用：", r.rowkey, "禁用原因:", r.f_video_reason);
            requestVideoSource(r.rowkey, disableVideo);
            return true;
        }
        if (r.f_video_reason != undefined && resp.ret == 0) {
            console.log("Unrecoganized reason:", r.f_video_reason);
        }
    }
    return true;
});
var g_video = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "CACHE_ROWKEY") {
        console.log("Cache:", request.rowkey, request.source);
        g_video[request.rowkey] = request.source;
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.method == "POST") {
            var d = new TextDecoder('utf-8');
            var r = JSON.parse(d.decode(details.requestBody.raw[0].bytes));
            if (r.f_video_reason || r.f_video_status) {
                requestVideoSource(r.rowkey, function (response) {
                    console.log("Cache:", response.rowkey, response.source);
                    g_video[response.rowkey] = response.source;
                });
            }
        }
    },
    { urls: ["https://asn.qq.com/*"] },
    ["requestBody"]
);

function sendMessage(msg, callback) {
    if (msg.operationType == 1) { // 启用禁用
        msg.enDisAblePeople = getUserNumber();
    }

    if (msg.operationType == 2) { // 标注
        msg.tagPerson = getUserNumber();
    }

    if (msg.operationType == 3) { // 启标
        msg.tagPerson = msg.enDisAblePeople = getUserNumber();
        msg.enDisAbleStatus = "enabled";
    }

    callback();
    sendToServer(msg, 'videoAutidVolume/add', true, function(response) {
        if (!response.success) {
            NotifyError(response);
        }
    });
}

function createMessage(information) {
    return { orderId: information.rowkey, mediaSource: information.source };
}

function enableVideo(response) {
    if (response.rowkey == undefined || response.rowkey  == null) {
        show("启用失败!");
        return;
    }
    console.log("enableVideo", JSON.stringify(response));
    var msg = createMessage(response);
    msg.enDisAbleStatus = "enabled";
    msg.operationType = 1;
    sendMessage(msg, function () {
        show("启用成功！");
    });
}

function disableVideo(response) {
    console.log("disableVideo", JSON.stringify(response));
    var msg = createMessage(response);
    msg.operationType = 1;
    msg.enDisAbleStatus = "disabled";
    sendMessage(msg, function () {
        show("禁用成功！");
    });
}

function tagVideo(response) {
    console.log("tagVideo", JSON.stringify(response));
    var msg = createMessage(response);
    msg.operationType = 2;
    sendMessage(msg, function () {
        show("标注成功！");
    });
}

function enableAndTagVideo(response) {
    console.log("enableAndTagVideo", JSON.stringify(response));
    var msg = createMessage(response);
    msg.operationType = 3;
    sendMessage(msg, function () {
        show("标注启用成功！");
    });
}



function requestVideoSource(rowkey, callback) {
    if (g_video.hasOwnProperty(rowkey)) {
        callback({"rowkey": rowkey,  "source": g_video[rowkey]});
        return;
    }
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
            console.log("Request detailed video information for row key", rowkey);
            if (tabs[0] != undefined) {
                chrome.tabs.sendMessage(tabs[0].id, { "action": "REQUEST_VIDEO_SOURCE", "rowkey": rowkey}, callback);
            } else {
                NotifyError("Fail to send message to your tab, Please keep it active");
            }
        }
    );
}