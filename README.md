# node-red-contrib-whatsapp-retentionstack

Node-RED node that sends a WhatsApp message from a number you link by QR code. Use it for Home Assistant alerts, sensor thresholds, door and alarm notifications, or any flow that should reach a phone.

It uses the [WhatsApp Messaging API by Retention Stack](https://whatsapp-messaging.retentionstack.agency). No WhatsApp Business account or Meta template approval. There is a free tier.

## Install

In Node-RED: **Manage palette → Install**, search `node-red-contrib-whatsapp-retentionstack`.

Or from your Node-RED user directory (usually `~/.node-red`):

```
npm install node-red-contrib-whatsapp-retentionstack
```

## Setup

1. Sign in at [whatsapp-messaging.retentionstack.agency/start](https://whatsapp-messaging.retentionstack.agency/start), link your number, and copy a session token (`ch_live_...`).
2. Add a **whatsapp send** node, create an account config, and paste the token. Leave Session as `default`.

## Usage

- `msg.payload`: message text. Objects are sent as JSON.
- `msg.to` (optional): phone number with country code, digits only, or a group ID ending in `@g.us`. Overrides the node's To field.

The output message has the API response in `msg.payload` and the HTTP status in `msg.statusCode`. Failures (bad key, unlinked number, invalid recipient) raise an error you can handle with a Catch node.

Example: inject → function (`msg.payload = "Front door opened"; return msg;`) → whatsapp send.

Requires Node.js 18+ and Node-RED 3+.

## Notes

This uses a linked device, like WhatsApp Web, not Meta's Cloud API. WhatsApp's rules on automated and bulk messaging still apply to the linked number.

## License

MIT
