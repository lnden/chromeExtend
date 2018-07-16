//获取网址参数
$.getUrlParam = function(region) {
    var reg = new RegExp('(^|&)' + region + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};
var keyword = $.getUrlParam('keyword');
$('.tab li').click(function() {
    $('.tab li')
        .eq($(this).index())
        .addClass('cur')
        .siblings()
        .removeClass('cur');
    $('.search-div div')
        .hide()
        .eq($(this).index())
        .show();
});
$('iframe').css('height', $(window).height() - 120);
function filterStr(str) {
    var pattern = new RegExp("[`~!@#$^&*()=|':;',\\.<>/?~！@#￥&*（）——|‘；：”“'。，、？%_]");
    var specialStr = '';
    for (var i = 0; i < str.length; i++) {
        specialStr += str.substr(i, 1).replace(pattern, '');
    }
    return specialStr;
}
$('#web-search-btn').on('click', function() {
    var keyword = $('#web-search-inp').val();
    if ($.getUrlParam('keyword') == null) {
        location.href = location.href + '?keyword=' + keyword;
    } else {
        $('#iframe1').attr('src', 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword));
        $('#iframe2').attr('src', 'https://www.tianyancha.com/search?key=' + encodeURIComponent(keyword));
        if ($('#web-search-inp').val() == '') {
            $('#iframe3').attr('src', 'https://www.dianping.com/');
        } else {
            $('#iframe3').attr('src', 'https://www.dianping.com/search/keyword/2/0_' + filterStr(keyword));
        }

        $('#iframe4').attr('src', 'http://www.meituan.com/s/' + keyword);
    }
});
$(document).keyup(function(event) {
    if (event.keyCode == 13) {
        $('#web-search-btn').trigger('click');
    }
});

if (keyword != null) {
    $('#web-search-inp').val(keyword);
    $('#iframe1').attr('src', 'https://www.baidu.com/s?word=' + encodeURIComponent(keyword));
    $('#iframe2').attr('src', 'https://www.tianyancha.com/search?key=' + encodeURIComponent(keyword));
    if ($('#web-search-inp').val() == '') {
        $('#iframe3').attr('src', 'https://www.dianping.com/');
    } else {
        $('#iframe3').attr('src', 'https://www.dianping.com/search/keyword/2/0_' + filterStr(keyword));
    }
    $('#iframe4').attr('src', 'http://www.meituan.com/s/' + keyword);
} else {
    location.href = location.href + '?keyword=' + '';
}
