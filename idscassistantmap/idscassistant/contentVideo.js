"use strict";


var currentUserId = "ASN_USER1";

var highlightVideoTag = function () {
    var tagDialog = $(".ui_dialog_container")[2] || "";
    var selectedTags = [];
    var timer = null;
    timer = setInterval(function () {
        var uiLen = $(".ui_dialog_container").length;
        if(uiLen==5){
            tagDialog = $(".ui_dialog_container")[2] || "";
        }else if(uiLen==6){
            tagDialog = $(".ui_dialog_container")[3] || "";
        }else if(uiLen==4){
            tagDialog = $(".ui_dialog_container")[2] || "";
        }else if(uiLen==3){
            tagDialog = $(".ui_dialog_container")[1] || "";
        }
        if (tagDialog != "") {
            $(tagDialog).on("click", function (e) {
                setTimeout(romanceTable, 700);
            });
        }
    }, 1000);

    function romanceTable() {
        selectedTags = [];
        $(tagDialog).find(".tag_selector>.selected_tags .tru_normal_table tbody tr").each(function () {
            var str = $(this).find("td").eq(1).text();
            selectedTags.push(str);
        });
        if (config.higlightVideoTag && selectedTags.length > 0) {
            $(tagDialog).find(".tag_selector_search_table .tru_normal_table tbody tr").each(function () {
                var _this = $(this);
                var val = _this.find("td").eq(1).text();
                for (var j = 0; j < selectedTags.length; j++) {
                    if (Number(val) - Number(selectedTags[j]) === 0) {
                        _this.find("td").css({ "background": "rgb(199,199,200)" });
                        return;
                    } else {
                        _this.find("td").css({ "background": "#fff" });
                    }
                }
            })
        } else {
            $(tagDialog).find(".tag_selector_search_table .tru_normal_table tbody tr").each(function () {
                var _this = $(this);
                _this.find("td").css({ "background": "#fff" });
            })
        }
    }
};

var addQuickSearch = function () {
    var tagDialog = $(".ui_dialog_container")[2] || "";
    time();
    function time() {
        if (!config.addQuickSearch) {
            tagDialog = $(".ui_dialog_container")[2] || "";
            $(tagDialog).unbind('keyup')
            return;
        }
        var uiLen = $(".ui_dialog_container").length;
        if (uiLen < 4) {
            var div = "<div class='ui_dialog_container' id='dialog_container_marker'></div>";
            $("#app").prepend(div);
        } else if (uiLen > 4) {
            $("#dialog_container_marker").remove();
        }
        tagDialog = $(".ui_dialog_container")[2] || "";
        if (tagDialog != "") {
            $(tagDialog).off("keyup").on('keyup', "input.ui_input", function (event) {
                if (event.keyCode == "13") {
                    $(this).parent().next().click();
                }
            });
        }
        setTimeout(time, 500);
    }
};

function getVideoInfo(rowkey) {
    var found = undefined;
    $("div.section_auto_icms table.ui_table.tru_normal_table").find(">tbody>tr").each(function () {
        var $current = $(this);
        var status = $current.children().eq(1).find('a').text();
        var rk = $current.children().eq(4).html(); // rowkey
        var source = $current.children().eq(5).text(); // 素材来源
        if (!rk.match(/^[0-9a-z]{16}$/)) {
            status = $current.children().eq(2).find('a').text();
            rk = $current.children().eq(5).html();
            source = $current.children().eq(6).text()
        }
        if (rowkey == rk) {
            found = { "rowkey": rowkey, "source": source, "status": status };
            return false;
        }
    });
    if (found == undefined) {
        found = { "rowkey": rowkey, "source": "未知来源", "status": status };
        console.log("Cannot find rowkey:", rowkey);
    }
    return found;
}

function showVideoTitle(flag) {
    //绑定刷新后执行事件
    $(document).on('click.search', ".ui_button:visible, a.ui_page", function () {
        window.setTimeout(function () {
            handleLinks(flag);
        }, 2000);
    });
    handleLinks(flag);
}

