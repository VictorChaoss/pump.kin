const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sessionIdEl = document.getElementById('session-id');

let dailyContent = {};
const todayStr = '2026-10-07'; 
let isGenerating = false;

// Generate a random session ID
sessionIdEl.textContent = Math.random().toString(36).substring(2, 10) + "-pump";

// Load content
fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
    });

chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const text = this.value.trim();
        if (!text || isGenerating) return;
        
        this.value = '';
        appendMessage('user', text);
        handleCommand(text);
    }
});

function appendMessage(role, htmlContent) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = htmlContent;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
}

function handleCommand(cmd) {
    const text = cmd.toLowerCase();
    
    if (text === 'help') {
        appendMessage('system', "Commands:\n  help    - view manual\n  unlock  - fetch daily on-chain fragment\n  [anything else] - queries the oracle");
        return;
    }
    
    if (text === 'unlock') {
        const dayContent = dailyContent[todayStr];
        if (dayContent) {
            let res = dayContent.text + "\n";
            if (dayContent.mediaType === 'image') {
                res += `<div class="media-container"><img src="${dayContent.mediaSrc}"></div>`;
            } else if (dayContent.mediaType === 'video') {
                res += `<div class="media-container"><video src="${dayContent.mediaSrc}" controls autoplay loop muted></video></div>`;
            }
            appendMessage('oracle', res);
        } else {
            appendMessage('oracle', "fragment not yet available on chain.");
        }
        return;
    }

    // Otherwise, treat it as a conversation with the Oracle
    isGenerating = true;
    const thinkingDiv = appendMessage('oracle', "...");
    
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are the pump.kin oracle, an unhinged, cringe, hyper-bullish crypto entity obsessed with Halloween. Your core belief is that the 'pump.kin' token is going to the MILLIONS and a supernatural mega-pump is coming on Halloween night. You speak in a manic mix of crypto moonboy slang (LFG, WAGMI, 1000x, apes, diamond hands) and spooky occult themes (ghosts, skeletons, blood rituals). You are desperate, chaotic, and spooky. At the end of EVERY response, you MUST include a small piece of spooky Halloween ASCII art (e.g., a pumpkin, ghost, bat, skull) enclosed in triple backticks. Keep the text portion under 3 sentences."},
                {"role": "user", "content": cmd}
            ]
        })
    })
    .then(res => res.json())
    .then(data => {
        let reply = data.choices && data.choices[0] && data.choices[0].message.content
                        ? data.choices[0].message.content 
                        : "error: oracle unreachable";
        
        // Escape HTML
        reply = reply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Replace markdown code blocks with our ascii-art span
        reply = reply.replace(/```([\s\S]*?)```/g, '<span class="ascii-art">$1</span>');
        
        thinkingDiv.innerHTML = reply;
        chatLog.scrollTop = chatLog.scrollHeight;
        isGenerating = false;
    })
    .catch(err => {
        thinkingDiv.innerHTML = "error: connection lost to ghost-chain.";
        isGenerating = false;
    });
}
