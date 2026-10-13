// ===================================================
// ===== LAUNCH CONFIG: EDIT THESE ON LAUNCH DAY =====
// ===================================================
const REAPING_DATE = new Date('2026-10-31T00:00:00Z'); // countdown target (UTC)
const CONTRACT_ADDRESS = '';                           // paste your pump.fun coin CA here
const HARVEST_WALLET = '';                             // paste the public Harvest wallet address here
const X_TWITTER_URL = 'https://x.com/pumpkinonchain';  // official X account
// ===================================================

const pad = (n) => String(n).padStart(2, '0');
const els = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
};

function tick() {
    const diff = Math.max(0, REAPING_DATE - Date.now());
    const s = Math.floor(diff / 1000);
    els.d.textContent = pad(Math.floor(s / 86400));
    els.h.textContent = pad(Math.floor((s % 86400) / 3600));
    els.m.textContent = pad(Math.floor((s % 3600) / 60));
    els.s.textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

// Contract address + copy
const caValue = document.getElementById('ca-value');
const caCopy = document.getElementById('ca-copy');

if (CONTRACT_ADDRESS) {
    if (caValue) caValue.textContent = CONTRACT_ADDRESS;
    // Auto-update buy buttons to coin page
    document.querySelectorAll('a[href^="https://pump.fun"]').forEach(a => {
        a.href = `https://pump.fun/coin/${CONTRACT_ADDRESS}`;
    });
} else {
    if (caCopy) caCopy.style.display = 'none';
}

if (caCopy) {
    caCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(CONTRACT_ADDRESS);
            caCopy.textContent = 'copied';
            setTimeout(() => (caCopy.textContent = 'copy'), 1500);
        } catch (e) {
            caCopy.textContent = 'failed';
        }
    });
}

// Live Harvest Pot Balance Fetcher (Zero-config Solana RPC)
async function pollHarvestPot() {
    if (!HARVEST_WALLET) return;
    try {
        const res = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [HARVEST_WALLET]
            })
        });
        const data = await res.json();
        if (data.result && typeof data.result.value === 'number') {
            const sol = (data.result.value / 1e9).toFixed(2);
            const potEl = document.getElementById('pot-value');
            if (potEl) potEl.textContent = `${sol} SOL`;
        }
    } catch (e) {
        console.warn('Could not fetch pot balance:', e);
    }
}
if (HARVEST_WALLET) {
    pollHarvestPot();
    setInterval(pollHarvestPot, 15000);
}

// ===================================================
// ===== 8-BIT THE HARVEST PATCH (20 MICRO-STAGES) ===
// ===================================================

const MIGRATION_MC = 44000; // pump.fun migration threshold ($44k)

const farmState = {
    targetMC: 3500,
    currentMC: 3500,
    isLive: false,
    particles: [],
    ambientLeaves: Array.from({ length: 8 }, () => ({
        x: Math.random() * 480,
        y: Math.random() * 180,
        vx: 0.4 + Math.random() * 0.6,
        vy: 0.2 + Math.random() * 0.4,
        col: Math.random() > 0.5 ? '#d45600' : '#8b4513',
        size: Math.random() > 0.5 ? 2 : 1
    })),
    bats: [
        { x: 50, y: 30, vx: 0.9, vy: 0.15, frame: 0 },
        { x: 410, y: 45, vx: -0.7, vy: -0.15, frame: 1 },
        { x: 220, y: 25, vx: 0.5, vy: -0.2, frame: 0 }
    ],
    crow: { x: 42, y: 126, flying: false, vx: 1.2, vy: -0.6 },
    hasShaken: false,
    time: 0
};

