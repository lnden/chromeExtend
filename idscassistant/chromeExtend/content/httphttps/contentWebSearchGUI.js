// 本文件负责“界面搜索”的打开和关闭

function webSearch(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'search_jm');
    layerNode.setAttribute('title', '界面搜索');
    layerNode.innerHTML = innerHTML;
    document.body.appendChild(layerNode);
    jQuery('#search_jm').dialog({
        autoOpen: true,
        draggable: true,
        resizable: false,
        height: 80,
        width: 270,
        zIndex: 9999,
        modal: false,
        open: function (event, ui) {
            $(event.target)
                .parent()
                .css('position', 'fixed');
            $(event.target)
                .parent()
                .css('top', '5px');
            $(event.target)
                .parent()
                .css('left', 'auto');
            $(event.target)
                .parent()
                .css('right', '200px');
            $('#ymss-bt').on('click', function () {
                chrome.extension.sendMessage(
                    {
                        action:"FIND_IN_PAGES", 
                        value:$('#ymss_input').val()
                    }, function() {})
            });
            $(document).keyup(function (event) {
                if (event.keyCode == 13) {
                    $('#ymss-bt').trigger('click');
                }
            });
        },
        close: function () {
            chrome.extension.sendMessage(
                {
                    action: "CHNAGE_FUNCTIONALITY_SWITCH",
                    webSearch: false
                }, function () { });
            $('#ymss_input').val('');
        }
    });
}

var myConfig = {};
chrome.extension.sendMessage({ action: 'HAVE_LOGIN' }, function (response) {
    if (response.isLogin == true) {
        console.log('Web Search is checking if user has been signed in');

        chrome.extension.sendMessage({ action: "GET_FUNCTIONALITY_LIST" }, function (config) {
            myConfig = config;
            if (config.webSearch) {
                loadJQueryUiCss(webSearch, 'search.html');
            }
        })
    }
});


chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "UPDATE_FUNCTIONALITY_SWITCH") {
        var config = msg;

        if (myConfig.webSearch != config.webSearch) {
            console.log("ContentWebSearch received webSearch was changed to:", config.webSearch);
            //判断如果存在展示弹层，不存在删除弹层
            if (config.webSearch) {
                console.log("Display the Web Search GUI");
                //loadJQueryUiCss为content公共js
                loadJQueryUiCss(webSearch, 'search.html');
            } else {
                console.log("Close the Web Search GUI");
                $('#search_jm').dialog('close');
                $('#search_jm').remove();
                chrome.extension.sendMessage({ action: "CLEAR_FIND_IN_PAGES" }, function () { })
            }
        }
        myConfig = config;
        sendResponse(null);
        return true;
    }

    if (msg.action == "FIND_IN_PAGES") {
        $('#ymss_input').val(msg.value);
        sendResponse(null);
        return true;
    }


});