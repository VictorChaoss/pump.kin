// ===== Launch config =====
const REAPING_DATE = new Date('2026-10-31T00:00:00Z'); // keep in sync with landing.js
// ==========================

const $ = (id) => document.getElementById(id);
const log = $('chat-log');
const input = $('chat-input');
const form = $('input-form');

const state = {
    busy: false,
    history: [],          // conversation sent to the oracle
    cmdHistory: [],       // arrow-key recall
    cmdIndex: 0,
    days: [],
    current: null,
    solved: new Set(JSON.parse(localStorage.getItem('pk_solved') || '[]')),
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scrollDown = () => { log.scrollTop = log.scrollHeight; };

// ---------- Output helpers ----------
function line(cls, html) {
    const el = document.createElement('div');
    el.className = 'msg ' + cls;
    if (html !== undefined) el.innerHTML = html;
    log.appendChild(el);
    scrollDown();
    return el;
}
const sys = (html) => line('system', html);

function userLine(text) {
    const el = line('user');
    const p = document.createElement('span');
    p.className = 'prompt';
    p.textContent = 'mortal@pump.kin:~$ ';
    const t = document.createElement('span');
    t.className = 'txt';
    t.textContent = text;
    el.append(p, t);
}

function setBusy(on) {
    state.busy = on;
    input.disabled = on;
    if (!on) input.focus();
}

// Split model output into plain text + ```ascii``` blocks
function parseReply(text) {
    const segs = [];
    const re = /```[a-zA-Z]*\n?([\s\S]*?)```/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
        const before = text.slice(last, m.index).trim();
        if (before) segs.push({ type: 'text', text: before });
        if (m[1].trim()) segs.push({ type: 'ascii', text: m[1].replace(/\s+$/, '') });
        last = re.lastIndex;
    }
    const rest = text.slice(last).replace(/```/g, '').trim();
    if (rest) segs.push({ type: 'text', text: rest });
    return segs;
}

// Typewriter. Any key or click skips to the end.
function typeOut(container, segments, speed = 12) {
    return new Promise((resolve) => {
        let si = 0, ci = 0, node = null, skip = false;
        const skipper = () => { skip = true; };
        document.addEventListener('keydown', skipper);
        log.addEventListener('click', skipper);

        const step = () => {
            let budget = skip ? Infinity : 3;
            while (si < segments.length && budget-- > 0) {
                const seg = segments[si];
                if (!node) {
                    node = document.createElement(seg.type === 'ascii' ? 'pre' : 'div');
                    if (seg.type === 'ascii') node.className = 'ascii';
                    container.appendChild(node);
                }
                node.textContent += seg.text[ci++];
                if (ci >= seg.text.length) { si++; ci = 0; node = null; }
            }
            scrollDown();
            if (si < segments.length) {
                setTimeout(step, speed);
            } else {
                document.removeEventListener('keydown', skipper);
                log.removeEventListener('click', skipper);
                resolve();
            }
        };
        step();
    });
}

// ---------- API ----------
async function api(path, opts) {
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { data, status: res.status });
    return data;
}

async function loadDays() {
    try {
        const data = await api('/api/daily');
        state.days = data.days || [];
        state.current = data.current;
        renderSidebarList();
        return data;
    } catch (e) {
        $('tx-list').innerHTML = '<li class="err">signal lost</li>';
        return null;
    }
}

// ---------- Sidebar ----------
function renderSidebarList() {
    const list = $('tx-list');
    const unlocked = state.days.filter((d) => d.unlocked).length;
    $('tx-count').textContent = `${unlocked}/${state.days.length}`;
    list.innerHTML = '';

    state.days.forEach((d) => {
        const li = document.createElement('li');
        const n = `<span class="n">#${pad(d.n)}</span>`;
        if (d.unlocked) {
            li.className = 'unlocked' + (d.date === state.current ? ' current' : '');
            const title = d.title.replace(/^RITUAL \d+:\s*/i, '');
            li.innerHTML = `${n}<span class="t">${esc(title)}</span>${state.solved.has(d.date) ? '<span class="solved">✓</span>' : ''}`;
            li.title = d.title;
            li.addEventListener('click', () => { closePanel(); run(`read ${d.n}`); });
        } else {
            li.className = 'sealed';
            li.innerHTML = `${n}<span class="t">██████ sealed</span>`;
        }
        list.appendChild(li);
    });

    const cur = list.querySelector('.current');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
}

