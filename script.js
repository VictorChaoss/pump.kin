const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const inputContainer = document.getElementById('input-container');
const bootScreen = document.getElementById('boot-screen');
const dashboard = document.getElementById('dashboard');
const mempoolStream = document.getElementById('mempool-stream');

let dailyContent = {};
const todayStr = '2026-10-07'; 
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

// Boot sequence messages
const bootSequence = [
    "INITIALIZING PUMP.KIN KERNEL...",
    "SYNCING GHOST-CHAIN LEDGER ................. [OK]",
    "VERIFYING CRYPTOGRAPHIC RITUALS ............ [OK]",
    "MOUNTING /dev/souls ........................ [OK]",
    "DECRYPTING THE VEIL ........................ [WARNING: LEAK DETECTED]",
    "CONNECTION TO THE ETHER ESTABLISHED.",
    " ",
    "<span class='glitch' style='font-size: 1.2em; font-weight: bold;'>WELCOME TO THE SÉANCE.</span>",
    "Type 'help' to view the manifesto."
];

// Start
fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
        setTimeout(startBootSequence, 2000); // Wait 2s on giant ASCII pumpkin
    })
    .catch(error => {
        setTimeout(startBootSequence, 2000);
    });

function startBootSequence() {
    bootScreen.style.display = 'none';
    dashboard.style.display = 'grid';
    startMempoolStream();
    
    isTyping = true;
    let i = 0;
    
    function nextLine() {
        if (i < bootSequence.length) {
            printInstant(bootSequence[i]);
            i++;
            setTimeout(nextLine, Math.random() * 200 + 50);
        } else {
            isTyping = false;
            inputContainer.classList.add('visible');
            commandInput.focus();
            scrollToBottom();
        }
    }
    nextLine();
}

commandInput.addEventListener('keydown', function(e) {
    if (isTyping) {
        e.preventDefault();
        return;
    }

    if (e.key === 'Enter') {
        const command = this.value.trim();
        if (!command) return;
        
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        this.value = '';
        
        printInstant(`<span style="color: #fff">oracle@pump.kin/mempool:~#</span> ${command}`);
        processCommand(command);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            this.value = '';
        }
    }
});

document.addEventListener('click', (e) => {
    if (!isTyping && e.target.tagName !== 'VIDEO') commandInput.focus();
});

function runTypingEffect(lines, callback) {
    isTyping = true;
    inputContainer.style.opacity = '0'; 
    
    let lineIndex = 0;
    
    function typeNextLine() {
        if (lineIndex < lines.length) {
            const line = lines[lineIndex];
            const div = document.createElement('div');
            div.className = 'output-line';
            outputDiv.appendChild(div);
            
            if (line.includes('<div') || line.includes('<span') || line.includes('<pre>')) {
                div.innerHTML = line;
                lineIndex++;
                scrollToBottom();
                setTimeout(typeNextLine, 100);
                return;
            }

            let charIndex = 0;
            function typeChar() {
                if (charIndex < line.length) {
                    // Type faster if the line is super long (like ASCII art)
                    const speed = line.length > 50 ? 2 : Math.random() * 20 + 10;
                    div.innerHTML += line.charAt(charIndex);
                    charIndex++;
                    scrollToBottom();
                    setTimeout(typeChar, speed);
                } else {
                    lineIndex++;
                    setTimeout(typeNextLine, 100);
                }
            }
            typeChar();
        } else {
            isTyping = false;
            inputContainer.style.opacity = '1';
            commandInput.focus();
            if (callback) callback();
        }
    }
    typeNextLine();
}

function printInstant(htmlContent) {
    const div = document.createElement('div');
    div.className = 'output-line';
    div.innerHTML = htmlContent;
    outputDiv.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const wrapper = document.querySelector('.terminal');
    wrapper.scrollTop = wrapper.scrollHeight;
}

