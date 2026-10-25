import { getApiKey, setApiKey, breakDownTask } from "./api.js";
import { getHistory, addHistory, formatTime } from "./history.js";

const taskInput = document.getElementById("taskInput");
const breakBtn = document.getElementById("breakBtn");
const resultSection = document.getElementById("resultSection");
const resultCard = document.getElementById("resultCard");
const retryBtn = document.getElementById("retryBtn");
const historyList = document.getElementById("historyList");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const apiKeyInput = document.getElementById("apiKeyInput");

const toastContainer = document.getElementById("toastContainer");

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderResult(result) {
    resultCard.innerHTML = "";

    const firstStepDiv = document.createElement("div");
    firstStepDiv.className = "first-step";
    firstStepDiv.innerHTML = `<span class="label">先做这一步就好</span>${escapeHtml(result.firstStep)}`;
    resultCard.appendChild(firstStepDiv);

    if (result.steps?.length) {
        const ol = document.createElement("ol");
        result.steps.forEach((step) => {
            const li = document.createElement("li");
            li.textContent = step;
            ol.appendChild(li);
        });
        resultCard.appendChild(ol);
    }

    if (result.note) {
        const note = document.createElement("p");
        note.className = "note";
        note.textContent = result.note;
        resultCard.appendChild(note);
    }

    resultSection.classList.remove("hidden");
    retryBtn.classList.remove("hidden");
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = "";

    if (!history.length) {
        historyList.innerHTML = '<p class="hint">还没有记录</p>';
        return;
    }

    history.forEach((item) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `<span class="task-name">${escapeHtml(item.task)}</span><span class="task-time">${formatTime(item.time)}</span>`;
        historyList.appendChild(div);
    });
}

async function handleBreakDown() {
    const taskText = taskInput.value.trim();

    if (!taskText) {
        showToast("先写点什么吧");
        return;
    }

    breakBtn.disabled = true;
    breakBtn.textContent = "拆解中...";

    try {
        const result = await breakDownTask(taskText);
        renderResult(result);
        addHistory(taskText, result);
        renderHistory();
    } catch (err) {
        showToast(err.message || "出错了，再试一次");
    } finally {
        breakBtn.disabled = false;
        breakBtn.textContent = "帮我拆解";
    }
}

breakBtn.addEventListener("click", handleBreakDown);
retryBtn.addEventListener("click", handleBreakDown);

settingsBtn.addEventListener("click", () => {
    apiKeyInput.value = getApiKey();
    settingsPanel.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
    setApiKey(apiKeyInput.value.trim());
    settingsPanel.classList.add("hidden");
    showToast("已保存");
});

renderHistory();
