// =========================================================================
//   PUMP.KIN — MASTER LAUNCH CONFIGURATION
//   ON LAUNCH DAY: JUST PASTE YOUR PUMP.FUN CA ON LINE 8 AND SAVE!
// =========================================================================

const PUMPKIN_CONFIG = {
    // 1. Paste your pump.fun coin Mint / Contract Address here:
    CONTRACT_ADDRESS: 'Gm4UfuuMNgLGKgEqV1iEeUYhStGZQmyo3FdEXnoRpump',

    // 2. (Optional) Public Harvest Pot Wallet:
    //    If left empty, the site will automatically track the coin's creator wallet!
    HARVEST_WALLET: '',

    // Target Reaping Date (October 31st 00:00:00 UTC)
    REAPING_DATE: new Date('2026-10-31T00:00:00Z'),

    // Official Social Links
    X_URL: 'https://x.com/pumpkinonchain',
    TELEGRAM_URL: 'https://t.me',
};

if (typeof window !== 'undefined') {
    window.PUMPKIN_CONFIG = PUMPKIN_CONFIG;
}
