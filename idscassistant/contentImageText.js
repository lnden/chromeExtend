'use strict';

var quickInput = function() {
    $(document).on('DOMNodeInserted', function(e) {
        if (e.target.tagName == 'IFRAME') {
            var Ev = e.target.contentWindow;
            $(Ev)
                .off('click')
                .on('click', function(event) {
                    var checked = $('input[data-config=quickInput]', top.window.document).prop('checked');
                    if (checked) {
                        var val = $(event.target)
                            .find('input')
                            .data('val');
                        var pType = $(event.target)
                            .parents('.inner-box')
                            .find('.td1')
                            .text();
                        pType = pType.substr(0, pType.length - 1);
                        var classify = 1;
                        //视频-1,文字-2,图片-3,评论正文-4,用户头像-5,用户昵称-6
                        switch (pType) {
                            case '视频':
                                classify = 1;
                                break;
                            case '文字':
                                classify = 2;
                                break;
                            case '图片':
                                classify = 3;
                                break;
                            case '评论正文':
                                classify = 4;
                                break;
                            case '用户头像':
                                classify = 5;
                                break;
                            case '用户昵称':
                                classify = 6;
                                break;
                        }
                        if (
                            !$(event.target).hasClass('lbf-icheckbox-checked') &&
                            $(event.target).hasClass('lbf-icheckbox-hover')
                        ) {
                            var data = {classify: classify, notPassReason: val, add: true};
                            sendToGetIllustration(data);
                        } else if ($(event.target).hasClass('lbf-icheckbox-checked')) {
                            var data = {classify: classify, notPassReason: val, add: false};
                            sendToGetIllustration(data);
                        }
                    }
                });
        }
    });
};

function detectPopupLink() {
    var config = {
        childList: true,
        subtree: true,
    };

    var autoLinkControl = $('input[data-config=linkAutoOpen]', top.window.document);

    var callback = function (records) {
        var isAutoOpenLinkEnabled = autoLinkControl.prop('checked');
        if (!isAutoOpenLinkEnabled) {
            return ;
        }
        records.forEach(function (record) {
            var nodes = record.addedNodes;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].nodeName === 'DIV') {
                    var div = $(nodes[i]);
                    if (div.hasClass("lbf-panel") && div.hasClass("preview-panel")) {
                        var url = div.find('#previewMaterial a').attr('href') || '';
                        if (url != '') {
                            window.open(url);
                        }
                    }
                }
            }
        });
    };
    var observer = new MutationObserver(callback);
    observer.observe(document, config);
};


function sendToGetIllustration(response) {
    response.action = 'GET_ILLUSTRATION';
    response.needing = true;
    chrome.runtime.sendMessage(response, function(resp) {
        console.log('GET_ILLUSTRATION:', resp);
    });
}
var reason = '';
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'GET_ILLUSTRATIONBACK') {
        if ($('.refuse-reason-panel .other-reason').length == 0) {
        } else {
            if (request.data.illustration != null) {
                var now = $('.refuse-reason-panel .other-reason').val();
                if (request.add) {
                    //添加
                    reason = now;
                    reason += request.data.illustration;
                } else {
                    //删除
                    if (now.match(request.data.illustration) != null) {
                        var str = now.match(request.data.illustration)[0];
                        reason = now.replace(now.match(request.data.illustration)[0], '');
                    } else {
                        reason = now;
                    }
                }
                $('.refuse-reason-panel .other-reason').val(reason);
                reason = '';
            }
        }
    }
});

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
        zIndex: 3999,
        modal: false,
        open: function(event, ui) {
            $(event.target)
                .parent()
                .css('position', 'fixed');
            $(event.target)
                .parent()
                .css('top', '5px');
            $(event.target)
                .parent()
                .css('left', '10px');
        },
        close: function () {
            chrome.extension.sendMessage({
                action: "CHNAGE_FUNCTIONALITY_SWITCH",
                windowSwitchActive: false
            });
        }
    });
}

