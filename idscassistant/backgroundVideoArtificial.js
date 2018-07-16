chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.data) {
        request.data.userName = getUserName();
        request.data.userNo = getUserNumber();
        request.data.teamId = getTeamId().slice(0, 32);
        request.data.userTeam = getTeamName();
    }
    if (request.action == 'GET_ARTIFICIAL_SELECT') {
        sendToServer(null, 'videoAuditStatistics/getDicDataList', true, function (data) {
            sendResponse(data);
        });
    } else if (request.action == 'BTN_RADIO1') {
        sendToServer(request.data, 'videoAuditStatistics/addAudit', true, function (data) {
            sendResponse(data);
        });
    } else if (request.action == 'BTN_RADIO2') {
        sendToServer(request.data, 'videoAuditStatistics/addAudit', true, function (data) {
            sendResponse(data);
        });
    } else if (request.action == 'BTN_RADIO3') {
        sendToServer(request.data, 'videoAuditStatistics/addAudit', true, function (data) {
            sendResponse(data);
        });
    } else if (request.action == 'BTN_RADIO4') {
        sendToServer(request.data, 'videoDisableDetail/addDetail', true, function (data) {
            sendResponse(data);
        });
    }
});