chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "authUser") {
        chrome.identity.getAuthToken({ interactive: true }, async function (token) {
            if (chrome.runtime.lastError || !token) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
                return;
            }

            try {
                const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                const data = await res.json();

                if (!data.messages || data.messages.length === 0) {
                    sendResponse({ success: true, data: [] });
                    return;
                }

                const messages = await Promise.all(
                    data.messages.slice(0, 10).map(async (msg) => {
                        const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            }
                        });

                        const msgDetail = await res.json();
                        const headers = msgDetail.payload?.headers || [];

                        //   info with fallback defaults
                        const getHeader = (name) =>
                            headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "Not found";

                        const subject = getHeader("Subject");
                        const from = getHeader("From");
                        const date = getHeader("Date");

                        return { subject, from, date };
                    })
                );

                
                sendResponse({ success: true, data: messages });

            } catch (err) {
                console.error("Error fetching Gmail data:", err);
                sendResponse({ success: false, error: err });
            }
        });

        return true;
    }
});
