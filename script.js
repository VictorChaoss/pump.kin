const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const inputContainer = document.getElementById('input-container');

let dailyContent = {};
const todayStr = '2026-10-07'; 
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

const asciiLogo = `
      ___
   ___/   \\___
  /   _   _   \\
 /   / \\ / \\   \\
|    \\_/ \\_/    |
 \\      X      /
  \\___/   \\___/
`;

fetch('content.json')
    .then(response => response.json())
    .then(data => {
        dailyContent = data;
        initTerminal();
    })
    .catch(error => {
        initTerminal();
    });

function initTerminal() {
    printInstant("<pre>" + asciiLogo + "</pre>");
    runTypingEffect([
        "pump.kin truth terminal initialized.",
        "type 'help' to interact with the ghost chain."
    ]);
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
        
        printInstant(`pump.kin:~ $ ${command}`);
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
    inputContainer.style.display = 'none'; 
    
    let lineIndex = 0;
    
    function typeNextLine() {
        if (lineIndex < lines.length) {
            const line = lines[lineIndex];
            const div = document.createElement('div');
            outputDiv.appendChild(div);
            
            if (line.includes('<') && line.includes('>')) {
                div.innerHTML = line;
                lineIndex++;
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(typeNextLine, 50);
                return;
            }

            let charIndex = 0;
            function typeChar() {
                if (charIndex < line.length) {
                    div.innerHTML += line.charAt(charIndex);
                    charIndex++;
                    window.scrollTo(0, document.body.scrollHeight);
                    setTimeout(typeChar, 10);
                } else {
                    lineIndex++;
                    setTimeout(typeNextLine, 50);
                }
            }
            typeChar();
        } else {
            isTyping = false;
            inputContainer.style.display = 'flex';
            commandInput.focus();
            if (callback) callback();
        }
    }
    typeNextLine();
}

function printInstant(htmlContent) {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    outputDiv.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
}

function processCommand(cmd) {
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();
    const subCmd = args.slice(1).join(' ');

    switch(mainCmd) {
        case 'help':
            runTypingEffect([
                "commands:",
                "  help    - view manual",
                "  unlock  - fetch on-chain fragment",
                "  ask     - query oracle",
                "  clear   - wipe screen"
            ]);
            break;
        case 'clear':
            outputDiv.innerHTML = '';
            break;
        case 'unlock':
            const dayContent = dailyContent[todayStr];
            if (dayContent) {
                let lines = ["fetching fragment..."];
                lines.push(dayContent.text);
                
                if (dayContent.mediaType === 'image') {
                    lines.push(`<div class="media-container"><img src="${dayContent.mediaSrc}"></div>`);
                } else if (dayContent.mediaType === 'video') {
                    lines.push(`<div class="media-container"><video src="${dayContent.mediaSrc}" controls autoplay loop></video></div>`);
                }
                runTypingEffect(lines);
            } else {
                runTypingEffect(["fragment not yet available on chain."]);
            }
            break;
        case 'ask':
            if (!subCmd) {
                runTypingEffect(["query required."]);
            } else {
                runTypingEffect(["querying oracle..."], () => {
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
                                        : "error: oracle unreachable";
                        
                        if (!reply.includes('<')) {
                            reply = reply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        
                        runTypingEffect(["<pre>" + reply + "</pre>"]);
                    })
                    .catch(err => {
                        runTypingEffect(["error: connection lost."]);
                    });
                });
            }
            break;
        default:
            runTypingEffect([`command not found: ${mainCmd}`]);
    }
}
