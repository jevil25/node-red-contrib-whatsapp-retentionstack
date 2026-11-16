// Stub of the Node-RED runtime: enough to drive the send node without installing Node-RED.
const assert = require('node:assert');
const types = {};
const nodes = {};
const RED = {
  nodes: {
    createNode(node, n) { node.handlers = {}; node.on = (e, f) => (node.handlers[e] = f); node.status = (s) => (node.lastStatus = s); node.credentials = n.credentials; },
    registerType(name, ctor) { types[name] = ctor; },
    getNode(id) { return nodes[id]; },
  },
};
require('./whatsapp.js')(RED);

function make(type, n) { const o = {}; types[type].call(o, n); return o; }
function run(node, msg) {
  return new Promise((resolve) => node.handlers.input(msg, (m) => resolve({ sent: m }), (err) => err && resolve({ err })));
}

(async () => {
  nodes.cfg = make('whatsapp-rs-config', { session: 'default', credentials: { apiKey: 'ch_live_invalid' } });
  const send = make('whatsapp-rs-send', { config: 'cfg', to: '10000000000' });

  const bad = await run(send, { payload: 'test' });
  assert.match(bad.err.message, /token/i, 'API error message passes through');
  assert.equal(send.lastStatus.text, 'HTTP 401');

  const noTo = make('whatsapp-rs-send', { config: 'cfg', to: '' });
  assert.match((await run(noTo, { payload: 'x' })).err.message, /recipient/);

  nodes.empty = make('whatsapp-rs-config', { credentials: {} });
  const noKey = make('whatsapp-rs-send', { config: 'empty', to: '1' });
  assert.match((await run(noKey, { payload: 'x' })).err.message, /API key/);

  console.log('ok: 401 passthrough, missing recipient, missing key');
})();
