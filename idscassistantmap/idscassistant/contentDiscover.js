function createDialog(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'dialog');
    layerNode.setAttribute('title', 'IDSC 工作助手');
    var pNode = document.createElement('p');
    pNode.innerHTML = innerHTML;
    layerNode.appendChild(pNode);
    document.body.appendChild(layerNode);
    jQuery('#dialog').dialog({
        autoOpen: false,
        draggable: true,
        resizable: false,
        minHeight: 0,
        height: 'auto',
        width: 260,
        zIndex: 9999,
        modal: false,
        buttons: {},
        li: {},
        open: function (event, ui) {
            $(event.target)
                .parent()
                .css('position', 'fixed');
            $(event.target)
                .parent()
                .css('top', '5px');
            $(event.target)
                .parent()
                .css('left', '10px');
            $(event.target)
                .parent()
                .css('z-index', '999999999');
        },
        close: function () {
            chrome.extension.sendMessage({
                action: "CHNAGE_FUNCTIONALITY_SWITCH",
                windowSwitchActive: false
            });
        }
    });
}

chrome.extension.sendMessage({action: 'HAVE_LOGIN'}, function (response) {
    if (response.isLogin == true) {
        console.log('Show GUI only when user has been signned in');
        loadJQueryUiCss(createDialog, 'dialogDiscover.html');
        chrome.extension.sendMessage({action: "GET_FUNCTIONALITY_LIST"}, function (config) {
            updateGuiStatus(config);
        })
    }
});

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "UPDATE_FUNCTIONALITY_SWITCH") {
        updateGuiStatus(msg);
    }
    if(msg.action ==='ACTIVE_WINDOW')
        sendResponse('UC');
});