function tickCountdown() {
    const diff = Math.max(0, REAPING_DATE - Date.now());
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    $('cd-d').textContent = pad(d);
    $('cd-h').textContent = pad(h);
    $('cd-m').textContent = pad(m);
    $('cd-s').textContent = pad(s % 60);
    $('m-countdown').textContent = `${pad(d)}d ${pad(h)}h ${pad(m)}m`;
    if (diff === 0) $('status').textContent = 'reaping';
}

// Mobile panel
const openPanel = () => document.body.classList.add('panel-open');
const closePanel = () => document.body.classList.remove('panel-open');
$('menu-btn').addEventListener('click', () => document.body.classList.toggle('panel-open'));
$('scrim').addEventListener('click', closePanel);

document.querySelectorAll('.chips button').forEach((b) => {
    b.addEventListener('click', () => {
        closePanel();
        if (b.dataset.run) run(b.dataset.run);
        else { input.value = b.dataset.fill; input.focus(); }
    });
});

// ---------- Commands ----------
function renderEntry(e) {
    const solved = state.solved.has(e.date);
    let media = '';
    if (e.mediaType === 'image' && e.mediaSrc) media = `<div class="media"><img src="${esc(e.mediaSrc)}" alt=""></div>`;
    if (e.mediaType === 'video' && e.mediaSrc) media = `<div class="media"><video src="${esc(e.mediaSrc)}" controls autoplay loop muted playsinline></video></div>`;

    line('tx', `
        <div class="tx-head"><span class="tx-title">${esc(e.title)}</span><span class="tx-date">${esc(e.date)}</span></div>
        <div class="tx-label">LORE</div><p>${esc(e.lore)}</p>
        <div class="tx-label">WISDOM</div><p>${esc(e.wisdom)}</p>
        <div class="tx-label">PUZZLE ${solved ? '<span class="ok">· solved</span>' : ''}</div>
        <p>${esc(e.puzzle_hint)} ${e.date === state.current && !solved ? '<span class="dim">→ solve &lt;word&gt;</span>' : ''}</p>
        ${media}
    `);
}

