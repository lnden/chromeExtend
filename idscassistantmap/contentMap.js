'use strict';
var POI = {};
loadJQueryUiCss(createDialog, 'dialogMap.html');
injectCustomJs('injectMap.js');

$('#dialog').css('height', $('#idscControlPanel').height());

detectPoi();
applySubmitRules();
getPoiName(function () {
    POI.matchedCategory = findMatchedCategory();
});

$('#applySubmitRules').on('click', function () {
    if ($('#r1').is(':checked')) {
        disableOptions();
    }
    if ($('#applySubmitRules').is(':checked')) {
        checkAllowedResult();
    }
});

$('#mapClassPreprocessing').on('click', function () {
    if (POI.original == undefined) {
        POI.original = {};
        POI.original.topcategory = $('#ctype option:selected').text();
        POI.original.subcategory = $('#cname option:selected').text();
        POI.original.reclassify = $('#cvalue option:selected').text();
        POI.original.action = 'SET_SELECT_VAL';
        console.log("Saving original category settings:", POI.original.topcategory,
            POI.original.subcategory, POI.original.reclassify);
    }

    if ($('#mapClassPreprocessing').is(':checked')) {
        getPoiName(function () {
            POI.matchedCategory = findMatchedCategory();
        });
        if (POI.matchedCategory == null) {
            console.log("There is no matched category, skip the click");
            return;
        }
        console.log("Set to suggested category");
        window.postMessage(POI.matchedCategory, '*');
    } else {
        if (POI.original != undefined) {
            console.log("Reset to original category");
            window.postMessage(POI.original, '*');
        }
    }
});

$('#r1').on('click', function () {
    disableOptions();
});

// 校验
jQuery('#correctName').click(function () {
    var table = document.getElementById('majorField');
    compareTwoControl(table, 'input#name', 'td.data-name');
    var val = $('#name').val();
    againStr = '';
    var againstring = test($.trim(val));
    $('#proviceCheck').remove();
    $('#nameCheck').remove();
    if (againstring != '') {
        againstring = againstring.substr(0, againstring.length - 1);
        var div = "<div id='nameCheck' style='color:red;margin-top:21px;'>有重复字词:" + againstring + '</div>';
        $('#name')
            .parent()
            .append(div);
    }
    var div2 = '',
        provAndCity = '';
    for (var w = 0; w < cityJson.length; w++) {
        if (val.match(cityJson[w].item_name)) {
            provAndCity += cityJson[w].item_name + ',';
        }
    }
    if (provAndCity != '') {
        provAndCity = provAndCity.substr(0, provAndCity.length - 1);
        if (
            $('#name')
                .parent()
                .find('div').length > 0
        ) {
            div2 = "<div id='proviceCheck' style='color:red;'>名称含省市区:" + provAndCity + '</div>';
        } else {
            div2 = "<div id='proviceCheck' style='color:red;margin-top:21px;'>名称含省市区:" + provAndCity + '</div>';
        }
    }
    $('#name')
        .parent()
        .append(div2);
});
jQuery('#correctAddress').click(function () {
    var table = document.getElementById('majorField');
    compareTwoControl(table, 'input#address', 'td.data-address');
    $('input#address').click();
    var val = $('#address').val();
    againStr = '';
    var againstring = test($.trim(val));
    if (againstring != '') {
        $('#addressCheck').remove();
        var div = "<div id='addressCheck' style='color:red;margin-top:1px;'>有重复字词:" + againstring + '</div>';
        $('#address')
            .parent()
            .append(div);
    } else {
        $('#addressCheck').remove();
    }
});
jQuery('#correctPhone').click(function () {
    var table = document.getElementById('majorField');
    compareTwoControl(table, 'input#phone', 'td.data-phone');
});

//视野内搜索
$('button#viewMapSearchName').click(function () {
    if ($('div#syn_panel.syn_panel').length) {
        $('input#syn_panel_search_input').val(jQuery('input#name').val());
        $('button#syn_panel_search_submit').click();
        if (
            $('#syn_panel')
                .parent()
                .css('display') == 'none'
        ) {
            $('#view_search_Btn').click();
        }
    } else {
        console.log('syn.panel does NOT exist');
    }
});

