const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const inputContainer = document.getElementById('input-container');
const bootScreen = document.getElementById('boot-screen');
const terminal = document.getElementById('terminal');
const bootDetails = document.getElementById('boot-details');

let dailyContent = {};
const todayStr = '2026-10-07'; 
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

// Fast authentic boot sequence
const bootLines = [
    "CHECKING NVRAM ..................... OK",
    "LOADING KERNEL MODS ................ OK",
    "MOUNTING GHOST CHAIN ............... /dev/hda1",
    "READING BLOCKCHAIN STATE ........... BLK 666",
    "ESTABLISHING ORACLE LINK ........... SECURE",
    "DECRYPTING VEIL PROTOCOLS .......... DONE",
    " ",
    "READY."
];

// Start
fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
        setTimeout(runBiosBoot, 1000);
    })
    .catch(error => {
        setTimeout(runBiosBoot, 1000);
    });

function runBiosBoot() {
    let lineIdx = 0;
    
    function nextLine() {
        if (lineIdx < bootLines.length) {
            bootDetails.innerHTML += bootLines[lineIdx] + "<br>";
            lineIdx++;
            setTimeout(nextLine, Math.random() * 100 + 50); // fast bios text
        } else {
            setTimeout(switchToTerminal, 800);
        }
    }
    nextLine();
}

function switchToTerminal() {
    bootScreen.style.display = 'none';
    terminal.style.display = 'flex';
    
    // Clear terminal history if needed, but we start fresh
    printInstant("pump.kin OS v6.6.6 [Terminal Access Granted]");
    printInstant("Type 'help' for available commands.\n");
    
    inputContainer.classList.add('visible');
    commandInput.focus();
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
        
        printInstant(`oracle@pump.kin:~$ ${command}`);
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

document.addEventListener('click', () => {
    if (!isTyping) commandInput.focus();
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
                    // Very fast typing for authenticity
                    const speed = line.length > 50 ? 1 : Math.random() * 10 + 5;
                    div.innerHTML += line.charAt(charIndex);
                    charIndex++;
                    scrollToBottom();
                    setTimeout(typeChar, speed);
                } else {
                    lineIndex++;
                    setTimeout(typeNextLine, 50);
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
    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(cmd) {
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();
    const subCmd = args.slice(1).join(' ');

    let responseLines = [];

    switch(mainCmd) {
        case 'help':
            responseLines = [
                "Terminal Commands:",
                "  help    - Display this manual",
                "  date    - Synchronize block time",
                "  unlock  - Decrypt today's on-chain truth",
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
                runTypingEffect(["BLOCK NOT YET MINED.", "CHECK BACK TOMORROW."]);
            }
            break;
        case 'ask':
            if (!subCmd) {
                runTypingEffect(["You must offer a query to the oracle."]);
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
                                        : "SYSTEM ERROR: ORACLE IS CORRUPTED";
                        
                        if (!reply.includes('<span class=')) {
                            reply = reply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        
                        runTypingEffect(["<pre style='font-family: inherit; font-size: inherit; margin: 0; white-space: pre-wrap;'>" + reply + "</pre>"]);
                    })
                    .catch(err => {
                        runTypingEffect(["CONNECTION TO ETHER LOST."]);
                    });
                });
            }
            break;
        case 'sudo':
            runTypingEffect(["YOU DO NOT HAVE THE PRIVATE KEYS FOR THIS."]);
            break;
        default:
            runTypingEffect([`Command not recognized: ${mainCmd}`]);
    }
}
