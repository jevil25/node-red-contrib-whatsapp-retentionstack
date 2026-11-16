const API = 'https://wp-rapidapi.retentionstack.agency/v1/sendText';

module.exports = function (RED) {
  function WhatsAppConfig(n) {
    RED.nodes.createNode(this, n);
    this.session = n.session || 'default';
  }
  RED.nodes.registerType('whatsapp-rs-config', WhatsAppConfig, {
    credentials: { apiKey: { type: 'password' } },
  });

  function WhatsAppSend(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const config = RED.nodes.getNode(n.config);

    node.on('input', async (msg, send, done) => {
      const apiKey = config && config.credentials && config.credentials.apiKey;
      const chatId = String(msg.to || n.to || '').trim();
      const text = typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload);
      if (!apiKey) return done(new Error('No API key: add one in the WhatsApp account config node'));
      if (!chatId) return done(new Error('No recipient: set "To" on the node or msg.to'));
      if (!text) return done(new Error('No message: msg.payload is empty'));

      node.status({ fill: 'blue', shape: 'dot', text: 'sending' });
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, text, session: config.session }),
        });
        const body = await res.json().catch(() => ({}));
        msg.payload = body;
        msg.statusCode = res.status;
        if (!res.ok) {
          node.status({ fill: 'red', shape: 'ring', text: `HTTP ${res.status}` });
          return done(new Error((body.error && body.error.message) || `HTTP ${res.status}`));
        }
        node.status({ fill: 'green', shape: 'dot', text: 'sent' });
        send(msg);
        done();
      } catch (err) {
        node.status({ fill: 'red', shape: 'ring', text: 'network error' });
        done(err);
      }
    });
  }
  RED.nodes.registerType('whatsapp-rs-send', WhatsAppSend);
};
