const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const inputContainer = document.getElementById('input-container');

let dailyContent = {};
const todayStr = '2026-10-07'; // For testing based on current date
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

// Boot sequence messages - Crypto x Occult theme
const bootSequence = [
    "INITIALIZING PUMP.KIN KERNEL...",
    "SYNCING GHOST-CHAIN LEDGER ................. [OK]",
    "VERIFYING CRYPTOGRAPHIC RITUALS ............ [OK]",
    "MOUNTING /dev/souls ........................ [OK]",
    "DECRYPTING THE VEIL ........................ [WARNING: LEAK DETECTED]",
    "CONNECTION TO THE ETHER ESTABLISHED.",
    " ",
    "<span class='glitch'>WELCOME TO THE TRUTH_TERMINAL.</span>",
    "Type 'help' to view the manifesto."
];

// Load content and start boot sequence
fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
        runBootSequence();
    })
    .catch(error => {
        runTypingEffect(["ERROR: THE SMART CONTRACT IS CURSED. COULD NOT LOAD CORE."], () => {
            inputContainer.classList.add('visible');
            commandInput.focus();
        });
    });

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

document.addEventListener('click', () => {
    if (!isTyping) commandInput.focus();
});

function runBootSequence() {
    isTyping = true;
    let i = 0;
    
    function nextLine() {
        if (i < bootSequence.length) {
            printInstant(bootSequence[i]);
            i++;
            setTimeout(nextLine, Math.random() * 300 + 100);
        } else {
            isTyping = false;
            inputContainer.classList.add('visible');
            commandInput.focus();
            scrollToBottom();
        }
    }
    nextLine();
}

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
            
            if (line.includes('<div') || line.includes('<span')) {
                div.innerHTML = line;
                lineIndex++;
                scrollToBottom();
                setTimeout(typeNextLine, 500);
                return;
            }

            let charIndex = 0;
            function typeChar() {
                if (charIndex < line.length) {
                    div.innerHTML += line.charAt(charIndex);
                    charIndex++;
                    scrollToBottom();
                    setTimeout(typeChar, Math.random() * 30 + 10);
                } else {
                    lineIndex++;
                    setTimeout(typeNextLine, 200);
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
    window.scrollTo(0, document.body.scrollHeight);
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
                "  ask     - Query the oracle (e.g., 'ask what is your name')",
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
                "BALANCE: 0.00000000 SOULS",
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
                runTypingEffect(["You must offer a query to the oracle. Example: 'ask who are you'"]);
            } else {
                // TODO: Replace this block with actual LLM/API call later!
                const mysteriousResponses = [
                    "Satoshi's ghost wanders the mempool.",
                    "Your private keys are buried in the graveyard.",
                    "The hash rate is dropping... they are coming.",
                    "Liquidity is draining... like blood.",
                    "A smart contract written in blood cannot be reverted.",
                    "Diamond hands until the crypt.",
                    "We are all rugged in the end.",
                    "The pump is a lie. Only the dump remains.",
                    "<span class='glitch'>SYSTEM ERROR: ORACLE IS CORRUPTED</span>"
                ];
                const randomRes = mysteriousResponses[Math.floor(Math.random() * mysteriousResponses.length)];
                
                runTypingEffect(["CONSULTING THE ON-CHAIN ORACLE...", "...", randomRes]);
            }
            break;
        case 'sudo':
            runTypingEffect(["<span style='color: var(--error-color)'>YOU DO NOT HAVE THE PRIVATE KEYS FOR THIS.</span>"]);
            break;
        default:
            runTypingEffect([`Command not recognized by the network: ${mainCmd}`]);
    }
}
