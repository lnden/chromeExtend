$('body').append(`
    <style>
        #dialogArtificialStatistics *{color: #333;}
        #dialogArtificialStatistics label{display: block;line-height: 3;}
        #dialogArtificialStatistics label:last-child{display: flex;justify-content: space-between;}
        #dialogArtificialStatistics button{cursor: pointer;font-size: 12px;line-height: 20px;border-radius: 4px;    border: 1px #999 solid;}
        #dialogArtificialStatistics input[type="number"]{width: 80px;height: 22px;border: 1px solid #ccc;margin: 0;}
        #dialogArtificialStatistics input[type="radio"]{position: static;outline: none;}
        #dialogArtificialStatistics select{width: 80px;height: 28px;opacity: 1;}
        #dialogArtificialStatistics span{display: inline-block;width: 6.8em;white-space: nowrap;}
        #radio-ArtificialStatistics button{display: block;margin: auto;}
        #radio1-ArtificialStatistics{display: none;}
        #radio1-ArtificialStatistics span{width: 6.2em;}
        #radio2-ArtificialStatistics{display: none;}
        #radio3-ArtificialStatistics{display: none;}
        #radio3-ArtificialStatistics label:not(:last-child){display: inline-block; width: 49%;}
        #off-ArtificialStatistics{display: none;}
        #off-ArtificialStatistics span{width: 4.6em;}
        #off-ArtificialStatistics input[type="text"]{width: 120px;height: 22px;border: 1px solid #ccc;margin: 0;}
        #tips-ArtificialStatistics{display: none;color: #f00;text-align: center;}
    </style>
    <div id="dialogArtificialStatistics">
        <div id="radio-ArtificialStatistics">
            <label><input name="radio-ArtificialStatistics" type="radio" value="1">ASN视频审核统计</label>
            <label><input name="radio-ArtificialStatistics" type="radio" value="2">ASN小视频审核统计</label>
            <label><input name="radio-ArtificialStatistics" type="radio" value="3">BOSS审核平台</label>
            <label><button id="btn-radio">确认</button></label>
        </div>
        <div id="radio1-ArtificialStatistics">
             <label><span>内容处理量</span><input type="number" min="0" max="99999"></label>
             <label><span>内容启用量</span><input type="number" min="0" max="99999"></label>
             <label><span>标注量</span><input type="number" min="0" max="99999"></label>
             <label><span>标注禁用量</span><input type="number" min="0" max="99999"></label>
             <label><button class="btn-back">返回</button><button id="btn-radio1">确认</button><button class="btn-tab">切换禁用详情</button></label>
        </div>
        <div id="radio2-ArtificialStatistics">
             <label><span>小视频模块</span><select id="select-ArtificialStatistics"></select></label>
             <label><span>小视频处理量</span><input type="number" min="0" max="99999"></label>
             <label><span>小视频启用量</span><input type="number" min="0" max="99999"></label>
             <label><span>小视频禁用量</span><input type="number" min="0" max="99999"></label>
             <label><button class="btn-back">返回</button><button id="btn-radio2">确认</button><button class="btn-tab">切换禁用详情</button></label>
        </div>
        <div id="radio3-ArtificialStatistics">
             <label><span>PGC审核量</span><input type="number" min="0" max="99999"></label>
             <label><span>PGC未通过量</span><input type="number" min="0" max="99999"></label>
             <label><span>UGC审核量</span><input type="number" min="0" max="99999"></label>
             <label><span>UGC未通过量</span><input type="number" min="0" max="99999"></label>
             <label><span>MCN审核量</span><input type="number" min="0" max="99999"></label>
             <label><span>MCN未通过量</span><input type="number" min="0" max="99999"></label>
             <label><span>即刻审核量</span><input type="number" min="0" max="99999"></label>
             <label><span>即刻未通过量</span><input type="number" min="0" max="99999"></label>
             <label><span>绿色审核量</span><input type="number" min="0" max="99999"></label>
             <label><span>绿色未通过量</span><input type="number" min="0" max="99999"></label>
             <label><button class="btn-back">返回</button><button id="btn-radio3">确认</button><button class="btn-tab">切换禁用详情</button></label>
        </div>
        <div id="off-ArtificialStatistics">
             <label><span>禁用ID</span><input type="text" maxlength="30"></label>
             <label><span>禁用理由</span><input type="text" maxlength="50"></label>
             <label><button id="btn-tab-off">切换统计量</button><button id="btn-off-ArtificialStatistics">确认</button></label>
        </div>
        <div id="tips-ArtificialStatistics"></div>
    </div>
    `);
