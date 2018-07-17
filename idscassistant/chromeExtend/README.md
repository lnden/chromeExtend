### Chrome扩展插件

### Chrome扩展API

> 1.获取background页面 [ chrome.runtime.getBackgroundPage(callback) ]

```
    chrome.runtime.getBackgroundPage(function (bp) {
        console.log(1111);
        bp.test();          //test()是background最后一个js文件内方法
        console.log(2222);
        bp.getHost()        //getHost()是background.js内的方法
    });
```

> 2.使用Chrome存储API [ chrome.storage.StorageArea.get(keys,callback) ]

```
    chrome.storage.sync.set({btnList: '测试数据'});
    chrome.storage.sync.get({btnList: ''},function(result){
        console.log(result.btnList,654321)
    })
```

> 3.Chrome扩展页面间传递传递 [ chrome.runtime.sendMessage({},callback) ]
    Chrome扩展页面间消息接受 [ chrome.runtime.onMessage({},sender,callback) ]

```
    //发送消息
    chrome.runtime.sendMessage(response, function (resp) {
        chrome.browserAction.setPopup({'popup': 'dashboard.html'});
        console.log('login response from background:', resp);   //resp为"登录成功"
    });
    //接收消息
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action == 'LOGIN_SUCCESS') {
            sendResponse('登录成功');
        }
    });
```

> 4.Chrome扩展桌面通知 [ chrome.notifications.create('',opt,callback) ]

```
    function show(msg){
        var opt = {
            "type": 'basic',
            "iconUrl": 'images/48.png',
            "message": msg,
            "title": "IDSC 工作助手"
        }
        chrome.notifications.create("", opt, function(id) {
            setTimeout(function(){chrome.notifications.clear(id);}, 1000);
        })

        //另外一种方式清除弹框
        var opt = {
            type: 'basic',
            title: '通知的title!',
            message: msg,
            iconUrl: 'images/icon.png',
        }
        chrome.notifications.create('', opt, function(id){
            setTimeout(function(){
                chrome.notifications.clear(id, function(){});
            }, 3000);
        });
    }
```
> 5.Chrome扩展创建一个新的页面 [ chrome.tabs.create(object) ]  -> http://open.chrome.360.cn/extension_dev/extension.html#method-getURL

```
    chrome.tabs.create({ur:'wwww.baidu.com'})
    chrome.tabs.create({ur:chrome.extension.getURL('login.html')})
    //chrome.extension.getURL(string path)将扩展安装目录内的文件的相对路径转为FQDN URL。
```

> 6.badge显示
```
    // chrome.browserAction.setBadgeText({text: 'new'});
    // chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
```

> 7.获取当前Chrome扩展的ID值

```
    chrome.runtime.id    //oapmgafpfnoljejoohgabhdpcmbclhgm
```
### manifest.json 内容详解

> 1.[ options_page 和 options_ui ] 属性

```
    "desc": "右击扩展图标，点击选项按钮",
    //Chrome40以前的写法
    "options_page": "options.html"

    //Chrome40以后的写法
    "options_ui": {
        "page": "options.html",
        // 默认打开的样式，是否新建tabs窗口，true为新建窗口，false为新特性弹层
        "open_in_tab": false,
        // 添加一些默认的样式，推荐使用
        "chrome_style": true
    }
```

> 2.[ background ] 属性

```
    "desc": "Chrome扩展后台常住页面",
    //会一直常驻的后台JS或后台页面
    "background": {
        //"page": "background.html",
        "scripts": [
            "lib/jquery-3.3.1.js",
            "config.js",
            "backgroundFunctionalitySwitch.js",
            "backgroundCommon.js",
            "background.js",
            "backgroundVideoStatistics.js",
            "backgroundVideoArtificial.js",
            "backgroundDiscover.js",
            "backgroundKeywords.js"
        ],
        //需要时加载，在空闲时被关闭，什么叫被需要时呢？比如第一次安装、插件更新、有content-script向它发送消息，等等。
        "persistent": true
    }
```

> 3.[ browser_action 和 page_action ] 属性
```
    "desc": "浏览器右上角图标设置",
    "browser_action": {
        "default_title": "图标悬停时的标题，可选",
        "default_icon": {
            "16": "images/16.png",
            "32": "images/32.png",
            "48": "images/48.png",
            "128": "images/128.png"
        },
        "default_popup": "popup.html"
    }

    "desc": "当某些特定页面打开才显示的图标",
    "page_action": {
        "default_title": "我是pageAction",
        "default_icon": "img/icon.png",
        "default_popup": "popup.html"
    }

```

> 4.[ permissions ] 属性

```
    "desc": "扩展程序权限配置",
    "permissions": [
        "contextMenus", // 右键菜单
        "tabs", // 标签-
        "notifications", // 通知-
        "webRequest", // web请求-
        "webRequestBlocking",
        "storage", // 插件本地存储-
        "http://*/*", // 可以通过executeScript或者insertCSS访问的网站
        "https://*/*" // 可以通过executeScript或者insertCSS访问的网站
    ]
```

> 5.[ web_accessible_resources ] 属性

```
    "desc": "普通页面能够直接访问的插件资源列表，如果不设置是无法直接访问的",
    "web_accessible_resources": [
        "js/inject.js"
    ]
```

> 6.[ homepage_url ] 属性

```
    "desc": "插件主页",
    "homepage_url": "https://www.baidu.com",
```

> 7.[ "content_scripts" ] 属性

```
    desc: "需要直接注入页面的文件.js/.css",
    "content_scripts": [
            {
                "matches": ["https://asn.qq.com/*"],
                "css": ["lib/bpoAssistant.css"],
                "js": [
                    "lib/jquery-3.3.1.js",
                    "lib/jquery-ui-1.12.1/external/jquery/jquery.js",
                    "lib/jquery-ui-1.12.1/jquery-ui.js",
                    "lib/diff.js"
                ],
                "run_at": "document_end",
                "all_frames": true
            },
            {
                "matches": ["https://publicboss.qq.com/*"],
                "css": ["lib/bpoAssistant.css"],
                "js": [
                    "contentFunctionalitySwitch.js",
                    "contentCommon.js",
                    "contentImageText.js"
                ],
                "desc": "代码注入的时间，可选值： "document_start", "document_end", or "默认document_idle"",
                "run_at": "document_end",
                "desc": "是否运行在页面所有frame中，设置为true时扩展程序在iframe中也能起作用",
                "all_frames": true
            }
        ]
```

### Chrome扩展特效

1.右键菜单
```
//background.js
chrome.contextMenus.create({
    title: '使用度娘搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params)
    {
        // 注意不能使用location.href，因为location是属于background的window对象
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
    }
});
chrome.contextMenus.create({
    title: "测试右键菜单",
    onclick: function(){alert('您点击了右键菜单！');}
});
```























































