// ==UserScript==
// @name         TidyChat
// @namespace    tidychat
// @version      1.0.0
// @description  Calmer Kick chat: pause on hover, keep deleted messages, ignore clears, hide sub and gift spam, timestamps
// @license      MIT
// @match        https://kick.com/*
// @grant        none
// @inject-into  page
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEY = 'kct-settings';

  const DEFAULTS = {
    chatSelector: '#chatroom-messages',
    pauseOnHover: true,
    pauseKey: 'Control',
    maxHeld: 500,
    keepOnClear: true,
    showDeleted: true,
    deletedStyle: 'fade-strike',
    timestamps: true,
    timestamp24h: true,
    timestampSeconds: false,
    showButton: true,
    hideRewards: true,
    hideGetKicks: true,
    hideChannelPoints: true,
    hideGiftShop: true,
    hideOpenChat: true,
    startTheatre: true,
    startChatClosed: false,
    theatreButtonPattern: 'theat(re|er)',
    chatButtonPattern: '(collapse|close|hide).{0,12}chat|chat.{0,12}(collapse|close|hide)',
    hideSubs: true,
    hideGifts: true,
    hideKicks: true,
    hideUsers: '',
    hidePatterns: '',
    hideRowText: '',
    hideRowSelectors: '',
    hideSelectors: '',
    hideEventsExtra: '',
    hideMessageTypes: '',
    logEvents: false
  };

  const CATEGORIES = [
    {
      label: 'Chat Behavior',
      items: [
        { key: 'pauseOnHover', type: 'bool', label: 'Pause chat on mouse hover', desc: 'New messages are held until the mouse leaves chat.' },
        { key: 'pauseKey', type: 'select', label: 'Pause chat while holding', options: [['', 'Disabled'], ['Control', 'Ctrl'], ['Alt', 'Alt'], ['Shift', 'Shift']] },
        { key: 'maxHeld', type: 'number', label: 'Maximum held messages', desc: 'Held messages are released once this many are queued.', min: 50, max: 5000 },
        { key: 'keepOnClear', type: 'bool', label: 'Do not clear chat', desc: 'Ignore moderator chat clears.' }
      ]
    },
    {
      label: 'Deleted Messages',
      items: [
        { key: 'showDeleted', type: 'bool', label: 'Show deleted messages', desc: 'Only messages received while the page is open can be recovered.' },
        { key: 'deletedStyle', type: 'select', label: 'Deleted message style', options: [['fade', 'Faded'], ['strike', 'Strikethrough'], ['fade-strike', 'Faded and strikethrough'], ['blur', 'Blurred until hover']] }
      ]
    },
    {
      label: 'Appearance',
      items: [
        { key: 'timestamps', type: 'bool', label: 'Show timestamps' },
        { key: 'timestamp24h', type: 'bool', label: '24-hour time' },
        { key: 'timestampSeconds', type: 'bool', label: 'Show seconds' },
        { key: 'showButton', type: 'bool', label: 'Show settings button', desc: 'Shown in the top bar, or over chat when the top bar is hidden. Alt+Shift+K always opens this dialog.' }
      ]
    },
    {
      label: 'Interface',
      items: [
        { key: 'hideRewards', type: 'bool', label: 'Hide reward chest', desc: 'The animated "Claim Your Reward" button in the top bar.' },
        { key: 'hideGetKicks', type: 'bool', label: 'Hide "Get KICKs" button', desc: 'In the top bar.' },
        { key: 'hideChannelPoints', type: 'bool', label: 'Hide channel points', desc: 'Below the chat input.' },
        { key: 'hideGiftShop', type: 'bool', label: 'Hide Kicks gift shop button', desc: 'Below the chat input.' },
        { key: 'hideOpenChat', type: 'bool', label: 'Hide "Chat" button over the player', desc: 'Shown by Kick when chat is collapsed. With this on, collapsed chat can only be reopened by turning this off.' },
        { key: 'startTheatre', type: 'bool', label: 'Start in theatre mode', desc: 'Applied once each time a channel opens.' },
        { key: 'startChatClosed', type: 'bool', label: 'Start with chat closed', desc: 'Applied once each time a channel opens.' }
      ]
    },
    {
      label: 'Filtering',
      items: [
        { key: 'hideSubs', type: 'bool', label: 'Hide subscription notices', desc: 'Includes resub messages.' },
        { key: 'hideGifts', type: 'bool', label: 'Hide gifted subscription notices' },
        { key: 'hideKicks', type: 'bool', label: 'Hide Kicks gifts' },
        { key: 'hideUsers', type: 'list', label: 'Hidden users', desc: 'Usernames separated by spaces, commas or new lines.', placeholder: 'botrix\nkickbot' },
        { key: 'hidePatterns', type: 'list', check: 'regex', label: 'Hidden message patterns', desc: 'One regular expression per line, matched against the raw message.', placeholder: '^!\\w+' },
        { key: 'hideRowText', type: 'list', check: 'regex', label: 'Hidden chat line patterns', desc: 'One regular expression per line, matched against the rendered chat line text.' }
      ]
    },
    {
      label: 'Advanced',
      items: [
        { key: 'chatSelector', type: 'text', check: 'selector', label: 'Chat container selector' },
        { key: 'hideRowSelectors', type: 'list', check: 'selector', label: 'Hidden chat line selectors', desc: 'One CSS selector per line. Chat lines containing a match are hidden.' },
        { key: 'hideSelectors', type: 'list', check: 'selector', label: 'Hidden page elements', desc: 'One CSS selector per line, e.g. the top gifters bar.' },
        { key: 'hideEventsExtra', type: 'text', check: 'regex', label: 'Extra socket events to drop', desc: 'Regular expression matched against event names.' },
        { key: 'hideMessageTypes', type: 'text', label: 'Extra message types to drop', desc: 'Separated by spaces or commas.' },
        { key: 'theatreButtonPattern', type: 'text', check: 'regex', label: 'Theatre button pattern', desc: 'Matched against button labels, titles, test ids and icon names.' },
        { key: 'chatButtonPattern', type: 'text', check: 'regex', label: 'Close chat button pattern', desc: 'Matched against button labels, titles, test ids and icon names.' },
        { key: 'logEvents', type: 'bool', label: 'Log socket events to the console', desc: 'Each new event name and message type is logged once.' }
      ]
    }
  ];

  const INTERFACE_SELECTORS = {
    hideRewards: ['button[aria-label="Claim Your Reward"]', 'nav button:has(video[src*="/rewards/"])'],
    hideGetKicks: ['[data-testid="kicks-top-nav"]'],
    hideChannelPoints: ['[data-testid="channel-points-button"]'],
    hideGiftShop: ['[data-testid="gift-shop-button"]'],
    hideOpenChat: ['.z-controls button:has(svg[data-ds-icon="MessagesOutline"])']
  };
  const GEAR_ANCHOR = '[data-testid="kicks-top-nav"]';
  const KICKS_ROW = '[data-ds-icon^="Kicks"], img[src*="/kicks/"]';
  const GIFT_TEXT = /\bgift(ed|s)?\b/;
  const SUB_TEXT = /\b(re)?subscribed\b/;
  const GEAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';

  const STYLE = `
    .kct-hidden{display:none!important}
    [data-kct-time]::before{content:attr(data-kct-time);display:inline;margin-right:.45em;font-size:.72em;font-weight:400;font-style:normal;text-decoration:none;color:#6b7075;opacity:1;font-variant-numeric:tabular-nums;vertical-align:baseline;align-self:baseline;white-space:nowrap}
    #kct-pause{position:fixed;z-index:9999;display:none;box-sizing:border-box;padding:6px 10px;border-radius:0;background:rgba(20,20,20,.92);color:#fff;font:600 13px/1.3 system-ui,sans-serif;text-align:center;cursor:pointer;user-select:none}
    #kct-gear{position:fixed;z-index:9999;display:none;width:26px;height:26px;padding:0;border:0;border-radius:0;background:rgba(20,20,20,.75);color:#fff;opacity:.45;cursor:pointer;align-items:center;justify-content:center}
    #kct-gear:hover{opacity:1}
    #kct-gear.kct-gear-nav{position:static;width:36px;height:36px;border-radius:0;background:transparent;opacity:1}
    #kct-gear.kct-gear-nav:hover{background:rgba(255,255,255,.1)}
    #kct-gear.kct-gear-nav svg{width:20px;height:20px}
    #kct-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font:14px/1.4 system-ui,sans-serif;color:#e8eaed}
    #kct-dialog{display:flex;flex-direction:column;width:min(760px,calc(100vw - 32px));height:min(560px,calc(100vh - 32px));background:#191b1f;border:1px solid #2f3337;border-radius:0;box-shadow:0 12px 40px rgba(0,0,0,.6);overflow:hidden}
    #kct-dialog header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #2f3337;font-weight:700;font-size:15px}
    #kct-dialog header button,#kct-dialog footer button{border:0;border-radius:0;background:#2f3337;color:#e8eaed;padding:6px 12px;cursor:pointer;font:inherit}
    #kct-dialog header button:hover,#kct-dialog footer button:hover{background:#3d4247}
    #kct-dialog .kct-body{display:flex;flex:1;min-height:0}
    #kct-dialog nav{width:180px;flex-shrink:0;padding:8px;border-right:1px solid #2f3337;overflow-y:auto}
    #kct-dialog nav button{display:block;width:100%;text-align:left;border:0;border-radius:0;background:none;color:#b8bcc2;padding:8px 10px;cursor:pointer;font:inherit}
    #kct-dialog nav button:hover{background:#24272b;color:#fff}
    #kct-dialog nav button.kct-active{background:#24272b;color:#53fc18;font-weight:600}
    #kct-dialog section{flex:1;padding:8px 20px 20px;overflow-y:auto}
    #kct-dialog h2{margin:12px 0 8px;font-size:16px}
    #kct-dialog .kct-field{padding:12px 0;border-bottom:1px solid #24272b}
    #kct-dialog .kct-field label{display:flex;gap:12px;align-items:flex-start;cursor:pointer}
    #kct-dialog .kct-title{font-weight:600}
    #kct-dialog .kct-desc{margin-top:2px;color:#9aa0a6;font-size:12.5px}
    #kct-dialog .kct-error{margin-top:4px;color:#ff6b6b;font-size:12.5px}
    #kct-dialog input[type=checkbox]{appearance:none;flex-shrink:0;position:relative;width:34px;height:18px;margin:2px 0 0;border-radius:0;background:#3d4247;cursor:pointer;transition:background .15s}
    #kct-dialog input[type=checkbox]::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:0;background:#fff;transition:transform .15s}
    #kct-dialog input[type=checkbox]:checked{background:#53fc18}
    #kct-dialog input[type=checkbox]:checked::after{transform:translateX(16px)}
    #kct-dialog select,#kct-dialog input[type=text],#kct-dialog input[type=number],#kct-dialog textarea{box-sizing:border-box;width:100%;margin-top:8px;padding:7px 9px;border:1px solid #3d4247;border-radius:0;background:#0f1113;color:#e8eaed;font:13px/1.4 ui-monospace,monospace}
    #kct-dialog textarea{min-height:76px;resize:vertical}
    #kct-dialog select:focus,#kct-dialog input:focus,#kct-dialog textarea:focus{outline:none;border-color:#53fc18}
    #kct-dialog footer{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid #2f3337;color:#9aa0a6;font-size:12.5px}
  `;

  /**
   * @typedef {{u: string, t: string, e: string[], c: number, d: boolean}} StoredMessage
   */

  /**
   * @returns {typeof DEFAULTS}
   */
  function loadSettings() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    const changed = Object.fromEntries(Object.entries(S).filter(([k, v]) => k in DEFAULTS && v !== DEFAULTS[k]));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(changed)); } catch {}
  }

  /**
   * @param {string} v
   * @returns {RegExp|null}
   */
  function toRegex(v) {
    try { return new RegExp(v, 'i'); } catch { return null; }
  }

  /**
   * @param {string} sel
   * @returns {boolean}
   */
  function validSelector(sel) {
    try {
      document.createDocumentFragment().querySelector(sel);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @param {string} v
   * @returns {string[]}
   */
  const lines = v => String(v).split('\n').map(x => x.trim()).filter(Boolean);

  /**
   * @param {string} v
   * @returns {string[]}
   */
  const words = v => String(v).split(/[\s,]+/).map(x => x.trim().toLowerCase()).filter(Boolean);

  /**
   * @param {typeof DEFAULTS} s
   */
  function compile(s) {
    const extra = s.hideEventsExtra.trim();
    return {
      users: new Set(words(s.hideUsers)),
      types: new Set([...words(s.hideMessageTypes), ...(s.hideSubs ? ['celebration'] : [])]),
      patterns: lines(s.hidePatterns).map(toRegex).filter(Boolean),
      rowText: lines(s.hideRowText).map(toRegex).filter(Boolean),
      rowSelectors: lines(s.hideRowSelectors).filter(validSelector),
      pageSelectors: lines(s.hideSelectors).filter(validSelector),
      extraEvents: extra ? toRegex(extra) : null,
      theatreRe: s.theatreButtonPattern.trim() ? toRegex(s.theatreButtonPattern.trim()) : null,
      chatRe: s.chatButtonPattern.trim() ? toRegex(s.chatButtonPattern.trim()) : null,
      timeFmt: new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        ...(s.timestampSeconds ? { second: '2-digit' } : {}),
        hour12: !s.timestamp24h
      })
    };
  }

  let S = loadSettings();
  let D = compile(S);

  /** @type {Map<string, StoredMessage>} */
  const store = new Map();
  /** @type {Array<() => void>} */
  const held = [];
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {WeakMap<Element, {text: string, m: StoredMessage|null, line: Element|null}>} */
  let rowCache = new WeakMap();
  /** @type {Map<string, number|null>} */
  const rowTimes = new Map();
  /** @type {Element|null} */
  let baselineFor = null;
  let baselineUntil = 0;
  let hover = false;
  let keyDown = false;
  let suppressed = false;
  let paused = false;
  let applyQueued = false;
  /** @type {HTMLDivElement|null} */
  let indicator = null;
  /** @type {HTMLButtonElement|null} */
  let gear = null;
  /** @type {HTMLStyleElement|null} */
  let dynStyle = null;
  /** @type {HTMLDivElement|null} */
  let backdrop = null;
  /** @type {string|null} */
  let startupPath = null;
  /** @type {{theatre: boolean, chat: boolean, until: number}|null} */
  let startupJob = null;

  /**
   * @param {string} s
   * @returns {string}
   */
  const norm = s => s.replace(/\[emote:\d+:[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  /**
   * @param {string} name
   * @param {any} data
   */
  function log(name, data) {
    if (!S.logEvents) return;
    const key = data?.type ? `${name}:${data.type}` : name;
    if (seen.has(key)) return;
    seen.add(key);
    console.info('[tidychat]', key, data);
  }

  /**
   * @param {string} name Socket event name or chat message type.
   * @returns {boolean}
   */
  function isSpam(name) {
    if (/kicks/i.test(name)) return S.hideKicks;
    if (/gift|luckyusers/i.test(name)) return S.hideGifts;
    if (/subscri/i.test(name)) return S.hideSubs;
    return false;
  }

  /**
   * @param {any} m
   * @returns {boolean}
   */
  function isHidden(m) {
    const type = String(m?.type ?? '');
    const content = String(m?.content ?? '');
    return D.types.has(type.toLowerCase())
      || (type !== 'message' && type !== 'reply' && isSpam(type))
      || D.users.has(String(m?.sender?.username ?? '').toLowerCase())
      || D.patterns.some(r => r.test(content));
  }

  /**
   * @param {any} data
   */
  function remember(data) {
    if (!data?.id || !data.sender?.username) return;
    const id = String(data.id);
    if (store.has(id)) return;
    const content = String(data.content ?? '');
    const c = Date.parse(data.created_at);
    store.set(id, {
      u: String(data.sender.username).toLowerCase(),
      t: norm(content),
      e: [...content.matchAll(/\[emote:(\d+):/g)].map(m => m[1]),
      c: Number.isNaN(c) ? Date.now() : c,
      d: false
    });
    if (store.size > 3000) store.delete(store.keys().next().value);
    queueApply();
  }

  /**
   * @param {any} data
   */
  function markDeleted(data) {
    const m = store.get(String(data?.message?.id ?? data?.id));
    if (!m) return;
    m.d = true;
    queueApply();
  }

  /**
   * @param {MessageEvent} ev
   * @param {(ev: MessageEvent) => void} deliver
   */
  function route(ev, deliver) {
    if (typeof ev.data !== 'string' || ev.data.charCodeAt(0) !== 123) return deliver(ev);
    let name, data;
    try {
      const msg = JSON.parse(ev.data);
      name = msg.event;
      data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
    } catch {
      return deliver(ev);
    }
    if (typeof name !== 'string' || name.startsWith('pusher')) return deliver(ev);
    log(name, data);
    if (name.endsWith('ChatMessageEvent')) {
      if (isHidden(data)) return;
      remember(data);
      if (paused) {
        held.push(() => deliver(ev));
        if (held.length >= S.maxHeld) release();
        updateIndicator();
        return;
      }
      return deliver(ev);
    }
    if (S.showDeleted && name.endsWith('MessageDeletedEvent')) return markDeleted(data);
    if (S.keepOnClear && name.endsWith('ChatroomClearEvent')) return;
    if (isSpam(name) || D.extraEvents?.test(name)) return;
    deliver(ev);
  }

  const NativeWS = window.WebSocket;

  /**
   * Routes every incoming frame through {@link route} before the page's own handlers see it.
   */
  class PatchedWS extends NativeWS {
    /**
     * @param {string|URL} url
     * @param {string|string[]} [protocols]
     */
    constructor(url, protocols) {
      super(url, protocols);
      /** @type {Set<EventListenerOrEventListenerObject>} */
      const handlers = new Set();
      /** @type {((ev: MessageEvent) => void)|null} */
      let onmsg = null;
      const deliver = ev => {
        if (onmsg) onmsg.call(this, ev);
        for (const h of handlers) {
          if (typeof h === 'function') h.call(this, ev);
          else h.handleEvent(ev);
        }
      };
      super.addEventListener('message', ev => route(ev, deliver));
      Object.defineProperty(this, 'onmessage', {
        configurable: true,
        get: () => onmsg,
        set: v => { onmsg = typeof v === 'function' ? v : null; }
      });
      this.addEventListener = (type, h, opts) => (type === 'message' ? h && handlers.add(h) : super.addEventListener(type, h, opts));
      this.removeEventListener = (type, h, opts) => (type === 'message' ? handlers.delete(h) : super.removeEventListener(type, h, opts));
    }
  }
  window.WebSocket = PatchedWS;

  /**
   * @param {string|undefined} url
   * @returns {boolean}
   */
  function isHistory(url) {
    if (!url) return false;
    try {
      const u = new URL(url, location.href);
      return u.hostname.endsWith('kick.com') && /\/(messages|history)\/?$/.test(u.pathname);
    } catch {
      return false;
    }
  }

  /**
   * Records history messages for timestamps and deletion matching, and strips hidden ones.
   * @param {any} body
   * @returns {{body: any, changed: boolean}}
   */
  function processHistory(body) {
    const holder = Array.isArray(body?.data?.messages) ? body.data : Array.isArray(body?.messages) ? body : null;
    if (!holder) return { body, changed: false };
    holder.messages.forEach(remember);
    const kept = holder.messages.filter(m => !isHidden(m));
    if (kept.length === holder.messages.length) return { body, changed: false };
    holder.messages = kept;
    return { body, changed: true };
  }

  const nativeFetch = window.fetch;
  window.fetch = async function (input, init) {
    const res = await nativeFetch.call(this, input, init);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
    if (!isHistory(url) || !res.ok) return res;
    try {
      const out = processHistory(await res.clone().json());
      if (!out.changed) return res;
      return new Response(JSON.stringify(out.body), { status: res.status, statusText: res.statusText, headers: res.headers });
    } catch {
      return res;
    }
  };

  const XHR = XMLHttpRequest.prototype;
  const nativeOpen = XHR.open;
  const textGetter = Object.getOwnPropertyDescriptor(XHR, 'responseText').get;
  const responseGetter = Object.getOwnPropertyDescriptor(XHR, 'response').get;
  /** @type {WeakMap<XMLHttpRequest, string>} */
  const xhrUrls = new WeakMap();
  /** @type {WeakMap<XMLHttpRequest, {text: string, json: any}|null>} */
  const xhrCache = new WeakMap();

  XHR.open = function (method, url, ...rest) {
    xhrUrls.set(this, String(url));
    return nativeOpen.call(this, method, url, ...rest);
  };

  /**
   * @param {XMLHttpRequest} xhr
   * @returns {{text: string, json: any}|null}
   */
  function xhrProcessed(xhr) {
    if (xhr.readyState !== 4 || !isHistory(xhrUrls.get(xhr))) return null;
    if (xhrCache.has(xhr)) return xhrCache.get(xhr);
    let result = null;
    try {
      const raw = xhr.responseType === 'json' ? responseGetter.call(xhr) : JSON.parse(textGetter.call(xhr));
      const out = processHistory(raw);
      result = { text: JSON.stringify(out.body), json: out.body };
    } catch {
      result = null;
    }
    xhrCache.set(xhr, result);
    return result;
  }

  Object.defineProperty(XHR, 'responseText', {
    configurable: true,
    get() {
      return xhrProcessed(this)?.text ?? textGetter.call(this);
    }
  });
  Object.defineProperty(XHR, 'response', {
    configurable: true,
    get() {
      const p = xhrProcessed(this);
      if (!p) return responseGetter.call(this);
      return this.responseType === 'json' ? p.json : this.responseType === '' || this.responseType === 'text' ? p.text : responseGetter.call(this);
    }
  });

  /**
   * @returns {Element|null}
   */
  function chatEl() {
    try { return document.querySelector(S.chatSelector); } catch { return null; }
  }

  /**
   * @returns {Element[]}
   */
  function rows() {
    const c = chatEl();
    if (!c) return [];
    const indexed = c.querySelectorAll('[data-index]');
    if (indexed.length) return [...indexed];
    let el = c;
    while (el.children.length === 1) el = el.children[0];
    return [...el.children];
  }

  /**
   * @param {Element} row
   * @param {string} text
   * @param {StoredMessage} m
   * @returns {boolean}
   */
  function matches(row, text, m) {
    if (!text.includes(m.u)) return false;
    if (m.t && !text.endsWith(m.t)) return false;
    if (m.e.length) {
      const html = row.innerHTML;
      if (!m.e.every(id => html.includes(`emotes/${id}`))) return false;
    }
    return !!(m.t || m.e.length);
  }

  /**
   * DOM-level fallback for notices rendered without a filterable socket event.
   * @param {Element} r
   * @param {string} text
   * @returns {boolean}
   */
  function rowHidden(r, text) {
    if (D.rowSelectors.some(s => r.matches(s) || r.querySelector(s))) return true;
    if (D.rowText.some(x => x.test(text))) return true;
    const user = (r.querySelector('button')?.textContent ?? '').trim().toLowerCase();
    if (user && text.includes(`${user}:`)) return D.users.has(user);
    if (r.querySelector(KICKS_ROW)) return S.hideKicks;
    if (GIFT_TEXT.test(text)) return S.hideGifts;
    if (SUB_TEXT.test(text)) return S.hideSubs;
    return false;
  }

  /**
   * Arrival-time fallback for rows that could not be matched to a socket or history message.
   * Rows present when the chat first appears get no time; rows only get stamped while chat is at the bottom.
   * @param {string} text
   * @param {Element} c
   * @returns {number|null}
   */
  function arrivalTime(text, c) {
    if (!text) return null;
    if (rowTimes.has(text)) return rowTimes.get(text);
    const baseline = Date.now() < baselineUntil;
    const atBottom = c.scrollHeight <= c.clientHeight || c.scrollHeight - c.scrollTop - c.clientHeight < 80;
    if (!baseline && !atBottom) return null;
    const t = baseline ? null : Date.now();
    rowTimes.set(text, t);
    if (rowTimes.size > 3000) rowTimes.delete(rowTimes.keys().next().value);
    return t;
  }

  /**
   * @param {RegExp|null} re
   * @returns {HTMLElement|null}
   */
  function findButton(re) {
    if (!re) return null;
    for (const b of document.querySelectorAll('button, [role="button"]')) {
      if (b.id === 'kct-gear' || b.closest('#kct-backdrop')) continue;
      const hay = [
        b.getAttribute('aria-label'),
        b.getAttribute('title'),
        b.getAttribute('data-testid'),
        b.querySelector('svg[data-ds-icon]')?.getAttribute('data-ds-icon'),
        b.textContent
      ].join(' ');
      if (re.test(hay)) return /** @type {HTMLElement} */ (b);
    }
    return null;
  }

  /**
   * Player controls only render after pointer activity over the player.
   */
  function wakePlayer() {
    let v = null;
    let best = 0;
    for (const el of document.querySelectorAll('video')) {
      if (el.closest('nav')) continue;
      const r = el.getBoundingClientRect();
      if (r.width * r.height >= best) {
        best = r.width * r.height;
        v = el;
      }
    }
    const target = v?.parentElement;
    if (!target) return;
    const r = target.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    if (typeof PointerEvent === 'function') {
      for (const type of ['pointerover', 'pointerenter', 'pointermove']) target.dispatchEvent(new PointerEvent(type, init));
    }
    for (const type of ['mouseover', 'mouseenter', 'mousemove']) target.dispatchEvent(new MouseEvent(type, init));
  }

  /**
   * Applies the start-in-theatre and start-with-chat-closed options once per channel navigation.
   */
  function runStartup() {
    if (location.pathname !== startupPath) {
      startupPath = location.pathname;
      startupJob = { theatre: S.startTheatre, chat: S.startChatClosed, until: Date.now() + 15000 };
    }
    const j = startupJob;
    if (!j || (!j.theatre && !j.chat)) return;
    if (Date.now() > j.until) {
      startupJob = null;
      return;
    }
    if (j.theatre) {
      const holder = document.querySelector('[data-theatre]');
      if (holder?.getAttribute('data-theatre') === 'true') {
        j.theatre = false;
      } else if (holder) {
        const b = findButton(D.theatreRe);
        if (b) {
          b.click();
          j.theatre = false;
        } else {
          wakePlayer();
        }
      }
    }
    if (j.chat) {
      const c = chatEl();
      if (c && c.getClientRects().length) {
        const b = document.querySelector('svg[data-ds-icon="CollapseRight"]')?.closest('button') ?? findButton(D.chatRe);
        if (b) {
          b.click();
          j.chat = false;
        }
      }
    }
  }

  /**
   * Finds the block-level element holding the username line of a chat row, so the timestamp sits before badges and username.
   * @param {Element} r
   * @returns {Element}
   */
  function lineOf(r) {
    let el = r.querySelector('button[data-prevent-expand]')
      ?? [...r.querySelectorAll('button')].find(b => !b.querySelector('svg[data-ds-icon="ArrowCurveLeft"]'))
      ?? null;
    if (!el) {
      const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) });
      el = walker.nextNode()?.parentElement ?? null;
    }
    if (!el) return r;
    el = el.parentElement;
    while (el && el !== r && /^(inline|contents)/.test(getComputedStyle(el).display)) el = el.parentElement;
    return el ?? r;
  }

  function applyRows() {
    applyQueued = false;
    updateGear();
    runStartup();
    const c = chatEl();
    if (!c) return;
    if (c !== baselineFor) {
      baselineFor = c;
      baselineUntil = Date.now() + 3000;
    }
    /** @type {StoredMessage[]|null} */
    let recent = null;
    for (const r of rows()) {
      const text = (r.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
      let entry = rowCache.get(r);
      if (!entry || entry.text !== text || !entry.m) {
        let m = null;
        if (store.size) {
          recent ??= [...store.values()].reverse();
          m = recent.find(x => matches(r, text, x)) ?? null;
        }
        entry = { text, m, line: null };
        rowCache.set(r, entry);
      }
      const hide = rowHidden(r, text);
      if (r.classList.contains('kct-hidden') !== hide) r.classList.toggle('kct-hidden', hide);
      const m = entry.m;
      const del = !!m && S.showDeleted && m.d;
      if (r.classList.contains('kct-deleted') !== del) r.classList.toggle('kct-deleted', del);
      const t = S.timestamps && !hide ? (m ? m.c : arrivalTime(text, c)) : null;
      const ts = t == null ? null : D.timeFmt.format(t);
      if (ts && (!entry.line || !r.contains(entry.line))) entry.line = lineOf(r);
      const line = ts ? entry.line : null;
      for (const el of [r, ...r.querySelectorAll('[data-kct-time]')]) {
        if (el !== line && el.hasAttribute('data-kct-time')) el.removeAttribute('data-kct-time');
      }
      if (line && line.getAttribute('data-kct-time') !== ts) line.setAttribute('data-kct-time', ts);
    }
  }

  function queueApply() {
    if (applyQueued) return;
    applyQueued = true;
    requestAnimationFrame(applyRows);
  }

  function release() {
    for (const f of held.splice(0)) {
      try { f(); } catch (e) { console.error('[tidychat]', e); }
    }
    updateIndicator();
  }

  function updatePaused() {
    const p = (S.pauseOnHover && hover && !suppressed) || keyDown;
    if (p === paused) return;
    paused = p;
    if (!paused) release();
    updateIndicator();
  }

  function updateIndicator() {
    if (!indicator) return;
    const c = chatEl();
    if (!paused || !c) {
      indicator.style.display = 'none';
      return;
    }
    const r = c.getBoundingClientRect();
    indicator.textContent = held.length ? `Chat paused, ${held.length} new (click to resume)` : 'Chat paused';
    indicator.style.left = `${r.left + 8}px`;
    indicator.style.width = `${Math.max(r.width - 16, 0)}px`;
    indicator.style.top = `${r.bottom - 40}px`;
    indicator.style.display = 'block';
  }

  /**
   * Places the settings button left of "Get KICKs" in the top bar, hides it in theatre mode, and floats it over chat when the top bar is otherwise missing.
   */
  function updateGear() {
    if (!gear) return;
    if (!S.showButton) {
      gear.style.display = 'none';
      return;
    }
    const anchor = document.querySelector(GEAR_ANCHOR);
    const nav = anchor?.closest('nav');
    if (anchor && nav && nav.getClientRects().length) {
      if (gear.nextElementSibling !== anchor) anchor.before(gear);
      if (!gear.classList.contains('kct-gear-nav')) {
        gear.classList.add('kct-gear-nav');
        gear.style.top = gear.style.left = gear.style.right = gear.style.bottom = '';
      }
      gear.style.display = 'inline-flex';
      return;
    }
    if (document.querySelector('[data-theatre="true"]')) {
      gear.style.display = 'none';
      return;
    }
    if (gear.parentNode !== document.body) document.body.appendChild(gear);
    gear.classList.remove('kct-gear-nav');
    const r = chatEl()?.getBoundingClientRect();
    gear.style.display = 'flex';
    if (r && r.width > 0) {
      gear.style.top = `${r.top + 8}px`;
      gear.style.left = `${r.right - 34}px`;
      gear.style.right = gear.style.bottom = 'auto';
    } else {
      gear.style.top = gear.style.left = 'auto';
      gear.style.right = gear.style.bottom = '16px';
    }
  }

  /**
   * @returns {string}
   */
  function dynamicCss() {
    const deleted = {
      fade: 'opacity:.5',
      strike: 'text-decoration:line-through',
      'fade-strike': 'opacity:.5;text-decoration:line-through',
      blur: 'filter:blur(4px)'
    }[S.deletedStyle] ?? 'opacity:.5';
    const hover = S.deletedStyle === 'blur' ? '.kct-deleted:hover,.kct-deleted:hover *{filter:none}' : '';
    const ui = Object.entries(INTERFACE_SELECTORS).flatMap(([k, sels]) => (S[k] ? sels : []));
    return `.kct-deleted,.kct-deleted *{${deleted}}${hover}` + [...ui, ...D.pageSelectors].map(s => `${s}{display:none!important}`).join('');
  }

  function applySettings() {
    saveSettings();
    D = compile(S);
    rowCache = new WeakMap();
    if (dynStyle) dynStyle.textContent = dynamicCss();
    updatePaused();
    queueApply();
  }

  /**
   * @param {string} tag
   * @param {Record<string, any>} [props]
   * @param {...(Node|string)} children
   * @returns {HTMLElement}
   */
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    el.append(...children);
    return el;
  }

  /**
   * @param {any} item
   * @param {string} value
   * @returns {string}
   */
  function validate(item, value) {
    if (!item.check) return '';
    const parts = item.type === 'list' ? lines(value) : value.trim() ? [value.trim()] : [];
    const bad = parts.filter(p => (item.check === 'regex' ? !toRegex(p) : !validSelector(p)));
    return bad.length ? `Invalid ${item.check === 'regex' ? 'regular expression' : 'selector'}: ${bad.join(', ')}` : '';
  }

  /**
   * @param {any} item
   * @returns {HTMLElement}
   */
  function field(item) {
    const desc = item.desc ? h('div', { className: 'kct-desc' }, item.desc) : '';
    if (item.type === 'bool') {
      const input = h('input', {
        type: 'checkbox',
        checked: !!S[item.key],
        onchange: e => {
          S[item.key] = e.target.checked;
          applySettings();
        }
      });
      return h('div', { className: 'kct-field' }, h('label', {}, input, h('div', {}, h('div', { className: 'kct-title' }, item.label), desc)));
    }
    const error = h('div', { className: 'kct-error' });
    let input;
    if (item.type === 'select') {
      input = h('select', {
        onchange: e => {
          S[item.key] = e.target.value;
          applySettings();
        }
      }, ...item.options.map(([v, l]) => h('option', { value: v, selected: S[item.key] === v }, l)));
    } else if (item.type === 'number') {
      input = h('input', {
        type: 'number',
        min: item.min,
        max: item.max,
        value: S[item.key],
        onchange: e => {
          const n = Math.min(item.max, Math.max(item.min, parseInt(e.target.value, 10) || DEFAULTS[item.key]));
          e.target.value = n;
          S[item.key] = n;
          applySettings();
        }
      });
    } else {
      let timer = 0;
      input = h(item.type === 'list' ? 'textarea' : 'input', {
        ...(item.type === 'list' ? {} : { type: 'text' }),
        value: S[item.key],
        placeholder: item.placeholder ?? '',
        spellcheck: false,
        oninput: e => {
          const v = e.target.value;
          error.textContent = validate(item, v);
          clearTimeout(timer);
          timer = setTimeout(() => {
            S[item.key] = v;
            applySettings();
          }, 400);
        }
      });
      error.textContent = validate(item, S[item.key]);
    }
    return h('div', { className: 'kct-field' }, h('div', { className: 'kct-title' }, item.label), desc, input, error);
  }

  function closeSettings() {
    backdrop?.remove();
    backdrop = null;
  }

  function openSettings() {
    if (backdrop) return closeSettings();
    const section = h('section');
    const navButtons = [];
    const show = i => {
      navButtons.forEach((b, j) => b.classList.toggle('kct-active', i === j));
      section.replaceChildren(h('h2', {}, CATEGORIES[i].label), ...CATEGORIES[i].items.map(field));
      section.scrollTop = 0;
    };
    CATEGORIES.forEach((c, i) => navButtons.push(h('button', { type: 'button', onclick: () => show(i) }, c.label)));
    const dialog = h('div', { id: 'kct-dialog' },
      h('header', {}, 'TidyChat', h('button', { type: 'button', onclick: closeSettings }, 'Close')),
      h('div', { className: 'kct-body' }, h('nav', {}, ...navButtons), section),
      h('footer', {}, 'Changes apply and save immediately.', h('button', {
        type: 'button',
        onclick: () => {
          if (!confirm('Reset all TidyChat settings to their defaults?')) return;
          S = { ...DEFAULTS };
          applySettings();
          closeSettings();
          openSettings();
        }
      }, 'Reset to defaults'))
    );
    backdrop = h('div', {
      id: 'kct-backdrop',
      onmousedown: e => { if (e.target === backdrop) closeSettings(); }
    }, dialog);
    for (const type of ['keydown', 'keyup', 'keypress']) {
      backdrop.addEventListener(type, e => {
        if (type === 'keydown' && e.key === 'Escape') closeSettings();
        e.stopPropagation();
      });
    }
    document.body.appendChild(backdrop);
    show(0);
  }

  /**
   * Console diagnostic: run tidyDebug() on a channel page.
   */
  window.tidyDebug = () => {
    const list = rows();
    const last = list[list.length - 1];
    console.table({
      chatFound: !!chatEl(),
      rows: list.length,
      stored: store.size,
      matched: list.filter(r => rowCache.get(r)?.m).length,
      stamped: list.filter(r => r.matches('[data-kct-time]') || r.querySelector('[data-kct-time]')).length,
      hidden: list.filter(r => r.classList.contains('kct-hidden')).length
    });
    console.log('last row text:', last?.textContent?.replace(/\s+/g, ' ').trim());
    console.log('last row html:', last?.outerHTML);
    console.log('last stored:', [...store.values()].slice(-3));
  };

  function init() {
    document.head.appendChild(h('style', { textContent: STYLE }));
    dynStyle = h('style', { textContent: dynamicCss() });
    document.head.appendChild(dynStyle);

    indicator = h('div', {
      id: 'kct-pause',
      onclick: () => {
        suppressed = true;
        updatePaused();
      }
    });
    gear = h('button', { id: 'kct-gear', type: 'button', title: 'TidyChat settings (Alt+Shift+K)', onclick: openSettings });
    gear.innerHTML = GEAR;
    document.body.append(indicator, gear);

    document.addEventListener('mouseover', e => {
      const t = /** @type {Element} */ (e.target);
      hover = !!t.closest?.(`${S.chatSelector}, #kct-pause`);
      if (!hover) suppressed = false;
      updatePaused();
    }, true);
    document.documentElement.addEventListener('mouseleave', () => {
      hover = false;
      suppressed = false;
      updatePaused();
    });
    window.addEventListener('blur', () => {
      hover = false;
      keyDown = false;
      suppressed = false;
      updatePaused();
    });
    window.addEventListener('keydown', e => {
      if (e.altKey && e.shiftKey && e.code === 'KeyK') {
        e.preventDefault();
        openSettings();
        return;
      }
      if (S.pauseKey && e.key === S.pauseKey && !keyDown) {
        keyDown = true;
        updatePaused();
      }
    }, true);
    window.addEventListener('keyup', e => {
      if (S.pauseKey && e.key === S.pauseKey) {
        keyDown = false;
        updatePaused();
      }
    }, true);
    window.addEventListener('resize', () => {
      updateIndicator();
      updateGear();
    });
    window.addEventListener('scroll', updateGear, { capture: true, passive: true });

    new MutationObserver(queueApply).observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(runStartup, 500);
    queueApply();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
