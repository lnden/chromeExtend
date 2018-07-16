function initPopupSearch() {
    $('body').on('click', '#search-dwz', function () {
        var weburl = chrome.extension.getURL('multiSearchEngine.html');
        window.open(weburl);
    });
    $('body').on('click', '#search-dwz2', function () {
        var weburl2 = chrome.extension.getURL('multiSearchEngine2.html');
        window.open(weburl2);
    });
    $('body').mouseup(function (e) {
        var txt;
        var x = e.pageX;
        var y = e.pageY;
        txt = window.getSelection();
        $('#dwzss').remove();
        var btn = $(
            "<input type='button' style='border:1px solid #ccc;padding:2px 5px;position:absolute;z-index:9999;font-size:12px;background:#eaeaea;' id='dwzss' value='多网站搜索'>"
        );
        if (txt.toString().length > 1) {
            $('body').append(btn);
            addBtnEvent('dwzss');
            function addBtnEvent(id) {
                $('#' + id).css('left', x);
                $('#' + id).css('top', y - 40);
                $('#' + id).on('mouseup', function () {
                    window.open(
                        chrome.extension.getURL(
                            'multiSearchEngine.html?keyword=' + encodeURIComponent(encodeURIComponent(txt))
                        )
                    );
                    $('#dwzss').remove();
                });
            }
        } else {
            $('#dwzss').remove();
        }
    });
};

chrome.extension.sendMessage({action:"GET_FUNCTIONALITY_LIST"}, function(config) {
    if (config.gui.SHOW_MULTI_ENGINE_SEARCH_BUTTON) {
        initPopupSearch(); //多网站同步搜索
    }
})


