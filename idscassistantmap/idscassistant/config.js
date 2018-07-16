
var configUc = {
    'action': "UPDATE_FUNCTIONALITY_SWITCH",
    "port": 8082, // 交给客户前请将 8082 改为 8080
    'webSearch': false,
    'windowSwitchActive': false,
    'isKeywordHighlightActive': false,
    'enableExperimentalFeature': true,
    'gui': {
        "SHOW_MULTI_ENGINE_SEARCH_BUTTON" : true, // 显示多网站搜索的按钮
        "SHOW_KEYWORD_HIGHLIGHT_SWITCH": false,   // 显示关键字高亮的开关
        "SHOW_WEB_SEARCH_SWITCH": true           // 显示界面搜索的开关
    }
};

var configImageText = {
    'action': "UPDATE_FUNCTIONALITY_SWITCH",
    "port": 8082, // 交给客户前请将 8082 改为 8080
    'webSearch': false,
    'windowSwitchActive': false,
    'isKeywordHighlightActive': true,
    'enableExperimentalFeature': true,
    'gui': {
        "SHOW_MULTI_ENGINE_SEARCH_BUTTON" : true, // 显示多网站搜索的按钮
        "SHOW_KEYWORD_HIGHLIGHT_SWITCH": true,    // 显示关键字高亮的开关
        "SHOW_WEB_SEARCH_SWITCH": true            // 显示界面搜索的开关
    }
};


//var config = configUc; // UC 的包使用这一行
var config = configImageText; // 图文的包使用这一行