$('button#viewMapSearchPhone').click(function () {
    if ($('div#syn_panel.syn_panel').length) {
        $('input#syn_panel_search_input').val(jQuery('input#phone').val());
        $('button#syn_panel_search_submit').click();
        if (
            $('#syn_panel')
                .parent()
                .css('display') == 'none'
        ) {
            $('#view_search_Btn').click();
        }
    } else {
        console.log('syn.panel does NOT exist');
    }
});

$('button#viewMapSearchAddress').click(function () {
    if ($('div#syn_panel.syn_panel').length) {
        $('input#syn_panel_search_input').val(jQuery('input#address').val());
        $('button#syn_panel_search_submit').click();
        if (
            $('#syn_panel')
                .parent()
                .css('display') == 'none'
        ) {
            $('#view_search_Btn').click();
        }
    } else {
        console.log('syn.panel does NOT exist');
    }
});
//全图内搜索
$('button#allMapSearchName').click(function () {
    $('input#search').val(jQuery('input#name').val());
    $('input#bttx').click();
});

$('button#allMapSearchPhone').click(function () {
    $('input#search').val(jQuery('input#phone').val());
    $('input#bttx').click();
});

$('button#allMapSearchAddress').click(function () {
    $('input#search').val(jQuery('input#address').val());
    $('input#bttx').click();
});
//纠错
$('button#recoveryName').click(function () {
    var val = $('input#name').val();
    var newVal = replaceBracket(val);
    $('input#name').val(newVal);
});
$('button#recoveryPhone').click(function () {
    var city = $.trim($('#city').val().toString());
    var val = $.trim($('input#phone').val().toString());
    var testZJ1 = /.*(\-\d{7,8})$/; //带-号的区号
    var testZJ2 = /^0\d{9,11}$/; //不带-号
    var testZJ3 = /^\d{7,8}$/; //7位或者8位
    var testZJ4 = /^([48]00)(\d{3})(\d+)/; //400or800开头
    var areacode = '';
    for (var v in cityToInterNumber) {
        if (cityToInterNumber[v].indexOf(city) != -1 || city.indexOf(cityToInterNumber[v]) != -1) {
            areacode = v.toString();
            break;
        }
    }
    if ($('#province').val() == '海南省') areacode = '0898';
    if (city == '马鞍山市') areacode = '0555';
    if (testZJ4.test(val.replace(/\-/g, ''))) {
        val = val.replace(/\-/g, '').replace(testZJ4, "$1-$2-$3");
    } else if (testZJ1.test(val)) {
        val = areacode + val.replace(testZJ1, "$1");
    } else if (testZJ2.test(val)) {
        val = areacode + '-' + val.substr(areacode.length);
    } else if (testZJ3.test(val)) {
        val = areacode + '-' + val;
    }
    $('input#phone').val(val);
});
$('button#recoveryAddress').click(function () {
    var val = $('input#address').val();
    var newVal = replaceBracket(val);
    $('input#address').val(newVal);
});
//多地图合并
$('#mutliMapBtn').on('click', function () {
    var weburl = chrome.extension.getURL('mutliMap.html');
    window.open(weburl);
});

function getPoiName(cb) {
    console.log("getPoiName", $('#name').val());
    if ($('#name').val() == "") {
        setTimeout(function () {
            getPoiName(cb)
        }, 1000);
        return;
    }
    cb();
}

$('#name').on('input', function (e) {
    // console.log("Changed:", e);
});

function mapClassPreprocessing() {
    if (!$('#mapClassPreprocessing').is(':checked')) {
        return;
    }
    var val = $('#name').val();

}

function replaceBracket(val) {
    var l = val.length;
    for (var i = 0; i < l; i++) {
        var indexL = val.indexOf('（');
        var indexR = val.indexOf('）');
        if (indexL >= 0) {
            var preL = val.substring(0, indexL);
            var aftL = val.substring(indexL + 1, l);
            val = preL + '(' + aftL;
        }
        if (indexR > 0) {
            var preR = val.substring(0, indexR);
            var aftR = val.substring(indexR + 1, l);
            val = preR + ')' + aftR;
        }
    }
    return val;
}

function disableOptions() {
    console.log('config.applySubmitRules=', $('#applySubmitRules').is(':checked'));
    $('#r1_tb')
        .find('>tbody>tr')
        .each(function () {
            var $current = $(this);
            var text = $current.find('p').text().replace(/\s/ig, '');
            if (
                $('#applySubmitRules').is(':checked') &&
                $current.find('p').length != 0 &&
                !POI.deletedReasons.has(text)
            ) {
                $current.find('input')[0].setAttribute('disabled', 'disabled');
            } else {
                $current.find('input')[0].removeAttribute('disabled');
            }
        });
}

