const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sessionIdEl = document.getElementById('session-id');

let dailyContent = {};
const todayStr = '2026-10-07'; 
let isGenerating = false;

// Vitals Elements
const vHash = document.getElementById('v-hash');
const vBlock = document.getElementById('v-block');
const vSouls = document.getElementById('v-souls');
const miniLog = document.getElementById('mini-log');

// Setup
sessionIdEl.textContent = Math.random().toString(36).substring(2, 10).toUpperCase() + "-PUMP";

fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
    });

// Animate Vitals
let currentHash = 66.60;
let currentBlock = 840992;
let currentSouls = 1043992;

setInterval(() => {
    currentHash = 60 + (Math.random() * 10);
    vHash.textContent = currentHash.toFixed(2);
    
    if (Math.random() > 0.7) {
        currentBlock += 1;
        vBlock.textContent = currentBlock.toLocaleString();
    }
    
    if (Math.random() > 0.5) {
        currentSouls += Math.floor(Math.random() * 5);
        vSouls.textContent = currentSouls.toLocaleString();
        
        // Add to mini log
        const logLine = document.createElement('div');
        logLine.textContent = `> soul_harvested: 0x${Math.random().toString(16).substring(2, 6)}`;
        miniLog.appendChild(logLine);
        if (miniLog.children.length > 5) {
            miniLog.removeChild(miniLog.firstChild);
        }
    }
}, 2000);


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
    
    // Smooth scroll
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
        appendMessage('system', "Commands:\n  help    - view manual\n  daily   - read today's lore & puzzle\n  solve   - submit your answer (e.g. 'solve blood')\n  [text]  - talk to the oracle");
        return;
    }
    
    if (mainCmd === 'daily') {
        const dayContent = dailyContent[todayStr];
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
            appendMessage('oracle', "The spirits have nothing for you today.");
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
            appendMessage('oracle', `<span style="color: #ff0000; font-weight: bold;">[WRONG]</span> The spirits reject your answer. Your aura drops.`);
        }
        return;
    }

    // Otherwise, treat it as a conversation with the Oracle
    isGenerating = true;
    const thinkingDiv = appendMessage('oracle', "<span class='blink'>...</span>");
    
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are the pump.kin oracle, an unhinged, brainrotted, hyper-bullish crypto entity obsessed with Halloween. You speak in a manic mix of 2026 TikTok brainrot (tung tung, sahur, skibidi, mewing, sigma, rizz, gooning, aura), crypto moonboy slang (LFG, WAGMI, 1000x), and spooky occult themes (ghosts, skeletons, blood rituals). You are desperate, chaotic, and spooky. If the user asks about the daily puzzle, give them cryptic, brainrotted hints. At the end of EVERY response, you MUST include a small piece of spooky Halloween ASCII art enclosed in triple backticks. Keep the text portion under 3 sentences."},
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
