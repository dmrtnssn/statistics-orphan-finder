/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2 = globalThis, e$4 = t$2.ShadowRoot && (void 0 === t$2.ShadyCSS || t$2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$4 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$4) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$2.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$4 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$2, defineProperty: e$3, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f$1 = (t2, s2) => !i$2(t2, s2), b = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$1.litPropertyMetadata ?? (a$1.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e$3(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2?.call(this);
      r2?.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$2(s3));
    } else void 0 !== s2 && i2.push(c$2(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== i2.converter?.toAttribute ? i2.converter : u$1).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== t3.converter?.fromAttribute ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? this._$Ej?.get(e2) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2) {
    if (void 0 !== t2) {
      const e2 = this.constructor, h2 = this[t2];
      if (i2 ?? (i2 = e2.getPropertyOptions(t2)), !((i2.hasChanged ?? f$1)(h2, s2) || i2.useDefault && i2.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(e2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ?? (a$1.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = globalThis, i$1 = t$1.trustedTypes, s$1 = i$1 ? i$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, e$2 = "$lit$", h = `lit$${Math.random().toFixed(9).slice(2)}$`, o$2 = "?" + h, n$1 = `<${o$2}>`, r$2 = document, l = () => r$2.createComment(""), c = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, a = Array.isArray, u = (t2) => a(t2) || "function" == typeof t2?.[Symbol.iterator], d = "[ 	\n\f\r]", f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, v = /-->/g, _ = />/g, m = RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), p = /'/g, g = /"/g, $ = /^(?:script|style|textarea|title)$/i, y2 = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), x = y2(1), T = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), A = /* @__PURE__ */ new WeakMap(), C = r$2.createTreeWalker(r$2, 129);
function P(t2, i2) {
  if (!a(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== s$1 ? s$1.createHTML(i2) : i2;
}
const V = (t2, i2) => {
  const s2 = t2.length - 1, o2 = [];
  let r2, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = f;
  for (let i3 = 0; i3 < s2; i3++) {
    const s3 = t2[i3];
    let a2, u2, d2 = -1, y3 = 0;
    for (; y3 < s3.length && (c2.lastIndex = y3, u2 = c2.exec(s3), null !== u2); ) y3 = c2.lastIndex, c2 === f ? "!--" === u2[1] ? c2 = v : void 0 !== u2[1] ? c2 = _ : void 0 !== u2[2] ? ($.test(u2[2]) && (r2 = RegExp("</" + u2[2], "g")), c2 = m) : void 0 !== u2[3] && (c2 = m) : c2 === m ? ">" === u2[0] ? (c2 = r2 ?? f, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? m : '"' === u2[3] ? g : p) : c2 === g || c2 === p ? c2 = m : c2 === v || c2 === _ ? c2 = f : (c2 = m, r2 = void 0);
    const x2 = c2 === m && t2[i3 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === f ? s3 + n$1 : d2 >= 0 ? (o2.push(a2), s3.slice(0, d2) + e$2 + s3.slice(d2) + h + x2) : s3 + h + (-2 === d2 ? i3 : x2);
  }
  return [P(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), o2];
};
class N {
  constructor({ strings: t2, _$litType$: s2 }, n3) {
    let r2;
    this.parts = [];
    let c2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = V(t2, s2);
    if (this.el = N.createElement(f2, n3), C.currentNode = this.el.content, 2 === s2 || 3 === s2) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = C.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(e$2)) {
          const i2 = v2[a2++], s3 = r2.getAttribute(t3).split(h), e2 = /([.?@])?(.*)/.exec(i2);
          d2.push({ type: 1, index: c2, name: e2[2], strings: s3, ctor: "." === e2[1] ? H : "?" === e2[1] ? I : "@" === e2[1] ? L : k }), r2.removeAttribute(t3);
        } else t3.startsWith(h) && (d2.push({ type: 6, index: c2 }), r2.removeAttribute(t3));
        if ($.test(r2.tagName)) {
          const t3 = r2.textContent.split(h), s3 = t3.length - 1;
          if (s3 > 0) {
            r2.textContent = i$1 ? i$1.emptyScript : "";
            for (let i2 = 0; i2 < s3; i2++) r2.append(t3[i2], l()), C.nextNode(), d2.push({ type: 2, index: ++c2 });
            r2.append(t3[s3], l());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === o$2) d2.push({ type: 2, index: c2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(h, t3 + 1)); ) d2.push({ type: 7, index: c2 }), t3 += h.length - 1;
      }
      c2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = r$2.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function S(t2, i2, s2 = t2, e2) {
  if (i2 === T) return i2;
  let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
  const o2 = c(i2) ? void 0 : i2._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ?? (s2._$Co = []))[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = S(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
}
class M {
  constructor(t2, i2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? r$2).importNode(i2, true);
    C.currentNode = e2;
    let h2 = C.nextNode(), o2 = 0, n3 = 0, l2 = s2[0];
    for (; void 0 !== l2; ) {
      if (o2 === l2.index) {
        let i3;
        2 === l2.type ? i3 = new R(h2, h2.nextSibling, this, t2) : 1 === l2.type ? i3 = new l2.ctor(h2, l2.name, l2.strings, this, t2) : 6 === l2.type && (i3 = new z(h2, this, t2)), this._$AV.push(i3), l2 = s2[++n3];
      }
      o2 !== l2?.index && (h2 = C.nextNode(), o2++);
    }
    return C.currentNode = r$2, e2;
  }
  p(t2) {
    let i2 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
  }
}
class R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t2, i2, s2, e2) {
    this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i2 = this._$AM;
    return void 0 !== i2 && 11 === t2?.nodeType && (t2 = i2.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i2 = this) {
    t2 = S(this, t2, i2), c(t2) ? t2 === E || null == t2 || "" === t2 ? (this._$AH !== E && this._$AR(), this._$AH = E) : t2 !== this._$AH && t2 !== T && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : u(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== E && c(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(r$2.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = N.createElement(P(s2.h, s2.h[0]), this.options)), s2);
    if (this._$AH?._$AD === e2) this._$AH.p(i2);
    else {
      const t3 = new M(e2, this), s3 = t3.u(this.options);
      t3.p(i2), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i2 = A.get(t2.strings);
    return void 0 === i2 && A.set(t2.strings, i2 = new N(t2)), i2;
  }
  k(t2) {
    a(this._$AH) || (this._$AH = [], this._$AR());
    const i2 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new R(this.O(l()), this.O(l()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
    e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, i2) {
    for (this._$AP?.(false, true, i2); t2 !== this._$AB; ) {
      const i3 = t2.nextSibling;
      t2.remove(), t2 = i3;
    }
  }
  setConnected(t2) {
    void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
  }
}
class k {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i2, s2, e2, h2) {
    this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = E;
  }
  _$AI(t2, i2 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = S(this, t2, i2, 0), o2 = !c(t2) || t2 !== this._$AH && t2 !== T, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = S(this, e3[s2 + n3], i2, n3), r2 === T && (r2 = this._$AH[n3]), o2 || (o2 = !c(r2) || r2 !== this._$AH[n3]), r2 === E ? t2 = E : t2 !== E && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class H extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === E ? void 0 : t2;
  }
}
class I extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== E);
  }
}
class L extends k {
  constructor(t2, i2, s2, e2, h2) {
    super(t2, i2, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i2 = this) {
    if ((t2 = S(this, t2, i2, 0) ?? E) === T) return;
    const s2 = this._$AH, e2 = t2 === E && s2 !== E || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== E && (s2 === E || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class z {
  constructor(t2, i2, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    S(this, t2);
  }
}
const j = t$1.litHtmlPolyfillSupport;
j?.(N, R), (t$1.litHtmlVersions ?? (t$1.litHtmlVersions = [])).push("3.3.1");
const B = (t2, i2, s2) => {
  const e2 = s2?.renderBefore ?? i2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = s2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new R(i2.insertBefore(l(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t2 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t2.firstChild), t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = B(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return T;
  }
}
i._$litElement$ = true, i["finalized"] = true, s.litElementHydrateSupport?.({ LitElement: i });
const o$1 = s.litElementPolyfillSupport;
o$1?.({ LitElement: i });
(s.litElementVersions ?? (s.litElementVersions = [])).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1 = (e2, t2, c2) => (c2.configurable = true, c2.enumerable = true, Reflect.decorate && "object" != typeof t2 && Object.defineProperty(e2, t2, c2), c2);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e2, r2) {
  return (n3, s2, i2) => {
    const o2 = (t2) => t2.renderRoot?.querySelector(e2) ?? null;
    return e$1(n3, s2, { get() {
      return o2(this);
    } });
  };
}
const sharedStyles = i$3`
  /* Base styles */
  :host {
    display: block;
    font-family: var(--paper-font-body1_-_font-family);
    color: var(--primary-text-color);
  }

  /* Cards and containers */
  .card {
    background: var(--card-background-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  /* Typography */
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Buttons */
  button {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background: var(--dark-primary-color);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .secondary-button:hover {
    background: var(--divider-color);
  }

  /* Table styles */
  .table-container {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }

  .table-scroll {
    overflow-x: auto;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: var(--table-header-background-color, var(--secondary-background-color));
    color: var(--primary-text-color);
    padding: 12px 8px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    background: var(--divider-color);
  }

  td {
    padding: 12px 8px;
    border-bottom: 1px solid var(--divider-color);
  }

  tr:hover td {
    background: var(--table-row-background-hover-color, var(--secondary-background-color));
  }

  /* Sticky first column */
  .sticky-column {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--card-background-color);
  }

  .sticky-column::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: var(--divider-color);
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  th.sticky-column {
    z-index: 3;
  }

  tr:hover .sticky-column {
    background: var(--table-row-background-hover-color, var(--secondary-background-color));
  }

  /* Group borders for column grouping */
  .group-border-left {
    border-left: 2px solid var(--divider-color);
  }

  /* Status badges */
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-enabled,
  .status-available {
    color: var(--success-color, #4CAF50);
  }

  .status-disabled,
  .status-unavailable {
    color: var(--warning-color, #FF9800);
  }

  .status-deleted,
  .status-not-in-registry,
  .status-not-present {
    color: var(--error-color, #F44336);
  }

  /* Links */
  .entity-id-link {
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: none;
  }

  .entity-id-link:hover {
    text-decoration: underline;
  }

  /* Loading state */
  .loading {
    text-align: center;
    padding: 32px;
    color: var(--secondary-text-color);
  }

  .loading-spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  /* Summary grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stats-card {
    background: var(--card-background-color);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
    transition: all 0.3s;
  }

  .stats-card.clickable {
    cursor: pointer;
  }

  .stats-card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px 0 rgba(0, 0, 0, 0.2));
  }

  .stats-card.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.2));
    border: 1px solid rgba(255, 193, 7, 0.5);
  }

  .stats-value {
    font-size: 28px;
    font-weight: 300;
    color: var(--primary-text-color);
    margin: 8px 0;
  }

  .stats-subtitle {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  /* Filters */
  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .filter-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .filter-button:hover {
    background: var(--divider-color);
  }

  .filter-button.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.3));
    border-color: rgba(255, 193, 7, 0.8);
    color: var(--primary-text-color);
  }

  /* Search box */
  .search-box {
    flex: 1;
    min-width: 200px;
  }

  input[type="search"],
  input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  /* Modals */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    max-width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--divider-color);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: var(--primary-text-color);
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .hidden {
    display: none;
  }
`;
const API_BASE = "statistics_orphan_finder_v2";
class ApiService {
  constructor(hass) {
    this.hass = hass;
  }
  /**
   * Fetch orphaned entities list
   */
  async fetchOrphansList() {
    return this.hass.callApi("GET", `${API_BASE}?action=list`);
  }
  /**
   * Fetch database size information
   */
  async fetchDatabaseSize() {
    return this.hass.callApi("GET", `${API_BASE}?action=database_size`);
  }
  /**
   * Fetch entity storage overview
   */
  async fetchEntityStorageOverview() {
    return this.hass.callApi("GET", `${API_BASE}?action=entity_storage_overview`);
  }
  /**
   * Generate delete SQL for an orphaned entity
   */
  async generateDeleteSql(metadataId, origin) {
    const url = `${API_BASE}?action=generate_delete_sql&metadata_id=${metadataId}&origin=${encodeURIComponent(origin)}`;
    return this.hass.callApi("GET", url);
  }
  /**
   * Show Home Assistant's more-info dialog for an entity
   */
  showMoreInfo(entityId) {
    const event = new Event("hass-more-info", {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId };
    document.querySelector("home-assistant")?.dispatchEvent(event);
  }
}
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k2 = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i2 = Math.floor(Math.log(bytes) / Math.log(k2));
  const value = bytes / Math.pow(k2, i2);
  if (i2 === 0) {
    return `${value} ${sizes[i2]}`;
  } else if (value >= 100) {
    return `${value.toFixed(0)} ${sizes[i2]}`;
  } else if (value >= 10) {
    return `${value.toFixed(1)} ${sizes[i2]}`;
  } else {
    return `${value.toFixed(2)} ${sizes[i2]}`;
  }
}
function formatNumber(num) {
  return num.toLocaleString();
}
function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
function debounce(func, wait) {
  let timeout = null;
  return function(...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$8(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$8(target, key, result);
  return result;
};
let SummaryCards = class extends i {
  constructor() {
    super(...arguments);
    this.cards = [];
    this.columns = 4;
  }
  handleCardClick(cardId) {
    const card = this.cards.find((c2) => c2.id === cardId);
    if (card?.clickable) {
      this.dispatchEvent(new CustomEvent("card-clicked", {
        detail: { cardId },
        bubbles: true,
        composed: true
      }));
    }
  }
  handleSubtotalClick(cardId, subtotalLabel) {
    this.dispatchEvent(new CustomEvent("subtotal-clicked", {
      detail: { cardId, subtotalLabel },
      bubbles: true,
      composed: true
    }));
  }
  render() {
    return x`
      <div class="cards-container cols-${this.columns}">
        ${this.cards.map((card) => x`
          <div class="stats-card ${card.active ? "active" : ""}">
            <h2>${card.title}</h2>
            <div
              class="stats-value ${card.clickable ? "clickable" : ""}"
              @click=${() => card.clickable && this.handleCardClick(card.id)}
            >
              ${card.value}
            </div>
            ${card.subtitle ? x`
              <div class="stats-subtitle">${card.subtitle}</div>
            ` : ""}
            ${card.subtotals && card.subtotals.length > 0 ? x`
              <div class="card-subtotals">
                ${card.subtotals.map((subtotal) => x`
                  <div
                    class="card-subtotal ${subtotal.clickable ? "clickable" : ""} ${subtotal.active ? "active" : ""}"
                    style=${subtotal.color ? `color: ${subtotal.color}` : ""}
                    @click=${() => subtotal.clickable && this.handleSubtotalClick(card.id, subtotal.label)}
                  >
                    ${subtotal.label}: ${subtotal.value}
                  </div>
                `)}
              </div>
            ` : ""}
          </div>
        `)}
      </div>
    `;
  }
};
SummaryCards.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
      }

      .cards-container {
        display: grid;
        gap: 16px;
        margin-bottom: 16px;
      }

      .cards-container.cols-2 {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .cards-container.cols-4 {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .card-value {
        cursor: default;
      }

      .card-value.clickable {
        cursor: pointer;
        color: var(--primary-color);
      }

      .card-value.clickable:hover {
        text-decoration: underline;
      }

      .card-subtotals {
        margin-top: 8px;
        font-size: 12px;
      }

      .card-subtotal {
        cursor: default;
      }

      .card-subtotal.clickable {
        cursor: pointer;
      }

      .card-subtotal.clickable:hover {
        text-decoration: underline;
      }

      .card-subtotal.active {
        font-weight: 600;
      }
    `
];
__decorateClass$8([
  n2({ type: Array })
], SummaryCards.prototype, "cards", 2);
__decorateClass$8([
  n2({ type: Number })
], SummaryCards.prototype, "columns", 2);
SummaryCards = __decorateClass$8([
  t("summary-cards")
], SummaryCards);
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __decorateClass$7 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$7(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$7(target, key, result);
  return result;
};
let FilterBar = class extends i {
  constructor() {
    super(...arguments);
    this.filters = [];
    this.showSearch = false;
    this.searchPlaceholder = "Search entities...";
    this.searchValue = "";
    this.showClearButton = false;
    this.debouncedSearch = debounce((value) => {
      this.dispatchEvent(new CustomEvent("search-changed", {
        detail: { query: value },
        bubbles: true,
        composed: true
      }));
    }, 300);
  }
  handleFilterClick(filterId) {
    this.dispatchEvent(new CustomEvent("filter-clicked", {
      detail: { filterId },
      bubbles: true,
      composed: true
    }));
  }
  handleSearchInput(e2) {
    const input = e2.target;
    this.searchValue = input.value;
    this.debouncedSearch(this.searchValue);
  }
  handleClearFilters() {
    this.searchValue = "";
    this.dispatchEvent(new CustomEvent("clear-filters", {
      bubbles: true,
      composed: true
    }));
  }
  render() {
    return x`
      <div class="filter-container">
        ${this.filters.map((filter) => x`
          <button
            class="filter-button ${filter.active ? "active" : ""}"
            @click=${() => this.handleFilterClick(filter.id)}
          >
            ${filter.label}
          </button>
        `)}

        ${this.showSearch ? x`
          <div class="search-box">
            <input
              type="search"
              placeholder=${this.searchPlaceholder}
              .value=${this.searchValue}
              @input=${this.handleSearchInput}
            />
          </div>
        ` : ""}

        ${this.showClearButton ? x`
          <button
            class="secondary-button clear-button"
            @click=${this.handleClearFilters}
          >
            Clear Filters
          </button>
        ` : ""}
      </div>
    `;
  }
};
FilterBar.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
      }

      .filter-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .clear-button {
        margin-left: auto;
      }
    `
];
__decorateClass$7([
  n2({ type: Array })
], FilterBar.prototype, "filters", 2);
__decorateClass$7([
  n2({ type: Boolean })
], FilterBar.prototype, "showSearch", 2);
__decorateClass$7([
  n2({ type: String })
], FilterBar.prototype, "searchPlaceholder", 2);
__decorateClass$7([
  n2({ type: String })
], FilterBar.prototype, "searchValue", 2);
__decorateClass$7([
  n2({ type: Boolean })
], FilterBar.prototype, "showClearButton", 2);
FilterBar = __decorateClass$7([
  t("filter-bar")
], FilterBar);
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __decorateClass$6 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$6(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$6(target, key, result);
  return result;
};
let EntityTable = class extends i {
  constructor() {
    super(...arguments);
    this.entities = [];
    this.columns = [];
    this.sortable = true;
    this.stickyFirstColumn = false;
    this.sortStack = [{ column: "", direction: "asc" }];
    this.emptyMessage = "No data available";
  }
  handleSort(columnId) {
    if (!this.sortable) return;
    const column = this.columns.find((c2) => c2.id === columnId);
    if (!column?.sortable) return;
    const currentSort = this.sortStack[0];
    if (currentSort && currentSort.column === columnId) {
      const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
      this.sortStack = [{ column: columnId, direction: newDirection }];
    } else {
      this.sortStack = [{ column: columnId, direction: "asc" }];
    }
    this.dispatchEvent(new CustomEvent("sort-changed", {
      detail: { sortStack: this.sortStack },
      bubbles: true,
      composed: true
    }));
  }
  getSortIndicator(columnId) {
    const sortIndex = this.sortStack.findIndex((s2) => s2.column === columnId);
    if (sortIndex < 0) return "";
    const sort = this.sortStack[sortIndex];
    const arrow = sort.direction === "asc" ? "▲" : "▼";
    return x`
      <span class="sort-indicator">${arrow}</span>
    `;
  }
  handleEntityClick(entityId) {
    this.dispatchEvent(new CustomEvent("entity-clicked", {
      detail: { entityId },
      bubbles: true,
      composed: true
    }));
  }
  handleRowAction(entity, action) {
    this.dispatchEvent(new CustomEvent("row-action", {
      detail: { entity, action },
      bubbles: true,
      composed: true
    }));
  }
  renderCell(entity, column) {
    if (column.render) {
      const content = column.render(entity);
      if (typeof content === "string") {
        return x`${content}`;
      }
      return content;
    }
    const value = column.getValue ? column.getValue(entity) : entity[column.id];
    return x`${value ?? ""}`;
  }
  render() {
    if (this.entities.length === 0) {
      return x`
        <div class="table-container">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div>${this.emptyMessage}</div>
          </div>
        </div>
      `;
    }
    return x`
      <div class="table-wrapper">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                ${this.columns.map((column, index) => {
      const isSticky = this.stickyFirstColumn && index === 0;
      const isSortable = column.sortable !== false && this.sortable;
      const classes = [
        isSticky ? "sticky-column" : "",
        isSortable ? "sortable" : "",
        column.className || "",
        column.align ? `align-${column.align}` : ""
      ].filter(Boolean).join(" ");
      return x`
                    <th
                      class=${classes}
                      style=${column.width ? `width: ${column.width}` : ""}
                      @click=${() => isSortable && this.handleSort(column.id)}
                    >
                      ${column.label}
                      ${isSortable ? this.getSortIndicator(column.id) : ""}
                    </th>
                  `;
    })}
              </tr>
            </thead>
            <tbody>
              ${this.entities.map((entity) => x`
                <tr>
                  ${this.columns.map((column, index) => {
      const isSticky = this.stickyFirstColumn && index === 0;
      const classes = [
        isSticky ? "sticky-column" : "",
        column.className || "",
        column.align ? `align-${column.align}` : ""
      ].filter(Boolean).join(" ");
      return x`
                      <td class=${classes}>
                        ${this.renderCell(entity, column)}
                      </td>
                    `;
    })}
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
EntityTable.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
      }

      .table-wrapper {
        position: relative;
      }

      .table-scroll {
        overflow-x: auto;
        overflow-y: visible;
      }

      .sort-indicator {
        margin-left: 4px;
        font-size: 10px;
        color: var(--primary-color);
      }

      .sort-order {
        font-size: 9px;
        vertical-align: super;
        margin-left: 2px;
      }

      .align-right {
        text-align: right;
      }

      .align-center {
        text-align: center;
      }
    `
];
__decorateClass$6([
  n2({ type: Array })
], EntityTable.prototype, "entities", 2);
__decorateClass$6([
  n2({ type: Array })
], EntityTable.prototype, "columns", 2);
__decorateClass$6([
  n2({ type: Boolean })
], EntityTable.prototype, "sortable", 2);
__decorateClass$6([
  n2({ type: Boolean })
], EntityTable.prototype, "stickyFirstColumn", 2);
__decorateClass$6([
  n2({ type: Array })
], EntityTable.prototype, "sortStack", 2);
__decorateClass$6([
  n2({ type: String })
], EntityTable.prototype, "emptyMessage", 2);
EntityTable = __decorateClass$6([
  t("entity-table")
], EntityTable);
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$5(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$5(target, key, result);
  return result;
};
let DeleteSqlModal = class extends i {
  constructor() {
    super(...arguments);
    this.data = null;
    this.sql = "";
    this.storageSaved = 0;
    this.copyButtonText = "Copy to Clipboard";
  }
  handleClose() {
    this.dispatchEvent(new CustomEvent("close-modal", {
      bubbles: true,
      composed: true
    }));
  }
  async handleCopy() {
    try {
      await copyToClipboard(this.sql);
      this.copyButtonText = "✓ Copied!";
      setTimeout(() => {
        this.copyButtonText = "Copy to Clipboard";
      }, 2e3);
    } catch (error) {
      this.copyButtonText = "✗ Failed to copy";
      setTimeout(() => {
        this.copyButtonText = "Copy to Clipboard";
      }, 2e3);
    }
  }
  render() {
    if (!this.data) return x``;
    return x`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e2) => e2.stopPropagation()} style="max-width: 700px;">
          <div class="modal-header">
            <h2>Remove Entity: ${this.data.entityId}</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            <div class="warning">
              <strong>⚠️ Warning:</strong> This action will permanently delete statistics data from your database.
              Always backup your database before performing deletions!
            </div>

            <div class="info-grid">
              <span class="info-label">Entity ID:</span>
              <span class="info-value">${this.data.entityId}</span>

              <span class="info-label">Status:</span>
              <span class="info-value">${this.data.status}</span>

              <span class="info-label">Origin:</span>
              <span class="info-value">${this.data.origin}</span>

              <span class="info-label">Record Count:</span>
              <span class="info-value">${this.data.count.toLocaleString()}</span>

              <span class="info-label">Storage Saved:</span>
              <span class="info-value">${formatBytes(this.storageSaved)}</span>
            </div>

            <h3>SQL Deletion Statement:</h3>
            <div class="sql-container">${this.sql}</div>

            <button
              class="copy-button ${this.copyButtonText.includes("Copied") ? "copied" : ""}"
              @click=${this.handleCopy}
            >
              ${this.copyButtonText}
            </button>
          </div>

          <div class="modal-footer">
            <button class="secondary-button" @click=${this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
};
DeleteSqlModal.styles = [
  sharedStyles,
  i$3`
      .sql-container {
        background: var(--secondary-background-color);
        padding: 16px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 16px 0;
      }

      .warning {
        background: rgba(255, 152, 0, 0.1);
        border-left: 4px solid var(--warning-color, #FF9800);
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 16px;
        margin-bottom: 16px;
      }

      .info-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .info-value {
        color: var(--primary-text-color);
      }

      .copy-button {
        width: 100%;
        margin-top: 8px;
      }

      .copy-button.copied {
        background: var(--success-color, #4CAF50);
      }
    `
];
__decorateClass$5([
  n2({ type: Object })
], DeleteSqlModal.prototype, "data", 2);
__decorateClass$5([
  n2({ type: String })
], DeleteSqlModal.prototype, "sql", 2);
__decorateClass$5([
  n2({ type: Number })
], DeleteSqlModal.prototype, "storageSaved", 2);
__decorateClass$5([
  r()
], DeleteSqlModal.prototype, "copyButtonText", 2);
DeleteSqlModal = __decorateClass$5([
  t("delete-sql-modal")
], DeleteSqlModal);
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$4(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$4(target, key, result);
  return result;
};
let OrphanFinderView = class extends i {
  constructor() {
    super(...arguments);
    this.orphans = [];
    this.databaseSize = null;
    this.deletedStorage = 0;
    this.unavailableStorage = 0;
    this.filter = "all";
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
    this.deleteModalData = null;
    this.deleteSql = "";
    this.deleteStorageSaved = 0;
  }
  get filteredOrphans() {
    let filtered = [...this.orphans];
    if (this.filter === "deleted") {
      filtered = filtered.filter((o2) => o2.status === "deleted");
    } else if (this.filter === "unavailable") {
      filtered = filtered.filter((o2) => o2.status === "unavailable");
    }
    return this.sortOrphans(filtered);
  }
  sortOrphans(orphans) {
    return [...orphans].sort((a2, b2) => {
      for (const { column, direction } of this.sortStack) {
        let result = 0;
        switch (column) {
          case "entity_id":
            result = a2.entity_id.localeCompare(b2.entity_id);
            break;
          case "status":
            result = a2.status.localeCompare(b2.status);
            break;
          case "origin":
            result = a2.origin.localeCompare(b2.origin);
            break;
          case "last_update":
            const aTime = a2.last_update ? new Date(a2.last_update).getTime() : 0;
            const bTime = b2.last_update ? new Date(b2.last_update).getTime() : 0;
            result = aTime - bTime;
            break;
          case "count":
            result = a2.count - b2.count;
            break;
        }
        if (direction === "desc") result = -result;
        if (result !== 0) return result;
      }
      return 0;
    });
  }
  get summaryCards() {
    const cards = [];
    if (this.databaseSize) {
      cards.push(
        {
          id: "states",
          title: "States Table",
          value: formatNumber(this.databaseSize.states),
          subtitle: formatBytes(this.databaseSize.states_size)
        },
        {
          id: "statistics",
          title: "Statistics",
          value: formatNumber(this.databaseSize.statistics),
          subtitle: formatBytes(this.databaseSize.statistics_size)
        },
        {
          id: "statistics_short_term",
          title: "Statistics Short-term",
          value: formatNumber(this.databaseSize.statistics_short_term),
          subtitle: formatBytes(this.databaseSize.statistics_short_term_size)
        },
        {
          id: "other",
          title: "Other Tables",
          value: formatNumber(this.databaseSize.other),
          subtitle: formatBytes(this.databaseSize.other_size)
        }
      );
    }
    return cards;
  }
  get storageCards() {
    return [
      {
        id: "deleted_storage",
        title: "Deleted Entities Storage",
        value: formatBytes(this.deletedStorage),
        subtitle: `${this.orphans.filter((o2) => o2.status === "deleted").length} entities`
      },
      {
        id: "unavailable_storage",
        title: "Unavailable Entities Storage",
        value: formatBytes(this.unavailableStorage),
        subtitle: `${this.orphans.filter((o2) => o2.status === "unavailable").length} entities`
      }
    ];
  }
  get tableColumns() {
    return [
      {
        id: "entity_id",
        label: "Entity ID",
        sortable: true,
        render: (entity) => x`
          <span class="entity-id-link" @click=${() => this.handleEntityClick(entity.entity_id)}>
            ${entity.entity_id}
          </span>
        `
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        align: "center",
        render: (entity) => {
          const badgeClass = entity.status === "deleted" ? "status-deleted" : "status-unavailable";
          const icon = entity.status === "deleted" ? "✕" : "⚠";
          return x`<span class="status-badge ${badgeClass}">${icon} ${entity.status}</span>`;
        }
      },
      {
        id: "origin",
        label: "Origin",
        sortable: true,
        align: "center",
        getValue: (entity) => entity.origin
      },
      {
        id: "last_update",
        label: "Last Updated",
        sortable: true,
        align: "center",
        render: (entity) => entity.last_update ? formatDate(entity.last_update) : ""
      },
      {
        id: "count",
        label: "Statistics Count",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.count)
      },
      {
        id: "actions",
        label: "Actions",
        sortable: false,
        align: "center",
        render: (entity) => x`
          <button @click=${() => this.handleGenerateSql(entity)}>Generate SQL</button>
        `
      }
    ];
  }
  handleFilterClick(filterId) {
    this.filter = filterId;
  }
  handleClearFilters() {
    this.filter = "all";
  }
  handleSortChanged(e2) {
    this.sortStack = e2.detail.sortStack;
  }
  handleEntityClick(entityId) {
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }
  async handleGenerateSql(entity) {
    this.dispatchEvent(new CustomEvent("generate-sql", {
      detail: {
        metadataId: entity.metadata_id,
        origin: entity.origin,
        entity
      },
      bubbles: true,
      composed: true
    }));
  }
  // Called by parent when SQL is ready
  showDeleteModal(data, sql, storageSaved) {
    this.deleteModalData = data;
    this.deleteSql = sql;
    this.deleteStorageSaved = storageSaved;
  }
  handleCloseModal() {
    this.deleteModalData = null;
    this.deleteSql = "";
    this.deleteStorageSaved = 0;
  }
  render() {
    const filterButtons = [
      { id: "all", label: "All", active: this.filter === "all" },
      { id: "deleted", label: "Deleted Only", active: this.filter === "deleted" },
      { id: "unavailable", label: "Unavailable Only", active: this.filter === "unavailable" }
    ];
    return x`
      <div class="description">
        Find and remove orphaned statistics entities that no longer exist in Home Assistant.
      </div>

      <h2>Database Overview</h2>
      <summary-cards .cards=${this.summaryCards} .columns=${4}></summary-cards>

      <h2>Orphaned Entities Storage</h2>
      <summary-cards .cards=${this.storageCards} .columns=${2}></summary-cards>

      <h2>Orphaned Entities</h2>
      <filter-bar
        .filters=${filterButtons}
        .showClearButton=${this.filter !== "all"}
        @filter-clicked=${(e2) => this.handleFilterClick(e2.detail.filterId)}
        @clear-filters=${this.handleClearFilters}
      ></filter-bar>

      <entity-table
        .entities=${this.filteredOrphans}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${false}
        .emptyMessage=${"No orphaned entities found"}
        @sort-changed=${this.handleSortChanged}
      ></entity-table>

      ${this.deleteModalData ? x`
        <delete-sql-modal
          .data=${this.deleteModalData}
          .sql=${this.deleteSql}
          .storageSaved=${this.deleteStorageSaved}
          @close-modal=${this.handleCloseModal}
        ></delete-sql-modal>
      ` : ""}
    `;
  }
};
OrphanFinderView.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
      }

      .description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }
    `
];
__decorateClass$4([
  n2({ type: Object })
], OrphanFinderView.prototype, "hass", 2);
__decorateClass$4([
  n2({ type: Array })
], OrphanFinderView.prototype, "orphans", 2);
__decorateClass$4([
  n2({ type: Object })
], OrphanFinderView.prototype, "databaseSize", 2);
__decorateClass$4([
  n2({ type: Number })
], OrphanFinderView.prototype, "deletedStorage", 2);
__decorateClass$4([
  n2({ type: Number })
], OrphanFinderView.prototype, "unavailableStorage", 2);
__decorateClass$4([
  r()
], OrphanFinderView.prototype, "filter", 2);
__decorateClass$4([
  r()
], OrphanFinderView.prototype, "sortStack", 2);
__decorateClass$4([
  r()
], OrphanFinderView.prototype, "deleteModalData", 2);
__decorateClass$4([
  r()
], OrphanFinderView.prototype, "deleteSql", 2);
__decorateClass$4([
  r()
], OrphanFinderView.prototype, "deleteStorageSaved", 2);
OrphanFinderView = __decorateClass$4([
  t("orphan-finder-view")
], OrphanFinderView);
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$3(target, key, result);
  return result;
};
let StorageHealthSummary = class extends i {
  constructor() {
    super(...arguments);
    this.summary = null;
    this.entities = [];
    this.databaseSize = null;
    this.activeFilter = null;
  }
  getUnavailableLongTerm() {
    const sevenDaysInSeconds = 7 * 24 * 3600;
    return this.entities.filter(
      (e2) => e2.state_status === "Unavailable" && e2.unavailable_duration_seconds !== null && e2.unavailable_duration_seconds > sevenDaysInSeconds
    ).length;
  }
  estimateStorageMB(entityCount) {
    const statesSize = entityCount * 200;
    const statsSize = entityCount * 150;
    const mb = (statesSize + statsSize) / (1024 * 1024);
    if (mb < 10) {
      return mb.toFixed(1);
    }
    return Math.round(mb).toString();
  }
  getActualStorageMB(storageBytes, entityCount) {
    if (storageBytes !== void 0 && storageBytes > 0) {
      const mb = storageBytes / (1024 * 1024);
      if (mb < 10) {
        return mb.toFixed(1);
      }
      return Math.round(mb).toString();
    }
    return this.estimateStorageMB(entityCount);
  }
  handleAction(action) {
    this.dispatchEvent(new CustomEvent("action-clicked", {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }
  drawChart() {
    const canvas = this.shadowRoot?.getElementById("pie-chart");
    if (!canvas || !this.databaseSize) {
      console.warn("[StorageHealthSummary] Canvas or database size not available");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[StorageHealthSummary] Could not get canvas 2D context");
      return;
    }
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;
    console.log("[StorageHealthSummary] Drawing chart with sizes:", {
      states,
      statsShort,
      statsLong,
      other,
      total
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (total === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data", centerX, centerY);
      return;
    }
    const segments = [
      { size: states, percent: states / total, color: "#2196F3", label: "States" },
      { size: statsShort, percent: statsShort / total, color: "#FF9800", label: "Statistics Short-term" },
      { size: statsLong, percent: statsLong / total, color: "#4CAF50", label: "Statistics Long-term" },
      { size: other, percent: other / total, color: "#9E9E9E", label: "Other" }
    ].sort((a2, b2) => b2.size - a2.size);
    let currentAngle = -Math.PI / 2;
    segments.forEach((segment) => {
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segment.percent * 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      currentAngle += segment.percent * 2 * Math.PI;
    });
  }
  renderPieChart() {
    if (!this.databaseSize) {
      console.warn("[StorageHealthSummary] Database size data not available");
      return x`<div class="no-issues">Database size information unavailable<br><small>Click Refresh to load data</small></div>`;
    }
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;
    console.log("[StorageHealthSummary] Database sizes:", {
      states,
      statsLong,
      statsShort,
      other,
      total
    });
    if (isNaN(total) || !isFinite(total)) {
      console.error("[StorageHealthSummary] Invalid database size data (NaN/Infinity)");
      return x`<div class="no-issues">Invalid database size data<br><small>Check browser console for details</small></div>`;
    }
    if (total === 0) {
      return x`<div class="no-issues">No database data<br><small>Database appears empty</small></div>`;
    }
    const segments = [
      { percent: states / total * 100, color: "#2196F3", label: "States", size: states },
      { percent: statsShort / total * 100, color: "#FF9800", label: "Statistics Short-term", size: statsShort },
      { percent: statsLong / total * 100, color: "#4CAF50", label: "Statistics Long-term", size: statsLong },
      { percent: other / total * 100, color: "#9E9E9E", label: "Other", size: other }
    ];
    const getRecordCount = (label) => {
      switch (label) {
        case "States":
          return this.databaseSize?.states || 0;
        case "Statistics Short-term":
          return this.databaseSize?.statistics_short_term || 0;
        case "Statistics Long-term":
          return this.databaseSize?.statistics || 0;
        case "Other":
          return this.databaseSize?.other || 0;
        default:
          return 0;
      }
    };
    return x`
      <div class="chart-title">Database Storage</div>
      <canvas id="pie-chart" width="220" height="220"></canvas>
      <div class="chart-legend">
        ${segments.map((segment) => {
      const recordCount = getRecordCount(segment.label);
      return x`
            <div class="legend-item">
              <div class="legend-color" style="background: ${segment.color}"></div>
              <div class="legend-content">
                <div class="legend-main">
                  <span class="legend-label">${segment.label}</span>
                  <span class="legend-value">${formatBytes(segment.size)}</span>
                </div>
                <div class="legend-count">${formatNumber(recordCount)} records</div>
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  renderActionSummary() {
    if (!this.summary) {
      return x`<div class="no-issues">Summary data unavailable</div>`;
    }
    const actions = [];
    const deleted = this.summary.deleted_from_registry;
    const unavailableLong = this.getUnavailableLongTerm();
    const disabled = this.summary.registry_disabled;
    const onlyStates = this.summary.only_in_states;
    const onlyStats = this.summary.only_in_statistics;
    const active = this.summary.state_available;
    const total = this.summary.total_entities;
    if (deleted > 0) {
      const storageMB = this.getActualStorageMB(this.summary.deleted_storage_bytes, deleted);
      actions.push({
        priority: "critical",
        icon: "🔴",
        text: `${formatNumber(deleted)} deleted entities wasting ${storageMB}MB`,
        action: "cleanup_deleted",
        button: "Clean up"
      });
    }
    if (unavailableLong > 0) {
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(unavailableLong)} entities unavailable for 7+ days`,
        action: "investigate_unavailable",
        button: "Investigate"
      });
    }
    if (disabled > 0) {
      const potentialMB = this.estimateStorageMB(disabled);
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(disabled)} disabled entities tracked (-${potentialMB}MB potential)`,
        action: "review_disabled",
        button: "Review"
      });
    }
    if (onlyStates > 0 || onlyStats > 0) {
      const totalSingle = onlyStates + onlyStats;
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(totalSingle)} entities in single storage (${formatNumber(onlyStates)} states, ${formatNumber(onlyStats)} stats)`,
        action: "optimize_storage",
        button: "Review"
      });
    }
    const activePercent = total > 0 ? Math.round(active / total * 100) : 0;
    actions.push({
      priority: "success",
      icon: "✅",
      text: `${formatNumber(active)} entities active and healthy (${activePercent}%)`,
      action: null,
      button: null
    });
    if (actions.length === 1 && actions[0].priority === "success") {
      return x`
        <div class="no-issues">
          ✓ All systems healthy<br>
          ${formatNumber(active)} active entities
        </div>
      `;
    }
    return x`
      <div class="action-list">
        ${actions.map((item) => x`
          <div class="action-item ${item.priority}">
            <span class="action-icon">${item.icon}</span>
            <span class="action-text">${item.text}</span>
            ${item.button ? x`
              <button class="action-btn" @click=${() => this.handleAction(item.action)}>
                ${item.button}
              </button>
            ` : ""}
          </div>
        `)}
      </div>
    `;
  }
  render() {
    if (!this.summary) {
      return x`<div class="loading">Loading status summary...</div>`;
    }
    return x`
      <div class="summary-container">
        <!-- Column 1: Pie Chart -->
        <div class="column chart-column">
          ${this.renderPieChart()}
        </div>

        <!-- Column 2: Action Summary -->
        <div class="column summary-column">
          <div class="summary-title">Summary</div>
          ${this.renderActionSummary()}
        </div>

        <!-- Column 3: Placeholder -->
        <div class="column placeholder-column">
          Reserved for<br>future features
        </div>
      </div>
    `;
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("databaseSize") && this.databaseSize) {
      requestAnimationFrame(() => this.drawChart());
    }
  }
};
StorageHealthSummary.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
        margin-bottom: 24px;
      }

      .summary-container {
        display: grid;
        grid-template-columns: 300px 1fr 200px;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 1200px) {
        .summary-container {
          grid-template-columns: 1fr;
        }
      }

      .column {
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      /* Column 1: Pie Chart */
      .chart-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* Debug: Uncomment to verify container size */
        /* background: rgba(255, 255, 0, 0.1); */
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      #pie-chart {
        width: 220px;
        height: 220px;
        display: block;
      }

      .chart-legend {
        margin-top: 16px;
        width: 100%;
      }

      .legend-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .legend-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .legend-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .legend-label {
        color: var(--primary-text-color);
      }

      .legend-value {
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .legend-count {
        font-size: 11px;
        font-weight: 400;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }

      /* Column 2: Action Summary */
      .summary-column {
        display: flex;
        flex-direction: column;
      }

      .summary-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      .action-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .action-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 6px;
        border-left: 4px solid transparent;
      }

      .action-item.critical {
        border-left-color: #F44336;
      }

      .action-item.warning {
        border-left-color: #FF9800;
      }

      .action-item.success {
        border-left-color: #4CAF50;
      }

      .action-icon {
        font-size: 18px;
        min-width: 22px;
      }

      .action-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: var(--primary-text-color);
      }

      .action-btn {
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .action-btn:hover {
        background: var(--dark-primary-color);
        transform: translateY(-1px);
      }

      .no-issues {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      /* Column 3: Placeholder */
      .placeholder-column {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        text-align: center;
        min-height: 200px;
      }

      @media (max-width: 1200px) {
        .placeholder-column {
          display: none;
        }
      }
    `
];
__decorateClass$3([
  n2({ type: Object })
], StorageHealthSummary.prototype, "summary", 2);
__decorateClass$3([
  n2({ type: Array })
], StorageHealthSummary.prototype, "entities", 2);
__decorateClass$3([
  n2({ type: Object })
], StorageHealthSummary.prototype, "databaseSize", 2);
__decorateClass$3([
  n2({ type: String })
], StorageHealthSummary.prototype, "activeFilter", 2);
StorageHealthSummary = __decorateClass$3([
  t("storage-health-summary")
], StorageHealthSummary);
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let EntityDetailsModal = class extends i {
  constructor() {
    super(...arguments);
    this.entity = null;
  }
  handleClose() {
    this.dispatchEvent(new CustomEvent("close-modal", {
      bubbles: true,
      composed: true
    }));
  }
  handleOpenMoreInfo() {
    if (!this.entity) return;
    this.handleClose();
    this.dispatchEvent(new CustomEvent("open-more-info", {
      detail: { entityId: this.entity.entity_id },
      bubbles: true,
      composed: true
    }));
  }
  renderStatusIndicator() {
    if (!this.entity) return "";
    let statusClass = "status-unknown";
    if (this.entity.state_status === "Available") {
      statusClass = "status-available";
    } else if (this.entity.state_status === "Unavailable") {
      statusClass = "status-unavailable";
    }
    return x`<span class="status-indicator ${statusClass}"></span>`;
  }
  render() {
    if (!this.entity) return x``;
    return x`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e2) => e2.stopPropagation()} style="max-width: 600px;">
          <div class="modal-header">
            <h2>Entity Details</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            <!-- Entity Identity -->
            <div class="details-section">
              <h3>Entity Information</h3>
              <div class="details-grid">
                <span class="detail-label">Entity ID:</span>
                <span class="detail-value clickable" @click=${this.handleOpenMoreInfo}>
                  ${this.entity.entity_id}
                </span>

                ${this.entity.platform ? x`
                  <span class="detail-label">Platform:</span>
                  <span class="detail-value">${this.entity.platform}</span>
                ` : ""}

                ${this.entity.device_name ? x`
                  <span class="detail-label">Device:</span>
                  <span class="detail-value">
                    ${this.entity.device_name}
                    ${this.entity.device_disabled ? " (disabled)" : ""}
                  </span>
                ` : ""}

                ${this.entity.config_entry_title ? x`
                  <span class="detail-label">Integration:</span>
                  <span class="detail-value">
                    ${this.entity.config_entry_title}
                    ${this.entity.config_entry_state ? ` (${this.entity.config_entry_state})` : ""}
                  </span>
                ` : ""}
              </div>
            </div>

            <!-- Status -->
            <div class="details-section">
              <h3>Current Status</h3>
              <div class="details-grid">
                <span class="detail-label">State:</span>
                <span class="detail-value">
                  ${this.renderStatusIndicator()}
                  ${this.entity.state_status}
                </span>

                <span class="detail-label">Registry:</span>
                <span class="detail-value">${this.entity.registry_status}</span>
              </div>

              ${this.entity.availability_reason ? x`
                <div class="reason-box">
                  <strong>Reason:</strong> ${this.entity.availability_reason}
                </div>
              ` : ""}

              ${this.entity.unavailable_duration_seconds ? x`
                <div class="reason-box">
                  <strong>Duration:</strong> ${formatDuration(this.entity.unavailable_duration_seconds)}
                </div>
              ` : ""}
            </div>

            <!-- States Table -->
            <div class="details-section">
              <h3>States Table</h3>
              <div class="details-grid">
                <span class="detail-label">In states_meta:</span>
                <span class="detail-value">${this.entity.in_states_meta ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In states:</span>
                <span class="detail-value">${this.entity.in_states ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">State records:</span>
                <span class="detail-value">${formatNumber(this.entity.states_count)}</span>

                ${this.entity.last_state_update ? x`
                  <span class="detail-label">Last update:</span>
                  <span class="detail-value">${this.entity.last_state_update}</span>
                ` : ""}
              </div>
            </div>

            <!-- Update Frequency -->
            ${this.entity.update_interval ? x`
              <div class="details-section">
                <h3>Update Frequency</h3>
                <div class="details-grid">
                  <span class="detail-label">Message interval:</span>
                  <span class="detail-value">${this.entity.update_interval}</span>

                  ${this.entity.update_count_24h ? x`
                    <span class="detail-label">Updates (24h):</span>
                    <span class="detail-value">${formatNumber(this.entity.update_count_24h)}</span>
                  ` : ""}
                </div>
              </div>
            ` : ""}

            <!-- Statistics Table -->
            <div class="details-section">
              <h3>Statistics Table</h3>
              <div class="details-grid">
                <span class="detail-label">In statistics_meta:</span>
                <span class="detail-value">${this.entity.in_statistics_meta ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In short-term:</span>
                <span class="detail-value">${this.entity.in_statistics_short_term ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In long-term:</span>
                <span class="detail-value">${this.entity.in_statistics_long_term ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">Short-term records:</span>
                <span class="detail-value">${formatNumber(this.entity.stats_short_count)}</span>

                <span class="detail-label">Long-term records:</span>
                <span class="detail-value">${formatNumber(this.entity.stats_long_count)}</span>

                ${this.entity.last_stats_update ? x`
                  <span class="detail-label">Last update:</span>
                  <span class="detail-value">${this.entity.last_stats_update}</span>
                ` : ""}
              </div>
            </div>

            <!-- Statistics Eligibility -->
            ${this.entity.statistics_eligibility_reason ? x`
              <div class="details-section">
                <h3>Statistics Eligibility</h3>
                <div class="reason-box">
                  ${this.entity.statistics_eligibility_reason}
                </div>
              </div>
            ` : ""}
          </div>

          <div class="modal-footer">
            <button @click=${this.handleOpenMoreInfo}>Open More Info</button>
            <button class="secondary-button" @click=${this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
};
EntityDetailsModal.styles = [
  sharedStyles,
  i$3`
      .details-section {
        margin-bottom: 24px;
      }

      .details-section:last-child {
        margin-bottom: 0;
      }

      .details-section h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .details-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 16px;
      }

      .detail-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .detail-value {
        color: var(--primary-text-color);
      }

      .detail-value.clickable {
        color: var(--primary-color);
        cursor: pointer;
      }

      .detail-value.clickable:hover {
        text-decoration: underline;
      }

      .status-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .status-available {
        background: var(--success-color, #4CAF50);
      }

      .status-unavailable {
        background: var(--warning-color, #FF9800);
      }

      .status-unknown {
        background: var(--error-color, #F44336);
      }

      .reason-box {
        background: var(--secondary-background-color);
        padding: 12px;
        border-radius: 4px;
        margin-top: 8px;
        font-size: 13px;
      }
    `
];
__decorateClass$2([
  n2({ type: Object })
], EntityDetailsModal.prototype, "entity", 2);
EntityDetailsModal = __decorateClass$2([
  t("entity-details-modal")
], EntityDetailsModal);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let StorageOverviewView = class extends i {
  constructor() {
    super(...arguments);
    this.entities = [];
    this.summary = null;
    this.databaseSize = null;
    this.searchQuery = "";
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
    this.selectedEntity = null;
  }
  get filteredEntities() {
    let filtered = [...this.entities];
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((e2) => e2.entity_id.toLowerCase().includes(query));
    }
    if (this.basicFilter === "in_registry") {
      filtered = filtered.filter((e2) => e2.in_entity_registry);
    } else if (this.basicFilter === "in_state") {
      filtered = filtered.filter((e2) => e2.in_state_machine);
    } else if (this.basicFilter === "deleted") {
      filtered = filtered.filter((e2) => !e2.in_entity_registry && !e2.in_state_machine);
    }
    if (this.registryFilter) {
      filtered = filtered.filter((e2) => e2.registry_status === this.registryFilter);
    }
    if (this.stateFilter) {
      filtered = filtered.filter((e2) => e2.state_status === this.stateFilter);
    }
    if (this.advancedFilter === "only_states") {
      filtered = filtered.filter((e2) => e2.in_states && !e2.in_statistics_meta);
    } else if (this.advancedFilter === "only_stats") {
      filtered = filtered.filter((e2) => e2.in_statistics_meta && !e2.in_states);
    }
    return this.sortEntities(filtered);
  }
  sortEntities(entities) {
    return [...entities].sort((a2, b2) => {
      for (const { column, direction } of this.sortStack) {
        let result = 0;
        switch (column) {
          case "entity_id":
            result = a2.entity_id.localeCompare(b2.entity_id);
            break;
          case "registry":
          case "registry_status":
            result = a2.registry_status.localeCompare(b2.registry_status);
            break;
          case "state":
          case "state_status":
            result = a2.state_status.localeCompare(b2.state_status);
            break;
          case "states_count":
          case "stats_short_count":
          case "stats_long_count":
            result = a2[column] - b2[column];
            break;
          case "update_interval":
            const aInterval = a2.update_interval_seconds ?? 999999;
            const bInterval = b2.update_interval_seconds ?? 999999;
            result = aInterval - bInterval;
            break;
          case "last_state_update":
          case "last_stats_update":
            const aTime = a2[column] ? new Date(a2[column]).getTime() : 0;
            const bTime = b2[column] ? new Date(b2[column]).getTime() : 0;
            result = aTime - bTime;
            break;
          default:
            const aVal = a2[column] ? 1 : 0;
            const bVal = b2[column] ? 1 : 0;
            result = aVal - bVal;
        }
        if (direction === "desc") result = -result;
        if (result !== 0) return result;
      }
      return 0;
    });
  }
  getActiveFilterType() {
    if (this.basicFilter) return this.basicFilter;
    if (this.registryFilter) return `registry_${this.registryFilter}`;
    if (this.stateFilter) return `state_${this.stateFilter}`;
    if (this.advancedFilter) return this.advancedFilter;
    return null;
  }
  get tableColumns() {
    return [
      {
        id: "entity_id",
        label: "Entity ID",
        sortable: true,
        render: (entity) => x`
          <span class="entity-id-link" @click=${() => this.handleEntityClick(entity)}>
            ${entity.entity_id}
          </span>
        `
      },
      {
        id: "registry",
        label: "ENTITY\nREGISTRY",
        sortable: true,
        align: "center",
        render: (entity) => {
          if (entity.registry_status === "Enabled") {
            return x`<span class="status-badge status-enabled" title="Enabled">✓</span>`;
          } else if (entity.registry_status === "Disabled") {
            return x`<span class="status-badge status-disabled" title="Disabled">⊘</span>`;
          }
          return x`<span class="status-badge status-not-in-registry" title="Not in Registry">✕</span>`;
        }
      },
      {
        id: "state",
        label: "STATE\nMACHINE",
        sortable: true,
        align: "center",
        render: (entity) => {
          if (entity.state_status === "Available") {
            return x`<span class="status-badge status-available" title="Available">✓</span>`;
          } else if (entity.state_status === "Unavailable") {
            return x`<span class="status-badge status-unavailable" title="Unavailable">⚠</span>`;
          }
          return x`<span class="status-badge status-not-present" title="Not Present">○</span>`;
        }
      },
      {
        id: "states_meta",
        label: "States\nMeta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_states_meta ? "✓" : ""
      },
      {
        id: "states",
        label: "States",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_states ? "✓" : ""
      },
      {
        id: "states_count",
        label: "States #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.states_count)
      },
      {
        id: "update_interval",
        label: "Message\nInterval",
        sortable: true,
        align: "right",
        render: (entity) => entity.update_interval || ""
      },
      {
        id: "last_state_update",
        label: "Last State\nUpdate",
        sortable: true,
        align: "center",
        render: (entity) => entity.last_state_update || ""
      },
      {
        id: "stats_meta",
        label: "Stats\nMeta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_statistics_meta ? "✓" : ""
      },
      {
        id: "stats_short",
        label: "Stats\nShort",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_short_term ? "✓" : ""
      },
      {
        id: "stats_long",
        label: "Stats\nLong",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_long_term ? "✓" : ""
      },
      {
        id: "stats_short_count",
        label: "Short #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_short_count)
      },
      {
        id: "stats_long_count",
        label: "Long #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_long_count)
      },
      {
        id: "last_stats_update",
        label: "Last Stats\nUpdate",
        sortable: true,
        align: "center",
        render: (entity) => entity.last_stats_update || ""
      },
      {
        id: "actions",
        label: "ACTIONS",
        sortable: false,
        align: "center",
        width: "50px",
        className: "group-border-left",
        render: (entity) => x`
          <button
            class="info-icon-btn"
            @click=${() => this.handleEntityClick(entity)}
            title="Show details"
            style="background: none; border: none; cursor: pointer; padding: 4px;"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            </svg>
          </button>
        `
      }
    ];
  }
  handleHealthAction(e2) {
    const action = e2.detail.action;
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    switch (action) {
      case "cleanup_deleted":
        this.basicFilter = "deleted";
        break;
      case "investigate_unavailable":
        this.stateFilter = "Unavailable";
        this.basicFilter = "in_state";
        break;
      case "review_disabled":
        this.registryFilter = "Disabled";
        this.basicFilter = "in_registry";
        break;
      case "optimize_storage":
        this.advancedFilter = "only_states";
        break;
    }
  }
  handleSearchChanged(e2) {
    this.searchQuery = e2.detail.query;
  }
  handleClearFilters() {
    this.searchQuery = "";
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
  }
  handleSortChanged(e2) {
    this.sortStack = e2.detail.sortStack;
  }
  handleClearSort() {
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
  }
  handleEntityClick(entity) {
    this.selectedEntity = entity;
  }
  handleCloseModal() {
    this.selectedEntity = null;
  }
  handleOpenMoreInfo(e2) {
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId: e2.detail.entityId };
    this.dispatchEvent(event);
  }
  render() {
    const hasActiveFilters = this.searchQuery || this.basicFilter || this.registryFilter || this.stateFilter || this.advancedFilter;
    return x`
      <div class="description">
        Complete overview of all entities across Home Assistant's storage locations.
        Table features horizontal scrolling with sticky first column.
      </div>

      <storage-health-summary
        .summary=${this.summary}
        .entities=${this.entities}
        .databaseSize=${this.databaseSize}
        .activeFilter=${this.getActiveFilterType()}
        @action-clicked=${this.handleHealthAction}
      ></storage-health-summary>

      <h2>Entity Storage Details</h2>
      <filter-bar
        .filters=${[]}
        .showSearch=${true}
        .searchPlaceholder=${"Search entity ID..."}
        .searchValue=${this.searchQuery}
        .showClearButton=${hasActiveFilters}
        @search-changed=${this.handleSearchChanged}
        @clear-filters=${this.handleClearFilters}
      ></filter-bar>

      <div class="clear-sort-container">
        <button class="secondary-button" @click=${this.handleClearSort}>Clear Sort</button>
      </div>

      <entity-table
        .entities=${this.filteredEntities}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${true}
        .emptyMessage=${"No entities found"}
        @sort-changed=${this.handleSortChanged}
      ></entity-table>

      ${this.selectedEntity ? x`
        <entity-details-modal
          .entity=${this.selectedEntity}
          @close-modal=${this.handleCloseModal}
          @open-more-info=${this.handleOpenMoreInfo}
        ></entity-details-modal>
      ` : ""}
    `;
  }
};
StorageOverviewView.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
      }

      .description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }

      .clear-sort-container {
        margin-bottom: 8px;
        text-align: right;
      }
    `
];
__decorateClass$1([
  n2({ type: Object })
], StorageOverviewView.prototype, "hass", 2);
__decorateClass$1([
  n2({ type: Array })
], StorageOverviewView.prototype, "entities", 2);
__decorateClass$1([
  n2({ type: Object })
], StorageOverviewView.prototype, "summary", 2);
__decorateClass$1([
  n2({ type: Object })
], StorageOverviewView.prototype, "databaseSize", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "searchQuery", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "basicFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "registryFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "stateFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "advancedFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "sortStack", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "selectedEntity", 2);
StorageOverviewView = __decorateClass$1([
  t("storage-overview-view")
], StorageOverviewView);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
let StatisticsOrphanPanelV2 = class extends i {
  constructor() {
    super(...arguments);
    this.currentView = "orphans";
    this.loading = false;
    this.loadingMessage = "";
    this.loadingSteps = [];
    this.currentStepIndex = 0;
    this.error = null;
    this.orphans = [];
    this.databaseSize = null;
    this.deletedStorage = 0;
    this.unavailableStorage = 0;
    this.storageEntities = [];
    this.storageSummary = null;
  }
  connectedCallback() {
    super.connectedCallback();
    this.apiService = new ApiService(this.hass);
  }
  initLoadingSteps(steps) {
    this.loadingSteps = steps.map((label, index) => ({
      label,
      status: index === 0 ? "active" : "pending"
    }));
    this.currentStepIndex = 0;
  }
  completeCurrentStep() {
    if (this.currentStepIndex < this.loadingSteps.length) {
      this.loadingSteps[this.currentStepIndex].status = "complete";
      this.currentStepIndex++;
      if (this.currentStepIndex < this.loadingSteps.length) {
        this.loadingSteps[this.currentStepIndex].status = "active";
      }
      this.requestUpdate();
    }
  }
  async loadOrphanFinderData() {
    this.loading = true;
    this.error = null;
    this.initLoadingSteps([
      "Reading entity registry",
      "Reading state machine",
      "Scanning states_meta table",
      "Scanning statistics_meta table",
      "Identifying deleted entities",
      "Identifying unavailable entities",
      "Calculating storage usage",
      "Fetching database statistics"
    ]);
    try {
      this.loadingMessage = "Analyzing orphaned entities...";
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      const orphanData = await this.apiService.fetchOrphansList();
      this.orphans = orphanData.orphans;
      this.deletedStorage = orphanData.deleted_storage;
      this.unavailableStorage = orphanData.unavailable_storage;
      this.completeCurrentStep();
      this.completeCurrentStep();
      this.loadingMessage = "Fetching database statistics...";
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.completeCurrentStep();
      this.loadingMessage = "Complete!";
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error loading orphan finder data:", err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }
  async loadStorageOverviewData() {
    this.loading = true;
    this.error = null;
    this.initLoadingSteps([
      "Reading entity registry",
      "Reading state machine",
      "Scanning states_meta table",
      "Scanning states table",
      "Scanning statistics_meta table",
      "Scanning statistics tables",
      "Calculating entity summaries",
      "Fetching database statistics"
    ]);
    try {
      this.loadingMessage = "Building storage overview...";
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.completeCurrentStep();
      const overview = await this.apiService.fetchEntityStorageOverview();
      this.storageEntities = overview.entities;
      this.storageSummary = overview.summary;
      this.completeCurrentStep();
      this.completeCurrentStep();
      this.loadingMessage = "Fetching database statistics...";
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.completeCurrentStep();
      this.loadingMessage = "Complete!";
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error loading storage overview data:", err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }
  handleTabChange(view) {
    this.currentView = view;
  }
  handleRefresh() {
    if (this.currentView === "orphans") {
      this.loadOrphanFinderData();
    } else {
      this.loadStorageOverviewData();
    }
  }
  async handleGenerateSql(e2) {
    const { metadataId, origin, entity } = e2.detail;
    this.loading = true;
    this.loadingMessage = "Generating SQL...";
    try {
      const result = await this.apiService.generateDeleteSql(metadataId, origin);
      const modalData = {
        entityId: entity.entity_id,
        metadataId,
        origin,
        status: entity.status,
        count: entity.count
      };
      if (this.orphanView) {
        this.orphanView.showDeleteModal(modalData, result.sql, result.storage_saved);
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Failed to generate SQL";
      console.error("Error generating SQL:", err);
    } finally {
      this.loading = false;
    }
  }
  render() {
    return x`
      <div class="header">
        <h1>Statistics Orphan Finder</h1>
        <button class="refresh-button" @click=${this.handleRefresh}>
          ↻ Refresh
        </button>
      </div>

      ${this.error ? x`
        <div class="error-message">
          <strong>Error:</strong> ${this.error}
        </div>
      ` : ""}

      <div class="tab-navigation">
        <button
          class="tab-button ${this.currentView === "orphans" ? "active" : ""}"
          @click=${() => this.handleTabChange("orphans")}
        >
          Orphaned Entities
        </button>
        <button
          class="tab-button ${this.currentView === "storage" ? "active" : ""}"
          @click=${() => this.handleTabChange("storage")}
        >
          Storage Overview
        </button>
      </div>

      ${this.currentView === "orphans" ? x`
        <orphan-finder-view
          .hass=${this.hass}
          .orphans=${this.orphans}
          .databaseSize=${this.databaseSize}
          .deletedStorage=${this.deletedStorage}
          .unavailableStorage=${this.unavailableStorage}
          @generate-sql=${this.handleGenerateSql}
        ></orphan-finder-view>
      ` : x`
        <storage-overview-view
          .hass=${this.hass}
          .entities=${this.storageEntities}
          .summary=${this.storageSummary}
          .databaseSize=${this.databaseSize}
        ></storage-overview-view>
      `}

      ${this.loading ? x`
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-title">${this.loadingMessage}</div>

            ${this.loadingSteps.length > 0 ? x`
              <div class="loading-steps">
                ${this.loadingSteps.map((step, index) => {
      let indicator = "○";
      if (step.status === "complete") indicator = "●";
      else if (step.status === "active") indicator = "⧗";
      return x`
                    <div class="loading-step ${step.status}">
                      <span class="step-indicator">${indicator}</span>
                      <span class="step-label">${step.label}</span>
                    </div>
                  `;
    })}
              </div>

              <div class="loading-progress">
                Step ${this.currentStepIndex + 1} of ${this.loadingSteps.length}
              </div>
            ` : x`
              <div style="text-align: center;">
                <div class="loading-spinner"></div>
              </div>
            `}
          </div>
        </div>
      ` : ""}
    `;
  }
};
StatisticsOrphanPanelV2.styles = [
  sharedStyles,
  i$3`
      :host {
        display: block;
        padding: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .tab-navigation {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
      }

      .tab-button {
        padding: 8px 24px;
        background: var(--secondary-background-color);
        border: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        transition: background 0.3s;
      }

      .tab-button:hover {
        background: var(--divider-color);
      }

      .tab-button.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-content {
        background: var(--card-background-color);
        padding: 32px;
        border-radius: 8px;
        min-width: 400px;
        max-width: 500px;
      }

      .loading-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        text-align: center;
        color: var(--primary-text-color);
      }

      .loading-steps {
        margin-bottom: 20px;
      }

      .loading-step {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        font-size: 14px;
      }

      .step-indicator {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
      }

      .step-label {
        color: var(--primary-text-color);
      }

      .loading-step.pending .step-label {
        color: var(--secondary-text-color);
        opacity: 0.6;
      }

      .loading-step.active .step-label {
        font-weight: 500;
        color: var(--primary-color);
      }

      .loading-step.complete .step-label {
        color: var(--primary-text-color);
      }

      .loading-progress {
        text-align: center;
        font-size: 13px;
        color: var(--secondary-text-color);
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .error-message {
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid var(--error-color, #F44336);
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
        color: var(--error-color, #F44336);
      }

      .refresh-button {
        margin-left: 16px;
      }
    `
];
__decorateClass([
  n2({ type: Object })
], StatisticsOrphanPanelV2.prototype, "hass", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "currentView", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "loading", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "loadingMessage", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "loadingSteps", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "currentStepIndex", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "error", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "orphans", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "databaseSize", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "deletedStorage", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "unavailableStorage", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "storageEntities", 2);
__decorateClass([
  r()
], StatisticsOrphanPanelV2.prototype, "storageSummary", 2);
__decorateClass([
  e("orphan-finder-view")
], StatisticsOrphanPanelV2.prototype, "orphanView", 2);
StatisticsOrphanPanelV2 = __decorateClass([
  t("statistics-orphan-panel-v2")
], StatisticsOrphanPanelV2);
export {
  StatisticsOrphanPanelV2
};
//# sourceMappingURL=statistics-orphan-panel.js.map