function StatisticalAuditVolume(userNumber) {
    var table = $('table.lbf-grid-table.portal-table');
    var auditor = userNumber;
    var businessClassify = $('.x-tree-root-ct .x-tree-selected', top.window.document).text();
    if ($.trim(businessClassify) == '') {
        businessClassify = '首页';
    }
    var auditData = {auditor: auditor, businessClassify: businessClassify};

    //直接点击通过
    $(document).on('click.first', '#agree', function() {
        var itemTr = $(table).find('tr.item');
        var checkbox = $(':checkbox:checked', itemTr)[0];
        var item = $(checkbox).parents('tr.item');
        auditData['contentId'] = $(item).data('articleid');
        auditData['auditStatus'] = 1; //审核状态

        //通过确认处理
        $(document)
            .off('click.fconfirm', '.lbf-panel div.lbf-button:not(.lbf-button-disabled):contains(确认通过)')
            .on('click.fconfirm', '.lbf-panel div.lbf-button:not(.lbf-button-disabled):contains(确认通过)', function() {
				//判断是否操作成功
				$(this).off('click.previewOK');
                window.setTimeout(function() {
                    if (checkStatus()) {
                        postAuditData(auditData);
                    }
                }, 200);
                return false;
            });
        return true;
    });

    //直接点击不通过
    $(document).on('click.two', '#disagree', function() {
        var itemTr = $(table).find('tr.item');
        var checkbox = $(':checkbox:checked', itemTr)[0];
        var item = $(checkbox).parents('tr.item');
        auditData['contentId'] = $(item).data('articleid');
        auditData['auditStatus'] = 2; //审核状态

        //不通过确认处理
        $(document)
            .off('click.tconfirm', '.lbf-panel div.buttons>span#ok:not(.lbf-button-disabled)')
            .on('click.tconfirm', '.lbf-panel div.buttons>span#ok:not(.lbf-button-disabled)', function() {
				$(this).off('click.previewNO');
				var len = $('.lbf-panel').find('.mark-panel').length;
                if (len == 0) {
                    //选择原因为空提示判断
                    window.setTimeout(function() {
                        if (checkStatus()) {
                            postAuditData(auditData);
                        }
                    }, 200);
                    return false;
                } else {
                    markAudit(auditData);
                }
            });
        return true;
    });

    //点击预览按钮
    $(document).on('click.preview', '#preview', function() {
        var itemTr = $(table).find('tr.item');
        var checkbox = $(':checkbox:checked', itemTr)[0];
        var item = $(checkbox).parents('tr.item');
        auditData['contentId'] = $(item).data('articleid');
        //数据校正
        auditData = revise(auditData, item);
        previewAudit(auditData);
    });

    //预览框处理
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).data('id')) {
            $(e.target)
                .find('a')
                .parent()
                .off('click.StatisticalAuditVolume')
                .on('click.StatisticalAuditVolume', function() {
                    var item = $(this).parents('tr.item');
                    auditData['contentId'] = $(item).data('articleid');
                    //数据校正
                    auditData = revise(auditData, item);
                    previewAudit(auditData);
                });
        }
    });
}

//处理预览框审核
function previewAudit(auditData) {
    //预览链接事件处理
    $(document)
        .off('click.previewAudit', '.preview-panel div.lbf-button')
        .on('click.previewAudit', '.preview-panel div.lbf-button', function(event) {
            var target = event.target;
            //预览框通过
            if (
                $(target).hasClass('ok_button') ||
                $(target)
                    .parent()
                    .hasClass('ok_button')
            ) {
                auditData['auditStatus'] = 1;
                var confirm = $('.lbf-panel').find('div.lbf-button:not(.lbf-button-disabled):contains(确认通过)');
				$(confirm).off('click.fconfirm');
				$(confirm)
                    .off('click.previewOK')
                    .on('click.previewOK', function() {
                        window.setTimeout(function() {
                            if (checkStatus()) {
                                postAuditData(auditData);
                            }
                        }, 200);
                    });
                //预览框不通过三种情况
            } else if (
                $(target).hasClass('cancel_button') ||
                $(target)
                    .parent()
                    .hasClass('cancel_button')
            ) {
                var exsit = $('.lbf-panel').find('div.refuse-check').length;
                if (exsit == 0) {
                    auditData['auditStatus'] = 2;
                    $(document)
                        .off('click.previewNO', '.lbf-panel div.buttons>span#ok:not(.lbf-button-disabled)')
                        .on('click.previewNO', '.lbf-panel div.buttons>span#ok:not(.lbf-button-disabled)', function() {
							$(this).off('click.tconfirm');
							var len = $('.lbf-panel').find('.mark-panel').length;
                            //第一种(无清洗无标注)
                            if (len == 0) {
                                window.setTimeout(function() {
                                    if (checkStatus()) {
                                        return postAuditData(auditData);
                                    }
                                }, 200);
                            } else {
                                //第二种(无清洗有标注)
                                markAudit(auditData);
                            }
                        });
                } else {
                    //第三种流程
                    var panel = $('.lbf-panel').find('div.refuse-reason-panel');

                    $('span#ok:not(.lbf-button-disabled)', panel)
                        .off('click.checkedAudit')
                        .on('click.checkedAudit', function() {
                            auditData['auditStatus'] = 2;
                            var checked = $('#refuse-radio-1', panel).is(':checked');
                            var checked2 = $('#refuse-radio-2', panel).is(':checked');
                            if (checked) {
                                window.setTimeout(function() {
                                    if (checkStatus()) {
                                        postAuditData(auditData);
                                    }
                                }, 200);
                            } else if (checked2) {
                                //判断是否需要标注
                                var len = $('.lbf-panel').find('.mark-panel').length;
                                if (len == 0) {
                                    //选择原因为空
                                    var textarea = $.trim($('.other-reason').val());
                                    if (textarea == '') {
                                        return false;
                                    }
                                    //选择原因为空提示判断
                                    window.setTimeout(function() {
                                        if (checkStatus()) {
                                            return postAuditData(auditData);
                                        }
                                    }, 200);
                                } else {
                                    return markAudit(auditData);
                                }
                            }
                            return false;
                        });
                    return true;
                }
                //预览框清洗通过
            } else if (
                $(target).hasClass('clean_button') ||
                $(target)
                    .parent()
                    .hasClass('clean_button')
            ) {
                auditData['auditStatus'] = 3; //清洗操作
                var clean = $('.lbf-panel').find('div.buttons span#cleanSubmit:not(.lbf-button-disabled)');
                $(clean)
                    .off('click.clean')
                    .on('click.clean', function() {
                        window.setTimeout(function() {
                            if (checkStatus()) {
                                return postAuditData(auditData);
                            }
                        }, 200);
                        window.setTimeout(function() {
                        }, 2000);
                    });
            }
        });
}

