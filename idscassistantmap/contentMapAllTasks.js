document.addEventListener(
    'click',
    function(e) {
        if (e.target.tagName.toLowerCase() === 'a' && 
        $(e.target).parent().parent().parent().parent().attr("id") == "tb") {
            console.log('You are clicking', e.target);
            var tr = $(e.target)
                .parent()
                .parent();
            console.log('row index = ', tr[0].rowIndex);
            var poi = tr
                .children()
                .eq(1)
                .text();
            var type = tr
                .children()
                .eq(9)
                .text();
            console.log(poi, '=>', type);
            chrome.extension.sendMessage({action: 'CACHE_POI', poi: poi, poiType: type});
        }
    },
    false
);