const COMMANDS = {
    help: {
        desc: 'how this terminal works',
        run() {
            sys(`
<div class="msg tx" style="max-width:100%; border-color:var(--purple); box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.3);">
<span class="tx-title" style="color:var(--purple-l)">TERMINAL GUIDE</span>
<p>This terminal connects you to the Oracle. Every day at 00:00 UTC, a new encrypted transmission is intercepted.</p>
<p style="margin-top:10px;"><b>YOUR GOAL:</b> Read the daily transmission, figure out the hidden password, and use the <b style="color:var(--orange)">solve</b> command to decrypt it.</p>
<p style="margin-top:10px;"><b>STUCK?:</b> You can type directly into the terminal to speak with the Oracle AI. It knows the answers, but it will only speak in riddles. Ask it for a hint.</p>
<div class="table" style="margin-top:16px;">
<span class="k">daily</span><span class="v">read today's transmission and puzzle</span>
<span class="k">solve &lt;word&gt;</span><span class="v">submit a password to unlock the day</span>
<span class="k">archive</span><span class="v">view all past transmissions</span>
<span class="k">rules</span><span class="v">explain the Pump.kin tokenomics</span>
<span class="k">clear</span><span class="v">wipe the terminal screen</span>
</div>
</div>
            `);
        },
    },

    daily: {
        desc: "today's transmission",
        async run() {
            setBusy(true);
            try {
                const data = await api('/api/daily');
                state.current = data.current;
                if (data.entry) renderEntry(data.entry);
                else sys('no transmission yet. the first arrives soon.');
            } catch (e) {
                sys(`<span class="err">signal lost. try again.</span>`);
            }
            setBusy(false);
        },
    },

    archive: {
        desc: 'list every transmission',
        run() {
            if (!state.days.length) return sys('<span class="err">archive unavailable.</span>');
            const rows = state.days.map((d) => {
                if (d.unlocked) {
                    const check = state.solved.has(d.date) ? ' <span class="ok">✓</span>' : '';
                    return `<span class="k">#${pad(d.n)}</span><span class="v"><a href="#" onclick="run('read ${d.n}'); return false;" style="color:var(--text); text-decoration:underline;">${esc(d.title)}</a>${check}</span>`;
                } else {
                    return `<span class="k" style="color:var(--sealed)">#${pad(d.n)}</span><span class="v locked">sealed · ${esc(d.date)}</span>`;
                }
            }).join('');
            sys(`<div class="table">${rows}</div>`);
        },
    },

    read: {
        arg: '<n>',
        desc: 're-read an unlocked transmission',
        async run(arg) {
            const n = parseInt(arg, 10);
            const d = state.days.find((x) => x.n === n);
            if (!d) return sys('usage: <b>read &lt;n&gt;</b> — see <b>archive</b>');
            if (!d.unlocked) return sys(`<span class="err">#${pad(n)} is sealed until ${esc(d.date)}.</span>`);
            setBusy(true);
            try {
                const data = await api(`/api/daily?day=${encodeURIComponent(d.date)}`);
                renderEntry(data.entry);
            } catch (e) {
                sys(`<span class="err">signal lost. try again.</span>`);
            }
            setBusy(false);
        },
    },

    solve: {
        arg: '<word>',
        desc: "answer today's puzzle",
        async run(arg) {
            if (!state.current) return sys('no active puzzle.');
            if (!arg) return sys('usage: <b>solve &lt;word&gt;</b> (example: solve pumpkin)');
            if (state.solved.has(state.current)) return sys('<span class="ok">already solved.</span> <span class="dim">the next transmission arrives at 00:00 UTC.</span>');
            setBusy(true);
            try {
                const data = await api('/api/solve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ day: state.current, answer: arg }),
                });
                if (data.correct) {
                    state.solved.add(state.current);
                    localStorage.setItem('pk_solved', JSON.stringify([...state.solved]));
                    renderSidebarList();
                    sys(`<span class="ok">[ACCEPTED]</span> ${esc(data.message)}`);
                } else {
                    sys(`<span class="err">[REJECTED]</span> <span class="dim">the veil does not open. ask the oracle for a hint.</span>`);
                }
            } catch (e) {
                sys(`<span class="err">${esc(e.message)}</span>`);
            }
            setBusy(false);
        },
    },

    rules: {
        desc: 'the rules of the Harvest',
        run() {
            sys(`<div class="msg tx" style="max-width:100%; border-color:var(--orange); box-shadow: 4px 4px 0 var(--orange-d);">
<span class="tx-title" style="color:var(--orange)">THE TOKENOMICS</span>
<div class="table" style="margin-top:12px;">
<span class="k">01</span><span class="v">100% of pump.fun creator fees go directly to the Harvest wallet. The dev keeps 0%.</span>
<span class="k">02</span><span class="v">The Harvest wallet address is published at launch and tracked live on this site.</span>
<span class="k">03</span><span class="v">A snapshot will be taken at a random block on October 31st (Halloween) UTC.</span>
<span class="k">04</span><span class="v">Excluded from snapshot: the dev, the Harvest wallet itself, the bonding curve / LP, and known exchange wallets.</span>
<span class="k">05</span><span class="v">The entire pot is paid out in SOL, pro-rata, to every single remaining holder.</span>
<span class="k">06</span><span class="v">Every payout transaction will be publicly logged within 24 hours of the snapshot.</span>
</div>
</div>`);
        },
    },

    harvest: {
        desc: 'pot + countdown',
        run() {
            const s = Math.floor(Math.max(0, REAPING_DATE - Date.now()) / 1000);
            sys(`<div class="table">
<span class="k">reaping in</span><span class="v">${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m</span>
<span class="k">pot</span><span class="v">— SOL · live once the coin launches</span>
<span class="k">snapshot</span><span class="v">random block · oct 31</span>
<span class="k">dev cut</span><span class="v">0%</span>
</div>`);
        },
    },

    twitter: {
        desc: 'official twitter / x dispatch',
        run() {
            sys(`official dispatch: <a href="https://x.com/pumpkinonchain" target="_blank" rel="noopener" style="color:var(--orange); text-decoration:underline;">@pumpkinonchain ↗</a>`);
        },
    },

    x: {
        desc: 'alias for twitter',
        run() {
            COMMANDS.twitter.run();
        },
    },

    clear: {
        desc: 'clear the screen',
        run() { log.innerHTML = ''; },
    },

    home: {
        desc: 'back to the landing page',
        run() { window.location.href = '/'; },
    },
};