//标注审核
function markAudit(auditData) {
    //标注事件处理
    $(document)
        .off('click.mark', '.lbf-panel:visible div.mark-panel div.buttons>span#markOk:not(.lbf-button-disabled)')
        .on(
            'click.mark',
            '.lbf-panel:visible div.mark-panel div.buttons>span#markOk:not(.lbf-button-disabled)',
            function() {
                var hint_exsit = $('.lbf-panel').find('div.store-pabel-body:contains(内容不可为空)').length;
                if (hint_exsit == 0) {
                    window.setTimeout(function() {
                        if (checkStatus()) {
                            return postAuditData(auditData);
                        }
                    }, 200);
                }
                return false;
            }
        );
    return true;
}

//错误校正
function revise(auditData, item) {
    var businessClassify = $.trim(auditData['businessClassify']);
    if (businessClassify == '疑似低质评论领单' || businessClassify == '详情页评论审核领单') {
        auditData['contentId'] = $.trim($(item).find('td:nth-child(3)').text());
        auditData['commentId'] = $.trim($(item).find('td:nth-child(4)').text());
    } else if (businessClassify == '疑似低质评论' || businessClassify == '详情页评论审核') {
        auditData['commentId'] = $.trim($(item).find('td:nth-child(5)').text());
    }
    return auditData;
}

//验证是否操作成功
function checkStatus() {
    //是否存在错误提示框
    var hint_exsit = $('.lbf-panel:visible').find('div.lbf-panel-head:contains(提示)').length;
    return hint_exsit == 0 ? true : false;
}

//传送数据和响应结果
function postAuditData(params) {
    var url = 'imageTextStatic/add';
    var ispost = true;
    var data = {url: url, params: params, ispost: ispost, action: 'FETCH_DATA_FROM_SERVER'};
    var userNumber = params['auditor'];

    chrome.extension.sendMessage(data, function(response) {
        if (response.success) {
            showInfo('图文审核数据保存成功！');
        } else {
            showError('数据保存失败，' + response.msg);
        }
    });
}

chrome.extension.sendMessage({action: 'HAVE_LOGIN'}, function(response) {
    if (response.isLogin == true) {
        var len = $('#dialog', top.window.document).length;
        if (len == 0) {
            loadJQueryUiCss(createDialog, 'dialogImageText.html');
        } else {
            $('#dialog').dialog('open');
        }

        $('#dialog-form .defaultOpen').on('click', function(e) {
            e.preventDefault();
        });
        var userNumber = response.userNumber;

        $('#dialog-form .userContrFun', top.window.document).on('click', function() {
            var curConfigFun = $(this).data('config');
            config[curConfigFun] = !config[curConfigFun];
            chrome.storage.sync.set(config);
            StatisticalAuditVolume(userNumber);
        });
        quickInput();
        detectPopupLink();
        StatisticalAuditVolume(userNumber);

        chrome.extension.sendMessage({action:"GET_FUNCTIONALITY_LIST"}, function(config) {
            console.log("Update GUI status");
            updateGuiStatus(config);
        })
    }
});

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "UPDATE_FUNCTIONALITY_SWITCH") {
        updateGuiStatus(msg);
    }
    if(msg.action ==='ACTIVE_WINDOW')
        sendResponse('imgTxt');
});
