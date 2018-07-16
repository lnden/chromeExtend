Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function show(tip) {
    var opt = {
        "type": 'basic',
        "iconUrl": 'images/48.png',
        "message": tip,
        "title": "IDSC 工作助手"
    }
    chrome.notifications.create("", opt, function(id) {
        setTimeout(function(){chrome.notifications.clear(id);}, 1000);
    })
}

function NotifyError(error) {
    var errString = "";
    if (error.hasOwnProperty("msg")) {
        errString = error.msg;
    } else {
        errString = JSON.stringify(error);
    }

    var now = new Date();
    new Notification(new Date().toISOString(), {
        icon: 'images/error.jpg',
        body: errString
    });
}

function NotifyWarning(msg) {
    var opt = {
        "type": 'basic',
        "iconUrl": 'images/error.jpg',
        "message": msg,
        "title": "IDSC 工作助手"
    }
    chrome.notifications.create("", opt, function(id) {
        setTimeout(function(){chrome.notifications.clear(id);}, 3000);
    })
}

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        console.log("BackgroundCommon.js received request to show message:", request);
        if (request.info) {
            show(request.info);
            return;
        }
        if (request.warning) {
            NotifyWarning(request.warning);
            return;
        }
        if (request.error) {
            NotifyError(request.error);
            return;
        }
    });