const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sessionIdEl = document.getElementById('session-id');

let dailyContent = {};
const today = new Date();
const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
let isGenerating = false;

// Vitals Elements
const vHarvest = document.getElementById('v-harvest');
const vCountdown = document.getElementById('v-countdown');

// Calculate days until Halloween
function updateCountdown() {
    const today = new Date();
    const halloween = new Date(today.getFullYear(), 9, 31); // Month is 0-indexed, so 9 is Oct
    if (today > halloween) {
        halloween.setFullYear(halloween.getFullYear() + 1);
    }
    const diffTime = Math.abs(halloween - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    vCountdown.textContent = `${diffDays} DAYS`;
}
updateCountdown();

// Animate Fake Harvest (We can hook this to actual SOL later)
let currentHarvest = 4.20;

setInterval(() => {
    if (Math.random() > 0.7) {
        currentHarvest += (Math.random() * 0.5);
        vHarvest.textContent = currentHarvest.toFixed(2) + " SOL";
    }
}, 3000);

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
    
    setTimeout(() => {
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
    }, 10);
    
    return div;
}

function handleCommand(cmd) {
    const args = cmd.trim().split(/\s+/);
    const mainCmd = args[0].toLowerCase();
    const subCmd = args.slice(1).join(' ').toLowerCase();
    
    if (mainCmd === 'help') {
        appendMessage('system', "Commands:\n  help    - view manual\n  daily   - read today's transmission\n  solve   - submit puzzle answer\n  [text]  - ask the oracle");
        return;
    }
    
    if (mainCmd === 'daily') {
        let dayContent = dailyContent[todayStr];
        if (!dayContent) {
            // Fallback to the first available ritual if timezone issues prevent an exact match
            const firstKey = Object.keys(dailyContent)[0];
            dayContent = dailyContent[firstKey];
        }
        
        if (dayContent) {
            let res = `\n--- ${dayContent.title} ---\n\n`;
            res += `LORE:\n${dayContent.lore}\n\n`;
            res += `WISDOM:\n${dayContent.wisdom}\n\n`;
            res += `PUZZLE:\n${dayContent.puzzle_hint}\n`;
            
            if (dayContent.mediaType === 'image') {
                res += `<div class="media-container"><img src="${dayContent.mediaSrc}"></div>`;
            } else if (dayContent.mediaType === 'video') {
                res += `<div class="media-container"><video src="${dayContent.mediaSrc}" controls autoplay loop muted></video></div>`;
            }
            appendMessage('oracle', res);
        } else {
            appendMessage('oracle', "The spirits have nothing for you today. Keep holding.");
        }
        return;
    }

    if (mainCmd === 'solve') {
        const dayContent = dailyContent[todayStr];
        if (!dayContent) {
            appendMessage('system', "No active puzzle today.");
            return;
        }
        if (!subCmd) {
            appendMessage('system', "Usage: solve <answer>");
            return;
        }
        if (subCmd === dayContent.answer.toLowerCase()) {
            appendMessage('oracle', `<span style="color: #00ff00; font-weight: bold;">[CORRECT]</span> ${dayContent.success_msg}`);
        } else {
            appendMessage('oracle', `<span style="color: #ff0000; font-weight: bold;">[WRONG]</span> The spirits reject you. Do not become a jeet.`);
        }
        return;
    }

    isGenerating = true;
    const thinkingDiv = appendMessage('oracle', "<span class='blink'>...</span>");
    
    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "messages": [
                {"role": "user", "content": cmd}
            ]
        })
    })
    .then(async res => {
        const data = await res.json();
        
        // Log actual API error to screen if it fails
        if (data.error) {
            thinkingDiv.innerHTML = `<span style="color:red">API ERROR: ${data.error.message || JSON.stringify(data.error)}</span>`;
            isGenerating = false;
            chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
            return;
        }
        
        let reply = data.choices && data.choices[0] && data.choices[0].message.content
                        ? data.choices[0].message.content 
                        : "error: oracle returned empty payload.";
        
        // Escape HTML
        reply = reply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Replace markdown code blocks with our ascii-art span
        reply = reply.replace(/```([\s\S]*?)```/g, '<span class="ascii-art">$1</span>');
        
        thinkingDiv.innerHTML = reply;
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
        isGenerating = false;
    })
    .catch(err => {
        thinkingDiv.innerHTML = `<span style="color:red">NETWORK ERROR: ${err.message}</span>`;
        isGenerating = false;
    });
}
