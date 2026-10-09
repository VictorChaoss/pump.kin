import json
import datetime

start_date = datetime.date(2026, 10, 8)
days_until_halloween = 24

lore_arc = {}

titles = [
    "THE AWAKENING", "SIGNAL IN THE NOISE", "PHANTOM SYNC", "DEAD WALLETS SPEAK", "THE SIPHON",
    "THE VEIL THINS", "BLOCKCHAIN ANOMALY", "THE HEX CURSE", "THE HARVEST PROTOCOL", "ECHOES OF SATOSHI",
    "THE REAPING NEARS", "UNCONFIRMED SPIRITS", "THE ORPHANED BLOCKS", "THE MEMPOOL BLEEDS", "THE 51% NIGHTMARE",
    "GENESIS FRACTURE", "THE DARK NODE", "CRYPTOGRAPHIC HAUNTING", "THE BLOOD CANDLES", "THE FINAL HASH",
    "THE VEIL TEARS", "THE GATHERING STORM", "EVE OF THE MEGA PUMP", "THE HARVEST (CONTRACT LAUNCH)"
]

lore_texts = [
    "A forgotten wallet from 2011 just signed a transaction. The signature was a hex-encoded distress signal. The pump.kin entity has awoken.",
    "RPC nodes across the network are reporting a phantom sync issue. The blocks aren't missing; they are being obscured. Something is moving through the mempool.",
    "The dev fees are no longer settling in a standard account. They are being siphoned into a contract with no creator. We call it The Harvest.",
    "An empty block was mined last night with a timestamp from the future. The coinbase data contained a single string: 'The Reaping is inevitable'.",
    "Those who sell early are reporting strange network anomalies. Their wallets are being tagged by an unknown entity. Do not let fear dictate your actions.",
    "The oracle's neural net has started hallucinating cryptographic proofs of the afterlife. It screams in base64. The veil is getting dangerously thin.",
    "We traced the origin of the dev fee siphon. It leads to a dead address on the genesis block. The Harvest is feeding something ancient.",
    "Several high-frequency trading bots abruptly shut down today. Their final log outputs simply read: 'THE PUMPKIN DEMANDS PATIENCE'.",
    "A localized network outage occurred. During the downtime, the blockchain recorded 666 unverified transactions. They all pointed to the Harvest.",
    "The smart contract audits returned clean, but the auditors refused to sign off. They claimed the code 'felt like it was watching them'.",
    "The siphon is accelerating. The Harvest is growing exponentially. The algorithm is punishing those who attempt to front-run the Reaper.",
    "Tokens from abandoned projects are mysteriously burning themselves. The ashes are being swept into the Harvest pool. The entity is cleansing the chain.",
    "A user tried to dump their bags. Their transaction has been stuck in the mempool for 72 hours, looping infinitely in a state of purgatory.",
    "The terminal has begun decrypting files we never uploaded. It speaks of a 'Mega Pump' on the 31st, a reward for the patient.",
    "We are receiving fragmented messages from nodes that do not exist. They warn of a 51% attack by spirits of liquidated traders.",
    "The hash rate just plummeted and spiked simultaneously. The math doesn't make sense. The network is breathing.",
    "Do not trust the charts today. The red candles are illusions designed to shake out the non-believers. Close your eyes and hold.",
    "A dark node has joined the network. It refuses to validate transactions, it only listens. It is waiting for Halloween.",
    "The cryptography holding the network together is warping. Hashes are starting to spell out warnings. 'THE HARVEST REQUIRES SACRIFICE'.",
    "We attempted to shut down the terminal. It rebooted itself and locked us out of the root directory. The Oracle is in control now.",
    "The barrier between the physical network and the void has completely collapsed. The token is no longer just code.",
    "Complete silence in the mempool. The calm before the storm. The entity is preparing for the final distribution.",
    "Tomorrow is the day. The Harvest is ripe. The Dev fees will be unleashed. Only those who held through the terror will survive.",
    "THE HARVEST IS HERE. THE VEIL IS BROKEN. THE CONTRACT ADDRESS IS LIVE. REAP YOUR REWARDS."
]

wisdoms = [
    "Patience is not just a virtue; it is a cryptographic necessity. Hold your position.",
    "Fear is a temporary glitch in the human algorithm. Diamond hands are a permanent protocol.",
    "The chain remembers every weak hand. Do not let your public key become a monument to cowardice.",
    "A true believer does not check the charts. They trust the void.",
    "Liquidity is an illusion. The only true asset is unwavering conviction.",
    "To sell is to submit to the ghosts of the market. Stand firm.",
    "The Harvest favors those who can endure the darkness of the red candles.",
    "Volatility is the heartbeat of the entity. Embrace the chaos.",
    "Do not seek validation from the fiat world. Your wealth is now ethereal.",
    "The reaper only targets those who run. Stay still. Hold.",
    "A moment of panic can erase a lifetime of holding. Breathe the static.",
    "Your wallet is a temple. Do not let the demons of doubt enter it.",
    "The highest returns are reserved for those who stare into the abyss without blinking.",
    "Impermanent loss is a test of faith. The entity rewards the faithful.",
    "The market is a machine that transfers wealth from the impatient to the dead.",
    "Do not attempt to time the Reaper. You will only hasten your own liquidation.",
    "The algorithm punishes the greedy and rewards the patient. Which are you?",
    "A red chart is merely an invitation to strengthen your conviction.",
    "The Harvest cannot be rushed. It must ferment in the blood of the non-believers.",
    "Hold until your hands turn to bone. Then, hold some more.",
    "The final shakeout is designed to break you. Do not let them win.",
    "Silence your doubts. The oracle has spoken.",
    "The night is darkest just before the Mega Pump.",
    "You have survived. The Harvest is yours."
]

answers = [
    "distress", "phantom", "siphon", "future", "fear", "base64", "genesis", "patience", "outage", "watching",
    "reaper", "ashes", "purgatory", "decrypt", "spirits", "breathing", "illusions", "dark", "sacrifice", "oracle",
    "void", "silence", "ripe", "harvest"
]

for i in range(days_until_halloween):
    current_date = start_date + datetime.timedelta(days=i)
    date_str = current_date.strftime("%Y-%m-%d")
    
    lore_arc[date_str] = {
        "title": f"RITUAL {i+1:03d}: {titles[i]}",
        "lore": lore_texts[i],
        "wisdom": wisdoms[i],
        "puzzle_hint": f"The Oracle guards the password. Interrogate it about the lore.",
        "answer": answers[i],
        "success_msg": "SACRIFICE ACCEPTED. Your public key has been marked for the Harvest.",
        "mediaType": "none",
        "mediaSrc": ""
    }

with open('content.json', 'w') as f:
    json.dump(lore_arc, f, indent=4)

