chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    if (tabs[0])
        chrome.tabs.sendMessage(tabs[0].id, {action: "ACTIVE_WINDOW"}, function (data) {
            $('.' + data + '-btn').show();
        });
});

chrome.runtime.getBackgroundPage(function (bp) {
    $('#userInfo').html(bp.getUserName() + '--' + bp.getTeamName() + ',成功登录');
});

chrome.extension.sendMessage({action: "GET_FUNCTIONALITY_LIST"}, function (config) {
    if (config.enableExperimentalFeature && config.gui.SHOW_KEYWORD_HIGHLIGHT_SWITCH) {
        $("#highlightGroup").show();
    } else {
        $("#highlightGroup").hide();
    }
    $("#highlight").prop('checked', config.isKeywordHighlightActive);
    $("#websearch").prop('checked', config.webSearch);
    $("#windowSwitch").prop('checked', config.windowSwitchActive);
});

$(document).on("click", "#highlight", function () {
    chrome.extension.sendMessage({
        action: "CHNAGE_FUNCTIONALITY_SWITCH",
        isKeywordHighlightActive: $("#highlight").is(":checked")
    });
});

//页面点击"界面搜索"按钮
$(document).on("click", "#websearch", function () {
    chrome.extension.sendMessage({
        action: "CHNAGE_FUNCTIONALITY_SWITCH",
        webSearch: $("#websearch").is(":checked")
    });
});

$(document).on("click", "#windowSwitch", function () {
    chrome.extension.sendMessage({
        action: "CHNAGE_FUNCTIONALITY_SWITCH",
        windowSwitchActive: $("#windowSwitch").is(":checked")
    });
});

$(document).on('click', '#search-dwz', function () {
    var weburl = chrome.extension.getURL('multiSearchEngine.html');
    window.open(weburl);
});

$(document).on("click", "#exit", function () {
    chrome.runtime.getBackgroundPage(function (bp) {
        bp.exit();
        close();
    });
});

$(document).on('click', '#pullKeywordFromServer', function () {
    chrome.extension.sendMessage({
        action: "PULL_KEYWORDS",
    });
});

$(document).on("click", "#fillBlockReason", function () {
    chrome.storage.sync.set({dialogfillBlockReason: true});
});

$(document).on("click", "#qulityControlStatistics", function () {
    chrome.storage.sync.set({dialogVideoStatistic: true});
});

$(document).on("click", "#artificialStatistics", function () {
    chrome.storage.sync.set({dialogArtificialStatistics: this.checked});
});

$(document).on("click", "#dialog-form .userContrFun", function () {
    var curConfigFun = $(this).data("config"), obj = {};
    obj[curConfigFun] = this.checked;
    chrome.storage.sync.set(obj);
});

chrome.storage.sync.get(function (data) {
    if (!data.login) {
        chrome.storage.sync.set({login: true});
        return;
    }
    $('#pullKeywordFromServer').next().text(data.keyWordsUpDate);
    $('#artificialStatistics')[0].checked = data.dialogArtificialStatistics;
    $("#dialog-form .userContrFun").each(function () {
        var curConfigFun = $(this).data("config");
        this.checked = data[curConfigFun];
    });

    $('#dialog-form').find('li+li').each(function (i, v) {
        $.each(data.btnList, function (i2, v2) {
            if (!v2) return true;
            if (v2.replace(/\s+/g, "").indexOf($(v).text().replace(/\s+/g, "")) !== -1 || $(v).text().replace(/\s+/g, "").indexOf(v2.replace(/\s+/g, "")) !== -1) {
                $(v).css('height', 'auto');
                return false;
            } else {
                $(v).css('height', 0);
            }
        });
    });
});