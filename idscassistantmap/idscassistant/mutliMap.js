$(".tab li").click(function () {
	$(".tab li").eq($(this).index()).addClass("cur").siblings().removeClass('cur');
	$(".search-div div").hide().eq($(this).index()).show();
	$("#web-search-btn").trigger("click");
});
$("iframe").css("height", $(window).height() - 120)
$("#web-search-btn").on("click", function () {
	var keyword=$("#web-search-inp").val().trim();
	if(keyword!=""){
		$("#googleIframe").attr({"src":"http://ditu.google.cn/maps?q="+keyword+"&output=embed"});
		$("#gaodeIframe").attr({"src":"https://www.amap.com/search?query="+keyword})
		$("#baiduIframe").attr({"src":"http://api.map.baidu.com/geocoder?address="+keyword+"&output=html&src=Pactera"})
	}
})
$(document).keyup(function (event) {
	if (event.keyCode == 13) {
		$("#web-search-btn").trigger("click");
	}
});