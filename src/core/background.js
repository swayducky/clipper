
chrome.action.onClicked.addListener(async function (tab) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: [
            "lib/webbrowser-polyfill.js",
            "lib/jquery.js",
            "lib/rangy.js",
            "lib/moment.js",
            "lib/turndown.js",
        ]
    }, () => {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['run.js']
        })
    })
});

chrome.runtime.onMessage.addListener(async function listener(result) {
});

// On install, open the options page
chrome.runtime.onInstalled.addListener(function (object) {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: chrome.runtime.getURL("options.html") }, function (tab) {});
    }
});
