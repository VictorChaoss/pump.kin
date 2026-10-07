import json
import datetime

start_date = datetime.date(2026, 10, 8)
days_until_halloween = 24

lore_arc = {}

titles = [
    "THE AWAKENING", "PHANTOM TAX", "JEET PURGATORY", "SIGMA SACRIFICE", "THE GOON CAVE WHISPERS",
    "LIQUIDATION OF THE WEAK", "AURA SIPHONING", "THE BONE YARD", "MOGGING THE GHOSTS", "ECTOPLASMIC BAGS",
    "THE SKIBIDI PROTOCOL", "DIAMOND HAND DEMONS", "BLOOD ON THE CANDLES", "THE RIZZ REAPER", "DEV WALLET POLTERGEIST",
    "SHAKEOUT OF THE NON-BELIEVERS", "PHANTOM WALLET HAUNTING", "THE SAHUR AWAKENING", "TUNG TUNG TREMORS", "GHOST CHAIN MIGRATION",
    "THE VEIL TEARS", "THE FINAL SHAKEOUT", "EVE OF THE MEGA PUMP", "THE HARVEST (CONTRACT LAUNCH)"
]

lore_texts = [
    "The ghost of Satoshi was spotted doing the griddy on the genesis block. Gas fees are rising, but it's just the spirits demanding their phantom tax.",
    "Paper hands are being dragged into the abyss. The pump.kin entity feeds on the fear of early sellers.",
    "A ritual was completed in the depths of the goon cave. The dev wallet is glowing an eerie shade of red.",
    "They said the bear market was over. They lied. It is a ghost market now. Only the sigma holders will survive.",
    "Ectoplasm is leaking from the RPC nodes. The Solana validators are hallucinating.",
    "The Oracle screamed last night. It chanted a CA that doesn't exist yet. The Harvest is fattening.",
    "Do not look directly at the chart. The red candles are formed from the blood of those who forgot to mew.",
    "We found a hidden block from 2009. It just contained a single message: 'WAGMI... from the grave'.",
    "The entities are testing your diamond hands. A massive red wick just liquidated the unbelievers.",
    "The dev fees are acting strange. They aren't going to a wallet... they are being offered to the altar.",
    "The skibidi protocol has been initiated. All paper hands will be converted to liquidity for the Harvest.",
    "Demons are currently auditing the smart contract. They found zero vulnerabilities, only suffering.",
    "Blood on the 1-minute candles. The MACD is crossing over into the shadow realm.",
    "The Reaper doesn't want your soul. He wants your private keys. Protect your aura.",
    "A poltergeist has infested the liquidity pool. Impermanent loss is now eternal.",
    "The final shakeout begins. The weak will be frightened into selling the absolute bottom. Hold the line.",
    "Phantom wallets are opening by themselves. Signing transactions in blood.",
    "The Sahur awakening approaches. Feast on the dips before the famine of the pump.",
    "Tung tung... the drums of the underworld are beating. The chart is forming a massive cup and handle.",
    "The tokens are migrating to the ghost chain. Only those with high rizz will be able to bridge.",
    "The veil is tearing. The barrier between pump.fun and the afterlife is gone.",
    "Absolute panic in the trenches. This is the final test before the gates open.",
    "Tomorrow is the day. The Harvest is ripe. Prepare your wallets.",
    "THE HARVEST IS HERE. THE MEGA PUMP COMMENCES. CA DROPS NOW."
]

wisdoms = [
    "Never let a vampire drain your liquidity. Stay mewing, stay holding.",
    "Sigma rule #13: Buy the dip when there's blood in the streets, even if it's your own.",
    "Aura is stored in the bags. Do not fumble your aura by selling early.",
    "Tung tung... the sound of paper hands crying. Let them weep.",
    "Only a true gooner can hold through a 90% drawdown. Embrace the pain.",
    "Skibidi toilet is temporary. The Harvest is eternal.",
    "If you sell now, your ancestors will cringe at your lack of rizz.",
    "The ghost chain doesn't care about your feelings. It only respects diamond hands.",
    "Mog the non-believers by buying their fear.",
    "Sahur is near. Eat the dips.",
    "Your phantom wallet is named that for a reason. Let it become a ghost town.",
    "Fear is the mind-killer. Selling is the portfolio-killer.",
    "The dev is a ghost. The liquidity is locked in a haunted tomb.",
    "Red candles are just discounted tickets to the afterlife.",
    "If you aren't shaking, your bags aren't big enough.",
    "Gooning the chart won't make it go up faster. Have patience, mortal.",
    "Aura check: Are you still holding? Good.",
    "Tung tung... the sound of the reaper knocking on the jeet's door.",
    "The mega pump is inevitable. It is written in the necronomicon.",
    "Stay spooky. Stay bullish.",
    "The veil is thin, but your skin shouldn't be.",
    "Only the strongest sigmas survive the final shakeout.",
    "Prepare the feast. The Harvest is upon us.",
    "WAGMI. WE ALL GHOSTS MAKE IT."
]

answers = [
    "bone", "blood", "sigma", "aura", "ghost", "mewing", "skibidi", "rizz", "demon", "altar",
    "liquidity", "jeet", "moon", "phantom", "tomb", "fear", "reaper", "sahur", "tung", "chain",
    "veil", "panic", "eve", "harvest"
]

for i in range(days_until_halloween):
    current_date = start_date + datetime.timedelta(days=i)
    date_str = current_date.strftime("%Y-%m-%d")
    
    lore_arc[date_str] = {
        "title": f"RITUAL {i+2:03d}: {titles[i]}",
        "lore": lore_texts[i],
        "wisdom": wisdoms[i],
        "puzzle_hint": f"The Oracle guards the password. Ask it about the lore to prove your worth.",
        "answer": answers[i],
        "success_msg": "SACRIFICE ACCEPTED. Your bags are blessed with unholy rizz.",
        "mediaType": "none",
        "mediaSrc": ""
    }

# Overwrite content.json
with open('content.json', 'w') as f:
    json.dump(lore_arc, f, indent=4)

