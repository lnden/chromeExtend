var currentQuestionIndex = null;
var currentTaskId = null;

function saveUcAudit(taskId, questionIndex) {
    var msg = { "questionNo": Number(questionIndex) + 1, "questionPackageNo": Number(taskId), "autditor": getUserNumber() };

    sendToServer(msg, "ucAuditStatic/add", true, function () {
        checkConsistency(msg.questionPackageNo, msg.questionNo - 1);
    });
}

function checkConsistency(taskId, questionIndex) {
    let historyQuestions = localStorage.getItem(taskId);
    if (historyQuestions == null) {
        localStorage.setItem(taskId, JSON.stringify([questionIndex]));
        if (localStorage.getItem('UC_TASKS') == null) {
            localStorage.setItem('UC_TASKS', JSON.stringify([taskId]));
        } else {
            var tasks = JSON.parse(localStorage.getItem('UC_TASKS'));
            tasks.push(taskId);
            tasks.sort((a, b) => a - b);
            localStorage.setItem('UC_TASKS', JSON.stringify(tasks));
            if (tasks.length > 100) {
                localStorage.removeItem(tasks.shift());
                localStorage.setItem('UC_TASKS', JSON.stringify(tasks));
            }
        }
        return;
    }

    historyQuestions = JSON.parse(historyQuestions);
    historyQuestions.push(questionIndex);
    historyQuestions.sort((a, b) => a - b);
    localStorage.setItem(taskId, JSON.stringify(historyQuestions));

    for (let i = 0; i < historyQuestions.length; i++) {
        if (i != 0 && historyQuestions[i] - historyQuestions[i - 1] > 1) {
            saveUcAudit(taskId, historyQuestions[i - 1] + 1);
            return;
        }
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {

        if (!isLogin()) {
            return;
        }
        console.log(details);
        if (details.method == "POST" && details.url == "http://discover.sm.cn/api/base/save_question_result") {
            var formData; 
            var questionInfo;
            try {
                formData = details.requestBody.formData;
                questionInfo= JSON.parse(formData.question_info[0]);
            } catch(error1) {
                try {
                    console.log(error1.message);
                    var d = new TextDecoder('utf-8');
                    formData = JSON.parse(d.decode(details.requestBody.raw[0].bytes));
                    questionInfo= JSON.parse(formData.question_info[0]);
                } catch(error2) {
                    console.log(error2.message);
                }
            }
            console.log("save_question_result:", formData);
            if (questionInfo.question_index != formData.question_index[0]) {
                console.log("题目状态异常");
                return;
            }
            if (formData.question_index.length == 1 && formData.task_id.length == 1) {
                var questionIndex = formData.question_index[0];
                var taskId = formData.task_id[0];
                console.log("save_question_result: Question index", questionIndex, "Task id", taskId, "score=", questionInfo.score);

                if (questionIndex == 49 || questionIndex == 399) {
                    console.log("Trick as we can not get http_response body by Chrome extension API");
                    var msg = { "questionNo": Number(questionIndex) + 1, "questionPackageNo": Number(taskId), "autditor": getUserNumber() };
                    sendToServer(msg, "ucAuditStatic/add", true, function () {
                        show("完成了答题，题包:" + msg.questionPackageNo + ",题号:" + msg.questionNo);
                        checkConsistency(msg.questionPackageNo, msg.questionNo - 1);
                    });
                } else {
                    currentQuestionIndex = questionIndex;
                    currentTaskId = taskId;
                }
            }
            return;
        }

        if (details.method == "POST" && details.url == "http://discover.sm.cn/api/base/get_question_info") {
            var formData = details.requestBody.formData;
            var questionIndex = formData.question_index[0];
            var taskId = formData.task_id[0];
            console.log("get_question_info: currentQuestionIndex", currentQuestionIndex, "currentTaskId=", currentTaskId, questionIndex, taskId);
            if (currentQuestionIndex != null && currentTaskId != null && (questionIndex != currentQuestionIndex || taskId != currentTaskId)) {
                var cacheTaskId = currentTaskId;
                var cacheQuestionIndex = currentQuestionIndex;
                var msg = { "questionNo": Number(currentQuestionIndex) + 1, "questionPackageNo": Number(cacheTaskId), "autditor": getUserNumber() };

                sendToServer(msg, "ucAuditStatic/add", true, function () {
                    show("完成了答题，题包:" + cacheTaskId + ",题号:" + (Number(cacheQuestionIndex) + 1)); // 获取的题号是0开始的
                    checkConsistency(msg.questionPackageNo, msg.questionNo - 1);
                });
            }
            currentQuestionIndex = null;
            currentTaskId = null;
            return;
        }

    },
    { urls: ["http://discover.sm.cn/*"] },
    ["requestBody"]
);