// Canvas & DOM elements
const canvas = document.getElementById('farm-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const viewportEl = document.querySelector('.farm-viewport');

const mcValEl = document.getElementById('farm-mc-val');
const mcSubEl = document.getElementById('farm-mc-sub');
const curveValEl = document.getElementById('farm-curve-val');
const curveSubEl = document.getElementById('farm-curve-sub');
const stageValEl = document.getElementById('farm-stage-val');
const stageSubEl = document.getElementById('farm-stage-sub');
const statusTextEl = document.getElementById('farm-status-text');
const liveDotEl = document.getElementById('farm-live-dot');
const overlayLabelEl = document.getElementById('farm-overlay-label');
const sliderEl = document.getElementById('farm-slider');
const sliderDisplayEl = document.getElementById('farm-slider-display');
const tierButtons = document.querySelectorAll('.tier-btn');

function formatUSD(num) {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 10000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + Math.round(num).toLocaleString('en-US');
}

// 20 Granular Micro-Stages
const STAGES = [
    { mc: 3500,  name: 'STAGE 01 · BURIED SEED',       sub: 'dormant in the cold soil',          label: 'STAGE 01: SEED & ROOTS' },
    { mc: 4800,  name: 'STAGE 02 · CRACKING SOIL',     sub: 'faint stirrings beneath the veil',  label: 'STAGE 02: FIRST FISSURE' },
    { mc: 6500,  name: 'STAGE 03 · TWIN SHOOT',        sub: 'two emerald leaves emerge',         label: 'STAGE 03: COTYLEDON' },
    { mc: 8500,  name: 'STAGE 04 · JAGGED LEAF',       sub: 'true pumpkin foliage takes root',   label: 'STAGE 04: FIRST TRUE LEAF' },
    { mc: 11000, name: 'STAGE 05 · COILED TENDRIL',    sub: 'green tendril reaching for fence',  label: 'STAGE 05: TENDRIL' },
    { mc: 13800, name: 'STAGE 06 · VINE RUNNER',       sub: 'thick runner crawling the mound',   label: 'STAGE 06: CREEPING RUNNER' },
    { mc: 17000, name: 'STAGE 07 · FENCE EMBRACE',     sub: 'vine wraps posts, crow departs',    label: 'STAGE 07: VINE EMBRACE' },
    { mc: 20500, name: 'STAGE 08 · GOLDEN BLOSSOM',    sub: 'star blossom opens with spores',    label: 'STAGE 08: GIANT BLOSSOM' },
    { mc: 24500, name: 'STAGE 09 · PETAL DROP',        sub: 'flower wilts, pea-sized ovary',     label: 'STAGE 09: PETAL DROP' },
    { mc: 28000, name: 'STAGE 10 · BABY GREEN RIND',   sub: 'striped dark-green button swells',  label: 'STAGE 10: GREEN PUMPKIN' },
    { mc: 31500, name: 'STAGE 11 · SWELLING MELON',    sub: 'ribbed green melon doubles in mass',label: 'STAGE 11: RIBBED SWELL' },
    { mc: 35000, name: 'STAGE 12 · MOTTLED GOLD',      sub: 'yellow-green mottled transition',   label: 'STAGE 12: MOTTLED RIND' },
    { mc: 38000, name: 'STAGE 13 · HARVEST KING',      sub: 'full deep orange ribbed pumpkin',   label: 'STAGE 13: RIPE KING' },
    { mc: 41000, name: 'STAGE 14 · INNER FERMENT',     sub: 'pulsating heat before migration',   label: 'STAGE 14: 93% BONDED · PULSE' },
    { mc: 44000, name: 'STAGE 15 · ⚡ 100% MIGRATION',  sub: 'THE REAPING AWAKENS · FLAMES ROAR', label: 'STAGE 15: MIGRATED JACK-O\'-LANTERN' },
    { mc: 55000, name: 'STAGE 16 · TWIN HARVEST',      sub: 'second glowing baby pumpkin',       label: 'STAGE 16: DUAL JACKS' },
    { mc: 75000, name: 'STAGE 17 · TRIO OF THE DEAD',  sub: 'three jack-o-lanterns & pixel bats',label: 'STAGE 17: TRIO & BATS' },
    { mc: 110000,name: 'STAGE 18 · HAUNTED SCARECROW', sub: 'burlap scarecrow awakens in back',  label: 'STAGE 18: SCARECROW AWAKENS' },
    { mc: 180000,name: 'STAGE 19 · DEMONIC CEMETERY',  sub: 'rolling mist covers 5 pumpkins',    label: 'STAGE 19: CEMETERY OVERGROWTH' },
    { mc: 300000,name: 'STAGE 20 · BLOOD MOON ECLIPSE',sub: 'crimson moon & soul ascension',    label: 'STAGE 20: BLOOD MOON ASCENSION' }
];

function getStageInfo(mc) {
    let curr = STAGES[0];
    for (let i = 0; i < STAGES.length; i++) {
        if (mc >= STAGES[i].mc) curr = STAGES[i];
    }
    const curvePct = Math.min(100, (mc / MIGRATION_MC) * 100).toFixed(1) + '%';
    return {
        stage: curr.name,
        sub: curr.sub,
        label: curr.label,
        curve: mc >= MIGRATION_MC ? '100% · MIGRATED' : curvePct
    };
}

function triggerScreenRumble() {
    if (!viewportEl) return;
    viewportEl.classList.add('farm-rumble');
    setTimeout(() => {
        viewportEl.classList.remove('farm-rumble');
    }, 1800);
}

function updateHUD(mc) {
    const info = getStageInfo(mc);
    if (mcValEl) mcValEl.textContent = formatUSD(mc);
    if (curveValEl) curveValEl.textContent = info.curve;
    if (stageValEl) stageValEl.textContent = info.stage;
    if (stageSubEl) stageSubEl.textContent = info.sub;
    if (overlayLabelEl) overlayLabelEl.textContent = info.label;

    if (mc >= MIGRATION_MC) {
        curveValEl.classList.remove('o');
        curveValEl.style.color = '#7ddc1f';
        if (curveSubEl) curveSubEl.textContent = 'bonding curve complete';
        if (!farmState.hasShaken) {
            farmState.hasShaken = true;
            triggerScreenRumble();
        }
    } else {
        curveValEl.classList.add('o');
        curveValEl.style.color = '';
        if (curveSubEl) curveSubEl.textContent = 'target: $44,000';
        farmState.hasShaken = false;
    }
}

// Pixel Art Helper
function pRect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Pre-seeded Stars
const STARS = Array.from({ length: 42 }, (_, i) => ({
    x: (i * 17 + 9) % 480,
    y: ((i * 23 + 7) % 115) + 4,
    size: (i % 4 === 0) ? 2 : 1,
    phase: i * 0.75
}));

// Draw Complete 8-Bit Scene
function drawScene(mc) {
    if (!ctx) return;
    const W = 480;
    const H = 240;
    const groundY = 175;

    // 1. Sky Gradient (shifts to blood-red at stage 20)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    if (mc >= 300000) {
        skyGrad.addColorStop(0, '#220412');
        skyGrad.addColorStop(0.65, '#3b0a1f');
        skyGrad.addColorStop(1, '#4e1422');
    } else {
        skyGrad.addColorStop(0, '#090314');
        skyGrad.addColorStop(0.65, '#160829');
        skyGrad.addColorStop(1, '#24103c');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // 2. Stars
    STARS.forEach((s) => {
        const twinkle = Math.sin(farmState.time * 0.05 + s.phase);
        const col = twinkle > 0.3 ? '#fff' : (twinkle > -0.3 ? '#c4b5fd' : '#4f3273');
        pRect(s.x, s.y, s.size, s.size, col);
    });

    // 3. Moon (Pale Gold -> Blood Red at Moon Ascension)
    const mx = 405, my = 28;
    const isBloodMoon = mc >= 300000;
    const moonCol = isBloodMoon ? '#ff3344' : (mc >= 150000 ? '#ffb347' : '#fff6d5');
    const moonCraters = isBloodMoon ? '#99001a' : (mc >= 150000 ? '#c77826' : '#ded2a4');

    // Aura ring if high MC
    if (mc >= 75000) {
        ctx.fillStyle = isBloodMoon ? 'rgba(255, 50, 70, 0.15)' : 'rgba(255, 230, 150, 0.1)';
        ctx.beginPath();
        ctx.arc(mx + 14, my + 14, 24, 0, Math.PI * 2);
        ctx.fill();
    }

    pRect(mx + 6, my, 16, 2, moonCol);
    pRect(mx + 2, my + 2, 24, 2, moonCol);
    pRect(mx, my + 4, 28, 20, moonCol);
    pRect(mx + 2, my + 24, 24, 2, moonCol);
    pRect(mx + 6, my + 26, 16, 2, moonCol);
    pRect(mx + 8, my + 8, 4, 4, moonCraters);
    pRect(mx + 18, my + 14, 5, 5, moonCraters);
    pRect(mx + 6, my + 18, 3, 3, moonCraters);

    // 4. Distant Silhouettes (Hills, Crooked Crosses, Dead Trees, Scarecrow)
    ctx.fillStyle = '#110620';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, 142);
    ctx.quadraticCurveTo(120, 126, 240, 145);
    ctx.quadraticCurveTo(360, 130, 480, 143);
    ctx.lineTo(480, groundY);
    ctx.closePath();
    ctx.fill();

    // Distant Graves
    pRect(80, 130, 4, 12, '#1b0c33'); // cross 1
    pRect(76, 134, 12, 3, '#1b0c33');
    pRect(340, 125, 6, 17, '#1b0c33'); // tombstone 2

    // Scarecrow on Hill (Awakens at $110k)
    const scX = 372, scY = 114;
    pRect(scX + 4, scY, 3, 30, '#0a0314'); // pole
    pRect(scX - 6, scY + 8, 23, 3, '#0a0314'); // crossbar
    pRect(scX + 1, scY - 8, 9, 8, '#24101e'); // burlap head
    pRect(scX - 3, scY - 9, 17, 2, '#0a0314'); // hat brim
    pRect(scX + 1, scY - 13, 9, 4, '#0a0314'); // hat top
    if (mc >= 110000) {
        // Scarecrow Glowing Eyes
        const scFlicker = Math.sin(farmState.time * 0.2) > 0 ? '#ffea00' : '#ff7a1a';
        pRect(scX + 3, scY - 5, 2, 2, scFlicker);
        pRect(scX + 6, scY - 5, 2, 2, scFlicker);
    }

    // 5. Wooden Fence Posts (Foreground Graveyard Perimeter)
    // Left posts
    [32, 68].forEach(fx => {
        pRect(fx, groundY - 26, 6, 28, '#2d1830');
        pRect(fx + 1, groundY - 30, 4, 4, '#3e2242'); // pointed tip
    });
    pRect(28, groundY - 18, 50, 3, '#241226'); // fence rail top
    pRect(28, groundY - 8, 50, 3, '#241226');  // fence rail bottom

    // Right posts
    [412, 448].forEach(fx => {
        pRect(fx, groundY - 26, 6, 28, '#2d1830');
        pRect(fx + 1, groundY - 30, 4, 4, '#3e2242');
    });
    pRect(408, groundY - 18, 50, 3, '#241226');
    pRect(408, groundY - 8, 50, 3, '#241226');

    // Crow on Left Fence Post (Takes off when mc >= 17k)
    if (mc < 17000) {
        farmState.crow.flying = false;
        farmState.crow.x = 34;
        farmState.crow.y = groundY - 37;
        pRect(34, groundY - 36, 6, 6, '#000'); // crow body
        pRect(32, groundY - 35, 2, 2, '#ffaa00'); // beak
        pRect(38, groundY - 34, 4, 3, '#000'); // tail
    } else {
        farmState.crow.flying = true;
        farmState.crow.x += farmState.crow.vx;
        farmState.crow.y += farmState.crow.vy;
        const cx = Math.floor(farmState.crow.x);
        const cy = Math.floor(farmState.crow.y);
        if (cx < 500 && cy > -20) {
            pRect(cx + 2, cy + 2, 4, 4, '#000');
            const wingFrame = Math.floor(farmState.time * 0.25) % 2;
            if (wingFrame === 0) {
                pRect(cx, cy, 3, 2, '#000');
                pRect(cx + 5, cy, 3, 2, '#000');
            } else {
                pRect(cx, cy + 4, 3, 2, '#000');
                pRect(cx + 5, cy + 4, 3, 2, '#000');
            }
        }
    }

    // Grave Marker Stake: [KIN]
    const stakeX = 310, stakeY = groundY - 22;
    pRect(stakeX + 4, stakeY, 4, 24, '#331d2b');
    pRect(stakeX - 4, stakeY, 20, 10, '#422538');
    pRect(stakeX - 2, stakeY + 2, 4, 6, '#180a15'); // letter K
    pRect(stakeX + 4, stakeY + 2, 2, 6, '#180a15'); // letter I
    pRect(stakeX + 8, stakeY + 2, 4, 6, '#180a15'); // letter N

    // 6. Soil / Graveyard Ground
    pRect(0, groundY, W, H - groundY, '#140920');
    pRect(0, groundY, W, 4, '#241438');
    pRect(0, groundY + 4, W, 4, '#1b0d2d');

    // Central Burial Mound
    for (let i = 0; i < 200; i += 5) {
        const offY = Math.sin((i / 200) * Math.PI) * 14;
        pRect(140 + i, groundY - offY, 5, offY + 4, '#221136');
        pRect(140 + i, groundY - offY + 4, 5, 4, '#180a27');
    }

    // Grass tufts
    [95, 125, 345, 395].forEach(wx => {
        pRect(wx, groundY - 4, 2, 5, '#3a5928');
        pRect(wx - 2, groundY - 2, 2, 3, '#3a5928');
    });

    // 7. MICRO-GROWTH STAGES ($3.5k to $44k+)
    const cx = 240;
    const baseMoundY = groundY - 12;

    // Stage 1 ($3.5k - $4.8k): Buried seed & roots
    if (mc < 4800) {
        // Soil cracks
        pRect(cx - 10, baseMoundY + 2, 20, 2, '#381c54');
        pRect(cx - 4, baseMoundY + 4, 8, 2, '#48256e');
        // Glowing root specks beneath surface
        const rootPulse = Math.sin(farmState.time * 0.1) * 0.5 + 0.5;
        pRect(cx - 6, baseMoundY + 6, 2, 4, `rgba(139, 92, 246, ${rootPulse})`);
        pRect(cx + 4, baseMoundY + 5, 2, 5, `rgba(139, 92, 246, ${rootPulse})`);
    }

    // Stage 2 ($4.8k - $6.5k): First shoot breaking surface
    if (mc >= 4800 && mc < 6500) {
        pRect(cx - 12, baseMoundY + 2, 24, 3, '#381c54');
        pRect(cx - 2, baseMoundY - 2, 4, 4, '#489c2c'); // curved tip
        pRect(cx - 1, baseMoundY, 2, 4, '#2b7319');
    }

    // Stage 3 ($6.5k - $8.5k): Twin Cotyledons
    if (mc >= 6500 && mc < 8500) {
        const sway = Math.sin(farmState.time * 0.08) * 1;
        pRect(cx - 1, baseMoundY - 6, 2, 8, '#7ddc1f');
        pRect(cx - 6, baseMoundY - 7 + sway, 5, 3, '#66b818');
        pRect(cx + 1, baseMoundY - 6 + sway, 5, 3, '#7ddc1f');
        // Dewdrop
        pRect(cx - 5, baseMoundY - 8 + sway, 1, 1, '#ffffff');
    }

    // Stage 4 ($8.5k - $11k): First True Jagged Leaf
    if (mc >= 8500 && mc < 11000) {
        const stemH = 12;
        pRect(cx - 1, baseMoundY - stemH, 2, stemH + 2, '#4ea818');
        // Jagged leaves
        pRect(cx - 9, baseMoundY - stemH - 2, 8, 5, '#3a8714');
        pRect(cx - 8, baseMoundY - stemH - 4, 6, 2, '#5cb520');
        pRect(cx + 1, baseMoundY - stemH, 8, 5, '#4ea818');
    }

    // Stages 5 - 7 ($11k - $20.5k): Tendril & Vine Growth
    if (mc >= 11000) {
        // Right Vine Runner (crawls to fence)
        const vLen = Math.min(80, Math.floor((mc - 11000) * 0.008 + 12));
        for (let vx = 0; vx < vLen; vx += 3) {
            const vy = Math.sin(vx * 0.14) * 4;
            pRect(cx + vx, baseMoundY + vy, 3, 3, '#326918');
            if (vx % 14 === 0) {
                pRect(cx + vx - 2, baseMoundY + vy - 4, 5, 4, '#4a9424');
            }
        }
        // Vine reaches fence post at Stage 7 ($17k+)
        if (mc >= 17000) {
            pRect(412, groundY - 20, 3, 6, '#326918');
            pRect(414, groundY - 24, 3, 4, '#4a9424');
        }

        // Left Vine Runner (branches off at Stage 11+)
        if (mc >= 31500) {
            const lvLen = Math.min(65, Math.floor((mc - 31500) * 0.006 + 10));
            for (let vx = 0; vx < lvLen; vx += 3) {
                const vy = Math.sin(vx * 0.16) * 3;
                pRect(cx - vx, baseMoundY + vy, 3, 3, '#326918');
                if (vx % 12 === 0) pRect(cx - vx - 2, baseMoundY + vy - 4, 5, 4, '#4a9424');
            }
        }
    }

    // Stage 8 ($20.5k - $24.5k): Giant Golden Star Blossom
    if (mc >= 20500 && mc < 24500) {
        const bx = cx + 42, by = baseMoundY - 4;
        pRect(bx - 6, by - 6, 12, 12, '#ffd526'); // petals
        pRect(bx - 4, by - 8, 8, 16, '#ffd526');
        pRect(bx - 8, by - 4, 16, 8, '#ffd526');
        pRect(bx - 2, by - 2, 4, 4, '#ff8a00');  // center
        // Spore particles
        if (Math.random() < 0.3) {
            farmState.particles.push({
                x: bx + (Math.random() * 10 - 5),
                y: by - 4,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.5 - Math.random() * 0.4,
                life: 30,
                col: '#ffea4d'
            });
        }
    }

    // Stage 9 ($24.5k - $28k): Petals dropped, green pea button
    if (mc >= 24500 && mc < 28000) {
        // Fallen petals on dirt
        pRect(cx + 34, baseMoundY + 2, 4, 2, '#c79b18');
        pRect(cx + 46, baseMoundY + 3, 3, 2, '#c79b18');
        // Tiny green pumpkin button
        pRect(cx - 4, baseMoundY - 7, 8, 7, '#2b7319');
        pRect(cx - 1, baseMoundY - 9, 2, 3, '#422915');
    }

    // Stages 10 - 15 ($28k+): PUMPKIN EXPANSION & CARVING
    if (mc >= 28000) {
        // Dynamic Pumpkin Sizing
        let pW, pH;
        if (mc < 31500) {
            pW = 18; pH = 14; // Stage 10 (baby green)
        } else if (mc < 35000) {
            pW = 26; pH = 20; // Stage 11 (swelling melon)
        } else if (mc < 38000) {
            pW = 34; pH = 26; // Stage 12 (mottled gold)
        } else if (mc < MIGRATION_MC) {
            pW = 42; pH = 32; // Stages 13-14 (ripe king)
        } else {
            pW = 48; pH = 36; // Stages 15+ (awakened king)
        }

        const px = cx - Math.floor(pW / 2);
        const py = baseMoundY - pH + 2;

        // Color Palettes
        let colBase, colRib, colHigh;
        if (mc < 31500) {
            // Dark green
            colBase = '#2b7319'; colRib = '#18470e'; colHigh = '#489c2c';
        } else if (mc < 35000) {
            // Striped yellow-green
            colBase = '#55821c'; colRib = '#385e0f'; colHigh = '#8ab52a';
        } else if (mc < 38000) {
            // Mottled golden
            colBase = '#d47b15'; colRib = '#9e5309'; colHigh = '#f2a133';
        } else {
            // Deep Harvest Orange
            colBase = '#ff7a1a'; colRib = '#d45600'; colHigh = '#ffaa33';
        }

        // Stage 14 Pre-Migration Inner Heat Pulse
        if (mc >= 41000 && mc < MIGRATION_MC) {
            const pulse = (Math.sin(farmState.time * 0.18) + 1) * 0.5;
            if (pulse > 0.5) colBase = '#ff8f33';
        }

        // Twisted Stem
        pRect(cx - 2, py - 6, 4, 7, '#3d2614');
        pRect(cx, py - 9, 3, 4, '#24140b');

        // Body Oval
        pRect(px + 4, py, pW - 8, pH, colBase);
        pRect(px + 1, py + 3, pW - 2, pH - 6, colBase);
        pRect(px, py + 6, pW, pH - 12, colBase);

        // Vertical Rib Lines
        const ribOffset = Math.floor(pW / 4);
        pRect(cx - ribOffset, py + 2, 2, pH - 4, colRib);
        pRect(cx + ribOffset - 2, py + 2, 2, pH - 4, colRib);
        pRect(cx - 1, py + 1, 2, pH - 2, colRib);

        // Top Highlights
        pRect(px + 6, py + 1, pW - 12, 2, colHigh);

        // STAGES 15+ (⚡ $44K MIGRATION): CARVED ROARING JACK-O'-LANTERN!
        if (mc >= MIGRATION_MC) {
            const flicker = Math.sin(farmState.time * 0.3) * Math.cos(farmState.time * 0.19);
            const flameCol = flicker > 0.3 ? '#ffee44' : (flicker > -0.3 ? '#ffaa00' : '#ff3300');
            const eyeY = py + Math.floor(pH * 0.33);
            const mouthY = py + Math.floor(pH * 0.63);

            // Left Triangular Eye
            pRect(cx - 12, eyeY + 2, 7, 2, flameCol);
            pRect(cx - 11, eyeY, 5, 2, flameCol);
            pRect(cx - 10, eyeY - 2, 3, 2, flameCol);

            // Right Triangular Eye
            pRect(cx + 6, eyeY + 2, 7, 2, flameCol);
            pRect(cx + 7, eyeY, 5, 2, flameCol);
            pRect(cx + 8, eyeY - 2, 3, 2, flameCol);

            // Sinister Jagged Mouth
            pRect(cx - 15, mouthY, 30, 3, flameCol);
            pRect(cx - 13, mouthY + 3, 26, 2, flameCol);
            pRect(cx - 9, mouthY + 5, 18, 2, flameCol);
            // Jagged Teeth
            pRect(cx - 9, mouthY, 3, 2, colRib);
            pRect(cx + 6, mouthY, 3, 2, colRib);
            pRect(cx - 2, mouthY + 3, 3, 2, colRib);

            // Fiery Ember Particles Erupting
            if (Math.random() < 0.35) {
                farmState.particles.push({
                    x: cx + (Math.random() * 28 - 14),
                    y: py - 4,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -1.0 - Math.random() * 0.8,
                    life: 40,
                    col: Math.random() > 0.5 ? '#ffaa00' : '#ff4400'
                });
            }

            // Ground Radiance
            ctx.fillStyle = 'rgba(255, 122, 26, 0.14)';
            ctx.beginPath();
            ctx.ellipse(cx, baseMoundY + 4, pW * 1.1, 11, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Stages 16+ ($55k+): Twin Harvest (Left Jack)
    if (mc >= 55000) {
        const b1x = 135, b1y = groundY - 18;
        pRect(b1x, b1y, 22, 16, '#ff7a1a');
        pRect(b1x + 3, b1y - 3, 3, 4, '#3d2614');
        pRect(b1x + 4, b1y + 4, 4, 2, '#ffea00');
        pRect(b1x + 13, b1y + 4, 4, 2, '#ffea00');
        pRect(b1x + 6, b1y + 9, 10, 2, '#ffea00');
    }

    // Stages 17+ ($75k+): Trio of the Dead (Right Jack)
    if (mc >= 75000) {
        const b2x = 340, b2y = groundY - 20;
        pRect(b2x, b2y, 24, 18, '#ff7a1a');
        pRect(b2x + 4, b2y - 3, 3, 4, '#3d2614');
        pRect(b2x + 5, b2y + 4, 4, 2, '#ffea00');
        pRect(b2x + 14, b2y + 4, 4, 2, '#ffea00');
        pRect(b2x + 7, b2y + 10, 10, 2, '#ffea00');

        // Bats Flapping
        farmState.bats.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < 15 || b.x > 465) b.vx *= -1;
            if (b.y < 15 || b.y > 85) b.vy *= -1;
            b.frame = Math.floor(farmState.time * 0.16) % 2;
            const bx = Math.floor(b.x);
            const by = Math.floor(b.y);
            pRect(bx + 3, by + 1, 3, 3, '#000');
            if (b.frame === 0) {
                pRect(bx, by - 2, 2, 3, '#000');
                pRect(bx + 2, by - 1, 2, 2, '#000');
                pRect(bx + 5, by - 1, 2, 2, '#000');
                pRect(bx + 7, by - 2, 2, 3, '#000');
            } else {
                pRect(bx, by + 3, 2, 3, '#000');
                pRect(bx + 2, by + 2, 2, 2, '#000');
                pRect(bx + 5, by + 2, 2, 2, '#000');
                pRect(bx + 7, by + 3, 2, 3, '#000');
            }
        });
    }

    // Stages 19+ ($180k+): Demonic Cemetery Mist & Extra Jack
    if (mc >= 180000) {
        // Fourth & Fifth Mini Pumpkins
        pRect(185, groundY - 14, 16, 12, '#ff7a1a');
        pRect(188, groundY - 16, 2, 3, '#3d2614');
        pRect(189, groundY - 11, 2, 2, '#ffea00');
        pRect(194, groundY - 11, 2, 2, '#ffea00');

        pRect(288, groundY - 13, 16, 12, '#ff7a1a');
        pRect(291, groundY - 15, 2, 3, '#3d2614');
        pRect(292, groundY - 10, 2, 2, '#ffea00');
        pRect(297, groundY - 10, 2, 2, '#ffea00');

        // Rolling purple mist
        const mistGrad = ctx.createLinearGradient(0, groundY - 24, 0, groundY + 12);
        mistGrad.addColorStop(0, 'rgba(139, 92, 246, 0)');
        mistGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.16)');
        mistGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, groundY - 24, W, 36);
    }

    // 8. Autumn Falling Leaves Particle Simulation
    farmState.ambientLeaves.forEach(l => {
        l.x += l.vx;
        l.y += l.vy;
        if (l.x > W) { l.x = -5; l.y = Math.random() * 160; }
        if (l.y > groundY + 10) { l.y = 10; l.x = Math.random() * W; }
        pRect(l.x, l.y, l.size + 1, l.size, l.col);
    });

    // 9. Render Spores / Fire Embers
    for (let i = farmState.particles.length - 1; i >= 0; i--) {
        const p = farmState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        pRect(p.x, p.y, 2, 2, p.col);
        if (p.life <= 0) farmState.particles.splice(i, 1);
    }
}

