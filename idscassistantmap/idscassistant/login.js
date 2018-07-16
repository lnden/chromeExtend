const
    $loginTab = $('#loginTab'),
    $teamsTab = $('#teamsTab'),
    $user = $('#user'),
    $pwd = $('#password'),
    $tenantId = $('#tenantId'),
    $login = $('#login'),
    $radio = $('#radio_teams'),
    $teams = $('#teams'),
    $loging = $('#loging'),
    $tips = $('#tips')
;

$login.on('click', function () {
    $tips.text('');
    $loging.show();
    let data = {
        loginName: $user.val().trim(),
        password: $pwd.val().trim(),
        tenantId: $tenantId.val()
    };
    if (data.loginName || data.password) {
        console.log('Log in using:', data);
        chrome.runtime.getBackgroundPage(function (bp) {
            login(bp.getHost(), data);
        });
    } else {
        $tips.text('用户名或密码不能为空！');
    }
});

document.onkeyup = function (event) {
    let e = event || window.event;
    if (e && e.keyCode == 13) {
        $login.click();
        $teams.click();
    }
};

function login(host, data) {
    $.ajax({
        url: host + '/assistant/login',
        type: 'post',
        data: data,
        success: function (response) {
            if (response.success && response.msg == '操作成功') {
                let html = '', projects = response.data.user.projects;
                $.each(response.data.user.teams, function (i, v) {
                    let btns = [];
                    $.each(projects, function (i2, v2) {
                        if (v.projectName == v2.name) {
                            btns = v2.opeDictDataList;
                            return false;
                        }
                    });
                    html += `
                           <label>
                               <input name="radio-teams" type="radio" data-btns="${btns}" value="${v.projectId}-${v.id}">
                               <span>${v.projectName}-${v.name}</span>
                           </label>
                    `;
                });
                $radio.html(html);
                $teams.on('click', function () {
                    let teams = $('input[name="radio-teams"]:checked');
                    if (teams.val()) {
                        response.teamId = teams.val();
                        response.teamName = teams.next().text();
                        chrome.storage.sync.set({btnList: teams.data('btns').split(',')});
                        onSuccess(response);
                    } else {
                        $tips.text('请选择项目！');
                    }
                });
                $loginTab.hide();
                $teamsTab.show();
                $loging.hide();
            } else if (!response.success && response.errorCode == '1006') {
                let html = '';
                $.each(response.data.tenants, function (i, v) {
                    html += `
                        <option value=${v.id}>${v.name}</option>
                    `;
                });
                $tenantId.html(html).parent().show();
                $tips.text('');
                $loging.hide();
            } else {
                $tips.text('*' + response.msg);
                $loging.hide();
            }
        },
        error: function () {
            $tips.text('登录失败，请检查网络！');
            $loging.hide();
        }
    })
}

function onSuccess(response) {
    response.action = 'LOGIN_SUCCESS';
    chrome.runtime.sendMessage(response, function (resp) {
        chrome.browserAction.setPopup({'popup': 'dashboard.html'});
        console.log('login response from background:', resp);
        close();
    });
}

chrome.runtime.sendMessage({action: 'HAVE_LOGIN'}, function (response) {
    if (response.isLogin)
        close();
    console.log(response);
});

// 为了方便测试
chrome.runtime.getBackgroundPage(function (bp) {
    if (bp.isTesting()) {
        $user.val('12345678');
        $pwd.val('123456');
    }
});