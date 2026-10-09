// ---- Launch config: edit these on launch day ----
const REAPING_DATE = new Date('2026-10-31T00:00:00Z'); // countdown target (UTC)
const CONTRACT_ADDRESS = '';                          // paste the CA here when live
// ---------------------------------------------------

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
    caValue.textContent = CONTRACT_ADDRESS;
} else {
    caCopy.style.display = 'none';
}

caCopy.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(CONTRACT_ADDRESS);
        caCopy.textContent = 'copied';
        setTimeout(() => (caCopy.textContent = 'copy'), 1500);
    } catch (e) {
        caCopy.textContent = 'failed';
    }
});
