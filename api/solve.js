import { LORE, isUnlocked } from './_lore.js';

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// POST /api/solve { day, answer } -> { correct, message }
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { day, answer } = req.body || {};

    if (!day || !isUnlocked(day)) {
        return res.status(400).json({ error: 'No active puzzle for that day.' });
    }

    const correct = norm(answer) !== '' && norm(answer) === norm(LORE[day].answer);

    return res.status(200).json({
        correct,
        message: correct ? LORE[day].success_msg : null,
    });
}
