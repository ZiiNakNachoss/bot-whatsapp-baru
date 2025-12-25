const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const readline = require("readline")

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false // tutup QR
  })

  sock.ev.on("creds.update", saveCreds)

  // Jika belum login, generate 8-digit code
  if (!state.creds.registered) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question("Masukkan nombor WhatsApp (contoh 60123456789): ", async (number) => {
      const code = await sock.requestPairingCode(number)
      console.log("PAIRING CODE (8 digit):", code)
      console.log("Masukkan code ni di WhatsApp → Linked Devices → Link a Device → Enter code")
      rl.close()
    })
  }

  // Auto-reply bot
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation?.toLowerCase()
    const jid = msg.key.remoteJid

    if (text === "list") {
      await sock.sendMessage(jid, {
        text: "📋 MENU\n1️⃣ Diamond MLBB\n2️⃣ Netflix Premium"
      })
    }

    if (text === "1") {
      await sock.sendMessage(jid, {
        text: "💎 DIAMOND MLBB\n86 = RM5\n172 = RM10"
      })
    }

    if (text === "2") {
      await sock.sendMessage(jid, {
        text: "🎬 NETFLIX PREMIUM\n1 Bulan = RM15"
      })
    }
  })
}

start()