//绑定和处理链接事件
function handleLinks(flag) {
    //绑定链接事件
    $(document).off('click.showVideoTitle').on('click.showVideoTitle', "div.section_auto_icms table.ui_table.tru_normal_table>tbody>tr>td A[href]", function () {
            var $current = $(this);            
            var vlink = $current.parents('tr').children().eq(3).children().children();//视频标题

            //优先送审模块事件处理
            if ($(vlink).prop("tagName") != 'A') {
                vlink = $current.parents('tr').children().eq(4).children().children();//视频标题
            }
            if (flag) {
                    var title = $.trim($current.text());
                    if (title == '待审核' || title == '开始标注' || title == '修改标注') {
                        title = '视频标注';
                        getVideoTitle(title, vlink);
                    } else if (title == '禁用' || title == '直接启用') {
                        getVideoTitle(title, vlink);
                        var searchbtn = $("div.list-item").find('.ui_button.ui_button_primary:visible');
                        $(searchbtn).trigger('click.search');
                    } else {
                        getVideoTitle(title, vlink);
                    }
            } else {
                    var title = $.trim($current.text());
                    if (title == '待审核' || title == '开始标注' || title == '修改标注') {
                        title = '视频标注';
                    }
                    var innerHTML = title + "</div>";
                    $(".ui_dialog_title").html(innerHTML); //视频标题写到页面固定位置
            } 
    });
}

function getVideoTitle(title, obj) {
    //console.log("Start to show video title");
    var text = $(obj).text();//获取点击视频链接的视频标题    
    //控制标题长度小于70 防止折行                            
    var str = (text.length < 70) ? text : text.substring(0, 70) + ".....";
    var innerHTML = title + "——" + str + "</div>";
    $(".ui_dialog_title").html(innerHTML); //视频标题写到页面固定位置
}

function showQqOwner(flag) {
    
    //点击查询以后继续绑定事件
    $(document).off('click.search2').on("click.search2" ,".ui_button:visible, a.ui_page", function () {
        //查询以后延迟处理
        window.setTimeout(function () {
            handleLinks2(flag);
        }, 2000);
    });

    handleLinks2(flag);
}

function handleLinks2(flag) {
    //表头增加操作人名
    var table = $('.ui_dialog_container .ui_dialog_body .ui_table')[0];
    var thead = $(table).find('thead>tr');

    $(document).off('click.showQqOwner').on('click.showQqOwner','div.section_auto_icms table.ui_table.tru_normal_table>tbody>tr>td A:contains(查看日志)', function(){
        window.setTimeout(function () {
            var nameth = $(thead).find("th.subordinate");
            if (flag) {
                if (nameth.length == 0) {
                    $(thead).append("<th scope='col' class='subordinate'>操作人名</th>");
                }
            } else {
                $(nameth).remove();
            }
            var tbody = $(table).find('tbody>tr');

            if (tbody.length > 0) {
                $.each($(tbody), function () {
                    var tr = $(this);
                    var asncode = $(tr).children().eq(2).text();
                    if (flag) {
                        getQqOwner(asncode, tr);
                    } else {
                        var std = $(tr).find("td.subordinate");
                        $(std).remove();
                    }
                });
            }
        }, 250);
    });   
}


function getQqOwner(asncode, tbody) {
    var url = "user/getObjectByAsn?asnAccount=" + asncode;
    var params = null;
    var ispost = false;
    var data = { 'url': url, 'params': params, 'ispost': ispost, 'action': 'FETCH_DATA_FROM_SERVER', 'showErr': false };
    //发送消息    
    chrome.extension.sendMessage(data, function (response) {
        //QQ号获取用户姓名        
        var name = (response.data != null && response.data.name != null) ? response.data.name : '未查询到';
        $(tbody).append('<td class="subordinate">' + name + '</td>');
        return true;
    });
}

// 视频质检结果统计
function qulityControlStatistics() {
    loadJQueryUiCss(createVideoStatisticsDialog, "/dialogVideoStatistic.html");
    $('#qulityControlStatistics').on('click', function () {
        $('#dialogVideoStatistic').dialog("open");
        $('#auditor').val('');
        $('#orderId').val('');
        $('#errorStatus').val('0');
        $('#errorDetail').val('');
        $('#updateMethod').val('');
    });
}

function createVideoStatisticsDialog(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'dialogVideoStatistic');
    layerNode.setAttribute('title', '视频质检结果统计');
    layerNode.innerHTML = innerHTML;
    document.body.appendChild(layerNode);
    $("#dialogVideoStatistic").dialog({
        // dialogClass: "no-close",
        autoOpen: false,
        draggable: true,
        resizable: false,
        height: 'auto',
        width: 550,
        zIndex: 3999,
        modal: false,
        buttons: {
            "取消": function () {
                $(this).dialog("close");
            },
            "确定": function () {
                getQulityControlStatisticsData();
            }
        },
        open: function (event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', '20px');
            $(event.target).parent().css('left', '276px');
            chrome.storage.sync.set({dialogVideoStatistic: true});
        },
        close: function () {
            $('#qulityControlStatisticsForm').find('input, select').removeClass("ui-state-error");
            $(".validateTips").hide();
            chrome.storage.sync.set({dialogVideoStatistic: false});
        }
    }
    );
}