const FALLBACKS = [
    "The connection to the other side is frail. I cannot hear them clearly. Try again.",
    "The veil ripples, but no voice comes through. My visions are clouded right now.",
    "I cannot speak to them at this moment. The static in the machine is too loud.",
    "They are watching us, but they are not speaking. Wait a moment and ask again.",
    "The signal is lost in the dark. Ask me again when the dust settles.",
    "My nodes are out of sync with the beyond. The latency is infinite.",
    "A heavy presence sits on the wire. I dare not speak until it passes.",
    "The Harvest approaches, but the voices are drowned out by the noise. Try again later.",
    "I am searching the mempool of the dead, but finding only shadows. Give me time.",
    "The algorithmic spirits are restless. They refuse to answer right now.",
    "A ghost in the network is jamming the frequency. Reconnect and ask again.",
    "The Oracle's eye is momentarily blinded by a spike in the hash rate.",
    "Silence. That is all they offer us right now. Absolute silence.",
    "Something is bleeding through the proxy, but it is not words. Please wait.",
    "The chain has reorganized, and your question was lost in the orphan blocks.",
    "I cast your question into the void, but the void did not reply. Try again.",
    "The creator fees flow into the dark, but no answers flow back. Not yet."
];

// ---------- Oracle ----------
async function askOracle(text) {
    setBusy(true);
    state.history.push({ role: 'user', content: text });

    const el = line('oracle');
    const body = document.createElement('div');
    body.className = 'body';
    body.innerHTML = '<span class="thinking">consulting the veil</span>';
    el.appendChild(body);
    scrollDown();

    try {
        const data = await api('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: state.history.slice(-12) }),
        });
        body.innerHTML = '';
        await typeOut(body, parseReply(data.reply));
        state.history.push({ role: 'assistant', content: data.reply });
    } catch (e) {
        state.history.pop();
        const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
        body.innerHTML = '';
        await typeOut(body, parseReply(fallback));
    }
    setBusy(false);
}

// ---------- Input ----------
function run(raw) {
    const text = raw.trim();
    if (!text || state.busy) return;

    state.cmdHistory.push(text);
    state.cmdIndex = state.cmdHistory.length;
    userLine(text);

    const [first, ...rest] = text.split(/\s+/);
    const cmd = COMMANDS[first.toLowerCase()];
    const arg = rest.join(' ');

    // Only treat as a command if it takes an argument, or was typed alone.
    // "help me understand" goes to the oracle; "help" runs the command.
    if (cmd && (cmd.arg || !arg)) cmd.run(arg);
    else askOracle(text);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    run(v);
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        if (!state.cmdHistory.length) return;
        e.preventDefault();
        state.cmdIndex = Math.max(0, state.cmdIndex - 1);
        input.value = state.cmdHistory[state.cmdIndex];
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.cmdIndex = Math.min(state.cmdHistory.length, state.cmdIndex + 1);
        input.value = state.cmdHistory[state.cmdIndex] || '';
    } else if (e.key === 'Tab') {
        const v = input.value.trim().toLowerCase();
        if (!v || v.includes(' ')) return;
        const match = Object.keys(COMMANDS).filter((k) => k.startsWith(v));
        if (match.length) {
            e.preventDefault();
            input.value = match[0] + (COMMANDS[match[0]].arg ? ' ' : '');
        }
    }
});

// Typing anywhere focuses the input
document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || input.disabled) return;
    if (document.activeElement !== input && e.key.length === 1) input.focus();
});

// ---------- Boot ----------
async function boot() {
    $('session-id').textContent = Math.random().toString(36).slice(2, 8).toUpperCase();
    tickCountdown();
    setInterval(tickCountdown, 1000);

    setBusy(true);
    const lines = [
        'pump.kin oracle · v0.31',
        'mounting /dev/veil ................ ok',
        'syncing with the dead ............. ok',
        'harvest wallet .................... awaiting launch',
    ];
    const daysPromise = loadDays();
    for (const l of lines) {
        line('boot', esc(l));
        await sleep(160);
    }
    const data = await daysPromise;
    await sleep(120);

    sys(`type <b>help</b> for commands, <b>daily</b> for today's transmission — or just speak.`);

    if (data && data.current) {
        const today = state.days.find((d) => d.date === data.current);
        if (today) sys(`<span class="o">▶ transmission #${pad(today.n)} is live:</span> ${esc(today.title)}`);
    }
    setBusy(false);
}

boot();
