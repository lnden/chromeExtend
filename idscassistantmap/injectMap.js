var t1 = null, t2 = null;
window.addEventListener("message", function (e) {
    var getMsg = e.data;
    if (getMsg.action == "SET_SELECT_VAL") {//设置下拉框值---地图预分类
        clearInterval(t1);
        clearInterval(t2);
        console.log("Injected JS received", getMsg);
        if ($("#ctype").val() == getMsg.topcategory && $("#cname").val() == getMsg.subcategory && $("#cvalue").val() == getMsg.reclassify) return;
        $("#ctype").val(getMsg.topcategory).change();
        t1 = setInterval(function () {
            if ($("#cname").val() == getMsg.subcategory) clearInterval(t1);
            $("#cname").val(getMsg.subcategory).change();
        }, 300);
        t2 = setInterval(function () {
            if ($("#cvalue").val() == getMsg.reclassify) clearInterval(t2);
            $("#cvalue").val(getMsg.reclassify);
        }, 300);
    }
}, false);