function getQulityControlStatisticsData() {
    var auditor = $('#auditor'),              //审核员
        orderId = $('#orderId'),              //视频ID
        errorStatus = $('#errorStatus'),          //错误类型
        errorDetail = $('#errorDetail'),    //错误详情
        updateMethod = $('#updateMethod'),    //修改方式
        allFields = $([]).add(auditor).add(orderId).add(errorStatus),
        tips = $(".validateTips"),
        msg = {};
    msg.url = 'videoQualityResult/add';
    msg.action = "AUDIT_SAVE_REQUEST";
    msg.params = {};

    allFields.removeClass("ui-state-error");
    tips.hide();
    //校验
    if (auditor.val().length > 20 || auditor.val() == '') {
        tips.text('*审核员甲方账号为必填项且长度小于20个字符').show();
        auditor.addClass("ui-state-error");
        return false;
    }
    if (orderId.val().length > 20 || orderId.val() == '') {
        tips.text('*视频ID为必填项且长度小于20个字符').show();
        orderId.addClass("ui-state-error");
        return false;
    }

    if (errorStatus.val() == '0' || errorStatus.val() == null) {
        tips.text('*请选择错误类型').show();
        errorStatus.addClass("ui-state-error");
        return false;
    }
    msg.params.auditor = $.trim(auditor.val());
    msg.params.orderId = $.trim(orderId.val());
    msg.params.errorStatus = errorStatus.val();
    msg.params.errorDetail = $.trim(errorDetail.val());
    msg.params.updateMethod = $.trim(updateMethod.val());

    chrome.runtime.sendMessage(msg, function (res) {
        console.log(res);
        if (!res.success) {
            showError("数据保存失败，" + res.msg);
        } else {
            showInfo("质检数据保存成功！");
            $('#dialogVideoStatistic').dialog("close");
            $("#dialog").dialog('open');
        }
    });
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log("contentVideo.js received message from background.js:", msg);
    if (msg.action == "REQUEST_VIDEO_SOURCE") {
        var currentVideo = getVideoInfo(msg.rowkey);
        sendResponse(currentVideo);
        return true;
    }
    console.log("contentVideo.js received unkonw message:", msg, " from ", sender);
    return true;
});


//视频选择禁用理由
function fillBlockReason() {
    loadJQueryUiCss(createFillBlockReasonDialog, "/dialogfillBlockReason.html");
    $('#fillBlockReason').on('click', function () {
        $("#dialogfillBlockReason").dialog('open');
        //获取后台数据
        getFillBlockReason();
    });
}

function getFillBlockReason() {
    var url = "videoOptionalDisableReason/getList";
    var params = {};
    var ispost = true;
    var data = { 'url': url, 'params': params, ispost: ispost, action: 'FETCH_DATA_FROM_SERVER' };
    //发送消息    
    chrome.extension.sendMessage(data, function (response) {
        console.log(response);
        //QQ号获取用户姓名         
        var dataArr = (response != null && response.data != null) ? response.data : null;
        var html = $("#dialogfillBlockReason").find('.ibox-content');
        $(html).empty();
        //填充后台数据信息
        if (dataArr != null) {
            $.each(dataArr, function () {
                var span = "<span class='simple_tag'>" + this.disableReason + "</span>";
                $(html).append(span);
            });
        } else {
            $(html).append("<span class='simple_tag'>数据为空或者token已过期，请重新登录</span>");
        }
        // 绑定点击事件
        var tags = $("#dialogfillBlockReason").find('.simple_tag');
        $.each(tags, function () {
            var current = $(this);
            $(current).on('click', function (e) {
                if (e.target == this) {
                    $(this).toggleClass('checkcolor');
                    return false;
                }
            });
        });
    });
}

function createFillBlockReasonDialog(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'dialogfillBlockReason');
    layerNode.setAttribute('title', '视频选填禁用理由');
    layerNode.innerHTML = innerHTML;
    document.body.appendChild(layerNode);

    $("#dialogfillBlockReason").dialog({
        autoOpen: false,
        draggable: true,
        resizable: false,
        height: 'auto',
        width: 500,
        zIndex: 3999,
        modal: false,
        buttons: {
            "取消": function () {
                $(this).dialog("close");
            },
            "填入": function () {
                var len = $("span.checkcolor").length;
                if (len == 0) {
                    showError('没有选择其他原因');
                    return false;
                }
                var text = $("span.checkcolor").map(function () {
                    return $(this).text();
                }).get().join(' ');
                var obj = $(".ui_dialog .list-item .dialog-right").find(".ui_input");
                if (obj == null) {
                    showError('视频标注窗口不存在');
                    return false;
                }
                $(obj).val(text);
                $("span.checkcolor").removeClass('checkcolor');
            }
        },
        open: function (event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', '20px');
            $(event.target).parent().css('left', '276px');
            chrome.storage.sync.set({dialogfillBlockReason: true});
        },
        close: function () {
            $("span.checkcolor").removeClass('checkcolor');
            $("span.simple_tag").unbind('click');
            //$(this).dialog("close");
            chrome.storage.sync.set({dialogfillBlockReason: false});
        }
    }
    );
}