$(function () {
    var
        dialog = $("#dialogArtificialStatistics"),
        boxs = [$('#radio-ArtificialStatistics'),
            $('#radio1-ArtificialStatistics'),
            $('#radio2-ArtificialStatistics'),
            $('#radio3-ArtificialStatistics'),
            $('#off-ArtificialStatistics'),
            $('#tips-ArtificialStatistics')],
        title = ['人工统计视频审核量', 'ASN视频审核统计', 'ASN小视频审核统计', 'BOSS审核平台', '禁用详情'],
        width = [200, 220, 220, 400, 220],
        val = 0
    ;

    dialog.dialog({
        title: title[0],
        autoOpen: false,
        draggable: true,
        resizable: false,
        modal: false,
        width: width[0],
        zIndex: 9999,
        open: function () {
            chrome.storage.sync.set({dialogArtificialStatistics: true});
            fnHide(0);
        },
        close: function () {
            chrome.storage.sync.set({dialogArtificialStatistics: false});
        }
    });

    function fnHide(i) {
        $.each(boxs, function () {
            $(this).hide();
        });
        boxs[i].show();
        dialog.dialog({title: title[i], width: width[i]});
        dialog.find('input[type="text"], input[type="number"]').val('');
        boxs[2].find('select').val('a50ef48936ca4234b0f91744ff77da53');
        boxs[5].text('');
    }

    dialog.find('input').on('input', function () {
        if (this.value) boxs[5].text('');
    }).filter('[type="number"]').on('keydown input', function (e) {
        if (e.key === '.') return false;
        if (this.value.length > 5) this.value = 99999;
    });

    $(document).on('click', '#artificialStatistics', function () {
        this.checked ? dialog.dialog('open') : dialog.dialog('close');
    });

    $(document).on('click', '#btn-radio', function () {
        val = boxs[0].find('input:checked').val();
        if (val) {
            fnHide(val);
        } else {
            boxs[5].text('请选择一项！').show();
        }
    });

    $(document).on('click', '#btn-radio1', function () {
        var data = {};
        data.contentAudit = boxs[1].find('label').eq(0).find('input').val();
        data.contentEnable = boxs[1].find('label').eq(1).find('input').val();
        data.contentTagging = boxs[1].find('label').eq(2).find('input').val();
        data.taggingDisable = boxs[1].find('label').eq(3).find('input').val();
        if (data.contentAudit > 0 || data.contentEnable > 0 || data.contentTagging > 0 || data.taggingDisable > 0) {
            chrome.runtime.sendMessage({action: 'BTN_RADIO1', data: data}, function (res) {
                if (res.success && res.msg === '操作成功') {
                    boxs[1].find('input').val('');
                    boxs[5].text('提交成功！').show();
                } else {
                    console.log('*****', res);
                }
            });
        } else {
            boxs[5].text('请填写审核量！').show();
        }
    });

    $(document).on('click', '#btn-radio2', function () {
        var data = {};
        data.videoModule = boxs[2].find('label').eq(0).find('select').val();
        data.videoAudit = boxs[2].find('label').eq(1).find('input').val();
        data.videoEnable = boxs[2].find('label').eq(2).find('input').val();
        data.videoDisable = boxs[2].find('label').eq(3).find('input').val();
        if (data.videoAudit > 0 || data.videoEnable > 0 || data.videoDisable > 0) {
            chrome.runtime.sendMessage({action: 'BTN_RADIO2', data: data}, function (res) {
                if (res.success && res.msg === '操作成功') {
                    boxs[2].find('select').val('a50ef48936ca4234b0f91744ff77da53');
                    boxs[2].find('input').val('');
                    boxs[5].text('提交成功！').show();
                } else {
                    console.log('*****', res);
                }
            });
        } else {
            boxs[5].text('请填写审核量！').show();
        }
    });

    $(document).on('click', '#btn-radio3', function () {
        var data = {};
        data.pgcAudit = boxs[3].find('label').eq(0).find('input').val();
        data.pgcNoThrough = boxs[3].find('label').eq(1).find('input').val();
        data.ugcAudit = boxs[3].find('label').eq(2).find('input').val();
        data.ugcNoThrough = boxs[3].find('label').eq(3).find('input').val();
        data.mcnAudit = boxs[3].find('label').eq(4).find('input').val();
        data.mcnNoThrough = boxs[3].find('label').eq(5).find('input').val();
        data.instantAudit = boxs[3].find('label').eq(6).find('input').val();
        data.instantNoThrough = boxs[3].find('label').eq(7).find('input').val();
        data.greenAudit = boxs[3].find('label').eq(8).find('input').val();
        data.greenNoThrough = boxs[3].find('label').eq(9).find('input').val();
        if (data.pgcAudit > 0 || data.pgcNoThrough > 0 || data.ugcAudit > 0 || data.ugcNoThrough > 0 || data.mcnAudit > 0 || data.mcnNoThrough > 0 || data.instantAudit > 0 || data.instantNoThrough > 0 || data.greenAudit > 0 || data.greenNoThrough > 0) {
            chrome.runtime.sendMessage({action: 'BTN_RADIO3', data: data}, function (res) {
                if (res.success && res.msg === '操作成功') {
                    boxs[3].find('input').val('');
                    boxs[5].text('提交成功！').show();
                } else {
                    console.log('*****', res);
                }
            });
        } else {
            boxs[5].text('请填写审核量！').show();
        }
    });

    $(document).on('click', '#btn-off-ArtificialStatistics', function () {
        var data = {};
        data.disableId = $.trim(boxs[4].find('label').eq(0).find('input').val());
        data.disableReason = $.trim(boxs[4].find('label').eq(1).find('input').val());
        if (!data.disableId) {
            boxs[5].text('禁用ID不能为空！').show();
        } else if (!data.disableReason) {
            boxs[5].text('禁用理由不能为空！').show();
        } else {
            chrome.runtime.sendMessage({action: 'BTN_RADIO4', data: data}, function (res) {
                if (res.success && res.msg === '操作成功') {
                    boxs[4].find('input').val('');
                    boxs[5].text('提交成功！').show();
                } else {
                    console.log('*****', res);
                }
            });
        }
    });

    $(document).on('click', '#btn-tab-off', function () {
        fnHide(val);
    });

    $(document).on('click', '.btn-back', function () {
        fnHide(0);
    });

    $(document).on('click', '.btn-tab', function () {
        fnHide(4);
    });

    chrome.runtime.sendMessage({action: 'GET_ARTIFICIAL_SELECT', isVideo: true, configBtn: config}, function (res) {
        var
            select = $('#select-ArtificialStatistics'),
            html = '',
            data = res.data
        ;
        $.each(data, function (i, v) {
            html += `
            <option value="${v.id}">${v.label}</option>  
            `;
        });
        select.append(html);
    });
});