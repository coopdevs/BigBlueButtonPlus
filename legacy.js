let raise = false;
let btn, baseElement, hand, delay, cleanDelay, messageBar;
let user = [];
const defaultId = 8;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        baseElement = document.getElementsByClassName("buttonWrapper--x8uow button--295UAi")[0];
        if (typeof baseElement !== 'undefined') {
            clearInterval(initTimer);
            console.info("[BBB+] Loading BigBlueButton+");
            document.title = "BigBlueButton+ Meeting";
            if (isMod()) {
                loadHandRaise(true);
                startObserver();
            } else {
                loadHandRaise(false);
            }

            loadMessageBar();

            function addMessageBar() {
                document.getElementsByClassName("chatListItemLink--Z26YVGA")[0].addEventListener("click", function () {
                    if (typeof document.getElementsByClassName("chat--111wNM")[0] === "undefined") setTimeout(function () {
                        document.getElementsByClassName("chat--111wNM")[0].children[1].append(messageBar);
                    }, 100);
                });
            }

            addMessageBar();

            mutationObserver.observe(document.getElementsByClassName("userAvatar--1GxXQi")[0], {
                attributes: true,
                childList: true,
                subtree: true
            });

            //check for hand icon on new bbb
        } else if (typeof document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0] !== 'undefined') {
            clearInterval(initTimer);

            //Automatic hand lowering on unmute (doesn't work after audio rejoin)
            let handBtn = document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0];
            let micBtn = document.getElementsByClassName("icon--2q1XXw icon-bbb-mute")[0];
            micBtn.addEventListener("click", function () {
                if (micBtn.classList.contains("icon-bbb-mute")) {
                    if (!handBtn.parentElement.classList.contains("ghost--Z136aiN")) {
                        handBtn.click();
                    }
                }
            });
        } else if (counter === 45) {
            clearInterval(initTimer);
            console.error("[BBB+] Couldn't load BigBlueButtonPlus");
            console.error("[BBB+] Please report this on GitHub https://github.com/Jo0001/BigBlueButtonPlus/issues");
        } else {
            counter++;
        }
    }, 4000);//every 4sec
}

init();

function isMod() {
    return (document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].classList.contains("moderator--24bqCT") || document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].classList.contains("presenter--Z1INqI5"));
}

function loadHandRaise(invisible) {
    try {
        btn = document.createElement("button");
        btn.innerHTML = '<svg height="24" width="24" id="hand" viewBox="0 0 32 32" style="margin-left: -3px"><path d="M30.688 7.313v19.375c0 2.938-2.438 5.313-5.375 5.313h-9.688a5.391 5.391 0 01-3.813-1.563L1.312 19.75S3 18.125 3.062 18.125a1.7 1.7 0 011.063-.375c.313 0 .563.063.813.188.063 0 5.75 3.25 5.75 3.25V5.313c0-1.125.875-2 2-2s2 .875 2 2v9.375h1.313V2c0-1.125.875-2 2-2s2 .875 2 2v12.688h1.313V3.313c0-1.125.875-2 2-2s2 .875 2 2v11.375h1.375V7.313c0-1.125.875-2 2-2s2 .875 2 2z"></path></svg>';
        btn.style = "background: white; cursor: pointer;border: 2px solid white;border-radius: 50px;";
        btn.onclick = toggle;
        btn.title = "Hand heben";
        baseElement.parentElement.append(btn);
        hand = document.getElementById("hand");
        if (invisible) btn.style.display = "none";
    } catch (e) {
        console.error("[BBB+] Error on loadHandRaise() " + e);
    }
}

function loadMessageBar() {
    messageBar = document.createElement("div");
    messageBar.className = "systemMessage--ZYspJQ";
    messageBar.style.display = "none";
    document.getElementsByClassName("chat--111wNM")[0].children[1].append(messageBar);
}

function startObserver() {
    raiseObserver.observe(document.getElementsByClassName("list--Z2pj65C")[2], {
        attributes: true,
        subtree: true
    });
}

function startAutoTimeout() {
    let min = 2.5;
    delay = setInterval(function () {
        if (confirm("Du streckst seit " + min + "min \nHand herunternehmen?")) {
            clearInterval(delay)
            lowerHand();
        } else {
            min += 2.5;
        }
    }, 150000);//2,5min
}

function toggle() {
    if (!raise) {
        //raise hand
        document.getElementsByClassName("item--yl1AH")[6].click();
        document.getElementsByClassName("item--yl1AH")[getItem()].click();
        btn.title = "Hand herunternehmen";
        hand.style.fill = "#0F70D7";
        raise = true;
        startAutoTimeout();
    } else {
        lowerHand();
        clearTimeout(delay);
    }
}

function lowerHand() {
    //clear
    document.getElementsByClassName("item--yl1AH")[7].click();
    btn.title = "Hand heben";
    hand.style.fill = "black";
    raise = false;
}

function fakeLowerHand() {
    clearTimeout(delay);
    btn.title = "Hand heben";
    hand.style.fill = "black";
    raise = false;
}

const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
            //mod/presenter change test
            if (mutation.target.classList.contains("avatar--Z2lyL8K")) {
                if (mutation.target.classList.contains("moderator--24bqCT") || mutation.target.classList.contains("presenter--Z1INqI5")) {
                    fakeLowerHand();
                    btn.style.display = "none";
                    startObserver();
                } else {
                    btn.style.display = "block";
                    messageBar.style.display = "none";
                    raiseObserver.disconnect()
                }
                //normal user unmute check
            } else if (mutation.target.classList.contains("talking--2eGaCj") && !isMod()) {
                if (raise) {
                    lowerHand();
                }
            }
        } else if (mutation.type === "childList") {
            if (mutation.removedNodes.length > 0) {
                try {
                    //check if the hand was cleared from a foreign source
                    if (mutation.removedNodes.item(0).classList[0].startsWith("icon")) {
                        fakeLowerHand();
                    }
                } catch (ignored) {
                }
            }
        }
    });
});

const raiseObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
            try {
                if (mutation.target.getAttribute("aria-label").includes("raiseHand")) {
                    let name = mutation.target.getAttribute("aria-label").split("   ")[0];
                    console.info(name + " has raised his hand");
                    if (user.indexOf(name) === -1) {
                        user.unshift(name);
                        if (user.length > 3) user.pop();
                    }
                    messageBar.innerText = user + ((user.length === 1) ? " streckt" : " strecken") + " derzeit";
                    messageBar.style.display = "block";
                    clearTimeout(cleanDelay);
                    cleanDelay = setTimeout(function () {
                        messageBar.style.display = "none";
                        user = [];
                    }, 30000);
                }
            } catch (ignored) {
            }
        }
    });
});

/**
 * @deprecated since version 1.2.5 and will be removed in a future version
 */
function getItem() {
    let fromLocal = localStorage.getItem("bbb_plus_id");
    if (fromLocal !== null && !isNaN(parseInt(fromLocal))) {
        return parseInt(fromLocal);
    } else {
        return defaultId;
    }
}