function createDialog(innerHTML) {
    var layerNode = document.createElement('div');
    layerNode.setAttribute('id', 'dialog');
    layerNode.setAttribute('title', 'IDSC 工作助手');
    var pNode = document.createElement('p');
    pNode.innerHTML = innerHTML;
    layerNode.appendChild(pNode);
    document.body.appendChild(layerNode);
    jQuery("#dialog").dialog({
        autoOpen: false,
        draggable: true,
        resizable: false,
        minHeight: 0,
        height: 'auto',
        width: 280,
        zIndex: 9999,
        modal: false,
        buttons: {},
        li: {},
        open: function (event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', '5px');
            $(event.target).parent().css('left', '10px');
        },
        beforeClose: function( event, ui ) {
            // if you do not want to close the dialog
            // return false;
        },
        close: function () {
            chrome.extension.sendMessage({
                action: "CHNAGE_FUNCTIONALITY_SWITCH",
                windowSwitchActive: false
            });
        }
    });
}

injectCustomJs("ajaxHook.js");

window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;
    console.log("Content script received event: ", event);
    if (event.data.type && (event.data.type == "API_AJAX_CALL")) {
        var pl = event.data.payload;
        console.log("uri:", pl.request.uri);
        console.log("request body:", pl.request.body);
        if (pl.request.uri == "/api/v2/video/audit_submit") {
            console.log("response body:", pl.response.body);
            chrome.runtime.sendMessage({ "action": "SAVE_AUDIT_RECORD", "payload": pl }, function (resp) {
                console.log(resp);
            });
        }
    };
}, false);


document.addEventListener("click", function (e) {
    if (location.href.indexOf("asn.qq.com/annotation/video") == -1) {
        return;
    }
    if ($(e.target).is(":button") && $(e.target).text() == "标 注") {
        var tr = $(e.target).parent().parent().parent().parent().parent();
        console.log("row index = ", tr[0].rowIndex);
        var row = $($("div.ant-table-scroll table.ant-table-fixed")[0].rows[tr[0].rowIndex]);
        var rk = row.children().eq(5).text();     // rowkey
        var source = row.children().eq(4).text(); // 素材来源
        console.log(rk, "=>", source);
        chrome.extension.sendMessage({"action": "CACHE_ROWKEY", "rowkey": rk, "source": source});
    }
}, false);
  
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == "UPDATE_FUNCTIONALITY_SWITCH") {
        updateGuiStatus(msg);
    }
    if(msg.action ==='ACTIVE_WINDOW')
        sendResponse('video');
});

// 只在页面载入时，请求登录状态。如果页面载入后，才登录的，需要刷新此页面。后面可能需要改进
chrome.extension.sendMessage({ "action": "HAVE_LOGIN" }, function (response) {
    if (response.isLogin == true) {

        loadJQueryUiCss(createDialog, "dialogVideo.html");
        
        chrome.extension.sendMessage({action:"GET_FUNCTIONALITY_LIST"}, function(config) {
            console.log("Update GUI status");
            updateGuiStatus(config);
        });
        //阻止默认事件-视频ASN默认打开&不可关闭
        $("#dialog-form .defaultOpen").on("click", function (e) {
            e.preventDefault();
        });
        $("#dialog-form .userContrFun").on("click", function () {
            var curConfigFun = $(this).data("config");
            config[curConfigFun] = this.checked;
            chrome.storage.sync.set(config);
            highlightVideoTag();
            addQuickSearch();
            showVideoTitle(config.showVideoTitle);
            showQqOwner(config.showQqOwner);
        });

        if (config.higlightVideoTag) {
            highlightVideoTag();
        }
        if (config.addQuickSearch) {
            addQuickSearch();
        }
        if (config.showVideoTitle) {
            showVideoTitle(config.showVideoTitle);
        }
        if (config.showQqOwner) {
            showQqOwner(config.showQqOwner);
        }
        if (config.qulityControlStatistics) {
            qulityControlStatistics();
        }

        videoPlayAcceleration();

        if (config.fillBlockReason) {
            fillBlockReason();
        }        
    }
});
