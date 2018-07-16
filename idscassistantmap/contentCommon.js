function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
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

function loadJQueryUiCss(createDialog, html) {
    console.log('Loading jQuery UI CSS');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var customStyles = document.createElement('style');
            customStyles.innerHTML = this.responseText.replace(new RegExp('MyExtensionId', 'g'), chrome.runtime.id);
            elmHead = document.getElementsByTagName('head')[0];
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

function detectPoi() {
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    // Select the node that will be observed for mutations
    var targetNode = document.getElementById('index');
    if (targetNode == null) {
        return;
    }

    // Options for the observer (which mutations to observe)
    var config = {attributes: true, childList: true, subtree: true};

    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        for (var mutation of mutationsList) {
            console.log(mutation);
            if (mutation.type == 'childList') {
                POI.id = $(document.getElementById('tbindex').rows[0])
                    .children()
                    .eq(1)
                    .find('a')
                    .text();
                console.log('POI ID:', POI.id);
                chrome.runtime.sendMessage({action: 'REQUEST_TASK_TYPE', poi: POI.id}, function (taskType) {
                    var ret = getSubmitRules(taskType);
                    POI.taskType = taskType;
                    POI.allowedResult = ret.allowedResult;
                    POI.deletedReasons = ret.deletedReasons;
                    console.log(POI);
                    disableOptions();
                });
                observer.disconnect();
                return;
            } else if (mutation.type == 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}

// channel used to sync GUI status across pages
var port = chrome.extension.connect();

function createDialog(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'dialog');
    layerNode.setAttribute('title', 'IDSC 工作助手');
    var pNode = document.createElement('p');
    pNode.innerHTML = innerHTML;

    layerNode.appendChild(pNode);
    document.body.appendChild(layerNode);
    jQuery('#dialog').dialog({
        autoOpen: true,
        draggable: true,
        resizable: false,
        height: 'auto',
        width: 270,
        zIndex: 3999,
        modal: false,
        buttons: {},
        open: function (event, ui) {
            $(event.target)
                .parent()
                .css('position', 'fixed');
            $(event.target)
                .parent()
                .css('top', '100px');
            $(event.target)
                .parent()
                .css('left', '10px');
        }
    });
}

function websearch(innerHTML) {
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
                var searchTerm = $('#ymss_input').val();
                port.postMessage({
                    type: 'status',
                    name: 'ymss_input',
                    domtype: 'input',
                    value: searchTerm
                });
            });
            $(document).keyup(function (event) {
                if (event.keyCode == 13) {
                    $('#ymss-bt').trigger('click');
                }
            });
        },
        close: function () {
            $('#websearch').attr('checked', false);
            $('#ymss_input').val('');
            $('body').removeSearch2();
            port.postMessage({
                type: 'status',
                name: 'search_jm',
                domtype: 'div',
                value: 'close'
            });
            port.postMessage({
                type: 'status',
                name: 'websearch',
                domtype: 'radio',
                value: false
            });
            port.postMessage({
                type: 'status',
                name: 'ymss_input',
                domtype: 'input',
                value: ''
            });
        }
    });
}

let againStr = '';

function test(str) {
    let len = str.length;
    if (len % 2 == 0) {
    } else {
        str = str + ' ';
        len += 1;
    }
    let flag = false;
    for (let i = len / 2; i >= 1; i--) {
        for (let j = 0; j <= len - i * 2; j++) {
            //var re = str.substr(j+i,i).split("").reverse().join("");
            if (str.substr(j, i) == str.substr(j + i, i)) {
                let k = 2;
                if (str.substr(j + i, i) == str.substr(j + i * 2, i)) k = 3;
                if (str.substr(j, i) != ' ') againStr += str.substr(j, i) + ',';
                flag = true;
                test(str.substring(0, j));
                test(str.substring(j + i * k, len));
                break;
            }
        }
        if (flag) break;
    }
    return againStr;
}

function compareTwoControl(table, oldControl, newControl) {
    $(oldControl).nextAll('span.tips').remove();
    $(newControl).find('span.tips').remove();
    var tbody = table.getElementsByTagName('tbody')[0];
    var oldName = $.trim($(oldControl).val());
    var newName = $.trim($(newControl).text());
    $(newControl).html('<span style="background:yellow">' + newName + '</span>');
    if (newControl == 'td.data-phone') {
        if (/^[01]/.test(newName)) {
            if (newName.replace(/\-/g, '').length > 12 || (/^1/.test(newName) && newName.replace(/\-/g, '').length == 12)) {
                $(newControl).html(
                    '<span style="background:yellow">' + newName + '</span><span class="tips" style="color:red">多位数</span>'
                );
            } else if (newName.replace(/\-/g, '').length < 11 && newName.replace(/\-/g, '').length > 0) {
                $(newControl).html(
                    '<span style="background:yellow">' + newName + '</span><span class="tips" style="color:red">少位数</span>'
                );
            }
        } else if (/^[48]00/.test(newName)) {
            if (newName.replace(/\-/g, '').length > 10) {
                $(newControl).html(
                    '<span style="background:yellow">' + newName + '</span><span class="tips" style="color:red">多位数</span>'
                );
            } else if (newName.replace(/\-/g, '').length < 10 && newName.replace(/\-/g, '').length > 0) {
                $(newControl).html(
                    '<span style="background:yellow">' + newName + '</span><span class="tips" style="color:red">少位数</span>'
                );
            }
        }
        if (/^[01]/.test(oldName)) {
            if (oldName.replace(/\-/g, '').length > 12 || (/^1/.test(oldName) && oldName.replace(/\-/g, '').length == 12)) {
                $(oldControl).after('<span class="tips" style="color:red">多位数</span>');
            } else if (oldName.replace(/\-/g, '').length < 11 && oldName.replace(/\-/g, '').length > 0) {
                $(oldControl).after('<span class="tips" style="color:red">少位数</span>');
            }
        } else if (/^[48]00/.test(oldName)) {
            if (oldName.replace(/\-/g, '').length > 10) {
                $(oldControl).after('<span class="tips" style="color:red">多位数</span>');
            } else if (oldName.replace(/\-/g, '').length < 10 && oldName.replace(/\-/g, '').length > 0) {
                $(oldControl).after('<span class="tips" style="color:red">少位数</span>');
            }
        }
    }
    if (oldName.length == newName.length) {
        var len = oldName.length;
        var newStr = ''; //要复制到table中的字符串
        for (var i = 0; i < len; i++) {
            var newPart = ''; //对比每个字符确认要赋值到table重的值
            if (oldName[i] != newName[i]) {
                newPart = "<span style='background:yellow'>" + newName[i] + '</span>';
            } else {
                newPart = newName[i];
            }
            newStr += newPart;
        }
        $(newControl).html(newStr);
    }
}