function checkAllowedResult() {
    if (!POI.allowedResult.has($('#result option:selected').text())) {
        showWarning('请选择：' + Array.from(POI.allowedResult).join(' '));
    }
}

function applySubmitRules() {
    var previous;
    $('div.uptitle input')
        .first()
        .on('click', function () {
            console.log('拒绝原因 is clicked');
            disableOptions();
        });

    $('#result')
        .on('focus', function () {
            // Store the current value on focus and on change
            previous = this.value;
        })
        .on('change', function () {
            console.log(
                'the result was changed to ',
                this.value,
                ' from',
                previous,
                ',ruleActive?',
                $('#applySubmitRules').is(':checked')
            );
            if (!$('#applySubmitRules').is(':checked')) {
                return;
            }
            if (!POI.allowedResult.has($('#result option:selected').text())) {
                showWarning('请选择：' + Array.from(POI.allowedResult).join(' '));
                $('#result').val(previous);
            }
            previous = this.value;
        });
}

//地图可信度
$('#ditu-kxd').on('click', function () {
    port.postMessage({
        type: 'status',
        name: 'ditukxd',
        domtype: 'radio3',
        value: $(this).is(':checked')
    });
});

//地图黑名单
$('#ditu-hmd').on('click', function () {
    port.postMessage({
        type: 'status',
        name: 'dituhmd',
        domtype: 'radio4',
        value: $(this).is(':checked')
    });
});
//搬迁复制
var url = location.href.match(/http[s]?:\/\/(.*?)([:\/]|$)/)[0];
$('#search-copy1').on('click', function () {
    var dizhi = url + 'views/Cedit.html';
    if (location.href.split('?')[0] != dizhi) {
        alert('本页面不能进行搬迁复制');
        return false;
    }
    localStorage.setItem('province', $.trim($('#province').val()));
    localStorage.setItem('city', $.trim($('#city').val()));
    localStorage.setItem('district', $.trim($('#district').val()));
    localStorage.setItem('name', $.trim($('#name').val()));
    localStorage.setItem('phone', $.trim($('#phone').val()));
    localStorage.setItem('latlng', $.trim($('#latlng').val()));
    localStorage.setItem('ctype', $.trim($('#ctype').val()));
    localStorage.setItem('cname', $.trim($('#cname').val()));
    localStorage.setItem('cvalue', $.trim($('#cvalue').val()));
    localStorage.setItem('remarks', $.trim($('#remarks').val()));
    localStorage.setItem('address', $.trim($('.data-address').text()));
    window.open(url + 'views/addEditor.html');
});
//关店复制
$('#search-copy2').on('click', function () {
    var dizhi = url + 'views/Cedit.html';
    if (location.href.split('?')[0] != dizhi) {
        alert('本页面不能进行关店复制');
        return false;
    }
    localStorage.removeItem('province');
    localStorage.removeItem('city');
    localStorage.removeItem('district');
    localStorage.setItem('name', $.trim($('.data-name').text()));
    localStorage.setItem('phone', $.trim($('.data-phone').text().replace(/多位数|少位数|黑名单/, '')));
    localStorage.removeItem('latlng');
    localStorage.removeItem('ctype');
    localStorage.removeItem('cname');
    localStorage.removeItem('cvalue');
    localStorage.setItem('remarks', $.trim($('#remarks').val()));
    localStorage.setItem('address', $.trim($('.data-address').text()));
    window.open(url + 'views/addEditor.html');
});
//粘贴
$('#search-zt').on('click', function () {
    var dizhi = url + 'views/addEditor.html';
    if (location.href != dizhi) {
        alert('本页面不能粘贴');
        return false;
    }
    if (localStorage.getItem('province')) {
        $('#province').val(localStorage.getItem('province'));
    }
    if (localStorage.getItem('city')) {
        var text = localStorage.getItem('city');
        $('#city').html('<option value="' + text + '">' + text + '</option>' + $('#city').html());
        $('#city').val(text);
    }
    if (localStorage.getItem('district')) {
        var text = localStorage.getItem('district');
        $('#district').html('<option value="' + text + '">' + text + '</option>' + $('#district').html());
        $('#district').val(text);
    }
    if (localStorage.getItem('name')) {
        $('#name').val(localStorage.getItem('name'));
    }
    if (localStorage.getItem('phone')) {
        $('#phone').val(localStorage.getItem('phone'));
    }
    if (localStorage.getItem('latlng')) {
        $('#latlng').val(localStorage.getItem('latlng'));
    }
    if (localStorage.getItem('ctype')) {
        $('#ctype').val(localStorage.getItem('ctype'));
    }
    if (localStorage.getItem('cname')) {
        setTimeout(function () {
            var text = localStorage.getItem('cname');
            $('#cname').html('<option value="' + text + '">' + text + '</option>' + $('#cname').html());
            $('#cname').val(text);
        }, 1000);
    }
    if (localStorage.getItem('cvalue')) {
        var text = localStorage.getItem('cvalue');
        $('#cvalue').html('<option value="' + text + '">' + text + '</option>' + $('#cvalue').html());
        $('#cvalue').val(text);
    }
    if (localStorage.getItem('remarks')) {
        $('#remarks').val(localStorage.getItem('remarks'));
    }
    if (localStorage.getItem('address')) {
        $('#address').val(localStorage.getItem('address'));
    }
});
setTimeout(() => {
    chrome.runtime.sendMessage({action: 'HAVE_DITU'}, function (response) {
    });
}, 1000);
setTimeout(() => {
    chrome.runtime.sendMessage({action: 'HAVE_DITU'}, function (response) {
    });
}, 3000);
setTimeout(() => {
    chrome.runtime.sendMessage({action: 'HAVE_DITU'}, function (response) {
    });
}, 5000);
chrome.extension.onMessage.addListener(function (msg) {
    if (msg.status && msg.status.ditukxd.value == true) {
        $('#ditu-kxd').attr('checked', true);
        if ($('#reliability_level').val() != '40') {
            $('#reliability_level').css('background', '#cc0000');
        } else {
            $('#reliability_level').css('background', '#ffffff');
        }
        if ($('#expiration_label').val() != '20') {
            $('#expiration_label').css('background', '#cc0000');
        } else {
            $('#expiration_label').css('background', '#ffffff');
        }
        $('#reliability_level').on('input propertychange', function () {
            if ($('#ditu-kxd').is(':checked') && $(this).val() != '40') {
                $(this).css('background', '#cc0000');
            } else {
                $(this).css('background', '#ffffff');
            }
        });
        $('#expiration_label').on('input propertychange', function () {
            if ($('#ditu-kxd').is(':checked') && $(this).val() != '20') {
                $(this).css('background', '#cc0000');
            } else {
                $(this).css('background', '#ffffff');
            }
        });
    } else {
        $('#ditu-kxd').attr('checked', false);
        $('#reliability_level').css('background', '#ffffff');
        $('#expiration_label').css('background', '#ffffff');
    }
    if (msg.status && msg.status.dituhmd.value == true) {
        $('#ditu-hmd').attr('checked', true);
        $.ajax({
            type: 'GET',
            url: chrome.extension.getURL('blackPhoneNumberList.json'),
            dataType: 'json',
            success: function (result) {
                console.log(result);
                var tel1 = $('.data-phone').text();
                var tel2 = $('#phone').val();
                var arr = result.code;
                for (var i = 0; i < arr.length; i++) {
                    if (tel1 == arr[i]) {
                        $('.data-phone').append('<span class="tipfont" style="color:#cc0000">黑名单</span>');
                    }
                    if (tel2 == arr[i]) {
                        $('#phone').after('<span class="tipfont" style="color:#cc0000">黑名单</span>');
                    }
                }
            }
        });
        $('#phone').on('input propertychange', function () {
            var hmd = $(this);
            $.ajax({
                type: 'GET',
                url: chrome.extension.getURL('blackPhoneNumberList.json'),
                dataType: 'json',
                success: function (result) {
                    var arr = result.code;
                    $('.tipfont').remove();
                    for (var i = 0; i < arr.length; i++) {
                        if (hmd.val() == arr[i]) {
                            hmd.after('<span class="tipfont" style="color:#cc0000">黑名单</span>');
                            return false;
                        }
                    }
                }
            });
        });
    } else {
        $('#ditu-hmd').attr('checked', false);
        $('.tipfont').remove();
    }
});
