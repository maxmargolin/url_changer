var ruleList = [];
var redirectUrl = '';
var loadedTab;
var options = {enabled: true};
var loggedIn = false;


function setTab(tab)
{
        loadedTab = tab;
}

function setState(state)
{
        options.enabled = state;
}

function setLogInState(state)
{
        loggedIn = state;
}

function getLogInState()
{
        return loggedIn;
}


function filterRequest(details){
        const regex = /.*((www.haaretz.co.il)|(www.themarker.com))\/.+$/g;
        const found = details.url.match(regex);
        if(found!=null) {
                if (!details.url.includes("vercel") && found.length > 0) {
                        return {redirectUrl: "https://haaretz.vercel.app/api/?url=" + details.url};
                }
        }
        return {cancel: false};
}


chrome.webRequest.onBeforeRequest.addListener(
    function (details){ return filterRequest(details);},
    {urls: ["<all_urls>"],
            types: ["main_frame", "stylesheet", "xmlhttprequest", "other"]},
    ["blocking"]
);


chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        console.log(sender.tab ? "redirect called from:" + sender.tab.url : "redirect called anonymously?");
        if (request.redirect) {
                chrome.windows.getCurrent(function(w){
                        chrome.tabs.update(loadedTab.id, {
                                "url": redirectUrl
                        });
                });
        }
        sendResponse({
                redirected: redirectUrl
        });
});
