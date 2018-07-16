//获取网址参数
$.getUrlParam = function(region) {
    var reg = new RegExp('(^|&)' + region + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};
var keyword = decodeURIComponent($.getUrlParam('keyword'));
$('iframe').css('height', $(window).height() - 80);
$('#web-search-btn').on('click', function() {
    var keyword = $('#web-search-inp').val();
    if ($.getUrlParam('keyword') == null) {
        location.href = location.href + '?keyword=' + encodeURIComponent(encodeURIComponent(keyword));
    } else {
        $('#iframe1').attr('src', 'http://m.sm.cn/s?q=' + keyword);
        $('#iframe2').attr('src', 'https://m.baidu.com/s?word=' + keyword);
        $('#iframe3').attr('src', 'https://m.sogou.com/web/searchList.jsp?keyword=' + keyword);
        $('#iframe4').attr('src', 'https://m.so.com/s?q=' + keyword);
    }
    //以下为第2种搜索
    //	$("#iframe1").attr("src","https://m.baidu.com/s?word="+keyword);
    //	$("#iframe2").attr("src","https://m.tianyancha.com/search?key="+keyword);
    //	$("#iframe3").attr("src","https://m.dianping.com/shoplist/2/search?from=m_search&keyword="+keyword);
    //	$("#iframe4").attr("src","http://i.meituan.com/s/-"+keyword);
});
$(document).keyup(function(event) {
    if (event.keyCode == 13) {
        $('#web-search-btn').trigger('click');
    }
});

if (keyword != 'null') {
    $('#web-search-inp').val(keyword);
    $('#iframe1').attr('src', 'http://m.sm.cn/s?q=' + keyword);
    $('#iframe2').attr('src', 'https://m.baidu.com/s?word=' + keyword);
    $('#iframe3').attr('src', 'https://m.sogou.com/web/searchList.jsp?keyword=' + keyword);
    $('#iframe4').attr('src', 'https://m.so.com/s?q=' + keyword);
}
