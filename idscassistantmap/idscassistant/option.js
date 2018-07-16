var table;

chrome.runtime.sendMessage({ action: 'HAVE_KEYWORD' }, function (kw) {
    chrome.runtime.sendMessage({ action: "KEYWORDS_UPDATE_TIME_REQUEST" }, function (t) {
        document.getElementById("UpdateTime").innerText = new Date(t).toString();
        document.getElementById("KeywordCount").innerText = kw.length;
    })

    table = document.getElementById("keywordsDashboard");

    showAllKeywords(kw);

});


function showAllKeywords(kw) {
        // set this to whatever number of items you can process at once
        var chunk = 100;
        var index = 0;
        function doChunk() {
            var cnt = chunk;
            while (cnt-- && index < kw.length) {
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
        
                cell1.innerHTML = kw[index].id;
                cell2.innerHTML = kw[index].keyword;
                cell3.innerHTML = kw[index].color;
                cell4.innerHTML = kw[index].deleteFlag;
                row.style.backgroundColor = kw[index].color;
                ++index;
            }
            if (index < kw.length) {
                // set Timeout for async iteration
                setTimeout(doChunk, 1);
            }
        }    
        doChunk();  
}