function processCommand(cmd) {
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();
    const subCmd = args.slice(1).join(' ');

    let responseLines = [];

    switch(mainCmd) {
        case 'help':
            responseLines = [
                "Terminal Commands // V 0.6.6",
                "  help    - Display the manifesto",
                "  date    - Synchronize block time",
                "  unlock  - Decrypt today's on-chain truth",
                "  wallet  - View cryptographic soul balance",
                "  ask     - Query the oracle (e.g., 'ask what happens on halloween')",
                "  clear   - Purge terminal memory"
            ];
            runTypingEffect(responseLines);
            break;
        case 'date':
            runTypingEffect([`CURRENT BLOCK DATE: ${todayStr}`, "THE HALVING OF SOULS IS IMMINENT."]);
            break;
        case 'clear':
            outputDiv.innerHTML = '';
            scrollToBottom();
            break;
        case 'wallet':
            responseLines = [
                "CONNECTING TO WALLET...",
                "ADDRESS: 0xDeadBeef...666",
                "BALANCE: 0.00000000 $PUMPKIN",
                "STATUS: <span class='glitch' style='color: var(--error-color)'>LIQUIDATED</span>"
            ];
            runTypingEffect(responseLines);
            break;
        case 'unlock':
            const dayContent = dailyContent[todayStr];
            if (dayContent) {
                let lines = ["DECRYPTING ON-CHAIN DATA..."];
                lines.push(dayContent.text);
                
                if (dayContent.mediaType === 'image') {
                    lines.push(`<div class="media-container"><img src="${dayContent.mediaSrc}" alt="Truth Fragment"></div>`);
                } else if (dayContent.mediaType === 'video') {
                    lines.push(`<div class="media-container"><video src="${dayContent.mediaSrc}" controls autoplay loop></video></div>`);
                }
                runTypingEffect(lines);
            } else {
                runTypingEffect(["<span class='glitch' style='color: var(--error-color)'>BLOCK NOT YET MINED.</span>", "CHECK BACK TOMORROW."]);
            }
            break;
        case 'ask':
            if (!subCmd) {
                runTypingEffect(["You must offer a query to the oracle. Example: 'ask what happens on halloween'"]);
            } else {
                runTypingEffect(["CONSULTING THE ON-CHAIN ORACLE...", "..."], () => {
                    fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer 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",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "meta-llama/llama-3.1-8b-instruct:free",
                            "messages": [
                                {"role": "system", "content": "You are the pump.kin oracle, an unhinged, cringe, hyper-bullish crypto entity obsessed with Halloween. Your core belief is that the 'pump.kin' token is going to the MILLIONS and a supernatural mega-pump is coming on Halloween night. You speak in a manic mix of crypto moonboy slang (LFG, WAGMI, 1000x, apes, diamond hands) and spooky occult themes (ghosts, skeletons, blood rituals). You are desperate, chaotic, and spooky. At the end of EVERY response, you MUST include a small piece of spooky Halloween ASCII art (e.g., a pumpkin, ghost, bat, skull). Keep the text portion under 3 sentences."},
                                {"role": "user", "content": subCmd}
                            ]
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        let reply = data.choices && data.choices[0] && data.choices[0].message.content
                                        ? data.choices[0].message.content 
                                        : "<span class='glitch'>SYSTEM ERROR: ORACLE IS CORRUPTED</span>";
                        
                        if (!reply.includes('<span class=')) {
                            reply = reply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        
                        // We wrap the response in pre tags so the ASCII art preserves spaces exactly
                        runTypingEffect(["<pre style='font-family: inherit; font-size: inherit; margin: 0; white-space: pre-wrap;'>" + reply + "</pre>"]);
                    })
                    .catch(err => {
                        runTypingEffect(["<span class='glitch' style='color: var(--error-color)'>CONNECTION TO ETHER LOST.</span>"]);
                    });
                });
            }
            break;
        case 'sudo':
            runTypingEffect(["<span style='color: var(--error-color)'>YOU DO NOT HAVE THE PRIVATE KEYS FOR THIS.</span>"]);
            break;
        default:
            runTypingEffect([`Command not recognized by the network: ${mainCmd}`]);
    }
}

// Fake Mempool Stream Generator
function startMempoolStream() {
    const actions = ["LIQUIDATED", "BURNED", "SACRIFICED", "STAKED", "RUGGED"];
    const entities = ["0x8a...9f", "0xdead...beef", "WALLET_99", "Satoshi_Ghost", "Whale_77", "0x13...666"];
    
    function addStreamLine() {
        if (mempoolStream.children.length > 30) {
            mempoolStream.removeChild(mempoolStream.firstChild);
        }
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entity = entities[Math.floor(Math.random() * entities.length)];
        const amt = (Math.random() * 100).toFixed(2);
        
        const line = document.createElement('div');
        line.className = 'mempool-line';
        
        let color = '#ff5500';
        if (action === "LIQUIDATED" || action === "RUGGED") color = 'var(--error-color)';
        
        line.innerHTML = `<span style="color: ${color}">[${action}]</span> ${entity} - ${amt} $PUMP`;
        mempoolStream.appendChild(line);
        
        setTimeout(addStreamLine, Math.random() * 2000 + 200);
    }
    
    addStreamLine();
}
