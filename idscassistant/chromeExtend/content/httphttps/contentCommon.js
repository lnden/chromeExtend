// 向页面注入JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
        // 放在页面不好看，执行完后移除掉
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
}

function getDialogHtml(createDialog, html) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            createDialog(this.responseText);
        }
    };
    xhttp.open('GET', chrome.extension.getURL(html), false);
    xhttp.send();
}

//加载全局搜索弹框样式函数
function loadJQueryUiCss(createDialog, html) {
    console.log('Loading jQuery UI CSS');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var customStyles = document.createElement('style');
            customStyles.innerHTML = this.responseText.replace(new RegExp('MyExtensionId', 'g'), chrome.runtime.id);
            var elmHead = document.getElementsByTagName('head')[0];
            elmHead.appendChild(customStyles);
            getDialogHtml(createDialog, html);
        }
    };
    xhttp.open('GET', chrome.extension.getURL('/lib/jquery-ui-1.12.1/jquery-ui.css'), false);
    xhttp.send();
}

function loadPoiSubmitRules() {
    var rules;
    $.ajax({
        type: 'GET',
        url: chrome.extension.getURL('mapCommitRules.json'),
        dataType: 'json',
        async: false,
        success: function (result) {
            rules = result;
        }
    });
    return rules;
}

function showInfo(info) {
    chrome.extension.sendRequest({info: info}, function (response) {
    });
}

function showWarning(warning) {
    chrome.extension.sendRequest({warning: warning}, function (response) {
    });
}

function showError(error) {
    chrome.extension.sendRequest({error: error}, function (response) {
    });
}

function updateGuiStatus(config) {
    console.log("Update GUI status:", JSON.stringify(config));
    if (config.gui.SHOW_MULTI_ENGINE_SEARCH_BUTTON) {
        $("#search-dwz").show();
    } else {
        $("#search-dwz").hide();
    }
    if (config.gui.SHOW_KEYWORD_HIGHLIGHT_SWITCH) {
        $("#pullKeywordFromServerGroup").show();
        $("#highlightGroup").show();
    } else {
        $("#highlightGroup").hide();
        $("#pullKeywordFromServerGroup").hide();
    }
    if (config.gui.SHOW_WEB_SEARCH_SWITCH) {
        $("#webSearchGroup").show();
    } else {
        $("#webSearchGroup").hide();
    }
    $("#highlight").prop('checked', config.isKeywordHighlightActive);
    $("#websearch").prop('checked', config.webSearch);
    if (config.windowSwitchActive) {
        $('#dialog').dialog('open');
    } else {
        $('#dialog').dialog('close');
    }
}

$(document).on("click", "#highlight", function () {

    chrome.extension.sendMessage({
            action: "CHNAGE_FUNCTIONALITY_SWITCH",
            isKeywordHighlightActive: $("#highlight").is(":checked")
        }, function () {
        });
});

$(document).on("click", "#websearch", function () {
    chrome.extension.sendMessage(
        {
            action: "CHNAGE_FUNCTIONALITY_SWITCH",
            webSearch: $("#websearch").is(":checked")
        }, function () {
        });
});

$(document).on('click', '#pullKeywordFromServer', function () {
    console.log("Requesting to pull keyword from server");
    chrome.extension.sendMessage(
        {
            action: "PULL_KEYWORDS",
        }, function () {
        });
});

const _config = config;
function fnInitStroage() {
    chrome.storage.sync.get(function (data) {
        console.log('%c chrome.storage.config => ', 'color:blue', data);
        if (!data.firstStroage) {
            chrome.storage.sync.set({firstStroage: true});
            chrome.storage.sync.set(_config);
            console.log('%c chrome.storage.config => ', 'color:red');
        }
        config = data;
        $(function () {
            $('div[id^="dialog"].ui-dialog-content.ui-widget-content').each(function () {
                $(this).dialog(data[this.id] ? 'open' : 'close')
            });
            if($('#artificialStatistics')[0])
            $('#artificialStatistics')[0].checked = data.dialogArtificialStatistics;
            $('#pullKeywordFromServer').next().text(data.keyWordsUpDate);
            $("#dialog-form .userContrFun").each(function () {
                var curConfigFun = $(this).data("config");
                this.checked = data[curConfigFun];
            });

            $('#dialog-form').find('li').each(function (i, v) {
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
    });
}

fnInitStroage();

chrome.storage.onChanged.addListener(function (changes) {
    if (changes.login && changes.login.newValue) {
        chrome.storage.sync.set({firstStroage: true});
        chrome.storage.sync.set(_config);
        fnInitStroage();
        $('#highlight').click();
        console.log('%c chrome.storage.config => ', 'color:red');
        return;
    }
    $(function () {
        console.log('%c chrome.storage.change => ', 'color:green', changes);
        if (changes.dialogfillBlockReason)
            $('#dialogfillBlockReason').dialog(changes.dialogfillBlockReason.newValue ? 'open' : 'close');
        if (changes.dialogVideoStatistic)
            $('#dialogVideoStatistic').dialog(changes.dialogVideoStatistic.newValue ? 'open' : 'close');
        if (changes.dialogArtificialStatistics) {
            $('#dialogArtificialStatistics').dialog(changes.dialogArtificialStatistics.newValue ? 'open' : 'close');
            $('#artificialStatistics')[0].checked = changes.dialogArtificialStatistics.newValue;
        }
        if (changes.keyWordsUpDate)
            $('#pullKeywordFromServer').next().text(changes.keyWordsUpDate.newValue);
        $("#dialog-form .userContrFun").each(function () {
            var curConfigFun = $(this).data("config");
            if (changes[curConfigFun]) {
                this.checked = changes[curConfigFun].newValue;
                return false;
            }
        });
    });
    chrome.storage.sync.get(function (data) {
        config = data;
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'USER_EXIT') {
        $('#dialog-form input:checked:not("#artificialStatistics")').click();
        $('div[id^="dialog"].ui-dialog-content.ui-widget-content').dialog('close');
        chrome.storage.sync.clear();
        console.log('%c ===============USER_EXIT================= ', 'color:yellow');
    }
});