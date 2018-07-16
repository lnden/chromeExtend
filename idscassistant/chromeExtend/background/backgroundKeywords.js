var GLOBAL_KEYWORDS;
var GLOBAL_KEYWORDS_TIMESTAMP = null;
var IS_UPDATING_KEYWORDS = false;

// 登录成功后 background.js 会调用 loginSuccess
function loginSuccess() {
    if (config.isKeywordHighlightActive) {
        loadLocalKeyword();
        updateKeywordsFromServer();
    }
}

function loadLocalKeyword() {
    GLOBAL_KEYWORDS = JSON.parse(localStorage.getItem("keywords"));
    if (GLOBAL_KEYWORDS == null) {
        console.log("There are no keywords in local storage");
    } else {
        console.log("There are", GLOBAL_KEYWORDS.length, "keywords in local storage");
    }
};

function updateKeywordsFromServer() {
    if (IS_UPDATING_KEYWORDS) {
        console.log("backgroundHighlight.js is pulling keyword, request is ignored")
        return;
    }
    IS_UPDATING_KEYWORDS = true;
    sendToServer({timestamp:GLOBAL_KEYWORDS_TIMESTAMP}, 'keyWord/getUserKeywords', true, function(d) {
        IS_UPDATING_KEYWORDS = false;
        onKeywordsReady(d);
    });
}

function applyDeltaUpdate(d) {
    let newAdded = [];
    for (let i = 0; i < d.data.length; i++) {
        let found = false;
        for (let j = 0; j < GLOBAL_KEYWORDS.length; j++) {
            if (d.data[i].id == GLOBAL_KEYWORDS[j].id) {
                found = true;
                GLOBAL_KEYWORDS[j] = d.data[i];
                break;
            }
        }
        if  (!found) {
            newAdded.push(d.data[i]);
        }
    }

    for (let i = 0; i < newAdded.length; i++) {
        let inserted = false;
        for (let j = 0; j < GLOBAL_KEYWORDS.length; j++) {
            if (newAdded[i].keyword.length <= GLOBAL_KEYWORDS[j].keyword.length) {
                if ( j == 0) {
                    GLOBAL_KEYWORDS.unshift(newAdded[i]);
                } else {
                    GLOBAL_KEYWORDS.splice(j - 1, 0, newAdded[i]);
                }
                inserted = true;
                break;
            }
        }
        if (! inserted ) {
            GLOBAL_KEYWORDS.push(newAdded[i]);
        }
    }
}

function onKeywordsReady(d) {
    let updatedTo = new Date(d.timestamp).Format("yyyy-MM-dd hh:mm:ss");
    console.log("Got keyword from server, count:", d.data.length,
        "timestamp:", d.timestamp, "(", updatedTo, ")");
    
    if (GLOBAL_KEYWORDS_TIMESTAMP == null) {
        GLOBAL_KEYWORDS = d.data;
        GLOBAL_KEYWORDS_TIMESTAMP = d.timestamp;
    } else {
        applyDeltaUpdate(d);
        GLOBAL_KEYWORDS_TIMESTAMP = d.timestamp;
    }
    if (d.data.length == 0) {
        show("关键字数据已经是最新，不需更新")
    } else {
        show("高亮关键字列表已更新至最新:" + updatedTo);        
    }

    chrome.storage.sync.set({keyWordsUpDate: updatedTo});

    // GLOBAL_KEYWORDS = [
    //     {"keyword": "0", "color": "red"},
    //     {"keyword": "1", "color": "yellow"},
    //     {"keyword": "2", "color": "blue"},
    //     {"keyword": "3", "color": "yellow"},
    //     {"keyword": "4", "color": "blue"},
    //     {"keyword": "5", "color": "yellow"},
    //     {"keyword": "6", "color": "blue"},
    //     {"keyword": "7", "color": "yellow"},
    //     {"keyword": "8", "color": "red"},
    //     {"keyword": "9", "color": "blue"},
    //     {"keyword": "阿碧", "color": "yellow"},
    //     {"keyword": "审核", "color": "yellow"},
    //     {"keyword": "敏感词", "color": "yellow"},
    // ];
    localStorage.setItem("keywords", JSON.stringify(GLOBAL_KEYWORDS));
    broadcastMessage({ action: "REFRESH_KEYWORDS", value: GLOBAL_KEYWORDS })

    if (!config.isKeywordHighlightActive) {
        console.log("Keyword is retrived, but Keyword highlight is not activated");
        return;
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "PULL_KEYWORDS") {
        console.log("backgroundHighlight.js received PULL_KEYWORDS request");
        updateKeywordsFromServer();
        return;
    }
});