// Animation loop
function loop() {
    farmState.time++;

    // Smoothly interpolate currentMC -> targetMC
    if (Math.abs(farmState.currentMC - farmState.targetMC) > 10) {
        farmState.currentMC += (farmState.targetMC - farmState.currentMC) * 0.08;
    } else {
        farmState.currentMC = farmState.targetMC;
    }

    updateHUD(farmState.currentMC);
    drawScene(farmState.currentMC);

    requestAnimationFrame(loop);
}

// Control Event Handlers
tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tierButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mc = parseFloat(btn.dataset.mc);
        farmState.targetMC = mc;
        if (sliderEl) sliderEl.value = Math.min(100000, mc);
        if (sliderDisplayEl) sliderDisplayEl.textContent = formatUSD(mc);
    });
});

if (sliderEl) {
    sliderEl.addEventListener('input', (e) => {
        tierButtons.forEach(b => b.classList.remove('active'));
        const mc = parseFloat(e.target.value);
        farmState.targetMC = mc;
        if (sliderDisplayEl) sliderDisplayEl.textContent = formatUSD(mc);
    });
}

// Live pump.fun / DexScreener Fetcher
async function pollPumpFunMarketCap() {
    if (!CONTRACT_ADDRESS) return;

    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const liveMC = pair.marketCap || pair.fdv;
            if (liveMC && liveMC > 0) {
                farmState.targetMC = liveMC;
                farmState.isLive = true;
                if (statusTextEl) statusTextEl.textContent = 'LIVE PUMP.FUN MC';
                if (liveDotEl) {
                    liveDotEl.style.background = '#7ddc1f';
                    liveDotEl.style.boxShadow = '0 0 10px #7ddc1f';
                }
                if (sliderEl) sliderEl.value = Math.min(100000, liveMC);
                if (sliderDisplayEl) sliderDisplayEl.textContent = formatUSD(liveMC);
            }
        }
    } catch (err) {
        console.warn('Live MC poll failed, keeping local state:', err);
    }
}

// Start Engine
if (canvas) {
    loop();
    if (CONTRACT_ADDRESS) {
        pollPumpFunMarketCap();
        setInterval(pollPumpFunMarketCap, 12000); // Poll every 12s
    }
}

