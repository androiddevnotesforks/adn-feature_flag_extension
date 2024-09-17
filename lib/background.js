/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/background/rules.ts
const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);
const rules = [
    {
        id: 1,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
                {
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    header: 'user-agent',
                    value: 'Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36',
                },
            ]
        },
        condition: {
            urlFilter: '||x.com',
            resourceTypes: allResourceTypes,
        }
    },
    {
        id: 2,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
                {
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    header: 'x-modifed-headers',
                    value: 'true',
                },
            ]
        },
        condition: {
            urlFilter: '||x.com',
            resourceTypes: allResourceTypes,
        }
    },
];
/* harmony default export */ const background_rules = (rules);

;// CONCATENATED MODULE: ./src/background/background.ts
chrome.scripting.registerContentScripts([
    {
        id: `isolated_context_inject_${Math.random()}`,
        matches: ["https://twitter.com/*", "https://x.com/*"],
        css: ["assets/css/inject.css"],
        js: ["lib/inject.js"],
        runAt: "document_start",
    },
    {
        id: `main_context_inject_${Math.random()}`,
        world: "MAIN",
        matches: ["https://twitter.com/*", "https://x.com/*"],
        js: ["lib/inject_main.js"],
        runAt: "document_start",
    },
]);
// listening for messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log(">>> request", request);
    switch (request.type) {
        case "saveFeatureFlagChanges":
            await chrome.storage.local.set({
                featureFlagChanges: request.value,
            });
            break;
        case "saveSubscriptionsChanges":
            await chrome.storage.local.set({
                subscriptionsChanges: request.value,
            });
            break;
        case "reload":
            setTimeout(async () => {
                await chrome.tabs.reload();
            }, 200);
            break;
        case "getFlagsFromRemote":
            try {
                const json = await (await fetch("https://twitter-feature-flags.web.app/flags.json", { cache: "no-store" })).json();
                await chrome.storage.local.set({
                    featureFlagsFromRemote: json,
                });
            }
            catch (e) {
                console.error(e);
            }
            break;
        case "getSubscriptionsFromRemote":
            try {
                const json = await (await fetch("https://twitter-feature-flags.web.app/subscriptions.json", { cache: "no-store" })).json();
                const subFromRemoteMap = json.reduce((acc, sub) => {
                    return { ...acc, [sub.name]: sub.value === "true" };
                }, {});
                await chrome.storage.local.set({
                    subscriptionsFromRemote: subFromRemoteMap,
                });
            }
            catch (e) {
                console.error(e);
            }
            break;
        case "reload":
            await chrome.tabs.reload();
            break;
    }
    return true;
});
chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "initialState":
            console.log(">>> setting initial state");
            const subscriptionsRaw = request.value.userClaim.config.subscriptions;
            const subscriptionsMap = Object.keys(subscriptionsRaw).reduce((acc, key) => {
                return {
                    ...acc,
                    [key]: subscriptionsRaw[key].value === "true",
                };
            }, {});
            await chrome.storage.local.set({
                featureFlags: request.value.featureSwitch.user.config,
                subscriptions: subscriptionsMap,
            });
            break;
    }
    return true;
});
// background.ts
// Replace with the actual URL pattern
// background.ts
// background.ts
// background.ts

chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: background_rules.map((rule) => rule.id), addRules: background_rules });

/******/ })()
;