import { LORE, listDays, publicEntry, currentKey, isUnlocked } from './_lore.js';

// GET /api/daily            -> today's transmission + list of all days
// GET /api/daily?day=YYYY-MM-DD -> a specific (already unlocked) transmission
export default function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    const now = new Date();
    const current = currentKey(now);
    const days = listDays(now);
    const key = (req.query && req.query.day) || current;

    if (key && !isUnlocked(key, now)) {
        return res.status(403).json({ error: 'sealed', current, days });
    }

    return res.status(200).json({
        current,
        days,
        entry: key && LORE[key] ? publicEntry(key) : null,
    });
}
