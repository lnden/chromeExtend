function videoPlayerKeydownEventListener(e) {
    if (!config.videoPlayAcceleration) {
        return;
    }
    if (!$('div').hasClass('preview')) {
        console.log("Can not find the preview div");
        return;
    }

    if (!canBeAccelerated()) {
        console.log("Can not be accelerated");
        return;
    }
    var video = $("iframe").contents().find('video')[0];
    if (video == undefined) {
        console.log("Can not find the video");
        return;
    }
    if (e && e.keyCode == 37) {//左、快退
        e.preventDefault();
        video.currentTime -= 6;
        video.play();//暂停时自动播放
    }
    if (e && e.keyCode == 39) {//右、快进
        e.preventDefault();
        if ((video.duration - video.currentTime) > 6) {//如果大于6秒
            video.currentTime += 6;
            $("iframe").contents().find('.js_video_poster').show();//不自动播放时需要
            $("iframe").contents().find('.js_btn_play').hide();
            video.play();//继续播放
        }
        else {//如果小于6秒视频结束
            video.currentTime = video.duration;
        }
    }
}

function registerKeydownEvent() {
    var iframe = $(".iframe").contents();
    var video_div = iframe.find('#video-play');
    if (video_div.hasClass('wx-video-player')) {
        window.focus();
        if (config.videoAutoPlay) {
            console.log("Playing the video automatically");
            iframe.find('video').get(0).play();
            iframe.find('.js_video_poster').show();
            iframe.find('.js_btn_play').hide();
            showInfo("已自动播放视频");
        }
        $("iframe")[0].contentWindow.document.addEventListener("keydown", videoPlayerKeydownEventListener, false);
    }
    else {
        console.log("Cannot find the video player?");
    }
    document.onkeydown = videoPlayerKeydownEventListener;
}

var videoPlayAcceleration = function () {
    $(".ui_table").on('click', 'tr>td:nth-child(4) a', function () {//表格点击标题出现视频
        console.log("You are clicking the title of the video");
        var t = setInterval(detectVideoPopup, 100);
        function detectVideoPopup() {
            if ($('div').hasClass('preview')) {
                console.log("Video div is popup");
                setTimeout(registerKeydownEvent, 1000);                
                clearInterval(t);
            }
        }
    })
}


function canBeAccelerated() {
    var stop = true;
    var video = $("iframe").contents().find('video')[0];
    video.addEventListener(
        "play", function () {
            stop = true;
        }
    )
    video.addEventListener(
        "ended", function () {
            stop = false;
        }
    )
    video.addEventListener(
        "pause", function () {
            stop = true;
        }
    )
    return stop;
}

