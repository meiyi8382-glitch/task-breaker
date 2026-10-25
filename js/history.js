import { STORAGE_KEYS } from "./config.js";

const MAX_HISTORY = 20;

export function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
    } catch (_) {
        return [];
    }
}

export function addHistory(taskText, result) {
    const history = getHistory();
    history.unshift({
        task: taskText,
        result,
        time: new Date().toISOString()
    });
    localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        JSON.stringify(history.slice(0, MAX_HISTORY))
    );
}

export function formatTime(isoString) {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
