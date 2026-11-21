(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x2)(function(x2) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x2 + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/ui/dom.mjs
  var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  var DOWNLOAD_RELEASE_DELAY = 1e3;
  function element(id) {
    return document.getElementById(id);
  }
  function node(tag, text2, className) {
    const result = document.createElement(tag);
    result.textContent = text2;
    if (className !== "") {
      result.className = className;
    }
    return result;
  }
  function svgElement(parent, name, attributes, text2 = "") {
    const shape = document.createElementNS(SVG_NAMESPACE, name);
    for (const key of Object.keys(attributes)) {
      shape.setAttribute(key, String(attributes[key]));
    }
    if (text2 !== "") {
      shape.textContent = text2;
    }
    parent.append(shape);
    return shape;
  }
  function revokeDownload(url) {
    URL.revokeObjectURL(url);
  }
  function downloadFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor2 = document.createElement("a");
    anchor2.href = url;
    anchor2.download = name;
    anchor2.click();
    window.setTimeout(revokeDownload.bind(null, url), DOWNLOAD_RELEASE_DELAY);
  }
  function icon(name) {
    const result = document.createElement("i");
    result.dataset.lucide = name;
    result.setAttribute("aria-hidden", "true");
    return result;
  }
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // src/chips/document-references.mjs
  var DOCUMENT_REFERENCES = {
    "6116": {
      image: "assets/pinouts/document/6116-1.png",
      logicImage: "assets/pinouts/document/6116-2.jpeg",
      summary: "6116 \u662F\u4E00\u7247 2K\xD78 \u9759\u6001 RAM\uFF0C24 \u811A\u63A5 +5V\uFF0C12 \u811A\u63A5\u5730\u3002A0\uFF5EA10 \u7528\u6765\u9009\u5730\u5740\uFF0CD0\uFF5ED7 \u65E2\u80FD\u8F93\u5165\u4E5F\u80FD\u8F93\u51FA\u3002CE\u2032\u3001OE\u2032 \u548C WE\u2032 \u90FD\u662F\u4F4E\u7535\u5E73\u6709\u6548\u3002\u5199\u5165\u65F6\u628A CE\u2032 \u548C WE\u2032 \u7F6E 0\uFF0C\u8BFB\u51FA\u65F6\u8BBE CE\u2032=0\u3001WE\u2032=1\u3001OE\u2032=0\u3002\u5728\u786E\u5B9A\u7684\u7981\u6B62\u6761\u4EF6\u4E0B\uFF0C\u6570\u636E\u7AEF\u8FDB\u5165\u9AD8\u963B\u6001\u3002\u521A\u4E0A\u7535\u65F6\u5185\u5BB9\u672A\u77E5\uFF0C\u65AD\u7535\u540E\u4F1A\u4E22\u5931\u3002\u5148\u7ED3\u675F\u5199\u5165\uFF0C\u518D\u5173\u95ED 74LS244\uFF0C\u53EF\u4EE5\u907F\u514D\u8BEF\u5199\u3002"
    },
    "74LS244": {
      image: "assets/pinouts/document/74ls244-1.png",
      logicImage: "assets/pinouts/document/74ls244-1.png",
      summary: "\u516B\u8DEF\u540C\u76F8\u4E09\u6001\u7F13\u51B2\u5668\u5206\u4E3A\u4E24\u7EC4\uFF0C\u6BCF\u7EC4\u56DB\u8DEF\uFF0C\u7531 1 \u811A\u548C 19 \u811A\u5206\u522B\u4F7F\u80FD\u3002\u4F7F\u80FD\u4E3A 0 \u65F6\uFF0C\u6570\u636E\u4ECE A \u7AEF\u4F20\u5230 Y \u7AEF\uFF0C\u7535\u5E73\u4FDD\u6301\u4E0D\u53D8\u3002\u628A\u4F7F\u80FD\u7F6E 1\uFF0C\u8BE5\u7EC4\u56DB\u8DEF\u8F93\u51FA\u5C31\u8FDB\u5165\u9AD8\u963B\u6001\u3002\u4E24\u7EC4\u53EF\u4EE5\u72EC\u7ACB\u63A7\u5236\uFF0C20 \u811A\u63A5 +5V\uFF0C10 \u811A\u63A5\u5730\u3002"
    },
    "74LS03": {
      "image": "assets/pinouts/document/74ls03-1.png",
      "logicImage": "assets/pinouts/document/74ls03-2.png",
      "summary": "\u5B83\u548C 74LS00 \u4E00\u6837\u5B9E\u73B0\u4E0E\u975E\u903B\u8F91\uFF0CY=(AB)\u2032\u3002\u8F93\u51FA\u662F\u96C6\u7535\u6781\u5F00\u8DEF\uFF08OC\uFF09\uFF0C\u9700\u8981\u5916\u63A5\u4E0A\u62C9\u7535\u963B\u3002\u591A\u4E2A OC \u8F93\u51FA\u53EF\u4EE5\u5E76\u8054\u5B9E\u73B0\u300C\u7EBF\u4E0E\u300D\uFF0C\u5E38\u7528\u4E8E\u603B\u7EBF\u9A71\u52A8\u548C\u7535\u5E73\u8F6C\u6362\u3002"
    },
    "74LS20": {
      "pinWarning": "\u6750\u6599\u7248\u811A\u53F7\uFF1A\u7B2C 1 \u95E8\u8F93\u5165\u4E3A 1\u30012\u300112\u300113 \u811A\uFF1BTI \u6807\u51C6 DIP \u7B2C 1 \u95E8\u8F93\u5165\u4E3A 1\u30012\u30014\u30015 \u811A\uFF0C\u4E24\u8005\u4E0D\u53EF\u6DF7\u7528",
      "image": "assets/pinouts/document/74ls20-1.png",
      "logicImage": "assets/pinouts/document/74ls20-2.png",
      "summary": "\u7247\u5185\u6709\u4E24\u4E2A\u72EC\u7ACB\u7684\u56DB\u8F93\u5165\u4E0E\u975E\u95E8\uFF0CY=(ABCD)\u2032\u3002\u548C 74LS138 \u914D\u5408\u4F7F\u7528\uFF0C\u5C31\u80FD\u5B9E\u73B0\u7EC4\u5408\u903B\u8F91\u51FD\u6570\u3002\u8981\u628A\u5B83\u5F53\u4F5C\u53CD\u76F8\u5668\uFF0C\u53EF\u4EE5\u628A\u591A\u4F59\u7684\u8F93\u5165\u63A5\u5230\u9AD8\u7535\u5E73\uFF0C\u4E5F\u53EF\u4EE5\u628A\u8F93\u5165\u5E76\u5728\u4E00\u8D77\u3002"
    },
    "CD4011": {
      "image": "assets/pinouts/document/cd4011-1.png",
      "logicImage": "assets/pinouts/document/cd4011-2.png",
      "summary": "\u7247\u5185\u6709\u56DB\u4E2A\u53CC\u8F93\u5165 CMOS \u4E0E\u975E\u95E8\uFF0CY=(AB)\u2032\u3002\u5B83\u7684\u7535\u6E90\u7535\u538B\u8303\u56F4\u662F 3\uFF5E15 V\uFF0C\u8F93\u5165\u963B\u6297\u9AD8\uFF0C\u9759\u6001\u529F\u8017\u5C0F\u3002\u591A\u4F59\u7684\u8F93\u5165\u811A\u8981\u63A5 VDD \u6216 VSS\u3002\u5B9E\u9A8C 2 \u53EF\u7528\u5B83\u6D4B\u91CF\u7535\u538B\u4F20\u8F93\u7279\u6027\u548C\u4F20\u8F93\u5EF6\u8FDF\u3002"
    },
    "74LS125": {
      "image": "assets/pinouts/document/74ls125-1.png",
      "logicImage": "assets/pinouts/document/74ls125-2.png",
      "summary": "\u7247\u5185\u6709\u56DB\u4E2A\u72EC\u7ACB\u7684\u540C\u76F8\u4E09\u6001\u7F13\u51B2\u95E8\u3002G\u2032 \u4E3A 0 \u65F6\uFF0CY \u8DDF\u968F A\uFF0C\u7535\u5E73\u4FDD\u6301\u4E0D\u53D8\u3002G\u2032 \u4E3A 1 \u65F6\uFF0CY \u8FDB\u5165\u9AD8\u963B\u6001\u3002\u5B83\u5E38\u7528\u4E8E\u603B\u7EBF\u3001\u6570\u636E\u9009\u62E9\u548C\u4FE1\u53F7\u9694\u79BB\u3002"
    },
    "74LS139": {
      "image": "assets/pinouts/document/74ls139-1.png",
      "logicImage": "assets/pinouts/document/74ls139-2.png",
      "summary": "\u7247\u5185\u6709\u4E24\u4E2A\u72EC\u7ACB\u7684\u4E8C\u7EBF\u56DB\u7EBF\u8BD1\u7801\u5668\u3002\u6BCF\u7EC4\u90FD\u6709\u81EA\u5DF1\u7684\u4F4E\u6709\u6548\u4F7F\u80FD\u811A\u3001\u4E24\u4E2A\u5730\u5740\u811A\u548C\u56DB\u4E2A\u4F4E\u6709\u6548\u8F93\u51FA\u811A\u3002A \u662F\u5730\u5740\u4F4E\u4F4D\uFF0CB \u662F\u9AD8\u4F4D\u3002G\u2032 \u4E3A 0 \u65F6\uFF0C\u5730\u5740\u9009\u4E2D\u7684\u4E00\u8DEF\u8F93\u51FA\u4F4E\u7535\u5E73\u3002\u628A\u4E24\u7EC4\u7684\u5730\u5740\u811A\u5E76\u63A5\uFF0C\u518D\u7528 A2 \u53CA\u5176\u53CD\u76F8\u4FE1\u53F7\u9009\u901A\u5176\u4E2D\u4E00\u7EC4\uFF0C\u5C31\u80FD\u7EC4\u6210\u4E09\u7EBF\u516B\u7EBF\u8BD1\u7801\u5668\u3002"
    },
    "74LS151": {
      "image": "assets/pinouts/document/74ls151-1.png",
      "logicImage": "assets/pinouts/document/74ls151-2.png",
      "summary": "D0\uFF5ED7 \u662F\u516B\u8DEF\u6570\u636E\u8F93\u5165\uFF0C\u5730\u5740 C\u3001B\u3001A \u4ECE\u9AD8\u4F4D\u5230\u4F4E\u4F4D\u6392\u5217\uFF0CY \u548C W\u2032 \u662F\u4E92\u8865\u8F93\u51FA\u3002G\u2032 \u4E3A 0 \u65F6\uFF0CY \u8F93\u51FA\u5730\u5740\u9009\u4E2D\u7684\u6570\u636E Di\uFF08i=CBA\uFF09\u3002G\u2032 \u4E3A 1 \u65F6\uFF0CY \u8F93\u51FA 0\u3002\u628A\u5404\u4E2A Di \u6309 F(mi) \u7684\u53D6\u503C\u63A5\u5230 0 \u6216 1\uFF0C\u5C31\u80FD\u5B9E\u73B0\u4EFB\u610F\u4E09\u53D8\u91CF\u51FD\u6570\u3002"
    },
    "74LS153": {
      "image": "assets/pinouts/document/74ls153-1.png",
      "logicImage": "assets/pinouts/document/74ls153-2.png",
      "summary": "\u4E24\u7EC4\u56DB\u9009\u4E00\u9009\u62E9\u5668\u5171\u7528\u5730\u5740\u7AEF A\uFF08\u4F4E\u4F4D\uFF09\u548C B\uFF08\u9AD8\u4F4D\uFF09\uFF0C\u5404\u6709\u81EA\u5DF1\u7684\u4F7F\u80FD\u811A 1G\u2032\u30012G\u2032 \u548C\u6570\u636E\u8F93\u5165\u3002\u67D0\u7EC4\u7684 G\u2032 \u4E3A 0 \u65F6\uFF0CY \u8F93\u51FA\u5730\u5740\u9009\u4E2D\u7684 Ci\uFF08i=BA\uFF09\uFF0CG\u2032 \u4E3A 1 \u65F6\uFF0CY \u8F93\u51FA 0\u3002\u7528\u4E24\u7247\u82AF\u7247\u6216\u591A\u6B21\u590D\u7528\uFF0C\u53EF\u4EE5\u5B9E\u73B0\u56DB\u53D8\u91CF\u51FD\u6570\u3002"
    },
    "74LS85": {
      "pinWarning": "\u6750\u6599\u7248\u811A\u53F7\uFF1AA2 \u4E3A 14 \u811A\uFF0CB2 \u4E3A 13 \u811A\uFF1BTI \u6807\u51C6 DIP \u4E3A A2 13\u3001B2 14\uFF0C\u4E24\u8005\u4E0D\u53EF\u6DF7\u7528",
      "image": "assets/pinouts/document/74ls85-1.png",
      "logicImage": "assets/pinouts/document/74ls85-2.png",
      "summary": "\u7528\u6765\u6BD4\u8F83 A3A2A1A0 \u548C B3B2B1B0\uFF0C\u4E09\u4E2A\u9AD8\u6709\u6548\u8F93\u51FA\u5206\u522B\u8868\u793A A>B\u3001A=B \u548C A<B\u30022\uFF5E4 \u811A\u662F\u7EA7\u8054\u8F93\u5165\u3002\u5355\u7247\u4F7F\u7528\u65F6\uFF0C\u628A A>B\u3001A<B \u8F93\u5165\u7F6E 0\uFF0C\u628A A=B \u8F93\u5165\u7F6E 1\u3002\u4E24\u7247\u7EA7\u8054\u540E\u53EF\u4EE5\u6BD4\u8F83\u516B\u4F4D\u6570\u3002"
    },
    "74LS48": {
      "image": "assets/pinouts/document/74ls48-1.png",
      "logicImage": "assets/pinouts/document/74ls48-2.png",
      "summary": "\u628A 8421 BCD \u7801\uFF08D \u662F\u6700\u9AD8\u4F4D\uFF0CA \u662F\u6700\u4F4E\u4F4D\uFF09\u8F6C\u6362\u4E3A\u4E03\u6BB5\u5B57\u5F62\u3002a\uFF5Eg \u8F93\u51FA\u9AD8\u7535\u5E73\u6709\u6548\uFF0C\u5185\u90E8\u6709 2 k\u03A9 \u4E0A\u62C9\u7535\u963B\uFF0C\u53EF\u4EE5\u76F4\u63A5\u9A71\u52A8\u5171\u9634\u6781\u6570\u7801\u7BA1\u3002LT\u2032 \u7528\u4E8E\u706F\u6D4B\u8BD5\uFF0CRBI\u2032 \u7528\u4E8E\u706D\u96F6\uFF0CBI\u2032/RBO\u2032 \u53EF\u7528\u4F5C\u706D\u706F\u8F93\u5165\u6216\u52A8\u6001\u706D\u706F\u8F93\u51FA\u3002"
    },
    "74LS74": {
      "image": "assets/pinouts/document/74ls74-1.png",
      "logicImage": "assets/pinouts/document/74ls74-2.png",
      "summary": "\u7247\u5185\u6709\u4E24\u4E2A\u72EC\u7ACB\u7684\u4E0A\u5347\u6CBF D \u89E6\u53D1\u5668\u3002SD\u2032 \u548C RD\u2032 \u5206\u522B\u7528\u4E8E\u5F02\u6B65\u7F6E\u4F4D\u548C\u590D\u4F4D\uFF0C\u90FD\u662F\u4F4E\u7535\u5E73\u6709\u6548\u3002CP \u5230\u4E86\u4E0A\u5347\u6CBF\uFF0CQ \u5C31\u4F1A\u4FDD\u5B58 D \u7684\u7535\u5E73\u3002\u5B83\u53EF\u4EE5\u7528\u6765\u642D\u5EFA\u79FB\u4F4D\u5BC4\u5B58\u5668\u3001\u8BA1\u6570\u5668\u548C\u5206\u9891\u7535\u8DEF\u3002"
    },
    "74LS112": {
      "pinWarning": "\u6750\u6599\u7248\u811A\u53F7\uFF1A\u7B2C\u4E8C\u8DEF Q \u4E3A 7 \u811A\uFF0CQ\u2032 \u4E3A 9 \u811A\uFF1BTI \u6807\u51C6 DIP \u4E3A Q 9\u3001Q\u2032 7\uFF0C\u7B2C\u4E00\u8DEF\u811A\u53F7\u76F8\u540C",
      "image": "assets/pinouts/document/74ls112-1.png",
      "logicImage": "assets/pinouts/document/74ls112-2.png",
      "summary": "\u7247\u5185\u6709\u4E24\u4E2A\u72EC\u7ACB\u7684\u4E0B\u964D\u6CBF JK \u89E6\u53D1\u5668\uFF0CSD\u2032 \u548C RD\u2032 \u5206\u522B\u7528\u4E8E\u5F02\u6B65\u7F6E\u4F4D\u548C\u590D\u4F4D\uFF0C\u90FD\u662F\u4F4E\u7535\u5E73\u6709\u6548\u3002J\u3001K \u90FD\u4E3A 1 \u65F6\uFF0CCP \u6BCF\u51FA\u73B0\u4E00\u6B21\u4E0B\u964D\u6CBF\uFF0CQ \u5C31\u7FFB\u8F6C\u4E00\u6B21\uFF08T\u2032 \u529F\u80FD\uFF09\u3002\u5B83\u53EF\u7528\u4E8E\u8BA1\u6570\uFF0C\u4E5F\u53EF\u4E0E 74LS74 \u914D\u5408\u505A\u89E6\u53D1\u5668\u76F8\u4E92\u8F6C\u6362\u5B9E\u9A8C\u3002"
    },
    "CD4027": {
      "image": "assets/pinouts/document/cd4027-1.png",
      "logicImage": "assets/pinouts/document/cd4027-2.png",
      "summary": "\u8FD9\u662F CMOS \u53CC JK \u4E3B\u4ECE\u89E6\u53D1\u5668\uFF0C\u5728\u4E0A\u5347\u6CBF\u89E6\u53D1\u3002SET \u548C RESET \u90FD\u662F\u9AD8\u7535\u5E73\u6709\u6548\uFF0C\u4E0D\u9700\u8981\u7B49\u5F85\u65F6\u949F\u3002\u5B83\u7684\u7535\u6E90\u8303\u56F4\u4E3A 3\uFF5E15 V\uFF0C\u8F93\u5165\u963B\u6297\u9AD8\uFF0C\u529F\u8017\u4F4E\u3002\u7F6E\u4F4D\u3001\u590D\u4F4D\u6781\u6027\u548C\u811A\u4F4D\u4E0E 74LS112 \u4E0D\u540C\u3002"
    },
    "74LS160": {
      "image": "assets/pinouts/document/74ls160-1.png",
      "logicImage": "assets/pinouts/document/74ls160-2.png",
      "summary": "\u8FD9\u7247\u8BA1\u6570\u5668\u6309\u6A21 10 \u540C\u6B65\u52A0\u8BA1\u6570\u3002CLR\u2032 \u548C LOAD\u2032 \u90FD\u662F\u4F4E\u7535\u5E73\u6709\u6548\uFF0C\u5206\u522B\u7528\u4E8E\u5F02\u6B65\u6E05\u96F6\u548C\u540C\u6B65\u7F6E\u6570\u3002ENP \u548C ENT \u90FD\u4E3A\u9AD8\u7535\u5E73\u65F6\uFF0C\u6BCF\u4E2A CP \u4E0A\u5347\u6CBF\u8BA1\u6570\u4E00\u6B21\u3002\u8BA1\u5230 9 \u4E14 ENT \u4E3A 1 \u65F6\uFF0CRCO \u8F93\u51FA\u9AD8\u7535\u5E73\u3002"
    },
    "74LS161": {
      "image": "assets/pinouts/document/74ls161-1.png",
      "logicImage": "assets/pinouts/document/74ls161-2.png",
      "summary": "\u8FD9\u7247\u8BA1\u6570\u5668\u6309\u6A21 16 \u540C\u6B65\u52A0\u8BA1\u6570\uFF0C\u811A\u4F4D\u4E0E 74LS160 \u76F8\u540C\u3002CLR\u2032 \u548C LOAD\u2032 \u90FD\u662F\u4F4E\u7535\u5E73\u6709\u6548\uFF0C\u5206\u522B\u7528\u4E8E\u5F02\u6B65\u6E05\u96F6\u548C\u540C\u6B65\u7F6E\u6570\u3002ENP\u3001ENT \u7528\u4E8E\u4F7F\u80FD\u8BA1\u6570\uFF0CRCO \u7528\u4E8E\u8F93\u51FA\u8FDB\u4F4D\u3002\u7528\u53CD\u9988\u6E05\u96F6\u6216\u7F6E\u6570\uFF0C\u53EF\u4EE5\u5F97\u5230\u5176\u4ED6\u8BA1\u6570\u6A21\u6570\u3002"
    }
  };

  // src/chips/catalog.mjs
  var CHIP_REFERENCES = {
    "74LS273": { file: "sn74ls273", page: 1, summary: "\u8FD9\u7247\u5BC4\u5B58\u5668\u80FD\u540C\u65F6\u4FDD\u5B58\u516B\u4F4D\u6570\u636E\u3002\u628A\u6E05\u96F6\u811A\u62C9\u4F4E\uFF0C\u516B\u8DEF\u8F93\u51FA\u90FD\u4F1A\u7ACB\u5373\u53D8\u6210 0\u3002\u6E05\u96F6\u811A\u4E3A\u9AD8\u7535\u5E73\u65F6\uFF0C\u5BC4\u5B58\u5668\u5728\u65F6\u949F\u4E0A\u5347\u6CBF\u628A D \u4E0A\u7684\u6570\u636E\u5B58\u4E0B\u6765\uFF0C\u518D\u4ECE Q \u8F93\u51FA\u3002" },
    "74LS283": { file: "sn74ls283", page: 1, summary: "\u628A\u4E24\u4E2A\u56DB\u4F4D\u6570\u548C\u8F93\u5165\u8FDB\u4F4D C0 \u52A0\u8D77\u6765\uFF0C\u5C31\u5F97\u5230\u56DB\u4F4D\u548C\u4E0E\u8F93\u51FA\u8FDB\u4F4D C4\u3002A1\u3001B1 \u548C \u03A31 \u90FD\u5BF9\u5E94\u6700\u4F4E\u4F4D\u3002" },
    "74LS86": { file: "sn74ls86a", page: 1, summary: "\u7247\u5185\u6709\u56DB\u4E2A\u72EC\u7ACB\u7684\u5F02\u6216\u95E8\u3002\u6BCF\u4E2A\u95E8\u5728\u4E24\u4E2A\u8F93\u5165\u4E0D\u540C\u65F6\u8F93\u51FA 1\uFF0C\u76F8\u540C\u65F6\u8F93\u51FA 0\u3002\u56FE\u4E2D\u7684 TI LS86A DIP \u811A\u4F4D\u4E0E\u5B9E\u9A8C\u6750\u6599\u4E00\u81F4\u3002" },
    "74LS00": { file: "sn74ls00", page: 3, summary: "\u7247\u5185\u6709\u56DB\u4E2A\u72EC\u7ACB\u7684\u4E0E\u975E\u95E8\u3002\u5BF9\u6BCF\u4E2A\u95E8\u6765\u8BF4\uFF0C\u53EA\u6709\u4E24\u4E2A\u8F93\u5165\u90FD\u662F 1\uFF0C\u8F93\u51FA\u624D\u4F1A\u53D8\u6210 0\u3002\u63A5\u7EBF\u65F6\u53EF\u4EE5\u6309\u56FE\u4E2D\u7684\u811A\u540D\u627E\u5230\u5BF9\u5E94\u5F15\u811A\u3002" },
    "74LS08": { file: "sn74ls08", page: 1, summary: "\u7247\u5185\u6709\u56DB\u4E2A\u72EC\u7ACB\u7684\u4E0E\u95E8\u3002\u5BF9\u6BCF\u4E2A\u95E8\u6765\u8BF4\uFF0C\u4E24\u4E2A\u8F93\u5165\u90FD\u4E3A 1 \u65F6\uFF0C\u8F93\u51FA\u624D\u662F 1\uFF0C\u5176\u4F59\u60C5\u51B5\u4E0B\u8F93\u51FA 0\u3002" },
    "74LS32": { file: "sn74ls32", page: 1, summary: "\u7247\u5185\u6709\u56DB\u4E2A\u72EC\u7ACB\u7684\u6216\u95E8\u3002\u5BF9\u6BCF\u4E2A\u95E8\u6765\u8BF4\uFF0C\u53EA\u8981\u81F3\u5C11\u6709\u4E00\u4E2A\u8F93\u5165\u662F 1\uFF0C\u8F93\u51FA\u5C31\u662F 1\u3002" },
    "74LS04": { file: "sn74ls04", page: 1, summary: "\u7247\u5185\u7684\u516D\u4E2A\u975E\u95E8\u5404\u81EA\u5DE5\u4F5C\u3002\u6BCF\u4E2A\u95E8\u90FD\u4F1A\u628A\u8F93\u5165\u53CD\u8FC7\u6765\uFF0C\u8F93\u5165 0 \u5C31\u8F93\u51FA 1\uFF0C\u8F93\u5165 1 \u5C31\u8F93\u51FA 0\u3002" },
    "74LS138": { file: "sn74ls138", page: 1, summary: "A\u3001B\u3001C \u5206\u522B\u662F\u5730\u5740\u7684\u4F4E\u4F4D\u3001\u4E2D\u95F4\u4F4D\u548C\u9AD8\u4F4D\u3002G1=1 \u4E14 G2A\u2032\u3001G2B\u2032 \u90FD\u4E3A 0 \u65F6\uFF0C\u5730\u5740\u9009\u4E2D\u7684\u90A3\u4E00\u8DEF\u8F93\u51FA\u4F4E\u7535\u5E73\uFF0C\u5176\u4F59\u4E03\u8DEF\u8F93\u51FA\u9AD8\u7535\u5E73\u3002\u7981\u6B62\u8BD1\u7801\u65F6\uFF0C\u516B\u8DEF\u90FD\u4FDD\u6301\u9AD8\u7535\u5E73\u3002" },
    "74LS194": { file: "sn74ls194a", page: 1, summary: "\u8FD9\u7247\u56DB\u4F4D\u5BC4\u5B58\u5668\u53EF\u4EE5\u5411\u5DE6\u6216\u5411\u53F3\u79FB\u4F4D\u3002\u628A CLR\u2032 \u62C9\u4F4E\u5C31\u4F1A\u7ACB\u5373\u6E05\u96F6\u3002CLK \u51FA\u73B0\u4E0A\u5347\u6CBF\u65F6\uFF0CS1S0 \u4E3A 00 \u5C31\u4FDD\u6301\u539F\u503C\uFF0C\u4E3A 01 \u5C31\u53F3\u79FB\uFF08SR \u4E32\u5165 QA\uFF09\uFF0C\u4E3A 10 \u5C31\u5DE6\u79FB\uFF08SL \u4E32\u5165 QD\uFF09\uFF0C\u4E3A 11 \u5C31\u5E76\u884C\u88C5\u8F7D\u3002" }
  };
  for (const model of Object.keys(DOCUMENT_REFERENCES)) {
    CHIP_REFERENCES[model] = DOCUMENT_REFERENCES[model];
  }
  function compareChipNames(first, second) {
    const firstFamily = first.replace(/[0-9]+$/, "");
    const secondFamily = second.replace(/[0-9]+$/, "");
    const familyOrder = firstFamily.localeCompare(secondFamily, "en");
    if (familyOrder !== 0) {
      return familyOrder;
    }
    return first.localeCompare(second, "en", { numeric: true });
  }
  function sortedChipNames() {
    const names = Object.keys(CHIP_REFERENCES);
    names.sort(compareChipNames);
    return names;
  }

  // src/ui/chip-reference-view.mjs
  function appendChipReference(container, chip) {
    const reference = CHIP_REFERENCES[chip.model];
    if (reference.pinWarning) {
      container.append(node("p", reference.pinWarning, "pin-warning"));
    }
    const figure = node("figure", "", "chip-reference");
    const imageLink = node("a", "", "");
    let imagePath = "assets/pinouts/" + reference.file + ".png";
    if (reference.image) {
      imagePath = reference.image;
    }
    imageLink.href = imagePath;
    imageLink.target = "_blank";
    imageLink.rel = "noopener";
    const image = document.createElement("img");
    image.src = imageLink.href;
    image.alt = chip.model + " DIP \u5F15\u811A\u56FE";
    imageLink.append(image);
    let caption = "\u539F\u5382\u9876\u89C6\u56FE\uFF1A\u7F3A\u53E3\u671D\u4E0A\uFF1B\u753B\u5E03\u4E2D\u7684\u82AF\u7247\u7F3A\u53E3\u671D\u5DE6";
    let sourceLabel = "TI \u6570\u636E\u624B\u518C \xB7 \u7B2C " + reference.page + " \u9875";
    if (reference.image) {
      caption = "\u5C01\u88C5\u5F15\u811A\u56FE";
      sourceLabel = "\u67E5\u770B\u903B\u8F91\u7B26\u53F7";
    }
    figure.append(imageLink, node("figcaption", caption, ""));
    const source = node("a", sourceLabel, "datasheet-link");
    source.href = "assets/datasheets/" + reference.file + ".pdf#page=" + reference.page;
    if (reference.logicImage) {
      source.href = reference.logicImage;
    }
    source.target = "_blank";
    source.rel = "noopener";
    container.append(figure, source, node("p", reference.summary, "chip-summary"));
  }

  // src/ui/motion.mjs
  var MOTION = { duration: 180, zoomDuration: 160, toastDuration: 180 };
  var WHEEL_ZOOM = { sensitivity: 15e-4, linePixels: 16 };
  var transitions = /* @__PURE__ */ new Map();
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var frame = 0;
  function wheelZoomFactor(event, viewport) {
    let pixels = event.deltaY;
    if (event.deltaMode === 1) {
      pixels = pixels * WHEEL_ZOOM.linePixels;
    } else if (event.deltaMode === 2) {
      pixels = pixels * viewport.clientHeight;
    }
    return Math.exp(-pixels * WHEEL_ZOOM.sensitivity);
  }
  function easing(progress) {
    const remaining = 1 - progress;
    return 1 - remaining * remaining * remaining;
  }
  function stepTransitions(time) {
    frame = 0;
    for (const entry of transitions) {
      const key = entry[0];
      const transition = entry[1];
      const progress = Math.min(1, (time - transition.started) / transition.duration);
      const value = transition.first + (transition.last - transition.first) * easing(progress);
      transition.update(value);
      if (progress === 1) {
        transitions.delete(key);
      }
    }
    if (transitions.size > 0) {
      frame = window.requestAnimationFrame(stepTransitions);
    }
  }
  function tween(key, first, last, update, duration) {
    transitions.delete(key);
    if (reducedMotion.matches || first === last) {
      update(last);
      return;
    }
    transitions.set(key, { first, last, update, duration, started: performance.now() });
    if (frame === 0) {
      frame = window.requestAnimationFrame(stepTransitions);
    }
  }
  function cancelTween(key) {
    transitions.delete(key);
    if (transitions.size === 0 && frame !== 0) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  // src/ui/toast.mjs
  var TOAST_SETTINGS = { duration: 6e3, visibleLimit: 4 };
  var reducedMotion2 = window.matchMedia("(prefers-reduced-motion: reduce)");
  var toastCounter = 0;
  function removeToast(id) {
    const item = element(id);
    if (!item || item.classList.contains("leaving")) {
      return;
    }
    stopTimer(item);
    if (reducedMotion2.matches) {
      item.remove();
      return;
    }
    item.classList.add("leaving");
    item.inert = true;
    item.setAttribute("aria-hidden", "true");
    const timer2 = window.setTimeout(detachToast.bind(null, id), MOTION.toastDuration);
    item.dataset.timer = String(timer2);
  }
  function detachToast(id) {
    const item = element(id);
    if (item) {
      item.remove();
    }
  }
  function closeToast(event) {
    const item = event.currentTarget.closest(".toast");
    removeToast(item.id);
  }
  function stopTimer(item) {
    window.clearTimeout(Number(item.dataset.timer));
    delete item.dataset.timer;
  }
  function startTimer(item) {
    if (!item.isConnected || item.classList.contains("leaving")) {
      return;
    }
    stopTimer(item);
    if (item.dataset.persistent === "true" || item.matches(":hover") || item.contains(document.activeElement)) {
      return;
    }
    const timer2 = window.setTimeout(removeToast.bind(null, item.id), TOAST_SETTINGS.duration);
    item.dataset.timer = String(timer2);
  }
  function pauseToast(event) {
    const item = event.currentTarget;
    if (!item.classList.contains("leaving")) {
      stopTimer(item);
    }
  }
  function resumeToast(event) {
    queueMicrotask(startTimer.bind(null, event.currentTarget));
  }
  function findToast(region, message, kind) {
    for (const item of region.children) {
      if (item.dataset.persistent === "true" || item.classList.contains("leaving")) {
        continue;
      }
      if (item.dataset.message === message && item.classList.contains(kind)) {
        return item;
      }
    }
    return null;
  }
  function trimToasts(region) {
    while (region.children.length > TOAST_SETTINGS.visibleLimit) {
      let oldest = region.firstElementChild;
      for (const item of region.children) {
        if (item.dataset.persistent !== "true" || item.classList.contains("leaving")) {
          oldest = item;
          break;
        }
      }
      stopTimer(oldest);
      oldest.remove();
    }
  }
  function showToast(message, kind, persistent = false) {
    const region = element("toast-region");
    if (!persistent) {
      const existing = findToast(region, message, kind);
      if (existing) {
        startTimer(existing);
        return existing.id;
      }
    }
    toastCounter = toastCounter + 1;
    const item = node("div", "", "toast " + kind);
    item.id = "toast-" + toastCounter;
    item.dataset.message = message;
    let symbol = "circle-alert";
    if (kind === "info") {
      symbol = "info";
    } else if (kind === "warning") {
      symbol = "triangle-alert";
    }
    item.append(icon(symbol), node("span", message, ""));
    const close = node("button", "", "icon-button");
    close.setAttribute("aria-label", "\u5173\u95ED\u63D0\u793A");
    close.append(icon("x"));
    close.addEventListener("click", closeToast);
    item.append(close);
    item.addEventListener("mouseenter", pauseToast);
    item.addEventListener("mouseleave", resumeToast);
    item.addEventListener("focusin", pauseToast);
    item.addEventListener("focusout", resumeToast);
    if (persistent) {
      item.dataset.persistent = "true";
      close.setAttribute("aria-label", "\u5173\u95ED\u7B49\u5F85\u63D0\u793A");
    }
    region.append(item);
    startTimer(item);
    trimToasts(region);
    refreshIcons();
    return item.id;
  }
  function clearToasts() {
    const region = element("toast-region");
    for (const item of region.children) {
      stopTimer(item);
    }
    region.replaceChildren();
  }
  function dismissToast(id) {
    if (id !== "") {
      removeToast(id);
    }
  }

  // src/ui/select-control.mjs
  var SELECT_LAYOUT = {
    margin: 10,
    // 到窗口边缘的最小距离
    gap: 6,
    // 到选择框的距离
    maximumHeight: 320,
    // 最大高度，超出后内部滚动
    upwardThreshold: 180,
    // 下方空间不足时向上展开的判断高度
    minimumHeight: 40
    // 至少保留一行
  };
  var TYPE_SEARCH_DELAY = 700;
  var controls = /* @__PURE__ */ new WeakMap();
  var openedControl = null;
  function closeSelect(restoreFocus) {
    if (!openedControl) {
      return;
    }
    const control = openedControl;
    openedControl = null;
    control.panel.hidePopover();
    control.button.setAttribute("aria-expanded", "false");
    control.button.removeAttribute("aria-activedescendant");
    if (restoreFocus && control.button.isConnected) {
      control.button.focus();
    }
  }
  function positionPanel(control) {
    const bounds = control.button.getBoundingClientRect();
    const width = Math.min(bounds.width, window.innerWidth - SELECT_LAYOUT.margin * 2);
    const left = Math.max(SELECT_LAYOUT.margin, Math.min(bounds.left, window.innerWidth - width - SELECT_LAYOUT.margin));
    const below = window.innerHeight - bounds.bottom - SELECT_LAYOUT.gap - SELECT_LAYOUT.margin;
    const above = bounds.top - SELECT_LAYOUT.gap - SELECT_LAYOUT.margin;
    let available2 = below;
    const upward = below < Math.min(SELECT_LAYOUT.upwardThreshold, above);
    control.panel.dataset.direction = "down";
    if (upward) {
      available2 = above;
      control.panel.dataset.direction = "up";
    }
    control.panel.style.width = width + "px";
    control.panel.style.maxHeight = Math.max(SELECT_LAYOUT.minimumHeight, Math.min(SELECT_LAYOUT.maximumHeight, available2)) + "px";
    control.panel.style.left = left + "px";
    control.panel.style.top = "0px";
    let top = bounds.bottom + SELECT_LAYOUT.gap;
    if (upward) {
      top = bounds.top - SELECT_LAYOUT.gap - control.panel.offsetHeight;
    }
    control.panel.style.top = Math.max(SELECT_LAYOUT.margin, top) + "px";
  }
  function focusOption(control, index) {
    const options = control.items;
    if (options.length === 0) {
      return;
    }
    control.activeIndex = Math.max(0, Math.min(index, options.length - 1));
    for (let position = 0; position < options.length; position = position + 1) {
      options[position].classList.toggle("focused", position === control.activeIndex);
    }
    const active = options[control.activeIndex];
    control.button.setAttribute("aria-activedescendant", active.id);
    const panel = control.panel;
    const firstVisible = panel.scrollTop;
    const lastVisible = firstVisible + panel.clientHeight;
    const firstPixel = active.offsetTop;
    const lastPixel = firstPixel + active.offsetHeight;
    if (firstPixel < firstVisible) {
      panel.scrollTop = firstPixel;
    } else if (lastPixel > lastVisible) {
      panel.scrollTop = lastPixel - panel.clientHeight;
    }
  }
  function updateOptions(control) {
    for (let index = 0; index < control.items.length; index = index + 1) {
      const option = control.select.options[index];
      const item = control.items[index];
      item.setAttribute("aria-selected", String(option.selected));
      item.setAttribute("aria-disabled", String(option.disabled));
      if (control.select.multiple) {
        item.lastElementChild.textContent = option.dataset.order || "";
      }
    }
  }
  function renderOptions(control) {
    control.panel.replaceChildren();
    control.items = [];
    let previousGroup = null;
    for (let index = 0; index < control.select.options.length; index = index + 1) {
      const option = control.select.options[index];
      const group = option.parentElement;
      if (group.tagName === "OPTGROUP" && group !== previousGroup) {
        const heading = node("div", group.label, "select-group-label");
        heading.setAttribute("role", "presentation");
        control.panel.append(heading);
      }
      previousGroup = group;
      const item = node("div", "", "select-option");
      item.id = control.select.id + "-option-" + index;
      item.dataset.index = String(index);
      item.setAttribute("role", "option");
      item.append(node("span", option.textContent, "select-option-label"));
      if (control.select.multiple) {
        const mark = node("span", "", "select-order");
        mark.setAttribute("aria-hidden", "true");
        item.append(mark);
      } else {
        item.append(icon("check"));
      }
      control.items.push(item);
      control.panel.append(item);
    }
    updateOptions(control);
    refreshIcons();
  }
  function openSelect(control, keyboard) {
    if (control.select.disabled) {
      return;
    }
    closeSelect(false);
    openedControl = control;
    renderOptions(control);
    control.panel.classList.toggle("keyboard-open", keyboard);
    const dialog = control.button.closest("dialog");
    if (dialog) {
      dialog.append(control.panel);
    }
    control.panel.showPopover();
    control.button.setAttribute("aria-expanded", "true");
    positionPanel(control);
    focusOption(control, control.select.selectedIndex);
  }
  function toggleSelect(control, event) {
    if (openedControl === control) {
      closeSelect(true);
    } else {
      openSelect(control, event.detail === 0);
    }
  }
  function chooseOption(control, index) {
    const option = control.select.options[index];
    if (!option || option.disabled) {
      return;
    }
    if (control.select.multiple) {
      option.selected = !option.selected;
      focusOption(control, index);
      control.select.dispatchEvent(new Event("change", { bubbles: true }));
      refreshSelect(control.select);
      return;
    }
    const changed = control.select.value !== option.value;
    control.select.value = option.value;
    closeSelect(true);
    refreshSelect(control.select);
    if (changed) {
      control.select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  function clickOption(control, event) {
    const option = event.target.closest(".select-option");
    if (option) {
      chooseOption(control, Number(option.dataset.index));
    }
  }
  function selectKeyDown(control, event) {
    if (event.key === "Tab") {
      closeSelect(false);
      return;
    }
    if (event.key === "Escape" && openedControl !== control) {
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        searchOption(control, event.key);
        event.stopPropagation();
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") {
      closeSelect(true);
      return;
    }
    if (openedControl !== control) {
      openSelect(control, true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      chooseOption(control, control.activeIndex);
    } else if (event.key === "ArrowDown") {
      focusOption(control, control.activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      focusOption(control, control.activeIndex - 1);
    } else if (event.key === "Home") {
      focusOption(control, 0);
    } else if (event.key === "End") {
      focusOption(control, control.select.options.length - 1);
    }
  }
  function searchOption(control, text2) {
    const now = Date.now();
    if (now - control.typedAt > TYPE_SEARCH_DELAY) {
      control.typed = "";
    }
    control.typed = control.typed + text2.toLocaleLowerCase();
    control.typedAt = now;
    if (openedControl !== control) {
      openSelect(control, true);
    }
    for (let index = 0; index < control.select.options.length; index = index + 1) {
      const option = control.select.options[index];
      if (!option.disabled && option.textContent.toLocaleLowerCase().startsWith(control.typed)) {
        focusOption(control, index);
        return;
      }
    }
  }
  function outsidePointerDown(event) {
    if (!openedControl) {
      return;
    }
    if (!openedControl.wrapper.contains(event.target) && !openedControl.panel.contains(event.target)) {
      closeSelect(false);
    }
  }
  function outsideScroll(event) {
    if (!openedControl || !event.target.contains(openedControl.button)) {
      return;
    }
    const control = openedControl;
    const bounds = control.button.getBoundingClientRect();
    let visibleTop = 0;
    let visibleBottom = window.innerHeight;
    if (event.target instanceof Element) {
      const area = event.target.getBoundingClientRect();
      visibleTop = Math.max(visibleTop, area.top);
      visibleBottom = Math.min(visibleBottom, area.bottom);
    }
    if (bounds.bottom <= visibleTop || bounds.top >= visibleBottom) {
      closeSelect(false);
      return;
    }
    positionPanel(control);
  }
  function resizeWindow() {
    closeSelect(false);
  }
  function selectChanged(select) {
    refreshSelect(select);
  }
  function selectBlur(control) {
    if (openedControl === control) {
      closeSelect(false);
    }
  }
  function refreshSelect(select, optionsChanged = false) {
    let control = controls.get(select);
    if (!control) {
      const wrapper = node("div", "", "select-control");
      const button = node("button", "", "select-trigger");
      const label2 = node("span", "", "select-value");
      const panel = node("div", "", "select-panel");
      panel.id = select.id + "-listbox";
      panel.setAttribute("popover", "manual");
      panel.setAttribute("role", "listbox");
      panel.setAttribute("aria-label", select.getAttribute("aria-label") || "\u9009\u62E9\u9009\u9879");
      button.type = "button";
      button.id = select.id + "-trigger";
      button.setAttribute("role", "combobox");
      button.setAttribute("aria-label", select.getAttribute("aria-label") || "\u9009\u62E9\u9009\u9879");
      button.setAttribute("aria-controls", panel.id);
      button.setAttribute("aria-haspopup", "listbox");
      button.setAttribute("aria-expanded", "false");
      button.append(label2, icon("chevron-down"));
      select.before(wrapper);
      wrapper.append(select, button);
      document.body.append(panel);
      select.classList.add("select-native");
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
      for (const caption of document.querySelectorAll("label[for='" + select.id + "']")) {
        caption.htmlFor = button.id;
      }
      if (select.multiple) {
        panel.setAttribute("aria-multiselectable", "true");
      }
      const description = select.getAttribute("aria-describedby");
      if (description) {
        button.setAttribute("aria-describedby", description);
      }
      control = { select, wrapper, button, label: label2, panel, items: [], activeIndex: 0, typed: "", typedAt: 0 };
      controls.set(select, control);
      button.addEventListener("click", toggleSelect.bind(null, control));
      button.addEventListener("keydown", selectKeyDown.bind(null, control));
      button.addEventListener("blur", selectBlur.bind(null, control));
      panel.addEventListener("mousedown", keepTriggerFocus);
      panel.addEventListener("click", clickOption.bind(null, control));
      select.addEventListener("change", selectChanged.bind(null, select));
    }
    const selected = select.options[select.selectedIndex];
    control.label.textContent = "\u9009\u62E9\u9009\u9879";
    if (selected) {
      control.label.textContent = selected.textContent;
    }
    if (select.multiple) {
      const count = select.selectedOptions.length;
      control.label.textContent = "\u9009\u62E9\u76D1\u6D4B\u4FE1\u53F7";
      if (count > 0) {
        control.label.textContent = "\u5DF2\u9009 " + count + " \u8DEF\u4FE1\u53F7";
      }
    }
    control.button.title = control.label.textContent;
    control.button.disabled = select.disabled;
    if (openedControl === control) {
      if (select.multiple && !select.disabled && !optionsChanged) {
        updateOptions(control);
      } else {
        closeSelect(false);
      }
    }
    return control.button;
  }
  function keepTriggerFocus(event) {
    if (event.target.closest(".select-option")) {
      event.preventDefault();
    }
  }
  function closeDialogSelect(event) {
    if (openedControl && event.target.contains(openedControl.button)) {
      closeSelect(false);
    }
  }
  function cleanSelectPanels() {
    for (const panel of document.querySelectorAll(".select-panel")) {
      const triggerId = panel.id.replace("-listbox", "-trigger");
      if (!document.getElementById(triggerId)) {
        if (openedControl && openedControl.panel === panel) {
          closeSelect(false);
        }
        panel.remove();
      }
    }
  }
  document.addEventListener("pointerdown", outsidePointerDown);
  document.addEventListener("scroll", outsideScroll, true);
  document.addEventListener("close", closeDialogSelect, true);
  window.addEventListener("resize", resizeWindow);

  // vendor/logic.mjs
  var _Display3vlWithRegex_regex;
  function zip(f, a, b) {
    return a.map((x2, i) => f(x2, b[i]));
  }
  function zip4(f, a, b, c, d) {
    return a.map((x2, i) => f(x2, b[i], c[i], d[i]));
  }
  function bitfold(f, a, lastmask, neutral) {
    if (a.length == 0)
      return neutral == 1 ? 1 : 0;
    let acc = a[a.length - 1];
    if (neutral == 1)
      acc |= ~lastmask;
    else
      acc &= lastmask;
    for (let i = 0; i < a.length - 1; i++)
      acc = f(acc, a[i]);
    acc = f(acc, acc >>> 16);
    acc = f(acc, acc >>> 8);
    acc = f(acc, acc >>> 4);
    acc = f(acc, acc >>> 2);
    acc = f(acc, acc >>> 1);
    return acc & 1;
  }
  function wordnum(n) {
    return n >> 5;
  }
  function bitnum(n) {
    return n & 31;
  }
  function fillRest(m, k, words, avec, bvec) {
    const last_x = m > 0 && !(avec[k] & 1 << m - 1) && bvec[k] & 1 << m - 1;
    if (last_x && bitnum(m))
      bvec[k] |= -1 << m;
    if (last_x && k + 1 < words) {
      bvec.fill(-1, k + 1);
    }
  }
  function makeMap(bits, depth) {
    const ret = {};
    function g(what, val) {
      ret[what] = val;
      if (what.length * bits >= depth)
        return;
      for (let i = 0; i < 1 << bits; i += 1)
        g(what + i.toString(1 << bits), val << bits | i | i << 16);
      g(what + "x", val << bits | (1 << bits) - 1);
    }
    g("", 0);
    Object.seal(ret);
    return ret;
  }
  var fromBinMap = makeMap(1, 8);
  var fromOctMap = makeMap(3, 3);
  var fromHexMap = makeMap(4, 8);
  function toHexInternal(start2, bits, avec, bvec) {
    const out = [];
    let bit = 0, k = start2;
    while (bit < bits) {
      const a = "00000000" + avec[k].toString(16);
      const x2 = avec[k] ^ bvec[k];
      k++;
      for (let b = 0; b < 8 && bit < bits; b++, bit += 4) {
        if (x2 & 15 << 4 * b)
          out.push("x");
        else
          out.push(a[a.length - 1 - b]);
      }
    }
    return out.reverse().join("");
  }
  function toBinInternal(start2, bits, avec, bvec) {
    const out = [];
    let bit = 0, k = start2;
    while (bit < bits) {
      const a = "00000000000000000000000000000000" + avec[k].toString(2);
      const x2 = avec[k] ^ bvec[k];
      k++;
      for (let b = 0; b < 32 && bit < bits; b++, bit++) {
        if (x2 & 1 << b)
          out.push("x");
        else
          out.push(a[a.length - 1 - b]);
      }
    }
    return out.reverse().join("");
  }
  function fromHexInternal(data, start2, nbits, avec, bvec) {
    const skip = 4;
    const words = nbits + 31 >>> 5;
    let m = 0, k = -1 + start2;
    for (let i = data.length; i > 0; ) {
      const frag = data.slice(Math.max(0, i - 2), i);
      i -= frag.length;
      const v = fromHexMap[frag];
      if (bitnum(m) == 0)
        k++;
      const mask = (1 << skip * frag.length) - 1;
      avec[k] |= (v >>> 16 & mask) << m;
      bvec[k] |= (v & mask) << m;
      m += skip * frag.length;
    }
    if (m < nbits)
      fillRest(m, k, words, avec, bvec);
  }
  function fromBinInternal(data, start2, nbits, avec, bvec) {
    const skip = 1;
    const words = nbits + 31 >>> 5;
    let m = 0, k = -1 + start2;
    for (let i = data.length; i > 0; ) {
      const frag = data.slice(Math.max(0, i - 8), i);
      i -= frag.length;
      const v = fromBinMap[frag];
      if (bitnum(m) == 0)
        k++;
      const mask = (1 << skip * frag.length) - 1;
      avec[k] |= (v >>> 16 & mask) << m;
      bvec[k] |= (v & mask) << m;
      m += skip * frag.length;
    }
    if (m < nbits)
      fillRest(m, k, words, avec, bvec);
  }
  var Error3vl = class _Error3vl extends Error {
    constructor(s) {
      super(s);
      Object.setPrototypeOf(this, _Error3vl.prototype);
    }
  };
  function assert(c, s) {
    if (!c)
      throw new Error3vl("Assertion failed: " + s);
  }
  var Vector3vl = class _Vector3vl {
    /**
     * Private constructor for three-value logic vectors.
     *
     * **Only for internal use.**
     *
     * @param bits Number of bits in the vector.
     * @param avec Bit vector A.
     * @param bvec Bit vector B.
     */
    constructor(bits, avec, bvec) {
      this._bits = bits;
      this._avec = avec;
      this._bvec = bvec;
    }
    /**
     * Construct a vector with a constant value at each position.
     *
     * @param bits Number of bits in the vector.
     * @param init Initializer. Recognized values:
     * * false, -1, '0' for logical 0,
     * * 0, 'x' for undefined value,
     * * true, 1, '1' for logical 1.
     */
    static make(bits, init) {
      bits = bits | 0;
      let iva, ivb;
      switch (init) {
        case true:
        case "1":
        case 1:
          iva = ivb = ~0;
          break;
        case false:
        case "0":
        case -1:
        case void 0:
          iva = ivb = 0;
          break;
        case "x":
        case 0:
          iva = 0;
          ivb = ~0;
          break;
        default:
          assert(false, "Vector3vl.make() called with invalid initializer");
      }
      const words = (bits + 31) / 32 | 0;
      return new _Vector3vl(bits, new Uint32Array(words).fill(iva), new Uint32Array(words).fill(ivb));
    }
    /**
     * Construct a vector containing only zeros.
     *
     * @param bits Number of bits in the vector.
     */
    static zeros(bits) {
      return _Vector3vl.make(bits, -1);
    }
    /**
     * Construct a vector containing only ones.
     *
     * @param bits Number of bits in the vector.
     */
    static ones(bits) {
      return _Vector3vl.make(bits, 1);
    }
    /**
     * Construct a vector containing only undefined values.
     *
     * @param bits Number of bits in the vector.
     */
    static xes(bits) {
      return _Vector3vl.make(bits, 0);
    }
    /**
     * Construct a vector containing Boolean value _b_.
     *
     * @param b Boolean value for the vector.
     * @param bits Number of bits in the vector.
     */
    static fromBool(b, bits = 1) {
      return _Vector3vl.make(bits, b ? 1 : -1);
    }
    /**
     * Concatenate vectors into a single big vector.
     *
     * @param vs Vectors to concatenate.
     *           Arguments are ordered least significant bit first.
     */
    static concat(...vs) {
      const sumbits = vs.reduce((y2, x2) => x2.bits + y2, 0);
      const words = sumbits + 31 >>> 5;
      let bits = 0, idx = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      for (const v of vs) {
        v.normalize();
        if (bitnum(bits) == 0) {
          avec.set(v._avec, idx + 1);
          bvec.set(v._bvec, idx + 1);
          bits += v._bits;
          idx += v._bits + 31 >>> 5;
        } else {
          for (const k in v._avec) {
            avec[idx] |= v._avec[k] << bits;
            bvec[idx] |= v._bvec[k] << bits;
            idx++;
            if (idx == words)
              break;
            avec[idx] = v._avec[k] >>> -bits;
            bvec[idx] = v._bvec[k] >>> -bits;
          }
          bits += v._bits;
          if (idx + 1 > bits + 31 >>> 5) {
            idx--;
          }
        }
      }
      return new _Vector3vl(bits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function calls [[fromIteratorAnySkip]] or [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIterator(iter, skip, nbits) {
      if ((skip & skip - 1) == 0)
        return _Vector3vl.fromIteratorPow2(iter, skip, nbits);
      else
        return _Vector3vl.fromIteratorAnySkip(iter, skip, nbits);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is more generic, but slower, than [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorAnySkip(iter, skip, nbits) {
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const v of iter) {
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        if (mask << m >>> m != mask) {
          k++;
          avec[k] = (v >>> skip & mask) >>> -m;
          bvec[k] = (v & mask) >>> -m;
        }
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is limited to power of 2 _skip_ values.
     * For generic version, see [[fromIteratorAnySkip]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step.
     *             Limited to powers of 2: 1, 2, 4, 8, 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorPow2(iter, skip, nbits) {
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const v of iter) {
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an array of numbers.
     *
     * The following interpretation is used:
     * * -1 for logical 0,
     * * 0 for undefined value,
     * * 1 for logical 1.
     *
     * @param data Input array.
     */
    static fromArray(data) {
      const nbits = data.length;
      const skip = 1;
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (const x2 of data) {
        const v = x2 + 1 + Number(x2 > 0);
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> skip & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a binary string.
     *
     * Three characters are accepted:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The binary string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_.
     */
    static fromBin(data, nbits) {
      if (nbits === void 0)
        nbits = data.length;
      const words = nbits + 31 >>> 5;
      const avec = new Uint32Array(words), bvec = new Uint32Array(words);
      fromBinInternal(data, 0, nbits, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an octal number.
     *
     * Characters '0' to '7' and 'x' are accepted. The character 'x'
     * means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The octal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times three.
     */
    static fromOct(data, nbits) {
      const skip = 3;
      if (nbits === void 0)
        nbits = data.length * skip;
      const words = nbits + 31 >>> 5;
      let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
      const mask = (1 << skip) - 1;
      for (let i = data.length - 1; i >= 0; i--) {
        const v = fromOctMap[data[i]];
        if (bitnum(m) == 0)
          k++;
        avec[k] |= (v >>> 16 & mask) << m;
        bvec[k] |= (v & mask) << m;
        if (mask << m >>> m != mask) {
          k++;
          avec[k] = (v >>> 16 & mask) >>> -m;
          bvec[k] = (v & mask) >>> -m;
        }
        m += skip;
      }
      if (m < nbits)
        fillRest(m, k, words, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a hexadecimal number.
     *
     * Characters '0' to '9', 'a' to 'f' and 'x' are accepted. The character
     * 'x' means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The hexadecimal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times four.
     */
    static fromHex(data, nbits) {
      if (nbits === void 0)
        nbits = data.length * 4;
      const words = nbits + 31 >>> 5;
      const avec = new Uint32Array(words), bvec = new Uint32Array(words);
      fromHexInternal(data, 0, nbits, avec, bvec);
      return new _Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a Verilog-like string.
     */
    static fromString(data) {
      const re2 = /^([0-9]*)'?(b[01x]*|o[0-7x]*|h[0-9a-fx]*|d[0-9]*)$/;
      const res = re2.exec(data);
      assert(res != null, "Vector3vl.fromString() Invalid string");
      const bits = res[1].length ? Number(res[1]) : void 0;
      const num = res[2].slice(1);
      switch (res[2][0]) {
        case "b":
          return _Vector3vl.fromBin(num, bits);
        case "o":
          return _Vector3vl.fromOct(num, bits);
        case "h":
          return _Vector3vl.fromHex(num, bits);
        case "d":
          return _Vector3vl.fromNumber(BigInt(num), bits);
      }
    }
    /**
     * Construct a vector from clonable representation.
     *
     * @param data The initialization value.
     */
    static fromClonable(data) {
      return new _Vector3vl(data._bits, data._avec, data._bvec);
    }
    /**
     * Construct a vector from a number or a bigint.
     *
     * If _nbits_ bits are not enough to represent the number, it is
     * truncated. If it's larger, the number is sign-extended.
     * If it is not given, the resulting vector will have enough bits
     * to represent the number completely.
     *
     * @param data The initialization value.
     * @param nbits Number of bits in the vector.
     */
    static fromNumber(data, nbits) {
      const fbits = nbits === void 0 ? 0 : nbits;
      const bdata = BigInt(data);
      if (bdata >= BigInt(0)) {
        let b = bdata.toString(2);
        return _Vector3vl.fromBin("0".repeat(Math.max(0, fbits - b.length)) + b, nbits);
      } else {
        const c = (-bdata).toString(2).length;
        const j2 = bdata + (BigInt(1) << BigInt(c));
        let b = j2.toString(2);
        return _Vector3vl.fromBin("1".repeat(Math.max(1, fbits - c)) + "0".repeat(c - b.length) + b, nbits);
      }
    }
    /**
     * Number of bits in the vector.
     */
    get bits() {
      return this._bits;
    }
    /**
     * Most significant bit in the vector. Returns -1, 0 or 1.
     */
    get msb() {
      return this.get(this._bits - 1);
    }
    /**
     * Least significant bit in the vector. Returns -1, 0 or 1.
     */
    get lsb() {
      return this.get(0);
    }
    /**
     * Gets _n_th value in the vector. Returns -1, 0 or 1.
     */
    get(n) {
      const bn = bitnum(n);
      const wn = wordnum(n);
      const a = this._avec[wn] >>> bn & 1;
      const b = this._bvec[wn] >>> bn & 1;
      return a + b - 1;
    }
    /**
     * Tests if the vector is all ones.
     */
    get isHigh() {
      if (this._bits == 0)
        return true;
      const lastmask = this._lastmask;
      const vechigh = (vec) => vec.slice(0, vec.length - 1).every((x2) => ~x2 == 0) && (vec[vec.length - 1] & lastmask) == lastmask;
      return vechigh(this._avec) && vechigh(this._bvec);
    }
    /**
     * Tests if the vector is all zeros.
     */
    get isLow() {
      if (this._bits == 0)
        return true;
      const lastmask = this._lastmask;
      const veclow = (vec) => vec.slice(0, vec.length - 1).every((x2) => x2 == 0) && (vec[vec.length - 1] & lastmask) == 0;
      return veclow(this._avec) && veclow(this._bvec);
    }
    /**
     * Tests if there is any defined bit in the vector.
     */
    get isDefined() {
      if (this._bits == 0)
        return false;
      const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
      dvec[dvec.length - 1] |= ~this._lastmask;
      return !dvec.every((x2) => ~x2 == 0);
    }
    /**
     * Tests if every bit in the vector is defined.
     */
    get isFullyDefined() {
      if (this._bits == 0)
        return true;
      const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
      dvec[dvec.length - 1] &= this._lastmask;
      return !dvec.some((x2) => Boolean(x2));
    }
    /**
     * Bitwise AND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    and(v) {
      assert(v._bits == this._bits, "Vector3vl.and() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => a & b, v._avec, this._avec), zip((a, b) => a & b, v._bvec, this._bvec));
    }
    /**
     * Bitwise OR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    or(v) {
      assert(v._bits == this._bits, "Vector3vl.or() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => a | b, v._avec, this._avec), zip((a, b) => a | b, v._bvec, this._bvec));
    }
    /**
     * Bitwise XOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xor(v) {
      assert(v._bits == this._bits, "Vector3vl.xor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip4((a1, a2, b1, b2) => (a1 | b1) & (a2 ^ b2), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => a1 & b1 ^ (a2 | b2), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NAND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nand(v) {
      assert(v._bits == this._bits, "Vector3vl.nand() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => ~(a & b), v._bvec, this._bvec), zip((a, b) => ~(a & b), v._avec, this._avec));
    }
    /**
     * Bitwise NOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nor(v) {
      assert(v._bits == this._bits, "Vector3vl.nor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip((a, b) => ~(a | b), v._bvec, this._bvec), zip((a, b) => ~(a | b), v._avec, this._avec));
    }
    /**
     * Bitwise XNOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xnor(v) {
      assert(v._bits == this._bits, "Vector3vl.xnor() called with vectors of different sizes");
      return new _Vector3vl(this._bits, zip4((a1, a2, b1, b2) => ~(a1 & b1 ^ (a2 | b2)), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => ~((a1 | b1) & (a2 ^ b2)), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NOT of a vector. */
    not() {
      return new _Vector3vl(this._bits, this._bvec.map((a) => ~a), this._avec.map((a) => ~a));
    }
    /**
     * Return a vector with 1 on locations with x, the rest with 0.
     */
    xmask() {
      const v = zip((a, b) => a ^ b, this._avec, this._bvec);
      return new _Vector3vl(this._bits, v, v);
    }
    /**
     * Reducing AND of a vector.
     *
     * ANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceAnd() {
      return new _Vector3vl(1, Uint32Array.of(bitfold((a, b) => a & b, this._avec, this._lastmask, 1)), Uint32Array.of(bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)));
    }
    /**
     * Reducing OR of a vector.
     *
     * ORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceOr() {
      return new _Vector3vl(1, Uint32Array.of(bitfold((a, b) => a | b, this._avec, this._lastmask, 0)), Uint32Array.of(bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)));
    }
    /**
     * Reducing NAND of a vector.
     *
     * NANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNand() {
      return new _Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)), Uint32Array.of(~bitfold((a, b) => a & b, this._avec, this._lastmask, 1)));
    }
    /**
     * Reducing NOR of a vector.
     *
     * NORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNor() {
      return new _Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)), Uint32Array.of(~bitfold((a, b) => a | b, this._avec, this._lastmask, 0)));
    }
    /**
     * Reducing XOR of a vector.
     *
     * XORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceXor() {
      const xes = zip((a, b) => ~a & b, this._avec, this._bvec);
      const has_x = bitfold((a, b) => a | b, xes, this._lastmask, 0);
      const v = bitfold((a, b) => a ^ b, this._avec, this._lastmask, 0);
      return new _Vector3vl(1, Uint32Array.of(v & ~has_x), Uint32Array.of(v | has_x));
    }
    /**
     * Reducing XNOR of a vector.
     *
     * XNORs all bits of the vector together, producing a single bit.
     *
     * @return Singleton vector.
     */
    reduceXnor() {
      return this.reduceXor().not();
    }
    /**
     * Concatenates vectors, including this one, into a single vector.
     *
     * @param vs The other vectors.
     */
    concat(...vs) {
      return _Vector3vl.concat(this, ...vs);
    }
    /**
     * Return a subvector.
     *
     * Uses same conventions as the slice function for JS arrays.
     *
     * @param start Number of the first bit to include in the result.
     *              If omitted, first bit of the vector is used.
     * @param end Number of the last bit to include in the result, plus one.
     *            If omitted, last bit of the vector is used.
     */
    slice(start2, end) {
      if (start2 === void 0)
        start2 = 0;
      if (end === void 0)
        end = this._bits;
      if (end > this.bits)
        end = this.bits;
      if (start2 > end)
        end = start2;
      if (bitnum(start2) == 0) {
        const avec = this._avec.slice(start2 >>> 5, end + 31 >>> 5);
        const bvec = this._bvec.slice(start2 >>> 5, end + 31 >>> 5);
        return new _Vector3vl(end - start2, avec, bvec);
      } else {
        const words = end - start2 + 31 >>> 5;
        const avec = new Uint32Array(words), bvec = new Uint32Array(words);
        let k = 0;
        avec[k] = this._avec[start2 >> 5] >>> start2;
        bvec[k] = this._bvec[start2 >> 5] >>> start2;
        for (let idx = (start2 >> 5) + 1; idx <= end >>> 5; idx++) {
          avec[k] |= this._avec[idx] << -start2;
          bvec[k] |= this._bvec[idx] << -start2;
          k++;
          if (k == words)
            break;
          avec[k] = this._avec[idx] >>> start2;
          bvec[k] = this._bvec[idx] >>> start2;
        }
        return new _Vector3vl(end - start2, avec, bvec);
      }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * This function calls [[toIteratorAnySkip]] or [[toIteratorPow2]].
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    toIterator(skip) {
      if ((skip & skip - 1) == 0)
        return this.toIteratorPow2(skip);
      else
        return this.toIteratorAnySkip(skip);
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    *toIteratorAnySkip(skip) {
      this.normalize();
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        let a = (this._avec[k] & m) >>> bit;
        let b = (this._bvec[k] & m) >>> bit;
        if (m >>> bit != sm && k + 1 != this._avec.length) {
          const m1 = sm >> -bit;
          a |= (this._avec[k + 1] & m1) << -bit;
          b |= (this._bvec[k + 1] & m1) << -bit;
        }
        yield a << skip | b;
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm << bit;
        }
      }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1, 2, 4, 8 or 16.
     */
    *toIteratorPow2(skip) {
      this.normalize();
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        const a = (this._avec[k] & m) >>> bit;
        const b = (this._bvec[k] & m) >>> bit;
        yield a << skip | b;
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm;
        }
      }
    }
    /** Returns an array representation of the vector.
     *
     * The resulting array contains values -1, 0, 1.
     */
    toArray() {
      this.normalize();
      const skip = 1;
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        const a = (this._avec[k] & m) >>> bit;
        const b = (this._bvec[k] & m) >>> bit;
        const v = a << skip | b;
        out.push(v - 1 - Number(v > 1));
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm;
        }
      }
      return out;
    }
    /** Returns a binary representation of the vector.
     *
     * Three characters are used:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     */
    toBin() {
      return toBinInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns an octal representation of the vector.
     *
     * Returned characters can be '0' to '7' and 'x'. An 'x' value is returned
     * if any of the three bits is undefined.
     */
    toOct() {
      this.normalize();
      const skip = 3;
      const sm = (1 << skip) - 1;
      let bit = 0, k = 0, m = sm, out = [];
      while (bit < this._bits) {
        let a = (this._avec[k] & m) >>> bit;
        let b = (this._bvec[k] & m) >>> bit;
        if (m >>> bit != sm && k + 1 != this._avec.length) {
          const m1 = sm >> -bit;
          a |= (this._avec[k + 1] & m1) << -bit;
          b |= (this._bvec[k + 1] & m1) << -bit;
        }
        const v = a << skip | b;
        if (7 & v & ~(v >> 3))
          out.push("x");
        else
          out.push((v >> 3).toString());
        m <<= skip;
        bit += skip;
        if (m == 0) {
          k++;
          m = sm << bit;
        }
      }
      return out.reverse().join("");
    }
    /** Returns an hexadecimal representation of the vector.
     *
     * Returned characters can be '0' to '9', 'a' to 'f' and 'x'. An 'x' value
     * is returned if any of the four bits is undefined.
     */
    toHex() {
      this.normalize();
      return toHexInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns a string describing the vector. */
    toString() {
      return "Vector3vl " + this.toBin();
    }
    /** Returns an object which can be copied by structured clone. */
    toClonable() {
      return { _bits: this._bits, _avec: this._avec, _bvec: this._bvec };
    }
    /** Returns a number representing the vector. */
    toNumber(signed = false) {
      if (signed)
        return this.toNumberSigned();
      assert(this.isFullyDefined, "Vector3vl.toNumber() called on a not fully defined vector");
      assert(this._bits < 32, "Vector3vl.toNumber() called on a too wide vector");
      if (this._bits == 0)
        return 0;
      else
        return Number.parseInt(this.toHex(), 16);
    }
    /** Return a signed number representing the vector. */
    toNumberSigned() {
      assert(this.isFullyDefined, "Vector3vl.toNumberSigned() called on a not fully defined vector");
      assert(this._bits < 32, "Vector3vl.toNumberSigned() called on a too wide vector");
      assert(this._bits > 0, "Vector3vl.toNumberSigned() called on an empty vector");
      const sign = this.msb == 1;
      return sign ? Number.parseInt(this.toHex(), 16) - (1 << this._bits) : Number.parseInt(this.toHex(), 16);
    }
    /** Returns a BigInt representing the vector. */
    toBigInt(signed = false) {
      if (signed)
        return this.toBigIntSigned();
      assert(this.isFullyDefined, "Vector3vl.toBigInt() called on a not fully defined vector");
      if (this._bits == 0)
        return BigInt(0);
      else
        return BigInt("0x" + this.toHex());
    }
    /** Return a signed BigInt representing the vector. */
    toBigIntSigned() {
      assert(this.isFullyDefined, "Vector3vl.toBigIntSigned() called on a not fully defined vector");
      assert(this._bits > 0, "Vector3vl.toBigIntSigned() called on an empty vector");
      const sign = this.msb == 1;
      return sign ? BigInt("0x" + this.toHex()) - (BigInt(1) << BigInt(this._bits)) : BigInt("0x" + this.toHex());
    }
    /** Compares two vectors for equality. */
    eq(v) {
      if (v._bits != this._bits)
        return false;
      this.normalize();
      v.normalize();
      for (const i in this._avec) {
        if (this._avec[i] != v._avec[i])
          return false;
        if (this._bvec[i] != v._bvec[i])
          return false;
      }
      return true;
    }
    /** Normalize the vector.
     *
     * Because of the representation used, if _bits_ is not a multiple
     * of 32, some internal bits do not contribute to the vector value,
     * and for performance reasons can get arbitrary values in the course
     * of computations. This procedure clears these bits.
     * For internal use.
     */
    normalize() {
      const lastmask = this._lastmask;
      this._avec[this._avec.length - 1] &= lastmask;
      this._bvec[this._bvec.length - 1] &= lastmask;
    }
    /** Mask for unused bits.
     *
     * For internal use.
     */
    get _lastmask() {
      return ~0 >>> -this.bits;
    }
  };
  Vector3vl.empty = Vector3vl.zeros(0);
  Vector3vl.one = Vector3vl.ones(1);
  Vector3vl.zero = Vector3vl.zeros(1);
  Vector3vl.x = Vector3vl.xes(1);
  _Display3vlWithRegex_regex = /* @__PURE__ */ new WeakMap();

  // src/chips/extra-chips.mjs
  var COUNTER_CONTROLS = { clock: 2, reset: 1, load: 9, enable: [7, 10], data: [3, 4, 5, 6], carry: 15 };
  var EXTRA_CHIPS = {
    "6116": {
      title: "2K\xD78 \u9759\u6001RAM",
      count: 24,
      power: 24,
      ground: 12,
      labels: ["", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "A0", "D0", "D1", "D2", "GND", "D3", "D4", "D5", "D6", "D7", "CE\u2032", "A10", "OE\u2032", "WE\u2032", "A9", "A8", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      outputs: [9, 10, 11, 13, 14, 15, 16, 17],
      bidirectional: [9, 10, 11, 13, 14, 15, 16, 17],
      memory: {
        words: 2048,
        address: [8, 7, 6, 5, 4, 3, 2, 1, 23, 22, 19],
        data: [9, 10, 11, 13, 14, 15, 16, 17],
        select: 18,
        read: 20,
        write: 21
      }
    },
    "74LS244": {
      title: "\u516B\u8DEF\u4E09\u6001\u7F13\u51B2\u5668",
      count: 20,
      power: 20,
      ground: 10,
      labels: ["", "1G\u2032", "1A1", "2Y4", "1A2", "2Y3", "1A3", "2Y2", "1A4", "2Y1", "GND", "2A1", "1Y4", "2A2", "1Y3", "2A3", "1Y2", "2A4", "1Y1", "2G\u2032", "VCC"],
      inputs: [1, 2, 4, 6, 8, 11, 13, 15, 17, 19],
      outputs: [18, 16, 14, 12, 9, 7, 5, 3],
      kind: "tristate",
      diagramSymbol: "BUF",
      gates: [[1, 2, 18], [1, 4, 16], [1, 6, 14], [1, 8, 12], [19, 11, 9], [19, 13, 7], [19, 15, 5], [19, 17, 3]]
    },
    "74LS03": {
      title: "\u56DB\u8DEFOC\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      kind: "open-collector",
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]]
    },
    "74LS20": {
      title: "\u53CC\u56DB\u8F93\u5165\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "NC", "2A", "2B", "1Y", "GND", "2Y", "2C", "2D", "NC", "1C", "1D", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [6, 8],
      kind: "nand4",
      gates: [[1, 2, 12, 13, 6], [4, 5, 9, 10, 8]]
    },
    "CD4011": {
      title: "\u56DB\u8DEFCMOS\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2Y", "2A", "2B", "VSS", "3A", "3B", "3Y", "4Y", "4A", "4B", "VDD"],
      inputs: [1, 2, 5, 6, 8, 9, 12, 13],
      outputs: [3, 4, 10, 11],
      kind: "cmos-nand",
      gates: [[1, 2, 3], [5, 6, 4], [8, 9, 10], [12, 13, 11]]
    },
    "74LS125": {
      title: "\u56DB\u8DEF\u4E09\u6001\u7F13\u51B2\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1G\u2032", "1A", "1Y", "2G\u2032", "2A", "2Y", "GND", "3Y", "3A", "3G\u2032", "4Y", "4A", "4G\u2032", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      kind: "tristate",
      gates: [[1, 2, 3], [4, 5, 6], [10, 9, 8], [13, 12, 11]]
    },
    "74LS138": {
      title: "\u4E09\u7EBF\u516B\u7EBF\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "A0", "A1", "A2", "S3\u2032(G2A\u2032)", "S2\u2032(G2B\u2032)", "S1(G1)", "Y7\u2032", "GND", "Y6\u2032", "Y5\u2032", "Y4\u2032", "Y3\u2032", "Y2\u2032", "Y1\u2032", "Y0\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6],
      outputs: [15, 14, 13, 12, 11, 10, 9, 7],
      kind: "decoder8"
    },
    "74LS139": {
      title: "\u53CC\u4E8C\u7EBF\u56DB\u7EBF\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1G\u2032", "1A", "1B", "1Y0\u2032", "1Y1\u2032", "1Y2\u2032", "1Y3\u2032", "GND", "2Y3\u2032", "2Y2\u2032", "2Y1\u2032", "2Y0\u2032", "2B", "2A", "2G\u2032", "VCC"],
      inputs: [1, 2, 3, 13, 14, 15],
      outputs: [4, 5, 6, 7, 12, 11, 10, 9],
      kind: "dual-decoder"
    },
    "74LS151": {
      title: "\u516B\u9009\u4E00\u6570\u636E\u9009\u62E9\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "D3", "D2", "D1", "D0", "Y", "W\u2032(Y\u2032)", "G\u2032", "GND", "C", "B", "A", "D7", "D6", "D5", "D4", "VCC"],
      inputs: [1, 2, 3, 4, 7, 9, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6],
      kind: "mux8"
    },
    "74LS153": {
      title: "\u53CC\u56DB\u9009\u4E00\u6570\u636E\u9009\u62E9\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1G\u2032", "B", "1C3", "1C2", "1C1", "1C0", "1Y", "GND", "2Y", "2C0", "2C1", "2C2", "2C3", "A", "2G\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15],
      outputs: [7, 9],
      kind: "dual-mux"
    },
    "74LS85": {
      title: "\u56DB\u4F4D\u6570\u503C\u6BD4\u8F83\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "B3", "A<B\u8F93\u5165", "A=B\u8F93\u5165", "A>B\u8F93\u5165", "A>B", "A=B", "A<B", "GND", "B0", "A0", "B1", "A1", "B2", "A2", "A3", "VCC"],
      inputs: [1, 2, 3, 4, 9, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6, 7],
      kind: "comparator"
    },
    "74LS48": {
      title: "BCD\u4E03\u6BB5\u8BD1\u7801\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "B", "C", "LT\u2032", "BI\u2032/RBO\u2032", "RBI\u2032", "D", "A", "GND", "e", "d", "c", "b", "a", "g", "f", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7],
      outputs: [13, 12, 11, 10, 9, 15, 14, 4],
      bidirectional: [4],
      controls: { lampTest: 3, blanking: 4, rippleBlanking: 5 },
      kind: "seven-segment"
    },
    "74LS74": {
      title: "\u53CCD\u89E6\u53D1\u5668",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1RD\u2032", "1D", "1CP", "1SD\u2032", "1Q", "1Q\u2032", "GND", "2Q\u2032", "2Q", "2SD\u2032", "2CP", "2D", "2RD\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 10, 11, 12, 13],
      outputs: [5, 6, 9, 8],
      sequential: "flipflop",
      edge: "rising",
      channels: [
        { reset: 1, set: 4, clock: 3, data: 2, output: 5, inverted: 6 },
        { reset: 13, set: 10, clock: 11, data: 12, output: 9, inverted: 8 }
      ]
    },
    "74LS112": {
      title: "\u53CCJK\u4E0B\u964D\u6CBF\u89E6\u53D1\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "1CP", "1K", "1J", "1SD\u2032", "1Q", "1Q\u2032", "2Q", "GND", "2Q\u2032", "2SD\u2032", "2J", "2K", "2CP", "2RD\u2032", "1RD\u2032", "VCC"],
      inputs: [1, 2, 3, 4, 10, 11, 12, 13, 14, 15],
      outputs: [5, 6, 7, 9],
      sequential: "flipflop",
      edge: "falling",
      channels: [
        { reset: 15, set: 4, clock: 1, first: 3, second: 2, output: 5, inverted: 6 },
        { reset: 14, set: 10, clock: 13, first: 11, second: 12, output: 7, inverted: 9 }
      ]
    },
    "CD4027": {
      title: "\u53CCJK\u4E0A\u5347\u6CBF\u89E6\u53D1\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "Q2", "Q2\u2032", "CLK2", "RESET2", "K2", "J2", "SET2", "VSS", "SET1", "J1", "K1", "RESET1", "CLK1", "Q1\u2032", "Q1", "VDD"],
      inputs: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13],
      outputs: [15, 14, 1, 2],
      sequential: "flipflop",
      edge: "rising",
      activeHigh: true,
      channels: [
        { reset: 12, set: 9, clock: 13, first: 10, second: 11, output: 15, inverted: 14 },
        { reset: 4, set: 7, clock: 3, first: 6, second: 5, output: 1, inverted: 2 }
      ]
    },
    "74LS160": {
      title: "\u540C\u6B65\u5341\u8FDB\u5236\u8BA1\u6570\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "CP", "D0", "D1", "D2", "D3", "ENP", "GND", "LOAD\u2032", "ENT", "Q3", "Q2", "Q1", "Q0", "RCO", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10],
      outputs: [14, 13, 12, 11, 15],
      sequential: "counter",
      controls: COUNTER_CONTROLS,
      modulus: 10
    },
    "74LS161": {
      title: "\u540C\u6B65\u4E8C\u8FDB\u5236\u8BA1\u6570\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "CP", "D0", "D1", "D2", "D3", "ENP", "GND", "LOAD\u2032", "ENT", "Q3", "Q2", "Q1", "Q0", "RCO", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10],
      outputs: [14, 13, 12, 11, 15],
      sequential: "counter",
      controls: COUNTER_CONTROLS,
      modulus: 16
    },
    "74LS194": {
      title: "\u56DB\u4F4D\u53CC\u5411\u79FB\u4F4D\u5BC4\u5B58\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "CLR\u2032", "SR", "A", "B", "C", "D", "SL", "GND", "S0", "S1", "CP", "QD", "QC", "QB", "QA", "VCC"],
      inputs: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11],
      outputs: [15, 14, 13, 12],
      controls: { clock: 11, reset: 1, mode: [9, 10], right: 2, left: 7, data: [3, 4, 5, 6] },
      sequential: "shift"
    }
  };

  // src/chips/chips.mjs
  var CHIP_MODELS = {
    "74LS273": {
      title: "\u516B\u4F4D\u5BC4\u5B58\u5668",
      count: 20,
      power: 20,
      ground: 10,
      labels: ["", "CLR\u0305", "Q0", "D0", "D1", "Q1", "Q2", "D2", "D3", "Q3", "GND", "CLK", "Q4", "D4", "D5", "Q5", "Q6", "D6", "D7", "Q7", "VCC"],
      inputs: [1, 3, 4, 7, 8, 11, 13, 14, 17, 18],
      outputs: [2, 5, 6, 9, 12, 15, 16, 19],
      controls: { clock: 11, reset: 1 },
      data: [3, 4, 7, 8, 13, 14, 17, 18]
    },
    "74LS283": {
      title: "\u56DB\u4F4D\u5168\u52A0\u5668",
      count: 16,
      power: 16,
      ground: 8,
      labels: ["", "\u03A32", "B2", "A2", "\u03A31", "A1", "B1", "C0", "GND", "C4", "\u03A34", "B4", "A4", "\u03A33", "A3", "B3", "VCC"],
      inputs: [2, 3, 5, 6, 7, 11, 12, 14, 15],
      outputs: [4, 1, 13, 10, 9],
      first: [5, 3, 14, 12],
      second: [6, 2, 15, 11]
    },
    "74LS86": {
      title: "\u56DB\u8DEF\u5F02\u6216\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "xor"
    },
    "74LS00": {
      title: "\u56DB\u8DEF\u4E0E\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3B", "3A", "4Y", "4B", "4A", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "nand"
    },
    "74LS08": {
      title: "\u56DB\u8DEF\u4E0E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "and"
    },
    "74LS32": {
      title: "\u56DB\u8DEF\u6216\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
      inputs: [1, 2, 4, 5, 9, 10, 12, 13],
      outputs: [3, 6, 8, 11],
      gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
      operation: "or"
    },
    "74LS04": {
      title: "\u516D\u8DEF\u975E\u95E8",
      count: 14,
      power: 14,
      ground: 7,
      labels: ["", "1A", "1Y", "2A", "2Y", "3A", "3Y", "GND", "4Y", "4A", "5Y", "5A", "6Y", "6A", "VCC"],
      inputs: [1, 3, 5, 9, 11, 13],
      outputs: [2, 4, 6, 8, 10, 12],
      gates: [[1, 1, 2], [3, 3, 4], [5, 5, 6], [9, 9, 8], [11, 11, 10], [13, 13, 12]],
      operation: "not"
    }
  };
  for (const name of Object.keys(EXTRA_CHIPS)) {
    CHIP_MODELS[name] = EXTRA_CHIPS[name];
  }
  function toVector(value) {
    if (value === 0) {
      return Vector3vl.zero;
    }
    if (value === 1) {
      return Vector3vl.one;
    }
    return Vector3vl.x;
  }
  function logicGate(operation, first, second) {
    const left = toVector(first);
    const right = toVector(second);
    let result = Vector3vl.x;
    if (operation === "xor") {
      result = left.xor(right);
    } else if (operation === "and") {
      result = left.and(right);
    } else if (operation === "or") {
      result = left.or(right);
    } else if (operation === "nand") {
      result = left.nand(right);
    } else if (operation === "not") {
      result = left.not();
    }
    if (result.isHigh) {
      return 1;
    }
    if (result.isLow) {
      return 0;
    }
    return "X";
  }
  function evaluateAdder(pins) {
    const model = CHIP_MODELS["74LS283"];
    const outputs = {};
    let carry = pins[7];
    for (let bit = 0; bit < 4; bit = bit + 1) {
      const first = pins[model.first[bit]];
      const second = pins[model.second[bit]];
      const different = logicGate("xor", first, second);
      const sum = logicGate("xor", different, carry);
      const firstCarry = logicGate("and", first, second);
      const secondCarry = logicGate("and", first, carry);
      const thirdCarry = logicGate("and", second, carry);
      const combinedCarry = logicGate("or", firstCarry, secondCarry);
      carry = logicGate("or", combinedCarry, thirdCarry);
      outputs[model.outputs[bit]] = sum;
    }
    outputs[9] = carry;
    return outputs;
  }

  // src/board/board.mjs
  var BOARD = {
    columns: 59,
    sections: 4,
    startX: 90,
    pitch: 18,
    startY: 116,
    sectionHeight: 250,
    width: 1300,
    height: 1215,
    panelLeft: 42,
    panelWidth: 1132,
    rowPitch: 15,
    trenchGap: 35,
    busTopOffset: -16,
    busBottomOffset: 193,
    busHolePeriod: 6
  };
  var PORT_LAYOUT = { lowestColumn: 49, columnStep: 2, positiveColumn: 55, negativeColumn: 57, outputY: 68, inputY: 1105 };
  var INPUT_RESET_COLUMN = 53;
  var PREVIOUS_POSITIVE_COLUMN = 53;
  var RAIL_LAYOUT = {
    groundX: 1210,
    powerX: 1242,
    count: 60,
    startY: BOARD.startY + BOARD.busTopOffset,
    endY: BOARD.startY + (BOARD.sections - 1) * BOARD.sectionHeight + BOARD.busBottomOffset
  };
  var ROWS = "ABCDEFGHIJ";
  var BUS_ROWS = "XY";
  var BUS_SEGMENTS = [[1, 17], [19, 41], [43, 59]];
  var IO_LIMIT = 24;
  var NOTES_LIMIT = 5e4;
  var PROJECT_DEFAULTS = { inputCount: 8, outputCount: 8, power: true };
  var WIRING_VERSION = 4;
  var GENERAL_NOTES = "# \u7535\u8DEF\u8BF4\u660E\n\n## \u529F\u80FD\n\n\u586B\u5199\u8FD9\u4E2A\u7535\u8DEF\u7684\u7528\u9014\n\n## \u8F93\u5165\u53E3\n\n| \u7AEF\u53E3 | \u4F5C\u7528 |\n| --- | --- |\n| K0 | \u5F85\u586B\u5199 |\n\n## \u8F93\u51FA\u53E3\n\n| \u7AEF\u53E3 | \u4F5C\u7528 |\n| --- | --- |\n| L0 | \u5F85\u586B\u5199 |\n\n## \u64CD\u4F5C\u6B65\u9AA4\n\n1. \u68C0\u67E5\u4F9B\u7535\u548C\u63A5\u7EBF\n2. \u8BBE\u7F6E\u8F93\u5165\uFF0C\u89C2\u5BDF\u8F93\u51FA\n";
  var WIRE_COLORS = ["#dc3545", "#1976d2", "#16845b", "#d68a0b", "#8b55c5", "#0d939d", "#d44f93", "#46515f", "#93a619", "#e26c2b", "#8494a7", "#65483d"];
  function validIoCount(count) {
    return Number.isInteger(count) && count >= 1 && count <= IO_LIMIT;
  }
  function columnX(column) {
    return BOARD.startX + (column - 1) * BOARD.pitch;
  }
  function rowY(section, row) {
    if (row === "X") {
      return BOARD.startY + section * BOARD.sectionHeight + BOARD.busTopOffset;
    }
    if (row === "Y") {
      return BOARD.startY + section * BOARD.sectionHeight + BOARD.busBottomOffset;
    }
    let offset = ROWS.indexOf(row) * BOARD.rowPitch;
    if (ROWS.indexOf(row) >= 5) {
      offset = offset + BOARD.trenchGap;
    }
    return BOARD.startY + section * BOARD.sectionHeight + offset;
  }
  function busHasHole(column) {
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns && column % BOARD.busHolePeriod !== 0;
  }
  function busSegment(column) {
    for (let index = 0; index < BUS_SEGMENTS.length; index = index + 1) {
      const segment = BUS_SEGMENTS[index];
      if (column >= segment[0] && column <= segment[1]) {
        return index;
      }
    }
    return -1;
  }
  function holeId(section, row, column) {
    return "B" + section + ":" + row + ":" + column;
  }
  function validEndpoint(name) {
    if (typeof name !== "string") {
      return false;
    }
    if (/^(K|L)([0-9]|1[0-9]|2[0-3])$/.test(name)) {
      return true;
    }
    if (/^(P\+|P-|GND|VCC)$/.test(name)) {
      return true;
    }
    if (/^R:(GND|VCC):([0-9]|[1-4][0-9]|5[0-9])$/.test(name)) {
      return true;
    }
    const parts = name.split(":");
    if (parts.length !== 3 || !/^B[0-3]$/.test(parts[0])) {
      return false;
    }
    if (parts[1].length !== 1 || !ROWS.includes(parts[1]) && !BUS_ROWS.includes(parts[1])) {
      return false;
    }
    if (!/^([1-9]|[1-5][0-9])$/.test(parts[2])) {
      return false;
    }
    const column = Number(parts[2]);
    if (BUS_ROWS.includes(parts[1])) {
      return busHasHole(column);
    }
    return Number.isInteger(column) && column >= 1 && column <= BOARD.columns;
  }
  function positivePulseColumn(wiringVersion = WIRING_VERSION) {
    if (wiringVersion < WIRING_VERSION) {
      return PREVIOUS_POSITIVE_COLUMN;
    }
    return PORT_LAYOUT.positiveColumn;
  }
  function portHole(name, wiringVersion = WIRING_VERSION) {
    if (/^[KL]\d+$/.test(name)) {
      const bit = Number(name.slice(1));
      if (bit >= IO_LIMIT) {
        return "";
      }
      const column = PORT_LAYOUT.lowestColumn - bit * PORT_LAYOUT.columnStep;
      if (name.startsWith("L")) {
        return holeId(0, "A", column);
      }
      return holeId(BOARD.sections - 1, "J", column);
    }
    if (name === "P+") {
      return holeId(BOARD.sections - 1, "J", positivePulseColumn(wiringVersion));
    }
    if (name === "P-") {
      return holeId(BOARD.sections - 1, "J", PORT_LAYOUT.negativeColumn);
    }
    if (name === "GND" || name === "VCC") {
      return "R:" + name + ":" + (RAIL_LAYOUT.count - 1);
    }
    return "";
  }
  function isPhysicalHole(name) {
    return validEndpoint(name) && (name.startsWith("B") || name.startsWith("R:"));
  }
  function isInputColumn(column, wiringVersion = WIRING_VERSION) {
    if (column === positivePulseColumn(wiringVersion) || column === PORT_LAYOUT.negativeColumn) {
      return true;
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      const inputColumn = PORT_LAYOUT.lowestColumn - bit * PORT_LAYOUT.columnStep;
      if (column === inputColumn) {
        return true;
      }
    }
    return false;
  }
  function baseNode(name, wiringVersion = WIRING_VERSION) {
    if (/^[KL]\d+$/.test(name) || name === "P+" || name === "P-") {
      const hole = portHole(name, wiringVersion);
      if (hole !== "") {
        return baseNode(hole, wiringVersion);
      }
    }
    if (name === "GND" || name.startsWith("R:GND:")) {
      return "GND";
    }
    if (name === "VCC" || name.startsWith("R:VCC:")) {
      return "VCC";
    }
    if (!name.startsWith("B")) {
      return name;
    }
    const parts = name.split(":");
    if (BUS_ROWS.includes(parts[1])) {
      return parts[0] + ":" + parts[1] + ":segment" + busSegment(Number(parts[2]));
    }
    let side = "upper";
    if (ROWS.indexOf(parts[1]) >= 5) {
      side = "lower";
    }
    const section = Number(parts[0].slice(1));
    if (wiringVersion >= 3 && section === BOARD.sections - 1 && isInputColumn(Number(parts[2]), wiringVersion)) {
      side = "lower";
    }
    return parts[0] + ":" + side + ":" + parts[2];
  }
  function pinHole(chip, pin) {
    const count = CHIP_MODELS[chip.model].count;
    const half = count / 2;
    let column = chip.column + pin - 1;
    let row = "F";
    if (pin > half) {
      column = chip.column + count - pin;
      row = "E";
    }
    return holeId(chip.section, row, column);
  }
  function endpointPosition(name) {
    if (name.startsWith("B")) {
      const parts = name.split(":");
      const section = Number(parts[0].slice(1));
      return { x: columnX(Number(parts[2])), y: rowY(section, parts[1]) };
    }
    if (name.startsWith("R:")) {
      const parts = name.split(":");
      let horizontal = RAIL_LAYOUT.groundX;
      if (parts[1] === "VCC") {
        horizontal = RAIL_LAYOUT.powerX;
      }
      const pitch = (RAIL_LAYOUT.endY - RAIL_LAYOUT.startY) / (RAIL_LAYOUT.count - 1);
      return { x: horizontal, y: RAIL_LAYOUT.startY + Number(parts[2]) * pitch };
    }
    if (name.startsWith("K") || name.startsWith("L")) {
      const number = Number(name.slice(1));
      const column = PORT_LAYOUT.lowestColumn - number * PORT_LAYOUT.columnStep;
      let vertical = PORT_LAYOUT.inputY;
      if (name.startsWith("L")) {
        vertical = PORT_LAYOUT.outputY;
      }
      return { x: columnX(column), y: vertical };
    }
    if (name === "P+") {
      return { x: columnX(PORT_LAYOUT.positiveColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "P-") {
      return { x: columnX(PORT_LAYOUT.negativeColumn), y: PORT_LAYOUT.inputY };
    }
    if (name === "GND") {
      return { x: RAIL_LAYOUT.groundX, y: PORT_LAYOUT.inputY };
    }
    return { x: RAIL_LAYOUT.powerX, y: PORT_LAYOUT.inputY };
  }
  function endpointLabel(name) {
    if (name.startsWith("B")) {
      const parts = name.split(":");
      const section = Number(parts[0].slice(1)) + 1;
      return "\u7B2C" + section + "\u5757 " + parts[1] + parts[2];
    }
    if (name.startsWith("R:")) {
      const parts = name.split(":");
      return "\u53F3\u4FA7 " + parts[1] + " \u7B2C" + (Number(parts[2]) + 1) + "\u5B54";
    }
    return name;
  }
  function placementError(chips, candidate, ignoredId) {
    if (!Object.hasOwn(CHIP_MODELS, candidate.model)) {
      return "\u4E0D\u652F\u6301\u8FD9\u4E2A\u82AF\u7247\u578B\u53F7";
    }
    const half = CHIP_MODELS[candidate.model].count / 2;
    if (!Number.isInteger(candidate.section) || candidate.section < 0 || candidate.section >= BOARD.sections) {
      return "\u8BF7\u628A\u82AF\u7247\u653E\u5728\u5DF2\u6709\u7684\u9762\u5305\u677F\u4E0A";
    }
    if (!Number.isInteger(candidate.column) || candidate.column < 1 || candidate.column + half - 1 > BOARD.columns) {
      return "\u82AF\u7247\u5F15\u811A\u8D85\u51FA\u4E86\u9762\u5305\u677F\u8303\u56F4";
    }
    for (const chip of chips) {
      if (chip.id === ignoredId || chip.section !== candidate.section) {
        continue;
      }
      const last = chip.column + CHIP_MODELS[chip.model].count / 2 - 1;
      const candidateLast = candidate.column + half - 1;
      if (candidate.column <= last && candidateLast >= chip.column) {
        return "\u6B64\u5904\u5DF2\u6709\u82AF\u7247\uFF0C\u8BF7\u6362\u4E00\u7EC4\u7A7A\u5217";
      }
    }
    return "";
  }
  function emptyProject() {
    const switches = [];
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      switches.push(0);
    }
    return {
      version: 1,
      wiringVersion: WIRING_VERSION,
      inputCount: PROJECT_DEFAULTS.inputCount,
      outputCount: PROJECT_DEFAULTS.outputCount,
      notes: GENERAL_NOTES,
      name: "\u672A\u547D\u540D\u7535\u8DEF",
      chips: [],
      wires: [],
      pullUps: [],
      switches,
      power: PROJECT_DEFAULTS.power
    };
  }
  function copyProject(project) {
    return structuredClone(project);
  }

  // src/ui/hidden-wires.mjs
  var EXACT_IDENTIFIER = /^(?:[wukl]\d+|u\d+-\d+|p[+-])$/;
  function endpointAliases(project) {
    const aliases = /* @__PURE__ */ new Map();
    for (const prefix of ["K", "L"]) {
      for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        addAlias(aliases, prefix + bit, prefix + bit, project.wiringVersion);
      }
    }
    for (const name of ["P+", "P-", "GND", "VCC"]) {
      addAlias(aliases, name, name, project.wiringVersion);
    }
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        const hole = pinHole(chip, pin);
        const name = chip.id + "-" + pin;
        addAlias(aliases, hole, name, project.wiringVersion);
      }
    }
    return aliases;
  }
  function addAlias(aliases, endpoint, name, wiringVersion) {
    const group = baseNode(endpoint, wiringVersion);
    if (!aliases.has(group)) {
      aliases.set(group, []);
    }
    const names = aliases.get(group);
    names.push(name);
  }
  function describeEndpoint(endpoint, aliases, wiringVersion) {
    const group = baseNode(endpoint, wiringVersion);
    const names = aliases.get(group);
    const label2 = endpointLabel(endpoint);
    if (names) {
      return names.join(" / ") + " \xB7 " + label2;
    }
    return label2;
  }
  function hiddenRows(state2) {
    const rows = [];
    if (state2.hiddenWires.size === 0) {
      return rows;
    }
    const aliases = endpointAliases(state2.project);
    const wiringVersion = state2.project.wiringVersion;
    for (const wire of state2.project.wires) {
      if (!state2.hiddenWires.has(wire.id)) {
        continue;
      }
      const first = describeEndpoint(wire.from, aliases, wiringVersion);
      const last = describeEndpoint(wire.to, aliases, wiringVersion);
      rows.push({ id: wire.id, detail: first + " \u2192 " + last, holes: wire.from + " " + wire.to, color: wire.color });
    }
    return rows;
  }
  function createHiddenRow(row, restore) {
    const item = node("li", "", "hidden-object-row");
    const swatch = node("span", "", "hidden-wire-swatch");
    swatch.style.backgroundColor = row.color;
    item.append(swatch);
    const description = node("span", "", "hidden-object-description");
    description.append(node("strong", row.id, ""), node("small", row.detail, ""));
    const button = node("button", "", "icon-button");
    button.type = "button";
    button.setAttribute("aria-label", "\u6062\u590D " + row.id);
    button.dataset.tip = "\u6062\u590D " + row.id;
    button.append(icon("eye"));
    button.addEventListener("click", restore.bind(null, row.id));
    item.append(description, button);
    return item;
  }
  function matchesSearch(row, terms) {
    const text2 = row.id + " " + row.detail + " " + row.holes;
    const searchable = text2.toLowerCase();
    const identifiers = searchable.split(/[\s/·→]+/);
    for (const term of terms) {
      if (EXACT_IDENTIFIER.test(term)) {
        if (!identifiers.includes(term)) {
          return false;
        }
      } else if (!searchable.includes(term)) {
        return false;
      }
    }
    return true;
  }
  function bindHiddenWires(state2, onRestore, onRestoreAll) {
    const dialog = element("hidden-objects-dialog");
    const search = element("hidden-objects-search");
    const list = element("hidden-objects-list");
    const empty = element("hidden-objects-empty");
    let rows = [];
    let matches = [];
    function restore(id) {
      dialog.close();
      onRestore(id);
    }
    function filterRows() {
      const query = search.value.trim();
      const lowerCaseQuery = query.toLowerCase();
      const terms = lowerCaseQuery.split(/\s+/);
      const items = document.createDocumentFragment();
      matches = [];
      for (const row of rows) {
        if (matchesSearch(row, terms)) {
          matches.push(row);
          items.append(createHiddenRow(row, restore));
        }
      }
      list.replaceChildren(items);
      list.scrollTop = 0;
      empty.hidden = matches.length > 0;
      empty.textContent = "\u6CA1\u6709\u5339\u914D\u7684\u5BFC\u7EBF";
      if (rows.length === 0) {
        empty.textContent = "\u5F53\u524D\u6CA1\u6709\u9690\u85CF\u5BFC\u7EBF";
      }
      refreshIcons();
    }
    function openList() {
      rows = hiddenRows(state2);
      search.value = "";
      element("restore-all-objects").disabled = rows.length === 0;
      filterRows();
      dialog.showModal();
      search.focus();
    }
    function restoreMatch(event) {
      if (event.key === "Enter" && !event.isComposing && matches.length === 1) {
        event.preventDefault();
        const row = matches[0];
        restore(row.id);
      }
    }
    function closeList() {
      dialog.close();
    }
    function restoreAll() {
      dialog.close();
      onRestoreAll();
    }
    element("hidden-objects").addEventListener("click", openList);
    element("close-hidden-objects").addEventListener("click", closeList);
    element("restore-all-objects").addEventListener("click", restoreAll);
    search.addEventListener("input", filterRows);
    search.addEventListener("keydown", restoreMatch);
    return openList;
  }

  // src/chips/chip-logic.mjs
  var SEGMENT_PATTERNS = ["1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "0011111", "1110000", "1111111", "1110011", "0001101", "0011001", "0100011", "1001011", "0001111", "0000000"];
  var SEGMENT_PINS = [13, 12, 11, 10, 9, 15, 14];
  var COMPARE_FIRST = [15, 14, 12, 10];
  var COMPARE_SECOND = [1, 13, 11, 9];
  function logicValue(value) {
    if (value === 0 || value === 1) {
      return value;
    }
    return "X";
  }
  function andValues(values) {
    let result = 1;
    for (const value of values) {
      result = logicGate("and", result, value);
    }
    return result;
  }
  function readNumber(pins, order) {
    let result = 0;
    for (let bit = 0; bit < order.length; bit = bit + 1) {
      const value = logicValue(pins[order[bit]]);
      if (value === "X") {
        return "X";
      }
      result = result + value * 2 ** bit;
    }
    return result;
  }
  function possibleAddresses(pins, order) {
    const possible = [];
    for (let number = 0; number < 2 ** order.length; number = number + 1) {
      let matches = true;
      for (let bit = 0; bit < order.length; bit = bit + 1) {
        const value = logicValue(pins[order[bit]]);
        if (value !== "X" && value !== (number >> bit & 1)) {
          matches = false;
        }
      }
      if (matches) {
        possible.push(number);
      }
    }
    return possible;
  }
  function commonValue(values) {
    const first = values[0];
    for (const value of values) {
      if (value !== first) {
        return "X";
      }
    }
    return first;
  }
  function decode(pins, addressPins, enable, outputPins, outputs) {
    const addresses = possibleAddresses(pins, addressPins);
    for (let index = 0; index < outputPins.length; index = index + 1) {
      const candidates = [];
      for (const address of addresses) {
        let match = 0;
        if (address === index) {
          match = 1;
        }
        const active = logicGate("and", enable, match);
        candidates.push(logicGate("not", active, 0));
      }
      outputs[outputPins[index]] = commonValue(candidates);
    }
  }
  function multiplex(pins, addressPins, dataPins, enable) {
    const candidates = [];
    for (const address of possibleAddresses(pins, addressPins)) {
      candidates.push(logicValue(pins[dataPins[address]]));
    }
    return logicGate("and", enable, commonValue(candidates));
  }
  function compare(pins, outputs) {
    outputs[5] = "X";
    outputs[6] = "X";
    outputs[7] = "X";
    for (let bit = 0; bit < COMPARE_FIRST.length; bit = bit + 1) {
      const first = logicValue(pins[COMPARE_FIRST[bit]]);
      const second = logicValue(pins[COMPARE_SECOND[bit]]);
      if (first === "X" || second === "X") {
        return;
      }
      if (first !== second) {
        outputs[5] = 0;
        outputs[6] = 0;
        outputs[7] = 0;
        if (first > second) {
          outputs[5] = 1;
        } else {
          outputs[7] = 1;
        }
        return;
      }
    }
    outputs[6] = logicValue(pins[3]);
    const notEqual = logicGate("not", pins[3], 0);
    const notLess = logicGate("not", pins[2], 0);
    const notGreater = logicGate("not", pins[4], 0);
    outputs[5] = logicGate("and", notEqual, notLess);
    outputs[7] = logicGate("and", notEqual, notGreater);
  }
  function sevenSegment(model, pins, outputs) {
    const number = readNumber(pins, [7, 1, 2, 6]);
    const controls2 = model.controls;
    const lampTest = pins[controls2.lampTest];
    const blanking = pins[controls2.blanking];
    let rippleBlank = pins[controls2.rippleBlanking];
    if (rippleBlank === "Z") {
      rippleBlank = 1;
    }
    const blankZero = number === 0 && rippleBlank === 0 && lampTest === 1;
    outputs[controls2.blanking] = "Z";
    if (blankZero) {
      outputs[controls2.blanking] = 0;
    }
    for (let index = 0; index < SEGMENT_PINS.length; index = index + 1) {
      let value = "X";
      if (blanking === 0 || blankZero) {
        value = 0;
      } else if (lampTest === 0 && blanking === 1) {
        value = 1;
      } else if (lampTest === 1 && blanking === 1 && number !== "X") {
        if (number !== 0 || rippleBlank === 1) {
          value = Number(SEGMENT_PATTERNS[number][index]);
        }
      }
      outputs[SEGMENT_PINS[index]] = value;
    }
  }
  function evaluateExtra(model, pins) {
    const outputs = {};
    if (model.kind === "cmos-nand" || model.kind === "open-collector" || model.kind === "nand4" || model.kind === "tristate") {
      for (const gate of model.gates) {
        const outputPin = gate[gate.length - 1];
        let value = "X";
        if (model.kind === "tristate") {
          if (pins[gate[0]] === 1) {
            value = "Z";
          } else if (pins[gate[0]] === 0) {
            value = logicValue(pins[gate[1]]);
          }
        } else {
          const inputs = [];
          for (let index = 0; index < gate.length - 1; index = index + 1) {
            inputs.push(pins[gate[index]]);
          }
          value = logicGate("not", andValues(inputs), 0);
          if (model.kind === "open-collector" && value === 1) {
            value = "Z";
          }
        }
        outputs[outputPin] = value;
      }
    } else if (model.kind === "decoder8") {
      const enable = andValues([pins[6], logicGate("not", pins[4], 0), logicGate("not", pins[5], 0)]);
      decode(pins, [1, 2, 3], enable, model.outputs, outputs);
    } else if (model.kind === "dual-decoder") {
      decode(pins, [2, 3], logicGate("not", pins[1], 0), [4, 5, 6, 7], outputs);
      decode(pins, [14, 13], logicGate("not", pins[15], 0), [12, 11, 10, 9], outputs);
    } else if (model.kind === "mux8") {
      outputs[5] = multiplex(pins, [11, 10, 9], [4, 3, 2, 1, 15, 14, 13, 12], logicGate("not", pins[7], 0));
      outputs[6] = logicGate("not", outputs[5], 0);
    } else if (model.kind === "dual-mux") {
      outputs[7] = multiplex(pins, [14, 2], [6, 5, 4, 3], logicGate("not", pins[1], 0));
      outputs[9] = multiplex(pins, [14, 2], [10, 11, 12, 13], logicGate("not", pins[15], 0));
    } else if (model.kind === "comparator") {
      compare(pins, outputs);
    } else if (model.kind === "seven-segment") {
      sevenSegment(model, pins, outputs);
    }
    return outputs;
  }

  // src/chips/chip-state.mjs
  var DECADE_NEXT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11, 4, 13, 4, 15, 0];
  function unknownBits(count) {
    const bits = [];
    for (let index = 0; index < count; index = index + 1) {
      bits.push("X");
    }
    return bits;
  }
  function createChipState(model) {
    let count = 4;
    if (model.sequential === "flipflop") {
      count = 2;
    }
    const clocks = unknownBits(count);
    return { bits: unknownBits(count), inverted: unknownBits(count), clocks };
  }
  function hasEdge(previous, current, edge) {
    if (edge === "falling") {
      return previous === 1 && current === 0;
    }
    return previous === 0 && current === 1;
  }
  function uncertainEdge(previous, current, edge) {
    const first = logicValue(previous);
    const last = logicValue(current);
    if (first !== "X" && last !== "X") {
      return false;
    }
    if (edge === "falling") {
      return first !== 0 && last !== 1;
    }
    return first !== 1 && last !== 0;
  }
  function nextJk(first, second, previous) {
    if (first === 1 && second === 0) {
      return 1;
    }
    if (first === 0 && second === 1) {
      return 0;
    }
    const previousInverse = logicGate("not", previous, 0);
    const secondInverse = logicGate("not", second, 0);
    const setPart = logicGate("and", first, previousInverse);
    const keepPart = logicGate("and", secondInverse, previous);
    return logicGate("or", setPart, keepPart);
  }
  function sampleFlipFlop(channel, pins, previous) {
    if (channel.data) {
      return logicValue(pins[channel.data]);
    }
    return nextJk(pins[channel.first], pins[channel.second], previous);
  }
  function updateFlipFlops(model, pins, state2) {
    const bits = [];
    const inverted = [];
    let active = 0;
    if (model.activeHigh) {
      active = 1;
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
      const channel = model.channels[index];
      const reset = logicValue(pins[channel.reset]);
      const set = logicValue(pins[channel.set]);
      const previousClock = state2.clocks[index];
      const clock = pins[channel.clock];
      let value = state2.bits[index];
      let inverse = state2.inverted[index];
      if (reset === active && set === active) {
        value = 1;
        inverse = 1;
      } else if (reset === active) {
        value = 0;
        inverse = 1;
      } else if (set === active) {
        value = 1;
        inverse = 0;
      } else if (reset === "X" || set === "X") {
        value = "X";
        inverse = "X";
      } else {
        if (value === inverse) {
          value = "X";
        }
        if (hasEdge(previousClock, clock, model.edge)) {
          value = sampleFlipFlop(channel, pins, value);
        } else if (uncertainEdge(previousClock, clock, model.edge)) {
          const sampled = sampleFlipFlop(channel, pins, value);
          if (sampled !== value) {
            value = "X";
          }
        }
        inverse = logicGate("not", value, 0);
      }
      bits.push(value);
      inverted.push(inverse);
      state2.clocks[index] = logicValue(clock);
    }
    state2.bits = bits;
    state2.inverted = inverted;
  }
  function storedNumber(bits) {
    let value = 0;
    for (let bit = 0; bit < bits.length; bit = bit + 1) {
      if (bits[bit] !== 0 && bits[bit] !== 1) {
        return "X";
      }
      value = value + bits[bit] * 2 ** bit;
    }
    return value;
  }
  function numberBits(number) {
    if (number === "X") {
      return unknownBits(4);
    }
    const bits = [];
    for (let bit = 0; bit < 4; bit = bit + 1) {
      bits.push(number >> bit & 1);
    }
    return bits;
  }
  function clockedCounterBits(model, pins, bits) {
    const controls2 = model.controls;
    const load = pins[controls2.load];
    if (load === 0) {
      const number2 = readNumber(pins, controls2.data);
      return numberBits(number2);
    }
    if (load !== 1) {
      return unknownBits(4);
    }
    const enable = andValues([pins[controls2.enable[0]], pins[controls2.enable[1]]]);
    if (enable === 0) {
      return bits;
    }
    const number = storedNumber(bits);
    if (enable === "X" || number === "X") {
      return unknownBits(4);
    }
    if (model.modulus === 10) {
      return numberBits(DECADE_NEXT[number]);
    }
    return numberBits((number + 1) % model.modulus);
  }
  function updateCounter(model, pins, state2) {
    const controls2 = model.controls;
    const reset = pins[controls2.reset];
    const clock = pins[controls2.clock];
    const previousClock = state2.clocks[0];
    if (reset === 0) {
      state2.bits = [0, 0, 0, 0];
    } else if (reset !== 1) {
      state2.bits = unknownBits(4);
    } else if (hasEdge(previousClock, clock, "rising")) {
      state2.bits = clockedCounterBits(model, pins, state2.bits);
    } else if (uncertainEdge(previousClock, clock, "rising")) {
      const disabled = pins[controls2.enable[0]] === 0 || pins[controls2.enable[1]] === 0;
      const holds = pins[controls2.load] === 1 && disabled;
      if (!holds) {
        state2.bits = unknownBits(4);
      }
    }
    state2.clocks[0] = logicValue(clock);
  }
  function updateShift(model, pins, state2) {
    const controls2 = model.controls;
    const reset = pins[controls2.reset];
    const clock = pins[controls2.clock];
    const previousClock = state2.clocks[0];
    const mode = readNumber(pins, controls2.mode);
    if (reset === 0) {
      state2.bits = [0, 0, 0, 0];
    } else if (reset !== 1) {
      state2.bits = unknownBits(4);
    } else if (hasEdge(previousClock, clock, "rising")) {
      const previous = state2.bits;
      if (mode === 1) {
        const serial = logicValue(pins[controls2.right]);
        state2.bits = [serial, previous[0], previous[1], previous[2]];
      } else if (mode === 2) {
        const serial = logicValue(pins[controls2.left]);
        state2.bits = [previous[1], previous[2], previous[3], serial];
      } else if (mode === 3) {
        const bits = [];
        for (const pin of controls2.data) {
          bits.push(logicValue(pins[pin]));
        }
        state2.bits = bits;
      } else if (mode === "X") {
        state2.bits = unknownBits(4);
      }
    } else if (mode !== 0 && uncertainEdge(previousClock, clock, "rising")) {
      state2.bits = unknownBits(4);
    }
    state2.clocks[0] = logicValue(clock);
  }
  function updateChipState(model, pins, state2, powered) {
    const before = JSON.stringify([state2.bits, state2.inverted]);
    if (!powered) {
      state2.bits = unknownBits(state2.bits.length);
      state2.inverted = unknownBits(state2.inverted.length);
      state2.clocks = unknownBits(state2.clocks.length);
    } else if (model.sequential === "flipflop") {
      updateFlipFlops(model, pins, state2);
    } else if (model.sequential === "counter") {
      updateCounter(model, pins, state2);
    } else if (model.sequential === "shift") {
      updateShift(model, pins, state2);
    }
    return before !== JSON.stringify([state2.bits, state2.inverted]);
  }
  function stateOutputs(model, pins, state2) {
    const outputs = {};
    if (model.sequential === "flipflop") {
      for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        outputs[channel.output] = state2.bits[index];
        outputs[channel.inverted] = state2.inverted[index];
      }
    } else {
      for (let bit = 0; bit < 4; bit = bit + 1) {
        outputs[model.outputs[bit]] = state2.bits[bit];
      }
      if (model.sequential === "counter") {
        const number = storedNumber(state2.bits);
        let terminal = "X";
        if (number !== "X") {
          terminal = 0;
          if (number === model.modulus - 1) {
            terminal = 1;
          }
        }
        const controls2 = model.controls;
        const carryEnable = pins[controls2.enable[1]];
        outputs[controls2.carry] = logicGate("and", terminal, carryEnable);
      }
    }
    return outputs;
  }

  // src/chips/chip-memory.mjs
  function createMemory(specification) {
    const words = [];
    for (let address = 0; address < specification.words; address = address + 1) {
      const bits = [];
      for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
        bits.push("X");
      }
      words.push(bits);
    }
    return { words, powered: false };
  }
  function matchesAddress(specification, pins, address) {
    for (let bit = 0; bit < specification.address.length; bit = bit + 1) {
      const value = logicValue(pins[specification.address[bit]]);
      const expected = address >> bit & 1;
      if (value !== "X" && value !== expected) {
        return false;
      }
    }
    return true;
  }
  function readMemoryBit(specification, pins, state2, bit) {
    const address = readNumber(pins, specification.address);
    if (address !== "X") {
      return state2.words[address][bit];
    }
    let value;
    for (let candidate = 0; candidate < specification.words; candidate = candidate + 1) {
      if (matchesAddress(specification, pins, candidate)) {
        const stored = state2.words[candidate][bit];
        if (value === void 0) {
          value = stored;
        } else if (value !== stored) {
          return "X";
        }
      }
    }
    return value;
  }
  function memoryOutputs(specification, pins, state2) {
    const outputs = {};
    const selected = pins[specification.select];
    const reading = pins[specification.read];
    const writing = pins[specification.write];
    for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
      let value = "X";
      if (selected === 1 || reading === 1 || writing === 0) {
        value = "Z";
      } else if (selected === 0 && reading === 0 && writing === 1) {
        value = readMemoryBit(specification, pins, state2, bit);
      }
      outputs[specification.data[bit]] = value;
    }
    return outputs;
  }
  function writeMemoryWord(specification, pins, state2, address, certain) {
    let changed = false;
    const word = state2.words[address];
    for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
      let value = logicValue(pins[specification.data[bit]]);
      if (!certain && word[bit] !== value) {
        value = "X";
      }
      if (word[bit] !== value) {
        word[bit] = value;
        changed = true;
      }
    }
    return changed;
  }
  function updateMemory(specification, pins, state2, powered) {
    if (!powered) {
      if (state2.powered) {
        const cleared = createMemory(specification);
        state2.words = cleared.words;
      }
      state2.powered = false;
      return false;
    }
    state2.powered = true;
    const selected = pins[specification.select];
    const writing = pins[specification.write];
    if (selected === 1 || writing === 1) {
      return false;
    }
    const address = readNumber(pins, specification.address);
    const certain = selected === 0 && writing === 0 && address !== "X";
    if (certain) {
      return writeMemoryWord(specification, pins, state2, address, true);
    }
    let changed = false;
    for (let candidate = 0; candidate < specification.words; candidate = candidate + 1) {
      if (matchesAddress(specification, pins, candidate)) {
        const updated = writeMemoryWord(specification, pins, state2, candidate, false);
        changed = changed || updated;
      }
    }
    return changed;
  }

  // src/simulation/board-signals.mjs
  var TRISTATE_CONTROL = 8;
  var TRISTATE_FIRST_INPUT = 0;
  var TRISTATE_LAST_INPUT = 7;
  function isWeakBoardInput(project, triState, index) {
    if (!triState || project.switches[TRISTATE_CONTROL] === 1) {
      return false;
    }
    return index >= TRISTATE_FIRST_INPUT && index <= TRISTATE_LAST_INPUT;
  }

  // src/simulation/engine.mjs
  var MAX_SETTLE_PASSES = 96;
  var MAX_SEQUENTIAL_PASSES = 12;
  function buildTopology(project) {
    const parents = {};
    for (const wire of project.wires) {
      const first = baseNode(wire.from);
      const second = baseNode(wire.to);
      ensureNode(parents, first);
      ensureNode(parents, second);
      const firstRoot = findRoot(parents, first);
      const secondRoot = findRoot(parents, second);
      parents[secondRoot] = firstRoot;
    }
    return parents;
  }
  function ensureNode(parents, name) {
    if (!Object.hasOwn(parents, name)) {
      parents[name] = name;
    }
  }
  function findRoot(parents, name) {
    ensureNode(parents, name);
    let root = name;
    while (parents[root] !== root) {
      root = parents[root];
    }
    return root;
  }
  function nodeFor(topology, endpoint) {
    return findRoot(topology, baseNode(endpoint));
  }
  function addDriver(drivers, node2, value, source, kind = "push-pull") {
    if (value === "Z") {
      return;
    }
    if (!Object.hasOwn(drivers, node2)) {
      drivers[node2] = [];
    }
    drivers[node2].push({ value, source, kind });
  }
  function resolveDrivers(drivers) {
    if (!drivers || drivers.length === 0) {
      return "Z";
    }
    let result = "Z";
    let weakValue = "Z";
    for (const driver of drivers) {
      if (driver.kind === "pull-up" || driver.kind === "weak-input") {
        if (weakValue === "Z") {
          weakValue = driver.value;
        } else if (weakValue !== driver.value) {
          weakValue = "X";
        }
        continue;
      }
      if (result === "Z") {
        result = driver.value;
      } else if (driver.value === "X" || driver.value !== result) {
        result = "X";
      }
    }
    if (result === "Z") {
      return weakValue;
    }
    return result;
  }
  function readEndpoint(result, endpoint) {
    const node2 = nodeFor(result.topology, endpoint);
    if (!Object.hasOwn(result.values, node2)) {
      return "Z";
    }
    return result.values[node2];
  }
  function readPins(chip, topology, values) {
    const pins = {};
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const hole = pinHole(chip, pin);
      const node2 = nodeFor(topology, hole);
      pins[pin] = "Z";
      if (Object.hasOwn(values, node2)) {
        pins[pin] = values[node2];
      }
    }
    return pins;
  }
  function chipPowered(chip, pins) {
    const model = CHIP_MODELS[chip.model];
    return pins[model.power] === 1 && pins[model.ground] === 0;
  }
  function initialRegister() {
    const bits = [];
    for (let index = 0; index < 8; index = index + 1) {
      bits.push("X");
    }
    return { bits, clock: "X" };
  }
  function chipOutputs(chip, pins, registers, devices) {
    const model = CHIP_MODELS[chip.model];
    const outputs = {};
    if (!chipPowered(chip, pins)) {
      return outputs;
    }
    if (chip.model === "74LS273") {
      const register = registers[chip.id];
      for (let bit = 0; bit < 8; bit = bit + 1) {
        outputs[model.outputs[bit]] = register.bits[bit];
      }
      return outputs;
    }
    if (chip.model === "74LS283") {
      return evaluateAdder(pins);
    }
    if (model.memory) {
      return memoryOutputs(model.memory, pins, devices[chip.id]);
    }
    if (model.sequential) {
      return stateOutputs(model, pins, devices[chip.id]);
    }
    if (model.kind) {
      return evaluateExtra(model, pins);
    }
    for (const gate of model.gates) {
      outputs[gate[2]] = logicGate(model.operation, pins[gate[0]], pins[gate[1]]);
    }
    return outputs;
  }
  function addBoardDrivers(project, topology, runtime, drivers) {
    addDriver(drivers, nodeFor(topology, "VCC"), 1, "+5V");
    addDriver(drivers, nodeFor(topology, "GND"), 0, "GND");
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      const name = "K" + index;
      const node2 = nodeFor(topology, name);
      if (isWeakBoardInput(project, runtime.triState, index)) {
        addDriver(drivers, node2, project.switches[index], name + "\uFF08\u5F31\u9A71\u52A8\uFF09", "weak-input");
      } else {
        addDriver(drivers, node2, project.switches[index], name);
      }
    }
    addDriver(drivers, nodeFor(topology, "P+"), runtime.pulses.positive, "P+");
    addDriver(drivers, nodeFor(topology, "P-"), runtime.pulses.negative, "P\u2212");
    if (project.pullUps) {
      for (const endpoint of project.pullUps) {
        addDriver(drivers, nodeFor(topology, endpoint), 1, "\u4E0A\u62C9 " + endpoint, "pull-up");
      }
    }
  }
  function readBidirectionalPins(chip, pins, topology, drivers, previousDrivers) {
    const model = CHIP_MODELS[chip.model];
    if (!model.bidirectional || !chipPowered(chip, pins)) {
      return;
    }
    for (const pin of model.bidirectional) {
      const node2 = nodeFor(topology, pinHole(chip, pin));
      const external = [];
      const source = chip.id + "-" + pin;
      const entries2 = previousDrivers[node2];
      if (entries2) {
        for (const driver of entries2) {
          if (driver.source !== source) {
            external.push(driver);
          }
        }
      }
      if (model.kind === "seven-segment") {
        addDriver(drivers, node2, 1, source + "-bias", "pull-up");
        external.push({ value: 1, kind: "pull-up" });
      }
      pins[pin] = resolveDrivers(external);
    }
  }
  function outputDriverKind(model, pin, value) {
    if (model.kind === "open-collector") {
      return "open-collector";
    }
    if (model.kind === "seven-segment") {
      if (pin !== model.controls.blanking && value === 1) {
        return "pull-up";
      }
      return "open-collector";
    }
    return "push-pull";
  }
  function collectDrivers(project, topology, values, runtime, previousDrivers) {
    const drivers = {};
    if (!project.power) {
      return drivers;
    }
    addBoardDrivers(project, topology, runtime, drivers);
    for (const chip of project.chips) {
      const pins = readPins(chip, topology, values);
      readBidirectionalPins(chip, pins, topology, drivers, previousDrivers);
      const outputs = chipOutputs(chip, pins, runtime.registers, runtime.devices);
      const model = CHIP_MODELS[chip.model];
      for (const pin in outputs) {
        const pinNumber = Number(pin);
        const hole = pinHole(chip, pinNumber);
        const kind = outputDriverKind(model, pinNumber, outputs[pin]);
        addDriver(drivers, nodeFor(topology, hole), outputs[pin], chip.id + "-" + pin, kind);
      }
    }
    return drivers;
  }
  function driverValues(drivers) {
    const values = {};
    for (const name in drivers) {
      values[name] = resolveDrivers(drivers[name]);
    }
    return values;
  }
  function sameValues(first, second) {
    const names = Object.keys(first);
    if (names.length !== Object.keys(second).length) {
      return false;
    }
    for (const name of names) {
      if (first[name] !== second[name]) {
        return false;
      }
    }
    return true;
  }
  function topologySignature(project) {
    const connections = [];
    for (const wire of project.wires) {
      connections.push([wire.from, wire.to]);
    }
    const chips = [];
    for (const chip of project.chips) {
      chips.push([chip.id, chip.model, chip.section, chip.column]);
    }
    return JSON.stringify([connections, chips, project.pullUps]);
  }
  function settle(project, topology, runtime, previous) {
    let values = {};
    let drivers = {};
    if (previous && previous.stable) {
      values = previous.values;
      drivers = previous.drivers;
    }
    for (let pass = 0; pass < MAX_SETTLE_PASSES; pass = pass + 1) {
      drivers = collectDrivers(project, topology, values, runtime, drivers);
      const next = driverValues(drivers);
      if (pass > 0 && sameValues(values, next)) {
        return { values: next, drivers, stable: true };
      }
      values = next;
    }
    for (const name in values) {
      values[name] = "X";
    }
    return { values, drivers, stable: false };
  }
  function updateRegisters(project, topology, values, registers) {
    let changed = false;
    for (const chip of project.chips) {
      if (chip.model !== "74LS273") {
        continue;
      }
      const register = registers[chip.id];
      const model = CHIP_MODELS[chip.model];
      const pins = readPins(chip, topology, values);
      const powered = project.power && chipPowered(chip, pins);
      const reset = pins[model.controls.reset];
      const clock = pins[model.controls.clock];
      const rising = register.clock === 0 && clock === 1;
      const previousHigh = register.clock === 1;
      const uncertainRise = clock !== 0 && !previousHigh;
      const nextBits = [];
      for (let bit = 0; bit < model.data.length; bit = bit + 1) {
        let value = register.bits[bit];
        if (!powered) {
          value = "X";
        } else if (reset === 0) {
          value = 0;
        } else if (reset !== 1) {
          value = "X";
        } else if (rising) {
          value = pins[model.data[bit]];
          if (value !== 0 && value !== 1) {
            value = "X";
          }
        } else if (uncertainRise) {
          value = "X";
        }
        nextBits.push(value);
        if (value !== register.bits[bit]) {
          changed = true;
        }
      }
      register.bits = nextBits;
      register.clock = clock;
    }
    return changed;
  }
  function describeDriverConflict(drivers) {
    const sources = [];
    let pushPull = false;
    let high = false;
    let low = false;
    for (const driver of drivers) {
      if (driver.kind === "pull-up" || driver.kind === "weak-input") {
        continue;
      }
      sources.push(driver.source);
      if (driver.kind === "push-pull") {
        pushPull = true;
      }
      if (driver.value === 1) {
        high = true;
      } else if (driver.value === 0) {
        low = true;
      }
    }
    if (sources.length < 2 || !pushPull) {
      return "";
    }
    const names = sources.join("\u3001");
    if (high && low) {
      return "\u9AD8\u4F4E\u7535\u5E73\u51B2\u7A81\uFF1A" + names + "\uFF0C\u6B64\u8282\u70B9\u7ED3\u679C\u4E3A X";
    }
    return "\u591A\u4E2A\u9A71\u52A8\u6E90\u8FDE\u63A5\u5230\u540C\u4E00\u8282\u70B9\uFF1A" + names;
  }
  function floatingInputs(model, pins) {
    const missing = [];
    for (const pin of model.inputs) {
      if (pins[pin] !== "Z") {
        continue;
      }
      if (model.kind === "seven-segment" && pin === model.controls.rippleBlanking) {
        continue;
      }
      if (model.memory && model.bidirectional.includes(pin)) {
        const selected = pins[model.memory.select];
        const writing = pins[model.memory.write];
        if (selected !== 0 || writing !== 0) {
          continue;
        }
      }
      missing.push(String(pin));
    }
    return missing;
  }
  function diagnoseChip(chip, result, issues) {
    const pins = readPins(chip, result.topology, result.values);
    if (!chipPowered(chip, pins)) {
      issues.push({ code: "power:" + chip.id, severity: "error", message: chip.id + " \u7535\u6E90\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5 VCC \u548C GND" });
      return;
    }
    const model = CHIP_MODELS[chip.model];
    const missing = floatingInputs(model, pins);
    if (missing.length > 0) {
      const pinList = missing.join("\u3001");
      issues.push({ code: "floating:" + chip.id, severity: "warning", message: chip.id + " \u8F93\u5165\u60AC\u7A7A\uFF1A\u7B2C " + pinList + " \u811A" });
    }
    if (!model.channels) {
      return;
    }
    let active = 0;
    if (model.activeHigh) {
      active = 1;
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
      const channel = model.channels[index];
      if (pins[channel.set] === active && pins[channel.reset] === active) {
        const channelName = chip.id + " \u7B2C " + (index + 1) + " \u8DEF";
        const message = channelName + "\u7F6E\u4F4D\u548C\u590D\u4F4D\u540C\u65F6\u6709\u6548\uFF0C\u4E24\u4E2A\u8F93\u51FA\u5747\u4E3A 1\uFF0C\u540C\u65F6\u91CA\u653E\u540E\u7684\u72B6\u6001\u4E0D\u786E\u5B9A";
        issues.push({ code: "async-conflict:" + chip.id + ":" + index, severity: "warning", message });
      }
    }
  }
  function diagnose(project, result) {
    const issues = [];
    if (!project.power) {
      return issues;
    }
    const power = nodeFor(result.topology, "VCC");
    const ground = nodeFor(result.topology, "GND");
    if (power === ground) {
      issues.push({ code: "power-short", severity: "error", message: "+5V \u4E0E GND \u88AB\u5BFC\u7EBF\u77ED\u63A5\uFF0C\u8BF7\u65AD\u5F00\u5BF9\u5E94\u8FDE\u7EBF" });
    }
    for (const node2 in result.drivers) {
      const message = describeDriverConflict(result.drivers[node2]);
      if (message !== "") {
        issues.push({ code: "drivers:" + node2, severity: "error", message });
      }
    }
    for (const chip of project.chips) {
      diagnoseChip(chip, result, issues);
    }
    if (!result.stable) {
      issues.push({ code: "unstable", severity: "error", message: "\u7535\u8DEF\u672A\u8FBE\u5230\u7A33\u5B9A\u72B6\u6001\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u5408\u903B\u8F91\u53CD\u9988" });
    }
    return issues;
  }
  function createRuntime() {
    return { registers: {}, devices: {}, pulses: { positive: 0, negative: 1 }, triState: false, feedback: null };
  }
  function simulate(project, runtime) {
    const topology = buildTopology(project);
    for (const chip of project.chips) {
      if (chip.model === "74LS273" && !Object.hasOwn(runtime.registers, chip.id)) {
        runtime.registers[chip.id] = initialRegister();
      }
      const model = CHIP_MODELS[chip.model];
      if (model.sequential && !Object.hasOwn(runtime.devices, chip.id)) {
        runtime.devices[chip.id] = createChipState(model);
      }
      if (model.memory && !Object.hasOwn(runtime.devices, chip.id)) {
        runtime.devices[chip.id] = createMemory(model.memory);
      }
    }
    const signature = topologySignature(project);
    let previous = null;
    if (project.power && runtime.feedback && runtime.feedback.signature === signature) {
      previous = runtime.feedback.settled;
    }
    let settled = settle(project, topology, runtime, previous);
    let complete = false;
    for (let pass = 0; pass < MAX_SEQUENTIAL_PASSES; pass = pass + 1) {
      let changed = updateRegisters(project, topology, settled.values, runtime.registers);
      for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        if (model.sequential) {
          const pins = readPins(chip, topology, settled.values);
          const updated = updateChipState(model, pins, runtime.devices[chip.id], project.power && chipPowered(chip, pins));
          changed = changed || updated;
        }
        if (model.memory) {
          const pins = readPins(chip, topology, settled.values);
          const powered = project.power && chipPowered(chip, pins);
          const updated = updateMemory(model.memory, pins, runtime.devices[chip.id], powered);
          changed = changed || updated;
        }
      }
      if (!changed) {
        complete = true;
        break;
      }
      settled = settle(project, topology, runtime, settled);
    }
    const result = { signature, topology, values: settled.values, drivers: settled.drivers, stable: settled.stable && complete, issues: [] };
    runtime.feedback = null;
    if (project.power && result.stable) {
      runtime.feedback = { signature, settled };
    }
    result.issues = diagnose(project, result);
    return result;
  }

  // src/ui/object-inspector.mjs
  var LEVELS = {
    "0": { label: "\u4F4E\u7535\u5E73", tone: "low" },
    "1": { label: "\u9AD8\u7535\u5E73", tone: "high" },
    X: { label: "\u672A\u77E5\u6216\u51B2\u7A81", tone: "unknown" },
    Z: { label: "\u60AC\u7A7A", tone: "floating" }
  };
  function objectSection(title) {
    const section = node("section", "", "object-section");
    section.append(node("h3", title, "object-section-title"));
    return section;
  }
  function objectFact(label2, value) {
    const fact = node("div", "", "object-fact");
    fact.append(node("dt", label2, ""), node("dd", value, ""));
    return fact;
  }
  function objectAction(symbol, label2, action) {
    const button = node("button", "", "button object-action");
    button.type = "button";
    button.append(icon(symbol), node("span", label2, ""));
    button.addEventListener("click", action);
    return button;
  }
  function objectLevel(value, expanded = false) {
    const level = LEVELS[value];
    const badge = node("span", "", "object-level " + level.tone);
    badge.append(node("b", String(value), ""));
    if (expanded) {
      badge.append(node("span", " \xB7 " + level.label, ""));
    } else {
      badge.setAttribute("aria-label", String(value) + " " + level.label);
    }
    return badge;
  }
  function networkRow(name, detail, value, onSelect = null) {
    const row = node("li", "", "object-network-row");
    let label2 = node("span", "", "object-network-label");
    if (onSelect) {
      label2 = node("button", "", "object-network-label");
      label2.type = "button";
      label2.addEventListener("click", onSelect);
    }
    label2.append(node("strong", name, ""));
    if (detail !== "") {
      label2.append(node("small", detail, ""));
    }
    row.append(label2);
    if (value !== null) {
      row.append(objectLevel(value));
    } else if (onSelect) {
      row.append(icon("chevron-right"));
    }
    return row;
  }
  function wireEndpoints(wire, result, onInspectEndpoint) {
    const section = objectSection("\u5BFC\u7EBF\u7AEF\u70B9");
    const list = node("ul", "", "object-network-list wire-endpoints");
    for (const endpoint of [wire.from, wire.to]) {
      const value = readEndpoint(result, endpoint);
      const label2 = endpointLabel(endpoint);
      const action = onInspectEndpoint.bind(null, endpoint);
      list.append(networkRow(label2, endpoint, value, action));
    }
    section.append(list);
    return section;
  }
  function networkDrivers(result, root) {
    const section = objectSection("\u9A71\u52A8\u6765\u6E90");
    const drivers = result.drivers[root];
    if (!drivers || drivers.length === 0) {
      section.append(node("p", "\u65E0\u6709\u6548\u9A71\u52A8", "object-empty"));
      return section;
    }
    const list = node("ul", "", "object-network-list");
    for (const driver of drivers) {
      list.append(networkRow(driver.source, "", driver.value));
    }
    section.append(list);
    return section;
  }
  function networkMembers(project, result, root, wireId, onInspectWire) {
    const section = objectSection("\u540C\u7F51\u8FDE\u63A5");
    const list = node("ul", "", "object-network-list");
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        const hole = pinHole(chip, pin);
        if (nodeFor(result.topology, hole) === root) {
          const name = chip.id + "-" + pin + " \xB7 " + model.labels[pin];
          list.append(networkRow(name, chip.model, null));
        }
      }
    }
    for (const wire of project.wires) {
      if (wire.id !== wireId && nodeFor(result.topology, wire.from) === root) {
        const route = endpointLabel(wire.from) + " \u2192 " + endpointLabel(wire.to);
        const action = onInspectWire.bind(null, wire.id);
        list.append(networkRow(wire.id, route, null, action));
      }
    }
    if (list.childElementCount === 0) {
      section.append(node("p", "\u6CA1\u6709\u5176\u4ED6\u5BFC\u7EBF\u6216\u82AF\u7247\u811A", "object-empty"));
    } else {
      section.append(list);
    }
    return section;
  }
  function appendNetworkDetails(container, state2, endpoint, wireId, onInspectWire) {
    const result = state2.result;
    const root = nodeFor(result.topology, endpoint);
    container.append(networkDrivers(result, root));
    container.append(networkMembers(state2.project, result, root, wireId, onInspectWire));
  }

  // src/simulation/timing-trace.mjs
  var TRACE_LIMITS = { signals: 8, changes: 200 };
  var BOARD_SIGNALS = ["P+", "P-"];
  var DEFAULT_SIGNALS = [
    { label: "P-", endpoint: "P-", group: "\u8109\u51B2" },
    { label: "K0", endpoint: "K0", group: "\u8F93\u5165 K" },
    { label: "L0", endpoint: "L0", group: "\u8F93\u51FA L" }
  ];
  function createTimingTrace() {
    return {
      signals: DEFAULT_SIGNALS.slice(),
      samples: [],
      recording: false,
      notice: "\u5C1A\u672A\u8BB0\u5F55",
      revision: 0
    };
  }
  function availableTimingSignals(project) {
    const signals = [];
    for (const name of BOARD_SIGNALS) {
      signals.push({ label: name, endpoint: name, group: "\u8109\u51B2" });
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      signals.push({ label: "K" + bit, endpoint: "K" + bit, group: "\u8F93\u5165 K" });
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      signals.push({ label: "L" + bit, endpoint: "L" + bit, group: "\u8F93\u51FA L" });
    }
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (model.labels[pin] === "NC" || pin === model.power || pin === model.ground) {
          continue;
        }
        let label2 = chip.id + " \xB7 " + pin + "\u811A";
        if (model.labels[pin] !== "") {
          label2 = label2 + " " + model.labels[pin];
        }
        signals.push({ label: label2, endpoint: pinHole(chip, pin), group: chip.id + " \xB7 " + chip.model });
      }
    }
    return signals;
  }
  function readTimingSnapshot(trace, result) {
    const values = {};
    for (const signal of trace.signals) {
      values[signal.endpoint] = readEndpoint(result, signal.endpoint);
    }
    return values;
  }
  function addTimingSignal(trace, signal) {
    if (trace.recording || trace.signals.length >= TRACE_LIMITS.signals) {
      return false;
    }
    for (const current of trace.signals) {
      if (current.endpoint === signal.endpoint) {
        return false;
      }
    }
    trace.signals = trace.signals.concat(signal);
    clearTimingTrace(trace, "\u4FE1\u53F7\u5DF2\u66F4\u6539\uFF0C\u539F\u8BB0\u5F55\u5DF2\u6E05\u9664");
    return true;
  }
  function removeTimingSignal(trace, endpoint) {
    if (trace.recording) {
      return false;
    }
    const kept = [];
    for (const signal of trace.signals) {
      if (signal.endpoint !== endpoint) {
        kept.push(signal);
      }
    }
    if (kept.length === trace.signals.length) {
      return false;
    }
    trace.signals = kept;
    clearTimingTrace(trace, "\u4FE1\u53F7\u5DF2\u66F4\u6539\uFF0C\u539F\u8BB0\u5F55\u5DF2\u6E05\u9664");
    return true;
  }
  function resetTimingCircuit(trace, project, notice) {
    const available2 = availableTimingSignals(project);
    const kept = [];
    for (const signal of trace.signals) {
      for (const candidate of available2) {
        if (candidate.endpoint === signal.endpoint && candidate.label === signal.label && candidate.group === signal.group) {
          kept.push(signal);
          break;
        }
      }
    }
    trace.signals = kept;
    clearTimingTrace(trace, notice);
  }
  function startTimingTrace(trace, result) {
    if (trace.recording || trace.signals.length === 0) {
      return false;
    }
    trace.samples = [];
    trace.recording = true;
    trace.notice = "\u6B63\u5728\u8BB0\u5F55";
    const values = readTimingSnapshot(trace, result);
    appendTimingSample(trace, values, "\u521D\u59CB\u7535\u5E73");
    return true;
  }
  function stopTimingTrace(trace) {
    trace.recording = false;
    trace.notice = "\u8BB0\u5F55\u5DF2\u505C\u6B62";
    trace.revision = trace.revision + 1;
  }
  function clearTimingTrace(trace, notice = "\u5C1A\u672A\u8BB0\u5F55") {
    const hadSamples = trace.samples.length > 0;
    trace.recording = false;
    trace.samples = [];
    trace.notice = "\u5C1A\u672A\u8BB0\u5F55";
    if (hadSamples) {
      trace.notice = notice;
    }
    trace.revision = trace.revision + 1;
  }
  function appendTimingSample(trace, values, action) {
    const sample = { values, action };
    trace.samples.push(sample);
    trace.revision = trace.revision + 1;
  }
  function captureTimingTrace(trace, result, action) {
    if (!trace.recording || trace.samples.length === 0) {
      return;
    }
    const previous = trace.samples[trace.samples.length - 1];
    const currentValues = readTimingSnapshot(trace, result);
    let changed = false;
    for (const signal of trace.signals) {
      const previousValue = previous.values[signal.endpoint];
      const currentValue = currentValues[signal.endpoint];
      if (previousValue !== currentValue) {
        changed = true;
        break;
      }
    }
    if (!changed) {
      return;
    }
    appendTimingSample(trace, currentValues, action);
    if (trace.samples.length - 1 >= TRACE_LIMITS.changes) {
      trace.recording = false;
      trace.notice = "\u672C\u8F6E\u8BB0\u5F55\u5DF2\u8FBE\u5230 " + TRACE_LIMITS.changes + " \u6B21\u53D8\u5316\u4E0A\u9650";
    }
  }
  function timingEdge(previous, current) {
    if (previous === 0 && current === 1) {
      return "\u2191";
    }
    if (previous === 1 && current === 0) {
      return "\u2193";
    }
    return "";
  }

  // src/ui/image-export.mjs
  var RASTER = { scale: 2, maxSide: 16384, maxPixels: 16e6 };
  var IMAGE_TYPES = { png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };
  var JPG_QUALITY = 0.95;
  var SVG_PROPERTIES = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-dasharray",
    "stroke-linecap",
    "stroke-linejoin",
    "font-family",
    "font-size",
    "font-weight",
    "text-anchor",
    "dominant-baseline",
    "opacity",
    "paint-order"
  ];
  function createExportPalette() {
    const canvas2 = document.createElement("canvas");
    canvas2.width = 1;
    canvas2.height = 1;
    const context = canvas2.getContext("2d", { willReadFrequently: true });
    return { context, colors: /* @__PURE__ */ new Map() };
  }
  function exportPaint(palette, color) {
    if (color === "none") {
      return color;
    }
    if (!palette.colors.has(color)) {
      const context = palette.context;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const channels = pixel[0] + ", " + pixel[1] + ", " + pixel[2];
      let paint = "rgb(" + channels + ")";
      if (pixel[3] === 0) {
        paint = "none";
      } else if (pixel[3] < 255) {
        const alpha = pixel[3] / 255;
        paint = "rgba(" + channels + ", " + alpha + ")";
      }
      palette.colors.set(color, paint);
    }
    return palette.colors.get(color);
  }
  function copyShapeStyle(source, copy, palette) {
    const style = getComputedStyle(source);
    for (const property of SVG_PROPERTIES) {
      let value = style.getPropertyValue(property);
      if (property === "fill" || property === "stroke") {
        if (value.toLowerCase() === "currentcolor") {
          value = style.color;
        }
        value = exportPaint(palette, value);
      }
      copy.setAttribute(property, value);
    }
    copy.removeAttribute("tabindex");
    copy.removeAttribute("role");
  }
  function copyStyledSvg(source, palette) {
    const copy = source.cloneNode(true);
    copy.removeAttribute("style");
    copyShapeStyle(source, copy, palette);
    const originals = source.querySelectorAll("*");
    const copies = copy.querySelectorAll("*");
    for (let index = 0; index < originals.length; index = index + 1) {
      copyShapeStyle(originals[index], copies[index], palette);
    }
    return copy;
  }
  async function rasterizeSvg(file, width, height) {
    const areaScale = Math.sqrt(RASTER.maxPixels / (width * height));
    const sideScale = RASTER.maxSide / Math.max(width, height);
    const scale = Math.min(RASTER.scale, areaScale, sideScale);
    const canvas2 = document.createElement("canvas");
    canvas2.width = Math.max(1, Math.floor(width * scale));
    canvas2.height = Math.max(1, Math.floor(height * scale));
    const address = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = address;
      await image.decode();
      const context = canvas2.getContext("2d");
      context.drawImage(image, 0, 0, canvas2.width, canvas2.height);
      return canvas2;
    } finally {
      URL.revokeObjectURL(address);
    }
  }
  function encodeCanvas(canvas2, type) {
    function encode(resolve, reject) {
      function receive(blob) {
        if (!blob || blob.type !== type) {
          reject(new Error("\u6D4F\u89C8\u5668\u65E0\u6CD5\u751F\u6210\u6240\u9009\u56FE\u7247\u683C\u5F0F"));
          return;
        }
        resolve(blob);
      }
      canvas2.toBlob(receive, type, JPG_QUALITY);
    }
    return new Promise(encode);
  }
  async function encodeCanvasImage(canvas2, format) {
    let source = canvas2;
    if (format === "jpg") {
      source = document.createElement("canvas");
      source.width = canvas2.width;
      source.height = canvas2.height;
      const context = source.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, source.width, source.height);
      context.drawImage(canvas2, 0, 0);
    }
    return encodeCanvas(source, IMAGE_TYPES[format]);
  }
  async function encodeSvgImage(svg2, format) {
    const serializer = new XMLSerializer();
    const text2 = serializer.serializeToString(svg2);
    const file = new Blob([text2], { type: IMAGE_TYPES.svg + ";charset=utf-8" });
    if (format === "svg") {
      return file;
    }
    const width = Number(svg2.getAttribute("width"));
    const height = Number(svg2.getAttribute("height"));
    const canvas2 = await rasterizeSvg(file, width, height);
    return encodeCanvasImage(canvas2, format);
  }

  // src/ui/timing-export.mjs
  var SHEET = { margin: 12, titleHeight: 28, axisHeight: 24, footerHeight: 24, labelWidth: 168, minWidth: 376 };
  function csvRow(values) {
    const fields = [];
    for (const value of values) {
      const text2 = String(value);
      if (/[",\r\n]/.test(text2)) {
        const escaped = text2.replaceAll('"', '""');
        fields.push('"' + escaped + '"');
      } else {
        fields.push(text2);
      }
    }
    return fields.join(",");
  }
  function createTimingCsv(trace) {
    const headers = ["\u4E8B\u4EF6\u5E8F\u53F7", "\u64CD\u4F5C"];
    for (const signal of trace.signals) {
      headers.push(signal.label);
    }
    const rows = [csvRow(headers)];
    for (let index = 0; index < trace.samples.length; index = index + 1) {
      const sample = trace.samples[index];
      const row = [index, sample.action];
      for (const signal of trace.signals) {
        row.push(sample.values[signal.endpoint]);
      }
      rows.push(csvRow(row));
    }
    const content = rows.join("\r\n") + "\r\n";
    return new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  }
  function sheetStyle(lanes, palette) {
    const style = getComputedStyle(lanes);
    const firstLane = lanes.firstElementChild;
    const grid = firstLane.querySelector(".timing-wave-grid");
    const gridStyle = getComputedStyle(grid);
    return {
      ink: exportPaint(palette, style.getPropertyValue("--color-ink").trim()),
      background: exportPaint(palette, style.getPropertyValue("--color-surface").trim()),
      divider: exportPaint(palette, gridStyle.stroke),
      font: style.getPropertyValue("--font-mono").trim()
    };
  }
  function placeSvg(sheet, source, horizontal, vertical, palette) {
    const copy = copyStyledSvg(source, palette);
    copy.setAttribute("x", String(horizontal));
    copy.setAttribute("y", String(vertical));
    const selection = copy.querySelector(".timing-wave-selected");
    if (selection) {
      selection.remove();
    }
    sheet.append(copy);
  }
  function drawSheetLanes(sheet, lanes, trace, size, palette, style) {
    const bodyTop = SHEET.margin + SHEET.titleHeight + SHEET.axisHeight;
    for (let index = 0; index < trace.signals.length; index = index + 1) {
      const lane = lanes.children[index];
      const top = bodyTop + index * size.rowHeight;
      const middle = top + size.rowHeight / 2;
      const wave = lane.querySelector(":scope > svg");
      const levelScale = lane.querySelector(".timing-level-scale");
      const scaleWidth = Number(levelScale.getAttribute("width"));
      svgElement(sheet, "text", {
        x: SHEET.margin,
        y: middle,
        "dominant-baseline": "central",
        "font-size": 11
      }, trace.signals[index].label);
      placeSvg(sheet, levelScale, size.waveStart - scaleWidth, top, palette);
      placeSvg(sheet, wave, size.waveStart, top, palette);
      const rowEnd = top + size.rowHeight;
      svgElement(sheet, "line", {
        x1: SHEET.margin,
        y1: rowEnd,
        x2: size.waveEnd,
        y2: rowEnd,
        stroke: style.divider
      });
    }
  }
  function buildTimingSheet(lanes, trace) {
    const firstWave = lanes.querySelector(".timing-lane > svg");
    const waveWidth = Number(firstWave.getAttribute("width"));
    const rowHeight = Number(firstWave.getAttribute("height"));
    const waveStart = SHEET.margin + SHEET.labelWidth;
    const waveEnd = waveStart + waveWidth;
    const width = Math.max(SHEET.minWidth, waveEnd + SHEET.margin);
    const bodyTop = SHEET.margin + SHEET.titleHeight + SHEET.axisHeight;
    const bodyBottom = bodyTop + trace.signals.length * rowHeight;
    const height = bodyBottom + SHEET.footerHeight + SHEET.margin;
    const palette = createExportPalette();
    const style = sheetStyle(lanes, palette);
    const sheet = document.createElementNS(SVG_NAMESPACE, "svg");
    sheet.setAttribute("xmlns", SVG_NAMESPACE);
    sheet.setAttribute("width", String(width));
    sheet.setAttribute("height", String(height));
    sheet.setAttribute("viewBox", "0 0 " + width + " " + height);
    sheet.setAttribute("font-family", style.font);
    sheet.setAttribute("fill", style.ink);
    svgElement(sheet, "title", {}, "\u6570\u5B57\u65F6\u5E8F\u6CE2\u5F62");
    svgElement(sheet, "rect", { width, height, fill: style.background });
    svgElement(sheet, "text", { x: SHEET.margin, y: SHEET.margin + 15, "font-size": 15, "font-weight": 600 }, "\u6570\u5B57\u65F6\u5E8F\u6CE2\u5F62");
    const axisLabelHeight = bodyTop - 7;
    svgElement(sheet, "text", { x: SHEET.margin, y: axisLabelHeight, "font-size": 11 }, "\u4E8B\u4EF6\u5E8F\u53F7\uFF08\u975E\u5B9E\u7269\u65F6\u95F4\uFF09");
    const step = waveWidth / trace.samples.length;
    for (let index = 0; index < trace.samples.length; index = index + 1) {
      const center = waveStart + (index + 0.5) * step;
      svgElement(sheet, "text", { x: center, y: axisLabelHeight, "font-size": 11, "text-anchor": "middle" }, String(index));
    }
    const size = { rowHeight, waveStart, waveEnd };
    drawSheetLanes(sheet, lanes, trace, size, palette, style);
    svgElement(sheet, "line", { x1: SHEET.margin, y1: bodyTop, x2: waveEnd, y2: bodyTop, stroke: style.divider });
    svgElement(sheet, "line", { x1: waveStart, y1: bodyTop, x2: waveStart, y2: bodyBottom, stroke: style.divider });
    svgElement(sheet, "text", { x: SHEET.margin, y: bodyBottom + 19, "font-size": 11 }, "0 \u4F4E\u7535\u5E73 \xB7 1 \u9AD8\u7535\u5E73 \xB7 X \u672A\u77E5 \xB7 Z \u9AD8\u963B");
    return sheet;
  }
  function encodeTimingTrace(lanes, trace, format) {
    if (trace.samples.length === 0) {
      throw new Error("\u5C1A\u672A\u5F55\u5236\u6CE2\u5F62");
    }
    if (format === "csv") {
      return createTimingCsv(trace);
    }
    const sheet = buildTimingSheet(lanes, trace);
    return encodeSvgImage(sheet, format);
  }

  // desktop/export-formats.mjs
  var EXPORT_FILES = {
    circuit: { title: "\u5BFC\u51FA\u7535\u8DEF", name: "breadboard-circuit", formats: ["json", "png", "jpg"] },
    workspace: { title: "\u5BFC\u51FA\u5168\u90E8\u5DF2\u4FDD\u5B58\u5B9E\u9A8C", name: "breadboard-workspace", formats: ["json"] },
    board: { title: "\u5BFC\u51FA\u63A5\u7EBF\u56FE", name: "breadboard-wiring", formats: ["png", "jpg"] },
    logic: { title: "\u5BFC\u51FA\u903B\u8F91\u56FE", name: "breadboard-logic", formats: ["svg", "png"] },
    timing: { title: "\u5BFC\u51FA\u6CE2\u5F62", name: "breadboard-timing", formats: ["svg", "png", "csv"] }
  };
  var EXPORT_FORMATS = {
    json: { label: "JSON \u7535\u8DEF\u5B58\u6863\uFF08\u53EF\u91CD\u65B0\u5BFC\u5165\uFF09", mime: "application/json", extensions: ["json"] },
    png: { label: "PNG \u56FE\u7247", mime: "image/png", extensions: ["png"] },
    jpg: { label: "JPEG \u56FE\u7247", mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
    svg: { label: "SVG \u77E2\u91CF\u56FE", mime: "image/svg+xml", extensions: ["svg"] },
    csv: { label: "CSV \u65F6\u5E8F\u6570\u636E", mime: "text/csv", extensions: ["csv"] }
  };
  function exportFormatForName(filename, formats) {
    const extensionStart = filename.lastIndexOf(".") + 1;
    if (extensionStart > 0) {
      const extension = filename.slice(extensionStart).toLowerCase();
      for (const format of formats) {
        if (EXPORT_FORMATS[format].extensions.includes(extension)) {
          return format;
        }
      }
    }
    return "";
  }

  // src/ui/export-dialog.mjs
  var pendingExport = null;
  var saving = false;
  function openDownloadDialog(file, createFile) {
    const dialog = element("export-dialog");
    if (dialog.open) {
      return;
    }
    element("export-title").textContent = file.title;
    const picker = element("export-format");
    picker.replaceChildren();
    for (const format of file.formats) {
      const option = node("option", format.toUpperCase(), "");
      option.value = format;
      picker.append(option);
    }
    pendingExport = { file, createFile };
    const trigger = refreshSelect(picker);
    dialog.showModal();
    trigger.focus();
  }
  function cancelExport() {
    pendingExport = null;
    element("export-dialog").close();
  }
  async function downloadExport(file, format, createFile) {
    const blob = await createFile(format);
    downloadFile(blob, file.name + "." + format);
  }
  async function saveDesktopExport(bridge, kind, createFile) {
    const selected = await bridge.choose(kind);
    if (!selected) {
      return;
    }
    let content;
    try {
      const blob = await createFile(selected.format);
      content = await blob.arrayBuffer();
    } catch (error) {
      await bridge.discard(selected.ticket);
      throw error;
    }
    await bridge.write(selected.ticket, content);
  }
  function browserFileTypes(formats) {
    const types = [];
    for (const format of formats) {
      const entry = EXPORT_FORMATS[format];
      const extensions = [];
      for (const extension of entry.extensions) {
        extensions.push("." + extension);
      }
      const accept = {};
      accept[entry.mime] = extensions;
      types.push({ description: entry.label, accept });
    }
    return types;
  }
  async function saveBrowserExport(file, createFile) {
    const defaultFormat = file.formats[0];
    let handle;
    try {
      handle = await window.showSaveFilePicker({
        suggestedName: file.name + "." + defaultFormat,
        types: browserFileTypes(file.formats),
        excludeAcceptAllOption: true
      });
    } catch (error) {
      if (error.name === "SecurityError") {
        return false;
      }
      throw error;
    }
    const format = exportFormatForName(handle.name, file.formats);
    if (!format) {
      throw new Error("\u6587\u4EF6\u6269\u5C55\u540D\u4E0E\u652F\u6301\u7684\u683C\u5F0F\u4E0D\u5339\u914D");
    }
    const content = await createFile(format);
    const output = await handle.createWritable();
    await output.write(content);
    await output.close();
    return true;
  }
  function reportExportError(error) {
    const message = "\u5BFC\u51FA\u5931\u8D25\uFF1A" + error.message;
    if (element("logic-diagram-dialog").open) {
      const notice = element("logic-export-error");
      notice.textContent = message;
      notice.hidden = false;
    } else {
      showToast(message, "error");
    }
  }
  async function requestExport(kind, createFile) {
    if (saving) {
      return;
    }
    const file = EXPORT_FILES[kind];
    const bridge = window.breadboardExport;
    saving = true;
    element("logic-export-error").hidden = true;
    try {
      if (bridge) {
        await saveDesktopExport(bridge, kind, createFile);
      } else if (typeof window.showSaveFilePicker === "function") {
        const supported = await saveBrowserExport(file, createFile);
        if (!supported) {
          openDownloadDialog(file, createFile);
        }
      } else {
        openDownloadDialog(file, createFile);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        reportExportError(error);
      }
    } finally {
      saving = false;
    }
  }
  async function confirmExport(event) {
    event.preventDefault();
    const request = pendingExport;
    const format = element("export-format").value;
    cancelExport();
    if (request && request.file.formats.includes(format)) {
      try {
        await downloadExport(request.file, format, request.createFile);
      } catch (error) {
        reportExportError(error);
      }
    }
  }
  function bindExportDialog() {
    element("export-form").addEventListener("submit", confirmExport);
    element("export-cancel").addEventListener("click", cancelExport);
    element("export-dialog").addEventListener("cancel", cancelExport);
  }
  function bindFileExport(buttonId, kind, createFile) {
    const button = element(buttonId);
    const open = requestExport.bind(null, kind, createFile);
    button.addEventListener("click", open);
  }

  // src/ui/timing-panel.mjs
  var WAVE = { step: 44, height: 32, high: 8, low: 24, middle: 16, scaleWidth: 20, tickLength: 6, valueOffset: 16, valueHeight: 13 };
  var available = [];
  var renderedTrace = null;
  var renderedRevision = -1;
  var renderedSignature = null;
  var renderedSignals = null;
  var selectedEvent = -1;
  var followLatest = true;
  function renderSignalPicker() {
    const picker = element("timing-signal");
    const groups = /* @__PURE__ */ new Map();
    picker.replaceChildren();
    for (const signal of available) {
      let group = groups.get(signal.group);
      if (!group) {
        group = document.createElement("optgroup");
        group.label = signal.group;
        groups.set(signal.group, group);
        picker.append(group);
      }
      const option = node("option", signal.label, "");
      option.value = signal.endpoint;
      group.append(option);
    }
  }
  function updateSignalPicker(trace, optionsChanged) {
    const order = /* @__PURE__ */ new Map();
    for (let index = 0; index < trace.signals.length; index = index + 1) {
      order.set(trace.signals[index].endpoint, index + 1);
    }
    const picker = element("timing-signal");
    const full = trace.signals.length >= TRACE_LIMITS.signals;
    for (const option of picker.options) {
      option.selected = order.has(option.value);
      option.disabled = full && !option.selected;
      option.dataset.order = "";
      if (option.selected) {
        option.dataset.order = String(order.get(option.value));
      }
    }
    picker.disabled = trace.recording || picker.options.length === 0;
    refreshSelect(picker, optionsChanged);
  }
  function renderSignals(trace) {
    const list = element("timing-signals");
    list.replaceChildren();
    for (let index = 0; index < trace.signals.length; index = index + 1) {
      const signal = trace.signals[index];
      const item = node("li", "", "");
      const button = node("button", "", "icon-button");
      const label2 = "\u79FB\u9664 " + signal.label;
      button.type = "button";
      button.dataset.endpoint = signal.endpoint;
      button.setAttribute("aria-label", label2);
      button.title = label2;
      button.append(icon("x"));
      const order = node("span", String(index + 1), "timing-order");
      order.setAttribute("aria-hidden", "true");
      item.append(order, node("span", signal.label, "timing-signal-name"), button);
      list.append(item);
    }
    element("timing-signal-count").textContent = trace.signals.length + " / " + TRACE_LIMITS.signals;
    refreshIcons();
  }
  function waveHeight(value) {
    if (value === 1) {
      return WAVE.high;
    }
    if (value === 0) {
      return WAVE.low;
    }
    return WAVE.middle;
  }
  function drawLaneLabel(row, signal) {
    const column = node("div", "", "timing-lane-label timing-lane-heading");
    const label2 = node("span", signal.label, "timing-lane-name");
    label2.title = signal.label;
    column.append(label2);
    row.append(column);
    const scale = svgElement(column, "svg", { width: WAVE.scaleWidth, height: WAVE.height, class: "timing-level-scale" });
    const tickStart = WAVE.scaleWidth - WAVE.tickLength;
    const textCenter = tickStart / 2;
    for (const level of [1, 0]) {
      const height = waveHeight(level);
      svgElement(scale, "text", { x: textCenter, y: height, "dominant-baseline": "central", "text-anchor": "middle" }, String(level));
      svgElement(scale, "line", { x1: tickStart, y1: height, x2: WAVE.scaleWidth, y2: height });
    }
  }
  function drawSignalLane(container, trace, signal) {
    const row = node("div", "", "timing-lane");
    drawLaneLabel(row, signal);
    container.append(row);
    const width = trace.samples.length * WAVE.step;
    const svg2 = svgElement(row, "svg", { width, height: WAVE.height });
    svgElement(svg2, "rect", { width: WAVE.step, height: WAVE.height, class: "timing-wave-selected" });
    const paths = { grid: "", digital: "", X: "", Z: "" };
    let previous = null;
    for (let index = 0; index < trace.samples.length; index = index + 1) {
      const position = index * WAVE.step;
      const value = trace.samples[index].values[signal.endpoint];
      const height = waveHeight(value);
      if (index > 0) {
        paths.grid = paths.grid + "M" + position + " 0V" + WAVE.height;
      }
      const segment = "M" + position + " " + height + "h" + WAVE.step;
      if (value === "X" || value === "Z") {
        paths[value] = paths[value] + segment;
        const valuePosition = position + WAVE.valueOffset;
        svgElement(svg2, "text", { x: valuePosition, y: WAVE.valueHeight, class: "timing-wave-value" }, value);
      } else {
        paths.digital = paths.digital + segment;
        if (timingEdge(previous, value) !== "") {
          paths.digital = paths.digital + "M" + position + " " + waveHeight(previous) + "V" + height;
        }
      }
      previous = value;
    }
    svgElement(svg2, "path", { d: paths.grid, class: "timing-wave-grid" });
    svgElement(svg2, "path", { d: paths.digital, class: "timing-wave-line" });
    svgElement(svg2, "path", { d: paths.X, class: "timing-wave-line timing-wave-x" });
    svgElement(svg2, "path", { d: paths.Z, class: "timing-wave-line timing-wave-z" });
  }
  function eventMark(trace, index) {
    if (index === 0) {
      return "";
    }
    const before = trace.samples[index - 1].values;
    const after = trace.samples[index].values;
    let rising = "";
    let falling = "";
    for (const signal of trace.signals) {
      const edge = timingEdge(before[signal.endpoint], after[signal.endpoint]);
      if (edge === "\u2191") {
        rising = edge;
      } else if (edge === "\u2193") {
        falling = edge;
      }
    }
    return rising + falling;
  }
  function showEvent(trace) {
    const detail = element("timing-detail");
    const sample = trace.samples[selectedEvent];
    detail.hidden = !sample;
    if (!sample) {
      return;
    }
    const offset = selectedEvent * WAVE.step;
    for (const mark of element("timing-lanes").querySelectorAll(".timing-wave-selected")) {
      mark.setAttribute("x", String(offset));
    }
    for (const button of element("timing-events").querySelectorAll("button")) {
      const active = Number(button.dataset.event) === selectedEvent;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = -1;
      if (active) {
        button.tabIndex = 0;
      }
    }
    element("timing-event-title").textContent = "#" + selectedEvent + " \xB7 " + sample.action;
    const values = element("timing-values");
    values.replaceChildren();
    for (const signal of trace.signals) {
      const after = sample.values[signal.endpoint];
      let before = "\u2014";
      if (selectedEvent > 0) {
        before = trace.samples[selectedEvent - 1].values[signal.endpoint];
      }
      const row = document.createElement("tr");
      const name = node("th", signal.label, "");
      name.scope = "row";
      let edge = timingEdge(before, after);
      if (edge === "") {
        edge = "\u2014";
      }
      row.append(name, node("td", String(before), ""), node("td", String(after), ""), node("td", edge, ""));
      if (selectedEvent > 0 && before !== after) {
        row.classList.add("timing-value-changed");
      }
      values.append(row);
    }
  }
  function renderWave(trace) {
    const chart = element("timing-chart");
    const lanes = element("timing-lanes");
    const events = element("timing-events");
    const focused = events.contains(document.activeElement);
    const count = trace.samples.length;
    element("timing-empty").hidden = count > 0;
    lanes.replaceChildren();
    events.replaceChildren();
    if (count === 0) {
      selectedEvent = -1;
      followLatest = true;
      showEvent(trace);
      return;
    }
    for (const signal of trace.signals) {
      drawSignalLane(lanes, trace, signal);
    }
    events.append(node("span", "\u5E8F\u53F7", "timing-lane-label"));
    for (let index = 0; index < count; index = index + 1) {
      const label2 = eventMark(trace, index);
      const button = node("button", index + label2, "timing-event");
      button.type = "button";
      button.dataset.event = String(index);
      const description = "\u4E8B\u4EF6 " + index + "\uFF1A" + trace.samples[index].action;
      button.title = description;
      button.setAttribute("aria-label", description);
      events.append(button);
    }
    if (followLatest || selectedEvent < 0 || selectedEvent >= count) {
      selectedEvent = count - 1;
      chart.scrollLeft = chart.scrollWidth;
    }
    showEvent(trace);
    if (focused) {
      const selected = events.querySelector("[tabindex='0']");
      selected.focus({ preventScroll: true });
    }
  }
  function renderTimingPanel(state2) {
    const trace = state2.timing;
    const signature = state2.result.signature;
    const circuitChanged = trace !== renderedTrace || signature !== renderedSignature;
    if (circuitChanged) {
      available = availableTimingSignals(state2.project);
      renderSignalPicker();
    }
    if (circuitChanged || trace.signals !== renderedSignals) {
      renderSignals(trace);
      renderedSignals = trace.signals;
    }
    if (!circuitChanged && trace.revision === renderedRevision) {
      return;
    }
    renderedTrace = trace;
    renderedSignature = signature;
    renderedRevision = trace.revision;
    updateSignalPicker(trace, circuitChanged);
    element("timing-start").disabled = trace.recording || trace.signals.length === 0;
    const startLabel = element("timing-start-label");
    startLabel.textContent = "\u5F00\u59CB";
    if (!trace.recording && trace.samples.length > 0) {
      startLabel.textContent = "\u91CD\u65B0\u8BB0\u5F55";
    }
    element("timing-stop").disabled = !trace.recording;
    element("timing-clear").disabled = trace.recording || trace.samples.length === 0;
    element("timing-export").disabled = trace.samples.length === 0;
    for (const button of element("timing-signals").querySelectorAll("button")) {
      button.disabled = trace.recording;
    }
    const status = element("timing-status");
    status.textContent = trace.notice;
    status.classList.toggle("timing-recording", trace.recording);
    renderWave(trace);
  }
  function changeSignals(state2) {
    const trace = state2.timing;
    const picker = element("timing-signal");
    const selected = /* @__PURE__ */ new Set();
    for (const option of picker.selectedOptions) {
      selected.add(option.value);
    }
    for (const signal of trace.signals) {
      if (!selected.has(signal.endpoint)) {
        removeTimingSignal(trace, signal.endpoint);
      }
    }
    for (const signal of available) {
      if (selected.has(signal.endpoint)) {
        addTimingSignal(trace, signal);
      }
    }
    renderTimingPanel(state2);
  }
  function removeSignal(state2, event) {
    const button = event.target.closest("button[data-endpoint]");
    if (button && removeTimingSignal(state2.timing, button.dataset.endpoint)) {
      renderTimingPanel(state2);
      element("timing-signal-trigger").focus();
    }
  }
  function startRecording(state2) {
    if (startTimingTrace(state2.timing, state2.result)) {
      followLatest = true;
      renderTimingPanel(state2);
      element("timing-stop").focus();
    }
  }
  function stopRecording(state2) {
    stopTimingTrace(state2.timing);
    renderTimingPanel(state2);
    element("timing-start").focus();
  }
  function clearRecording(state2) {
    clearTimingTrace(state2.timing);
    renderTimingPanel(state2);
    element("timing-start").focus();
  }
  function createTimingFile(state2, format) {
    const lanes = element("timing-lanes");
    return encodeTimingTrace(lanes, state2.timing, format);
  }
  function clickWave(state2, event) {
    const button = event.target.closest(".timing-event");
    const svg2 = event.target.closest(".timing-lane > svg");
    let index = -1;
    if (button) {
      index = Number(button.dataset.event);
    } else if (svg2) {
      const bounds = svg2.getBoundingClientRect();
      index = Math.floor((event.clientX - bounds.left) / WAVE.step);
    }
    if (index >= 0 && index < state2.timing.samples.length) {
      followLatest = false;
      selectedEvent = index;
      showEvent(state2.timing);
    }
  }
  function moveEvent(state2, event) {
    const button = event.target.closest(".timing-event");
    if (!button) {
      return;
    }
    const last = state2.timing.samples.length - 1;
    let index = Number(button.dataset.event);
    if (event.key === "ArrowLeft") {
      index = Math.max(0, index - 1);
    } else if (event.key === "ArrowRight") {
      index = Math.min(last, index + 1);
    } else if (event.key === "Home") {
      index = 0;
    } else if (event.key === "End") {
      index = last;
    } else {
      return;
    }
    event.preventDefault();
    followLatest = false;
    selectedEvent = index;
    showEvent(state2.timing);
    const selected = element("timing-events").querySelector("[tabindex='0']");
    selected.focus();
  }
  function bindTimingPanel(state2) {
    element("timing-panel").style.setProperty("--timing-step", WAVE.step + "px");
    element("timing-signal").addEventListener("change", changeSignals.bind(null, state2));
    element("timing-signals").addEventListener("click", removeSignal.bind(null, state2));
    element("timing-start").addEventListener("click", startRecording.bind(null, state2));
    element("timing-stop").addEventListener("click", stopRecording.bind(null, state2));
    element("timing-clear").addEventListener("click", clearRecording.bind(null, state2));
    const createFile = createTimingFile.bind(null, state2);
    bindFileExport("timing-export", "timing", createFile);
    element("timing-chart").addEventListener("click", clickWave.bind(null, state2));
    element("timing-events").addEventListener("keydown", moveEvent.bind(null, state2));
  }

  // src/ui/board-io.mjs
  var BINARY_GROUP_SIZE = 4;
  function createInputControl(bit, onToggle) {
    const name = "K" + bit;
    const wrapper = node("div", "", "quick-input");
    const label2 = node("span", name, "quick-port-label");
    const led = node("span", "", "io-led");
    led.dataset.inputLed = String(bit);
    led.setAttribute("role", "img");
    const button = node("button", "0", "bit-button");
    button.dataset.bit = String(bit);
    button.setAttribute("aria-label", "\u5207\u6362 " + name);
    button.addEventListener("click", onToggle.bind(null, bit));
    wrapper.append(label2, led, button);
    return wrapper;
  }
  function ensureInputControls(count, onToggle) {
    const container = element("quick-switches");
    if (container.children.length === count) {
      return;
    }
    container.replaceChildren();
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
      container.append(createInputControl(bit, onToggle));
    }
  }
  function setLedState(led, name, value) {
    const text2 = name + "\uFF1A" + value;
    led.classList.toggle("on", value === 1);
    led.dataset.value = String(value);
    led.setAttribute("aria-label", text2);
    led.title = text2;
  }
  function renderInputs(project, result, onToggle, triState) {
    let count = project.inputCount;
    if (triState) {
      count = Math.max(count, TRISTATE_CONTROL + 1);
    }
    ensureInputControls(count, onToggle);
    const switches = element("quick-switches");
    let number = 0;
    for (const button of switches.querySelectorAll("button")) {
      const bit = Number(button.dataset.bit);
      const value = project.switches[bit];
      button.textContent = String(value);
      button.setAttribute("aria-pressed", String(value === 1));
      const led = button.parentElement.querySelector(".io-led");
      const name = "K" + bit;
      led.classList.toggle("weak", isWeakBoardInput(project, triState, bit));
      setLedState(led, name, readEndpoint(result, name));
      number = number * 2 + value;
    }
    element("input-decimal").textContent = String(number);
    element("input-label").textContent = "\u8F93\u5165 K" + (count - 1) + "\u2026K0";
  }
  function renderOutputLeds(count, result) {
    const container = element("output-leds");
    if (container.children.length !== count) {
      container.replaceChildren();
      for (let bit = count - 1; bit >= 0; bit = bit - 1) {
        const wrapper = node("div", "", "output-port");
        const led = node("span", "", "io-led");
        led.dataset.outputLed = String(bit);
        led.setAttribute("role", "img");
        wrapper.append(led, node("span", "L" + bit, "quick-port-label"));
        container.append(wrapper);
      }
    }
    for (const led of container.querySelectorAll("[data-output-led]")) {
      const name = "L" + led.dataset.outputLed;
      setLedState(led, name, readEndpoint(result, name));
    }
  }
  function renderOutputs(project, result) {
    const count = project.outputCount;
    let binary = "";
    let known = true;
    let number = 0;
    for (let bit = count - 1; bit >= 0; bit = bit - 1) {
      const value = readEndpoint(result, "L" + bit);
      binary = binary + String(value);
      if (bit > 0 && bit % BINARY_GROUP_SIZE === 0) {
        binary = binary + " ";
      }
      if (value !== 0 && value !== 1) {
        known = false;
      } else {
        number = number * 2 + value;
      }
    }
    element("output-label").textContent = "\u8F93\u51FA L" + (count - 1) + "\u2026L0";
    const display = element("binary-result");
    display.textContent = binary;
    display.classList.add("general-binary");
    renderOutputLeds(count, result);
    let meaning = "\u672A\u77E5 / \u60AC\u7A7A";
    if (!project.power) {
      meaning = "\u7535\u6E90\u5173\u95ED";
    } else if (known) {
      meaning = String(number);
    }
    element("result-meaning").textContent = meaning;
  }
  function inputRowWidth(switches, buttons) {
    const switchStyle = getComputedStyle(switches);
    const input = document.querySelector(".input-block");
    const inputStyle = getComputedStyle(input);
    const switchGap = Number.parseFloat(switchStyle.columnGap);
    const numberGap = Number.parseFloat(inputStyle.columnGap);
    let width = (buttons.length - 1) * switchGap;
    for (const button of buttons) {
      width = width + button.getBoundingClientRect().width;
    }
    const number = element("input-decimal");
    const numberWidth = number.getBoundingClientRect().width;
    return width + numberGap + numberWidth;
  }
  function updateIoLayout() {
    const switches = element("quick-switches");
    const buttons = switches.querySelectorAll(".quick-input");
    if (buttons.length === 0) {
      return;
    }
    const strip = document.querySelector(".io-strip");
    const stripStyle = getComputedStyle(strip);
    const paddingStart = Number.parseFloat(stripStyle.paddingInlineStart);
    const paddingEnd = Number.parseFloat(stripStyle.paddingInlineEnd);
    const groupGap = Number.parseFloat(stripStyle.columnGap);
    const inputWidth = inputRowWidth(switches, buttons);
    const settings = document.querySelector(".io-settings");
    const settingsWidth = settings.getBoundingClientRect().width;
    const output = document.querySelector(".result-block");
    const outputWidth = output.getBoundingClientRect().width;
    const pulseGroup = document.querySelector(".operation-block");
    const pulseStyle = getComputedStyle(pulseGroup);
    const pulseGap = Number.parseFloat(pulseStyle.columnGap);
    const positive = element("pulse-positive");
    const negative = element("pulse-negative");
    const positiveWidth = positive.getBoundingClientRect().width;
    const negativeWidth = negative.getBoundingClientRect().width;
    const pulseWidth = positiveWidth + negativeWidth + pulseGap;
    const requiredWidth = settingsWidth + outputWidth + inputWidth + pulseWidth + groupGap * 3;
    const availableWidth = strip.clientWidth - paddingStart - paddingEnd;
    strip.classList.toggle("pulses-stacked", requiredWidth > availableWidth);
  }
  function renderBoardIo(project, result, onToggle, triState, updateLayout = true) {
    renderInputs(project, result, onToggle, triState);
    renderOutputs(project, result);
    if (updateLayout) {
      element("input-count").value = String(project.inputCount);
      element("output-count").value = String(project.outputCount);
      updateIoLayout();
    }
  }

  // src/ui/tooltip.mjs
  var TOOLTIP = { showDelay: 800, leaveDelay: 150, gap: 8, edge: 8 };
  var tip = null;
  var anchor = null;
  var timer = 0;
  var describedAnchor = null;
  var previousDescription = null;
  function tooltipAnchor(target) {
    if (!(target instanceof Element)) {
      return null;
    }
    return target.closest("[data-tip]");
  }
  function stopTimer2() {
    window.clearTimeout(timer);
    timer = 0;
  }
  function hideTooltip() {
    stopTimer2();
    if (tip.matches(":popover-open")) {
      tip.hidePopover();
    }
    if (describedAnchor) {
      if (previousDescription === null) {
        describedAnchor.removeAttribute("aria-describedby");
      } else {
        describedAnchor.setAttribute("aria-describedby", previousDescription);
      }
    }
    describedAnchor = null;
    previousDescription = null;
    anchor = null;
  }
  function positionTooltip(trigger) {
    const bounds = trigger.getBoundingClientRect();
    const size = tip.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const centered = bounds.left + (bounds.width - size.width) / 2;
    const rightLimit = viewportWidth - TOOLTIP.edge - size.width;
    const left = Math.max(TOOLTIP.edge, Math.min(centered, rightLimit));
    const below = bounds.bottom + TOOLTIP.gap;
    const above = bounds.top - TOOLTIP.gap - size.height;
    const bottomLimit = viewportHeight - TOOLTIP.edge - size.height;
    let top = below;
    const preferAbove = trigger.hasAttribute("data-tip-click");
    if ((preferAbove || below > bottomLimit) && above >= TOOLTIP.edge) {
      top = above;
    }
    top = Math.max(TOOLTIP.edge, Math.min(top, bottomLimit));
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function showTooltip(animate = true) {
    stopTimer2();
    if (!anchor || !anchor.isConnected || anchor.getClientRects().length === 0) {
      hideTooltip();
      return;
    }
    let host = anchor.closest("dialog[open]");
    if (!host) {
      host = document.body;
    }
    if (tip.parentElement !== host) {
      host.append(tip);
    }
    tip.textContent = anchor.dataset.tip;
    tip.classList.toggle("help-tip", anchor.hasAttribute("data-tip-click"));
    tip.classList.toggle("instant-tip", !animate);
    tip.showPopover();
    positionTooltip(anchor);
    describedAnchor = anchor;
    previousDescription = anchor.getAttribute("aria-describedby");
    let description = tip.id;
    if (previousDescription) {
      description = previousDescription + " " + description;
    }
    anchor.setAttribute("aria-describedby", description);
  }
  function enterTooltip(event) {
    if (event.pointerType !== "mouse") {
      return;
    }
    if (tip.contains(event.target)) {
      stopTimer2();
      return;
    }
    const trigger = tooltipAnchor(event.target);
    if (!trigger) {
      return;
    }
    if (trigger === anchor) {
      if (tip.matches(":popover-open")) {
        stopTimer2();
      }
      return;
    }
    hideTooltip();
    anchor = trigger;
    timer = window.setTimeout(showTooltip, TOOLTIP.showDelay);
  }
  function leaveTooltip(event) {
    if (!anchor || event.pointerType !== "mouse") {
      return;
    }
    const fromTip = tip.contains(event.target);
    if (!fromTip && tooltipAnchor(event.target) !== anchor) {
      return;
    }
    if (anchor.contains(event.relatedTarget) || tip.contains(event.relatedTarget)) {
      return;
    }
    if (!tip.matches(":popover-open")) {
      hideTooltip();
      return;
    }
    const focus = document.activeElement;
    const keyboardFocus = focus && anchor.contains(focus) && focus.matches(":focus-visible");
    if (!keyboardFocus) {
      stopTimer2();
      timer = window.setTimeout(hideTooltip, TOOLTIP.leaveDelay);
    }
  }
  function focusTooltip(event) {
    const trigger = tooltipAnchor(event.target);
    if (!trigger || !event.target.matches(":focus-visible")) {
      return;
    }
    if (trigger !== anchor || !tip.matches(":popover-open")) {
      hideTooltip();
      anchor = trigger;
      showTooltip(false);
    }
  }
  function blurTooltip(event) {
    if (anchor && anchor.contains(event.target) && !anchor.contains(event.relatedTarget)) {
      hideTooltip();
    }
  }
  function clickTooltip(event) {
    const trigger = tooltipAnchor(event.target);
    if (!trigger || !trigger.hasAttribute("data-tip-click")) {
      return;
    }
    if (trigger === anchor && tip.matches(":popover-open")) {
      return;
    }
    hideTooltip();
    anchor = trigger;
    showTooltip(event.detail !== 0);
  }
  function dismissTooltip(event) {
    if (event.key !== "Escape" || !anchor) {
      return;
    }
    if (tip.matches(":popover-open")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    hideTooltip();
  }
  function closeDialogTooltip(event) {
    if (anchor && event.target.contains(anchor)) {
      hideTooltip();
    }
  }
  function bindTooltips() {
    tip = element("workbench-tooltip");
    tip.style.setProperty("--tooltip-edge", TOOLTIP.edge + "px");
    document.addEventListener("pointerover", enterTooltip);
    document.addEventListener("pointerout", leaveTooltip);
    document.addEventListener("pointerdown", hideTooltip, true);
    document.addEventListener("focusin", focusTooltip);
    document.addEventListener("focusout", blurTooltip);
    document.addEventListener("click", clickTooltip);
    document.addEventListener("keydown", dismissTooltip, true);
    document.addEventListener("close", closeDialogTooltip, true);
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("blur", hideTooltip);
  }

  // node_modules/marked/lib/marked.esm.js
  function j() {
    return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
  }
  var y = j();
  function ie(l2) {
    y = l2;
  }
  var D = { exec: () => null };
  function B(l2) {
    let e = [];
    return (t) => {
      let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
      return s || (s = l2(n), e[n] = s), s;
    };
  }
  function h(l2, e = "") {
    let t = typeof l2 == "string" ? l2 : l2.source, n = { replace: (s, i) => {
      let r = typeof i == "string" ? i : i.source;
      return r = r.replace(T.caret, "$1"), t = t.replace(s, r), n;
    }, getRegex: () => new RegExp(t, e) };
    return n;
  }
  var we = ((l2 = "") => {
    try {
      return !!new RegExp("(?<=1)(?<!1)" + l2);
    } catch {
      return false;
    }
  })();
  var T = { codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm, listInterruptsParagraph: /^ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, endingSpaceTabChar: /[ \t]$/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, leadingSpaceTab: /^[ \t]+/, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\][ \t]+\S/, listReplaceTask: /^\[[ xX]\][ \t]+/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/, numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l2) => new RegExp(`^( {0,3}${l2})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: B((l2) => new RegExp(`^ {0,${l2}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)), fencesBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:\`\`\`|~~~)`)), headingBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}#{1,6}(?:\\s|$)`)), pedanticHeadingBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}#`)), htmlBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}(?:</?(?:${K})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")), blockquoteBeginRegex: B((l2) => new RegExp(`^ {0,${l2}}>`)), nestedContainerMarkers: /^(?: {0,3}(?:(?:[*+-]|\d{1,9}[.)])[ \t]+|>[ \t]?))+/ };
  var He = /^(?:[ \t]*(?:\n|$))+/;
  var je = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
  var Ge = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/;
  var W = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
  var Ne = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
  var ae = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
  var Pe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/;
  var ye = h(Pe).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
  var Fe = h(Pe).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
  var le = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
  var Qe = /^[^\n]+/;
  var ue = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/;
  var Ue = h(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", ue).replace("title", /(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex();
  var We = h(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, ae).getRegex();
  var K = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
  var pe = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
  var Ke = h("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", pe).replace("tag", K).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  var Se = (l2) => h(le).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", l2).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
  var Xe = Se(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
  var Ve = Se(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
  var Je = h(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", Ve).getRegex();
  var ce = { blockquote: Je, code: je, def: Ue, fences: Ge, heading: Ne, hr: W, html: Ke, lheading: ye, list: We, newline: He, paragraph: Xe, table: D, text: Qe };
  var Re = h("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
  var Ye = { ...ce, lheading: Fe, table: Re, paragraph: h(le).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Re).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex() };
  var et = { ...ce, html: h(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace("comment", pe).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: D, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: h(le).replace("hr", W).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ye).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
  var tt = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
  var nt = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
  var _e = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
  var rt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
  var $ = /[\p{P}\p{S}]/u;
  var G = /[\s\p{P}\p{S}]/u;
  var X = /[^\s\p{P}\p{S}]/u;
  var st = h(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, G).getRegex();
  var it = /[\p{Pi}\p{Ps}"']/u;
  var $e = /(?!~)[\p{P}\p{S}]/u;
  var ot = /(?!~)[\s\p{P}\p{S}]/u;
  var at = /(?:[^\s\p{P}\p{S}]|~)/u;
  var lt = h(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", we ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
  var Le = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
  var ut = h(Le, "u").replace(/punct/g, $).getRegex();
  var pt = h(Le, "u").replace(/punct/g, $e).getRegex();
  var ct = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
  var ht = h(ct, "u").replace(/openQuote/g, it).replace(/punct/g, $).getRegex();
  var Ce = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
  var dt = h(Ce, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var gt = h(Ce, "gu").replace(/notPunctSpace/g, at).replace(/punctSpace/g, ot).replace(/punct/g, $e).getRegex();
  var kt = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
  var ft = h(kt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var mt = h("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var xt = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
  var bt = h(xt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var Rt = h(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, $).getRegex();
  var Tt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
  var Ot = h(Tt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, G).replace(/punct/g, $).getRegex();
  var wt = h(/\\(punct)/, "gu").replace(/punct/g, $).getRegex();
  var Pt = h(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, $).getRegex();
  var yt = h(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
  var St = h(pe).replace("(?:-->|$)", "-->").getRegex();
  var _t = h("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", St).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
  var Ie = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
  var re = h(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", Ie).getRegex();
  var $t = h(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", re).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex();
  var Lt = h(/^!?\[(label)\]\[(ref)\]/).replace("label", re).replace("ref", ue).getRegex();
  var Ct = h(/^!?\[(ref)\](?:\[\])?/).replace("ref", ue).getRegex();
  var Te = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
  var It = h(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", Ie).getRegex();
  var At = h("reflink|nolink(?!\\()", "g").replace("reflink", h(/^!?\[(label)\]\[(ref)\]/).replace("label", It).replace("ref", Te).getRegex()).replace("nolink", h(/^!?\[(ref)\](?:\[\])?/).replace("ref", Te).getRegex()).getRegex();
  var Oe = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
  var Et = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
  var zt = h(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, Et).getRegex();
  var he = { _backpedal: D, anyPunctuation: wt, anyPunctuationOutsideCode: Pt, autolink: yt, blockSkip: lt, br: _e, code: nt, del: D, delLDelim: D, delRDelim: D, emStrongLDelim: ut, emStrongRDelimAst: dt, emStrongRDelimUnd: mt, escape: tt, link: $t, nolink: Ct, punctuation: st, reflink: Lt, reflinkSearch: At, tag: _t, text: rt, url: D };
  var Mt = { ...he, emStrongLDelim: ht, emStrongRDelimAst: ft, emStrongRDelimUnd: bt, link: h(/^!?\[(label)\]\((.*?)\)/).replace("label", re).getRegex(), reflink: h(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", re).getRegex() };
  var oe = { ...he, emStrongRDelimAst: gt, emStrongLDelim: pt, delLDelim: Rt, delRDelim: Ot, url: h(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", zt).replace("protocol", Oe).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: h(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", Oe).replace(/emailProtocol/g, /(?:mailto|xmpp):/).replace("wwwStart", we ? "(?<![^\\s*_~(])www\\." : "www\\.").getRegex() };
  var Bt = { ...oe, br: h(_e).replace("{2,}", "*").getRegex(), text: h(oe.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
  var V = { normal: ce, gfm: Ye, pedantic: et };
  var N = { normal: he, gfm: oe, breaks: Bt, pedantic: Mt };
  var Dt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var Ae = (l2) => Dt[l2];
  function P(l2, e) {
    if (e) {
      if (T.escapeTest.test(l2)) return l2.replace(T.escapeReplace, Ae);
    } else if (T.escapeTestNoEncode.test(l2)) return l2.replace(T.escapeReplaceNoEncode, Ae);
    return l2;
  }
  function Ee(l2) {
    return T.numericCharacterReference.test(l2) ? l2.replace(T.numericCharacterReferenceOrAmpersand, (e, t, n) => {
      if (t === void 0 && n === void 0) return "&amp;";
      let s = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
      return s === 0 || s > 1114111 || s >= 55296 && s <= 57343 ? "\uFFFD" : s === 38 ? "&amp;" : String.fromCodePoint(s);
    }) : l2;
  }
  function de(l2) {
    try {
      l2 = encodeURI(l2).replace(T.percentDecode, "%");
    } catch {
      return null;
    }
    return l2;
  }
  function ge(l2, e) {
    let t = l2.replace(T.findPipe, (i, r, o) => {
      let a = false, p = r;
      for (; --p >= 0 && o[p] === "\\"; ) a = !a;
      return a ? "|" : " |";
    }), n = t.split(T.splitPipe), s = 0;
    if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
    else for (; n.length < e; ) n.push("");
    for (; s < n.length; s++) n[s] = n[s].trim().replace(T.slashPipe, "|");
    return n;
  }
  function L(l2, e, t) {
    let n = l2.length;
    if (n === 0) return "";
    let s = 0;
    for (; s < n; ) {
      let i = l2.charAt(n - s - 1);
      if (i === e && !t) s++;
      else if (i !== e && t) s++;
      else break;
    }
    return l2.slice(0, n - s);
  }
  function ke(l2) {
    let e = l2.split(`
`), t = e.length - 1;
    for (; t >= 0 && T.blankLine.test(e[t]); ) t--;
    return e.length - t <= 2 ? l2 : e.slice(0, t + 1).join(`
`);
  }
  function Q(l2) {
    return l2.trim().replace(T.multipleSpaceGlobal, " ").toLowerCase().toUpperCase().toLowerCase();
  }
  function fe(l2, e) {
    if (l2.indexOf(e[0]) === -1 && l2.indexOf(e[1]) === -1) return -1;
    let t = 0;
    for (let n = 0; n < l2.length; n++) if (l2[n] === "\\") n++;
    else if (l2[n] === e[0]) t++;
    else if (l2[n] === e[1] && (t--, t < 0)) return n;
    return t > 0 ? -2 : -1;
  }
  var F = /* @__PURE__ */ new WeakMap();
  function me(l2) {
    let e = { "*": -1, _: -1 }, t = -1, n = l2.length;
    for (let s = 0; s < n; s++) {
      let i = l2[s];
      if (i !== "*" && i !== "_" && i !== "~") continue;
      let r = s === 0 ? `
` : l2[s - 1], o = s + 1;
      for (; o < n && l2[o] === i; ) o++;
      r !== " " && r !== "	" && r !== `
` && r !== "\r" && r !== "\f" && (i === "~" ? t = s : e[i] = s), s = o - 1;
    }
    return { maskedSrc: l2, lastPossibleEmStrongCloserIndex: e, lastPossibleDelCloserIndex: t };
  }
  function ze(l2, e) {
    let t = me(e), n = F.get(l2);
    n ? n.push(t) : F.set(l2, [t]);
  }
  function Me(l2) {
    let e = F.get(l2);
    e && (e.pop(), e.length === 0 && F.delete(l2));
  }
  function Be(l2, e, t) {
    let n = F.get(l2)?.at(-1);
    return n && n.maskedSrc === e ? n.lastPossibleEmStrongCloserIndex[t] : me(e).lastPossibleEmStrongCloserIndex[t];
  }
  function De(l2, e) {
    let t = F.get(l2)?.at(-1);
    return t && t.maskedSrc === e ? t.lastPossibleDelCloserIndex : me(e).lastPossibleDelCloserIndex;
  }
  function J(l2, e = 0) {
    let t = e, n = "";
    for (let s of l2) if (s === "	") {
      let i = 4 - t % 4;
      n += " ".repeat(i), t += i;
    } else n += s, t++;
    return n;
  }
  function qe(l2, e, t, n, s) {
    let i = e.href, r = e.title || null, o = l2[1].replace(s.other.outputLinkReplace, "$1"), a = l2[0].charAt(0) === "!", p = n.state.inLink, c = n.state.linkEmitted, u = n.state.inRawBlock;
    n.state.inLink = true, n.state.linkEmitted = false;
    let d = n.inlineTokens(o), k = n.state.linkEmitted;
    if (n.state.linkEmitted = c, n.state.inLink = p, !a) {
      if (k) {
        n.state.inRawBlock = u;
        return;
      }
      n.state.linkEmitted = true;
    }
    return { type: a ? "image" : "link", raw: t, href: i, title: r, text: o, tokens: d };
  }
  function qt(l2, e, t) {
    let n = l2.match(t.other.indentCodeCompensation);
    if (n === null) return e;
    let s = n[1];
    return e.split(`
`).map((i) => {
      let r = i.match(t.other.beginningSpace);
      if (r === null) return i;
      let [o] = r;
      return i.slice(Math.min(o.length, s.length));
    }).join(`
`);
  }
  function ve(l2, e, t, n) {
    if (!e.includes("<")) return false;
    for (let s = 0; s < e.length; s++) {
      if (e[s] === "\\") {
        s++;
        continue;
      }
      if (e[s] === "`") {
        let o = n.inline.code.exec(e.slice(s));
        if (o) {
          s += o[0].length - 1;
          continue;
        }
      }
      if (e[s] !== "<") continue;
      let i = l2.slice(t + s), r = n.inline.tag.exec(i) || n.inline.autolink.exec(i);
      if (r) {
        if (r[0].length > e.length - s) return true;
        s += r[0].length - 1;
      }
    }
    return false;
  }
  var _ = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "rules");
      __publicField(this, "lexer");
      this.options = e || y;
    }
    space(e) {
      let t = this.rules.block.newline.exec(e);
      if (t && t[0].length > 0) return { type: "space", raw: t[0] };
    }
    code(e) {
      let t = this.rules.block.code.exec(e);
      if (t) {
        let n = this.options.pedantic ? t[0] : ke(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
        return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
      }
    }
    fences(e) {
      let t = this.rules.block.fences.exec(e);
      if (t) {
        let n = t[0], s = qt(n, t[3] || "", this.rules);
        return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
      }
    }
    heading(e) {
      let t = this.rules.block.heading.exec(e);
      if (t) {
        let n = t[2].trim();
        if (this.rules.other.endingHash.test(n)) {
          let s = L(n, "#");
          (this.options.pedantic || !s || this.rules.other.endingSpaceTabChar.test(s)) && (n = s.trim());
        }
        return { type: "heading", raw: L(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
      }
    }
    hr(e) {
      let t = this.rules.block.hr.exec(e);
      if (t) return { type: "hr", raw: L(t[0], `
`) };
    }
    blockquote(e) {
      let t = this.rules.block.blockquote.exec(e);
      if (t) {
        let n = L(t[0], `
`).split(`
`), s = "", i = "", r = [];
        for (; n.length > 0; ) {
          let o = false, a = [], p;
          for (p = 0; p < n.length; p++) if (this.rules.other.blockquoteStart.test(n[p])) a.push(n[p]), o = true;
          else if (!o) a.push(n[p]);
          else break;
          n = n.slice(p);
          let c = a.join(`
`), u = c.replace(this.rules.other.blockquoteMarkerWhitespace, (g, b, f) => b + J(f, b.length)).replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
          s = s ? `${s}
${c}` : c, i = i ? `${i}
${u}` : u;
          let d = this.lexer.state.top;
          if (this.lexer.state.top = true, this.lexer.blockTokens(u, r, true), this.lexer.state.top = d, n.length === 0) break;
          let k = r.at(-1);
          if (k?.type === "code" || k?.type === "heading" || k?.type === "hr" || k?.type === "html" || k?.type === "table") break;
          if (k?.type === "blockquote") {
            let g = k, b = n.join(`
`), f = g.raw + `
` + b.replace(this.rules.other.blockquoteSetextReplace2, ""), m = this.blockquote(f);
            r[r.length - 1] = m;
            let S = f.substring(m.raw.length).replace(/^\n/, ""), R = S ? S.split(`
`).length : 0, A = R ? n.slice(0, -R) : n;
            if (A.length > 0 && (s = `${s}
${A.join(`
`)}`), i = i.substring(0, i.length - g.text.length) + m.text, n = n.slice(A.length), n.length > 0 && this.rules.other.blockquoteStart.test(n[0])) continue;
            break;
          } else if (k?.type === "list") {
            let g = k, b = g.raw + `
` + n.join(`
`), f = this.list(b);
            r[r.length - 1] = f;
            let m = f.raw.length > g.raw.length ? b.slice(g.raw.length + 1, f.raw.length).split(`
`).length : 0;
            if (m > 0) {
              let S = n.slice(0, m).join(`
`);
              s = `${s}
${S}`, i = `${i}
${S}`;
            }
            n = n.slice(m);
            continue;
          }
        }
        return { type: "blockquote", raw: s, tokens: r, text: i };
      }
    }
    list(e) {
      let t = this.rules.block.list.exec(e);
      if (t) {
        if (!this.options.pedantic && this.lexer.state.lastToken?.type === "text" && !this.rules.other.listInterruptsParagraph.test(e)) return;
        let n = e, s = () => n.length - e.length, i = t[1].trim(), r = i.length > 1, o = { type: "list", raw: "", ordered: r, start: r ? +i.slice(0, -1) : "", loose: false, items: [] };
        i = r ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = r ? i : "[*+-]");
        let a = this.rules.other.listItemRegex(i), p = false;
        for (; e; ) {
          let u = false, d = "";
          if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
          let k = s();
          e = e.substring(t[0].length);
          let g = t[2].split(`
`, 1)[0], b = t[1].length, f = this.options.pedantic ? J(g, b) : g.replace(this.rules.other.leadingSpaceTab, (v) => J(v, b)), m = e.split(`
`, 1)[0], S = !f.trim(), R = 0;
          if (this.options.pedantic ? (R = 2, d = f.trimStart()) : S ? R = b + 1 : (R = f.search(this.rules.other.nonSpaceChar), R = R > 4 ? 1 : R, d = f.slice(R), R += b), S && this.rules.other.blankLine.test(m) && (e = e.substring(m.length + 1), u = true), !u) {
            let v = this.rules.other.nextBulletRegex(R), U = this.rules.other.hrRegex(R), ee = this.rules.other.fencesBeginRegex(R), te = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(R) : this.rules.other.headingBeginRegex(R), M = this.rules.other.htmlBeginRegex(R), ne = this.rules.other.blockquoteBeginRegex(R), Z = false;
            for (; e; ) {
              let xe = e.split(`
`, 1)[0], H;
              if (m = xe, this.options.pedantic ? (m = m.replace(this.rules.other.listReplaceNesting, "  "), H = m) : H = m.replace(this.rules.other.leadingSpaceTab, (be) => J(be)), ee.test(m) || te.test(m) || M.test(m) || ne.test(m) || v.test(m) || U.test(m)) break;
              if (H.search(this.rules.other.nonSpaceChar) >= R || !m.trim()) d += `
` + H.slice(R), Z = false;
              else {
                if (S || f.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ee.test(f) || te.test(f) || M.test(f) || U.test(f)) break;
                if (!this.options.pedantic && !Z) {
                  let se = f.replace(this.rules.other.nestedContainerMarkers, "");
                  if (this.rules.block.fences.test(se) || this.rules.block.heading.test(se) || this.rules.block.hr.test(se)) break;
                }
                let Ze = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(m) && this.rules.block.lheading.test(`${f}
${m}`) ? `    ${H.replace(/^ {0,3}/, "")}` : m;
                d += `
` + Ze, Z = true;
              }
              S = !m.trim(), e = e.substring(xe.length + 1), f = H.slice(R);
            }
          }
          let A = n.slice(k, s());
          o.loose || (p ? o.loose = true : this.rules.other.doubleBlankLine.test(A) && (p = true)), o.items.push({ type: "list_item", raw: A, task: !!this.options.gfm && this.rules.other.listIsTask.test(d), loose: false, text: d, tokens: [] });
        }
        let c = o.items.at(-1);
        if (c) c.raw = c.raw.trimEnd(), c.text = c.text.trimEnd();
        else return;
        o.raw = n.slice(0, s()).trimEnd();
        for (let u of o.items) if (this.lexer.state.top = false, u.tokens = this.lexer.blockTokens(u.text, []), !o.loose) {
          let d = u.tokens.filter((g) => g.type === "space"), k = d.length > 0 && d.some((g) => this.rules.other.anyLine.test(g.raw));
          o.loose = k;
        }
        for (let u of o.items) {
          let d = u.tokens[0];
          if (u.task && (d?.type === "text" || d?.type === "paragraph")) {
            u.text = u.text.replace(this.rules.other.listReplaceTask, ""), d.raw = d.raw.replace(this.rules.other.listReplaceTask, ""), d.text = d.text.replace(this.rules.other.listReplaceTask, "");
            for (let g = this.lexer.inlineQueue.length - 1; g >= 0; g--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[g].src)) {
              this.lexer.inlineQueue[g].src = this.lexer.inlineQueue[g].src.replace(this.rules.other.listReplaceTask, "");
              break;
            }
            let k = this.rules.other.listTaskCheckbox.exec(u.raw);
            if (k) {
              let g = { type: "checkbox", raw: k[0] + " ", checked: k[0] !== "[ ]" };
              u.checked = g.checked, o.loose ? u.tokens[0] && ["paragraph", "text"].includes(u.tokens[0].type) && "tokens" in u.tokens[0] && u.tokens[0].tokens ? (u.tokens[0].raw = g.raw + u.tokens[0].raw, u.tokens[0].text = g.raw + u.tokens[0].text, u.tokens[0].tokens.unshift(g)) : u.tokens.unshift({ type: "paragraph", raw: g.raw, text: g.raw, tokens: [g] }) : u.tokens.unshift(g);
            }
          } else u.task && (u.task = false);
        }
        if (o.loose) for (let u of o.items) {
          u.loose = true;
          for (let d of u.tokens) d.type === "text" && (d.type = "paragraph");
        }
        return o;
      }
    }
    html(e) {
      let t = this.rules.block.html.exec(e);
      if (t) {
        let n = ke(t[0]);
        return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
      }
    }
    def(e) {
      let t = this.rules.block.def.exec(e);
      if (t) {
        if (!this.rules.other.startAngleBracket.test(t[2]) && fe(t[2], "()") !== -1) return;
        let n = Q(t[1]), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
        return { type: "def", tag: n, raw: L(t[0], `
`), href: s, title: i };
      }
    }
    table(e) {
      let t = this.rules.block.table.exec(e);
      if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
      let n = ge(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], r = { type: "table", raw: L(t[0], `
`), header: [], align: [], rows: [] };
      if (n.length === s.length) {
        for (let o of s) this.rules.other.tableAlignRight.test(o) ? r.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? r.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? r.align.push("left") : r.align.push(null);
        for (let o = 0; o < n.length; o++) r.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: r.align[o] });
        for (let o of i) r.rows.push(ge(o, r.header.length).map((a, p) => ({ text: a, tokens: this.lexer.inline(a), header: false, align: r.align[p] })));
        return r;
      }
    }
    lheading(e) {
      let t = this.rules.block.lheading.exec(e);
      if (t) {
        let n = t[1].trim();
        return { type: "heading", raw: L(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
      }
    }
    paragraph(e) {
      let t = this.rules.block.paragraph.exec(e);
      if (t) {
        let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
        return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
      }
    }
    text(e) {
      let t = this.rules.block.text.exec(e);
      if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
    }
    escape(e) {
      let t = this.rules.inline.escape.exec(e);
      if (t) return { type: "escape", raw: t[0], text: t[1] };
    }
    tag(e) {
      let t = this.rules.inline.tag.exec(e);
      if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
    }
    link(e) {
      if (this.lexer.state.linkParenPossible === false) return;
      let t = this.rules.inline.link.exec(e);
      if (t) {
        let n = t[0].charAt(0) === "!" ? 2 : 1;
        if (!this.options.pedantic && ve(e, t[1], n, this.rules)) return;
        let s = t[2].trim();
        if (!this.options.pedantic && this.rules.other.startAngleBracket.test(s)) {
          if (!this.rules.other.endAngleBracket.test(s)) return;
          let a = L(s.slice(0, -1), "\\");
          if ((s.length - a.length) % 2 === 0) return;
        } else {
          let a = fe(t[2], "()");
          if (a === -2) return;
          if (a > -1) {
            let c = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + a;
            t[2] = t[2].substring(0, a), t[0] = t[0].substring(0, c).trim(), t[3] = "";
          }
        }
        let i = L(t[0].slice(0, -1), "\\");
        if ((t[0].length - i.length) % 2 === 0) return;
        let r = t[2], o = "";
        if (this.options.pedantic) {
          let a = this.rules.other.pedanticHrefTitle.exec(r);
          a && (r = a[1], o = a[3]);
        } else o = t[3] ? t[3].slice(1, -1) : "";
        return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(s) ? r = r.slice(1) : r = r.slice(1, -1)), qe(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: o && o.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
      }
    }
    reflink(e, t) {
      let n;
      if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
        let s = n[0].charAt(0) === "!" ? 2 : 1;
        if (!this.options.pedantic && ve(e, n[1], s, this.rules)) return;
        let i = t[Q(n[2] || n[1])];
        if (!i) {
          let r = n[0].charAt(0);
          return { type: "text", raw: r, text: r };
        }
        return qe(n, i, n[0], this.lexer, this.rules);
      }
    }
    emStrong(e, t, n = "") {
      let s = this.rules.inline.emStrongLDelim.exec(e);
      if (!s || !s[1] && !s[2] && !s[3] && !s[4]) return;
      let i = s[0][0], r = n === i, o = t.length - e.length, a = o;
      for (; !this.options.pedantic && a > 0 && t[a - 1] === i; ) a--;
      let p = [...t.slice(Math.max(0, a - 2), a)].at(-1) ?? "", c = p === "*" || p === "_" || !!this.rules.inline.punctuation.exec(p);
      a < o && (n = p);
      let u = a < o ? c : n === "*" || n === "_" || !!this.rules.inline.punctuation.exec(n);
      if (s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
      let d = s[1] || s[3] || "";
      if (!d || !n || u) {
        let k = [...s[0]].length - 1, g, b, f = k, m = 0, S = o - a + k, R = !this.options.pedantic && !!p.trim() && (!!d || i === "*" && !c);
        if (i !== "*" && i !== "_") return;
        let A = i === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd, v = Be(this, t, i), U = t.length - e.length + k;
        if (v < U) return;
        t = t.slice(-1 * e.length + k);
        let ee = v - U;
        for (A.lastIndex = 0; (s = A.exec(t)) !== null && !(s.index > ee); ) {
          if (g = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !g) continue;
          if (b = [...g].length, s[3] || s[4]) {
            f += b;
            continue;
          } else if (s[5] || s[6] || R) {
            if (r && (s[5] || s[6])) break;
            if (S % 3 && !((S + b) % 3)) {
              m += b;
              continue;
            }
          }
          if (f -= b, f > 0) continue;
          b = Math.min(b, b + f + m);
          let te = [...s[0]][0].length, M = e.slice(0, k + s.index + te + b);
          if (Math.min(k, b) % 2) {
            let Z = M.slice(1, -1);
            return { type: "em", raw: M, text: Z, tokens: this.lexer.inlineTokens(Z) };
          }
          let ne = M.slice(2, -2);
          return { type: "strong", raw: M, text: ne, tokens: this.lexer.inlineTokens(ne) };
        }
      }
    }
    codespan(e) {
      let t = this.rules.inline.code.exec(e);
      if (t) {
        let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
        return s && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
      }
    }
    br(e) {
      let t = this.rules.inline.br.exec(e);
      if (t) return { type: "br", raw: t[0] };
    }
    del(e, t, n = "") {
      let s = this.rules.inline.delLDelim.exec(e);
      if (!s) return;
      if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
        let r = [...s[0]].length - 1, o, a, p = r, c = this.rules.inline.delRDelim, u = De(this, t), d = t.length - e.length + r;
        if (u < d) return;
        t = t.slice(-1 * e.length + r);
        let k = u - d;
        for (c.lastIndex = 0; (s = c.exec(t)) !== null && !(s.index > k); ) {
          if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (a = [...o].length, a !== r)) continue;
          if (s[3] || s[4]) {
            p += a;
            continue;
          }
          if (p -= a, p > 0) continue;
          a = Math.min(a, a + p);
          let g = [...s[0]][0].length, b = e.slice(0, r + s.index + g + a), f = b.slice(r, -r);
          return { type: "del", raw: b, text: f, tokens: this.lexer.inlineTokens(f) };
        }
      }
    }
    autolink(e) {
      let t = this.rules.inline.autolink.exec(e);
      if (t) {
        let n, s;
        return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
      }
    }
    url(e) {
      let t;
      if (t = this.rules.inline.url.exec(e)) {
        let n, s;
        if (t[2] === "@") n = t[0], s = "mailto:" + n;
        else {
          let i;
          do
            i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
          while (i !== t[0]);
          n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
        }
        return { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
      }
    }
    inlineText(e) {
      let t = this.rules.inline.text.exec(e);
      if (t) {
        let n = this.lexer.state.inRawBlock;
        return { type: "text", raw: t[0], text: n ? t[0] : Ee(t[0]), escaped: n };
      }
    }
  };
  var _l_instances, e_fn, t_fn, n_fn, r_fn, _a;
  var O = (_a = class {
    constructor(e) {
      __privateAdd(this, _l_instances);
      __publicField(this, "tokens");
      __publicField(this, "options");
      __publicField(this, "state");
      __publicField(this, "inlineQueue");
      __publicField(this, "tokenizer");
      this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || y, this.options.tokenizer = this.options.tokenizer || new _(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, linkParenPossible: true, top: true };
      let t = { other: T, block: V.normal, inline: N.normal };
      this.options.pedantic ? (t.block = V.pedantic, t.inline = N.pedantic) : this.options.gfm && (t.block = V.gfm, this.options.breaks ? t.inline = N.breaks : t.inline = N.gfm), this.tokenizer.rules = t;
    }
    static get rules() {
      return { block: V, inline: N };
    }
    static lex(e, t) {
      return new _a(t).lex(e);
    }
    static lexInline(e, t) {
      return new _a(t).inlineTokens(e);
    }
    lex(e) {
      e = e.replace(T.carriageReturn, `
`), this.blockTokens(e, this.tokens);
      for (let t = 0; t < this.inlineQueue.length; t++) {
        let n = this.inlineQueue[t];
        this.state.inRawBlock = false, this.inlineTokens(n.src, n.tokens);
      }
      return this.inlineQueue = [], this.tokens;
    }
    blockTokens(e, t = [], n = false) {
      this.tokenizer.lexer = this;
      let s = this.state.lastToken;
      this.options.pedantic && (e = e.replace(T.tabCharGlobal, "    ").replace(T.spaceLine, ""));
      let i = 1 / 0;
      for (; e; ) {
        if (e.length < i) i = e.length;
        else {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
        this.state.lastToken = t.at(-1);
        let r;
        if (this.options.extensions?.block?.some((a) => (r = a.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
        if (r = this.tokenizer.space(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          r.raw.length === 1 && a !== void 0 ? a.raw += `
` : t.push(r);
          continue;
        }
        if (r = this.tokenizer.code(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.at(-1).src = a.text) : t.push(r);
          continue;
        }
        if (r = this.tokenizer.fences(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.heading(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.hr(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.blockquote(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.list(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.html(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.def(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.raw, this.inlineQueue.at(-1).src = a.text) : (this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }), t.push(r));
          continue;
        }
        if (r = this.tokenizer.table(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        if (r = this.tokenizer.lheading(e)) {
          e = e.substring(r.raw.length), t.push(r);
          continue;
        }
        let o = e;
        if (this.options.extensions?.startBlock) {
          let a = 1 / 0, p = e.slice(1), c;
          this.options.extensions.startBlock.forEach((u) => {
            c = u.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
          }), a < 1 / 0 && a >= 0 && (o = e.substring(0, a + 1));
        }
        if (this.state.top && (r = this.tokenizer.paragraph(o))) {
          let a = t.at(-1);
          n && a?.type === "paragraph" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : t.push(r), n = o.length !== e.length, e = e.substring(r.raw.length);
          continue;
        }
        if (r = this.tokenizer.text(e)) {
          e = e.substring(r.raw.length);
          let a = t.at(-1);
          a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + r.raw, a.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : t.push(r);
          continue;
        }
        if (e) {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
      }
      return this.state.top = true, this.state.lastToken = s, t;
    }
    inline(e, t = []) {
      return this.inlineQueue.push({ src: e, tokens: t }), t;
    }
    linkInText(e) {
      if (!e.includes("[")) return false;
      let t = this.tokenizer.rules.inline.link;
      for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return true;
      for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
        let s = n[0], i = s.lastIndexOf("[");
        if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, Q(s.slice(i + 1, -1)))) && !(i > 1 && this.linkInText(s.slice(1, i - 1)))) return true;
      }
      return false;
    }
    inlineTokens(e, t = []) {
      this.tokenizer.lexer = this;
      let n = this.state.linkParenPossible;
      this.state.linkParenPossible = n && e.includes(")");
      try {
        return __privateMethod(this, _l_instances, e_fn).call(this, e, t);
      } finally {
        this.state.linkParenPossible = n;
      }
    }
    infiniteLoopError(e) {
      let t = "Infinite loop on byte: " + e;
      if (this.options.silent) console.error(t);
      else throw new Error(t);
    }
  }, _l_instances = new WeakSet(), e_fn = function(e, t) {
    let n = e.includes("*") || e.includes("_") || e.includes("~") || this.options.hooks?.emStrongMask || this.tokenizer.emStrong !== _.prototype.emStrong || this.tokenizer.del !== _.prototype.del ? __privateMethod(this, _l_instances, r_fn).call(this, e) : e;
    ze(this.tokenizer, n);
    try {
      return __privateMethod(this, _l_instances, t_fn).call(this, e, n, t);
    } finally {
      Me(this.tokenizer);
    }
  }, t_fn = function(e, t, n) {
    let s = false, i = "", r = 1 / 0;
    for (; e; ) {
      if (e.length < r) r = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (i = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((p) => (o = p.call({ lexer: this }, e, n)) ? (e = e.substring(o.raw.length), n.push(o), true) : false)) continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let p = n.at(-1);
        o.type === "text" && p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : n.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, t, i)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, t, i)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), n.push(o);
        continue;
      }
      let a = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, c = e.slice(1), u;
        this.options.extensions.startInline.forEach((d) => {
          u = d.call({ lexer: this }, c), typeof u == "number" && u >= 0 && (p = Math.min(p, u));
        }), p < 1 / 0 && p >= 0 && (a = e.substring(0, p + 1));
      }
      if (o = this.tokenizer.inlineText(a)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), s = true;
        let p = n.at(-1);
        p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : n.push(o);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return n;
  }, n_fn = function(e) {
    let { blockSkip: t, tag: n, autolink: s } = this.tokenizer.rules.inline, i = "", r = 0, o;
    for (t.lastIndex = 0; o = t.exec(e); ) {
      let a = o.index + (o[2] ? o[2].length : 0), p = o.index + o[0].length;
      if (e.charAt(a) === "<") {
        let c = e.slice(a), u = n.exec(c) || s.exec(c);
        if (!u) {
          t.lastIndex = a + 1;
          continue;
        }
        p = a + u[0].length, t.lastIndex = p;
      }
      i += e.slice(r, a) + "[" + "a".repeat(p - a - 2) + "]", r = p;
    }
    return i + e.slice(r);
  }, r_fn = function(e) {
    let t = e;
    if (this.tokens.links && e.includes("[")) {
      let n = this.tokenizer.rules.inline.reflinkSearch, s = (i) => {
        let r = i.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, Q(i.slice(r + 1, -1)))) return i;
        if (r > 1 && i.charAt(0) !== "!") {
          let o = i.slice(1, r - 1);
          if (this.linkInText(o)) return "[" + o.replace(n, s) + "][" + "a".repeat(i.length - r - 2) + "]";
        }
        return "[" + "a".repeat(i.length - 2) + "]";
      };
      t = t.replace(n, s);
    }
    return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (n, s, i) => i ? "+".repeat(n.length) : s ? s + n.slice(s.length, -s.length).replace(/`/g, "+") + s : n), t = __privateMethod(this, _l_instances, n_fn).call(this, t), t = this.options.hooks?.emStrongMask?.call({ lexer: this }, t) ?? t, t;
  }, _a);
  var C = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "parser");
      this.options = e || y;
    }
    space(e) {
      return "";
    }
    code({ text: e, lang: t, escaped: n }) {
      let s = (t || "").match(T.notSpaceStart)?.[0], i = e ? e.replace(T.endingNewline, "") + `
` : "";
      return s ? '<pre><code class="language-' + P(s) + '">' + (n ? i : P(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : P(i, true)) + `</code></pre>
`;
    }
    blockquote({ tokens: e }) {
      return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
    }
    html({ text: e }) {
      return e;
    }
    def(e) {
      return "";
    }
    heading({ tokens: e, depth: t }) {
      return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
    }
    hr(e) {
      return `<hr>
`;
    }
    list(e) {
      let t = e.ordered, n = e.start, s = "";
      for (let o = 0; o < e.items.length; o++) {
        let a = e.items[o];
        s += this.listitem(a);
      }
      let i = t ? "ol" : "ul", r = t && n !== 1 ? ' start="' + n + '"' : "";
      return "<" + i + r + `>
` + s + "</" + i + `>
`;
    }
    listitem(e) {
      return `<li>${this.parser.parse(e.tokens)}</li>
`;
    }
    checkbox({ checked: e }) {
      return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
    }
    paragraph({ tokens: e }) {
      return `<p>${this.parser.parseInline(e)}</p>
`;
    }
    table(e) {
      let t = "", n = "";
      for (let i = 0; i < e.header.length; i++) n += this.tablecell(e.header[i]);
      t += this.tablerow({ text: n });
      let s = "";
      for (let i = 0; i < e.rows.length; i++) {
        let r = e.rows[i];
        n = "";
        for (let o = 0; o < r.length; o++) n += this.tablecell(r[o]);
        s += this.tablerow({ text: n });
      }
      return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
    }
    tablerow({ text: e }) {
      return `<tr>
${e}</tr>
`;
    }
    tablecell(e) {
      let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
      return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
    }
    strong({ tokens: e }) {
      return `<strong>${this.parser.parseInline(e)}</strong>`;
    }
    em({ tokens: e }) {
      return `<em>${this.parser.parseInline(e)}</em>`;
    }
    codespan({ text: e }) {
      return `<code>${P(e, true)}</code>`;
    }
    br(e) {
      return "<br>";
    }
    del({ tokens: e }) {
      return `<del>${this.parser.parseInline(e)}</del>`;
    }
    link({ href: e, title: t, text: n, tokens: s, autolink: i }) {
      let r = i ? P(n, true) : this.parser.parseInline(s), o = de(e);
      if (o === null) return r;
      e = P(o, i);
      let a = '<a href="' + e + '"';
      return t && (a += ' title="' + P(t) + '"'), a += ">" + r + "</a>", a;
    }
    image({ href: e, title: t, text: n, tokens: s }) {
      s && (n = this.parser.parseInline(s, this.parser.textRenderer));
      let i = de(e);
      if (i === null) return P(n);
      e = i;
      let r = `<img src="${P(e)}" alt="${P(n)}"`;
      return t && (r += ` title="${P(t)}"`), r += ">", r;
    }
    text(e) {
      return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : P(e.text);
    }
  };
  var E = class {
    constructor() {
      __publicField(this, "parser");
    }
    strong({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    em({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    codespan({ text: e }) {
      return e;
    }
    del({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    html({ text: e }) {
      return e;
    }
    text({ text: e }) {
      return e;
    }
    link({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    image({ text: e, tokens: t }) {
      return t ? this.parser.parseInline(t, this) : e;
    }
    br() {
      return `
`;
    }
    checkbox({ raw: e }) {
      return e;
    }
  };
  var w = class l {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "renderer");
      __publicField(this, "textRenderer");
      this.options = e || y, this.options.renderer = this.options.renderer || new C(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new E(), this.textRenderer.parser = this;
    }
    static parse(e, t) {
      return new l(t).parse(e);
    }
    static parseInline(e, t) {
      return new l(t).parseInline(e);
    }
    parse(e) {
      this.renderer.parser = this;
      let t = "";
      for (let n = 0; n < e.length; n++) {
        let s = e[n];
        if (this.options.extensions?.renderers?.[s.type]) {
          let r = s, o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
          if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(r.type)) {
            t += o === false ? "" : o ?? "";
            continue;
          }
        }
        let i = s;
        switch (i.type) {
          case "space": {
            t += this.renderer.space(i);
            break;
          }
          case "hr": {
            t += this.renderer.hr(i);
            break;
          }
          case "heading": {
            t += this.renderer.heading(i);
            break;
          }
          case "code": {
            t += this.renderer.code(i);
            break;
          }
          case "table": {
            t += this.renderer.table(i);
            break;
          }
          case "blockquote": {
            t += this.renderer.blockquote(i);
            break;
          }
          case "list": {
            t += this.renderer.list(i);
            break;
          }
          case "checkbox": {
            t += this.renderer.checkbox(i);
            break;
          }
          case "html": {
            t += this.renderer.html(i);
            break;
          }
          case "def": {
            t += this.renderer.def(i);
            break;
          }
          case "paragraph": {
            t += this.renderer.paragraph(i);
            break;
          }
          case "text": {
            t += this.renderer.text(i);
            break;
          }
          default: {
            let r = 'Token with "' + i.type + '" type was not found.';
            if (this.options.silent) return console.error(r), "";
            throw new Error(r);
          }
        }
      }
      return t;
    }
    parseInline(e, t = this.renderer) {
      this.renderer.parser = this;
      let n = "";
      for (let s = 0; s < e.length; s++) {
        let i = e[s];
        if (this.options.extensions?.renderers?.[i.type]) {
          let o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
          if (o !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
            n += o === false ? "" : o ?? "";
            continue;
          }
        }
        let r = i;
        switch (r.type) {
          case "escape": {
            n += t.text(r);
            break;
          }
          case "html": {
            n += t.html(r);
            break;
          }
          case "link": {
            n += t.link(r);
            break;
          }
          case "image": {
            n += t.image(r);
            break;
          }
          case "checkbox": {
            n += t.checkbox(r);
            break;
          }
          case "strong": {
            n += t.strong(r);
            break;
          }
          case "em": {
            n += t.em(r);
            break;
          }
          case "codespan": {
            n += t.codespan(r);
            break;
          }
          case "br": {
            n += t.br(r);
            break;
          }
          case "del": {
            n += t.del(r);
            break;
          }
          case "text": {
            n += t.text(r);
            break;
          }
          default: {
            let o = 'Token with "' + r.type + '" type was not found.';
            if (this.options.silent) return console.error(o), "";
            throw new Error(o);
          }
        }
      }
      return n;
    }
  };
  var _a2;
  var I = (_a2 = class {
    constructor(e) {
      __publicField(this, "options");
      __publicField(this, "block");
      this.options = e || y;
    }
    preprocess(e) {
      return e;
    }
    postprocess(e) {
      return e;
    }
    processAllTokens(e) {
      return e;
    }
    emStrongMask(e) {
      return e;
    }
    provideLexer(e = this.block) {
      return e ? O.lex : O.lexInline;
    }
    provideParser(e = this.block) {
      return e ? w.parse : w.parseInline;
    }
  }, __publicField(_a2, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), __publicField(_a2, "passThroughHooksRespectAsync", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), _a2);
  function z(l2, e) {
    if (Array.isArray(e)) for (let t = 0; t < e.length; t++) l2.push(e[t]);
    else l2.push(e);
  }
  var Y = class {
    constructor(...e) {
      __publicField(this, "defaults", j());
      __publicField(this, "options", this.setOptions);
      __publicField(this, "parse", this.parseMarkdown(true));
      __publicField(this, "parseInline", this.parseMarkdown(false));
      __publicField(this, "Parser", w);
      __publicField(this, "Renderer", C);
      __publicField(this, "TextRenderer", E);
      __publicField(this, "Lexer", O);
      __publicField(this, "Tokenizer", _);
      __publicField(this, "Hooks", I);
      this.use(...e);
    }
    walkTokens(e, t) {
      let n = [];
      for (let s of e) switch (z(n, t.call(this, s)), s.type) {
        case "table": {
          let i = s;
          for (let r of i.header) z(n, this.walkTokens(r.tokens, t));
          for (let r of i.rows) for (let o of r) z(n, this.walkTokens(o.tokens, t));
          break;
        }
        case "list": {
          let i = s;
          z(n, this.walkTokens(i.items, t));
          break;
        }
        default: {
          let i = s;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((r) => {
            let o = i[r].flat(1 / 0);
            z(n, this.walkTokens(o, t));
          }) : i.tokens && z(n, this.walkTokens(i.tokens, t));
        }
      }
      return n;
    }
    use(...e) {
      let t = this.defaults.extensions || { renderers: /* @__PURE__ */ Object.create(null), childTokens: /* @__PURE__ */ Object.create(null) };
      return e.forEach((n) => {
        let s = { ...n };
        if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((i) => {
          if (!i.name) throw new Error("extension name required");
          if ("renderer" in i) {
            let r = t.renderers[i.name];
            r ? t.renderers[i.name] = function(...o) {
              let a = i.renderer.apply(this, o);
              return a === false && (a = r.apply(this, o)), a;
            } : t.renderers[i.name] = i.renderer;
          }
          if ("tokenizer" in i) {
            if (!i.level || i.level !== "block" && i.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
            let r = t[i.level];
            r ? r.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
          }
          "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
        }), s.extensions = t), n.renderer) {
          let i = this.defaults.renderer || new C(this.defaults);
          for (let r in n.renderer) {
            if (!(r in i)) throw new Error(`renderer '${r}' does not exist`);
            if (["options", "parser"].includes(r)) continue;
            let o = r, a = n.renderer[o], p = i[o];
            i[o] = (...c) => {
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u === false ? "" : u ?? "";
            };
          }
          s.renderer = i;
        }
        if (n.tokenizer) {
          let i = this.defaults.tokenizer || new _(this.defaults);
          for (let r in n.tokenizer) {
            if (!(r in i)) throw new Error(`tokenizer '${r}' does not exist`);
            if (["options", "rules", "lexer"].includes(r)) continue;
            let o = r, a = n.tokenizer[o], p = i[o];
            i[o] = (...c) => {
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u;
            };
          }
          s.tokenizer = i;
        }
        if (n.hooks) {
          let i = this.defaults.hooks || new I();
          for (let r in n.hooks) {
            if (!(r in i)) throw new Error(`hook '${r}' does not exist`);
            if (["options", "block"].includes(r)) continue;
            let o = r, a = n.hooks[o], p = i[o];
            I.passThroughHooks.has(r) ? i[o] = (c) => {
              if (i.options.async && I.passThroughHooksRespectAsync.has(r)) return (async () => {
                let d = await a.call(i, c);
                return p.call(i, d);
              })();
              let u = a.call(i, c);
              return p.call(i, u);
            } : i[o] = (...c) => {
              if (i.options.async) return (async () => {
                let d = await a.apply(i, c);
                return d === false && (d = await p.apply(i, c)), d;
              })();
              let u = a.apply(i, c);
              return u === false && (u = p.apply(i, c)), u;
            };
          }
          s.hooks = i;
        }
        if (n.walkTokens) {
          let i = this.defaults.walkTokens, r = n.walkTokens;
          s.walkTokens = function(o) {
            let a = [];
            return z(a, r.call(this, o)), i && z(a, i.call(this, o)), a;
          };
        }
        this.defaults = { ...this.defaults, ...s };
      }), this;
    }
    setOptions(e) {
      return this.defaults = { ...this.defaults, ...e }, this;
    }
    lexer(e, t) {
      return O.lex(e, t ?? this.defaults);
    }
    parser(e, t) {
      return w.parse(e, t ?? this.defaults);
    }
    parseMarkdown(e) {
      return (n, s) => {
        let i = { ...s }, r = { ...this.defaults, ...i }, o = this.onError(!!r.silent, !!r.async);
        if (this.defaults.async === true && i.async === false) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
        if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
        if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
        if (r.hooks && (r.hooks.options = r, r.hooks.block = e), r.async) return (async () => {
          let a = r.hooks ? await r.hooks.preprocess(n) : n, c = await (r.hooks ? await r.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(a, r), u = r.hooks ? await r.hooks.processAllTokens(c) : c;
          r.walkTokens && await Promise.all(this.walkTokens(u, r.walkTokens));
          let k = await (r.hooks ? await r.hooks.provideParser(e) : e ? w.parse : w.parseInline)(u, r);
          return r.hooks ? await r.hooks.postprocess(k) : k;
        })().catch(o);
        try {
          r.hooks && (n = r.hooks.preprocess(n));
          let p = (r.hooks ? r.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(n, r);
          r.hooks && (p = r.hooks.processAllTokens(p)), r.walkTokens && this.walkTokens(p, r.walkTokens);
          let u = (r.hooks ? r.hooks.provideParser(e) : e ? w.parse : w.parseInline)(p, r);
          return r.hooks && (u = r.hooks.postprocess(u)), u;
        } catch (a) {
          return o(a);
        }
      };
    }
    onError(e, t) {
      return (n) => {
        if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
          let s = "<p>An error occurred:</p><pre>" + P(n.message + "", true) + "</pre>";
          return t ? Promise.resolve(s) : s;
        }
        if (t) return Promise.reject(n);
        throw n;
      };
    }
  };
  var q = new Y();
  function x(l2, e) {
    return q.parse(l2, e);
  }
  x.options = x.setOptions = function(l2) {
    return q.setOptions(l2), x.defaults = q.defaults, ie(x.defaults), x;
  };
  x.getDefaults = j;
  x.defaults = y;
  function vt(...l2) {
    return q.use(...l2), x.defaults = q.defaults, ie(x.defaults), x;
  }
  x.use = vt;
  x.walkTokens = function(l2, e) {
    return q.walkTokens(l2, e);
  };
  x.parseInline = q.parseInline;
  x.Parser = w;
  x.parser = w.parse;
  x.Renderer = C;
  x.TextRenderer = E;
  x.Lexer = O;
  x.lexer = O.lex;
  x.Tokenizer = _;
  x.Hooks = I;
  x.parse = x;
  var Ln = x.options;
  var Cn = x.setOptions;
  var In = x.walkTokens;
  var An = x.parseInline;
  var zn = w.parse;
  var Mn = O.lex;

  // node_modules/dompurify/dist/purify.es.mjs
  function _OverloadYield(e, d) {
    this.v = e, this.k = d;
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _iterableToArrayLimit(r, l2) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l2) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l2); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function AsyncGenerator(e) {
    var t, n;
    function resume(t2, n2) {
      try {
        var r = e[t2](n2), o = r.value, u = o instanceof _OverloadYield;
        Promise.resolve(u ? o.v : o).then(function(n3) {
          if (u) {
            var i = "return" === t2 && o.k ? t2 : "next";
            if (!o.k || n3.done) return resume(i, n3);
            n3 = e[i](n3).value;
          }
          settle2(!!r.done, n3);
        }, function(e2) {
          resume("throw", e2);
        });
      } catch (e2) {
        settle2(2, e2);
      }
    }
    function settle2(e2, r) {
      2 === e2 ? t.reject(r) : t.resolve({
        value: r,
        done: e2
      }), (t = t.next) ? resume(t.key, t.arg) : n = null;
    }
    this._invoke = function(e2, r) {
      return new Promise(function(o, u) {
        var i = {
          key: e2,
          arg: r,
          resolve: o,
          reject: u,
          next: null
        };
        n ? n = n.next = i : (t = n = i, resume(e2, r));
      });
    }, "function" != typeof e.return && (this.return = void 0);
  }
  AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
    return this;
  }, AsyncGenerator.prototype.next = function(e) {
    return this._invoke("next", e);
  }, AsyncGenerator.prototype.throw = function(e) {
    return this._invoke("throw", e);
  }, AsyncGenerator.prototype.return = function(e) {
    return this._invoke("return", e);
  };
  var entries = Object.entries;
  var setPrototypeOf = Object.setPrototypeOf;
  var isFrozen = Object.isFrozen;
  var getPrototypeOf = Object.getPrototypeOf;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var freeze = Object.freeze;
  var seal = Object.seal;
  var create = Object.create;
  var _ref = typeof Reflect !== "undefined" && Reflect;
  var apply = _ref.apply;
  var construct = _ref.construct;
  if (!freeze) freeze = function freeze2(x2) {
    return x2;
  };
  if (!seal) seal = function seal2(x2) {
    return x2;
  };
  if (!apply) apply = function apply2(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
    return func.apply(thisArg, args);
  };
  if (!construct) construct = function construct2(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
    return new Func(...args);
  };
  var arrayForEach = unapply(Array.prototype.forEach);
  Array.prototype.indexOf;
  var arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);
  var arraySlice = unapply(Array.prototype.slice);
  var arraySplice = unapply(Array.prototype.splice);
  var arrayIsArray = Array.isArray;
  var setCreate = unconstruct(Set);
  var setAdd = unapply(Set.prototype.add);
  var setHas = unapply(Set.prototype.has);
  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringToString = unapply(String.prototype.toString);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);
  var numberToString = unapply(Number.prototype.toString);
  var booleanToString = unapply(Boolean.prototype.toString);
  var bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
  var symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
  var objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  var objectToString = unapply(Object.prototype.toString);
  var regExpTest = unapply(RegExp.prototype.test);
  var typeErrorCreate = unconstruct(TypeError);
  function unapply(func) {
    return function(thisArg) {
      if (thisArg instanceof RegExp) thisArg.lastIndex = 0;
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
      return apply(func, thisArg, args);
    };
  }
  function unconstruct(Func) {
    return function() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
      return construct(Func, args);
    };
  }
  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
    if (setPrototypeOf) setPrototypeOf(set, null);
    if (!arrayIsArray(array)) return set;
    let l2 = array.length;
    while (l2--) {
      let element2 = array[l2];
      if (typeof element2 === "string") {
        const lcElement = transformCaseFunc(element2);
        if (lcElement !== element2) {
          if (!isFrozen(array)) array[l2] = lcElement;
          element2 = lcElement;
        }
      }
      set[element2] = true;
    }
    return set;
  }
  function cleanArray(array) {
    for (let index = 0; index < array.length; index++) if (!objectHasOwnProperty(array, index)) array[index] = null;
    return array;
  }
  function clone(object) {
    const newObject = create(null);
    for (const _ref2 of entries(object)) {
      var _ref3 = _slicedToArray(_ref2, 2);
      const property = _ref3[0];
      const value = _ref3[1];
      if (objectHasOwnProperty(object, property)) {
        if (arrayIsArray(value)) newObject[property] = cleanArray(value);
        else if (value && typeof value === "object" && value.constructor === Object) newObject[property] = clone(value);
        else newObject[property] = value;
      }
    }
    return newObject;
  }
  function stringifyValue(value) {
    switch (typeof value) {
      case "string":
        return value;
      case "number":
        return numberToString(value);
      case "boolean":
        return booleanToString(value);
      case "bigint":
        return bigintToString ? bigintToString(value) : "0";
      case "symbol":
        return symbolToString ? symbolToString(value) : "Symbol()";
      case "undefined":
        return objectToString(value);
      case "function":
      case "object": {
        if (value === null) return objectToString(value);
        const valueAsRecord = value;
        const valueToString = lookupGetter(valueAsRecord, "toString");
        if (typeof valueToString === "function") {
          const stringified = valueToString(valueAsRecord);
          return typeof stringified === "string" ? stringified : objectToString(stringified);
        }
        return objectToString(value);
      }
      default:
        return objectToString(value);
    }
  }
  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) return unapply(desc.get);
        if (typeof desc.value === "function") return unapply(desc.value);
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue() {
      return null;
    }
    return fallbackValue;
  }
  function lookupAccessor(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) return desc.get ? unapply(desc.get) : null;
      object = getPrototypeOf(object);
    }
    return null;
  }
  function isRegex(value) {
    try {
      regExpTest(value, "");
      return true;
    } catch (_unused) {
      return false;
    }
  }
  var html$1 = freeze([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
  ]);
  var svg$1 = freeze([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "enterkeyhint",
    "exportparts",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "inputmode",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "part",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern"
  ]);
  var svgFilters = freeze([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence"
  ]);
  var svgDisallowed = freeze([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use"
  ]);
  var mathMl$1 = freeze([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts"
  ]);
  var mathMlDisallowed = freeze([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none"
  ]);
  var text = freeze(["#text"]);
  var html = freeze([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "command",
    "commandfor",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "exportparts",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inert",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "part",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns"
  ]);
  var svg = freeze([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dominant-baseline",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "mask-type",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "pointer-events",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-orientation",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "vector-effect",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan"
  ]);
  var mathMl = freeze([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnalign",
    "columnlines",
    "columnspacing",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lquote",
    "lspace",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns"
  ]);
  var xml = freeze([
    "xlink:href",
    "xml:id",
    "xlink:title",
    "xml:space",
    "xmlns:xlink"
  ]);
  var MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
  var ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
  var TMPLIT_EXPR = seal(/\${[\w\W]*/g);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
  var DOCTYPE_NAME = seal(/^html$/i);
  var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
  var ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
  var COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
  var FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
  var SELF_CLOSING_TAG = seal(/\/>/i);
  var NODE_TYPE = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    entityNode: 6,
    processingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12
  };
  var LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, [
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
  ]));
  var getGlobal = function getGlobal2() {
    return typeof window === "undefined" ? null : window;
  };
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") return null;
    let suffix = null;
    const ATTR_NAME = "data-tt-policy-suffix";
    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) suffix = purifyHostElement.getAttribute(ATTR_NAME);
    const policyName = "dompurify" + (suffix ? "#" + suffix : "");
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html2) {
          return html2;
        },
        createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_2) {
      console.warn("TrustedTypes policy " + policyName + " could not be created.");
      return null;
    }
  };
  var _createHooksMap = function _createHooksMap2() {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: []
    };
  };
  var _resolveSetOption = function _resolveSetOption2(cfg, key, fallback, options) {
    return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
  };
  var _resolveObjectOption = function _resolveObjectOption2(cfg, key, makeFallback) {
    const value = objectHasOwnProperty(cfg, key) ? cfg[key] : void 0;
    return value && typeof value === "object" ? clone(value) : makeFallback();
  };
  function createDOMPurify() {
    let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
    const DOMPurify = (root) => createDOMPurify(root);
    DOMPurify.version = "3.4.17";
    DOMPurify.removed = [];
    if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    let document2 = window2.document;
    const originalDocument = document2;
    const currentScript = originalDocument.currentScript;
    window2.DocumentFragment;
    const HTMLTemplateElement = window2.HTMLTemplateElement, Node = window2.Node, Element2 = window2.Element, NodeFilter = window2.NodeFilter;
    window2.NamedNodeMap === void 0 && (window2.NamedNodeMap || window2.MozNamedAttrMap);
    window2.HTMLFormElement;
    const DOMParser = window2.DOMParser, trustedTypes = window2.trustedTypes;
    const ElementPrototype = Element2.prototype;
    const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
    const remove = lookupGetter(ElementPrototype, "remove");
    const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
    const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
    const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
    const getParentNode = lookupGetter(ElementPrototype, "parentNode");
    const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
    const getAttributes = lookupGetter(ElementPrototype, "attributes");
    const getNodeType = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeType") : null;
    const getNodeName = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeName") : null;
    const getOwnerDocument = Node && Node.prototype ? lookupGetter(Node.prototype, "ownerDocument") : null;
    const _readNodeType = function _readNodeType2(node2) {
      return getNodeType ? getNodeType(node2) : node2.nodeType;
    };
    const _readNodeName = function _readNodeName2(node2) {
      return getNodeName ? getNodeName(node2) : node2.nodeName;
    };
    const getNamespaceURI = lookupAccessor(ElementPrototype, "namespaceURI");
    const _readNamespaceURI = function _readNamespaceURI2(element2) {
      return getNamespaceURI ? getNamespaceURI(element2) : element2.namespaceURI;
    };
    if (typeof HTMLTemplateElement === "function") {
      const template = document2.createElement("template");
      if (template.content && template.content.ownerDocument) document2 = template.content.ownerDocument;
    }
    let trustedTypesPolicy;
    let emptyHTML = "";
    let defaultTrustedTypesPolicy;
    let defaultTrustedTypesPolicyResolved = false;
    let IN_TRUSTED_TYPES_POLICY = 0;
    const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy2() {
      if (IN_TRUSTED_TYPES_POLICY > 0) throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
    };
    const _createTrustedHTML = function _createTrustedHTML2(html2) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createHTML(html2);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _createTrustedScriptURL = function _createTrustedScriptURL2(scriptUrl) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createScriptURL(scriptUrl);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy2() {
      if (!defaultTrustedTypesPolicyResolved) {
        defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        defaultTrustedTypesPolicyResolved = true;
      }
      return defaultTrustedTypesPolicy;
    };
    const _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
    const importNode = originalDocument.importNode;
    let hooks = _createHooksMap();
    DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
    const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
    let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [
      ...html$1,
      ...svg$1,
      ...svgFilters,
      ...mathMl$1,
      ...text
    ]);
    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [
      ...html,
      ...svg,
      ...mathMl,
      ...xml
    ]);
    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));
    let FORBID_TAGS = null;
    let FORBID_ATTR = null;
    const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
      tagCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      }
    }));
    let ALLOW_ARIA_ATTR = true;
    let ALLOW_DATA_ATTR = true;
    let ALLOW_UNKNOWN_PROTOCOLS = false;
    let ALLOW_SELF_CLOSE_IN_ATTR = true;
    let SAFE_FOR_TEMPLATES = false;
    let SAFE_FOR_XML = true;
    let WHOLE_DOCUMENT = false;
    let SET_CONFIG = false;
    let SET_CONFIG_ALLOWED_TAGS = null;
    let SET_CONFIG_ALLOWED_ATTR = null;
    let FORCE_BODY = false;
    let RETURN_DOM = false;
    let RETURN_DOM_FRAGMENT = false;
    let RETURN_TRUSTED_TYPE = false;
    let SANITIZE_DOM = true;
    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
    let KEEP_CONTENT = true;
    let IN_PLACE = false;
    let IN_PLACE_VISITED = null;
    let USE_PROFILES = {};
    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, [
      "annotation-xml",
      "audio",
      "colgroup",
      "desc",
      "foreignobject",
      "head",
      "iframe",
      "math",
      "mi",
      "mn",
      "mo",
      "ms",
      "mtext",
      "noembed",
      "noframes",
      "noscript",
      "plaintext",
      "script",
      "selectedcontent",
      "style",
      "svg",
      "template",
      "thead",
      "title",
      "video",
      "xmp"
    ]);
    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, [
      "audio",
      "video",
      "img",
      "source",
      "image",
      "track"
    ]);
    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns"
    ]);
    const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
    const SVG_NAMESPACE2 = "http://www.w3.org/2000/svg";
    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;
    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
      MATHML_NAMESPACE,
      SVG_NAMESPACE2,
      HTML_NAMESPACE
    ], stringToString);
    const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext"
    ]);
    let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
    const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
    let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
      "title",
      "style",
      "font",
      "a",
      "script"
    ]);
    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
    const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
    let transformCaseFunc = null;
    let CONFIG = null;
    const formElement = document2.createElement("form");
    const isRegexOrFunction = function isRegexOrFunction2(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };
    const _parseConfig = function _parseConfig2() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (CONFIG && CONFIG === cfg) return;
      if (!cfg || typeof cfg !== "object") cfg = {};
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
      transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
      ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
      ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
      ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
      URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
        transform: transformCaseFunc,
        base: DEFAULT_URI_SAFE_ATTRIBUTES
      });
      DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
        transform: transformCaseFunc,
        base: DEFAULT_DATA_URI_TAGS
      });
      FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
      FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
      FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
      USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
      RETURN_DOM = cfg.RETURN_DOM || false;
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
      FORCE_BODY = cfg.FORCE_BODY || false;
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
      IN_PLACE = cfg.IN_PLACE || false;
      IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
      NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
      MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
      HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
      const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
      CUSTOM_ELEMENT_HANDLING = create(null);
      if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck)) CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
      if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck)) CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
      if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean") CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
      seal(CUSTOM_ELEMENT_HANDLING);
      if (SAFE_FOR_TEMPLATES) ALLOW_DATA_ATTR = false;
      if (RETURN_DOM_FRAGMENT) RETURN_DOM = true;
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, text);
        ALLOWED_ATTR = create(null);
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }
      EXTRA_ELEMENT_HANDLING.tagCheck = null;
      EXTRA_ELEMENT_HANDLING.attributeCheck = null;
      if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
        if (typeof cfg.ADD_TAGS === "function") EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
        else if (arrayIsArray(cfg.ADD_TAGS)) {
          if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) ALLOWED_TAGS = clone(ALLOWED_TAGS);
          addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
        if (typeof cfg.ADD_ATTR === "function") EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
        else if (arrayIsArray(cfg.ADD_ATTR)) {
          if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) ALLOWED_ATTR = clone(ALLOWED_ATTR);
          addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) FORBID_CONTENTS = clone(FORBID_CONTENTS);
        addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
      }
      if (KEEP_CONTENT) ALLOWED_TAGS["#text"] = true;
      if (WHOLE_DOCUMENT) addToSet(ALLOWED_TAGS, [
        "html",
        "head",
        "body"
      ]);
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ["tbody"]);
        delete FORBID_TAGS.tbody;
      }
      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        const previousTrustedTypesPolicy = trustedTypesPolicy;
        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
        try {
          emptyHTML = _createTrustedHTML("");
        } catch (error) {
          trustedTypesPolicy = previousTrustedTypesPolicy;
          throw error;
        }
      } else if (cfg.TRUSTED_TYPES_POLICY === null) {
        trustedTypesPolicy = void 0;
        emptyHTML = "";
      } else {
        if (trustedTypesPolicy === void 0) trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
        if (trustedTypesPolicy && typeof emptyHTML === "string") emptyHTML = _createTrustedHTML("");
      }
      if (freeze) freeze(cfg);
      CONFIG = cfg;
    };
    const ALL_SVG_TAGS = addToSet({}, [
      ...svg$1,
      ...svgFilters,
      ...svgDisallowed
    ]);
    const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
    const _checkSvgNamespace = function _checkSvgNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "svg";
      if (parent.namespaceURI === MATHML_NAMESPACE) return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      return Boolean(ALL_SVG_TAGS[tagName]);
    };
    const _checkMathMlNamespace = function _checkMathMlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "math";
      if (parent.namespaceURI === SVG_NAMESPACE2) return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
      return Boolean(ALL_MATHML_TAGS[tagName]);
    };
    const _checkHtmlNamespace = function _checkHtmlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === SVG_NAMESPACE2 && !HTML_INTEGRATION_POINTS[parentTagName]) return false;
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) return false;
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    };
    const _checkValidNamespace = function _checkValidNamespace2(element2) {
      const elementNamespace = _readNamespaceURI(element2);
      const tagName = stringToLowerCase(_readNodeName(element2));
      const parentNode = getParentNode(element2);
      let parent;
      let parentTagName;
      if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
        parent = { namespaceURI: _readNamespaceURI(parentNode) };
        parentTagName = stringToLowerCase(_readNodeName(parentNode));
      } else {
        parent = { namespaceURI: NAMESPACE };
        parentTagName = "template";
      }
      if (!ALLOWED_NAMESPACES[elementNamespace]) return false;
      if (elementNamespace === SVG_NAMESPACE2) return _checkSvgNamespace(tagName, parent, parentTagName);
      if (elementNamespace === MATHML_NAMESPACE) return _checkMathMlNamespace(tagName, parent, parentTagName);
      if (elementNamespace === HTML_NAMESPACE) return _checkHtmlNamespace(tagName, parent, parentTagName);
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[elementNamespace]) return true;
      return false;
    };
    const _forceRemove = function _forceRemove2(node2) {
      arrayPush(DOMPurify.removed, { element: node2 });
      try {
        getParentNode(node2).removeChild(node2);
      } catch (_2) {
        remove(node2);
        if (!getParentNode(node2)) throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
      }
    };
    const _stripAttributeNode = function _stripAttributeNode2(element2, attribute, name) {
      try {
        removeAttributeNode(element2, attribute);
      } catch (_2) {
        try {
          element2.removeAttribute(name);
        } catch (_3) {
        }
      }
    };
    const _neutralizeRoot = function _neutralizeRoot2(root) {
      _neutralizeSubtree(root);
      const childNodes = getChildNodes(root);
      if (childNodes) arrayForEach(arraySlice(childNodes), (child) => {
        try {
          remove(child);
        } catch (_2) {
        }
      });
      const attributes = _readNodeType(root) === NODE_TYPE.element ? getAttributes(root) : null;
      if (attributes) for (let i = attributes.length - 1; i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name === "string") _stripAttributeNode(root, attribute, name);
      }
    };
    const _removeAttribute = function _removeAttribute2(name, element2, attr) {
      if (!attr) try {
        attr = element2.getAttributeNode(name);
      } catch (_2) {
        attr = null;
      }
      arrayPush(DOMPurify.removed, {
        attribute: attr || null,
        from: element2
      });
      try {
        if (attr) removeAttributeNode(element2, attr);
        else element2.removeAttribute(name);
      } catch (_2) {
        try {
          element2.removeAttribute(name);
        } catch (_3) {
        }
      }
      if (name === "is") {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) try {
          _forceRemove(element2);
        } catch (_2) {
        }
        else try {
          element2.setAttribute(name, "");
        } catch (_2) {
        }
      }
    };
    const _stripDisallowedAttributes = function _stripDisallowedAttributes2(element2) {
      const attributes = getAttributes(element2);
      if (!attributes) return;
      for (let i = attributes.length - 1; i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)]) continue;
        _stripAttributeNode(element2, attribute, name);
      }
    };
    const _walkTree = function _walkTree2(root, visit) {
      let intoShadow = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      const stack = [root];
      while (stack.length > 0) {
        const node2 = stack.pop();
        if (visit(node2) === false) continue;
        if (intoShadow && _readNodeType(node2) === NODE_TYPE.element) {
          const shadowRoot = getShadowRoot(node2);
          if (_isDocumentFragment(shadowRoot)) stack.push(shadowRoot);
        }
        const childNodes = getChildNodes(node2);
        if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push(childNodes[i]);
      }
    };
    const _neutralizeSubtree = function _neutralizeSubtree2(root) {
      _walkTree(root, (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element) _stripDisallowedAttributes(node2);
      });
    };
    const _collectLiveNodes = function _collectLiveNodes2(root) {
      const nodes = [];
      _walkTree(root, (node2) => {
        nodes.push(node2);
      }, true);
      return nodes;
    };
    const _neutralizeEscapedElements = function _neutralizeEscapedElements2(root, before) {
      const reachable = setCreate();
      arrayForEach(_collectLiveNodes(root), (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element) setAdd(reachable, node2);
      });
      arrayForEach(before, (node2) => {
        if (_readNodeType(node2) === NODE_TYPE.element && !setHas(reachable, node2)) _stripDisallowedAttributes(node2);
      });
    };
    const _neutralizeDiscarded = function _neutralizeDiscarded2(root, before) {
      let rootRemoved = false;
      arrayForEach(DOMPurify.removed, (entry) => {
        if (entry.element) {
          rootRemoved = rootRemoved || entry.element === root;
          _neutralizeSubtree(entry.element);
        }
      });
      _neutralizeEscapedElements(root, before);
      return rootRemoved;
    };
    const MAX_UNVISITED_ROUNDS = 8;
    const _sanitizeUnvisitedNodes = function _sanitizeUnvisitedNodes2(root, before) {
      const visited = IN_PLACE_VISITED;
      let original = null;
      const getOriginal = () => {
        if (!original) {
          original = setCreate();
          arrayForEach(before, (beforeNode) => {
            setAdd(original, beforeNode);
          });
        }
        return original;
      };
      for (let round = 0; ; round++) {
        const live = _collectLiveNodes(root);
        const containers = [root];
        let pending = false;
        arrayForEach(live, (node2) => {
          if (_readNodeType(node2) === NODE_TYPE.documentFragment) arrayPush(containers, node2);
          else if (!pending && !setHas(visited, node2)) pending = setHas(getOriginal(), node2);
        });
        if (!pending) return;
        if (round >= MAX_UNVISITED_ROUNDS) throw typeErrorCreate("the tree kept changing during in-place sanitization; refusing to return it");
        arrayForEach(containers, (container, index) => {
          _sanitizeUnvisitedIn(container, index > 0, root, getOriginal());
        });
      }
    };
    const _sanitizeUnvisitedIn = function _sanitizeUnvisitedIn2(container, inShadow, root, original) {
      const iterator = _createNodeIterator(container);
      let node2;
      while (node2 = iterator.nextNode()) {
        if (!setHas(original, node2) || setHas(IN_PLACE_VISITED, node2)) continue;
        if (inShadow) _executeHooks(hooks.uponSanitizeShadowNode, node2, null);
        _sanitizeElements(node2, root);
        _sanitizeAttributes(node2, root);
        if (_isDocumentFragment(node2.content)) _sanitizeShadowDOM2(node2.content);
      }
    };
    const _markVisited = function _markVisited2(node2) {
      if (IN_PLACE_VISITED) setAdd(IN_PLACE_VISITED, node2);
    };
    const _isPatchLinkageAttribute = function _isPatchLinkageAttribute2(lcName, lcTag) {
      if (!SAFE_FOR_XML) return false;
      if (lcName === "patchsrc") return true;
      return lcName === "for" && lcTag !== "label" && lcTag !== "output";
    };
    const _neutralizePatchLinkage = function _neutralizePatchLinkage2(root) {
      if (!SAFE_FOR_XML) return;
      _walkTree(root, (node2) => {
        const nodeType = _readNodeType(node2);
        if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node2.data)) {
          try {
            remove(node2);
          } catch (_2) {
          }
          return false;
        }
        if (nodeType === NODE_TYPE.element) {
          const element2 = node2;
          const lcTag = transformCaseFunc(_readNodeName(node2));
          try {
            if (element2.hasAttribute && element2.hasAttribute("patchsrc")) element2.removeAttribute("patchsrc");
            if (element2.hasAttribute && element2.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag)) element2.removeAttribute("for");
          } catch (_2) {
          }
        }
        return true;
      });
    };
    const _initDocument = function _initDocument2(dirty) {
      let doc = null;
      let leadingWhitespace = null;
      if (FORCE_BODY) dirty = "<remove></remove>" + dirty;
      else {
        const matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
      const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
      if (NAMESPACE === HTML_NAMESPACE) try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_2) {
      }
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, "template", null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_2) {
        }
      }
      const body = doc.body || doc.documentElement;
      if (dirty && leadingWhitespace) body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      if (NAMESPACE === HTML_NAMESPACE) return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };
    const _createNodeIterator = function _createNodeIterator2(root) {
      const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
      return createNodeIterator.call(doc || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
    };
    const _stripTemplateExpressions = function _stripTemplateExpressions2(value) {
      value = stringReplace(value, MUSTACHE_EXPR$1, " ");
      value = stringReplace(value, ERB_EXPR$1, " ");
      value = stringReplace(value, TMPLIT_EXPR$1, " ");
      return value;
    };
    const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node2) {
      var _node$querySelectorAl;
      _scrubOwnCharacterData(node2);
      const templates = (_node$querySelectorAl = node2.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node2, "template");
      if (templates) arrayForEach(templates, (tmpl) => {
        if (_isDocumentFragment(tmpl.content)) _scrubTemplateExpressions2(tmpl.content);
      });
    };
    const _scrubOwnCharacterData = function _scrubOwnCharacterData2(node2) {
      node2.normalize();
      const doc = getOwnerDocument ? getOwnerDocument(node2) : node2.ownerDocument;
      const walker = createNodeIterator.call(doc || node2, node2, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
      let currentNode = walker.nextNode();
      while (currentNode) {
        currentNode.data = _stripTemplateExpressions(currentNode.data);
        currentNode = walker.nextNode();
      }
    };
    const _isClobbered = function _isClobbered2(element2) {
      const realTagName = getNodeName ? getNodeName(element2) : null;
      if (typeof realTagName !== "string") return false;
      if (transformCaseFunc(realTagName) !== "form") return false;
      return typeof element2.nodeName !== "string" || typeof element2.textContent !== "string" || typeof element2.removeChild !== "function" || element2.attributes !== getAttributes(element2) || typeof element2.removeAttribute !== "function" || typeof element2.removeAttributeNode !== "function" || typeof element2.getAttributeNode !== "function" || typeof element2.setAttribute !== "function" || typeof element2.namespaceURI !== "string" || typeof element2.insertBefore !== "function" || typeof element2.hasChildNodes !== "function" || element2.nodeType !== getNodeType(element2) || element2.childNodes !== getChildNodes(element2);
    };
    const _isDocumentFragment = function _isDocumentFragment2(value) {
      if (!getNodeType || typeof value !== "object" || value === null) return false;
      try {
        return getNodeType(value) === NODE_TYPE.documentFragment;
      } catch (_2) {
        return false;
      }
    };
    const _isNode = function _isNode2(value) {
      if (!getNodeType || typeof value !== "object" || value === null) return false;
      try {
        return typeof getNodeType(value) === "number";
      } catch (_2) {
        return false;
      }
    };
    function _executeHooks(hooks2, currentNode, data) {
      if (hooks2.length === 0) return;
      arrayForEach(hooks2, (hook) => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    }
    const _isUnsafeNode = function _isUnsafeNode2(currentNode, tagName) {
      if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML)) return true;
      if (SAFE_FOR_XML && LITERAL_TEXT_ELEMENTS[tagName] && _readNodeType(currentNode) === NODE_TYPE.element && _readNamespaceURI(currentNode) === HTML_NAMESPACE && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent))) return true;
      if (currentNode.nodeType === NODE_TYPE.processingInstruction) return true;
      if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data)) return true;
      return false;
    };
    const _matchesNameCheck = function _matchesNameCheck2(check, name) {
      if (check instanceof RegExp) return regExpTest(check, name);
      if (check instanceof Function) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
        return Boolean(check(name, ...args));
      }
      return false;
    };
    const _sanitizeDisallowedNode = function _sanitizeDisallowedNode2(currentNode, tagName, root) {
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && !FORBID_CONTENTS[stringToLowerCase(tagName)]) {
        const parentNode = getParentNode(currentNode);
        const childNodes = getChildNodes(currentNode);
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const hoisted = currentNode === root ? cloneNode(childNodes[i], true) : childNodes[i];
            parentNode.insertBefore(hoisted, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    };
    const _forkSharedAllowlist = function _forkSharedAllowlist2(hookList, set, defaultSet, setConfigSet) {
      if (hookList.length === 0) return set;
      return set === defaultSet || set === setConfigSet ? clone(set) : set;
    };
    const _handleHookDetachedNode = function _handleHookDetachedNode2(currentNode, root) {
      if (currentNode === root || getParentNode(currentNode) !== null) return false;
      if (IN_PLACE) _neutralizeSubtree(currentNode);
      return true;
    };
    const _sanitizeElements = function _sanitizeElements2(currentNode, root) {
      _markVisited(currentNode);
      _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root)) return true;
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      const tagName = transformCaseFunc(_readNodeName(currentNode));
      ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
      _executeHooks(hooks.uponSanitizeElement, currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });
      if (_handleHookDetachedNode(currentNode, root)) return true;
      if (_isUnsafeNode(currentNode, tagName)) {
        _forceRemove(currentNode);
        return true;
      }
      if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
        const removed = _sanitizeDisallowedNode(currentNode, tagName, root);
        if (removed === false) {
          _executeHooks(hooks.afterSanitizeElements, currentNode, null);
          if (_handleHookDetachedNode(currentNode, root)) return true;
        }
        return removed;
      }
      if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
        const content = _stripTemplateExpressions(currentNode.textContent);
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }
      _executeHooks(hooks.afterSanitizeElements, currentNode, null);
      return _handleHookDetachedNode(currentNode, root);
    };
    const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
      if (FORBID_ATTR[lcName]) return false;
      if (_isPatchLinkageAttribute(lcName, lcTag)) return false;
      if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) return false;
      const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
      if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName)) return true;
      if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) return true;
      if (!nameIsPermitted) return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
      if (URI_SAFE_ATTRIBUTES[lcName]) return true;
      if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
      if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) return true;
      if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
      return !value;
    };
    const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
      "annotation-xml",
      "color-profile",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "missing-glyph"
    ]);
    const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
      return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
    };
    const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute2(lcTag, lcName, namespaceURI, value) {
      if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI) switch (trustedTypes.getAttributeType(lcTag, lcName)) {
        case "TrustedHTML":
          return _createTrustedHTML(value);
        case "TrustedScriptURL":
          return _createTrustedScriptURL(value);
      }
      return value;
    };
    const _setAttributeValue = function _setAttributeValue2(currentNode, name, namespaceURI, value) {
      try {
        if (namespaceURI) currentNode.setAttributeNS(namespaceURI, name, value);
        else currentNode.setAttribute(name, value);
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
          return false;
        }
        return true;
      } catch (_2) {
        _removeAttribute(name, currentNode);
        return false;
      }
    };
    const _isUnsafeAttributeValue = function _isUnsafeAttributeValue2(name, value) {
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) return true;
      return stringToLowerCase(name) === "attributename" && stringMatch(value, "href") !== null;
    };
    const _sanitizeAttributes = function _sanitizeAttributes2(currentNode, root) {
      _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root)) return;
      const attributes = currentNode.attributes;
      if (!attributes || _isClobbered(currentNode)) return;
      ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
      const hookEvent = {
        attrName: "",
        attrValue: "",
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR,
        forceKeepAttr: void 0
      };
      let l2 = attributes.length;
      const lcTag = transformCaseFunc(currentNode.nodeName);
      while (l2--) {
        const attr = attributes[l2];
        const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
        const lcName = transformCaseFunc(name);
        const initValue = attrValue;
        let value = name === "value" ? initValue : stringTrim(initValue);
        let recreatedNamedProp = false;
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = void 0;
        _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
        value = hookEvent.attrValue;
        if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
          _removeAttribute(name, currentNode, attr);
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
          recreatedNamedProp = true;
        }
        if (_isUnsafeAttributeValue(name, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (hookEvent.forceKeepAttr) continue;
        if (!hookEvent.keepAttr) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (SAFE_FOR_TEMPLATES) value = _stripTemplateExpressions(value);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
        if (value !== initValue) {
          if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp) arrayPop(DOMPurify.removed);
        }
      }
      _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
      _handleHookDetachedNode(currentNode, root);
    };
    const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;
      const shadowIterator = _createNodeIterator(fragment);
      _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
        _sanitizeElements(shadowNode, fragment);
        _sanitizeAttributes(shadowNode, fragment);
        if (_isDocumentFragment(shadowNode.content)) _sanitizeShadowDOM2(shadowNode.content);
        if (_readNodeType(shadowNode) === NODE_TYPE.element) {
          const innerSr = getShadowRoot(shadowNode);
          if (_isDocumentFragment(innerSr)) {
            _sanitizeAttachedShadowRoots(innerSr);
            _sanitizeShadowDOM2(innerSr);
          }
        }
      }
      if (SAFE_FOR_TEMPLATES) _scrubOwnCharacterData(fragment);
      _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
    };
    const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots2(root) {
      const stack = [{
        node: root,
        shadow: null
      }];
      while (stack.length > 0) {
        const item = stack.pop();
        if (item.shadow) {
          _sanitizeShadowDOM2(item.shadow);
          continue;
        }
        const node2 = item.node;
        const isElement = _readNodeType(node2) === NODE_TYPE.element;
        const childNodes = getChildNodes(node2);
        if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push({
          node: childNodes[i],
          shadow: null
        });
        if (isElement) {
          const rootName = getNodeName ? getNodeName(node2) : null;
          if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
            const content = node2.content;
            if (_isDocumentFragment(content)) stack.push({
              node: content,
              shadow: null
            });
          }
        }
        if (isElement) {
          const sr = getShadowRoot(node2);
          if (_isDocumentFragment(sr)) stack.push({
            node: null,
            shadow: sr
          }, {
            node: sr,
            shadow: null
          });
        }
      }
    };
    DOMPurify.sanitize = function(dirty) {
      let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT) dirty = "<!-->";
      if (typeof dirty !== "string" && !_isNode(dirty)) {
        dirty = stringifyValue(dirty);
        if (typeof dirty !== "string") throw typeErrorCreate("dirty is not a string, aborting");
      }
      if (!DOMPurify.isSupported) return dirty;
      if (SET_CONFIG) {
        ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
        ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
      } else _parseConfig(cfg);
      if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0) ALLOWED_TAGS = clone(ALLOWED_TAGS);
      if (hooks.uponSanitizeAttribute.length > 0) ALLOWED_ATTR = clone(ALLOWED_ATTR);
      DOMPurify.removed = [];
      const inPlace = IN_PLACE && typeof dirty !== "string" && _isNode(dirty);
      let inPlaceNodes = [];
      const outerVisited = IN_PLACE_VISITED;
      if (inPlace) {
        _neutralizePatchLinkage(dirty);
        const nn = _readNodeName(dirty);
        if (typeof nn === "string") {
          const tagName = transformCaseFunc(nn);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            _neutralizeRoot(dirty);
            throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
          }
        }
        if (_isClobbered(dirty)) {
          _neutralizeRoot(dirty);
          throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
        }
        inPlaceNodes = _collectLiveNodes(dirty);
        IN_PLACE_VISITED = setCreate();
      } else if (_isNode(dirty)) {
        body = _initDocument("<!---->");
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") body = importedNode;
        else if (importedNode.nodeName === "HTML") body = importedNode;
        else body.appendChild(importedNode);
        _sanitizeAttachedShadowRoots(body);
      } else {
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1) return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
        body = _initDocument(dirty);
        if (!body) return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
      }
      if (body && FORCE_BODY) _forceRemove(body.firstChild);
      const walkRoot = inPlace ? dirty : body;
      try {
        if (inPlace) _sanitizeAttachedShadowRoots(dirty);
        const nodeIterator = _createNodeIterator(walkRoot);
        while (currentNode = nodeIterator.nextNode()) {
          _sanitizeElements(currentNode, walkRoot);
          _sanitizeAttributes(currentNode, walkRoot);
          if (_isDocumentFragment(currentNode.content)) _sanitizeShadowDOM2(currentNode.content);
        }
        if (inPlace) _sanitizeUnvisitedNodes(dirty, inPlaceNodes);
      } catch (error) {
        if (inPlace) {
          _neutralizeRoot(dirty);
          _neutralizeDiscarded(dirty, inPlaceNodes);
        }
        throw error;
      } finally {
        IN_PLACE_VISITED = outerVisited;
      }
      if (inPlace) {
        if (_neutralizeDiscarded(dirty, inPlaceNodes)) throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
        if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(dirty);
        return dirty;
      }
      if (RETURN_DOM) {
        if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(body);
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild) returnNode.appendChild(body.firstChild);
        } else returnNode = body;
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) returnNode = importNode.call(originalDocument, returnNode, true);
        return returnNode;
      }
      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
      if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
      if (SAFE_FOR_TEMPLATES) serializedHTML = _stripTemplateExpressions(serializedHTML);
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
    };
    DOMPurify.setConfig = function() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _parseConfig(cfg);
      SET_CONFIG = true;
      SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
      SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
    };
    DOMPurify.clearConfig = function() {
      CONFIG = null;
      SET_CONFIG = false;
      SET_CONFIG_ALLOWED_TAGS = null;
      SET_CONFIG_ALLOWED_ATTR = null;
      trustedTypesPolicy = defaultTrustedTypesPolicy;
      emptyHTML = "";
    };
    DOMPurify.isValidAttribute = function(tag, attr, value) {
      if (!CONFIG) _parseConfig({});
      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      if (typeof value === "string" && (_isUnsafeAttributeValue(attr, value) || !ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value))) return false;
      return _isValidAttribute(lcTag, lcName, value);
    };
    DOMPurify.addHook = function(entryPoint, hookFunction) {
      if (typeof hookFunction !== "function") return;
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      arrayPush(hooks[entryPoint], hookFunction);
    };
    DOMPurify.removeHook = function(entryPoint, hookFunction) {
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      if (hookFunction !== void 0) {
        const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
        return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
      }
      return arrayPop(hooks[entryPoint]);
    };
    DOMPurify.removeHooks = function(entryPoint) {
      if (!objectHasOwnProperty(hooks, entryPoint)) return;
      hooks[entryPoint] = [];
    };
    DOMPurify.removeAllHooks = function() {
      hooks = _createHooksMap();
    };
    return DOMPurify;
  }
  var purify_default = createDOMPurify();

  // src/ui/notes.mjs
  var MARKDOWN_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "del", "blockquote", "pre", "code", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "input"];
  var MARKDOWN_ATTRIBUTES = ["href", "title", "type", "checked", "disabled", "start", "align"];
  var MARKDOWN_OPTIONS = { gfm: true, breaks: true, async: false };
  var LINK_PROTOCOLS = /^(https?:|mailto:|#)/i;
  function markdownFragment(source) {
    const parsed = x.parse(source, MARKDOWN_OPTIONS);
    const fragment = purify_default.sanitize(parsed, { ALLOWED_TAGS: MARKDOWN_TAGS, ALLOWED_ATTR: MARKDOWN_ATTRIBUTES, RETURN_DOM_FRAGMENT: true });
    for (const anchor2 of fragment.querySelectorAll("a")) {
      const href = anchor2.getAttribute("href");
      if (href && !LINK_PROTOCOLS.test(href)) {
        anchor2.removeAttribute("href");
      }
      anchor2.setAttribute("target", "_blank");
      anchor2.setAttribute("rel", "noopener noreferrer");
    }
    for (const input of fragment.querySelectorAll("input")) {
      input.type = "checkbox";
      input.disabled = true;
    }
    return fragment;
  }

  // src/ui/announcement.mjs
  var ANNOUNCEMENT_ID = "experiment-wiring-2";
  var DISMISSED_KEY = "breadboard-lab-dismissed-announcement";
  var ANNOUNCEMENT_MARKDOWN = [
    "\u6B22\u8FCE\u4F7F\u7528\u672C\u6A21\u62DF\u5668\uFF01\u4F60\u53EF\u4EE5\u5728**\u5DE6\u4FA7\u680F\u504F\u4E0B**\u7684\u5730\u65B9\u81EA\u7531\u9009\u62E9\u5B58\u6863\uFF0C\u6253\u5F00\u5B58\u6863\u540E\uFF0C\u70B9\u53F3\u4FA7\u680F\u6700\u53F3\u4FA7\u7684**\u5907\u6CE8**\u5373\u53EF\u770B\u5230\u6BCF\u4E2A\u8F93\u5165\u7684\u7528\u9014\u3001\u5B9E\u9A8C\u6B65\u9AA4\u548C\u9884\u671F\u73B0\u8C61\u3002",
    "",
    "\u5728\u4F60\u63A5\u5165\u5B9E\u7269\u7535\u8DEF\u524D\uFF0C\u8BF7\u4F60\u52A1\u5FC5**\u5148\u68C0\u67E5\u82AF\u7247\u662F\u5426\u6B63\u5E38\u5DE5\u4F5C**\uFF01\uFF01\u5B89\u88C5\u65F6\u4E5F\u4E00\u5B9A\u8981**\u68C0\u67E5\u82AF\u7247\u7F3A\u53E3\u671D\u5411**\uFF0C\u4EE5\u53CA**\u7535\u6E90\u7EBF\u548C\u5730\u7EBF\u662F\u5426\u63A5\u5BF9**\uFF01",
    "",
    "> **\u5982\u679C\u8FD9\u4E2A\u9879\u76EE\u5E2E\u5230\u4E86\u4F60\uFF0C\u6B22\u8FCE\u5230 https://github.com/Windy-Field/SDU-BreadBoard \u4E3A\u9879\u76EE\u70B9\u4E2A Star\u3002**"
  ].join("\n");
  function isAnnouncementDismissed() {
    try {
      return localStorage.getItem(DISMISSED_KEY) === ANNOUNCEMENT_ID;
    } catch {
      return false;
    }
  }
  function openAnnouncement() {
    const checkbox = element("announcement-dismiss");
    checkbox.checked = isAnnouncementDismissed();
    element("announcement-dialog").showModal();
  }
  function confirmAnnouncement() {
    const checkbox = element("announcement-dismiss");
    const dialog = element("announcement-dialog");
    dialog.close();
    if (checkbox.checked === isAnnouncementDismissed()) {
      return;
    }
    try {
      if (checkbox.checked) {
        localStorage.setItem(DISMISSED_KEY, ANNOUNCEMENT_ID);
      } else {
        localStorage.removeItem(DISMISSED_KEY);
      }
    } catch {
      showToast("\u6D4F\u89C8\u5668\u672A\u80FD\u4FDD\u5B58\u516C\u544A\u63D0\u9192\u8BBE\u7F6E", "warning");
    }
  }
  function startAnnouncement() {
    const content = element("announcement-content");
    const fragment = markdownFragment(ANNOUNCEMENT_MARKDOWN);
    content.replaceChildren(fragment);
    element("announcement-button").addEventListener("click", openAnnouncement);
    element("announcement-confirm").addEventListener("click", confirmAnnouncement);
    if (!isAnnouncementDismissed()) {
      openAnnouncement();
    }
  }

  // src/experiments/preset-wiring.mjs
  function allocatePin(project, usage, name) {
    if (!name.startsWith("U")) {
      const hole2 = portHole(name);
      if (hole2 !== "") {
        return hole2;
      }
      return name;
    }
    const parts = name.split("-");
    let chip = null;
    for (const candidate of project.chips) {
      if (candidate.id === parts[0]) {
        chip = candidate;
      }
    }
    const pin = Number(parts[1]);
    const hole = pinHole(chip, pin);
    const position = hole.split(":");
    let rows = "GHIJ";
    if (pin > CHIP_MODELS[chip.model].count / 2) {
      rows = "DCBA";
    }
    let index = 0;
    if (Object.hasOwn(usage, name)) {
      index = usage[name];
    }
    if (index >= rows.length) {
      throw new Error("\u793A\u4F8B\u7535\u8DEF\u7684\u540C\u5217\u7A7A\u5B54\u4E0D\u8DB3");
    }
    usage[name] = index + 1;
    return holeId(chip.section, rows[index], Number(position[2]));
  }
  function connect(project, usage, first, second, color) {
    const from = allocatePin(project, usage, first);
    const to = allocatePin(project, usage, second);
    const number = project.wires.length + 1;
    project.wires.push({ id: "W" + number, from, to, color, bends: [] });
  }

  // src/experiments/preset-routes.json
  var preset_routes_default = {
    W1: [
      {
        x: 1242,
        y: 402.0000002219999
      },
      {
        x: 522,
        y: 402.0000002219999
      }
    ],
    W2: [
      {
        x: 1210,
        y: 496.9999999700001
      },
      {
        x: 684,
        y: 496.9999999700001
      }
    ],
    W3: [
      {
        x: 522,
        y: 399.0000002219999
      },
      {
        x: 493.9999999967,
        y: 399.0000002219999
      },
      {
        x: 493.9999999967,
        y: 651.925
      },
      {
        x: 342,
        y: 651.925
      }
    ],
    W4: [
      {
        x: 686.0689655172414,
        y: 506
      },
      {
        x: 686.0689655172414,
        y: 726
      },
      {
        x: 468,
        y: 726
      }
    ],
    W5: [
      {
        x: 342,
        y: 642.325
      },
      {
        x: 756,
        y: 642.325
      }
    ],
    W6: [
      {
        x: 468,
        y: 767.9999998200001
      },
      {
        x: 882,
        y: 767.9999998200001
      }
    ],
    W7: [
      {
        x: 756,
        y: 408.0000002219999
      },
      {
        x: 252,
        y: 408.0000002219999
      }
    ],
    W8: [
      {
        x: 882,
        y: 761.9999998200001
      },
      {
        x: 674.0689655172414,
        y: 761.9999998200001
      },
      {
        x: 674.0689655172414,
        y: 496.9999999700001
      },
      {
        x: 360,
        y: 496.9999999700001
      }
    ],
    W9: [
      {
        x: 252,
        y: 390.0000002219999
      },
      {
        x: 864,
        y: 390.0000002219999
      }
    ],
    W10: [
      {
        x: 360,
        y: 514.9999999700001
      },
      {
        x: 972,
        y: 514.9999999700001
      }
    ],
    W11: [
      {
        x: 972,
        y: 511.9999999700001
      },
      {
        x: 735.5260663507107,
        y: 511.9999999700001
      },
      {
        x: 735.5260663507107,
        y: 411.0000002219999
      },
      {
        x: 576,
        y: 411.0000002219999
      }
    ],
    W12: [
      {
        x: 576,
        y: 399.0000002219999
      },
      {
        x: 558,
        y: 399.0000002219999
      }
    ],
    W13: [
      {
        x: 558,
        y: 393.0000002219999
      },
      {
        x: 789,
        y: 393.0000002219999
      },
      {
        x: 789,
        y: 661
      }
    ],
    W14: [
      {
        x: 795,
        y: 646
      },
      {
        x: 795,
        y: 661
      }
    ],
    W15: [
      {
        x: 828,
        y: 646
      }
    ],
    W16: [
      {
        x: 846,
        y: 646
      }
    ],
    W17: [
      {
        x: 849,
        y: 646
      },
      {
        x: 849,
        y: 411.0000002219999
      },
      {
        x: 954,
        y: 411.0000002219999
      }
    ],
    W18: [
      {
        x: 954,
        y: 399.0000002219999
      },
      {
        x: 936,
        y: 399.0000002219999
      }
    ],
    W19: [
      {
        x: 936,
        y: 399.0000002219999
      },
      {
        x: 900,
        y: 399.0000002219999
      }
    ],
    W20: [
      {
        x: 900,
        y: 399.0000002219999
      },
      {
        x: 882,
        y: 399.0000002219999
      }
    ],
    W21: [
      {
        x: 954,
        y: 487.9999999700001
      },
      {
        x: 252,
        y: 487.9999999700001
      }
    ],
    W22: [
      {
        x: 288,
        y: 755.9999997600002
      },
      {
        x: 432,
        y: 755.9999997600002
      }
    ],
    W23: [
      {
        x: 918,
        y: 490.9999999700001
      },
      {
        x: 306,
        y: 490.9999999700001
      }
    ],
    W24: [
      {
        x: 342,
        y: 493.9999999700001
      },
      {
        x: 328,
        y: 493.9999999700001
      },
      {
        x: 328,
        y: 749.9999997600002
      },
      {
        x: 360,
        y: 749.9999997600002
      }
    ],
    W25: [
      {
        x: 882,
        y: 1028.5
      },
      {
        x: 487.9999999967,
        y: 1028.5
      },
      {
        x: 487.9999999967,
        y: 417.0000002219999
      },
      {
        x: 342,
        y: 417.0000002219999
      }
    ],
    W26: [
      {
        x: 360,
        y: 426
      },
      {
        x: 379.99999994000007,
        y: 426
      },
      {
        x: 379.99999994000007,
        y: 647.125
      },
      {
        x: 360,
        y: 647.125
      }
    ],
    W27: [
      {
        x: 846,
        y: 1034.5
      },
      {
        x: 482,
        y: 1034.5
      },
      {
        x: 482,
        y: 414.0000002219999
      },
      {
        x: 288,
        y: 414.0000002219999
      }
    ],
    W28: [
      {
        x: 306,
        y: 420.0000002219999
      },
      {
        x: 432,
        y: 420.0000002219999
      }
    ],
    W29: [
      {
        x: 810,
        y: 1040.5
      },
      {
        x: 896,
        y: 1040.5
      },
      {
        x: 896,
        y: 499.9999999700001
      },
      {
        x: 864,
        y: 499.9999999700001
      }
    ],
    W30: [
      {
        x: 774,
        y: 1040.5
      },
      {
        x: 270,
        y: 1040.5
      }
    ],
    W31: [
      {
        x: 322.00000002,
        y: 506
      },
      {
        x: 322.00000002,
        y: 491
      }
    ],
    W32: [
      {
        x: 374,
        y: 506
      },
      {
        x: 374,
        y: 423.0000002219999
      },
      {
        x: 324,
        y: 423.0000002219999
      }
    ],
    W33: [
      {
        x: 324,
        y: 411.0000002219999
      },
      {
        x: 270,
        y: 411.0000002219999
      }
    ],
    W34: [
      {
        x: 270,
        y: 396.0000002219999
      },
      {
        x: 699.5260663507107,
        y: 396.0000002219999
      },
      {
        x: 699.5260663507107,
        y: 484.9999999700001
      },
      {
        x: 882,
        y: 484.9999999700001
      }
    ],
    W35: [
      {
        x: 882,
        y: 517.9999999700001
      },
      {
        x: 668.0689655172414,
        y: 517.9999999700001
      },
      {
        x: 668.0689655172414,
        y: 755.9999997600002
      },
      {
        x: 450,
        y: 755.9999997600002
      }
    ],
    W36: [
      {
        x: 901.9999999800001,
        y: 491
      },
      {
        x: 901.9999999800001,
        y: 741
      }
    ],
    W37: [
      {
        x: 846,
        y: 755.9999998200001
      },
      {
        x: 774,
        y: 755.9999998200001
      }
    ],
    W38: [
      {
        x: 468,
        y: 675.925
      },
      {
        x: 680.0689655172414,
        y: 675.925
      },
      {
        x: 680.0689655172414,
        y: 749.9999998200001
      },
      {
        x: 864,
        y: 749.9999998200001
      }
    ],
    W39: [
      {
        x: 396,
        y: 737.9999997600002
      },
      {
        x: 558,
        y: 737.9999997600002
      }
    ],
    W40: [
      {
        x: 342,
        y: 743.9999997600002
      },
      {
        x: 576,
        y: 743.9999997600002
      }
    ],
    W41: [
      {
        x: 396,
        y: 661.525
      },
      {
        x: 630,
        y: 661.525
      }
    ],
    W42: [
      {
        x: 450,
        y: 671.125
      },
      {
        x: 648,
        y: 671.125
      }
    ],
    W43: [
      {
        x: 810,
        y: 731.9999998200001
      },
      {
        x: 731.9260663507108,
        y: 731.9999998200001
      },
      {
        x: 731.9260663507108,
        y: 414.0000002219999
      },
      {
        x: 648,
        y: 414.0000002219999
      }
    ],
    W44: [
      {
        x: 756,
        y: 743.9999998200001
      },
      {
        x: 724.7260663507108,
        y: 743.9999998200001
      },
      {
        x: 724.7260663507108,
        y: 420.0000002219999
      },
      {
        x: 630,
        y: 420.0000002219999
      }
    ],
    W45: [
      {
        x: 540,
        y: 731.9999997600002
      },
      {
        x: 414,
        y: 731.9999997600002
      }
    ],
    W46: [
      {
        x: 594,
        y: 749.9999997600002
      },
      {
        x: 378,
        y: 749.9999997600002
      }
    ],
    W47: [
      {
        x: 612,
        y: 656.725
      },
      {
        x: 378,
        y: 656.725
      }
    ],
    W48: [
      {
        x: 662.0689655172414,
        y: 491
      },
      {
        x: 662.0689655172414,
        y: 666.325
      },
      {
        x: 414,
        y: 666.325
      }
    ],
    W49: [
      {
        x: 666,
        y: 417.0000002219999
      },
      {
        x: 728.3260663507108,
        y: 417.0000002219999
      },
      {
        x: 728.3260663507108,
        y: 726
      },
      {
        x: 828,
        y: 726
      }
    ],
    W50: [
      {
        x: 612,
        y: 423.0000002219999
      },
      {
        x: 721.1260663507107,
        y: 423.0000002219999
      },
      {
        x: 721.1260663507107,
        y: 737.9999998200001
      },
      {
        x: 792,
        y: 737.9999998200001
      }
    ],
    W51: [
      {
        x: 540,
        y: 499.9999999700001
      },
      {
        x: 703.1260663507107,
        y: 499.9999999700001
      },
      {
        x: 703.1260663507107,
        y: 110
      },
      {
        x: 954,
        y: 110
      }
    ],
    W52: [
      {
        x: 594,
        y: 502.9999999700001
      },
      {
        x: 706.7260663507108,
        y: 502.9999999700001
      },
      {
        x: 706.7260663507108,
        y: 116
      }
    ],
    W53: [
      {
        x: 612,
        y: 505.9999999700001
      },
      {
        x: 710.3260663507108,
        y: 505.9999999700001
      },
      {
        x: 710.3260663507108,
        y: 122
      },
      {
        x: 882,
        y: 122
      }
    ],
    W54: [
      {
        x: 666,
        y: 508.9999999700001
      },
      {
        x: 843,
        y: 508.9999999700001
      },
      {
        x: 843,
        y: 116
      }
    ],
    W55: [
      {
        x: 666,
        y: 387.0000002219999
      },
      {
        x: 810,
        y: 387.0000002219999
      }
    ],
    W56: [
      {
        x: 612,
        y: 384.0000002219999
      },
      {
        x: 774,
        y: 384.0000002219999
      }
    ],
    W57: [
      {
        x: 666,
        y: 376.80000022199994
      },
      {
        x: 717.5260663507107,
        y: 376.80000022199994
      },
      {
        x: 717.5260663507107,
        y: 481.9999999700001
      },
      {
        x: 918,
        y: 481.9999999700001
      }
    ],
    W58: [
      {
        x: 612,
        y: 381.0000002219999
      },
      {
        x: 713.9260663507108,
        y: 381.0000002219999
      },
      {
        x: 713.9260663507108,
        y: 478.9999999700001
      },
      {
        x: 936,
        y: 478.9999999700001
      }
    ],
    W59: [
      {
        x: 954,
        y: 476
      },
      {
        x: 740.9260663507108,
        y: 476
      },
      {
        x: 740.9260663507108,
        y: 116
      }
    ],
    W60: [
      {
        x: 739.1260663507107,
        y: 1036
      },
      {
        x: 739.1260663507107,
        y: 493.9999999700001
      },
      {
        x: 522,
        y: 493.9999999700001
      }
    ],
    W61: [
      {
        x: 1098,
        y: 405.0000002219999
      },
      {
        x: 684,
        y: 405.0000002219999
      }
    ]
  };

  // src/experiments/presets.mjs
  var PRESET_WIRE_COLORS = {
    power: WIRE_COLORS[0],
    ground: WIRE_COLORS[7],
    input: WIRE_COLORS[2],
    control: WIRE_COLORS[4],
    result: WIRE_COLORS[1],
    feedback: WIRE_COLORS[3],
    output: WIRE_COLORS[5],
    timing: WIRE_COLORS[6],
    overflow: WIRE_COLORS[9]
  };
  var PRESET_CHIPS = [
    { id: "U1", model: "74LS273", section: 1, column: 25 },
    { id: "U2", model: "74LS283", section: 2, column: 15 },
    { id: "U3", model: "74LS283", section: 2, column: 38 },
    { id: "U4", model: "74LS86", section: 1, column: 10 },
    { id: "U5", model: "74LS86", section: 1, column: 44 }
  ];
  var UNUSED_INPUTS = ["U1-17", "U1-18", "U3-14", "U3-15", "U3-12", "U3-11", "U5-9", "U5-10", "U5-12", "U5-13"];
  var INPUT_PINS = [1, 4, 9, 12];
  var OUTPUT_PINS = [3, 6, 8, 11];
  var ADDER_PINS = [6, 2, 15, 11];
  var CONTROL_PINS = ["U4-2", "U4-5", "U4-10", "U4-13", "U5-2", "U2-7"];
  var SUM_CONNECTIONS = [["U2-4", "U1-3"], ["U2-1", "U1-4"], ["U2-13", "U1-7"], ["U2-10", "U1-8"], ["U3-4", "U1-13"], ["U3-1", "U1-14"]];
  var FEEDBACK_CONNECTIONS = [["U1-2", "U2-5"], ["U1-5", "U2-3"], ["U1-6", "U2-14"], ["U1-9", "U2-12"], ["U1-12", "U3-5"], ["U1-15", "U3-3"]];
  var REGISTER_OUTPUTS = [2, 5, 6, 9, 12, 15];
  var COMPLEMENT_PORT_COUNT = 7;
  var COMPLEMENT_NAME = "\u53CC\u7B26\u53F7\u4F4D\u8865\u7801\u8FD0\u7B97\u5668";
  var COMPLEMENT_RESET_INPUT = 6;
  var COMPLEMENT_NOTES = `# ${COMPLEMENT_NAME}

## \u529F\u80FD

\u8FD9\u4E2A\u7535\u8DEF\u53EF\u4EE5\u8FDE\u7EED\u505A\u8865\u7801\u52A0\u51CF\u3002U2\u3001U3\uFF0874LS283\uFF09\u7B97\u51FA\u6570\u503C\u4F4D\u548C\u7B26\u53F7\u4F4D\uFF0CU4\u3001U5\uFF0874LS86\uFF09\u8D1F\u8D23\u5BF9\u8F93\u5165\u53D6\u53CD\u5E76\u5224\u65AD\u662F\u5426\u6EA2\u51FA\u3002U1\uFF0874LS273\uFF09\u628A\u7B97\u51FA\u7684 **\u4E24\u4E2A\u7B26\u53F7\u4F4D\u548C\u56DB\u4E2A\u6570\u503C\u4F4D** \u5B58\u4E0B\u6765\uFF0C\u4F9B\u4E0B\u4E00\u8F6E\u63A5\u7740\u7B97\u3002

## \u8F93\u5165\u53E3

| \u7AEF\u53E3 | \u4F5C\u7528 |
| --- | --- |
| K0\u3001K1\u3001K2\u3001K3 | \u8F93\u5165\u8865\u7801\u7684\u4F4E\u56DB\u4F4D\uFF0CK0 \u6700\u4F4E\u4F4D |
| K4 | \u8F93\u5165\u7B26\u53F7\u4F4D\uFF1B\u7535\u8DEF\u5C06\u6B64\u4F4D\u590D\u5236\u6210\u4E24\u4E2A\u7B26\u53F7\u4F4D |
| K5 | 0 \u4E3A\u52A0\u6CD5\uFF0C1 \u4E3A\u51CF\u6CD5 |
| K6 | 0 \u5F02\u6B65\u6E05\u96F6\uFF0C\u6B63\u5E38\u8FD0\u7B97\u4FDD\u6301 1 |
| P\u2212 | \u5B8C\u6574\u8D1F\u8109\u51B2\u7ED3\u675F\u65F6\u7684\u4E0A\u5347\u6CBF\uFF0C\u4FDD\u5B58\u672C\u6B21\u7ED3\u679C |
| P+ | \u672C\u793A\u4F8B\u672A\u8FDE\u63A5\uFF0C\u4E0D\u4F1A\u52A0\u8F7D\u7ED3\u679C |

\u8F93\u5165\u987A\u5E8F\u4E3A **K4 K3 K2 K1 K0**\uFF0C\u4F7F\u7528\u4E94\u4F4D\u8865\u7801\uFF0C\u8303\u56F4\u4E3A \u221216\uFF5E15\u3002\u4F8B\uFF1A7 \u4E3A 00111\uFF0C\u221212 \u4E3A 10100\uFF0C\u22122 \u4E3A 11110\u3002\u51CF\u53BB 6 \u65F6\u8F93\u5165\u6B63\u6570 00110\uFF0C\u518D\u628A K5 \u8BBE\u7F6E\u4E3A 1

## \u8F93\u51FA\u53E3

| \u7AEF\u53E3 | \u4F5C\u7528 |
| --- | --- |
| L5 | \u9AD8\u7B26\u53F7\u4F4D |
| L4 | \u4F4E\u7B26\u53F7\u4F4D |
| L3\u3001L2\u3001L1\u3001L0 | \u7ED3\u679C\u7684\u56DB\u4E2A\u6570\u503C\u4F4D\uFF0CL0 \u6700\u4F4E\u4F4D |
| L6 | \u4E24\u4E2A\u7B26\u53F7\u4F4D\u5F02\u6216\u7684\u7ED3\u679C\uFF0C1 \u8868\u793A\u5F53\u524D\u7ED3\u679C\u6EA2\u51FA |

\u7ED3\u679C\u6309 **L5 L4\uFF5CL3 L2 L1 L0** \u8BFB\u53D6\u3002\u7B26\u53F7 00\u300111 \u4E3A\u672A\u6EA2\u51FA\uFF0C01 \u4E3A\u6B63\u6EA2\u51FA\uFF0C10 \u4E3A\u8D1F\u6EA2\u51FA\u3002\u6240\u6709\u8F93\u5165\u3001\u8F93\u51FA\u6307\u793A\u706F\u5747\u5728 **\u5DF2\u77E5\u9AD8\u7535\u5E73 1 \u65F6\u70B9\u4EAE**\uFF0CX \u6216 Z \u72B6\u6001\u4E0B\u4FDD\u6301\u7184\u706D

## \u64CD\u4F5C\u6B65\u9AA4

1. \u6253\u5F00\u7535\u6E90\u540E\uFF0C\u5C06 K6 \u5207\u5230 0 \u518D\u5207\u56DE 1\uFF0CL6\uFF5EL0 \u5E94\u663E\u793A 000 0000
2. \u8BBE\u7F6E K4\uFF5EK0 \u548C\u52A0\u51CF\u63A7\u5236 K5\uFF0C\u5E76\u4FDD\u6301\u8F93\u5165\u7A33\u5B9A
3. \u53D1\u51FA\u4E00\u6B21\u5B8C\u6574 P\u2212 \u8109\u51B2\u540E\uFF0C\u8BFB\u53D6 L5\uFF5EL0 \u7684\u516D\u4F4D\u7ED3\u679C\uFF0CL6 \u5355\u72EC\u6307\u793A\u6EA2\u51FA

\u8C03\u6574\u8F93\u5165\u65F6\uFF0C\u5BC4\u5B58\u5668\u91CC\u7684\u7D2F\u8BA1\u503C\u4FDD\u6301\u539F\u6837\u3002\u53D1\u51FA\u6709\u6548\u8109\u51B2\u540E\uFF0C\u7ED3\u679C\u624D\u4F1A\u66F4\u65B0\u3002\u6BCF\u8F93\u5165\u4E00\u4E2A\u6570\uFF0C\u518D\u53D1\u4E00\u6B21\u8109\u51B2\uFF0C\u5C31\u80FD\u63A5\u7740\u7B97\u4E0B\u4E00\u6B65\u3002

## \u9A8C\u6536

| \u7B97\u5F0F | \u6BCF\u6B21\u8109\u51B2\u540E\u7684\u7D2F\u8BA1\u7ED3\u679C |
| --- | --- |
| 7\uFF0B5\u22126\uFF0B12 | 00 0111 \u2192 00 1100 \u2192 00 0110 \u2192 **01 0010**\uFF08\u6B63\u6EA2\u51FA\uFF09 |
| \uFF08\u221212\uFF09\uFF0B\uFF08\u22122\uFF09\u22126 | 11 0100 \u2192 11 0010 \u2192 **10 1100**\uFF08\u8D1F\u6EA2\u51FA\uFF09 |

## \u8D70\u7EBF\u4E0E\u7EBF\u8272

K\u3001L\u3001P \u4FE1\u53F7\u76F4\u63A5\u8FDE\u5230\u4E86\u5BF9\u5E94\u7684\u9762\u5305\u677F\u5217\uFF0C\u8F93\u5165\u8F93\u51FA\u677F\u7528\u4F5C\u4FE1\u53F7\u663E\u793A\u548C\u64CD\u4F5C\u3002\u5BFC\u7EBF\u63A5\u5728\u9762\u5305\u677F\u5B54\u6216\u53F3\u4FA7\u7535\u6E90\u8F68\u5B54\u4E0A\uFF0C\u7AEF\u53E3\u4E0E\u5B54\u4F4D\u7684\u5BF9\u5E94\u5173\u7CFB\u89C1\u63A5\u7EBF\u8BF4\u660E

\u7B2C\u56DB\u5757\u9762\u5305\u677F\u7528\u7EC6\u7EBF\u6865\u63A5\u4E86\u8F93\u5165\u4E0E\u8109\u51B2\u5BF9\u5E94\u5217\uFF0C\u4E0A\u4E0B A\uFF5EJ \u7684\u7A7A\u5B54\u53EF\u4EE5\u8BFB\u53D6\u540C\u4E00\u4FE1\u53F7\uFF0C\u5176\u4ED6\u5217\u53CA X/Y \u6BCD\u7EBF\u5206\u522B\u8FDE\u63A5

\u7EA2\u8272\u4E3A\u7535\u6E90\uFF0C\u6DF1\u7070\u4E3A\u5730\uFF0C\u7EFF\u8272\u4E3A\u6570\u503C\u4E0E\u7B26\u53F7\u8F93\u5165\uFF08\u5305\u62EC\u53D6\u53CD\u540E\u7684\u6570\u636E\uFF09\uFF0C\u7D2B\u8272\u4E3A\u52A0\u51CF\u63A7\u5236\u548C\u8FDB\u4F4D\uFF0C\u84DD\u8272\u4E3A\u8BA1\u7B97\u7ED3\u679C\u9001\u5165\u5BC4\u5B58\u5668\uFF0C\u9EC4\u8272\u4E3A\u5BC4\u5B58\u5668\u53CD\u9988\uFF0C\u9752\u8272\u4E3A L0\uFF5EL5 \u7ED3\u679C\u8F93\u51FA\uFF0C\u6A59\u8272\u4E3A\u6EA2\u51FA\u5224\u65AD\u652F\u8DEF\u53CA L6 \u8F93\u51FA\uFF0C\u7C89\u8272\u4E3A\u6E05\u96F6\u548C\u65F6\u949F

\u5BFC\u7EBF\u6CBF\u5206\u5F00\u7684\u901A\u9053\u7ED5\u5F00\u4E86\u82AF\u7247\u5916\u6846\uFF0C\u901A\u8FC7\u4E24\u7AEF\u63D2\u5165\u7684\u5B54\u5EFA\u7ACB\u8FDE\u63A5\uFF0C\u4EA4\u53C9\u5904\u4FDD\u6301\u7EDD\u7F18\u3002\u5F53\u4F60\u786E\u8BA4\u5DE6\u4FA7\u7684\u201C\u6574\u7406\u8D70\u7EBF\u201D\u64CD\u4F5C\u540E\uFF0C\u7A0B\u5E8F\u4F1A\u8C03\u6574\u5F53\u524D\u8DEF\u5F84\uFF0C\u5E76\u4FDD\u7559\u82AF\u7247\u4F4D\u7F6E\u3001\u7AEF\u70B9\u3001\u7EBF\u8272\u548C\u5907\u6CE8\uFF0C\u6574\u4E2A\u64CD\u4F5C\u652F\u6301\u64A4\u9500

\u91CD\u65B0\u52A0\u8F7D\u6587\u4EF6\u3001\u65AD\u7535\u6216\u64A4\u9500\u540E\uFF0C\u9700\u8981\u518D\u7ED9\u5BC4\u5B58\u5668\u6E05\u96F6\u3002\u8FD9\u91CC\u7528\u7684\u662F\u7406\u60F3\u6570\u5B57\u903B\u8F91\u6A21\u578B\uFF0C\u7535\u6D41\u3001\u6309\u952E\u6296\u52A8\u548C\u5B9E\u9645\u4F20\u64AD\u65F6\u5EF6\u8981\u5728\u5B9E\u7269\u5B9E\u9A8C\u4E2D\u89C2\u5BDF\u3002
`;
  function complementPreset() {
    const project = emptyProject();
    project.inputCount = COMPLEMENT_PORT_COUNT;
    project.outputCount = COMPLEMENT_PORT_COUNT;
    project.notes = COMPLEMENT_NOTES;
    project.name = COMPLEMENT_NAME;
    project.chips = structuredClone(PRESET_CHIPS);
    const usage = {};
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      const powerPin = chip.id + "-" + model.power;
      const groundPin = chip.id + "-" + model.ground;
      connect(project, usage, power, powerPin, PRESET_WIRE_COLORS.power);
      connect(project, usage, ground, groundPin, PRESET_WIRE_COLORS.ground);
      power = powerPin;
      ground = groundPin;
    }
    for (const pin of UNUSED_INPUTS) {
      connect(project, usage, ground, pin, PRESET_WIRE_COLORS.ground);
      ground = pin;
    }
    for (let bit = 0; bit < 4; bit = bit + 1) {
      connect(project, usage, "K" + bit, "U4-" + INPUT_PINS[bit], PRESET_WIRE_COLORS.input);
      connect(project, usage, "U4-" + OUTPUT_PINS[bit], "U2-" + ADDER_PINS[bit], PRESET_WIRE_COLORS.input);
    }
    connect(project, usage, "K4", "U5-1", PRESET_WIRE_COLORS.input);
    let control = "K5";
    for (const pin of CONTROL_PINS) {
      connect(project, usage, control, pin, PRESET_WIRE_COLORS.control);
      control = pin;
    }
    connect(project, usage, "U5-3", "U3-6", PRESET_WIRE_COLORS.input);
    connect(project, usage, "U3-6", "U3-2", PRESET_WIRE_COLORS.input);
    connect(project, usage, "U2-9", "U3-7", PRESET_WIRE_COLORS.control);
    for (const pair of SUM_CONNECTIONS) {
      connect(project, usage, pair[0], pair[1], PRESET_WIRE_COLORS.result);
    }
    for (const pair of FEEDBACK_CONNECTIONS) {
      connect(project, usage, pair[0], pair[1], PRESET_WIRE_COLORS.feedback);
    }
    for (let bit = 0; bit < 6; bit = bit + 1) {
      connect(project, usage, "U1-" + REGISTER_OUTPUTS[bit], "L" + bit, PRESET_WIRE_COLORS.output);
    }
    connect(project, usage, "U1-12", "U5-4", PRESET_WIRE_COLORS.overflow);
    connect(project, usage, "U1-15", "U5-5", PRESET_WIRE_COLORS.overflow);
    connect(project, usage, "U5-6", "L6", PRESET_WIRE_COLORS.overflow);
    connect(project, usage, "K6", "U1-1", PRESET_WIRE_COLORS.timing);
    connect(project, usage, "P-", "U1-11", PRESET_WIRE_COLORS.timing);
    for (const wire of project.wires) {
      if (Object.hasOwn(preset_routes_default, wire.id)) {
        wire.bends = structuredClone(preset_routes_default[wire.id]);
      }
    }
    project.switches[COMPLEMENT_RESET_INPUT] = 1;
    return project;
  }
  function presetWireKey(wire) {
    const first = baseNode(wire.from);
    const second = baseNode(wire.to);
    if (first < second) {
      return first + "|" + second;
    }
    return second + "|" + first;
  }
  function isComplementPreset(project) {
    const reference = complementPreset();
    if (project.chips.length !== reference.chips.length || project.wires.length !== reference.wires.length) {
      return false;
    }
    if (project.pullUps.length !== reference.pullUps.length) {
      return false;
    }
    const chips = /* @__PURE__ */ new Map();
    for (const chip of project.chips) {
      chips.set(chip.id, chip);
    }
    for (const expected of reference.chips) {
      const actual = chips.get(expected.id);
      if (!actual || actual.model !== expected.model || actual.section !== expected.section || actual.column !== expected.column) {
        return false;
      }
    }
    const wires = /* @__PURE__ */ new Map();
    for (const wire of reference.wires) {
      const key = presetWireKey(wire);
      let count = 0;
      if (wires.has(key)) {
        count = wires.get(key);
      }
      wires.set(key, count + 1);
    }
    for (const wire of project.wires) {
      const key = presetWireKey(wire);
      const count = wires.get(key);
      if (!count) {
        return false;
      }
      wires.set(key, count - 1);
    }
    return true;
  }

  // src/board/wire-path.mjs
  var WIRE_PATH = { tolerance: 1e-6, cornerSize: BOARD.pitch, cornerPortion: 1 / 3 };
  function simplifyWirePath(points) {
    const result = [];
    for (const point of points) {
      const previous = result[result.length - 1];
      if (previous && previous.x === point.x && previous.y === point.y) {
        continue;
      }
      while (result.length >= 2) {
        const last = result[result.length - 1];
        const before = result[result.length - 2];
        const firstHorizontal = last.x - before.x;
        const firstVertical = last.y - before.y;
        const nextHorizontal = point.x - last.x;
        const nextVertical = point.y - last.y;
        const cross = firstHorizontal * nextVertical - firstVertical * nextHorizontal;
        const direction = firstHorizontal * nextHorizontal + firstVertical * nextVertical;
        if (Math.abs(cross) > WIRE_PATH.tolerance || direction <= 0) {
          break;
        }
        result.pop();
      }
      result.push({ x: point.x, y: point.y });
    }
    return result;
  }
  function angleWirePath(points) {
    if (points.length === 0) {
      return [];
    }
    const result = [points[0]];
    for (let index = 1; index < points.length; index = index + 1) {
      const first = points[index - 1];
      const last = points[index];
      const horizontal = last.x - first.x;
      const vertical = last.y - first.y;
      if (horizontal !== 0 && vertical !== 0) {
        const diagonal = Math.abs(Math.abs(horizontal) - Math.abs(vertical)) <= WIRE_PATH.tolerance;
        if (!diagonal || Math.abs(horizontal) > WIRE_PATH.cornerSize + WIRE_PATH.tolerance) {
          const corner = { x: last.x, y: first.y };
          const section = shortCornerPath([first, corner, last], [], Infinity);
          for (let position = 1; position < section.length - 1; position = position + 1) {
            result.push(section[position]);
          }
        }
      }
      result.push(last);
    }
    return simplifyWirePath(result);
  }
  function shortCornerPath(points, obstacles, maximumPoints) {
    const result = [];
    for (let index = 0; index < points.length; index = index + 1) {
      const corner = points[index];
      if (index === 0 || index === points.length - 1) {
        result.push(corner);
        continue;
      }
      const before = points[index - 1];
      const after = points[index + 1];
      const incomingX = corner.x - before.x;
      const incomingY = corner.y - before.y;
      const outgoingX = after.x - corner.x;
      const outgoingY = after.y - corner.y;
      const incomingAxis = incomingX === 0 || incomingY === 0;
      const outgoingAxis = outgoingX === 0 || outgoingY === 0;
      const perpendicular = incomingX * outgoingX + incomingY * outgoingY === 0;
      const remaining = points.length - index - 1;
      if (!incomingAxis || !outgoingAxis || !perpendicular || result.length + remaining + 2 > maximumPoints) {
        result.push(corner);
        continue;
      }
      const incomingLength = Math.hypot(incomingX, incomingY);
      const outgoingLength = Math.hypot(outgoingX, outgoingY);
      const size = Math.min(WIRE_PATH.cornerSize, incomingLength * WIRE_PATH.cornerPortion, outgoingLength * WIRE_PATH.cornerPortion);
      if (size <= WIRE_PATH.tolerance) {
        result.push(corner);
        continue;
      }
      const first = { x: corner.x - Math.sign(incomingX) * size, y: corner.y - Math.sign(incomingY) * size };
      const last = { x: corner.x + Math.sign(outgoingX) * size, y: corner.y + Math.sign(outgoingY) * size };
      let blocked = false;
      for (const obstacle of obstacles) {
        if (segmentCrossesBounds(first, last, obstacle)) {
          blocked = true;
          break;
        }
      }
      if (blocked) {
        result.push(corner);
      } else {
        result.push(first, last);
      }
    }
    return simplifyWirePath(result);
  }
  function segmentCrossesBounds(first, last, bounds) {
    let enter = 0;
    let leave = 1;
    const starts = [first.x, first.y];
    const changes = [last.x - first.x, last.y - first.y];
    const minimums = [bounds.x + WIRE_PATH.tolerance, bounds.y + WIRE_PATH.tolerance];
    const maximums = [bounds.x + bounds.width - WIRE_PATH.tolerance, bounds.y + bounds.height - WIRE_PATH.tolerance];
    for (let axis = 0; axis < 2; axis = axis + 1) {
      const start2 = starts[axis];
      const change = changes[axis];
      if (Math.abs(change) <= WIRE_PATH.tolerance) {
        if (start2 < minimums[axis] || start2 > maximums[axis]) {
          return false;
        }
      } else {
        const firstPortion = (minimums[axis] - start2) / change;
        const lastPortion = (maximums[axis] - start2) / change;
        enter = Math.max(enter, Math.min(firstPortion, lastPortion));
        leave = Math.min(leave, Math.max(firstPortion, lastPortion));
        if (enter >= leave) {
          return false;
        }
      }
    }
    return enter < leave;
  }

  // src/board/geometry.mjs
  var PICK = { nodeRadius: 7, wireRadius: 5, endpointRadius: 14, handleRadius: 9, switchHalfWidth: 15, pulseHalfWidth: 16, buttonTop: 17, buttonBottom: 60 };
  var WIRE_LAYOUT = { laneStart: 12, laneCount: 9, laneStep: 5, sameRowDistance: 12 };
  var CHIP_LAYOUT = { leftOffset: 9, topOffset: 9, height: 32 };
  var endpointPositions = /* @__PURE__ */ new WeakMap();
  function fixedPositions(endpoints2) {
    let positions = endpointPositions.get(endpoints2);
    if (!positions) {
      positions = [];
      for (const name of endpoints2) {
        positions.push(endpointPosition(name));
      }
      endpointPositions.set(endpoints2, positions);
    }
    return positions;
  }
  function chipBounds(chip) {
    const count = CHIP_MODELS[chip.model].count;
    const left = BOARD.startX + (chip.column - 1) * BOARD.pitch - CHIP_LAYOUT.leftOffset;
    const top = rowY(chip.section, "E") + CHIP_LAYOUT.topOffset;
    return { x: left, y: top, width: count / 2 * BOARD.pitch, height: CHIP_LAYOUT.height };
  }
  function wirePoints(wire, index) {
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    const points = [first];
    if (wire.bends.length > 0) {
      for (const bend of wire.bends) {
        points.push(bend);
      }
    } else if (wire.angle !== 45) {
      const laneOffset = WIRE_LAYOUT.laneStart + index % WIRE_LAYOUT.laneCount * WIRE_LAYOUT.laneStep;
      let lane = (first.y + last.y) / 2 + laneOffset;
      if (Math.abs(first.y - last.y) < WIRE_LAYOUT.sameRowDistance) {
        lane = first.y - laneOffset;
      }
      points.push({ x: first.x, y: lane });
      points.push({ x: last.x, y: lane });
    }
    points.push(last);
    if (wire.angle === 45) {
      return angleWirePath(points);
    }
    return points;
  }
  function wireDisplayPaths(wires) {
    const basePaths = [];
    for (let index = 0; index < wires.length; index = index + 1) {
      basePaths.push(wirePoints(wires[index], index));
    }
    return basePaths;
  }
  function segmentDistance(point, first, last) {
    const horizontal = last.x - first.x;
    const vertical = last.y - first.y;
    const length = horizontal * horizontal + vertical * vertical;
    if (length === 0) {
      return Math.hypot(point.x - first.x, point.y - first.y);
    }
    let portion = ((point.x - first.x) * horizontal + (point.y - first.y) * vertical) / length;
    portion = Math.max(0, Math.min(1, portion));
    return Math.hypot(point.x - first.x - portion * horizontal, point.y - first.y - portion * vertical);
  }
  function wireDistance(point, points) {
    let nearest = Infinity;
    for (let segment = 1; segment < points.length; segment = segment + 1) {
      const distance = segmentDistance(point, points[segment - 1], points[segment]);
      nearest = Math.min(nearest, distance);
    }
    return nearest;
  }
  function isInputResetButton(point) {
    const vertical = point.y - PORT_LAYOUT.inputY;
    const horizontal = Math.abs(point.x - columnX(INPUT_RESET_COLUMN));
    return vertical >= PICK.buttonTop && vertical <= PICK.buttonBottom && horizontal <= PICK.pulseHalfWidth;
  }
  function hitCandidates(point, state2, endpoints2) {
    const candidates = [];
    const displayPaths = wireDisplayPaths(state2.project.wires);
    if (point.y >= PORT_LAYOUT.inputY + PICK.buttonTop && point.y <= PORT_LAYOUT.inputY + PICK.buttonBottom) {
      for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const location2 = endpointPosition("K" + index);
        if (Math.abs(point.x - location2.x) <= PICK.switchHalfWidth) {
          return [{ kind: "switch", id: index }];
        }
      }
      for (const name of ["P+", "P-"]) {
        const location2 = endpointPosition(name);
        if (Math.abs(point.x - location2.x) <= PICK.pulseHalfWidth) {
          return [{ kind: "pulse", id: name }];
        }
      }
    }
    for (let index = state2.project.wires.length - 1; index >= 0; index = index - 1) {
      const wire = state2.project.wires[index];
      if (state2.hiddenWires && state2.hiddenWires.has(wire.id)) {
        continue;
      }
      const points = displayPaths[index];
      if (wireDistance(point, points) < PICK.wireRadius) {
        candidates.push({ kind: "wire", id: wire.id });
      }
    }
    const positions = fixedPositions(endpoints2);
    const radiusSquared = PICK.nodeRadius * PICK.nodeRadius;
    for (let index = 0; index < positions.length; index = index + 1) {
      const location2 = positions[index];
      const horizontal = point.x - location2.x;
      const vertical = point.y - location2.y;
      if (horizontal * horizontal + vertical * vertical <= radiusSquared) {
        candidates.push({ kind: "node", id: endpoints2[index] });
      }
    }
    for (const chip of state2.project.chips) {
      const bounds = chipBounds(chip);
      if (point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
        candidates.push({ kind: "chip", id: chip.id });
      }
    }
    return candidates;
  }
  function nearestWire(point, wires, hiddenWires, selected) {
    let nearest = null;
    let nearestDistance = PICK.wireRadius;
    for (let index = wires.length - 1; index >= 0; index = index - 1) {
      const wire = wires[index];
      const points = wirePoints(wire, index);
      const distance = wireDistance(point, points);
      if (distance >= PICK.wireRadius || distance > nearestDistance) {
        continue;
      }
      if (distance === nearestDistance) {
        const selectedWire = selected && selected.kind === "wire";
        if (selectedWire && nearest.id === selected.id) {
          continue;
        }
        const keepVisible = !hiddenWires.has(nearest.id) || hiddenWires.has(wire.id);
        if (keepVisible && (!selectedWire || wire.id !== selected.id)) {
          continue;
        }
      }
      nearest = wire;
      nearestDistance = distance;
    }
    return nearest;
  }
  function hitTest(point, state2, endpoints2) {
    const candidates = hitCandidates(point, state2, endpoints2);
    if (candidates.length > 0) {
      return candidates[0];
    }
    return null;
  }
  function objectSelected(state2, kind, id) {
    if (state2.selection && state2.selection.length > 0) {
      for (const target of state2.selection) {
        if (target.kind === kind && target.id === id) {
          return true;
        }
      }
      return false;
    }
    return Boolean(state2.selected && state2.selected.kind === kind && state2.selected.id === id);
  }
  function nearestEndpoint(point, endpoints2) {
    let nearest = "";
    let distance = PICK.endpointRadius;
    for (const name of endpoints2) {
      const location2 = endpointPosition(name);
      const current = Math.hypot(point.x - location2.x, point.y - location2.y);
      if (current < distance) {
        distance = current;
        nearest = name;
      }
    }
    return nearest;
  }
  function wireHandleAt(point, project, selected) {
    if (!selected || selected.kind !== "wire") {
      return null;
    }
    for (let index = 0; index < project.wires.length; index = index + 1) {
      const wire = project.wires[index];
      if (wire.id !== selected.id) {
        continue;
      }
      const points = wirePoints(wire, index);
      for (let handle = 0; handle < points.length; handle = handle + 1) {
        if (Math.hypot(point.x - points[handle].x, point.y - points[handle].y) <= PICK.handleRadius) {
          return { wire: wire.id, handle, points };
        }
      }
    }
    return null;
  }

  // src/storage/storage.mjs
  var STORAGE_KEY = "breadboard-lab-v1";
  var LIMITS = {
    chips: 40,
    // 单个实验的芯片数量上限
    wires: 800,
    // 单个实验的导线及上拉节点数量上限
    bends: 24,
    // 每根导线的转折点数量上限
    fileBytes: 2e6,
    // 导入文件字节数上限
    nameLength: 80
    // 实验名称字符数上限
  };
  var FILE_BOUNDS = { width: 1300, height: 1280 };
  var LEGACY_COMPLEMENT_PORT_COUNT = 7;
  function validWireBend(bend) {
    if (!bend || !Number.isFinite(bend.x) || !Number.isFinite(bend.y)) {
      return false;
    }
    const fitsWidth = bend.x >= 0 && bend.x <= FILE_BOUNDS.width;
    const fitsHeight = bend.y >= 0 && bend.y <= FILE_BOUNDS.height;
    return fitsWidth && fitsHeight;
  }
  function legacyNode(name, wiringVersion) {
    if (wiringVersion === void 0 && (/^[KL]\d+$/.test(name) || name === "P+" || name === "P-")) {
      return name;
    }
    if (wiringVersion === void 0) {
      return baseNode(name, 2);
    }
    return baseNode(name, wiringVersion);
  }
  function movePulseHole(name, wiringVersion) {
    if (!wiringVersion || wiringVersion === WIRING_VERSION) {
      return name;
    }
    const parts = name.split(":");
    if (parts[0] !== "B" + (BOARD.sections - 1) || !ROWS.includes(parts[1])) {
      return name;
    }
    const oldColumn = positivePulseColumn(wiringVersion);
    const newColumn = positivePulseColumn();
    const column = Number(parts[2]);
    if (column === oldColumn) {
      return parts[0] + ":" + parts[1] + ":" + newColumn;
    }
    if (column === newColumn) {
      return parts[0] + ":" + parts[1] + ":" + oldColumn;
    }
    return name;
  }
  function connectionRoot(parents, name) {
    if (!parents.has(name)) {
      parents.set(name, name);
    }
    let root = name;
    while (parents.get(root) !== root) {
      root = parents.get(root);
    }
    return root;
  }
  function verifyPortMigration(original, migrated) {
    const before = /* @__PURE__ */ new Map();
    const after = /* @__PURE__ */ new Map();
    for (const wire of original.wires) {
      const first = connectionRoot(before, legacyNode(wire.from, original.wiringVersion));
      const last = connectionRoot(before, legacyNode(wire.to, original.wiringVersion));
      before.set(last, first);
    }
    for (const wire of migrated.wires) {
      const first = connectionRoot(after, baseNode(wire.from));
      const last = connectionRoot(after, baseNode(wire.to));
      after.set(last, first);
    }
    const terminals = ["P+", "P-", "VCC", "GND"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      terminals.push("K" + bit, "L" + bit);
    }
    for (const chip of migrated.chips) {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        terminals.push(pinHole(chip, pin));
      }
    }
    const forward = /* @__PURE__ */ new Map();
    const reverse = /* @__PURE__ */ new Map();
    const endpoints2 = [];
    for (const name of terminals) {
      endpoints2.push({ previous: name, current: name });
    }
    for (let index = 0; index < migrated.pullUps.length; index = index + 1) {
      endpoints2.push({ previous: original.pullUps[index], current: migrated.pullUps[index] });
    }
    for (const endpoint of endpoints2) {
      const oldGroup = connectionRoot(before, legacyNode(endpoint.previous, original.wiringVersion));
      const newGroup = connectionRoot(after, baseNode(endpoint.current));
      if (forward.has(oldGroup) && forward.get(oldGroup) !== newGroup || reverse.has(newGroup) && reverse.get(newGroup) !== oldGroup) {
        throw new Error("\u65E7\u5B9E\u9A8C\u5728 " + endpoint.previous + " \u5BF9\u5E94\u5217\u5DF2\u6709\u5176\u4ED6\u4FE1\u53F7\uFF0C\u8FC1\u79FB\u4F1A\u6539\u53D8\u8FDE\u63A5\uFF0C\u8BF7\u5148\u5907\u4EFD\u5E76\u8C03\u6574\u8BE5\u5217\u63A5\u7EBF");
      }
      forward.set(oldGroup, newGroup);
      reverse.set(newGroup, oldGroup);
    }
  }
  function migrateEndpoint(name, occupied2) {
    if (isPhysicalHole(name)) {
      return name;
    }
    const preferred = portHole(name);
    if (preferred === "") {
      throw new Error("\u65E0\u6CD5\u627E\u5230\u7AEF\u53E3\u5BF9\u5E94\u7684\u9762\u5305\u677F\u5B54\uFF1A" + name);
    }
    const parts = preferred.split(":");
    if (preferred.startsWith("R:")) {
      for (let index = Number(parts[2]); index >= 0; index = index - 1) {
        const hole = parts[0] + ":" + parts[1] + ":" + index;
        if (!occupied2.has(hole)) {
          occupied2.add(hole);
          return hole;
        }
      }
    } else {
      let rows = "JIHGF";
      if (parts[1] === "A") {
        rows = "ABCDE";
      }
      for (const row of rows) {
        const hole = parts[0] + ":" + row + ":" + parts[2];
        if (!occupied2.has(hole)) {
          occupied2.add(hole);
          return hole;
        }
      }
    }
    throw new Error(name + " \u5BF9\u5E94\u5217\u5DF2\u65E0\u7A7A\u5B54\uFF0C\u539F\u6587\u4EF6\u672A\u4FEE\u6539\uFF0C\u8BF7\u5148\u817E\u51FA\u4E00\u4E2A\u63D2\u5B54");
  }
  function validateProjectHeader(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.chips) || !Array.isArray(value.wires) || !Array.isArray(value.switches)) {
      throw new Error("\u6587\u4EF6\u4E0D\u662F\u53D7\u652F\u6301\u7684\u7535\u8DEF\u683C\u5F0F");
    }
    if (value.wiringVersion !== void 0 && ![2, 3, WIRING_VERSION].includes(value.wiringVersion)) {
      throw new Error("\u4E0D\u652F\u6301\u8FD9\u4EFD\u6587\u4EF6\u7684\u63A5\u7EBF\u5E03\u5C40\u7248\u672C");
    }
    if (value.chips.length > LIMITS.chips || value.wires.length > LIMITS.wires || value.switches.length !== IO_LIMIT) {
      throw new Error("\u7535\u8DEF\u89C4\u6A21\u8D85\u8FC7\u9650\u5236\uFF0C\u6216\u6309\u952E\u6570\u91CF\u4E0D\u6B63\u786E");
    }
  }
  function restoreProjectSettings(value, project) {
    if (value.inputCount !== void 0 || value.outputCount !== void 0) {
      if (!validIoCount(value.inputCount) || !validIoCount(value.outputCount)) {
        throw new Error("\u8F93\u5165\u548C\u8F93\u51FA\u663E\u793A\u4F4D\u6570\u5FC5\u987B\u4E3A 1\uFF5E" + IO_LIMIT);
      }
      project.inputCount = value.inputCount;
      project.outputCount = value.outputCount;
    }
    if (value.mode === "complement") {
      project.inputCount = Math.max(project.inputCount, LEGACY_COMPLEMENT_PORT_COUNT);
      project.outputCount = Math.max(project.outputCount, LEGACY_COMPLEMENT_PORT_COUNT);
    }
    if (value.notes === void 0 && value.mode === "complement") {
      project.notes = COMPLEMENT_NOTES;
    } else if (value.notes !== void 0) {
      if (typeof value.notes !== "string" || value.notes.length > NOTES_LIMIT) {
        throw new Error("\u5907\u6CE8\u5FC5\u987B\u662F\u6587\u5B57\uFF0C\u4E14\u4E0D\u80FD\u8D85\u8FC7 " + NOTES_LIMIT + " \u4E2A\u5B57\u7B26");
      }
      project.notes = value.notes;
    }
    if (typeof value.name === "string") {
      project.name = value.name.slice(0, LIMITS.nameLength);
    }
    project.power = value.power === true;
  }
  function restorePullUps(value, project) {
    if (value.pullUps !== void 0) {
      if (!Array.isArray(value.pullUps) || value.pullUps.length > LIMITS.wires) {
        throw new Error("\u4E0A\u62C9\u8282\u70B9\u5217\u8868\u683C\u5F0F\u4E0D\u6B63\u786E");
      }
      const seen = /* @__PURE__ */ new Set();
      for (const endpoint of value.pullUps) {
        if (!validEndpoint(endpoint) || seen.has(endpoint)) {
          throw new Error("\u4E0A\u62C9\u8282\u70B9\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
        }
        project.pullUps.push(movePulseHole(endpoint, value.wiringVersion));
        seen.add(endpoint);
      }
    }
  }
  function restoreChips(value, project) {
    const identifiers = /* @__PURE__ */ new Set();
    const occupied2 = /* @__PURE__ */ new Set();
    for (const entry of value.chips) {
      if (!entry || typeof entry.id !== "string" || !/^U[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
        throw new Error("\u82AF\u7247\u7F16\u53F7\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
      }
      const chip = { id: entry.id, model: entry.model, section: entry.section, column: entry.column };
      const error = placementError(project.chips, chip, "");
      if (error !== "") {
        throw new Error(error);
      }
      identifiers.add(chip.id);
      project.chips.push(chip);
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        occupied2.add(pinHole(chip, pin));
      }
    }
    return occupied2;
  }
  function restoreWires(value, project, occupied2) {
    const identifiers = /* @__PURE__ */ new Set();
    const reserved = new Set(occupied2);
    for (const entry of value.wires) {
      if (entry && isPhysicalHole(entry.from)) {
        reserved.add(movePulseHole(entry.from, value.wiringVersion));
      }
      if (entry && isPhysicalHole(entry.to)) {
        reserved.add(movePulseHole(entry.to, value.wiringVersion));
      }
    }
    for (const entry of value.wires) {
      if (!entry || typeof entry.id !== "string" || !/^W[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
        throw new Error("\u5BFC\u7EBF\u7F16\u53F7\u4E0D\u5408\u6CD5\u6216\u91CD\u590D");
      }
      if (!validEndpoint(entry.from) || !validEndpoint(entry.to) || entry.from === entry.to) {
        throw new Error("\u5BFC\u7EBF\u7AEF\u70B9\u4E0D\u5408\u6CD5\uFF0C\u6216\u540C\u4E00\u4E2A\u5B54\u88AB\u91CD\u590D\u5360\u7528");
      }
      if (typeof entry.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(entry.color) || !Array.isArray(entry.bends) || entry.bends.length > LIMITS.bends) {
        throw new Error("\u5BFC\u7EBF\u989C\u8272\u6216\u8F6C\u6298\u70B9\u4E0D\u5408\u6CD5");
      }
      const bends = [];
      for (const bend of entry.bends) {
        if (!validWireBend(bend)) {
          throw new Error("\u5BFC\u7EBF\u8F6C\u6298\u70B9\u8D85\u51FA\u9762\u5305\u677F\u8303\u56F4");
        }
        bends.push({ x: bend.x, y: bend.y });
      }
      const firstHole = movePulseHole(entry.from, value.wiringVersion);
      const lastHole = movePulseHole(entry.to, value.wiringVersion);
      const from = migrateEndpoint(firstHole, reserved);
      const to = migrateEndpoint(lastHole, reserved);
      if (from === to || occupied2.has(from) || occupied2.has(to)) {
        throw new Error("\u5BFC\u7EBF\u6216\u82AF\u7247\u5360\u7528\u4E86\u540C\u4E00\u4E2A\u5B54\uFF0C\u8BF7\u68C0\u67E5\u7AEF\u70B9");
      }
      if (from !== entry.from || to !== entry.to) {
        bends.length = 0;
      }
      const wire = { id: entry.id, from, to, color: entry.color, bends };
      if (entry.angle !== void 0 && entry.angle !== 45) {
        throw new Error("\u5BFC\u7EBF\u89D2\u5EA6\u8BBE\u7F6E\u4E0D\u6B63\u786E");
      }
      if (entry.angle === 45) {
        wire.angle = 45;
      }
      project.wires.push(wire);
      occupied2.add(from);
      occupied2.add(to);
      identifiers.add(entry.id);
    }
  }
  function restoreSwitches(value, project) {
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      if (value.switches[index] !== 0 && value.switches[index] !== 1) {
        throw new Error("\u6309\u952E\u72B6\u6001\u5FC5\u987B\u662F 0 \u6216 1");
      }
      project.switches[index] = value.switches[index];
    }
  }
  function validateProject(value) {
    validateProjectHeader(value);
    const project = emptyProject();
    restoreProjectSettings(value, project);
    restorePullUps(value, project);
    const occupied2 = restoreChips(value, project);
    restoreWires(value, project, occupied2);
    restoreSwitches(value, project);
    if (value.wiringVersion !== WIRING_VERSION) {
      verifyPortMigration(value, project);
    }
    return project;
  }

  // src/ui/runtime-scripts.mjs
  var loadingScripts = /* @__PURE__ */ new Map();
  function loadRuntimeScript(filename) {
    if (loadingScripts.has(filename)) {
      return loadingScripts.get(filename);
    }
    function startLoading(resolve, reject) {
      const script = document.createElement("script");
      script.src = filename;
      script.async = true;
      function loaded() {
        resolve();
      }
      function failed() {
        loadingScripts.delete(filename);
        script.remove();
        reject(new Error("\u65E0\u6CD5\u52A0\u8F7D\u672C\u5730\u8FD0\u884C\u6587\u4EF6\uFF1A" + filename));
      }
      script.addEventListener("load", loaded, { once: true });
      script.addEventListener("error", failed, { once: true });
      document.head.append(script);
    }
    const loading = new Promise(startLoading);
    loadingScripts.set(filename, loading);
    return loading;
  }

  // src/board/routing-runtime.mjs
  var ROUTING_SCRIPT = "vendor/routing-runtime.js";
  var initialization = null;
  async function loadRoutingRuntime() {
    if (typeof window === "undefined") {
      const runtime = await import("libavoid-js");
      await runtime.AvoidLib.load();
      return runtime.AvoidLib.getInstance();
    }
    await loadRuntimeScript(ROUTING_SCRIPT);
    return window.BreadboardRouting.loadRouting();
  }
  function resetInitialization(error) {
    initialization = null;
    throw error;
  }
  function initializeRouting() {
    if (!initialization) {
      initialization = loadRoutingRuntime().catch(resetInitialization);
    }
    return initialization;
  }

  // src/board/routing.mjs
  var ROUTING = {
    // 提高每个额外正交线段的代价，避免连续小折段
    segmentPenalty: 2e3,
    shapeBuffer: 5,
    nudgingDistance: 6,
    bottomBoundary: 1110,
    boundaryDepth: 1e3
  };
  function yieldFrame(resolve) {
    setTimeout(resolve, 0);
  }
  function createRouter(Avoid) {
    const router = new Avoid.Router(Avoid.RouterFlag.OrthogonalRouting.value);
    const parameter = Avoid.RoutingParameter;
    router.setRoutingParameter(parameter.segmentPenalty, ROUTING.segmentPenalty);
    router.setRoutingParameter(parameter.shapeBufferDistance, ROUTING.shapeBuffer);
    router.setRoutingParameter(parameter.idealNudgingDistance, ROUTING.nudgingDistance);
    router.setRoutingOption(Avoid.RoutingOption.nudgeOrthogonalTouchingColinearSegments, true);
    router.setRoutingOption(Avoid.RoutingOption.nudgeSharedPathsWithCommonEndPoint, true);
    router.setRoutingOption(Avoid.RoutingOption.nudgeOrthogonalSegmentsConnectedToShapes, true);
    return router;
  }
  function keepObject(objects, value) {
    objects.push(value);
    return value;
  }
  function addObstacles(Avoid, router, project, objects) {
    const bounds = [];
    for (const chip of project.chips) {
      bounds.push(chipBounds(chip));
    }
    let bottom = ROUTING.bottomBoundary;
    for (const wire of project.wires) {
      bottom = Math.max(bottom, endpointPosition(wire.from).y, endpointPosition(wire.to).y);
    }
    const depth = ROUTING.boundaryDepth;
    const walls = [
      { x: -depth, y: -depth, width: depth, height: BOARD.height + depth * 2 },
      { x: BOARD.width, y: -depth, width: depth, height: BOARD.height + depth * 2 },
      { x: 0, y: -depth, width: BOARD.width, height: depth },
      { x: 0, y: bottom + ROUTING.shapeBuffer, width: BOARD.width, height: depth }
    ];
    const obstacles = bounds.concat(walls);
    for (const obstacle of obstacles) {
      const first = keepObject(objects, new Avoid.Point(obstacle.x, obstacle.y));
      const last = keepObject(objects, new Avoid.Point(obstacle.x + obstacle.width, obstacle.y + obstacle.height));
      const rectangle2 = keepObject(objects, new Avoid.Rectangle(first, last));
      new Avoid.ShapeRef(router, rectangle2);
    }
    return bounds;
  }
  function addCheckpoints(Avoid, connection, points, objects) {
    if (points.length === 0) {
      return;
    }
    const vector = keepObject(objects, new Avoid.CheckpointVector());
    for (const location2 of points) {
      const point = keepObject(objects, new Avoid.Point(location2.x, location2.y));
      const checkpoint = keepObject(objects, new Avoid.Checkpoint(point));
      vector.push_back(checkpoint);
    }
    connection.setRoutingCheckpoints(vector);
  }
  function addConnections(Avoid, router, project, targetId, objects) {
    const connections = /* @__PURE__ */ new Map();
    for (let index = 0; index < project.wires.length; index = index + 1) {
      const wire = project.wires[index];
      const first = endpointPosition(wire.from);
      const last = endpointPosition(wire.to);
      const sourcePoint = keepObject(objects, new Avoid.Point(first.x, first.y));
      const targetPoint = keepObject(objects, new Avoid.Point(last.x, last.y));
      const source = keepObject(objects, new Avoid.ConnEnd(sourcePoint));
      const target = keepObject(objects, new Avoid.ConnEnd(targetPoint));
      const connection = new Avoid.ConnRef(router, source, target);
      connection.setRoutingType(Avoid.ConnType.ConnType_Orthogonal);
      if (targetId !== "") {
        let checkpoints = wire.bends;
        if (wire.id !== targetId) {
          checkpoints = wirePoints(wire, index).slice(1, -1);
        }
        addCheckpoints(Avoid, connection, checkpoints, objects);
      }
      connections.set(wire.id, connection);
    }
    return connections;
  }
  function readRoute(connection, wire, bounds) {
    const route = connection.displayRoute();
    const points = [];
    try {
      for (let index = 0; index < route.size(); index = index + 1) {
        const point = route.at(index);
        points.push({ x: point.x, y: point.y });
        point.delete();
      }
    } finally {
      route.delete();
    }
    if (points.length < 2) {
      throw new Error("\u672A\u751F\u6210\u6709\u6548\u8D70\u7EBF\uFF1A" + wire.id);
    }
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    const source = points[0];
    const target = points[points.length - 1];
    if (source.x !== first.x && source.y !== first.y) {
      points.unshift({ x: source.x, y: first.y });
    }
    points.unshift(first);
    if (target.x !== last.x && target.y !== last.y) {
      points.push({ x: target.x, y: last.y });
    }
    points.push(last);
    for (let index = 1; index < points.length; index = index + 1) {
      for (const obstacle of bounds) {
        if (segmentCrossesBounds(points[index - 1], points[index], obstacle)) {
          throw new Error("\u8D70\u7EBF\u7A7F\u8FC7\u82AF\u7247\uFF0C\u8BF7\u8C03\u6574\u8F6C\u6298\u70B9\uFF1A" + wire.id);
        }
      }
    }
    return simplifyWirePath(points);
  }
  async function routeProject(project, angle, targetId) {
    await new Promise(yieldFrame);
    const Avoid = await initializeRouting();
    const router = createRouter(Avoid);
    const objects = [];
    try {
      const bounds = addObstacles(Avoid, router, project, objects);
      const connections = addConnections(Avoid, router, project, targetId, objects);
      router.processTransaction();
      const routes = {};
      for (const wire of project.wires) {
        if (targetId !== "" && wire.id !== targetId) {
          continue;
        }
        let points = readRoute(connections.get(wire.id), wire, bounds);
        const preserveManualPoints = targetId !== "" && wire.bends.length > 0;
        if (angle === 45 && !preserveManualPoints) {
          points = shortCornerPath(points, bounds, LIMITS.bends + 2);
        }
        const bends = points.slice(1, -1);
        if (bends.length === 0) {
          bends.push({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
        }
        if (bends.length > LIMITS.bends) {
          throw new Error("\u8D70\u7EBF\u8F6C\u6298\u70B9\u8D85\u51FA\u4E0A\u9650\uFF1A" + wire.id);
        }
        routes[wire.id] = bends;
      }
      return routes;
    } finally {
      router.delete();
      for (let index = objects.length - 1; index >= 0; index = index - 1) {
        objects[index].delete();
      }
    }
  }
  function routeWires(project, angle) {
    return routeProject(project, angle, "");
  }
  async function routeNewWire(project, wire, angle) {
    const candidate = Object.assign({}, project);
    candidate.wires = project.wires.concat([wire]);
    const routes = await routeProject(candidate, angle, wire.id);
    return routes[wire.id];
  }

  // src/board/render.mjs
  var DRAW = {
    pixelRatio: 2,
    holeRadius: 3.5,
    wireWidth: 2.4,
    selectedWireWidth: 5,
    wireOutlineWidth: 2,
    wireEndpointRadius: 4,
    handleSize: 10,
    chipText: 10,
    railLabelOffset: 17,
    railLinePadding: 10,
    sectionTopOffset: 30,
    sectionHeight: 234,
    sectionOutlineWidth: 1.6,
    boardRadius: 8
  };
  var TRENCH_DRAW = { topOffset: 15, height: 30, labelSize: 10 };
  var INPUT_DRAW = {
    top: -25,
    height: 107,
    switchLabel: 0,
    pulseLabel: 13,
    switchTop: 20,
    switchSlider: 37,
    switchTravel: 14,
    valueLabel: 67,
    ledTop: 9,
    weakLedOpacity: 0.38,
    pulseCenter: 38,
    pulseRadius: 14,
    pulsePressedOffset: 3,
    railLabel: 25
  };
  var OUTPUT_DRAW = { top: 14, height: 65, titleX: 1122, titleY: 35, ledY: 34, valueY: 40, labelY: 24 };
  var LEVEL_DRAW = { width: 13, height: 14, fontSize: 10, railInterval: 5 };
  var INTERNAL_DRAW = { lineWidth: 1, restingOpacity: 0.45, activeOpacity: 0.9 };
  var HIDDEN_WIRE_DRAW = { width: 1.6, selectedWidth: 3, dash: [7, 5], endpointRadius: 3 };
  var COLOR_NAMES = ["board", "hole", "hole-edge", "chip", "chip-text", "module", "module-text", "metal", "trace", "led-on", "led-off", "unknown", "level-floating", "ink", "muted", "rule", "accent", "paper", "surface", "error", "success"];
  var drawingFont = "";
  var drawingColors = null;
  var boardLayers = null;
  function canvasColors() {
    if (drawingColors) {
      return drawingColors;
    }
    const style = getComputedStyle(document.documentElement);
    const colors = {};
    for (const name of COLOR_NAMES) {
      colors[name] = style.getPropertyValue("--color-" + name).trim();
    }
    drawingFont = style.getPropertyValue("--font-body").trim();
    drawingColors = colors;
    return colors;
  }
  function rectangle(context, left, top, width, height, radius, color) {
    context.beginPath();
    context.roundRect(left, top, width, height, radius);
    context.fillStyle = color;
    context.fill();
  }
  function label(context, content, horizontal, vertical, size, color, align) {
    context.font = size + "px " + drawingFont;
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(content, horizontal, vertical);
  }
  function polyline(context, points, color, width) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index = index + 1) {
      context.lineTo(points[index].x, points[index].y);
    }
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
  }
  function circle(context, horizontal, vertical, radius, color) {
    context.beginPath();
    context.arc(horizontal, vertical, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  }
  function allEndpoints() {
    const endpoints2 = [];
    for (let section = 0; section < BOARD.sections; section = section + 1) {
      for (const row of ROWS) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          endpoints2.push(holeId(section, row, column));
        }
      }
      for (const row of BUS_ROWS) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          if (busHasHole(column)) {
            endpoints2.push(holeId(section, row, column));
          }
        }
      }
    }
    for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
      endpoints2.push("R:GND:" + index);
      endpoints2.push("R:VCC:" + index);
    }
    return endpoints2;
  }
  function drawBreadboards(context, emphasis, colors) {
    for (let section = 0; section < BOARD.sections; section = section + 1) {
      const top = BOARD.startY + section * BOARD.sectionHeight - DRAW.sectionTopOffset;
      rectangle(context, BOARD.panelLeft, top, BOARD.panelWidth, DRAW.sectionHeight, 7, colors.surface);
      context.strokeStyle = colors.rule;
      context.lineWidth = DRAW.sectionOutlineWidth;
      context.strokeRect(43, top + 1, 1130, 232);
      const trenchTop = rowY(section, "E") + TRENCH_DRAW.topOffset;
      const trenchCenter = trenchTop + TRENCH_DRAW.height / 2;
      rectangle(context, 64, trenchTop, 1086, TRENCH_DRAW.height, 3, colors.board);
      label(context, String(section + 1), 55, top + 116, 12, colors.muted, "center");
      for (let column = 1; column <= BOARD.columns; column = column + 1) {
        const horizontal = columnX(column);
        if (column % 2 === 1) {
          label(context, String(column), horizontal, trenchCenter, TRENCH_DRAW.labelSize, colors.muted, "center");
        }
        if (emphasis > 0) {
          context.globalAlpha = emphasis;
          polyline(context, [{ x: horizontal, y: rowY(section, "A") }, { x: horizontal, y: rowY(section, "E") }], colors.trace, 2);
          polyline(context, [{ x: horizontal, y: rowY(section, "F") }, { x: horizontal, y: rowY(section, "J") }], colors.trace, 2);
          context.globalAlpha = 1;
        }
      }
      for (const row of BUS_ROWS) {
        const vertical = rowY(section, row);
        label(context, row, 74, vertical, 9, colors.muted, "center");
        for (const segment of BUS_SEGMENTS) {
          const first = endpointPosition(holeId(section, row, segment[0]));
          const last = endpointPosition(holeId(section, row, segment[1]));
          context.globalAlpha = 0.25 + emphasis * 0.75;
          polyline(context, [first, last], colors.accent, 2);
          context.globalAlpha = 1;
        }
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          if (busHasHole(column)) {
            const location2 = endpointPosition(holeId(section, row, column));
            circle(context, location2.x, location2.y, DRAW.holeRadius + 1, colors["hole-edge"]);
            circle(context, location2.x, location2.y, DRAW.holeRadius, colors.hole);
          }
        }
      }
      for (const row of ROWS) {
        label(context, row, 74, rowY(section, row), 9, colors.muted, "center");
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
          const location2 = endpointPosition(holeId(section, row, column));
          circle(context, location2.x, location2.y, DRAW.holeRadius + 1, colors["hole-edge"]);
          circle(context, location2.x, location2.y, DRAW.holeRadius, colors.hole);
        }
      }
    }
    const railTop = RAIL_LAYOUT.startY - DRAW.railLinePadding;
    const railBottom = RAIL_LAYOUT.endY + DRAW.railLinePadding;
    const railLabel = RAIL_LAYOUT.startY - DRAW.railLabelOffset;
    polyline(context, [{ x: RAIL_LAYOUT.groundX, y: railTop }, { x: RAIL_LAYOUT.groundX, y: railBottom }], colors.hole, 3);
    polyline(context, [{ x: RAIL_LAYOUT.powerX, y: railTop }, { x: RAIL_LAYOUT.powerX, y: railBottom }], colors.error, 3);
    label(context, "GND", RAIL_LAYOUT.groundX, railLabel, 11, colors.ink, "center");
    label(context, "+5V", RAIL_LAYOUT.powerX, railLabel, 11, colors.error, "center");
    for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
      for (const name of ["GND", "VCC"]) {
        const location2 = endpointPosition("R:" + name + ":" + index);
        circle(context, location2.x, location2.y, 4.4, colors["hole-edge"]);
        circle(context, location2.x, location2.y, 3.2, colors.hole);
      }
    }
  }
  function createBoardLayer(emphasis, colors) {
    const layer = document.createElement("canvas");
    layer.width = BOARD.width * DRAW.pixelRatio;
    layer.height = BOARD.height * DRAW.pixelRatio;
    const context = layer.getContext("2d");
    context.scale(DRAW.pixelRatio, DRAW.pixelRatio);
    rectangle(context, 0, 0, BOARD.width, BOARD.height, DRAW.boardRadius, colors.board);
    drawBreadboards(context, emphasis, colors);
    return layer;
  }
  function drawBoardLayer(context, emphasis, colors) {
    if (!boardLayers) {
      boardLayers = { normal: createBoardLayer(0, colors), emphasized: null };
    }
    if (emphasis > 0 && !boardLayers.emphasized) {
      boardLayers.emphasized = createBoardLayer(1, colors);
    }
    if (emphasis < 1) {
      context.drawImage(boardLayers.normal, 0, 0, BOARD.width, BOARD.height);
    }
    if (emphasis > 0) {
      context.globalAlpha = emphasis;
      context.drawImage(boardLayers.emphasized, 0, 0, BOARD.width, BOARD.height);
      context.globalAlpha = 1;
    }
  }
  function drawModules(context, state2, colors) {
    const inputY = PORT_LAYOUT.inputY;
    rectangle(context, BOARD.panelLeft, OUTPUT_DRAW.top, BOARD.panelWidth, OUTPUT_DRAW.height, 5, colors.module);
    rectangle(context, BOARD.panelLeft, inputY + INPUT_DRAW.top, BOARD.panelWidth, INPUT_DRAW.height, 5, colors.module);
    label(context, "\u903B\u8F91\u6307\u793A\u706F", OUTPUT_DRAW.titleX, OUTPUT_DRAW.titleY, 12, colors["module-text"], "center");
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      const led = endpointPosition("L" + index);
      const value = readEndpoint(state2.result, "L" + index);
      rectangle(context, led.x - 8, OUTPUT_DRAW.ledY, 16, 13, 3, colors["led-off"]);
      context.globalAlpha = state2.visual.leds["L" + index];
      rectangle(context, led.x - 8, OUTPUT_DRAW.ledY, 16, 13, 3, colors["led-on"]);
      context.globalAlpha = 1;
      if (value === "X" || value === "Z") {
        label(context, String(value), led.x, OUTPUT_DRAW.valueY, 8, colors["module-text"], "center");
      }
      label(context, "L" + index, led.x, OUTPUT_DRAW.labelY, 8, colors["module-text"], "center");
      const location2 = endpointPosition("K" + index);
      label(context, "K" + index, location2.x, inputY + INPUT_DRAW.switchLabel, 9, colors["module-text"], "center");
      rectangle(context, location2.x - 12, inputY + INPUT_DRAW.switchTop, 24, 36, 4, colors["chip-text"]);
      const switchTop = inputY + INPUT_DRAW.switchSlider - state2.visual.switches[index] * INPUT_DRAW.switchTravel;
      rectangle(context, location2.x - 9, switchTop, 18, 15, 2, colors.metal);
      label(context, String(state2.project.switches[index]), location2.x, inputY + INPUT_DRAW.valueLabel, 10, colors["module-text"], "center");
      rectangle(context, location2.x - 6, inputY + INPUT_DRAW.ledTop, 12, 6, 2, colors["led-off"]);
      let brightness = state2.visual.leds["K" + index];
      if (state2.runtime && isWeakBoardInput(state2.project, state2.runtime.triState, index)) {
        brightness = brightness * INPUT_DRAW.weakLedOpacity;
      }
      context.globalAlpha = brightness;
      rectangle(context, location2.x - 6, inputY + INPUT_DRAW.ledTop, 12, 6, 2, colors["led-on"]);
      context.globalAlpha = 1;
    }
    drawInputReset(context, state2, colors);
    for (const name of ["P+", "P-"]) {
      const location2 = endpointPosition(name);
      label(context, name, location2.x, inputY + INPUT_DRAW.pulseLabel, 10, colors["module-text"], "center");
      let buttonColor = colors["chip-text"];
      let buttonY = inputY + INPUT_DRAW.pulseCenter;
      if (state2.pressedPulse === name) {
        buttonColor = colors["led-on"];
        buttonY = buttonY + INPUT_DRAW.pulsePressedOffset;
      }
      circle(context, location2.x, buttonY, INPUT_DRAW.pulseRadius, buttonColor);
      label(context, "\u8109\u51B2", location2.x, inputY + INPUT_DRAW.valueLabel, 9, colors["module-text"], "center");
    }
  }
  function drawInputReset(context, state2, colors) {
    const buttonX = columnX(INPUT_RESET_COLUMN);
    const inputY = PORT_LAYOUT.inputY;
    let buttonY = inputY + INPUT_DRAW.pulseCenter;
    let buttonColor = colors.metal;
    if (state2.pressedPulse === "reset") {
      buttonY = buttonY + INPUT_DRAW.pulsePressedOffset;
      buttonColor = colors["led-on"];
    }
    circle(context, buttonX, buttonY, INPUT_DRAW.pulseRadius, colors["chip-text"]);
    circle(context, buttonX, buttonY, INPUT_DRAW.pulseRadius - 3, buttonColor);
    label(context, "\u590D\u4F4D", buttonX, inputY + INPUT_DRAW.valueLabel, 9, colors["module-text"], "center");
  }
  function drawPortConnections(context, state2, colors) {
    const emphasis = state2.visual.internals;
    context.globalAlpha = INTERNAL_DRAW.restingOpacity + emphasis * (INTERNAL_DRAW.activeOpacity - INTERNAL_DRAW.restingOpacity);
    const signals = ["P+", "P-"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      signals.push("K" + bit, "L" + bit);
    }
    for (const signal of signals) {
      const location2 = endpointPosition(signal);
      const first = { x: location2.x, y: PORT_LAYOUT.inputY + INPUT_DRAW.top };
      if (signal.startsWith("L")) {
        first.y = OUTPUT_DRAW.top + OUTPUT_DRAW.height;
      }
      const last = endpointPosition(portHole(signal));
      polyline(context, [first, last], colors.trace, INTERNAL_DRAW.lineWidth);
    }
    const section = BOARD.sections - 1;
    for (let column = 1; column <= BOARD.columns; column = column + 1) {
      if (isInputColumn(column)) {
        const first = endpointPosition(holeId(section, "E", column));
        const last = endpointPosition(holeId(section, "F", column));
        polyline(context, [first, last], colors.trace, INTERNAL_DRAW.lineWidth);
      }
    }
    if (emphasis === 0) {
      context.globalAlpha = 1;
      return;
    }
    context.globalAlpha = emphasis;
    for (const rail of ["GND", "VCC"]) {
      const first = endpointPosition("R:" + rail + ":0");
      const last = endpointPosition("R:" + rail + ":" + (RAIL_LAYOUT.count - 1));
      let color = colors.ink;
      if (rail === "VCC") {
        color = colors.error;
      }
      polyline(context, [first, last], color, 4);
      for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
        const point = endpointPosition("R:" + rail + ":" + index);
        circle(context, point.x, point.y, 2, color);
      }
    }
    context.globalAlpha = 1;
  }
  function drawLevel(context, name, point, state2, colors) {
    const value = readEndpoint(state2.result, name);
    let background = colors["level-floating"];
    let foreground = colors.ink;
    if (value === 1) {
      background = colors.success;
      foreground = colors.surface;
    } else if (value === 0) {
      background = colors.ink;
      foreground = colors.surface;
    } else if (value === "X") {
      background = colors.unknown;
    }
    rectangle(context, point.x - LEVEL_DRAW.width / 2, point.y - LEVEL_DRAW.height / 2, LEVEL_DRAW.width, LEVEL_DRAW.height, 2, colors.surface);
    rectangle(context, point.x - LEVEL_DRAW.width / 2 + 1, point.y - LEVEL_DRAW.height / 2 + 1, LEVEL_DRAW.width - 2, LEVEL_DRAW.height - 2, 1, background);
    label(context, String(value), point.x, point.y, LEVEL_DRAW.fontSize, foreground, "center");
  }
  function drawNodeLevels(context, state2, colors) {
    if (!state2.showLevels) {
      return;
    }
    for (let section = 0; section < BOARD.sections; section = section + 1) {
      for (let column = 1; column <= BOARD.columns; column = column + 1) {
        for (const row of ["C", "H"]) {
          const name = holeId(section, row, column);
          drawLevel(context, name, endpointPosition(name), state2, colors);
        }
      }
      for (const row of BUS_ROWS) {
        for (const segment of BUS_SEGMENTS) {
          const name = holeId(section, row, segment[0]);
          drawLevel(context, name, endpointPosition(name), state2, colors);
        }
      }
    }
    for (const rail of ["GND", "VCC"]) {
      for (let index = 0; index < RAIL_LAYOUT.count; index = index + LEVEL_DRAW.railInterval) {
        const name = "R:" + rail + ":" + index;
        drawLevel(context, name, endpointPosition(name), state2, colors);
      }
    }
  }
  function drawChip(context, chip, state2, colors) {
    const bounds = chipBounds(chip);
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const location2 = endpointPosition(pinHole(chip, pin));
      let edge = bounds.y + bounds.height;
      if (pin > model.count / 2) {
        edge = bounds.y;
      }
      polyline(context, [location2, { x: location2.x, y: edge }], colors.metal, 5);
    }
    rectangle(context, bounds.x, bounds.y, bounds.width, bounds.height, 3, colors.chip);
    circle(context, bounds.x, bounds.y + 16, 6, colors.board);
    label(context, chip.id + "  " + chip.model, bounds.x + bounds.width / 2 + 3, bounds.y + 16, DRAW.chipText, colors["chip-text"], "center");
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      const location2 = endpointPosition(pinHole(chip, pin));
      let vertical = bounds.y + bounds.height - 3;
      if (pin > model.count / 2) {
        vertical = bounds.y + 4;
      }
      label(context, String(pin), location2.x, vertical, 6, colors["chip-text"], "center");
    }
    if (objectSelected(state2, "chip", chip.id)) {
      context.strokeStyle = colors.accent;
      context.lineWidth = 2;
      context.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
    }
  }
  function drawHiddenWires(context, state2, paths) {
    if (state2.hiddenWires.size === 0) {
      return;
    }
    const wires = state2.project.wires;
    context.save();
    for (let index = 0; index < wires.length; index = index + 1) {
      const wire = wires[index];
      if (!state2.hiddenWires.has(wire.id)) {
        continue;
      }
      let width = HIDDEN_WIRE_DRAW.width;
      if (objectSelected(state2, "wire", wire.id)) {
        width = HIDDEN_WIRE_DRAW.selectedWidth;
      }
      const points = paths[index];
      context.setLineDash(HIDDEN_WIRE_DRAW.dash);
      polyline(context, points, wire.color, width);
      context.setLineDash([]);
      context.beginPath();
      const first = points[0];
      const last = points[points.length - 1];
      context.arc(first.x, first.y, HIDDEN_WIRE_DRAW.endpointRadius, 0, Math.PI * 2);
      context.moveTo(last.x + HIDDEN_WIRE_DRAW.endpointRadius, last.y);
      context.arc(last.x, last.y, HIDDEN_WIRE_DRAW.endpointRadius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }
  function drawWires(context, state2, colors) {
    const displayPaths = wireDisplayPaths(state2.project.wires);
    drawHiddenWires(context, state2, displayPaths);
    for (let index = 0; index < state2.project.wires.length; index = index + 1) {
      const wire = state2.project.wires[index];
      if (state2.hiddenWires.has(wire.id)) {
        continue;
      }
      const points = displayPaths[index];
      let width = DRAW.wireWidth;
      const selected = objectSelected(state2, "wire", wire.id);
      if (selected) {
        width = DRAW.selectedWireWidth;
      }
      polyline(context, points, colors.surface, width + DRAW.wireOutlineWidth);
      polyline(context, points, wire.color, width);
      const first = points[0];
      const last = points[points.length - 1];
      circle(context, first.x, first.y, DRAW.wireEndpointRadius, wire.color);
      circle(context, last.x, last.y, DRAW.wireEndpointRadius, wire.color);
      if (selected && state2.tool === "select") {
        for (const point of points) {
          rectangle(context, point.x - DRAW.handleSize / 2, point.y - DRAW.handleSize / 2, DRAW.handleSize, DRAW.handleSize, 2, colors.surface);
          context.strokeStyle = wire.color;
          context.lineWidth = 2;
          context.strokeRect(point.x - DRAW.handleSize / 2, point.y - DRAW.handleSize / 2, DRAW.handleSize, DRAW.handleSize);
        }
      }
    }
    if (state2.pending) {
      let points = [endpointPosition(state2.pending.from)];
      for (const bend of state2.pending.bends) {
        points.push(bend);
      }
      if (state2.pointer) {
        points.push(state2.pointer);
      }
      if (state2.wireAngle === 45) {
        points = angleWirePath(points);
      }
      context.setLineDash([6, 4]);
      polyline(context, points, state2.wireColor, 2.5);
      context.setLineDash([]);
    }
  }
  function drawHighlights(context, state2, endpoints2, colors) {
    let selectedNode = "";
    if (state2.selected && state2.selected.kind === "node") {
      selectedNode = nodeFor(state2.result.topology, state2.selected.id);
    }
    if (selectedNode !== "") {
      for (const name of endpoints2) {
        const root = nodeFor(state2.result.topology, name);
        if (root !== selectedNode) {
          continue;
        }
        const location2 = endpointPosition(name);
        context.strokeStyle = colors.accent;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(location2.x, location2.y, 6.2, 0, Math.PI * 2);
        context.stroke();
      }
    }
    if (state2.hovered) {
      const location2 = endpointPosition(state2.hovered);
      context.strokeStyle = colors.accent;
      context.lineWidth = 2;
      context.strokeRect(location2.x - 8, location2.y - 8, 16, 16);
    }
  }
  function renderBoard(canvas2, state2, endpoints2) {
    const context = canvas2.getContext("2d");
    context.setTransform(DRAW.pixelRatio, 0, 0, DRAW.pixelRatio, 0, 0);
    const colors = canvasColors();
    context.clearRect(0, 0, BOARD.width, BOARD.height);
    drawBoardLayer(context, state2.visual.internals, colors);
    drawModules(context, state2, colors);
    drawPortConnections(context, state2, colors);
    for (const chip of state2.project.chips) {
      drawChip(context, chip, state2, colors);
    }
    drawWires(context, state2, colors);
    drawHighlights(context, state2, endpoints2, colors);
    drawNodeLevels(context, state2, colors);
    if (state2.placing) {
      label(context, "\u653E\u7F6E " + state2.placing, 650, 1105, 17, colors.accent, "center");
    }
  }

  // src/simulation/diagnostics.mjs
  function pinDescription(chip, pin) {
    return "\u7B2C " + pin + " \u811A " + CHIP_MODELS[chip.model].labels[pin] + "\uFF08" + endpointLabel(pinHole(chip, pin)) + "\uFF09";
  }
  function addIssue(report, code, severity, message, chipId) {
    for (const issue of report.issues) {
      if (issue.code === code) {
        return;
      }
    }
    report.issues.push({ code, severity, message, chipId });
  }
  function inspectClock(chip, pin, result, report) {
    const value = readEndpoint(result, pinHole(chip, pin));
    if (value !== 0 && value !== 1) {
      addIssue(report, "clock:" + chip.id + ":" + pin, "warning", chip.id + " \u65F6\u949F\u4E0D\u786E\u5B9A\uFF1A" + pinDescription(chip, pin) + " \u4E3A " + value + "\uFF0C\u8BF7\u68C0\u67E5\u65F6\u949F\u63A5\u7EBF\u548C\u9A71\u52A8\u51B2\u7A81", chip.id);
    }
  }
  function inspectStoredState(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    const unknown = [];
    for (const pin of model.outputs) {
      if (readEndpoint(result, pinHole(chip, pin)) === "X") {
        unknown.push(String(pin));
      }
    }
    if (unknown.length > 0) {
      addIssue(report, "state:" + chip.id, "warning", chip.id + " \u4FDD\u5B58\u503C\u5C1A\u4E0D\u786E\u5B9A\uFF0C\u8F93\u51FA\u811A " + unknown.join("\u3001") + " \u4E3A X\uFF0C\u8BF7\u5148\u6E05\u96F6\u3001\u7F6E\u6570\u6216\u63D0\u4F9B\u6EE1\u8DB3\u63A7\u5236\u6761\u4EF6\u7684\u6709\u6548\u65F6\u949F\u8FB9\u6CBF", chip.id);
    }
  }
  function inspectFlipFlops(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    const details = [];
    let active = 0;
    if (model.activeHigh) {
      active = 1;
    }
    let edge = "\u4E0A\u5347\u6CBF";
    if (model.edge === "falling") {
      edge = "\u4E0B\u964D\u6CBF";
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
      const channel = model.channels[index];
      const reset = readEndpoint(result, pinHole(chip, channel.reset));
      const set = readEndpoint(result, pinHole(chip, channel.set));
      const prefix = "\u7B2C " + (index + 1) + " \u8DEF";
      if (reset === active && set === active) {
        details.push(prefix + "\u7F6E\u4F4D\u548C\u590D\u4F4D\u540C\u65F6\u6709\u6548");
      } else if (reset === active) {
        details.push(prefix + "\u5F02\u6B65\u590D\u4F4D\u6709\u6548");
      } else if (set === active) {
        details.push(prefix + "\u5F02\u6B65\u7F6E\u4F4D\u6709\u6548");
      } else {
        inspectClock(chip, channel.clock, result, report);
        details.push(prefix + "\u7B49\u5F85" + edge + "\u91C7\u6837");
      }
    }
    return details.join("\uFF1B");
  }
  function describeCounter(chip, controls2, result) {
    const load = readEndpoint(result, pinHole(chip, controls2.load));
    if (load === 0) {
      return "\u7B49\u5F85\u4E0A\u5347\u6CBF\u5E76\u884C\u7F6E\u6570";
    }
    const first = readEndpoint(result, pinHole(chip, controls2.enable[0]));
    const second = readEndpoint(result, pinHole(chip, controls2.enable[1]));
    if (load === 1 && (first === 0 || second === 0)) {
      return "\u8BA1\u6570\u7981\u6B62\uFF0C\u4FDD\u6301\u539F\u503C";
    }
    if (load === 1 && first === 1 && second === 1) {
      return "\u7B49\u5F85\u4E0A\u5347\u6CBF\u8BA1\u6570";
    }
    return "\u7F6E\u6570\u6216\u8BA1\u6570\u4F7F\u80FD\u5C1A\u4E0D\u786E\u5B9A";
  }
  function describeShift(chip, controls2, result) {
    const first = readEndpoint(result, pinHole(chip, controls2.mode[0]));
    const second = readEndpoint(result, pinHole(chip, controls2.mode[1]));
    if (first === 0 && second === 0) {
      return "\u4FDD\u6301\u6A21\u5F0F\uFF0C\u4E0D\u8FDB\u884C\u79FB\u4F4D";
    }
    const firstKnown = first === 0 || first === 1;
    const secondKnown = second === 0 || second === 1;
    if (!firstKnown || !secondKnown) {
      return "\u79FB\u4F4D\u6A21\u5F0F\u5C1A\u4E0D\u786E\u5B9A";
    }
    return "\u7B49\u5F85\u4E0A\u5347\u6CBF\u79FB\u4F4D\u6216\u5E76\u884C\u7F6E\u6570";
  }
  function inspectClockedChip(chip, model, result, report) {
    const controls2 = model.controls;
    const reset = readEndpoint(result, pinHole(chip, controls2.reset));
    if (reset === 0) {
      return "\u5F02\u6B65\u6E05\u96F6\u6709\u6548\uFF0C\u8F93\u51FA\u4FDD\u6301\u4E3A 0";
    }
    inspectClock(chip, controls2.clock, result, report);
    if (model.sequential === "counter") {
      return describeCounter(chip, controls2, result);
    }
    if (model.sequential === "shift") {
      return describeShift(chip, controls2, result);
    }
    return "\u7B49\u5F85\u4E0A\u5347\u6CBF\u4FDD\u5B58\u6570\u636E";
  }
  function inspectTiming(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    let detail;
    if (model.channels) {
      detail = inspectFlipFlops(chip, result, report);
    } else {
      detail = inspectClockedChip(chip, model, result, report);
    }
    inspectStoredState(chip, result, report);
    return detail;
  }
  function inspectMemory(chip, result, report) {
    const specification = CHIP_MODELS[chip.model].memory;
    const selected = readEndpoint(result, pinHole(chip, specification.select));
    const writing = readEndpoint(result, pinHole(chip, specification.write));
    const reading = readEndpoint(result, pinHole(chip, specification.read));
    if (selected === 1) {
      return "\u7247\u9009\u65E0\u6548\uFF0C\u6570\u636E\u8F93\u51FA\u4E3A\u9AD8\u963B";
    }
    if (selected !== 0) {
      return "\u7247\u9009\u7535\u5E73\u5C1A\u4E0D\u786E\u5B9A";
    }
    if (writing === 0) {
      return "\u5199\u5165\u6709\u6548\uFF0C\u8BF7\u5148\u7ED3\u675F\u5199\u5165\u518D\u65AD\u5F00\u6570\u636E\u7F13\u51B2\u5668";
    }
    if (writing !== 1) {
      return "\u5199\u63A7\u5236\u5C1A\u4E0D\u786E\u5B9A\uFF0C\u5B58\u50A8\u5185\u5BB9\u53EF\u80FD\u88AB\u6539\u5199";
    }
    if (reading === 1) {
      return "\u8BFB\u5199\u5747\u7981\u6B62\uFF0C\u4FDD\u6301\u5185\u5BB9\u5E76\u9000\u51FA\u6570\u636E\u603B\u7EBF";
    }
    if (reading !== 0) {
      return "\u8BFB\u63A7\u5236\u5C1A\u4E0D\u786E\u5B9A";
    }
    for (const pin of specification.data) {
      if (readEndpoint(result, pinHole(chip, pin)) === "X") {
        addIssue(report, "memory-state:" + chip.id, "warning", chip.id + " \u8BFB\u51FA\u6570\u636E\u4E3A X\uFF0C\u8BF7\u68C0\u67E5\u8BE5\u5730\u5740\u662F\u5426\u5DF2\u5199\u5165\u3001\u5730\u5740\u63A7\u5236\u4E0E\u603B\u7EBF\u51B2\u7A81", chip.id);
        break;
      }
    }
    return "\u8BFB\u53D6\u6709\u6548\uFF0C\u7531 RAM \u9A71\u52A8\u6570\u636E\u603B\u7EBF";
  }
  function issueAffectsChip(issue, chip, result) {
    if (issue.chipId === chip.id || issue.code.endsWith(":" + chip.id) || issue.code.startsWith("async-conflict:" + chip.id + ":")) {
      return true;
    }
    if (issue.code === "power-short" || issue.code === "unstable") {
      return true;
    }
    if (issue.code.startsWith("drivers:")) {
      const node2 = issue.code.slice("drivers:".length);
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (nodeFor(result.topology, pinHole(chip, pin)) === node2) {
          return true;
        }
      }
    }
    return false;
  }
  function inspectOutputRails(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    for (const pin of model.outputs) {
      if (model.kind === "open-collector" || model.kind === "seven-segment") {
        continue;
      }
      if (model.memory) {
        const selected = readEndpoint(result, pinHole(chip, model.memory.select));
        const writing = readEndpoint(result, pinHole(chip, model.memory.write));
        const reading = readEndpoint(result, pinHole(chip, model.memory.read));
        if (selected === 1 || writing === 0 || reading === 1) {
          continue;
        }
      }
      const endpoint = pinHole(chip, pin);
      const node2 = nodeFor(result.topology, endpoint);
      for (const rail of ["VCC", "GND"]) {
        if (node2 === nodeFor(result.topology, rail)) {
          addIssue(report, "output-rail:" + chip.id + ":" + pin, "error", chip.id + " \u8F93\u51FA\u76F4\u63A5\u63A5\u5230 " + rail + "\uFF1A" + pinDescription(chip, pin) + "\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u8BEF\u63A5\u7535\u6E90\u8F68", chip.id);
        }
      }
    }
  }
  function inspectUnknownInputs(chip, model, result, report) {
    const uncertain = [];
    for (const pin of model.inputs) {
      if (model.memory && model.bidirectional.includes(pin)) {
        const selected = readEndpoint(result, pinHole(chip, model.memory.select));
        const writing = readEndpoint(result, pinHole(chip, model.memory.write));
        if (selected !== 0 || writing !== 0) {
          continue;
        }
      }
      if (readEndpoint(result, pinHole(chip, pin)) === "X") {
        uncertain.push(String(pin));
      }
    }
    if (uncertain.length > 0) {
      const pins = uncertain.join("\u3001");
      const message = chip.id + " \u8F93\u5165\u811A " + pins + " \u4E3A X\uFF0C\u8BF7\u68C0\u67E5\u4E0A\u6E38\u8F93\u51FA\u3001\u521D\u59CB\u5316\u72B6\u6001\u6216\u7535\u5E73\u51B2\u7A81";
      addIssue(report, "input-unknown:" + chip.id, "warning", message, chip.id);
    }
  }
  function inspectCollectorOutputs(chip, model, result, report) {
    if (model.kind !== "open-collector") {
      return;
    }
    for (const pin of model.outputs) {
      if (readEndpoint(result, pinHole(chip, pin)) === "Z") {
        const description = pinDescription(chip, pin);
        const message = chip.id + " OC \u8F93\u51FA\u65E0\u4E0A\u62C9\uFF1A" + description + "\uFF0C\u91CA\u653E\u65F6\u4E3A Z\uFF0C\u53EF\u8FDE\u63A5\u4E0A\u62C9\u7535\u963B";
        addIssue(report, "oc-floating:" + chip.id + ":" + pin, "warning", message, chip.id);
      }
    }
  }
  function inspectPoweredChip(chip, model, result, report) {
    inspectOutputRails(chip, result, report);
    inspectUnknownInputs(chip, model, result, report);
    let detail = "\u7EC4\u5408\u903B\u8F91\u6309\u5F53\u524D\u8F93\u5165\u8BA1\u7B97";
    if (model.memory) {
      detail = inspectMemory(chip, result, report);
    } else if (chip.model === "74LS273" || model.sequential) {
      detail = inspectTiming(chip, result, report);
    }
    inspectCollectorOutputs(chip, model, result, report);
    return detail;
  }
  function applyChipSeverity(summary, chip, result, issues) {
    for (const issue of issues) {
      if (!issueAffectsChip(issue, chip, result)) {
        continue;
      }
      if (issue.severity === "error") {
        summary.severity = "error";
        summary.status = "\u5B58\u5728\u5DE5\u4F5C\u5F02\u5E38";
        return;
      }
      if (summary.severity !== "error") {
        summary.severity = "warning";
        summary.status = "\u9700\u8981\u68C0\u67E5";
      }
    }
  }
  function inspectChip(chip, result, report) {
    const summary = {
      id: chip.id,
      model: chip.model,
      status: "\u672A\u4E0A\u7535",
      severity: "info",
      detail: "\u7535\u6E90\u5DF2\u5173\u95ED\uFF0C\u6682\u4E0D\u8FDB\u884C\u5DE5\u4F5C\u72B6\u6001\u5224\u65AD"
    };
    if (report.power) {
      const model = CHIP_MODELS[chip.model];
      const power = readEndpoint(result, pinHole(chip, model.power));
      const ground = readEndpoint(result, pinHole(chip, model.ground));
      const supply = pinDescription(chip, model.power) + "=" + power;
      const referenceGround = pinDescription(chip, model.ground) + "=" + ground;
      summary.detail = supply + "\uFF1B" + referenceGround;
      if (power !== 1 || ground !== 0) {
        summary.status = "\u4F9B\u7535\u5F02\u5E38";
        summary.severity = "error";
        const message = chip.id + " \u7535\u6E90\u4E0D\u6B63\u786E\uFF1A" + summary.detail + "\uFF0C\u8BF7\u68C0\u67E5\u7535\u6E90\u811A\u548C\u5730\u811A\u7684\u63A5\u7EBF";
        addIssue(report, "power:" + chip.id, "error", message, chip.id);
      } else {
        summary.status = "\u5F53\u524D\u6761\u4EF6\u6B63\u5E38";
        summary.severity = "success";
        const purpose = inspectPoweredChip(chip, model, result, report);
        summary.detail = summary.detail + "\uFF1B" + purpose;
      }
      applyChipSeverity(summary, chip, result, report.issues);
    }
    const reference = CHIP_REFERENCES[chip.model];
    if (reference.pinWarning) {
      summary.detail = summary.detail + "\uFF1B" + reference.pinWarning;
    }
    return summary;
  }
  function inspectCircuit(project, result) {
    const report = { issues: [], chips: [], power: project.power, stable: result.stable };
    for (const issue of result.issues) {
      report.issues.push({ code: issue.code, severity: issue.severity, message: issue.message, chipId: "" });
    }
    const power = nodeFor(result.topology, "VCC");
    const ground = nodeFor(result.topology, "GND");
    if (power === ground) {
      addIssue(report, "power-short", "error", "+5V \u4E0E GND \u88AB\u5BFC\u7EBF\u77ED\u63A5\uFF0C\u8BF7\u5148\u65AD\u5F00\u77ED\u63A5\u518D\u4E0A\u7535", "");
    }
    if (!result.stable) {
      addIssue(report, "unstable", "error", "\u7535\u8DEF\u672A\u8FBE\u5230\u7A33\u5B9A\u72B6\u6001\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u5408\u903B\u8F91\u53CD\u9988", "");
    }
    for (const chip of project.chips) {
      report.chips.push(inspectChip(chip, result, report));
    }
    return report;
  }

  // src/experiments/ram-routes.json
  var ram_routes_default = {
    W1: [
      {
        x: 1242,
        y: 405.3599999999995
      },
      {
        x: 252,
        y: 405.3599999999995
      }
    ],
    W2: [
      {
        x: 1210,
        y: 495.28571428571416
      },
      {
        x: 450,
        y: 495.28571428571416
      }
    ],
    W3: [
      {
        x: 252,
        y: 396.3599999999995
      },
      {
        x: 774,
        y: 396.3599999999995
      }
    ],
    W4: [
      {
        x: 450,
        y: 514.4857142857142
      },
      {
        x: 972,
        y: 514.4857142857142
      }
    ],
    W5: [
      {
        x: 774,
        y: 402.3599999999995
      },
      {
        x: 748.0000001799999,
        y: 402.3599999999995
      },
      {
        x: 748.0000001799999,
        y: 646.00000015
      },
      {
        x: 792,
        y: 646.00000015
      }
    ],
    W6: [
      {
        x: 973.9999999800001,
        y: 506
      },
      {
        x: 973.9999999800001,
        y: 726
      },
      {
        x: 954,
        y: 726
      }
    ],
    W7: [
      {
        x: 792,
        y: 652.00000015
      },
      {
        x: 288,
        y: 652.00000015
      }
    ],
    W8: [
      {
        x: 951,
        y: 756
      },
      {
        x: 951,
        y: 743.9999998499999
      },
      {
        x: 414,
        y: 743.9999998499999
      }
    ],
    W9: [
      {
        x: 414,
        y: 757.1999998499999
      },
      {
        x: 428,
        y: 757.1999998499999
      },
      {
        x: 428,
        y: 495.28571428571416
      },
      {
        x: 306,
        y: 495.28571428571416
      }
    ],
    W10: [
      {
        x: 306,
        y: 491
      }
    ],
    W11: [
      {
        x: 288,
        y: 491
      }
    ],
    W12: [
      {
        x: 270,
        y: 491
      }
    ],
    W13: [
      {
        x: 238,
        y: 506
      },
      {
        x: 238,
        y: 417.3599999999995
      },
      {
        x: 270,
        y: 417.3599999999995
      }
    ],
    W14: [
      {
        x: 270,
        y: 399.3599999999995
      },
      {
        x: 288,
        y: 399.3599999999995
      }
    ],
    W15: [
      {
        x: 288,
        y: 399.3599999999995
      },
      {
        x: 342,
        y: 399.3599999999995
      }
    ],
    W16: [
      {
        x: 342,
        y: 399.3599999999995
      },
      {
        x: 594.1698113207547,
        y: 399.3599999999995
      },
      {
        x: 594.1698113207547,
        y: 480.8857142857142
      },
      {
        x: 828,
        y: 480.8857142857142
      }
    ],
    W17: [
      {
        x: 828,
        y: 500.0857142857142
      },
      {
        x: 810,
        y: 500.0857142857142
      }
    ],
    W18: [
      {
        x: 810,
        y: 500.0857142857142
      },
      {
        x: 792,
        y: 500.0857142857142
      }
    ],
    W19: [
      {
        x: 792,
        y: 500.0857142857142
      },
      {
        x: 774,
        y: 500.0857142857142
      }
    ],
    W20: [
      {
        x: 760,
        y: 506
      },
      {
        x: 760,
        y: 414.3599999999995
      },
      {
        x: 792,
        y: 414.3599999999995
      }
    ],
    W21: [
      {
        x: 792,
        y: 402.3599999999995
      },
      {
        x: 810,
        y: 402.3599999999995
      }
    ],
    W22: [
      {
        x: 810,
        y: 402.3599999999995
      },
      {
        x: 864,
        y: 402.3599999999995
      }
    ],
    W23: [
      {
        x: 864,
        y: 399.3599999999995
      },
      {
        x: 618.1698113207547,
        y: 399.3599999999995
      },
      {
        x: 618.1698113207547,
        y: 751.1999998499999
      },
      {
        x: 306,
        y: 751.1999998499999
      }
    ],
    W24: [
      {
        x: 306,
        y: 760.79999985
      },
      {
        x: 324,
        y: 760.79999985
      }
    ],
    W25: [
      {
        x: 324,
        y: 760.79999985
      },
      {
        x: 342,
        y: 760.79999985
      }
    ],
    W26: [
      {
        x: 342,
        y: 760.79999985
      },
      {
        x: 360,
        y: 760.79999985
      }
    ],
    W27: [
      {
        x: 274,
        y: 646
      },
      {
        x: 274,
        y: 754.79999985
      },
      {
        x: 378,
        y: 754.79999985
      }
    ],
    W28: [
      {
        x: 666,
        y: 490.48571428571415
      },
      {
        x: 378,
        y: 490.48571428571415
      }
    ],
    W29: [
      {
        x: 378,
        y: 545
      },
      {
        x: 900,
        y: 545
      }
    ],
    W30: [
      {
        x: 630.1698113207547,
        y: 1036
      },
      {
        x: 630.1698113207547,
        y: 485.6857142857142
      },
      {
        x: 360,
        y: 485.6857142857142
      }
    ],
    W31: [
      {
        x: 360,
        y: 554
      },
      {
        x: 882,
        y: 554
      }
    ],
    W32: [
      {
        x: 594,
        y: 480.8857142857142
      },
      {
        x: 342,
        y: 480.8857142857142
      }
    ],
    W33: [
      {
        x: 342,
        y: 563
      },
      {
        x: 864,
        y: 563
      }
    ],
    W34: [
      {
        x: 558,
        y: 476.0857142857142
      },
      {
        x: 324,
        y: 476.0857142857142
      }
    ],
    W35: [
      {
        x: 324,
        y: 572
      },
      {
        x: 846,
        y: 572
      }
    ],
    W36: [
      {
        x: 522,
        y: 747.5999998499999
      },
      {
        x: 288,
        y: 747.5999998499999
      }
    ],
    W37: [
      {
        x: 232.00000006,
        y: 661
      },
      {
        x: 232.00000006,
        y: 414.3599999999995
      },
      {
        x: 360,
        y: 414.3599999999995
      }
    ],
    W38: [
      {
        x: 324,
        y: 646.00000015
      },
      {
        x: 624.1698113207547,
        y: 646.00000015
      },
      {
        x: 624.1698113207547,
        y: 411.3599999999995
      },
      {
        x: 882,
        y: 411.3599999999995
      }
    ],
    W39: [
      {
        x: 957,
        y: 1036
      },
      {
        x: 957,
        y: 740.39999985
      },
      {
        x: 810,
        y: 740.39999985
      }
    ],
    W40: [
      {
        x: 828,
        y: 649
      },
      {
        x: 918,
        y: 649
      }
    ],
    W41: [
      {
        x: 918,
        y: 581
      },
      {
        x: 396,
        y: 581
      }
    ],
    W42: [
      {
        x: 396,
        y: 500.0857142857142
      },
      {
        x: 600.1698113207547,
        y: 500.0857142857142
      },
      {
        x: 600.1698113207547,
        y: 110
      },
      {
        x: 954,
        y: 110
      }
    ],
    W43: [
      {
        x: 915,
        y: 1036
      },
      {
        x: 915,
        y: 749.9999998499999
      },
      {
        x: 846,
        y: 749.9999998499999
      }
    ],
    W44: [
      {
        x: 864,
        y: 655
      },
      {
        x: 936,
        y: 655
      }
    ],
    W45: [
      {
        x: 936,
        y: 590
      },
      {
        x: 414,
        y: 590
      }
    ],
    W46: [
      {
        x: 414,
        y: 504.8857142857142
      },
      {
        x: 606.1698113207547,
        y: 504.8857142857142
      },
      {
        x: 606.1698113207547,
        y: 116
      }
    ],
    W47: [
      {
        x: 882,
        y: 888.5
      }
    ],
    W48: [
      {
        x: 954,
        y: 661
      }
    ],
    W49: [
      {
        x: 954,
        y: 599
      },
      {
        x: 432,
        y: 599
      }
    ],
    W50: [
      {
        x: 432,
        y: 509.6857142857142
      },
      {
        x: 612.1698113207547,
        y: 509.6857142857142
      },
      {
        x: 612.1698113207547,
        y: 122
      },
      {
        x: 882,
        y: 122
      }
    ],
    W51: [
      {
        x: 846,
        y: 1033.0000000000002
      },
      {
        x: 921,
        y: 1033.0000000000002
      },
      {
        x: 921,
        y: 741
      }
    ],
    W52: [
      {
        x: 936,
        y: 667
      },
      {
        x: 1003.99999964,
        y: 667
      },
      {
        x: 1003.99999964,
        y: 417.3599999999995
      },
      {
        x: 972,
        y: 417.3599999999995
      }
    ],
    W53: [
      {
        x: 972,
        y: 357
      },
      {
        x: 450,
        y: 357
      }
    ],
    W54: [
      {
        x: 450,
        y: 393.3599999999995
      },
      {
        x: 846,
        y: 393.3599999999995
      }
    ],
    W55: [
      {
        x: 810,
        y: 1039.0000000000002
      },
      {
        x: 968,
        y: 1039.0000000000002
      },
      {
        x: 968,
        y: 673
      },
      {
        x: 954,
        y: 673
      }
    ],
    W56: [
      {
        x: 936,
        y: 736.79999985
      },
      {
        x: 997.99999964,
        y: 736.79999985
      },
      {
        x: 997.99999964,
        y: 414.3599999999995
      },
      {
        x: 954,
        y: 414.3599999999995
      }
    ],
    W57: [
      {
        x: 954,
        y: 348
      },
      {
        x: 432,
        y: 348
      }
    ],
    W58: [
      {
        x: 432,
        y: 390.3599999999995
      },
      {
        x: 810,
        y: 390.3599999999995
      }
    ],
    W59: [
      {
        x: 772.0000000200001,
        y: 1036
      },
      {
        x: 772.0000000200001,
        y: 670.00000015
      },
      {
        x: 918,
        y: 670.00000015
      }
    ],
    W60: [
      {
        x: 900,
        y: 733.1999998499999
      },
      {
        x: 991.99999964,
        y: 733.1999998499999
      },
      {
        x: 991.99999964,
        y: 411.3599999999995
      },
      {
        x: 936,
        y: 411.3599999999995
      }
    ],
    W61: [
      {
        x: 936,
        y: 339
      },
      {
        x: 414,
        y: 339
      }
    ],
    W62: [
      {
        x: 414,
        y: 387.3599999999995
      },
      {
        x: 774,
        y: 387.3599999999995
      }
    ],
    W63: [
      {
        x: 738,
        y: 664.00000015
      },
      {
        x: 882,
        y: 664.00000015
      }
    ],
    W64: [
      {
        x: 864,
        y: 729.5999998499999
      },
      {
        x: 986,
        y: 729.5999998499999
      },
      {
        x: 986,
        y: 408.3599999999995
      },
      {
        x: 918,
        y: 408.3599999999995
      }
    ],
    W65: [
      {
        x: 918,
        y: 330
      },
      {
        x: 396,
        y: 330
      }
    ],
    W66: [
      {
        x: 396,
        y: 384.3599999999995
      },
      {
        x: 738,
        y: 384.3599999999995
      }
    ],
    W67: [
      {
        x: 702,
        y: 658.00000015
      },
      {
        x: 846,
        y: 658.00000015
      }
    ],
    W68: [
      {
        x: 828,
        y: 736.79999985
      },
      {
        x: 754.0000001799999,
        y: 736.79999985
      },
      {
        x: 754.0000001799999,
        y: 408.3599999999995
      },
      {
        x: 900,
        y: 408.3599999999995
      }
    ],
    W69: [
      {
        x: 900,
        y: 321
      },
      {
        x: 378,
        y: 321
      }
    ],
    W70: [
      {
        x: 378,
        y: 381.3599999999995
      },
      {
        x: 702,
        y: 381.3599999999995
      }
    ],
    W71: [
      {
        x: 486,
        y: 408.3599999999995
      },
      {
        x: 306,
        y: 408.3599999999995
      }
    ],
    W72: [
      {
        x: 306,
        y: 312
      },
      {
        x: 828,
        y: 312
      }
    ],
    W73: [
      {
        x: 450,
        y: 1033.0000000000002
      },
      {
        x: 464,
        y: 1033.0000000000002
      },
      {
        x: 464,
        y: 411.3599999999995
      },
      {
        x: 324,
        y: 411.3599999999995
      }
    ],
    W74: [
      {
        x: 324,
        y: 303
      },
      {
        x: 846,
        y: 303
      }
    ],
    W75: [
      {
        x: 414,
        y: 1039.0000000000002
      },
      {
        x: 792,
        y: 1039.0000000000002
      }
    ],
    W76: [
      {
        x: 778,
        y: 756
      },
      {
        x: 778,
        y: 676
      },
      {
        x: 810,
        y: 676
      }
    ]
  };

  // src/experiments/ram-preset.mjs
  var RAM_CHIPS = [
    { id: "U1", model: "6116", section: 1, column: 10 },
    { id: "U2", model: "6116", section: 1, column: 39 },
    { id: "U3", model: "74LS244", section: 2, column: 40 },
    { id: "U4", model: "74LS138", section: 2, column: 12 }
  ];
  var RAM_COLORS = {
    power: WIRE_COLORS[0],
    ground: WIRE_COLORS[7],
    dataInput: WIRE_COLORS[2],
    dataBus: WIRE_COLORS[1],
    address: WIRE_COLORS[3],
    select: WIRE_COLORS[5],
    control: WIRE_COLORS[4]
  };
  var RAM_INPUTS = { dataStart: 0, addressStart: 8, bank: 12, write: 13, read: 14, isolate: 15, count: 16 };
  var RAM_EXPERIMENT_ID = "ram-expansion-example";
  var RAM_EXPERIMENT_NAME = "\u5B9E\u9A8C\u4E09 RAM\u5B57\u6269\u5C55";
  var RAM_OUTER_WIRES = ["W29", "W31", "W33", "W35", "W41", "W45", "W49", "W53", "W57", "W61", "W65", "W69", "W72", "W74"];
  var PREVIOUS_RAM_NOTES = `# \u5B9E\u9A8C\u4E09 RAM\u5B57\u6269\u5C55

## \u5B9E\u9A8C\u76EE\u6807

\u4F7F\u7528\u4E24\u72476116\uFF08\u54042K\xD78\uFF09\u548C74LS138\u7EC4\u62104K\xD78\u5B58\u50A8\u5668\uFF0C74LS244\u9694\u79BB\u6570\u636E\u5F00\u5173\u4E0E\u5171\u4EAB\u6570\u636E\u603B\u7EBF\u3002\u63A5\u7EBF\u4F9D\u636E\u7B2C\u4E09\u6B21\u5B9E\u9A8C\u8BFE\u4EF6\u7B2C4\uFF5E8\u9875

## \u5668\u4EF6\u4E0E\u5730\u5740

| \u5668\u4EF6 | \u4F5C\u7528 | \u5B8C\u6574\u5730\u5740\u8303\u56F4 |
| --- | --- | --- |
| U1 6116 | \u7B2C1\u7247RAM\uFF0CA11=0\u65F6\u9009\u4E2D | 000H\uFF5E7FFH |
| U2 6116 | \u7B2C2\u7247RAM\uFF0CA11=1\u65F6\u9009\u4E2D | 800H\uFF5EFFFH |
| U3 74LS244 | \u4E24\u7EC4\u56DB\u8DEF\u7F13\u51B2\u5668\uFF0C\u5171\u540C\u63A7\u5236\u516B\u4F4D\u6570\u636E\u8F93\u5165 | \u5355\u5411\u8F93\u5165\u603B\u7EBF |
| U4 74LS138 | A\u8F93\u5165\u63A5A11\uFF0CB/C\u63A5\u5730\uFF0CY0\u2032/Y1\u2032\u5206\u522B\u9009\u4E2DU1/U2 | \u4E24\u7247\u4E0D\u4F1A\u540C\u65F6\u9009\u4E2D |

\u6309\u8BFE\u4EF6\u5141\u8BB8\u7684\u7B80\u5316\u65B9\u5F0F\uFF0CA4\uFF5EA10\u63A5\u5730\uFF0CA0\uFF5EA3\u7531\u5F00\u5173\u8BBE\u7F6E\uFF0CA11\u72EC\u7ACB\u9009\u7247\u3002\u53EF\u64CD\u4F5C\u5730\u5740\u4E3A000H\uFF5E00FH\u53CA800H\uFF5E80FH\uFF0C\u6BCF\u7247RAM\u7684\u5B8C\u6574\u5BB9\u91CF\u4ECD\u4E3A2K\xD78

## \u5F00\u5173\u548C\u6307\u793A\u706F

| \u7AEF\u53E3 | \u4F5C\u7528 |
| --- | --- |
| K7\uFF5EK0 | \u5199\u5165\u6570\u636ED7\uFF5ED0\uFF0CK0\u4E3A\u6700\u4F4E\u4F4D |
| K11\uFF5EK8 | \u7247\u5185\u5730\u5740A3\uFF5EA0\uFF0CK8\u4E3A\u6700\u4F4E\u4F4D |
| K12 | A11\uFF0C0\u9009U1\uFF0C1\u9009U2 |
| K13 | WE\u2032\uFF0C0\u5141\u8BB8\u5199\u5165\uFF0C1\u7ED3\u675F\u5199\u5165 |
| K14 | OE\u2032\uFF0C0\u5141\u8BB8\u8BFB\u51FA\uFF0C1\u5173\u95EDRAM\u8BFB\u8F93\u51FA |
| K15 | 244\u4F7F\u80FD\uFF0C0\u63A5\u5165\u6570\u636E\u5F00\u5173\uFF0C1\u9694\u79BB\u5F00\u5173 |
| L7\uFF5EL0 | \u5171\u4EAB\u6570\u636E\u603B\u7EBF\uFF0C\u8BFB\u53D6\u65F6\u663E\u793ARAM\u5185\u5BB9 |

\u9ED8\u8BA4K13\u3001K14\u3001K15\u5747\u4E3A1\uFF0C\u8BFB\u5199\u548C\u6570\u636E\u8F93\u5165\u5747\u5173\u95ED\uFF0C\u603B\u7EBF\u663E\u793AZ\u5C5E\u4E8E\u6B63\u5E38\u72B6\u6001\u3002\u5199\u5165\u65F6\u6307\u793A\u706F\u663E\u793A\u5F00\u5173\u6570\u636E\uFF0C\u5FC5\u987B\u5207\u5230\u8BFB\u53D6\u72B6\u6001\u624D\u80FD\u786E\u8BA4RAM\u4FDD\u5B58\u4E86\u5185\u5BB9

## \u5199\u5165\u6B65\u9AA4

1. \u4FDD\u6301K13=1\u3001K14=1\u3001K15=1\uFF0C\u8BBE\u7F6EK12\u9009\u7247\u548CK11\uFF5EK8\u5730\u5740
2. \u7528K7\uFF5EK0\u8BBE\u7F6E\u516B\u4F4D\u6570\u636E\uFF0C\u8BBE\u7F6EK15=0\uFF0C\u8BA9244\u9A71\u52A8\u6570\u636E\u603B\u7EBF
3. \u8BBE\u7F6EK13=0\u5199\u5165\uFF0C\u4FDD\u6301\u5730\u5740\u548C\u6570\u636E\u7A33\u5B9A\uFF0C\u518D\u8BBE\u7F6EK13=1\u7ED3\u675F\u5199\u5165
4. \u8BBE\u7F6EK15=1\u9694\u79BB\u6570\u636E\u5F00\u5173\u3002\u66F4\u6362\u5730\u5740\u524D\u5FC5\u987B\u786E\u8BA4K13=1

## \u8BFB\u53D6\u6B65\u9AA4

1. \u4FDD\u6301K13=1\u3001K15=1\uFF0C\u8BBE\u7F6EK12\u548CK11\uFF5EK8\u9009\u62E9\u5730\u5740
2. \u8BBE\u7F6EK14=0\uFF0C\u4ECEL7\uFF5EL0\u8BFB\u53D6\u6570\u636E
3. \u4E0B\u4E00\u6B21\u5199\u5165\u524D\u5148\u8BBE\u7F6EK14=1\uFF0C\u907F\u514DRAM\u4E0E244\u540C\u65F6\u9A71\u52A8\u603B\u7EBF

## \u8BFE\u4EF6\u9A8C\u6536

\u5148\u5B8C\u6210\u4EE5\u4E0B\u56DB\u6B21\u5199\u5165\uFF0C\u518D\u96C6\u4E2D\u8BFB\u53D6\u6838\u5BF9\uFF0C\u8BFB\u53D6\u65F6\u53EA\u6539\u53D8\u5730\u5740\u548C\u9009\u7247\uFF0C\u4E0D\u91CD\u65B0\u5199\u5165

| K12 | K11\uFF5EK8 | \u5B8C\u6574\u5730\u5740 | \u5199\u5165\u5E76\u9884\u671F\u8BFB\u51FA\u7684\u6570\u636E |
| --- | --- | --- | --- |
| 0 | 1010 | 00AH | 01010101 |
| 0 | 0101 | 005H | 10101010 |
| 1 | 1010 | 80AH | 11111111 |
| 1 | 0101 | 805H | 00000000 |

\u76F8\u540C\u7247\u5185\u5730\u5740\u5728\u4E0D\u540C\u82AF\u7247\u4E2D\u4FDD\u5B58\u4E0D\u540C\u5185\u5BB9\uFF0C\u624D\u80FD\u8BC1\u660E\u5B57\u6269\u5C55\u548C\u8BD1\u7801\u9009\u7247\u6B63\u786E

## \u73B0\u8C61\u4E0E\u62A5\u544A

\u8BB0\u5F55\u56DB\u4E2A\u5730\u5740\u7684\u5199\u5165\u5185\u5BB9\u3001\u5B9E\u9645\u8BFB\u51FA\u5185\u5BB9\u548C\u662F\u5426\u4E00\u81F4\uFF0C\u62A5\u544A\u5199\u660E\u4E24\u7247RAM\u5B8C\u6574\u5730\u5740\u8303\u56F4\u3001\u8BD1\u7801\u63A5\u6CD5\u4E0E\u8BFB\u5199\u987A\u5E8F\u3002\u5148\u7ED3\u675F\u5199\u5165\uFF0C\u518D\u9694\u79BB244\uFF0C\u5426\u5219\u60AC\u7A7A\u6570\u636E\u53EF\u80FD\u88AB\u5199\u5165RAM\u5E76\u53D8\u4E3AX\u3002RAM\u8BFB\u51FA\u5F00\u542F\u65F6\u53C8\u63A5\u5165244\u4F1A\u9020\u6210\u9A71\u52A8\u51B2\u7A81

\u7EA2\u8272\u4E3A\u7535\u6E90\uFF0C\u6DF1\u7070\u4E3A\u5730\uFF0C\u7EFF\u8272\u4E3A\u6570\u636E\u5F00\u5173\uFF0C\u84DD\u8272\u4E3A\u5171\u4EAB\u6570\u636E\u603B\u7EBF\uFF0C\u9EC4\u8272\u4E3A\u5730\u5740\uFF0C\u9752\u8272\u4E3A\u7247\u9009\uFF0C\u7D2B\u8272\u4E3A\u8BFB\u5199\u4E0E\u9694\u79BB\u63A7\u5236\u3002\u4EA4\u53C9\u5BFC\u7EBF\u4FDD\u6301\u7EDD\u7F18\uFF0C\u7535\u6C14\u8FDE\u63A5\u7531\u5B9E\u9645\u63D2\u5B54\u51B3\u5B9A

RAM\u5185\u5BB9\u5C5E\u4E8E\u6613\u5931\u8FD0\u884C\u72B6\u6001\u3002\u65AD\u7535\u3001\u5207\u6362\u5B9E\u9A8C\u3001\u91CD\u65B0\u52A0\u8F7D\u3001\u5BFC\u5165\u6216\u64A4\u9500\u540E\u9700\u8981\u91CD\u65B0\u5199\u5165\uFF0C\u5B58\u6863\u4FDD\u5B58\u63A5\u7EBF\u3001\u5F00\u5173\u548C\u5907\u6CE8\uFF0C\u4E0D\u4FDD\u5B58\u5DF2\u5199\u5165\u7684\u6570\u636E\u3002\u521D\u6B21\u8BFB\u53D6\u672A\u5199\u8FC7\u7684\u5730\u5740\u4F1A\u663E\u793AX\uFF0C\u4E0D\u80FD\u636E\u6B64\u5224\u65AD\u63A5\u7EBF\u9519\u8BEF
`;
  var RAM_NOTES = `# RAM \u5B57\u6269\u5C55\u64CD\u4F5C

## \u5F00\u5173

| \u7AEF\u53E3 | \u7528\u9014 |
| --- | --- |
| K7\uFF5EK0 | \u5199\u5165\u6570\u636E\uFF0C\u9AD8\u4F4D\u5728\u5DE6 |
| K11\uFF5EK8 | \u7247\u5185\u5730\u5740\uFF0C\u9AD8\u4F4D\u5728\u5DE6 |
| K12 | 0\u9009\u7B2C\u4E00\u7247\uFF0C1\u9009\u7B2C\u4E8C\u7247 |
| K13 | 0\u5199\u5165\uFF0C1\u505C\u6B62\u5199\u5165 |
| K14 | 0\u8BFB\u51FA\uFF0C1\u5173\u95ED\u8BFB\u51FA |
| K15 | 0\u63A5\u5165\u6570\u636E\u5F00\u5173\uFF0C1\u9694\u79BB\u6570\u636E\u5F00\u5173 |
| L7\uFF5EL0 | \u8BFB\u51FA\u7ED3\u679C |

## \u5199\u5165

1. \u6253\u5F00\u7535\u6E90\uFF0C\u628A K13\u3001K14 \u548C K15 \u90FD\u62E8\u5230 1\u3002
2. \u7528 K12 \u9009\u82AF\u7247\uFF0C\u7528 K11\uFF5EK8 \u8BBE\u5730\u5740\uFF0C\u518D\u7528 K7\uFF5EK0 \u8BBE\u6570\u636E\u3002
3. \u628A K15 \u62E8\u5230 0\uFF0C\u8BA9\u6570\u636E\u5F00\u5173\u63A5\u5230\u603B\u7EBF\u4E0A\u3002
4. \u628A K13 \u62E8\u5230 0\uFF0C\u518D\u62E8\u56DE 1\uFF0C\u6570\u636E\u5C31\u5199\u8FDB\u53BB\u4E86\u3002
5. \u628A K15 \u62E8\u56DE 1\uFF0C\u5C06\u6570\u636E\u5F00\u5173\u4E0E\u603B\u7EBF\u9694\u5F00\u3002

\u91CD\u590D\u7B2C 2\uFF5E5 \u6B65\uFF0C\u628A\u4E0B\u9762\u56DB\u7EC4\u6570\u636E\u90FD\u5199\u5B8C\u3002

## \u9A8C\u6536\u6570\u636E

| K12 | K11\uFF5EK8 | K7\uFF5EK0 |
| --- | --- | --- |
| 0 | 1010 | 01010101 |
| 0 | 0101 | 10101010 |
| 1 | 1010 | 11111111 |
| 1 | 0101 | 00000000 |

## \u8BFB\u53D6

\u4FDD\u6301 K13 \u548C K15 \u4E3A 1\uFF0C\u628A K14 \u62E8\u5230 0\u3002\u63A5\u7740\u53EA\u5207\u6362\u9009\u7247 K12 \u548C\u5730\u5740 K11\uFF5EK8\uFF0C\u770B\u770B L7\uFF5EL0 \u663E\u793A\u7684\u6570\u636E\u548C\u8868\u4E2D\u662F\u5426\u4E00\u81F4\u3002

\u8981\u518D\u6B21\u5199\u5165\uFF0C\u5148\u628A K14 \u62E8\u56DE 1\u3002\u6574\u4E2A\u8FC7\u7A0B\u7528\u4E0D\u5230 P+ \u6216 P\u2212\u3002

## \u63D0\u9192

\u5148\u7ED3\u675F\u5199\u5165\uFF0C\u518D\u5C06\u6570\u636E\u5F00\u5173\u4E0E\u603B\u7EBF\u9694\u5F00\u3002Z \u8868\u793A\u603B\u7EBF\u6CA1\u6709\u88AB\u9A71\u52A8\uFF0C\u8BFB\u5230\u6CA1\u5199\u8FC7\u7684\u5730\u5740\u4F1A\u663E\u793A X\u3002\u5B9E\u9A8C\u5B58\u6863\u53EA\u8BB0\u5F55\u63A5\u7EBF\u7B49\u8BBE\u7F6E\uFF0CRAM \u91CC\u7684\u6570\u636E\u5728\u65AD\u7535\u3001\u5237\u65B0\u6216\u5207\u6362\u5B9E\u9A8C\u540E\u9700\u8981\u91CD\u65B0\u5199\u5165\u3002
`;
  function connectPower(project, usage) {
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      const powerPin = chip.id + "-" + model.power;
      const groundPin = chip.id + "-" + model.ground;
      connect(project, usage, power, powerPin, RAM_COLORS.power);
      connect(project, usage, ground, groundPin, RAM_COLORS.ground);
      power = powerPin;
      ground = groundPin;
    }
    for (const id of ["U1", "U2"]) {
      const memory = CHIP_MODELS["6116"].memory;
      for (let bit = 4; bit < memory.address.length; bit = bit + 1) {
        const pin = id + "-" + memory.address[bit];
        connect(project, usage, ground, pin, RAM_COLORS.ground);
        ground = pin;
      }
    }
    for (const pin of [2, 3, 4, 5]) {
      const endpoint = "U4-" + pin;
      connect(project, usage, ground, endpoint, RAM_COLORS.ground);
      ground = endpoint;
    }
    connect(project, usage, power, "U4-6", RAM_COLORS.power);
  }
  function connectAddresses(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    for (let bit = 0; bit < 4; bit = bit + 1) {
      const firstPin = "U1-" + memory.address[bit];
      const secondPin = "U2-" + memory.address[bit];
      const input = "K" + (RAM_INPUTS.addressStart + bit);
      connect(project, usage, input, firstPin, RAM_COLORS.address);
      connect(project, usage, firstPin, secondPin, RAM_COLORS.address);
    }
    connect(project, usage, "K" + RAM_INPUTS.bank, "U4-1", RAM_COLORS.address);
    connect(project, usage, "U4-15", "U1-18", RAM_COLORS.select);
    connect(project, usage, "U4-14", "U2-18", RAM_COLORS.select);
  }
  function connectData(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    const buffer = CHIP_MODELS["74LS244"];
    for (let bit = 0; bit < memory.data.length; bit = bit + 1) {
      const gate = buffer.gates[bit];
      const input = "K" + (RAM_INPUTS.dataStart + bit);
      const firstPin = "U1-" + memory.data[bit];
      const secondPin = "U2-" + memory.data[bit];
      connect(project, usage, input, "U3-" + gate[1], RAM_COLORS.dataInput);
      connect(project, usage, "U3-" + gate[2], secondPin, RAM_COLORS.dataBus);
      connect(project, usage, secondPin, firstPin, RAM_COLORS.dataBus);
      connect(project, usage, firstPin, "L" + bit, RAM_COLORS.dataBus);
    }
  }
  function connectControls(project, usage) {
    const memory = CHIP_MODELS["6116"].memory;
    connect(project, usage, "K" + RAM_INPUTS.write, "U1-" + memory.write, RAM_COLORS.control);
    connect(project, usage, "U1-" + memory.write, "U2-" + memory.write, RAM_COLORS.control);
    connect(project, usage, "K" + RAM_INPUTS.read, "U1-" + memory.read, RAM_COLORS.control);
    connect(project, usage, "U1-" + memory.read, "U2-" + memory.read, RAM_COLORS.control);
    connect(project, usage, "K" + RAM_INPUTS.isolate, "U3-1", RAM_COLORS.control);
    connect(project, usage, "U3-1", "U3-19", RAM_COLORS.control);
  }
  function outerHole(endpoint) {
    const parts = endpoint.split(":");
    if (parts[0] !== "B1") {
      return endpoint;
    }
    if (parts[1] === "C" || parts[1] === "D") {
      return parts[0] + ":A:" + parts[2];
    }
    if (parts[1] === "G" || parts[1] === "H") {
      return parts[0] + ":J:" + parts[2];
    }
    return endpoint;
  }
  function ramPreset(useOuterHoles = true) {
    const project = emptyProject();
    project.name = RAM_EXPERIMENT_NAME;
    project.notes = RAM_NOTES;
    project.inputCount = RAM_INPUTS.count;
    project.outputCount = 8;
    project.chips = structuredClone(RAM_CHIPS);
    const usage = {};
    connectPower(project, usage);
    connectAddresses(project, usage);
    connectData(project, usage);
    connectControls(project, usage);
    project.switches[RAM_INPUTS.write] = 1;
    project.switches[RAM_INPUTS.read] = 1;
    project.switches[RAM_INPUTS.isolate] = 1;
    for (const wire of project.wires) {
      if (useOuterHoles && RAM_OUTER_WIRES.includes(wire.id)) {
        wire.from = outerHole(wire.from);
        wire.to = outerHole(wire.to);
      }
      if (Object.hasOwn(ram_routes_default, wire.id)) {
        wire.bends = structuredClone(ram_routes_default[wire.id]);
      }
    }
    return project;
  }

  // src/experiments/preset-layout.mjs
  var PREVIOUS_LAYOUTS = [
    { create: complementPreset, columns: [24, 16, 39, 3, 44], ram: false },
    { create: ramPreset, columns: [8, 35, 35, 12], ram: true }
  ];
  function previousEndpoint(endpoint, reference, columns) {
    for (let index = 0; index < reference.chips.length; index = index + 1) {
      const chip = reference.chips[index];
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (baseNode(endpoint) === baseNode(pinHole(chip, pin))) {
          const parts = endpoint.split(":");
          const column = Number(parts[2]) + columns[index] - chip.column;
          return parts[0] + ":" + parts[1] + ":" + column;
        }
      }
    }
    return endpoint;
  }
  function matchesPreviousLayout(project, reference, columns) {
    if (project.chips.length !== reference.chips.length || project.wires.length !== reference.wires.length || project.pullUps.length !== 0) {
      return false;
    }
    for (let index = 0; index < reference.chips.length; index = index + 1) {
      const expected = reference.chips[index];
      const actual = project.chips[index];
      if (actual.id !== expected.id || actual.model !== expected.model || actual.section !== expected.section || actual.column !== columns[index]) {
        return false;
      }
    }
    for (let index = 0; index < reference.wires.length; index = index + 1) {
      const expected = reference.wires[index];
      const actual = project.wires[index];
      const from = previousEndpoint(expected.from, reference, columns);
      const to = previousEndpoint(expected.to, reference, columns);
      if (actual.id !== expected.id || actual.from !== from || actual.to !== to) {
        return false;
      }
    }
    return true;
  }
  function centerSavedPresets(workspace2) {
    let changed = false;
    for (const id of Object.keys(workspace2.projects)) {
      const project = workspace2.projects[id];
      if (project.notes === PREVIOUS_RAM_NOTES) {
        project.notes = RAM_NOTES;
        changed = true;
      }
      for (const layout of PREVIOUS_LAYOUTS) {
        const reference = layout.create();
        let previous = reference;
        if (layout.ram) {
          previous = ramPreset(false);
        }
        if (!matchesPreviousLayout(project, previous, layout.columns)) {
          continue;
        }
        const updated = copyProject(project);
        updated.chips = copyProject(reference.chips);
        for (let index = 0; index < updated.wires.length; index = index + 1) {
          const wire = updated.wires[index];
          const expected = reference.wires[index];
          wire.from = expected.from;
          wire.to = expected.to;
          wire.bends = copyProject(expected.bends);
          delete wire.angle;
        }
        workspace2.projects[id] = updated;
        changed = true;
      }
      const rerouted = separateSavedRamWires(workspace2.projects[id]);
      if (rerouted) {
        workspace2.projects[id] = rerouted;
        changed = true;
      }
    }
    return changed;
  }
  function separateSavedRamWires(project) {
    const previous = ramPreset(false);
    const current = ramPreset();
    if (project.chips.length !== current.chips.length || project.wires.length !== current.wires.length) {
      return null;
    }
    for (let index = 0; index < current.chips.length; index = index + 1) {
      const expected = current.chips[index];
      const actual = project.chips[index];
      if (actual.id !== expected.id || actual.model !== expected.model || actual.section !== expected.section || actual.column !== expected.column) {
        return null;
      }
    }
    const updated = copyProject(project);
    let changed = false;
    for (let index = 0; index < current.wires.length; index = index + 1) {
      const wire = updated.wires[index];
      const oldWire = previous.wires[index];
      const newWire = current.wires[index];
      if (wire.id !== oldWire.id) {
        return null;
      }
      if (baseNode(wire.from) !== baseNode(oldWire.from) || baseNode(wire.to) !== baseNode(oldWire.to)) {
        return null;
      }
      if (!RAM_OUTER_WIRES.includes(wire.id)) {
        continue;
      }
      if (wire.from === newWire.from && wire.to === newWire.to) {
        continue;
      }
      if (wire.from !== oldWire.from || wire.to !== oldWire.to) {
        return null;
      }
      wire.from = newWire.from;
      wire.to = newWire.to;
      wire.bends = copyProject(newWire.bends);
      delete wire.angle;
      changed = true;
    }
    if (!changed) {
      return null;
    }
    try {
      validateProject(updated);
    } catch (error) {
      return null;
    }
    return updated;
  }

  // src/experiments/timing-routes.json
  var timing_routes_default = {
    W1: [
      {
        x: 1242,
        y: 658.00000027
      },
      {
        x: 288,
        y: 658.00000027
      }
    ],
    W2: [
      {
        x: 1210,
        y: 738.5999997480001
      },
      {
        x: 414,
        y: 738.5999997480001
      }
    ],
    W3: [
      {
        x: 274,
        y: 646
      },
      {
        x: 274,
        y: 411
      }
    ],
    W4: [
      {
        x: 414,
        y: 754.7999997480001
      },
      {
        x: 433.99999994000007,
        y: 754.7999997480001
      },
      {
        x: 433.99999994000007,
        y: 480.2857142857143
      },
      {
        x: 414,
        y: 480.2857142857143
      }
    ],
    W5: [
      {
        x: 288,
        y: 387.33333333333326
      },
      {
        x: 779.20000034,
        y: 387.33333333333326
      },
      {
        x: 779.20000034,
        y: 661
      }
    ],
    W6: [
      {
        x: 414,
        y: 513.2857142857144
      },
      {
        x: 608.25,
        y: 513.2857142857144
      },
      {
        x: 608.25,
        y: 726
      },
      {
        x: 918,
        y: 726
      }
    ],
    W7: [
      {
        x: 783.4000003399999,
        y: 646
      },
      {
        x: 783.4000003399999,
        y: 417.33333333333326
      },
      {
        x: 810,
        y: 417.33333333333326
      }
    ],
    W8: [
      {
        x: 918,
        y: 761.3999997480001
      },
      {
        x: 937.9999996199999,
        y: 761.3999997480001
      },
      {
        x: 937.9999996199999,
        y: 491
      }
    ],
    W9: [
      {
        x: 810,
        y: 399.33333333333326
      },
      {
        x: 602.25,
        y: 399.33333333333326
      },
      {
        x: 602.25,
        y: 743.999999748
      },
      {
        x: 396,
        y: 743.999999748
      }
    ],
    W10: [
      {
        x: 396,
        y: 749.3999997480001
      },
      {
        x: 428,
        y: 749.3999997480001
      },
      {
        x: 428,
        y: 664.00000027
      },
      {
        x: 396,
        y: 664.00000027
      }
    ],
    W11: [
      {
        x: 381,
        y: 646
      },
      {
        x: 381,
        y: 491
      }
    ],
    W12: [
      {
        x: 378,
        y: 507.2857142857144
      },
      {
        x: 900,
        y: 507.2857142857144
      }
    ],
    W13: [
      {
        x: 943.9999996199999,
        y: 506
      },
      {
        x: 943.9999996199999,
        y: 399.33333333333326
      },
      {
        x: 828,
        y: 399.33333333333326
      }
    ],
    W14: [
      {
        x: 828,
        y: 393.33333333333326
      },
      {
        x: 596.25,
        y: 393.33333333333326
      },
      {
        x: 596.25,
        y: 486.2857142857143
      },
      {
        x: 324,
        y: 486.2857142857143
      }
    ],
    W15: [
      {
        x: 324,
        y: 510.2857142857143
      },
      {
        x: 342,
        y: 510.2857142857143
      }
    ],
    W16: [
      {
        x: 342,
        y: 510.2857142857143
      },
      {
        x: 363,
        y: 510.2857142857143
      },
      {
        x: 363,
        y: 491
      }
    ],
    W17: [
      {
        x: 360,
        y: 504.2857142857143
      },
      {
        x: 268.00000006,
        y: 504.2857142857143
      },
      {
        x: 268.00000006,
        y: 741
      }
    ],
    W18: [
      {
        x: 324,
        y: 754.7999997480001
      },
      {
        x: 342,
        y: 754.7999997480001
      }
    ],
    W19: [
      {
        x: 342,
        y: 754.7999997480001
      },
      {
        x: 360,
        y: 754.7999997480001
      }
    ],
    W20: [
      {
        x: 360,
        y: 754.7999997480001
      },
      {
        x: 378,
        y: 754.7999997480001
      }
    ],
    W21: [
      {
        x: 378,
        y: 770.999999748
      },
      {
        x: 813,
        y: 770.999999748
      },
      {
        x: 813,
        y: 741
      }
    ],
    W22: [
      {
        x: 1062,
        y: 734.3999997480001
      },
      {
        x: 306,
        y: 734.3999997480001
      }
    ],
    W23: [
      {
        x: 306,
        y: 760.1999997480001
      },
      {
        x: 614.25,
        y: 760.1999997480001
      },
      {
        x: 614.25,
        y: 670.00000027
      },
      {
        x: 882,
        y: 670.00000027
      }
    ],
    W24: [
      {
        x: 357,
        y: 661
      },
      {
        x: 357,
        y: 498.2857142857143
      },
      {
        x: 288,
        y: 498.2857142857143
      }
    ],
    W25: [
      {
        x: 375,
        y: 661
      },
      {
        x: 375,
        y: 492.2857142857143
      },
      {
        x: 306,
        y: 492.2857142857143
      }
    ],
    W26: [
      {
        x: 807,
        y: 1036
      },
      {
        x: 807,
        y: 730.1999997480001
      },
      {
        x: 288,
        y: 730.1999997480001
      }
    ],
    W27: [
      {
        x: 288,
        y: 765.5999997480001
      },
      {
        x: 792,
        y: 765.5999997480001
      }
    ],
    W28: [
      {
        x: 774,
        y: 664.00000027
      },
      {
        x: 918,
        y: 664.00000027
      }
    ],
    W29: [
      {
        x: 918,
        y: 483.2857142857144
      },
      {
        x: 810,
        y: 483.2857142857144
      }
    ],
    W30: [
      {
        x: 828,
        y: 652.00000027
      },
      {
        x: 414,
        y: 652.00000027
      }
    ],
    W31: [
      {
        x: 810,
        y: 676
      },
      {
        x: 932,
        y: 676
      },
      {
        x: 932,
        y: 755.3999997480001
      },
      {
        x: 900,
        y: 755.3999997480001
      }
    ],
    W32: [
      {
        x: 954,
        y: 751.1999997480001
      },
      {
        x: 882,
        y: 751.1999997480001
      }
    ],
    W33: [
      {
        x: 864,
        y: 652.00000027
      },
      {
        x: 955.9999996199999,
        y: 652.00000027
      },
      {
        x: 955.9999996199999,
        y: 116
      }
    ],
    W34: [
      {
        x: 306,
        y: 417.33333333333326
      },
      {
        x: 615,
        y: 417.33333333333326
      },
      {
        x: 615,
        y: 501.2857142857144
      },
      {
        x: 846,
        y: 501.2857142857144
      }
    ],
    W35: [
      {
        x: 864,
        y: 477.2857142857144
      },
      {
        x: 796,
        y: 477.2857142857144
      },
      {
        x: 796,
        y: 122
      },
      {
        x: 810,
        y: 122
      }
    ],
    W36: [
      {
        x: 918,
        y: 746.999999748
      },
      {
        x: 864,
        y: 746.999999748
      }
    ],
    W37: [
      {
        x: 846,
        y: 646.00000027
      },
      {
        x: 949.9999996199999,
        y: 646.00000027
      },
      {
        x: 949.9999996199999,
        y: 116
      }
    ],
    W38: [
      {
        x: 324,
        y: 423.33333333333326
      },
      {
        x: 609,
        y: 423.33333333333326
      },
      {
        x: 609,
        y: 495.2857142857144
      },
      {
        x: 882,
        y: 495.2857142857144
      }
    ],
    W39: [
      {
        x: 900,
        y: 489.2857142857144
      },
      {
        x: 774,
        y: 489.2857142857144
      }
    ],
    W40: [
      {
        x: 882,
        y: 742.7999997480001
      },
      {
        x: 846,
        y: 742.7999997480001
      }
    ],
    W41: [
      {
        x: 828,
        y: 646.00000027
      },
      {
        x: 787.60000034,
        y: 646.00000027
      },
      {
        x: 787.60000034,
        y: 116
      }
    ],
    W42: [
      {
        x: 342,
        y: 405.33333333333326
      },
      {
        x: 900,
        y: 405.33333333333326
      }
    ],
    W43: [
      {
        x: 918,
        y: 110
      },
      {
        x: 738,
        y: 110
      }
    ],
    W44: [
      {
        x: 846,
        y: 742.7999997480001
      },
      {
        x: 828,
        y: 742.7999997480001
      }
    ],
    W45: [
      {
        x: 810,
        y: 640.00000027
      },
      {
        x: 791.80000034,
        y: 640.00000027
      },
      {
        x: 791.80000034,
        y: 128
      },
      {
        x: 846,
        y: 128
      }
    ],
    W46: [
      {
        x: 360,
        y: 411.33333333333326
      },
      {
        x: 864,
        y: 411.33333333333326
      }
    ],
    W47: [
      {
        x: 882,
        y: 104
      },
      {
        x: 702,
        y: 104
      }
    ]
  };

  // src/experiments/timing-preset.mjs
  var TIMING_EXPERIMENT_ID = "timing-system-example";
  var TIMING_EXPERIMENT_NAME = "\u5B9E\u9A8C\u56DB \u65F6\u5E8F\u7CFB\u7EDF";
  var TIMING_CHIPS = [
    { id: "U1", model: "74LS161", section: 2, column: 12 },
    { id: "U2", model: "74LS138", section: 1, column: 12 },
    { id: "U3", model: "74LS194", section: 2, column: 40 },
    { id: "U4", model: "74LS04", section: 1, column: 41 }
  ];
  var PORTS = { reset: 4, load: 5, inputs: 6, outputs: 8, firstPhase: 4 };
  var DATA_PINS = [6, 5, 4, 3];
  var BEAT_PINS = [12, 13, 14, 15];
  var HIGH_PINS = ["U1-7", "U1-10", "U2-6", "U3-10"];
  var LOW_PINS = ["U4-13", "U2-3", "U2-4", "U2-5", "U1-3", "U1-4", "U1-5", "U1-6", "U3-2"];
  var COLORS = {
    power: WIRE_COLORS[0],
    ground: WIRE_COLORS[7],
    data: WIRE_COLORS[2],
    control: WIRE_COLORS[4],
    clock: WIRE_COLORS[6],
    beat: WIRE_COLORS[1],
    phase: WIRE_COLORS[5]
  };
  var TIMING_NOTES = `# \u5B9E\u9A8C\u56DB \u65F6\u5E8F\u7CFB\u7EDF

## \u7AEF\u53E3\u5206\u914D

| \u7AEF\u53E3 | \u7528\u9014 |
| --- | --- |
| K3\uFF5EK0 | \u5E76\u884C\u8F93\u5165 A\u3001B\u3001C\u3001D\uFF0C\u9884\u7F6E 0001 |
| K4 | 0 \u6E05\u96F6\u8BA1\u6570\u5668\u548C\u79FB\u4F4D\u5BC4\u5B58\u5668\uFF0C1 \u89E3\u9664\u6E05\u96F6 |
| K5 | 1 \u5E76\u884C\u88C5\u8F7D\uFF0C0 \u5FAA\u73AF\u5DE6\u79FB |
| P+ | \u8BA1\u6570\u65F6\u949F\uFF0C\u6309\u4E0B\u65F6\u8BA1\u6570\u4E00\u6B21 |
| L0\uFF5EL3 | \u8282\u62CD M0\uFF5EM3\uFF0C\u5BF9\u5E94 QD\u3001QC\u3001QB\u3001QA |
| L4\uFF5EL7 | \u5DE5\u4F5C\u8109\u51B2 T0\uFF5ET3\uFF0C\u9AD8\u7535\u5E73\u6709\u6548 |

## \u542F\u52A8\u4E0E\u89C2\u5BDF

1. \u6253\u5F00\u7535\u6E90\uFF0C\u5148\u7528\u5355\u8109\u51B2\u6A21\u5F0F\u3002\u628A K4 \u62E8\u5230 0 \u6E05\u96F6\uFF0CK5 \u62E8\u5230 1\uFF0CK3\uFF5EK0 \u8BBE\u4E3A 0001\u3002
2. \u628A K4 \u62E8\u56DE 1\uFF0C\u518D\u70B9\u4E00\u6B21 P+\u3002\u8BA1\u6570\u5668\u88C5\u5165 0\uFF0C\u79FB\u4F4D\u5BC4\u5B58\u5668\u88C5\u5165 0001\uFF0C\u8FD9\u65F6 M0 \u548C T0 \u4F1A\u540C\u65F6\u4EAE\u8D77\u3002
3. \u628A K5 \u62E8\u5230 0\u3002\u5728\u53F3\u4FA7\u300C\u65F6\u5E8F\u300D\u53D6\u6D88\u52FE\u9009 P\u2212 \u548C K0\uFF08\u5217\u8868\u4E2D\u5199\u4F5C P- \u548C K0\uFF09\uFF0C\u4FDD\u7559 L0\uFF0C\u518D\u4F9D\u6B21\u52FE\u9009 L1\uFF5EL7\u3002L0\uFF5EL3 \u5BF9\u5E94 M0\uFF5EM3\uFF0CL4\uFF5EL7 \u5BF9\u5E94 T0\uFF5ET3\u3002\u70B9\u300C\u5F00\u59CB\u300D\u540E\u9010\u6B21\u70B9\u51FB P+\uFF0C\u4E5F\u53EF\u4EE5\u5F00\u542F\u8FDE\u7EED\u8109\u51B2\u6765\u8BB0\u5F55\u6BCF\u4E00\u62CD\u7684\u53D8\u5316\u3002
4. \u91CD\u65B0\u6253\u5F00\u5B58\u6863\u6216\u65AD\u7535\u540E\uFF0C\u4ECE\u7B2C 1 \u6B65\u505A\u8D77\u3002

| \u5DE5\u4F5C\u76F8 | \u987A\u5E8F\u70B9\u4EAE\u7684\u8282\u62CD |
| --- | --- |
| T0 | M0\u3001M1\u3001M2\u3001M3 |
| T1 | M0\u3001M1\u3001M2\u3001M3 |
| T2 | M0\u3001M1\u3001M2\u3001M3 |
| T3 | M0\u3001M1\u3001M2\u3001M3 |

\u88C5\u8F7D\u5B8C\u6210\u65F6\u4EAE\u8D77\u7684\u662F M0 \u548C T0\u3002U3 \u7684 QA \u63A5\u56DE SL\uFF0C\u6240\u4EE5\u8282\u62CD\u4F1A\u5FAA\u73AF\u3002U1 \u7684\u9AD8\u4E24\u4F4D Q2\u3001Q3 \u51B3\u5B9A\u5F53\u524D\u662F\u54EA\u4E00\u76F8\uFF0C\u6BCF\u56DB\u62CD\u5207\u5230\u4E0B\u4E00\u76F8\u3002\u5230\u4E86 T3 \u7684 M3\uFF0C\u518D\u53D1\u4E00\u4E2A\u8109\u51B2\u5C31\u56DE\u5230 T0\u3001M0\u3002
`;
  function connectPower2(project, usage) {
    let supply = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
      const model = CHIP_MODELS[chip.model];
      const supplyPin = chip.id + "-" + model.power;
      const groundPin = chip.id + "-" + model.ground;
      connect(project, usage, supply, supplyPin, COLORS.power);
      connect(project, usage, ground, groundPin, COLORS.ground);
      supply = supplyPin;
      ground = groundPin;
    }
    for (const pin of HIGH_PINS) {
      connect(project, usage, supply, pin, COLORS.power);
      supply = pin;
    }
    for (const pin of LOW_PINS) {
      connect(project, usage, ground, pin, COLORS.ground);
      ground = pin;
    }
  }
  function connectClock(project, usage) {
    connect(project, usage, "P+", "U1-2", COLORS.clock);
    connect(project, usage, "U1-2", "U3-11", COLORS.clock);
    connect(project, usage, "U1-12", "U2-1", COLORS.phase);
    connect(project, usage, "U1-11", "U2-2", COLORS.phase);
    connect(project, usage, "K" + PORTS.reset, "U1-1", COLORS.control);
    connect(project, usage, "U1-1", "U3-1", COLORS.control);
    connect(project, usage, "K" + PORTS.load, "U3-9", COLORS.control);
    connect(project, usage, "U3-9", "U4-1", COLORS.control);
    connect(project, usage, "U4-2", "U1-9", COLORS.control);
  }
  function connectOutputs(project, usage) {
    connect(project, usage, "U3-15", "U3-7", COLORS.beat);
    const inverter = CHIP_MODELS["74LS04"];
    const decoder = CHIP_MODELS["74LS138"];
    for (let bit = 0; bit < BEAT_PINS.length; bit = bit + 1) {
      const dataPin = DATA_PINS[bit];
      const beatPin = BEAT_PINS[bit];
      const gate = inverter.gates[bit + 1];
      connect(project, usage, "K" + bit, "U3-" + dataPin, COLORS.data);
      connect(project, usage, "U3-" + beatPin, "L" + bit, COLORS.beat);
      connect(project, usage, "U2-" + decoder.outputs[bit], "U4-" + gate[0], COLORS.phase);
      connect(project, usage, "U4-" + gate[2], "L" + (bit + PORTS.firstPhase), COLORS.phase);
    }
  }
  function timingPreset() {
    const project = emptyProject();
    project.name = TIMING_EXPERIMENT_NAME;
    project.notes = TIMING_NOTES;
    project.inputCount = PORTS.inputs;
    project.outputCount = PORTS.outputs;
    project.switches[0] = 1;
    project.switches[PORTS.load] = 1;
    project.chips = structuredClone(TIMING_CHIPS);
    const usage = {};
    connectPower2(project, usage);
    connectClock(project, usage);
    connectOutputs(project, usage);
    for (const wire of project.wires) {
      if (Object.hasOwn(timing_routes_default, wire.id)) {
        wire.bends = structuredClone(timing_routes_default[wire.id]);
      }
    }
    return project;
  }

  // src/storage/workspace.mjs
  var WORKSPACE_KEY = "breadboard-lab-workspace-v1";
  var READ_ONLY_KEY = "breadboard-lab-read-only";
  var CLEANUP_BACKUP_KEY = "sdu-breadboard-before-cleanup-v1";
  var WORKSPACE_VERSION = 1;
  var EXPERIMENT_ID_PATTERN = /^[a-zA-Z0-9-]{1,80}$/;
  function emptyWorkspace() {
    return { version: WORKSPACE_VERSION, activeId: "", projects: {} };
  }
  function migrateSavedWorkspace(workspace2, storage) {
    const beforeCleanup = JSON.stringify(workspace2);
    const centered = centerSavedPresets(workspace2);
    const removed = cleanWorkspace(workspace2);
    if (centered || removed.length > 0) {
      storage.setItem(CLEANUP_BACKUP_KEY, beforeCleanup);
      storage.setItem(WORKSPACE_KEY, JSON.stringify(workspace2));
    }
    return removed.length;
  }
  function loadWorkspace(storageOwner) {
    let workspace2 = emptyWorkspace();
    let project = null;
    let readOnly2 = false;
    let warning = "";
    let removedCount = 0;
    let initializePreset = false;
    let hasSavedWorkspace = false;
    try {
      const storage = storageOwner.localStorage;
      readOnly2 = storage.getItem(READ_ONLY_KEY) === "true";
      const savedWorkspace = storage.getItem(WORKSPACE_KEY);
      const savedProject = storage.getItem(STORAGE_KEY);
      hasSavedWorkspace = Boolean(savedWorkspace || savedProject);
      if (savedWorkspace) {
        workspace2 = validateWorkspace(JSON.parse(savedWorkspace));
        removedCount = migrateSavedWorkspace(workspace2, storage);
        project = copyProject(workspace2.projects[workspace2.activeId]);
      } else if (savedProject) {
        project = validateProject(JSON.parse(savedProject));
      }
    } catch (error) {
      warning = "\u672C\u5730\u7535\u8DEF\u65E0\u6CD5\u6062\u590D\uFF0C\u5DF2\u6253\u5F00\u793A\u4F8B\u3002\u539F\u6587\u4EF6\u53EF\u91CD\u65B0\u5BFC\u5165";
    }
    if (!project) {
      project = complementPreset();
      initializePreset = true;
      keepExperiment(workspace2, newExperimentId(), project);
    } else {
      if (workspace2.activeId === "") {
        keepExperiment(workspace2, newExperimentId(), project);
      }
      initializePreset = project.power && isComplementPreset(project);
    }
    ensureRamExperiment(workspace2);
    ensureTimingExperiment(workspace2);
    return {
      workspace: workspace2,
      project,
      readOnly: readOnly2,
      warning,
      removedCount,
      initializePreset,
      hasSavedWorkspace
    };
  }
  function ensureTimingExperiment(workspace2) {
    let ramId = "";
    for (const id of Object.keys(workspace2.projects)) {
      const name = workspace2.projects[id].name;
      if (id === TIMING_EXPERIMENT_ID || name === TIMING_EXPERIMENT_NAME) {
        return;
      }
      if (id === RAM_EXPERIMENT_ID || name === RAM_EXPERIMENT_NAME) {
        ramId = id;
      }
    }
    const projects = {};
    for (const id of Object.keys(workspace2.projects)) {
      projects[id] = workspace2.projects[id];
      if (id === ramId) {
        projects[TIMING_EXPERIMENT_ID] = timingPreset();
      }
    }
    if (ramId === "") {
      projects[TIMING_EXPERIMENT_ID] = timingPreset();
    }
    workspace2.projects = projects;
  }
  function ensureRamExperiment(workspace2) {
    for (const id of Object.keys(workspace2.projects)) {
      if (id === RAM_EXPERIMENT_ID || workspace2.projects[id].name === RAM_EXPERIMENT_NAME) {
        return false;
      }
    }
    const projects = {};
    const ids = Object.keys(workspace2.projects);
    for (let index = 0; index < ids.length; index = index + 1) {
      const id = ids[index];
      projects[id] = workspace2.projects[id];
      if (index === 0) {
        projects[RAM_EXPERIMENT_ID] = ramPreset();
      }
    }
    if (ids.length === 0) {
      projects[RAM_EXPERIMENT_ID] = ramPreset();
    }
    workspace2.projects = projects;
    return true;
  }
  function isBlankExperiment(project) {
    if (project.chips.length > 0 || project.wires.length > 0 || project.pullUps.length > 0) {
      return false;
    }
    if (project.notes !== GENERAL_NOTES || project.power !== PROJECT_DEFAULTS.power) {
      return false;
    }
    if (project.inputCount !== PROJECT_DEFAULTS.inputCount || project.outputCount !== PROJECT_DEFAULTS.outputCount) {
      return false;
    }
    for (const value of project.switches) {
      if (value !== 0) {
        return false;
      }
    }
    return true;
  }
  function findBlankExperiment(workspace2) {
    for (const id of Object.keys(workspace2.projects)) {
      if (isBlankExperiment(workspace2.projects[id])) {
        return id;
      }
    }
    return "";
  }
  function cleanWorkspace(workspace2) {
    const removed = [];
    const signatures = /* @__PURE__ */ new Set();
    const ids = Object.keys(workspace2.projects);
    if (ids.includes(workspace2.activeId)) {
      ids.splice(ids.indexOf(workspace2.activeId), 1);
      ids.unshift(workspace2.activeId);
    }
    for (const id of ids) {
      const project = workspace2.projects[id];
      if (!isBlankExperiment(project) && project.name !== COMPLEMENT_NAME) {
        continue;
      }
      const signature = JSON.stringify(project);
      if (signatures.has(signature)) {
        removed.push(id);
        delete workspace2.projects[id];
      } else {
        signatures.add(signature);
      }
    }
    return removed;
  }
  function newExperimentId() {
    return crypto.randomUUID();
  }
  function keepExperiment(workspace2, id, project) {
    workspace2.activeId = id;
    workspace2.projects[id] = copyProject(project);
  }
  function validateWorkspace(value) {
    if (!value || value.version !== WORKSPACE_VERSION || typeof value.activeId !== "string" || !value.projects || typeof value.projects !== "object") {
      throw new Error("\u672C\u5730\u5B9E\u9A8C\u5217\u8868\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u5BFC\u5165\u4F60\u4FDD\u5B58\u7684\u5B9E\u9A8C\u6587\u4EF6");
    }
    const workspace2 = emptyWorkspace();
    workspace2.activeId = value.activeId;
    for (const id of Object.keys(value.projects)) {
      if (!EXPERIMENT_ID_PATTERN.test(id)) {
        throw new Error("\u5B9E\u9A8C\u7F16\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u68C0\u67E5\u4FDD\u5B58\u6587\u4EF6");
      }
      workspace2.projects[id] = validateProject(value.projects[id]);
    }
    if (!Object.hasOwn(workspace2.projects, workspace2.activeId)) {
      throw new Error("\u5F53\u524D\u5B9E\u9A8C\u4E0D\u5728\u5217\u8868\u4E2D\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u5B9E\u9A8C");
    }
    return workspace2;
  }

  // src/storage/workspace-settings.mjs
  var SHARED_WORKSPACE = {
    host: "127.0.0.1",
    port: 49183,
    route: "/local-workspace",
    filename: "shared-workspace.json",
    snapshotFile: "personal-workspace.json",
    tokenFile: "shared-web-key.txt",
    pairingPrefix: "#workspace=",
    maxBytes: 4 * 1024 * 1024,
    refreshInterval: 1500,
    timeout: 4e3
  };
  var SHARED_WEB_ORIGIN = "http://" + SHARED_WORKSPACE.host + ":" + SHARED_WORKSPACE.port;

  // src/storage/shared-workspace.mjs
  var PAIRING_KEY = "breadboard-shared-web-key";
  var PAIRING_TOKEN = /^[a-f0-9-]{72}$/;
  function webToken() {
    const prefix = SHARED_WORKSPACE.pairingPrefix;
    if (location.hash.startsWith(prefix)) {
      const token = location.hash.slice(prefix.length);
      if (PAIRING_TOKEN.test(token)) {
        localStorage.setItem(PAIRING_KEY, token);
        history.replaceState(null, "", location.pathname + location.search);
        return token;
      }
    }
    return localStorage.getItem(PAIRING_KEY) || "";
  }
  function sharedWorkspaceClient() {
    if (window.breadboardWorkspace) {
      return window.breadboardWorkspace;
    }
    if (location.origin !== SHARED_WEB_ORIGIN) {
      return null;
    }
    const token = webToken();
    async function request(method, change) {
      const options = {
        method,
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(SHARED_WORKSPACE.timeout),
        cache: "no-store"
      };
      if (change) {
        options.body = JSON.stringify(change);
      }
      const response = await fetch(SHARED_WORKSPACE.route, options);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }
      return result;
    }
    function read() {
      return request("GET");
    }
    function write(change) {
      return request("PUT", change);
    }
    return { read, write };
  }

  // src/version.mjs
  var CLOCK_SETTINGS = { timeZone: "Asia/Shanghai", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };

  // src/ui/inspection-layout.mjs
  var INSPECTION_SIZES = { minimum: 64, step: 24 };
  var weights = /* @__PURE__ */ new Map();
  var resizing = null;
  function resetInspectionLayout() {
    weights.clear();
    resizing = null;
  }
  function paneWeight(pane) {
    if (weights.has(pane.id)) {
      return weights.get(pane.id);
    }
    return 1;
  }
  function applyInspectionSizes() {
    const stack = element("inspection-stack");
    if (stack.hidden || stack.clientHeight === 0) {
      return;
    }
    const pinned = element("pinned-chip");
    const panes = pinned.querySelectorAll(".inspection-pane");
    const inspection = element("inspect-panel");
    const showInspection = !inspection.classList.contains("inspection-duplicate");
    let count = panes.length;
    let pinnedWeight = 0;
    for (const pane of panes) {
      pinnedWeight = pinnedWeight + paneWeight(pane);
    }
    let totalWeight = pinnedWeight;
    if (showInspection) {
      count = count + 1;
      totalWeight = totalWeight + paneWeight(inspection);
    }
    if (count === 0) {
      return;
    }
    const style = window.getComputedStyle(stack);
    const dividerHeight = Number.parseFloat(style.getPropertyValue("--inspection-divider-height"));
    const dividerCount = Math.max(0, count - 1);
    const contentHeight = Math.max(0, stack.clientHeight - dividerCount * dividerHeight);
    for (const pane of panes) {
      const height = contentHeight * paneWeight(pane) / totalWeight;
      pane.style.flexBasis = height + "px";
    }
    const internalDividers = Math.max(0, panes.length - 1);
    const pinnedHeight = contentHeight * pinnedWeight / totalWeight;
    pinned.style.flexBasis = pinnedHeight + internalDividers * dividerHeight + "px";
    inspection.style.flexBasis = contentHeight * paneWeight(inspection) / totalWeight + "px";
  }
  function configureInspectionDivider(divider, before, after) {
    divider.className = "inspection-divider";
    divider.setAttribute("role", "separator");
    divider.setAttribute("aria-orientation", "horizontal");
    divider.setAttribute("aria-label", "\u8C03\u6574\u4E0A\u4E0B\u8D44\u6599\u7A7A\u95F4");
    divider.setAttribute("aria-controls", before.id + " " + after.id);
    divider.setAttribute("aria-valuemin", "0");
    divider.setAttribute("aria-valuemax", "100");
    const totalWeight = paneWeight(before) + paneWeight(after);
    const percentage = Math.round(paneWeight(before) / totalWeight * 100);
    divider.setAttribute("aria-valuenow", String(percentage));
    divider.tabIndex = 0;
    divider.dataset.before = before.id;
    divider.dataset.after = after.id;
    if (divider.childElementCount > 0) {
      return;
    }
    for (const direction of ["up", "down"]) {
      const button = node("button", "", "splitter-adjust");
      button.dataset.direction = direction;
      let label2 = "\u589E\u52A0\u4E0B\u65B9\u8D44\u6599\u7A7A\u95F4";
      if (direction === "down") {
        label2 = "\u589E\u52A0\u4E0A\u65B9\u8D44\u6599\u7A7A\u95F4";
      }
      button.setAttribute("aria-label", label2);
      button.dataset.tip = label2;
      button.append(icon("chevron-" + direction));
      button.addEventListener("click", clickInspectionDivider);
      divider.append(button);
    }
    divider.addEventListener("pointerdown", startInspectionResize);
    divider.addEventListener("pointermove", moveInspectionResize);
    divider.addEventListener("pointerup", stopInspectionResize);
    divider.addEventListener("pointercancel", stopInspectionResize);
    divider.addEventListener("lostpointercapture", stopInspectionResize);
    divider.addEventListener("keydown", keyInspectionResize);
  }
  function resizeInspectionPair(divider, change) {
    const before = element(divider.dataset.before);
    const after = element(divider.dataset.after);
    const firstHeight = before.getBoundingClientRect().height;
    const totalHeight = firstHeight + after.getBoundingClientRect().height;
    if (totalHeight === 0) {
      return;
    }
    const minimum = Math.min(INSPECTION_SIZES.minimum, totalHeight / 3);
    const requestedHeight = firstHeight + change;
    const height = Math.max(minimum, Math.min(totalHeight - minimum, requestedHeight));
    const totalWeight = paneWeight(before) + paneWeight(after);
    weights.set(before.id, totalWeight * height / totalHeight);
    weights.set(after.id, totalWeight * (totalHeight - height) / totalHeight);
    divider.setAttribute("aria-valuenow", String(Math.round(height / totalHeight * 100)));
    applyInspectionSizes();
  }
  function startInspectionResize(event) {
    if (event.button !== 0 || event.target.closest("button")) {
      return;
    }
    event.preventDefault();
    const divider = event.currentTarget;
    resizing = { divider, y: event.clientY };
    divider.setPointerCapture(event.pointerId);
  }
  function moveInspectionResize(event) {
    if (!resizing || resizing.divider !== event.currentTarget) {
      return;
    }
    const change = event.clientY - resizing.y;
    resizing.y = event.clientY;
    resizeInspectionPair(event.currentTarget, change);
  }
  function stopInspectionResize() {
    resizing = null;
  }
  function keyInspectionResize(event) {
    if (event.target !== event.currentTarget) {
      return;
    }
    let change = 0;
    if (event.key === "ArrowUp") {
      change = -INSPECTION_SIZES.step;
    } else if (event.key === "ArrowDown") {
      change = INSPECTION_SIZES.step;
    } else {
      return;
    }
    event.preventDefault();
    resizeInspectionPair(event.currentTarget, change);
  }
  function clickInspectionDivider(event) {
    let change = INSPECTION_SIZES.step;
    if (event.currentTarget.dataset.direction === "up") {
      change = -change;
    }
    resizeInspectionPair(event.currentTarget.parentElement, change);
  }

  // src/diagram/logic-diagram.mjs
  var GATE_SYMBOLS = { xor: "=1", and: "&", or: "\u22651", nand: "&", not: "1" };
  var FUNCTION_SYMBOLS = {
    "6116": "RAM 2K\xD78",
    "74LS273": "REG",
    "74LS283": "\u03A3",
    "74LS138": "DEC",
    "74LS139": "DEC",
    "74LS151": "MUX",
    "74LS153": "MUX",
    "74LS85": "COMP",
    "74LS48": "BCD",
    "74LS74": "D",
    "74LS112": "JK",
    "CD4027": "JK",
    "74LS160": "CTR",
    "74LS161": "CTR",
    "74LS194": "SRG"
  };
  function addTerminal(context, endpoint, label2, direction, owner, pin) {
    const root = nodeFor(context.topology, endpoint);
    if (!context.networks.has(root)) {
      context.networks.set(root, { root, members: [], wireCount: 0, pullUps: [] });
    }
    const network = context.networks.get(root);
    const terminal = {
      id: owner + "-pin-" + pin,
      owner,
      pin,
      endpoint,
      label: label2,
      direction,
      root,
      level: readEndpoint(context.result, endpoint)
    };
    network.members.push(terminal);
    context.terminals.set(terminal.id, terminal);
    return terminal;
  }
  function pinDirection(model, pin) {
    if (model.outputs.includes(pin)) {
      if (model.inputs.includes(pin)) {
        return "bidirectional";
      }
      return "output";
    }
    return "input";
  }
  function collectBoardPorts(context) {
    const names = ["VCC", "GND", "P+", "P-"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
      names.push("K" + bit, "L" + bit);
    }
    for (const name of names) {
      let direction = "output";
      let label2 = name;
      if (name.startsWith("L")) {
        direction = "input";
        label2 = name + " LED";
      } else if (name.startsWith("K")) {
        label2 = name + " \u6309\u952E";
      } else if (name === "VCC") {
        label2 = "+5V";
      } else if (name === "P-") {
        label2 = "P\u2212";
      }
      const terminal = addTerminal(context, portHole(name), label2, direction, name, 0);
      context.boardPorts.push({ id: name, title: label2, terminal });
    }
  }
  function collectChipPins(context, chip) {
    const model = CHIP_MODELS[chip.model];
    const pins = [];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      if (model.labels[pin] === "NC") {
        continue;
      }
      const label2 = chip.id + " \xB7 " + pin + "\u811A " + model.labels[pin];
      const direction = pinDirection(model, pin);
      const terminal = addTerminal(context, pinHole(chip, pin), label2, direction, chip.id, pin);
      terminal.name = model.labels[pin];
      terminal.power = pin === model.power || pin === model.ground;
      pins.push(terminal);
    }
    return pins;
  }
  function gateTerminals(pins, gate) {
    const terminals = [];
    const seen = /* @__PURE__ */ new Set();
    for (const pin of gate) {
      if (seen.has(pin)) {
        continue;
      }
      seen.add(pin);
      for (const terminal of pins) {
        if (terminal.pin === pin) {
          terminals.push(terminal);
        }
      }
    }
    return terminals;
  }
  function collectChipBlocks(context, chip) {
    const model = CHIP_MODELS[chip.model];
    const pins = collectChipPins(context, chip);
    const powerPins = [];
    const signalPins = [];
    for (const terminal of pins) {
      if (terminal.power) {
        powerPins.push(terminal);
      } else {
        signalPins.push(terminal);
      }
    }
    if (model.gates && !model.diagramSymbol) {
      let symbol = GATE_SYMBOLS[model.operation];
      if (!symbol) {
        symbol = "&";
      }
      if (model.kind === "tristate") {
        symbol = "BUF";
      }
      for (let index = 0; index < model.gates.length; index = index + 1) {
        const gate = model.gates[index];
        const inverted = model.operation === "nand" || model.operation === "not" || model.kind === "open-collector" || model.kind === "nand4" || model.kind === "cmos-nand";
        context.blocks.push({
          id: chip.id + "-gate-" + (index + 1),
          chipId: chip.id,
          title: chip.id + "." + (index + 1),
          subtitle: chip.model,
          symbol,
          inverted,
          terminals: gateTerminals(pins, gate),
          powerPins
        });
      }
    } else {
      let functionSymbol = FUNCTION_SYMBOLS[chip.model];
      if (model.diagramSymbol) {
        functionSymbol = model.diagramSymbol;
      }
      context.blocks.push({
        id: chip.id,
        chipId: chip.id,
        title: chip.id + " \xB7 " + chip.model,
        subtitle: model.title,
        symbol: "",
        functionSymbol,
        inverted: false,
        terminals: signalPins,
        powerPins
      });
    }
  }
  function collectNetworks(context, project) {
    for (const wire of project.wires) {
      const root = nodeFor(context.topology, wire.from);
      if (!context.networks.has(root)) {
        context.networks.set(root, { root, members: [], wireCount: 0, pullUps: [], holesOnly: true });
      }
      const network = context.networks.get(root);
      network.wireCount = network.wireCount + 1;
      if (network.holesOnly) {
        addTerminal(context, wire.from, endpointLabel(wire.from), "bidirectional", wire.id + "-from", 0);
        addTerminal(context, wire.to, endpointLabel(wire.to), "bidirectional", wire.id + "-to", 0);
      }
    }
    for (const endpoint of project.pullUps) {
      const root = nodeFor(context.topology, endpoint);
      if (!context.networks.has(root)) {
        addTerminal(context, endpoint, endpointLabel(endpoint), "bidirectional", "pullup-" + root, 0);
      }
      context.networks.get(root).pullUps.push(endpoint);
    }
    const nets = [];
    for (const network of context.networks.values()) {
      if (network.members.length < 2 && network.wireCount === 0 && network.pullUps.length === 0) {
        continue;
      }
      network.id = "N" + (nets.length + 1);
      network.level = network.members[0].level;
      network.rail = "";
      for (const terminal of network.members) {
        terminal.netId = network.id;
        if (terminal.owner === "VCC" || terminal.owner === "GND") {
          if (network.rail !== "") {
            network.rail = "+5V / GND";
          } else if (terminal.owner === "VCC") {
            network.rail = "+5V";
          } else {
            network.rail = "GND";
          }
        }
      }
      nets.push(network);
    }
    return nets;
  }
  function buildLogicDiagram(project, result) {
    const context = {
      topology: buildTopology(project),
      result: { topology: structuredClone(result.topology), values: result.values },
      networks: /* @__PURE__ */ new Map(),
      terminals: /* @__PURE__ */ new Map(),
      boardPorts: [],
      blocks: []
    };
    collectBoardPorts(context);
    for (const chip of project.chips) {
      collectChipBlocks(context, chip);
    }
    const nets = collectNetworks(context, project);
    const floatingInputs2 = [];
    for (const terminal of context.terminals.values()) {
      if (terminal.pin > 0 && !terminal.power && terminal.direction !== "output" && terminal.level === "Z") {
        floatingInputs2.push(terminal);
      }
    }
    return { nets, blocks: context.blocks, boardPorts: context.boardPorts, floatingInputs: floatingInputs2 };
  }

  // src/diagram/logic-diagram-layout.mjs
  var LAYOUT_SCRIPT = "vendor/elk.bundled.js";
  var LOGIC_LAYOUT = {
    blockWidth: 248,
    gateWidth: 108,
    top: 26,
    row: 22,
    pinPadding: 14,
    lead: 24,
    minimumBodyHeight: 42,
    bottom: 22,
    portSize: 4
  };
  var LAYOUT_OPTIONS = {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.padding": "[top=38,left=38,bottom=38,right=38]",
    "elk.spacing.nodeNode": "48",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "elk.layered.spacing.edgeNodeBetweenLayers": "32",
    "elk.spacing.edgeEdge": "16",
    "elk.layered.mergeEdges": "true",
    "elk.layered.nodePlacement.favorStraightEdges": "true",
    "elk.layered.unnecessaryBendpoints": "false",
    "elk.randomSeed": "1"
  };
  var LAYERING_STRATEGIES = ["NETWORK_SIMPLEX", "LONGEST_PATH_SOURCE"];
  var COORDINATE_TOLERANCE = 1e-6;
  var layoutEngine = null;
  var loadingEngine = null;
  async function createLayoutEngine() {
    if (typeof window === "undefined") {
      const runtime = await import("elkjs/lib/elk.bundled.js");
      return new runtime.default();
    }
    await loadRuntimeScript(LAYOUT_SCRIPT);
    return new window.ELK();
  }
  function resetLayoutLoading(error) {
    loadingEngine = null;
    throw error;
  }
  function layoutPort(terminal, width, vertical, output) {
    let horizontal = -LOGIC_LAYOUT.portSize / 2;
    if (output) {
      horizontal = width - LOGIC_LAYOUT.portSize / 2;
    }
    return {
      id: terminal.id,
      width: LOGIC_LAYOUT.portSize,
      height: LOGIC_LAYOUT.portSize,
      x: horizontal,
      y: vertical - LOGIC_LAYOUT.portSize / 2,
      terminal
    };
  }
  function blockNode(block) {
    let width = LOGIC_LAYOUT.blockWidth;
    if (block.symbol !== "") {
      width = LOGIC_LAYOUT.gateWidth;
    }
    const ports = [];
    let inputs = 0;
    let outputs = 0;
    for (const terminal of block.terminals) {
      if (terminal.direction === "output") {
        outputs = outputs + 1;
      } else {
        inputs = inputs + 1;
      }
    }
    const rows = Math.max(inputs, outputs);
    const bodyHeight = Math.max(LOGIC_LAYOUT.minimumBodyHeight, (rows - 1) * LOGIC_LAYOUT.row + LOGIC_LAYOUT.pinPadding * 2);
    let inputIndex = 0;
    let outputIndex = 0;
    for (const terminal of block.terminals) {
      const output = terminal.direction === "output";
      let index = inputIndex;
      let count = inputs;
      if (output) {
        index = outputIndex;
        count = outputs;
        outputIndex = outputIndex + 1;
      } else {
        inputIndex = inputIndex + 1;
      }
      let vertical = LOGIC_LAYOUT.top + bodyHeight / 2;
      if (count > 1) {
        vertical = LOGIC_LAYOUT.top + LOGIC_LAYOUT.pinPadding + index * (bodyHeight - LOGIC_LAYOUT.pinPadding * 2) / (count - 1);
      }
      ports.push(layoutPort(terminal, width, Math.round(vertical), output));
    }
    const height = LOGIC_LAYOUT.top + bodyHeight + LOGIC_LAYOUT.bottom;
    return {
      id: block.id,
      width,
      height,
      ports,
      block,
      body: { x: LOGIC_LAYOUT.lead, y: LOGIC_LAYOUT.top, width: width - LOGIC_LAYOUT.lead * 2, height: bodyHeight },
      layoutOptions: { "elk.portConstraints": "FIXED_POS" }
    };
  }
  function boardNode(port) {
    const output = port.terminal.direction === "output";
    const width = 98;
    let horizontal = 0;
    let layer = "LAST";
    if (output) {
      horizontal = width;
      layer = "FIRST";
    }
    return {
      id: "board-" + port.id,
      width,
      height: 44,
      boardPort: port,
      ports: [{ id: port.terminal.id, width: 4, height: 4, x: horizontal - 2, y: 20, terminal: port.terminal }],
      layoutOptions: { "elk.portConstraints": "FIXED_POS", "elk.layered.layering.layerConstraint": layer }
    };
  }
  function addNetworkEdges(graph, network, visible) {
    const members = [];
    const drivers = [];
    for (const terminal of network.members) {
      if (visible.has(terminal.id)) {
        members.push(terminal);
        if (terminal.direction === "output") {
          drivers.push(terminal);
        }
      }
    }
    if (members.length < 2) {
      return;
    }
    let source = members[0];
    if (drivers.length > 0) {
      source = drivers[0];
    }
    for (const terminal of members) {
      if (terminal.id === source.id) {
        continue;
      }
      graph.edges.push({
        id: network.id + "-" + graph.edges.length,
        sources: [source.id],
        targets: [terminal.id],
        netId: network.id
      });
    }
  }
  function createLogicGraph(diagram, showPower = false) {
    const byRoot = /* @__PURE__ */ new Map();
    for (const network of diagram.nets) {
      byRoot.set(network.root, network);
    }
    const graph = { id: "logic", layoutOptions: LAYOUT_OPTIONS, children: [], edges: [] };
    const visible = /* @__PURE__ */ new Set();
    const boardOwners = /* @__PURE__ */ new Set();
    for (const port of diagram.boardPorts) {
      boardOwners.add(port.id);
    }
    for (const block of diagram.blocks) {
      const node2 = blockNode(block);
      graph.children.push(node2);
      for (const port of node2.ports) {
        visible.add(port.id);
      }
      if (showPower && !visible.has(block.powerPins[0].id)) {
        const powerBlock = {
          id: block.chipId + "-power",
          title: block.chipId + " \u4F9B\u7535",
          subtitle: "\u7535\u6E90\u5F15\u811A",
          symbol: "",
          terminals: block.powerPins,
          powerPins: []
        };
        const powerNode = blockNode(powerBlock);
        graph.children.push(powerNode);
        for (const port of powerNode.ports) {
          visible.add(port.id);
        }
      }
    }
    for (const port of diagram.boardPorts) {
      const network = byRoot.get(port.terminal.root);
      if (!network || !showPower && network.rail !== "") {
        continue;
      }
      const node2 = boardNode(port);
      graph.children.push(node2);
      visible.add(port.terminal.id);
    }
    for (const network of diagram.nets) {
      for (const terminal of network.members) {
        if (terminal.pin === 0 && !visible.has(terminal.id) && !boardOwners.has(terminal.owner)) {
          const looseNode = boardNode({ id: terminal.owner, title: terminal.label, terminal });
          graph.children.push(looseNode);
          visible.add(terminal.id);
        }
      }
      if (showPower || network.rail === "") {
        addNetworkEdges(graph, network, visible);
      }
    }
    return graph;
  }
  function logicDiagramMetrics(graph) {
    let bends = 0;
    let length = 0;
    for (const edge of graph.edges) {
      for (const section of edge.sections) {
        const points = [section.startPoint];
        for (const point of section.bendPoints || []) {
          points.push(point);
        }
        points.push(section.endPoint);
        let previous = "";
        for (let index = 1; index < points.length; index = index + 1) {
          const horizontal = Math.abs(points[index].x - points[index - 1].x);
          const vertical = Math.abs(points[index].y - points[index - 1].y);
          if (horizontal + vertical <= COORDINATE_TOLERANCE) {
            continue;
          }
          let direction = "horizontal";
          if (horizontal <= COORDINATE_TOLERANCE) {
            direction = "vertical";
          }
          if (previous !== "" && previous !== direction) {
            bends = bends + 1;
          }
          previous = direction;
          length = length + horizontal + vertical;
        }
      }
    }
    return { bends, length };
  }
  async function layoutLogicDiagram(diagram, showPower = false) {
    if (!layoutEngine) {
      if (!loadingEngine) {
        loadingEngine = createLayoutEngine().catch(resetLayoutLoading);
      }
      layoutEngine = await loadingEngine;
    }
    let best = null;
    let bestMetrics = null;
    for (const strategy of LAYERING_STRATEGIES) {
      const graph = createLogicGraph(diagram, showPower);
      if (graph.children.length === 0) {
        return { id: graph.id, width: 400, height: 140, children: [], edges: [] };
      }
      graph.layoutOptions = Object.assign({}, LAYOUT_OPTIONS);
      graph.layoutOptions["elk.layered.layering.strategy"] = strategy;
      const candidate = await layoutEngine.layout(graph);
      const metrics = logicDiagramMetrics(candidate);
      const fewerBends = bestMetrics && metrics.bends < bestMetrics.bends;
      const shorter = bestMetrics && metrics.bends === bestMetrics.bends && metrics.length < bestMetrics.length;
      if (!best || fewerBends || shorter) {
        best = candidate;
        bestMetrics = metrics;
      }
    }
    return best;
  }

  // src/ui/viewport-pan.mjs
  var PAN_SETTINGS = { threshold: 4 };
  function bindViewportPan(viewport, options) {
    let gesture = null;
    let suppressClick = false;
    function startPan(event) {
      if (gesture) {
        return;
      }
      suppressClick = false;
      if (event.pointerType !== "mouse" || !options.buttons.includes(event.button)) {
        return;
      }
      if (!options.canStart(event)) {
        return;
      }
      const bounds = viewport.getBoundingClientRect();
      const contentRight = bounds.left + viewport.clientLeft + viewport.clientWidth;
      const contentBottom = bounds.top + viewport.clientTop + viewport.clientHeight;
      if (event.clientX >= contentRight || event.clientY >= contentBottom) {
        return;
      }
      gesture = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        moved: false
      };
      if (event.button === 1) {
        event.preventDefault();
      }
    }
    function movePan(event) {
      if (!gesture || event.pointerId !== gesture.pointerId) {
        return;
      }
      const distanceX = event.clientX - gesture.clientX;
      const distanceY = event.clientY - gesture.clientY;
      const distance = Math.hypot(distanceX, distanceY);
      if (!gesture.moved && distance <= PAN_SETTINGS.threshold) {
        return;
      }
      if (!gesture.moved) {
        gesture.moved = true;
        suppressClick = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add(options.activeClass);
        options.onStart();
      }
      event.preventDefault();
      viewport.scrollLeft = gesture.scrollLeft - distanceX;
      viewport.scrollTop = gesture.scrollTop - distanceY;
    }
    function finishPan(event = null) {
      if (!gesture) {
        return;
      }
      if (event && event.pointerId !== void 0 && event.pointerId !== gesture.pointerId) {
        return;
      }
      const pointerId = gesture.pointerId;
      gesture = null;
      viewport.classList.remove(options.activeClass);
      if (viewport.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
    }
    function suppressPanClick(event) {
      if (suppressClick && event.detail > 0) {
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function isDragging() {
      return gesture !== null && gesture.moved;
    }
    viewport.addEventListener("pointerdown", startPan);
    viewport.addEventListener("pointermove", movePan);
    viewport.addEventListener("lostpointercapture", finishPan);
    viewport.addEventListener("click", suppressPanClick, true);
    window.addEventListener("pointerup", finishPan);
    window.addEventListener("pointercancel", finishPan);
    window.addEventListener("blur", finishPan);
    return { isDragging, finish: finishPan };
  }

  // src/ui/selection-geometry.mjs
  function selectionRectangle(first, last) {
    return {
      left: Math.min(first.x, last.x),
      top: Math.min(first.y, last.y),
      right: Math.max(first.x, last.x),
      bottom: Math.max(first.y, last.y)
    };
  }
  function rectanglesIntersect(first, second) {
    return first.left <= second.right && first.right >= second.left && first.top <= second.bottom && first.bottom >= second.top;
  }
  function segmentIntersectsRectangle(first, last, rectangle2) {
    let start2 = 0;
    let end = 1;
    const directions = [
      { origin: first.x, distance: last.x - first.x, minimum: rectangle2.left, maximum: rectangle2.right },
      { origin: first.y, distance: last.y - first.y, minimum: rectangle2.top, maximum: rectangle2.bottom }
    ];
    for (const direction of directions) {
      if (direction.distance === 0) {
        if (direction.origin < direction.minimum || direction.origin > direction.maximum) {
          return false;
        }
        continue;
      }
      const firstCrossing = (direction.minimum - direction.origin) / direction.distance;
      const lastCrossing = (direction.maximum - direction.origin) / direction.distance;
      start2 = Math.max(start2, Math.min(firstCrossing, lastCrossing));
      end = Math.min(end, Math.max(firstCrossing, lastCrossing));
      if (start2 > end) {
        return false;
      }
    }
    return true;
  }
  function pathIntersectsRectangle(points, rectangle2) {
    for (let index = 1; index < points.length; index = index + 1) {
      if (segmentIntersectsRectangle(points[index - 1], points[index], rectangle2)) {
        return true;
      }
    }
    return false;
  }

  // src/ui/viewport-selection.mjs
  var BOX_SETTINGS = { threshold: 4 };
  function bindViewportSelection(viewport, options) {
    let gesture = null;
    const overlay = document.createElement("div");
    overlay.className = "viewport-selection-box";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    viewport.append(overlay);
    function selectionPoint(event) {
      const bounds = viewport.getBoundingClientRect();
      const left = bounds.left + viewport.clientLeft;
      const top = bounds.top + viewport.clientTop;
      return {
        x: Math.max(left, Math.min(left + viewport.clientWidth, event.clientX)),
        y: Math.max(top, Math.min(top + viewport.clientHeight, event.clientY))
      };
    }
    function startSelection(event) {
      if (event.pointerType !== "mouse" || event.button !== 2 || gesture || !options.canStart()) {
        return;
      }
      const point = selectionPoint(event);
      if (point.x !== event.clientX || point.y !== event.clientY) {
        return;
      }
      event.preventDefault();
      gesture = {
        pointerId: event.pointerId,
        first: point,
        last: point,
        multiple: event.ctrlKey || event.metaKey,
        moved: false
      };
      viewport.setPointerCapture(event.pointerId);
    }
    function moveSelection(event) {
      if (!gesture || event.pointerId !== gesture.pointerId) {
        return;
      }
      gesture.last = selectionPoint(event);
      const distanceX = gesture.last.x - gesture.first.x;
      const distanceY = gesture.last.y - gesture.first.y;
      if (!gesture.moved && Math.hypot(distanceX, distanceY) <= BOX_SETTINGS.threshold) {
        return;
      }
      gesture.moved = true;
      event.preventDefault();
      const rectangle2 = selectionRectangle(gesture.first, gesture.last);
      const bounds = viewport.getBoundingClientRect();
      overlay.hidden = false;
      overlay.style.left = rectangle2.left - bounds.left - viewport.clientLeft + viewport.scrollLeft + "px";
      overlay.style.top = rectangle2.top - bounds.top - viewport.clientTop + viewport.scrollTop + "px";
      overlay.style.width = rectangle2.right - rectangle2.left + "px";
      overlay.style.height = rectangle2.bottom - rectangle2.top + "px";
      viewport.classList.add("viewport-selecting");
    }
    function cancelSelection() {
      if (!gesture) {
        return;
      }
      const pointerId = gesture.pointerId;
      gesture = null;
      overlay.hidden = true;
      viewport.classList.remove("viewport-selecting");
      if (viewport.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
    }
    function finishSelection(event) {
      if (!gesture || event.pointerId !== gesture.pointerId || event.button !== 2) {
        return;
      }
      moveSelection(event);
      const completed = gesture;
      cancelSelection();
      if (completed.moved) {
        const rectangle2 = selectionRectangle(completed.first, completed.last);
        options.onSelect(rectangle2, completed.multiple);
      }
    }
    function cancelPointerSelection(event) {
      if (gesture && event.pointerId === gesture.pointerId) {
        cancelSelection();
      }
    }
    function cancelSelectionKey(event) {
      if (gesture && event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        cancelSelection();
      }
    }
    function preventSelectionMenu(event) {
      event.preventDefault();
    }
    function isSelecting() {
      return gesture !== null;
    }
    viewport.addEventListener("pointerdown", startSelection);
    viewport.addEventListener("pointermove", moveSelection);
    viewport.addEventListener("lostpointercapture", cancelPointerSelection);
    viewport.addEventListener("contextmenu", preventSelectionMenu);
    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", cancelPointerSelection);
    window.addEventListener("blur", cancelSelection);
    document.addEventListener("keydown", cancelSelectionKey, true);
    return { cancel: cancelSelection, isSelecting };
  }

  // src/diagram/logic-diagram-view.mjs
  var VIEW_OPTIONS = { minimum: 0.15, maximum: 2.5, step: 0.15, margin: 24 };
  var DIAGRAM_PAN_OPTIONS = {
    buttons: [0, 1],
    activeClass: "logic-panning",
    canStart: canPanDiagram,
    onStart: prepareDiagramPan
  };
  var DIAGRAM_SELECTION_OPTIONS = { canStart: canSelectDiagramArea, onSelect: selectDiagramArea };
  var DIAGRAM_CONTROLS = ["logic-export", "logic-show-power", "logic-fit", "logic-zoom-in", "logic-zoom-out", "logic-network"];
  var SYMBOL_DRAW = { bubbleRadius: 3.5, junctionRadius: 4.5, numberOffset: 7, numberRise: 4, labelOffset: 9 };
  var currentDiagram = null;
  var currentGraph = null;
  var currentProject = null;
  var currentResult = null;
  var zoom = 1;
  var generation = 0;
  var diagramPan = null;
  var diagramSelection = null;
  var selectedNetworks = /* @__PURE__ */ new Set();
  function terminalNetwork(terminal) {
    for (const network of currentDiagram.nets) {
      if (network.root === terminal.root) {
        return network;
      }
    }
    return null;
  }
  function makeNetworkTarget(shape, network) {
    shape.dataset.net = network.id;
    shape.dataset.level = String(network.level);
    shape.setAttribute("tabindex", "0");
    shape.setAttribute("role", "button");
    shape.setAttribute("aria-pressed", "false");
    shape.setAttribute("aria-label", network.id + "\uFF0C\u7535\u5E73 " + network.level);
  }
  function drawEdge(svg2, edge) {
    const network = currentDiagram.nets.find(findEdgeNetwork.bind(null, edge.netId));
    for (const section of edge.sections || []) {
      let path = "M " + section.startPoint.x + " " + section.startPoint.y;
      for (const point of section.bendPoints || []) {
        path = path + " L " + point.x + " " + point.y;
      }
      path = path + " L " + section.endPoint.x + " " + section.endPoint.y;
      const group = svgElement(svg2, "g", { class: "logic-edge" });
      makeNetworkTarget(group, network);
      svgElement(group, "path", { d: path, class: "logic-wire-halo" });
      svgElement(group, "path", { d: path, class: "logic-wire" });
      svgElement(group, "path", { d: path, class: "logic-wire-hit" });
      svgElement(group, "title", {}, network.id + " \xB7 " + network.members.length + " \u4E2A\u7AEF\u70B9");
    }
  }
  function drawJunctions(svg2) {
    const drawn = /* @__PURE__ */ new Set();
    const layer = svgElement(svg2, "g", { class: "logic-junction-layer" });
    for (const edge of currentGraph.edges) {
      for (const point of edge.junctionPoints || []) {
        const key = edge.netId + ":" + point.x + ":" + point.y;
        if (drawn.has(key)) {
          continue;
        }
        drawn.add(key);
        svgElement(layer, "circle", {
          cx: point.x,
          cy: point.y,
          r: SYMBOL_DRAW.junctionRadius,
          class: "logic-junction",
          "data-net": edge.netId
        });
      }
    }
  }
  function findEdgeNetwork(id, network) {
    return network.id === id;
  }
  function drawPort(group, port, item) {
    const terminal = port.terminal;
    const right = terminal.direction === "output";
    const centerX = port.x + port.width / 2;
    const centerY = port.y + port.height / 2;
    const body = item.body;
    let boundary = body.x;
    let textX = boundary + SYMBOL_DRAW.labelOffset;
    let anchor2 = "start";
    let numberX = centerX + SYMBOL_DRAW.numberOffset;
    if (right) {
      boundary = body.x + body.width;
      textX = boundary - SYMBOL_DRAW.labelOffset;
      anchor2 = "end";
      numberX = centerX - SYMBOL_DRAW.numberOffset;
    }
    let label2 = terminal.name;
    const network = terminalNetwork(terminal);
    if (network && network.rail !== "" && !element("logic-show-power").checked) {
      label2 = label2 + " \xB7 " + network.rail;
    }
    const target = svgElement(group, "g", { class: "logic-pin" });
    if (network) {
      makeNetworkTarget(target, network);
    }
    let inverted = false;
    if (right && item.block.inverted) {
      inverted = true;
    }
    if (item.block.symbol === "" && /[′̅]/u.test(terminal.name)) {
      inverted = true;
    }
    if (item.block.symbol === "BUF" && /[′̅]/u.test(terminal.name)) {
      inverted = true;
    }
    let wireBoundary = boundary;
    let bubbleX = boundary;
    if (inverted) {
      if (right) {
        wireBoundary = boundary + SYMBOL_DRAW.bubbleRadius * 2;
        bubbleX = boundary + SYMBOL_DRAW.bubbleRadius;
      } else {
        wireBoundary = boundary - SYMBOL_DRAW.bubbleRadius * 2;
        bubbleX = boundary - SYMBOL_DRAW.bubbleRadius;
      }
    }
    svgElement(target, "line", { x1: centerX, y1: centerY, x2: wireBoundary, y2: centerY, class: "logic-pin-lead" });
    if (inverted) {
      svgElement(target, "circle", { cx: bubbleX, cy: centerY, r: SYMBOL_DRAW.bubbleRadius, class: "logic-inversion" });
    }
    svgElement(target, "text", {
      x: numberX,
      y: centerY - SYMBOL_DRAW.numberRise,
      "text-anchor": anchor2,
      class: "logic-pin-number"
    }, String(terminal.pin));
    if (item.block.symbol === "") {
      svgElement(target, "text", { x: textX, y: centerY + 4, "text-anchor": anchor2, class: "logic-pin-label" }, label2);
    } else if (network && network.rail !== "" && !element("logic-show-power").checked) {
      svgElement(target, "text", {
        x: numberX,
        y: centerY + 11,
        "text-anchor": anchor2,
        class: "logic-power-label"
      }, network.rail);
    }
    svgElement(target, "title", {}, terminal.label + " \xB7 " + terminal.level);
  }
  function drawPowerLabels(group, block, height) {
    const parts = [];
    for (const terminal of block.powerPins) {
      const network = terminalNetwork(terminal);
      let text2 = terminal.pin + " " + terminal.name + ":Z";
      if (network) {
        text2 = terminal.pin + " " + terminal.name + ":" + network.id;
      }
      parts.push(text2);
    }
    svgElement(group, "text", { x: 12, y: height - 12, class: "logic-power-label" }, parts.join(" \xB7 "));
  }
  function drawNode(svg2, item) {
    const group = svgElement(svg2, "g", { transform: "translate(" + item.x + " " + item.y + ")", class: "logic-component" });
    group.dataset.component = item.id;
    if (item.boardPort) {
      const port = item.boardPort;
      const network = terminalNetwork(port.terminal);
      const terminal = item.ports[0];
      let labelX = 0;
      let wireEnd = item.width - 24;
      if (port.terminal.direction !== "output") {
        labelX = 20;
        wireEnd = 16;
      }
      svgElement(group, "text", { x: labelX, y: 18, class: "logic-component-title" }, port.title);
      svgElement(group, "text", { x: labelX, y: 34, class: "logic-level-text" }, String(port.terminal.level));
      svgElement(group, "line", {
        x1: terminal.x + terminal.width / 2,
        y1: terminal.y + terminal.height / 2,
        x2: wireEnd,
        y2: terminal.y + terminal.height / 2,
        class: "logic-pin-lead"
      });
      if (network) {
        makeNetworkTarget(group, network);
      }
      return;
    }
    const block = item.block;
    const body = item.body;
    svgElement(group, "rect", {
      x: body.x,
      y: body.y,
      width: body.width,
      height: body.height,
      class: "logic-component-body"
    });
    svgElement(group, "text", {
      x: item.width / 2,
      y: 15,
      "text-anchor": "middle",
      class: "logic-component-title"
    }, block.title);
    if (block.symbol !== "") {
      svgElement(group, "text", {
        x: item.width / 2,
        y: body.y + body.height / 2 + 6,
        "text-anchor": "middle",
        class: "logic-gate-symbol"
      }, block.symbol);
      svgElement(group, "text", {
        x: item.width / 2,
        y: item.height - 7,
        "text-anchor": "middle",
        class: "logic-component-subtitle"
      }, block.subtitle);
    } else {
      drawPowerLabels(group, block, item.height);
      if (block.functionSymbol) {
        svgElement(group, "text", {
          x: item.width / 2,
          y: body.y + body.height / 2 + 5,
          "text-anchor": "middle",
          class: "logic-function-symbol"
        }, block.functionSymbol);
      }
    }
    for (const port of item.ports) {
      drawPort(group, port, item);
    }
    svgElement(group, "title", {}, block.title + " \xB7 " + block.subtitle);
  }
  function drawGraph() {
    selectedNetworks.clear();
    const svg2 = element("logic-diagram");
    svg2.replaceChildren();
    svg2.setAttribute("viewBox", "0 0 " + currentGraph.width + " " + currentGraph.height);
    svg2.setAttribute("role", "img");
    svg2.setAttribute("aria-label", "\u5F53\u524D\u7535\u8DEF\u903B\u8F91\u8FDE\u7EBF\u56FE");
    svgElement(svg2, "rect", { width: currentGraph.width, height: currentGraph.height, class: "logic-paper" });
    for (const edge of currentGraph.edges) {
      drawEdge(svg2, edge);
    }
    drawJunctions(svg2);
    for (const item of currentGraph.children) {
      drawNode(svg2, item);
    }
    if (currentGraph.children.length === 0) {
      svgElement(svg2, "text", { x: 24, y: 60, class: "logic-component-title" }, "\u5F53\u524D\u5B9E\u9A8C\u6CA1\u6709\u82AF\u7247\u6216\u8FDE\u7EBF");
    }
    const select = element("logic-network");
    const placeholder = node("option", "\u7F51\u7EDC\u6838\u5BF9", "");
    placeholder.value = "";
    select.replaceChildren(placeholder);
    for (const network of currentDiagram.nets) {
      const option = node("option", network.id + " \xB7 " + network.members[0].label, "");
      option.value = network.id;
      select.append(option);
    }
    element("logic-network-members").replaceChildren();
    fitLogicDiagram();
  }
  async function generateDiagram() {
    diagramPan.finish();
    diagramSelection.cancel();
    const request = generation + 1;
    generation = request;
    element("logic-diagram-dialog").setAttribute("aria-busy", "true");
    element("logic-diagram-summary").textContent = "\u6B63\u5728\u751F\u6210\u903B\u8F91\u56FE";
    element("logic-export-error").hidden = true;
    currentGraph = null;
    const svg2 = element("logic-diagram");
    svg2.replaceChildren();
    svg2.removeAttribute("style");
    element("logic-network-members").replaceChildren();
    const networkPicker = element("logic-network");
    const placeholder = node("option", "\u7F51\u7EDC\u6838\u5BF9", "");
    placeholder.value = "";
    networkPicker.replaceChildren(placeholder);
    element("logic-zoom-label").textContent = "";
    for (const id of DIAGRAM_CONTROLS) {
      element(id).disabled = true;
    }
    refreshSelect(networkPicker);
    try {
      const diagram = buildLogicDiagram(currentProject, currentResult);
      const graph = await layoutLogicDiagram(diagram, element("logic-show-power").checked);
      if (generation !== request || !element("logic-diagram-dialog").open) {
        return;
      }
      currentDiagram = diagram;
      currentGraph = graph;
      drawGraph();
      element("logic-diagram-summary").textContent = currentProject.chips.length + " \u7247\u82AF\u7247 \xB7 " + diagram.blocks.length + " \u4E2A\u903B\u8F91\u5143\u4EF6 \xB7 " + diagram.nets.length + " \u7EC4\u7F51\u7EDC";
      for (const id of DIAGRAM_CONTROLS) {
        element(id).disabled = false;
      }
      refreshSelect(networkPicker);
    } catch (error) {
      if (generation !== request || !element("logic-diagram-dialog").open) {
        return;
      }
      element("logic-diagram-summary").textContent = "\u903B\u8F91\u56FE\u751F\u6210\u5931\u8D25\uFF1A" + error.message;
      element("logic-show-power").disabled = false;
    } finally {
      if (generation === request) {
        element("logic-diagram-dialog").setAttribute("aria-busy", "false");
      }
    }
  }
  function openLogicDiagram(project, result) {
    currentProject = project;
    currentResult = result;
    element("logic-diagram-dialog").showModal();
    generateDiagram();
  }
  function closeLogicDiagram() {
    generation = generation + 1;
    element("logic-diagram-dialog").close();
  }
  function setLogicZoom(value, anchor2 = null) {
    if (!currentGraph) {
      return;
    }
    const viewport = element("logic-diagram-scroll");
    const svg2 = element("logic-diagram");
    const bounds = viewport.getBoundingClientRect();
    let offsetX = viewport.clientWidth / 2;
    let offsetY = viewport.clientHeight / 2;
    if (anchor2) {
      offsetX = anchor2.clientX - bounds.left - viewport.clientLeft;
      offsetY = anchor2.clientY - bounds.top - viewport.clientTop;
    }
    const diagramX = (viewport.scrollLeft + offsetX) / zoom;
    const diagramY = (viewport.scrollTop + offsetY) / zoom;
    zoom = Math.max(VIEW_OPTIONS.minimum, Math.min(VIEW_OPTIONS.maximum, value));
    svg2.style.width = currentGraph.width * zoom + "px";
    svg2.style.height = currentGraph.height * zoom + "px";
    element("logic-zoom-label").textContent = Math.round(zoom * 100) + "%";
    viewport.scrollLeft = diagramX * zoom - offsetX;
    viewport.scrollTop = diagramY * zoom - offsetY;
  }
  function fitLogicDiagram() {
    if (currentGraph) {
      const width = element("logic-diagram-scroll").clientWidth - VIEW_OPTIONS.margin;
      setLogicZoom(width / currentGraph.width);
      element("logic-diagram-scroll").scrollLeft = 0;
      element("logic-diagram-scroll").scrollTop = 0;
    }
  }
  function zoomInLogicDiagram() {
    setLogicZoom(zoom + VIEW_OPTIONS.step);
  }
  function zoomOutLogicDiagram() {
    setLogicZoom(zoom - VIEW_OPTIONS.step);
  }
  function wheelLogicDiagram(event) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    event.preventDefault();
    if (!currentGraph || element("logic-diagram-dialog").getAttribute("aria-busy") === "true") {
      return;
    }
    const viewport = element("logic-diagram-scroll");
    const scale = wheelZoomFactor(event, viewport);
    setLogicZoom(zoom * scale, event);
  }
  function canPanDiagram(event) {
    if (event.ctrlKey || event.metaKey || diagramSelection.isSelecting()) {
      return false;
    }
    return canSelectDiagramArea();
  }
  function canSelectDiagramArea() {
    if (!currentGraph || element("logic-diagram-dialog").getAttribute("aria-busy") === "true") {
      return false;
    }
    return !diagramPan.isDragging();
  }
  function prepareDiagramPan() {
    element("logic-diagram-scroll").focus({ preventScroll: true });
  }
  function renderNetworkSelection() {
    const select = element("logic-network");
    const placeholder = select.options[0];
    placeholder.textContent = "\u7F51\u7EDC\u6838\u5BF9";
    select.value = "";
    if (selectedNetworks.size === 1) {
      for (const id of selectedNetworks) {
        select.value = id;
      }
    } else if (selectedNetworks.size > 1) {
      placeholder.textContent = "\u5DF2\u9009 " + selectedNetworks.size + " \u7EC4\u7F51\u7EDC";
    }
    refreshSelect(select);
    for (const shape of element("logic-diagram").querySelectorAll("[data-net]")) {
      const selected = selectedNetworks.has(shape.dataset.net);
      shape.classList.toggle("logic-active-net", selected);
      if (shape.getAttribute("role") === "button") {
        shape.setAttribute("aria-pressed", String(selected));
      }
    }
    const members = element("logic-network-members");
    members.replaceChildren();
    for (const network of currentDiagram.nets) {
      if (!selectedNetworks.has(network.id)) {
        continue;
      }
      members.append(node("strong", network.id + " \xB7 \u7535\u5E73 " + network.level, ""));
      for (const terminal of network.members) {
        members.append(node("span", terminal.label, ""));
      }
      for (const endpoint of network.pullUps) {
        members.append(node("span", "\u5F31\u4E0A\u62C9 \xB7 " + endpoint, ""));
      }
    }
  }
  function selectNetwork(id) {
    selectedNetworks.clear();
    if (id !== "") {
      selectedNetworks.add(id);
    }
    renderNetworkSelection();
  }
  function clickDiagram(event) {
    const target = event.target.closest("[data-net]");
    if (!target) {
      selectNetwork("");
      return;
    }
    const id = target.dataset.net;
    if (selectedNetworks.has(id)) {
      selectedNetworks.delete(id);
      renderNetworkSelection();
    } else if (event.ctrlKey || event.metaKey) {
      selectedNetworks.add(id);
      renderNetworkSelection();
    } else {
      selectNetwork(id);
    }
  }
  function selectDiagramArea(rectangle2, multiple) {
    const bounds = element("logic-diagram").getBoundingClientRect();
    const area = {
      left: (rectangle2.left - bounds.left) / zoom,
      top: (rectangle2.top - bounds.top) / zoom,
      right: (rectangle2.right - bounds.left) / zoom,
      bottom: (rectangle2.bottom - bounds.top) / zoom
    };
    if (!multiple) {
      selectedNetworks.clear();
    }
    for (const edge of currentGraph.edges) {
      for (const section of edge.sections || []) {
        const points = [section.startPoint];
        for (const point of section.bendPoints || []) {
          points.push(point);
        }
        points.push(section.endPoint);
        if (pathIntersectsRectangle(points, area)) {
          selectedNetworks.add(edge.netId);
        }
      }
    }
    const leads = element("logic-diagram").querySelectorAll("[data-net] .logic-pin-lead");
    for (const lead of leads) {
      const transform = lead.getScreenCTM();
      const first = new DOMPoint(lead.x1.baseVal.value, lead.y1.baseVal.value).matrixTransform(transform);
      const last = new DOMPoint(lead.x2.baseVal.value, lead.y2.baseVal.value).matrixTransform(transform);
      if (segmentIntersectsRectangle(first, last, rectangle2)) {
        selectedNetworks.add(lead.closest("[data-net]").dataset.net);
      }
    }
    renderNetworkSelection();
  }
  function keyDiagram(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      clickDiagram(event);
    }
  }
  function changeNetwork(event) {
    selectNetwork(event.currentTarget.value);
  }
  function createLogicImage(format) {
    if (!currentGraph) {
      throw new Error("\u903B\u8F91\u56FE\u5C1A\u672A\u751F\u6210");
    }
    const source = element("logic-diagram");
    const palette = createExportPalette();
    const copy = copyStyledSvg(source, palette);
    copy.setAttribute("xmlns", SVG_NAMESPACE);
    copy.setAttribute("width", String(currentGraph.width));
    copy.setAttribute("height", String(currentGraph.height));
    return encodeSvgImage(copy, format);
  }
  function bindLogicDiagram() {
    const viewport = element("logic-diagram-scroll");
    diagramPan = bindViewportPan(viewport, DIAGRAM_PAN_OPTIONS);
    diagramSelection = bindViewportSelection(viewport, DIAGRAM_SELECTION_OPTIONS);
    viewport.addEventListener("wheel", wheelLogicDiagram, { passive: false });
    element("logic-diagram-dialog").addEventListener("close", diagramPan.finish);
    element("logic-diagram-dialog").addEventListener("close", diagramSelection.cancel);
    element("close-logic-diagram").addEventListener("click", closeLogicDiagram);
    element("logic-show-power").addEventListener("change", generateDiagram);
    element("logic-fit").addEventListener("click", fitLogicDiagram);
    element("logic-zoom-in").addEventListener("click", zoomInLogicDiagram);
    element("logic-zoom-out").addEventListener("click", zoomOutLogicDiagram);
    bindFileExport("logic-export", "logic", createLogicImage);
    element("logic-network").addEventListener("change", changeNetwork);
    viewport.addEventListener("click", clickDiagram);
    element("logic-diagram").addEventListener("keydown", keyDiagram);
    refreshIcons();
  }

  // src/app.mjs
  var SETTINGS = {
    // 新打开页面时采用的走线角度，0 表示自由走线，45 表示斜角走线
    wireAngle: 45,
    // 撤销最多保留的编辑次数
    historyLimit: 80,
    // 板面的缩放上下限和按钮步长
    zoomMinimum: 0.15,
    zoomMaximum: 2,
    zoomStep: 0.15,
    // 连续点击容差与开始拖动的最小距离
    clickTolerance: 7,
    dragThreshold: 4,
    // 适应宽度时画布两侧预留的总空间
    fitPadding: 36,
    // 页脚时钟刷新时间
    clockInterval: 1e3
  };
  var PROJECT_JSON_INDENT = 2;
  var PLACEMENT_OFFSET = 30;
  var PULSE_SETTINGS = { feedbackDuration: 160, minimumHz: 1, maximumHz: 32 };
  var BOARD_PAN_OPTIONS = {
    buttons: [0],
    activeClass: "board-panning",
    canStart: canPanBoard,
    onStart: prepareBoardPan
  };
  var BOARD_SELECTION_OPTIONS = { canStart: canSelectBoardArea, onSelect: selectBoardArea };
  var INSPECTOR_TABS = ["inspect", "timing", "wires", "diagnostics", "notes"];
  var BOARD_TOOLS = ["place", "wire", "select", "delete"];
  var READ_ONLY_CONTROLS = ["tool-place", "tool-wire", "tool-delete", "input-count", "output-count", "notes-edit-button"];
  var CLOCK_FORMATTER = new Intl.DateTimeFormat("zh-CN", CLOCK_SETTINGS);
  var state = {
    project: emptyProject(),
    runtime: createRuntime(),
    result: null,
    timing: createTimingTrace(),
    tool: "wire",
    wireColor: WIRE_COLORS[1],
    wireAngle: SETTINGS.wireAngle,
    selected: null,
    selection: [],
    hiddenWires: /* @__PURE__ */ new Set(),
    fixedItems: [],
    placing: "",
    pending: null,
    pointer: null,
    hovered: "",
    showInternals: false,
    showLevels: false,
    zoom: 1,
    targetZoom: 1,
    undo: [],
    redo: [],
    activeTab: "inspect",
    notesEditing: false,
    previousIssues: /* @__PURE__ */ new Set(),
    saveFailed: false,
    pressedPulse: "",
    visual: { switches: [], leds: {}, internals: 0 }
  };
  var endpoints = allEndpoints();
  var canvas = null;
  var zoomAnchor = null;
  var lastPinnedChip = "";
  var boardTransitionFirst = null;
  var boardTransitionLast = null;
  var readOnly = false;
  var workspace = null;
  var activeExperiment = "";
  var circuitDiagnostics = { issues: [], chips: [], power: false, stable: false };
  var dirtyExperiments = /* @__PURE__ */ new Set();
  var importedExperiments = /* @__PURE__ */ new Set();
  var savedExperiments = null;
  var sharedClient = null;
  var sharedRevision = "";
  var sharedReady = false;
  var sharedNotice = "";
  var readingShared = false;
  var pendingWrites = 0;
  var writeQueue = Promise.resolve();
  var autoSave = false;
  var confirmationAction = null;
  var switchAction = null;
  var openHiddenWires = null;
  var drag = null;
  var boardPan = null;
  var boardSelection = null;
  var ignoreClick = false;
  var lastClickedWire = "";
  var cycle = { x: -100, y: -100, signature: "", index: 0 };
  var catalogModel = "";
  var heldPulse = "";
  var pulsePointerId = null;
  var pulsePointerTarget = null;
  var pulseTimer = 0;
  var continuousTimer = null;
  var continuousMode = false;
  var pulseFrequency = PULSE_SETTINGS.minimumHz;
  var recentAction = "";
  var diagnosticToastId = "";
  var saveToastId = "";
  var powerToastId = "";
  var hoverFrame = 0;
  var hoverPoint = null;
  var routingBusy = false;
  var expandedSelection = /* @__PURE__ */ new Set();
  function updateClock() {
    element("current-time").textContent = CLOCK_FORMATTER.format(/* @__PURE__ */ new Date());
  }
  function stageChanges() {
    keepExperiment(workspace, activeExperiment, state.project);
    dirtyExperiments.add(activeExperiment);
    if (autoSave) {
      saveLocal();
    } else {
      renderSaveStatus();
    }
  }
  function changeAutoSave(event) {
    autoSave = event.currentTarget.checked;
    if (autoSave) {
      saveLocal();
    }
  }
  function beforeLeave(event) {
    if (dirtyExperiments.size > 0 || pendingWrites > 0) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  function confirmAction(title, message, action, acceptLabel = "\u786E\u8BA4\u5220\u9664", destructive = true) {
    confirmationAction = action;
    element("confirm-title").textContent = title;
    element("confirm-message").textContent = message;
    const accept = element("confirm-accept");
    accept.textContent = acceptLabel;
    accept.classList.toggle("danger", destructive);
    accept.classList.toggle("primary", !destructive);
    element("confirm-dialog").showModal();
    element("confirm-cancel").focus();
  }
  function cancelConfirmation() {
    confirmationAction = null;
    element("confirm-dialog").close();
  }
  function acceptConfirmation() {
    const action = confirmationAction;
    confirmationAction = null;
    element("confirm-dialog").close();
    if (action) {
      action();
    }
  }
  async function removeExperiment(id) {
    if (!Object.hasOwn(workspace.projects, id)) {
      return false;
    }
    const nextSaved = copyProject(savedExperiments);
    delete nextSaved.projects[id];
    const savedIds = Object.keys(nextSaved.projects);
    if (savedIds.length === 0) {
      keepExperiment(nextSaved, newExperimentId(), emptyProject());
    } else if (nextSaved.activeId === id) {
      nextSaved.activeId = savedIds[0];
    }
    try {
      await persistWorkspace(nextSaved);
    } catch (error) {
      reportSaveFailure(error);
      return false;
    }
    savedExperiments = nextSaved;
    delete workspace.projects[id];
    dirtyExperiments.delete(id);
    importedExperiments.delete(id);
    if (activeExperiment !== id) {
      render();
      return true;
    }
    const ids = Object.keys(workspace.projects);
    if (ids.length === 0) {
      workspace.projects = copyProject(nextSaved.projects);
      openExperiment(nextSaved.activeId);
    } else {
      openExperiment(ids[0]);
    }
    return true;
  }
  function deleteCurrentExperiment() {
    queueWorkspaceWrite(removeExperiment.bind(null, activeExperiment));
  }
  function quickDelete() {
    if (editingLocked()) {
      return;
    }
    if (state.selection.length > 0 || state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip")) {
      deleteSelected();
      return;
    }
    confirmAction("\u5220\u9664\u5F53\u524D\u5B9E\u9A8C\uFF1F", "\u4F60\u5C06\u5220\u9664\u201C" + state.project.name + "\u201D\u3002\u5176\u4ED6\u5B9E\u9A8C\u4F1A\u4FDD\u7559", deleteCurrentExperiment);
  }
  function editingLocked() {
    if (readOnly) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u5904\u4E8E\u53EA\u8BFB\u6A21\u5F0F\u3002\u4F60\u53EF\u4EE5\u6D4B\u8BD5\u8F93\u5165\u8F93\u51FA\uFF1B\u7F16\u8F91\u63A5\u7EBF\u524D\uFF0C\u8BF7\u5173\u95ED\u6807\u9898\u680F\u7684\u53EA\u8BFB\u5F00\u5173", "info");
      return true;
    }
    return false;
  }
  function changeReadOnly(event) {
    readOnly = event.currentTarget.checked;
    state.pending = null;
    state.placing = "";
    state.notesEditing = false;
    state.tool = "select";
    lastPinnedChip = "";
    try {
      localStorage.setItem(READ_ONLY_KEY, String(readOnly));
    } catch (error) {
      toast("\u53EA\u8BFB\u72B6\u6001\u5DF2\u751F\u6548\uFF1B\u6D4F\u89C8\u5668\u6682\u65F6\u65E0\u6CD5\u8BB0\u4F4F\u8FD9\u4E2A\u8BBE\u7F6E", "warning");
    }
    renderLibrary();
    render();
  }
  function renderExperiments() {
    const picker = element("experiment-picker");
    picker.replaceChildren();
    for (const id of Object.keys(workspace.projects)) {
      let name = workspace.projects[id].name;
      if (id === activeExperiment) {
        name = state.project.name;
      }
      if (name.trim() === "") {
        name = "\u672A\u547D\u540D\u5B9E\u9A8C";
      }
      const option = node("option", name, "");
      option.value = id;
      picker.append(option);
    }
    picker.value = activeExperiment;
    refreshSelect(picker);
  }
  function switchExperiment(event) {
    const id = event.currentTarget.value;
    if (id === activeExperiment || !Object.hasOwn(workspace.projects, id)) {
      return;
    }
    renderExperiments();
    requestExperimentSwitch(openExperiment.bind(null, id));
  }
  function requestExperimentSwitch(action) {
    if (!dirtyExperiments.has(activeExperiment)) {
      action();
      return;
    }
    switchAction = action;
    let name = state.project.name.trim();
    if (name === "") {
      name = "\u672A\u547D\u540D\u5B9E\u9A8C";
    }
    const message = element("switch-message");
    if (Object.hasOwn(savedExperiments.projects, activeExperiment)) {
      message.textContent = "\u201C" + name + "\u201D\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8\u3002\u4E0D\u4FDD\u5B58\u5C31\u5207\u6362\uFF0C\u5207\u56DE\u6765\u65F6\u5C06\u6062\u590D\u5230\u4E0A\u6B21\u4FDD\u5B58\u7684\u5185\u5BB9\u3002";
    } else {
      message.textContent = "\u201C" + name + "\u201D\u8FD8\u672A\u4FDD\u5B58\u3002\u4E0D\u4FDD\u5B58\u5C31\u5207\u6362\uFF0C\u8FD9\u4EFD\u5B9E\u9A8C\u5C06\u4ECE\u5217\u8868\u4E2D\u79FB\u9664\u3002";
    }
    element("switch-dialog").showModal();
  }
  function cancelExperimentSwitch() {
    switchAction = null;
    element("switch-dialog").close();
  }
  function finishExperimentSwitch() {
    const action = switchAction;
    cancelExperimentSwitch();
    if (action) {
      action();
    }
  }
  function switchWithoutSaving() {
    const saved = savedExperiments.projects[activeExperiment];
    if (saved) {
      workspace.projects[activeExperiment] = copyProject(saved);
    } else {
      delete workspace.projects[activeExperiment];
      importedExperiments.delete(activeExperiment);
    }
    dirtyExperiments.delete(activeExperiment);
    finishExperimentSwitch();
  }
  async function saveAndSwitch() {
    const action = switchAction;
    const saved = await saveLocal();
    if (!action || switchAction !== action) {
      return;
    }
    if (saved && !dirtyExperiments.has(activeExperiment)) {
      finishExperimentSwitch();
      toast("\u4E0A\u4E00\u4EFD\u5B9E\u9A8C\u5DF2\u4FDD\u5B58", "info");
    } else {
      const message = element("switch-message");
      const failure = "\u4FDD\u5B58\u5931\u8D25\uFF0C\u53EF\u91CD\u8BD5\uFF0C\u6216\u53D6\u6D88\u5207\u6362\u540E\u5BFC\u51FA JSON \u5907\u4EFD\u3002";
      const warning = "\u4E0D\u4FDD\u5B58\u5E76\u5207\u6362\u4F1A\u4E22\u5F03\u672C\u6B21\u6539\u52A8\u3002";
      if (Object.hasOwn(savedExperiments.projects, activeExperiment)) {
        message.textContent = failure + warning;
      } else {
        message.textContent = failure + "\u4E0D\u4FDD\u5B58\u5E76\u5207\u6362\u4F1A\u4ECE\u5217\u8868\u4E2D\u79FB\u9664\u8FD9\u4EFD\u5B9E\u9A8C\u3002";
      }
    }
  }
  function openExperiment(id) {
    activeExperiment = id;
    workspace.activeId = id;
    state.project = copyProject(workspace.projects[id]);
    state.saveFailed = false;
    resetExperiment();
    if (state.project.power && isComplementPreset(state.project)) {
      initializeDefaultPreset();
      render();
    }
  }
  function resetExperiment() {
    state.hiddenWires.clear();
    continuousMode = false;
    pulseFrequency = PULSE_SETTINGS.minimumHz;
    state.runtime.triState = false;
    resetRuntime();
    state.result = null;
    state.timing = createTimingTrace();
    state.undo = [];
    state.redo = [];
    state.notesEditing = false;
    recentAction = "";
    diagnosticToastId = "";
    saveToastId = "";
    powerToastId = "";
    clearToasts();
    calculate(false);
    renderLibrary();
    render();
  }
  function diagnoseCurrentCircuit() {
    circuitDiagnostics = inspectCircuit(state.project, state.result);
    state.activeTab = "diagnostics";
    dismissToast(diagnosticToastId);
    if (circuitDiagnostics.issues.length > 0) {
      diagnosticToastId = showToast("\u53D1\u73B0 " + circuitDiagnostics.issues.length + " \u9879\u8BCA\u65AD\uFF0C\u8BF7\u67E5\u770B\u8BE6\u60C5", "warning");
    } else if (!state.project.power) {
      diagnosticToastId = showToast("\u7535\u6E90\u5DF2\u5173\u95ED\uFF0C\u53EF\u67E5\u770B\u82AF\u7247\u4F9B\u7535\u4E0E\u63A5\u7EBF\u72B6\u6001", "info");
    } else {
      diagnosticToastId = showToast("\u5F53\u524D\u672A\u53D1\u73B0\u4F9B\u7535\u3001\u51B2\u7A81\u3001\u77ED\u8DEF\u6216\u903B\u8F91\u72B6\u6001\u5F02\u5E38", "info");
    }
    render();
  }
  function requestWireRouting() {
    if (editingLocked()) {
      return;
    }
    if (routingBusy) {
      return;
    }
    if (state.project.wires.length === 0) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u8FD8\u6CA1\u6709\u5BFC\u7EBF", "info");
      return;
    }
    confirmAction("\u6574\u7406\u8D70\u7EBF\uFF1F", "\u5C06\u6309\u5F53\u524D\u8D70\u7EBF\u6A21\u5F0F\u91CD\u65B0\u8BA1\u7B97\u8DEF\u5F84\uFF0C\u5E76\u66FF\u6362\u624B\u52A8\u8F6C\u6298\u70B9\u3002\u5BFC\u7EBF\u7AEF\u70B9\u3001\u989C\u8272\u548C\u5907\u6CE8\u4E0D\u4F1A\u6539\u53D8\u3002\u6B64\u64CD\u4F5C\u53EF\u4EE5\u64A4\u9500", applyWireRouting, "\u786E\u8BA4\u6574\u7406", false);
  }
  async function applyWireRouting() {
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    const angle = state.wireAngle;
    routingBusy = true;
    const waiting = showToast("\u6B63\u5728\u6574\u7406\u8D70\u7EBF\uFF0C\u8BF7\u7A0D\u5019", "info", true);
    render();
    try {
      const routes = await routeWires(candidate, angle);
      for (const wire of candidate.wires) {
        wire.bends = routes[wire.id];
      }
      for (const wire of candidate.wires) {
        delete wire.angle;
        if (angle === 45) {
          wire.angle = 45;
        }
      }
      if (activeExperiment !== experiment || JSON.stringify(state.project) !== signature || readOnly) {
        toast("\u5B9E\u9A8C\u5DF2\u5207\u6362\u6216\u4FEE\u6539\uFF0C\u672C\u6B21\u6574\u7406\u7ED3\u679C\u672A\u5E94\u7528", "info");
        return;
      }
      validateProject(candidate);
      remember();
      state.project = candidate;
      state.pending = null;
      state.placing = "";
      state.tool = "select";
      commit();
      toast("\u8D70\u7EBF\u5DF2\u6574\u7406\uFF0C\u7535\u6C14\u8FDE\u63A5\u4FDD\u6301\u4E0D\u53D8", "info");
    } catch (error) {
      toast("\u539F\u63A5\u7EBF\u5DF2\u4FDD\u7559\uFF0C" + error.message, "warning");
    } finally {
      dismissToast(waiting);
      routingBusy = false;
      render();
    }
  }
  function toast(message, kind) {
    showToast(message, kind);
    recentAction = message;
    updateActionStatus();
  }
  function historyEntry(project) {
    return { project, hiddenWires: new Set(state.hiddenWires) };
  }
  function rememberChange(project) {
    state.undo.push(historyEntry(project));
    if (state.undo.length > SETTINGS.historyLimit) {
      state.undo.shift();
    }
    state.redo = [];
  }
  function remember() {
    rememberChange(copyProject(state.project));
  }
  function queueWorkspaceWrite(action) {
    pendingWrites = pendingWrites + 1;
    async function runWrite() {
      try {
        return await action();
      } finally {
        pendingWrites = pendingWrites - 1;
      }
    }
    writeQueue = writeQueue.then(runWrite, runWrite);
    return writeQueue;
  }
  async function persistWorkspace(nextSaved) {
    if (!sharedClient) {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(nextSaved));
      return;
    }
    if (!sharedReady) {
      throw new Error("\u5C1A\u672A\u8FDE\u63A5\u5171\u4EAB\u5B58\u6863\uFF0C\u8BF7\u4ECE\u684C\u9762\u7248\u6253\u5F00\u5171\u4EAB\u7F51\u9875\u7248");
    }
    const result = await sharedClient.write({ revision: sharedRevision, workspace: nextSaved });
    if (result.conflict) {
      throw new Error("\u53E6\u4E00\u4E2A\u7A97\u53E3\u5DF2\u4FDD\u5B58\u66F4\u65B0\u3002\u8BF7\u5148\u5BFC\u51FA\u5F53\u524D\u7535\u8DEF\uFF0C\u518D\u91CD\u65B0\u6253\u5F00\u5171\u4EAB\u5DE5\u4F5C\u533A");
    }
    sharedRevision = result.revision;
  }
  function reportSaveFailure(error) {
    if (!state.saveFailed) {
      dismissToast(saveToastId);
      saveToastId = showToast("\u4FDD\u5B58\u5931\u8D25\u3002" + error.message, "warning");
    }
    state.saveFailed = true;
    renderSaveStatus();
  }
  async function saveSelectedExperiments(id, projects) {
    try {
      const nextSaved = copyProject(savedExperiments);
      for (const key of Object.keys(projects)) {
        nextSaved.projects[key] = validateProject(projects[key]);
      }
      nextSaved.activeId = id;
      await persistWorkspace(nextSaved);
      savedExperiments = nextSaved;
      for (const key of Object.keys(projects)) {
        if (JSON.stringify(workspace.projects[key]) === JSON.stringify(projects[key])) {
          importedExperiments.delete(key);
          dirtyExperiments.delete(key);
        }
      }
      dismissToast(saveToastId);
      saveToastId = "";
      state.saveFailed = false;
      renderSaveStatus();
      return true;
    } catch (error) {
      reportSaveFailure(error);
      return false;
    }
  }
  function saveLocal() {
    keepExperiment(workspace, activeExperiment, state.project);
    const projects = {};
    for (const id of importedExperiments) {
      projects[id] = copyProject(workspace.projects[id]);
    }
    projects[activeExperiment] = copyProject(state.project);
    return queueWorkspaceWrite(saveSelectedExperiments.bind(null, activeExperiment, projects));
  }
  async function saveCurrentExperiment() {
    if (await saveLocal()) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u5DF2\u4FDD\u5B58", "info");
    }
  }
  function renderSaveStatus() {
    const status = element("save-status");
    element("shared-status").textContent = sharedNotice;
    if (state.saveFailed) {
      status.textContent = "\u672C\u5730\u4FDD\u5B58\u5931\u8D25";
    } else if (dirtyExperiments.has(activeExperiment)) {
      status.textContent = "\u5F53\u524D\u5B9E\u9A8C\u672A\u4FDD\u5B58";
    } else if (importedExperiments.size > 0) {
      status.textContent = "\u5BFC\u5165\u7684\u5907\u4EFD\u672A\u4FDD\u5B58";
    } else {
      status.textContent = "\u65E0\u672A\u4FDD\u5B58\u66F4\u6539";
    }
  }
  function calculate(notify, action = "\u4EFF\u771F\u66F4\u65B0") {
    const previousResult = state.result;
    state.result = simulate(state.project, state.runtime);
    if (previousResult && previousResult.signature !== state.result.signature) {
      resetTimingCircuit(state.timing, state.project, "\u63A5\u7EBF\u6216\u5668\u4EF6\u5DF2\u66F4\u6539\uFF0C\u539F\u8BB0\u5F55\u5DF2\u6E05\u9664");
    } else {
      captureTimingTrace(state.timing, state.result, action);
    }
    updateDiagnostics(notify);
    animateBoard();
  }
  function updateDiagnostics(notify) {
    const previousPower = circuitDiagnostics.power;
    circuitDiagnostics = inspectCircuit(state.project, state.result);
    const current = /* @__PURE__ */ new Set();
    const newIssues = [];
    for (const issue of circuitDiagnostics.issues) {
      const identity = issue.code + ":" + issue.message;
      current.add(identity);
      if (!state.previousIssues.has(identity)) {
        newIssues.push(issue);
      }
    }
    const previous = state.previousIssues;
    const issuesChanged = previousPower !== circuitDiagnostics.power || current.size !== previous.size || newIssues.length > 0;
    if (issuesChanged) {
      dismissToast(diagnosticToastId);
      diagnosticToastId = "";
    }
    if (notify && newIssues.length > 0) {
      let message = newIssues[0].message;
      if (newIssues.length > 1) {
        message = message + " \u53E6\u6709 " + (newIssues.length - 1) + " \u9879\u95EE\u9898\uFF0C\u8BE6\u89C1\u8BCA\u65AD";
      }
      let kind = "error";
      if (newIssues[0].severity === "warning") {
        kind = "warning";
      }
      diagnosticToastId = showToast(message, kind);
    }
    state.previousIssues = current;
  }
  function targetVisuals() {
    const switches = [];
    const leds = {};
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      switches.push(state.project.switches[index]);
      for (const prefix of ["K", "L"]) {
        const name = prefix + index;
        leds[name] = 0;
        if (readEndpoint(state.result, name) === 1) {
          leds[name] = 1;
        }
      }
    }
    let internals = 0;
    if (state.showInternals) {
      internals = 1;
    }
    return { switches, leds, internals };
  }
  function updateBoardTransition(progress) {
    const visual = { switches: [], leds: {}, internals: 0 };
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      const first = boardTransitionFirst.switches[index];
      const last = boardTransitionLast.switches[index];
      visual.switches.push(first + (last - first) * progress);
      for (const prefix of ["K", "L"]) {
        const name = prefix + index;
        const initial = boardTransitionFirst.leds[name];
        const target = boardTransitionLast.leds[name];
        visual.leds[name] = initial + (target - initial) * progress;
      }
    }
    visual.internals = boardTransitionFirst.internals + (boardTransitionLast.internals - boardTransitionFirst.internals) * progress;
    state.visual = visual;
    renderBoard(canvas, state, endpoints);
  }
  function animateBoard() {
    const target = targetVisuals();
    if (state.visual.switches.length === 0) {
      state.visual = target;
      boardTransitionLast = target;
      return;
    }
    if (boardTransitionLast && sameBoardVisual(boardTransitionLast, target)) {
      return;
    }
    boardTransitionFirst = state.visual;
    boardTransitionLast = target;
    tween("board", 0, 1, updateBoardTransition, MOTION.duration);
  }
  function sameBoardVisual(first, second) {
    if (first.internals !== second.internals) {
      return false;
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
      if (first.switches[index] !== second.switches[index]) {
        return false;
      }
    }
    for (const name of Object.keys(first.leds)) {
      if (first.leds[name] !== second.leds[name]) {
        return false;
      }
    }
    return true;
  }
  function commit(action) {
    calculate(true, action);
    stageChanges();
    render();
  }
  function nextId(items, prefix) {
    let maximum = 0;
    for (const item of items) {
      const number = Number(item.id.slice(1));
      maximum = Math.max(maximum, number);
    }
    return prefix + (maximum + 1);
  }
  function occupied(name) {
    for (const chip of state.project.chips) {
      const model = CHIP_MODELS[chip.model];
      for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (pinHole(chip, pin) === name) {
          return true;
        }
      }
    }
    for (const wire of state.project.wires) {
      if (wire.from === name || wire.to === name) {
        return true;
      }
    }
    return false;
  }
  function canConnectWire(first, second) {
    if (editingLocked()) {
      return false;
    }
    if (routingBusy) {
      toast("\u6B63\u5728\u8BA1\u7B97\u8D70\u7EBF\uFF0C\u8BF7\u7A0D\u5019", "info");
      return false;
    }
    if (!isPhysicalHole(first) || !isPhysicalHole(second)) {
      toast("\u5BFC\u7EBF\u53EA\u80FD\u63D2\u5728\u9762\u5305\u677F\u6216\u7535\u6E90\u8F68\u7684\u5B54\u4E2D\uFF0CK\u3001L\u3001P \u662F\u677F\u8F7D\u4FE1\u53F7\u540D\u79F0", "error");
      return false;
    }
    if (first === second) {
      toast("\u5BFC\u7EBF\u4E24\u7AEF\u4E0D\u80FD\u662F\u540C\u4E00\u4E2A\u5B54", "warning");
      return false;
    }
    if (occupied(first) || occupied(second)) {
      toast("\u8FD9\u4E2A\u5B54\u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u8FDE\u63A5\u540C\u5217\u4E94\u5B54\u7EC4\u4E2D\u7684\u5176\u4ED6\u7A7A\u5B54", "warning");
      return false;
    }
    if (state.project.wires.length >= LIMITS.wires) {
      toast("\u5BFC\u7EBF\u6570\u91CF\u5DF2\u8FBE\u5230\u6B64\u7248\u672C\u7684\u4E0A\u9650", "error");
      return false;
    }
    return true;
  }
  async function connectWire(first, second, bends) {
    if (!canConnectWire(first, second)) {
      return false;
    }
    const wire = { id: nextId(state.project.wires, "W"), from: first, to: second, color: state.wireColor, bends };
    const angle = state.wireAngle;
    if (angle === 45) {
      wire.angle = 45;
    }
    const experiment = activeExperiment;
    const signature = JSON.stringify(state.project);
    const candidate = copyProject(state.project);
    routingBusy = true;
    const waiting = showToast("\u6B63\u5728\u8BA1\u7B97\u65B0\u5BFC\u7EBF\uFF0C\u8BF7\u7A0D\u5019", "info", true);
    render();
    try {
      wire.bends = await routeNewWire(candidate, wire, angle);
      if (activeExperiment !== experiment || JSON.stringify(state.project) !== signature || readOnly) {
        toast("\u5B9E\u9A8C\u5DF2\u5207\u6362\u6216\u4FEE\u6539\uFF0C\u672C\u6B21\u63A5\u7EBF\u672A\u5E94\u7528", "info");
        return false;
      }
      const completed = copyProject(candidate);
      completed.wires.push(wire);
      validateProject(completed);
      remember();
      state.project = completed;
      state.pending = null;
      commit();
      return true;
    } catch (error) {
      toast("\u63A5\u7EBF\u672A\u5B8C\u6210\uFF0C" + error.message, "warning");
      return false;
    } finally {
      dismissToast(waiting);
      routingBusy = false;
      render();
    }
  }
  function changeWireAngle(event) {
    state.wireAngle = 0;
    if (event.currentTarget.value === "45") {
      state.wireAngle = 45;
    }
    renderBoard(canvas, state, endpoints);
  }
  function renderLibrary() {
    const container = element("chip-library");
    container.replaceChildren();
    const searchText = element("chip-search").value.trim();
    const query = searchText.toUpperCase();
    let count = 0;
    for (const model of sortedChipNames()) {
      if (!model.includes(query)) {
        continue;
      }
      const specification = CHIP_MODELS[model];
      const button = node("button", "", "chip-option");
      if (catalogModel === model) {
        button.classList.add("active");
      }
      button.dataset.model = model;
      button.setAttribute("aria-label", "\u67E5\u770B " + model + " " + specification.title);
      button.setAttribute("aria-pressed", String(catalogModel === model));
      const description = node("span", "", "");
      const subtitle = node("small", "", "");
      subtitle.append(document.createTextNode(specification.title + " \xB7 "), node("span", "DIP-" + specification.count, "chip-package"));
      description.append(node("strong", model, ""), subtitle);
      button.append(icon("microchip"), description);
      button.addEventListener("click", chooseChip);
      container.append(button);
      count = count + 1;
    }
    element("model-count").textContent = String(count);
    if (count === 0) {
      container.append(node("p", "\u6CA1\u6709\u5339\u914D\u7684\u82AF\u7247", "empty-inspector"));
    }
    refreshIcons();
  }
  function chooseChip(event) {
    const model = event.currentTarget.dataset.model;
    if (catalogModel === model) {
      catalogModel = "";
      state.placing = "";
      if (state.tool === "place") {
        state.tool = "select";
      }
      renderLibrary();
      render();
      return;
    }
    catalogModel = model;
    state.placing = "";
    if (!readOnly) {
      state.placing = model;
    }
    ignoreClick = false;
    drag = null;
    state.selected = null;
    state.selection = [];
    state.pending = null;
    state.tool = "place";
    if (readOnly) {
      state.tool = "select";
    }
    state.activeTab = "inspect";
    renderLibrary();
    render();
  }
  function placeCatalogChip(event) {
    if (editingLocked()) {
      return;
    }
    let modelName = catalogModel;
    if (event && event.currentTarget.dataset.model) {
      modelName = event.currentTarget.dataset.model;
    }
    if (modelName === "") {
      return;
    }
    state.placing = modelName;
    state.tool = "place";
    ignoreClick = false;
    state.pending = null;
    render();
  }
  function placeChip(point) {
    if (editingLocked()) {
      return;
    }
    const section = Math.floor((point.y - BOARD.startY + PLACEMENT_OFFSET) / BOARD.sectionHeight);
    const column = Math.round((point.x - BOARD.startX) / BOARD.pitch) + 1;
    const chip = { id: nextId(state.project.chips, "U"), model: state.placing, section, column };
    let error = placementError(state.project.chips, chip, "");
    if (state.project.chips.length >= LIMITS.chips) {
      error = "\u82AF\u7247\u6570\u91CF\u5DF2\u8FBE\u5230\u6B64\u7248\u672C\u7684\u4E0A\u9650";
    }
    if (error === "") {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        if (occupied(pinHole(chip, pin))) {
          error = "\u82AF\u7247\u5F15\u811A\u4F4D\u7F6E\u5DF2\u6709\u5BFC\u7EBF\uFF0C\u8BF7\u6362\u4E00\u7EC4\u7A7A\u5217";
        }
      }
    }
    if (error !== "") {
      toast(error, "error");
      return;
    }
    remember();
    state.project.chips.push(chip);
    catalogModel = "";
    selectTarget({ kind: "chip", id: chip.id }, false);
    state.placing = "";
    state.tool = "select";
    renderLibrary();
    commit();
  }
  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width * BOARD.width, y: (event.clientY - bounds.top) / bounds.height * BOARD.height };
  }
  function clickBoard(event) {
    const previousWire = lastClickedWire;
    lastClickedWire = "";
    if (ignoreClick) {
      ignoreClick = false;
      return;
    }
    const point = canvasPoint(event);
    if (isInputResetButton(point)) {
      resetInputs();
      return;
    }
    if (state.placing !== "") {
      placeChip(point);
      return;
    }
    if (state.tool === "select" && event.detail > 1 && previousWire !== "") {
      toggleClickedWire(event, point, previousWire);
      return;
    }
    const target = cycleTarget(point);
    if (target && target.kind === "switch") {
      toggleSwitch(target.id);
      return;
    }
    if (target && target.kind === "pulse") {
      pulse(target.id);
      return;
    }
    if (state.tool === "select") {
      const wire = nearestWire(point, state.project.wires, state.hiddenWires, state.selected);
      const cycleToOtherObject = target && target.kind !== "wire" && cycle.index > 0;
      if (wire && !cycleToOtherObject) {
        selectClickedWire(event, wire);
        return;
      }
    }
    if (readOnly) {
      selectTarget(target, event.ctrlKey || event.metaKey);
      render();
      return;
    }
    if (state.tool === "delete") {
      if (target && (target.kind === "wire" || target.kind === "chip")) {
        confirmAction("\u5220\u9664\u5BF9\u8C61\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F", removeTargets.bind(null, [target]));
      }
      return;
    }
    if (target && target.kind === "node" && state.tool === "wire") {
      if (occupied(target.id)) {
        state.selected = target;
        toast("\u6B64\u5B54\u5DF2\u5360\u7528\uFF0C\u63A5\u7EBF\u8BF7\u9009\u540C\u5217\u7684\u5176\u4ED6\u7A7A\u5B54", "warning");
      } else if (!state.pending) {
        state.pending = { from: target.id, bends: [] };
        state.selected = target;
      } else {
        connectWire(state.pending.from, target.id, state.pending.bends);
      }
    } else if (state.pending && (!target || target.kind === "wire")) {
      if (state.pending.bends.length >= LIMITS.bends) {
        toast("\u8FD9\u6839\u7EBF\u7684\u8F6C\u6298\u70B9\u8FC7\u591A\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u63A5\u7EBF", "warning");
      } else {
        state.pending.bends.push({ x: Math.round(point.x), y: Math.round(point.y) });
      }
    } else {
      selectTarget(target, event.ctrlKey || event.metaKey);
    }
    render();
  }
  function toggleClickedWire(event, point, previousWire) {
    if (event.detail !== 2 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }
    const wire = nearestWire(point, state.project.wires, state.hiddenWires, state.selected);
    if (!wire || wire.id !== previousWire) {
      return;
    }
    if (state.hiddenWires.has(wire.id)) {
      restoreHiddenWire(wire.id);
    } else {
      hideWires([{ kind: "wire", id: wire.id }]);
    }
  }
  function selectClickedWire(event, wire) {
    const multiple = event.ctrlKey || event.metaKey;
    if (event.detail === 1 && !multiple && !event.shiftKey && !event.altKey) {
      lastClickedWire = wire.id;
    }
    const target = { kind: "wire", id: wire.id };
    if (multiple || selectedTargetIndex(target) < 0 || state.selection.length > 1) {
      if (!multiple) {
        state.selection = [];
        state.selected = null;
      }
      selectTarget(target, multiple);
    }
    state.activeTab = "inspect";
    render();
  }
  function cycleTarget(point) {
    const candidates = hitCandidates(point, state, endpoints);
    let signature = "";
    for (const target of candidates) {
      signature = signature + target.kind + ":" + target.id + ";";
    }
    if (Math.hypot(point.x - cycle.x, point.y - cycle.y) < SETTINGS.clickTolerance && signature === cycle.signature && candidates.length > 1) {
      cycle.index = (cycle.index + 1) % candidates.length;
    } else {
      cycle.index = 0;
    }
    cycle.x = point.x;
    cycle.y = point.y;
    cycle.signature = signature;
    if (candidates.length === 0) {
      return null;
    }
    return candidates[cycle.index];
  }
  function selectedTargetIndex(target) {
    for (let index = 0; index < state.selection.length; index = index + 1) {
      const selected = state.selection[index];
      if (selected.kind === target.kind && selected.id === target.id) {
        return index;
      }
    }
    return -1;
  }
  function removeSelectedTarget(target) {
    const index = selectedTargetIndex(target);
    if (index >= 0) {
      state.selection.splice(index, 1);
    }
    state.selected = null;
    if (state.selection.length > 0) {
      state.selected = state.selection[state.selection.length - 1];
    }
  }
  function selectTarget(target, multiple) {
    catalogModel = "";
    const same = target && state.selected && target.kind === state.selected.kind && target.id === state.selected.id;
    if (target && (target.kind === "chip" || target.kind === "wire") && selectedTargetIndex(target) >= 0) {
      removeSelectedTarget(target);
      return;
    }
    if (same && !multiple) {
      state.selected = null;
      state.selection = [];
      return;
    }
    if (multiple && state.selection.length === 0 && state.selected && (state.selected.kind === "wire" || state.selected.kind === "chip")) {
      state.selection.push({ kind: state.selected.kind, id: state.selected.id });
    }
    state.selected = target;
    if (!multiple) {
      state.selection = [];
    }
    if (!target) {
      return;
    }
    if (target.kind === "chip" || target.kind === "wire") {
      state.selection.push({ kind: target.kind, id: target.id });
    }
    if (target.kind === "chip") {
      state.activeTab = "inspect";
      lastPinnedChip = "";
    }
  }
  function pointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    if (state.placing !== "" || state.tool === "place") {
      return;
    }
    const point = canvasPoint(event);
    if (isInputResetButton(point)) {
      return;
    }
    const target = hitTest(point, state, endpoints);
    if (target && target.kind === "pulse") {
      startPointerPulse(event, target.id);
      return;
    }
    if (state.tool !== "select" || readOnly || event.ctrlKey || event.metaKey) {
      return;
    }
    if (state.selected && state.hiddenWires.has(state.selected.id)) {
      return;
    }
    const handle = wireHandleAt(point, state.project, state.selected);
    if (handle) {
      if (handle.handle > 0 && handle.handle < handle.points.length - 1 && handle.points.length - 2 > LIMITS.bends) {
        toast("\u8FD9\u6839\u7EBF\u7684\u8F6C\u6298\u70B9\u8F83\u591A\uFF0C\u8BF7\u5148\u6574\u7406\u8D70\u7EBF\u518D\u8C03\u6574\u8282\u70B9", "info");
        return;
      }
      drag = { wire: handle.wire, handle: handle.handle, points: handle.points, origin: point, moved: false, original: copyProject(state.project) };
      canvas.setPointerCapture(event.pointerId);
    }
  }
  function canPanBoard(event) {
    if (drag || heldPulse !== "" || boardSelection.isSelecting()) {
      return false;
    }
    return !event.ctrlKey && !event.metaKey;
  }
  function prepareBoardPan() {
    canvas.title = "";
    leaveBoard();
  }
  function canSelectBoardArea() {
    return !drag && heldPulse === "" && !boardPan.isDragging();
  }
  function selectBoardArea(rectangle2, multiple) {
    const first = canvasPoint({ clientX: rectangle2.left, clientY: rectangle2.top });
    const last = canvasPoint({ clientX: rectangle2.right, clientY: rectangle2.bottom });
    const area = { left: first.x, top: first.y, right: last.x, bottom: last.y };
    const targets = [];
    for (const chip of state.project.chips) {
      const bounds = chipBounds(chip);
      const chipArea = { left: bounds.x, top: bounds.y, right: bounds.x + bounds.width, bottom: bounds.y + bounds.height };
      if (rectanglesIntersect(area, chipArea)) {
        targets.push({ kind: "chip", id: chip.id });
      }
    }
    const paths = wireDisplayPaths(state.project.wires);
    for (let index = 0; index < paths.length; index = index + 1) {
      const wire = state.project.wires[index];
      if (state.hiddenWires.has(wire.id)) {
        continue;
      }
      if (pathIntersectsRectangle(paths[index], area)) {
        targets.push({ kind: "wire", id: wire.id });
      }
    }
    if (!multiple) {
      state.selection = [];
      state.selected = null;
    }
    for (const target of targets) {
      if (selectedTargetIndex(target) < 0) {
        state.selection.push(target);
      }
    }
    if (state.selection.length > 0) {
      state.selected = state.selection[state.selection.length - 1];
    }
    catalogModel = "";
    state.activeTab = "inspect";
    lastPinnedChip = "";
    render();
  }
  function dragPointer(event) {
    if (!drag) {
      return;
    }
    const point = canvasPoint(event);
    if (!drag.moved && Math.hypot(point.x - drag.origin.x, point.y - drag.origin.y) <= SETTINGS.dragThreshold) {
      return;
    }
    drag.moved = true;
    const wire = findWire(drag.wire);
    if (drag.handle > 0 && drag.handle < drag.points.length - 1) {
      const location2 = { x: Math.round(point.x), y: Math.round(point.y) };
      if (!validWireBend(location2) || point.y > BOARD.height) {
        return;
      }
      const bends = [];
      for (let index = 1; index < drag.points.length - 1; index = index + 1) {
        let bend = drag.points[index];
        if (index === drag.handle) {
          bend = location2;
        }
        bends.push(bend);
      }
      wire.bends = bends;
      if (state.wireAngle === 45) {
        wire.angle = 45;
      }
    }
    renderBoard(canvas, state, endpoints);
  }
  function pointerUp(event) {
    if (releasePointerPulse(event)) {
      ignoreClick = true;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
    if (!drag) {
      return;
    }
    const current = drag;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (!current.moved) {
      return;
    }
    ignoreClick = true;
    const wire = findWire(current.wire);
    const end = current.handle === 0 || current.handle === current.points.length - 1;
    const point = canvasPoint(event);
    if (end) {
      const name = nearestEndpoint(point, endpoints);
      let previous = wire.from;
      if (current.handle !== 0) {
        previous = wire.to;
      }
      if (name === "" || occupied(name) && name !== previous) {
        state.project = current.original;
        toast("\u8BF7\u628A\u7AEF\u70B9\u62D6\u5230\u4E00\u4E2A\u7A7A\u63D2\u5B54\uFF0C\u539F\u63A5\u7EBF\u5DF2\u4FDD\u7559", "warning");
        render();
        return;
      }
      if (current.handle === 0) {
        wire.from = name;
      } else {
        wire.to = name;
      }
      if (state.wireAngle === 45) {
        wire.angle = 45;
      }
    } else if (!validWireBend(point) || point.y > BOARD.height) {
      state.project = current.original;
      toast("\u8BF7\u5728\u753B\u5E03\u5185\u653E\u7F6E\u8F6C\u6298\u70B9\uFF0C\u539F\u63A5\u7EBF\u5DF2\u4FDD\u7559", "warning");
      render();
      return;
    }
    rememberChange(current.original);
    commit();
  }
  function cancelPointer(event) {
    releasePointerPulse(event);
    if (drag && drag.moved) {
      state.project = drag.original;
    }
    drag = null;
    renderBoard(canvas, state, endpoints);
  }
  function movePointer(event) {
    if (boardPan.isDragging() || boardSelection.isSelecting()) {
      return;
    }
    if (drag) {
      dragPointer(event);
      return;
    }
    hoverPoint = { clientX: event.clientX, clientY: event.clientY };
    if (hoverFrame === 0) {
      hoverFrame = window.requestAnimationFrame(updateBoardHover);
    }
  }
  function updateBoardHover() {
    hoverFrame = 0;
    const point = canvasPoint(hoverPoint);
    state.pointer = point;
    const target = hitTest(point, state, endpoints);
    let hovered = "";
    let status = "\u9762\u5305\u677F";
    let title = "";
    let wire = null;
    if (state.tool === "select" && !isInputResetButton(point)) {
      wire = nearestWire(point, state.project.wires, state.hiddenWires, state.selected);
    }
    if (wire && state.hiddenWires.has(wire.id)) {
      status = wire.id + " \xB7 \u53CC\u51FB\u663E\u793A";
      title = status;
    } else if (wire) {
      status = wire.id + " \xB7 \u53CC\u51FB\u9690\u85CF";
      title = status;
    } else if (isInputResetButton(point)) {
      status = "\u590D\u4F4D\u8F93\u5165";
      title = status;
    } else if (target && target.kind === "node") {
      hovered = target.id;
      const value = readEndpoint(state.result, target.id);
      status = endpointLabel(target.id) + " \xB7 " + value;
      title = status;
    } else if (target && target.kind === "chip") {
      status = target.id;
      title = target.id;
    }
    setPointerStatus(status, title);
    if (state.hovered !== hovered || state.pending) {
      state.hovered = hovered;
      renderBoard(canvas, state, endpoints);
    }
  }
  function setPointerStatus(status, title) {
    const label2 = element("pointer-status");
    if (label2.textContent !== status) {
      label2.textContent = status;
    }
    if (canvas.title !== title) {
      canvas.title = title;
    }
  }
  function clearBoardHover() {
    if (hoverFrame !== 0) {
      window.cancelAnimationFrame(hoverFrame);
      hoverFrame = 0;
    }
    hoverPoint = null;
    state.hovered = "";
    state.pointer = null;
    setPointerStatus("\u9762\u5305\u677F", "");
  }
  function leaveBoard() {
    const repaint = state.hovered !== "" || Boolean(state.pending && state.pointer);
    clearBoardHover();
    if (repaint) {
      renderBoard(canvas, state, endpoints);
    }
  }
  function cancelWire() {
    state.pending = null;
    state.placing = "";
    catalogModel = "";
    if (state.tool === "place") {
      state.tool = "select";
    }
    renderLibrary();
    render();
  }
  function chooseTool(event) {
    if (event.currentTarget.id === "tool-place") {
      if (catalogModel === "") {
        toast("\u8BF7\u5148\u4ECE\u5DE6\u4FA7\u5668\u4EF6\u5E93\u9009\u62E9\u82AF\u7247", "info");
        return;
      }
      placeCatalogChip();
      return;
    }
    state.tool = event.currentTarget.id.slice(5);
    state.pending = null;
    state.placing = "";
    renderLibrary();
    render();
  }
  function createPalette() {
    const container = element("wire-palette");
    for (const color of WIRE_COLORS) {
      const button = node("button", "", "swatch");
      button.style.backgroundColor = color;
      button.dataset.color = color;
      button.title = "\u5BFC\u7EBF\u989C\u8272 " + color;
      button.setAttribute("aria-label", "\u5BFC\u7EBF\u989C\u8272 " + color);
      button.addEventListener("click", chooseColor);
      container.append(button);
    }
  }
  function chooseColor(event) {
    setWireColor(event.currentTarget.dataset.color);
  }
  function chooseCustomColor(event) {
    setWireColor(event.currentTarget.value);
  }
  function setWireColor(color) {
    const wires = [];
    if (state.selection.length > 0) {
      for (const target of state.selection) {
        if (target.kind === "wire") {
          const wire = findWire(target.id);
          if (wire && wire.color !== color) {
            wires.push(wire);
          }
        }
      }
    } else if (state.selected && state.selected.kind === "wire") {
      const wire = findWire(state.selected.id);
      if (wire && wire.color !== color) {
        wires.push(wire);
      }
    }
    if (wires.length > 0) {
      if (editingLocked()) {
        return;
      }
      remember();
      for (const wire of wires) {
        wire.color = color;
      }
      stageChanges();
    }
    state.wireColor = color;
    render();
  }
  function findWire(id) {
    for (const wire of state.project.wires) {
      if (wire.id === id) {
        return wire;
      }
    }
    return null;
  }
  function findChip(id) {
    for (const chip of state.project.chips) {
      if (chip.id === id) {
        return chip;
      }
    }
    return null;
  }
  function hideSelectedWires() {
    hideWires(state.selection);
  }
  function hideWires(targets) {
    if (drag || !hasVisibleWires(targets)) {
      return;
    }
    rememberChange(null);
    for (const target of targets) {
      if (target.kind === "wire") {
        state.hiddenWires.add(target.id);
      }
    }
    const remaining = [];
    for (const target of state.selection) {
      if (target.kind !== "wire" || !state.hiddenWires.has(target.id)) {
        remaining.push(target);
      }
    }
    state.selection = remaining;
    state.selected = null;
    if (remaining.length > 0) {
      state.selected = remaining[remaining.length - 1];
    }
    clearBoardHover();
    element("hidden-objects").focus({ preventScroll: true });
    render();
  }
  function hasVisibleWires(targets) {
    for (const target of targets) {
      if (target.kind === "wire" && !state.hiddenWires.has(target.id)) {
        return true;
      }
    }
    return false;
  }
  function locateBoardPoint(point) {
    const viewport = element("board-viewport");
    const boardBounds = canvas.getBoundingClientRect();
    const viewportBounds = viewport.getBoundingClientRect();
    const scale = boardBounds.width / BOARD.width;
    const left = viewport.scrollLeft + boardBounds.left - viewportBounds.left + point.x * scale;
    const top = viewport.scrollTop + boardBounds.top - viewportBounds.top + point.y * scale;
    viewport.scrollLeft = left - viewport.clientWidth / 2;
    viewport.scrollTop = top - viewport.clientHeight / 2;
    viewport.scrollIntoView({ block: "nearest", inline: "nearest" });
    canvas.focus({ preventScroll: true });
  }
  function wireCenter(wire) {
    const index = state.project.wires.indexOf(wire);
    const points = wirePoints(wire, index);
    const middle = Math.floor((points.length - 1) / 2);
    const first = points[middle];
    const last = points[middle + 1];
    return { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
  }
  function restoreHiddenWire(id, locate = false) {
    const wire = findWire(id);
    if (!wire || !state.hiddenWires.has(id)) {
      return;
    }
    rememberChange(null);
    state.hiddenWires.delete(id);
    state.pending = null;
    state.placing = "";
    state.tool = "select";
    state.activeTab = "inspect";
    state.selection = [];
    state.selected = null;
    selectTarget({ kind: "wire", id }, false);
    clearBoardHover();
    render();
    if (locate) {
      const point = wireCenter(wire);
      locateBoardPoint(point);
    }
  }
  function restoreFromHiddenList(id) {
    restoreHiddenWire(id, true);
  }
  function restoreAllHiddenWires() {
    if (state.hiddenWires.size === 0) {
      return;
    }
    rememberChange(null);
    state.hiddenWires.clear();
    render();
  }
  function deleteSelected() {
    if (editingLocked()) {
      return;
    }
    const targets = [];
    for (const target of state.selection) {
      targets.push({ kind: target.kind, id: target.id });
    }
    if (targets.length === 0 && state.selected && (state.selected.kind === "chip" || state.selected.kind === "wire")) {
      targets.push({ kind: state.selected.kind, id: state.selected.id });
    }
    if (targets.length > 0) {
      confirmAction("\u5220\u9664\u9009\u4E2D\u7684\u5BF9\u8C61\uFF1F", "\u4F60\u9009\u4E2D\u4E86 " + targets.length + " \u4E2A\u5BF9\u8C61\uFF0C\u786E\u8BA4\u540E\u5C06\u4ECE\u5F53\u524D\u5B9E\u9A8C\u4E2D\u79FB\u9664", removeTargets.bind(null, targets));
    }
  }
  function removeTargets(targets) {
    remember();
    const wires = [];
    const chips = [];
    const removed = /* @__PURE__ */ new Set();
    for (const target of targets) {
      removed.add(target.kind + ":" + target.id);
      if (target.kind === "wire") {
        state.hiddenWires.delete(target.id);
      }
    }
    for (const wire of state.project.wires) {
      if (!removed.has("wire:" + wire.id)) {
        wires.push(wire);
      }
    }
    for (const chip of state.project.chips) {
      if (!removed.has("chip:" + chip.id)) {
        chips.push(chip);
      } else {
        delete state.runtime.registers[chip.id];
        delete state.runtime.devices[chip.id];
        removeFixedItem("chip", chip.id);
      }
    }
    state.project.wires = wires;
    state.project.chips = chips;
    state.selected = null;
    state.selection = [];
    commit();
  }
  function deletePanelChip(event) {
    const chipId = event.currentTarget.dataset.chip;
    if (findChip(chipId)) {
      const target = { kind: "chip", id: chipId };
      confirmAction("\u5220\u9664\u82AF\u7247\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F\u5BFC\u7EBF\u4F1A\u7559\u5728\u539F\u6765\u7684\u63D2\u5B54", removeTargets.bind(null, [target]));
    }
  }
  function toggleSwitch(index) {
    remember();
    if (state.project.switches[index] === 0) {
      state.project.switches[index] = 1;
    } else {
      state.project.switches[index] = 0;
    }
    commit("\u5207\u6362 K" + index);
  }
  function resetInputs() {
    const action = "\u590D\u4F4D\u8F93\u5165";
    const switches = state.project.switches;
    const changed = switches.includes(1);
    if (changed) {
      remember();
      switches.fill(0);
    }
    stopContinuousPulse();
    heldPulse = "";
    pulsePointerId = null;
    pulsePointerTarget = null;
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
    window.clearTimeout(pulseTimer);
    state.pressedPulse = "reset";
    recentAction = "\u8F93\u5165\u5DF2\u590D\u4F4D";
    if (changed) {
      commit(action);
    } else {
      calculate(true, action);
      render();
    }
    pulseTimer = window.setTimeout(clearPulseFeedback, PULSE_SETTINGS.feedbackDuration);
  }
  function canPulse() {
    if (!state.project.power) {
      powerToastId = showToast("\u7535\u6E90\u5DF2\u5173\u95ED\uFF0C\u8BF7\u5148\u6253\u5F00\u7535\u6E90\u518D\u53D1\u8109\u51B2", "warning");
      return false;
    }
    return true;
  }
  function startPulse(kind) {
    if (heldPulse !== "" || !canPulse()) {
      return false;
    }
    window.clearTimeout(pulseTimer);
    heldPulse = kind;
    state.pressedPulse = kind;
    if (kind === "P+") {
      state.runtime.pulses.positive = 1;
    } else {
      state.runtime.pulses.negative = 0;
    }
    calculate(true, "\u6309\u4E0B " + kind);
    render();
    return true;
  }
  function finishPulse() {
    if (heldPulse === "") {
      return;
    }
    const kind = heldPulse;
    heldPulse = "";
    pulsePointerId = null;
    pulsePointerTarget = null;
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
    calculate(true, "\u677E\u5F00 " + kind);
    recentAction = kind + " \u5355\u8109\u51B2\u5DF2\u5B8C\u6210";
    render();
    pulseTimer = window.setTimeout(clearPulseFeedback, PULSE_SETTINGS.feedbackDuration);
  }
  function clearPulseFeedback() {
    state.pressedPulse = "";
    renderPulseButtons();
    updateActionStatus();
    renderBoard(canvas, state, endpoints);
  }
  function pulse(kind) {
    if (continuousMode) {
      toggleContinuousPulse();
      return;
    }
    if (startPulse(kind)) {
      finishPulse();
    }
  }
  function startPointerPulse(event, kind) {
    if (continuousMode || event.button !== 0 || !startPulse(kind)) {
      return;
    }
    pulsePointerId = event.pointerId;
    pulsePointerTarget = event.currentTarget;
    pulsePointerTarget.setPointerCapture(pulsePointerId);
  }
  function pressPulseButton(event) {
    const kind = event.currentTarget.dataset.pulse;
    startPointerPulse(event, kind);
  }
  function releasePointerPulse(event) {
    if (event.pointerId !== pulsePointerId || event.currentTarget !== pulsePointerTarget) {
      return false;
    }
    finishPulse();
    return true;
  }
  function clickPulseButton(event) {
    if (continuousMode || event.detail === 0) {
      pulse(event.currentTarget.dataset.pulse);
    }
  }
  function clockContinuousPulse() {
    const pulses = state.runtime.pulses;
    pulses.positive = 1 - pulses.positive;
    pulses.negative = 1 - pulses.positive;
    calculate(false, "\u8FDE\u7EED\u8109\u51B2 \xB7 P+=" + pulses.positive + "\uFF0CP\u2212=" + pulses.negative);
    renderCircuitStatus();
    renderBoardIo(state.project, state.result, toggleSwitch, state.runtime.triState, false);
    if (state.activeTab === "timing") {
      renderTimingPanel(state);
    } else if (state.activeTab === "diagnostics") {
      renderDiagnostics();
    } else if (state.activeTab === "inspect" && (state.selected || state.fixedItems.length > 0)) {
      renderPanels();
    }
    renderBoard(canvas, state, endpoints);
  }
  function stopContinuousPulse() {
    if (continuousTimer === null) {
      return;
    }
    window.clearInterval(continuousTimer);
    continuousTimer = null;
    state.runtime.pulses.positive = 0;
    state.runtime.pulses.negative = 1;
  }
  function toggleContinuousPulse() {
    if (continuousTimer !== null) {
      stopContinuousPulse();
      recentAction = "\u8FDE\u7EED\u8109\u51B2\u5DF2\u505C\u6B62";
      calculate(false, recentAction);
    } else {
      if (!canPulse()) {
        return;
      }
      window.clearTimeout(pulseTimer);
      state.pressedPulse = "";
      const halfPeriod = 500 / pulseFrequency;
      continuousTimer = window.setInterval(clockContinuousPulse, halfPeriod);
      recentAction = "\u8FDE\u7EED\u8109\u51B2\u8FD0\u884C\u4E2D \xB7 " + pulseFrequency + " Hz";
      clockContinuousPulse();
    }
    render();
  }
  function openPulseSettings() {
    finishPulse();
    element("continuous-pulse").checked = continuousMode;
    const frequency = element("pulse-frequency");
    frequency.value = String(pulseFrequency);
    frequency.disabled = continuousMode;
    element("tristate-inputs").checked = state.runtime.triState;
    element("pulse-dialog").showModal();
  }
  function closePulseSettings() {
    element("pulse-dialog").close();
  }
  function applyPulseSettings(event) {
    event.preventDefault();
    const frequency = element("pulse-frequency");
    if (!frequency.disabled) {
      const enteredHz = frequency.valueAsNumber;
      if (!Number.isInteger(enteredHz) || enteredHz < PULSE_SETTINGS.minimumHz || enteredHz > PULSE_SETTINGS.maximumHz) {
        frequency.reportValidity();
        return;
      }
      pulseFrequency = enteredHz;
    }
    continuousMode = element("continuous-pulse").checked;
    if (!continuousMode) {
      stopContinuousPulse();
    }
    state.runtime.triState = element("tristate-inputs").checked;
    closePulseSettings();
    recentAction = "\u5DF2\u66F4\u65B0\u8109\u51B2\u8BBE\u7F6E";
    calculate(true, recentAction);
    render();
  }
  function stopHiddenClock() {
    if (document.hidden && continuousTimer !== null) {
      toggleContinuousPulse();
    }
  }
  function changePower(event) {
    remember();
    state.project.power = event.currentTarget.checked;
    if (state.project.power) {
      dismissToast(powerToastId);
      powerToastId = "";
    } else {
      stopContinuousPulse();
    }
    let action = "\u5173\u95ED\u7535\u6E90";
    if (state.project.power) {
      action = "\u6253\u5F00\u7535\u6E90";
    }
    commit(action);
  }
  function restoreHistory(source, destination) {
    if (drag || source.length === 0) {
      return;
    }
    const entry = source[source.length - 1];
    let current = null;
    if (entry.project) {
      if (editingLocked()) {
        return;
      }
      current = copyProject(state.project);
    }
    destination.push(historyEntry(current));
    source.pop();
    state.hiddenWires = entry.hiddenWires;
    lastClickedWire = "";
    if (!entry.project) {
      state.selection = [];
      state.selected = null;
      clearBoardHover();
      render();
      return;
    }
    state.project = entry.project;
    resetRuntime();
    resetTimingCircuit(state.timing, state.project, "\u4EFF\u771F\u5DF2\u91CD\u7F6E\uFF0C\u539F\u8BB0\u5F55\u5DF2\u6E05\u9664");
    state.result = null;
    commit();
  }
  function undoEdit() {
    restoreHistory(state.undo, state.redo);
  }
  function redoEdit() {
    restoreHistory(state.redo, state.undo);
  }
  function resetRuntime() {
    stopContinuousPulse();
    const triState = state.runtime.triState;
    heldPulse = "";
    pulsePointerId = null;
    pulsePointerTarget = null;
    drag = null;
    ignoreClick = false;
    lastClickedWire = "";
    clearBoardHover();
    cancelTween("board");
    boardTransitionLast = null;
    state.visual.switches = [];
    state.pressedPulse = "";
    window.clearTimeout(pulseTimer);
    state.runtime = createRuntime();
    state.runtime.triState = triState;
    state.pending = null;
    state.placing = "";
    if (state.tool === "place") {
      state.tool = "select";
    }
    state.selected = null;
    catalogModel = "";
    state.selection = [];
    lastPinnedChip = "";
    state.previousIssues = /* @__PURE__ */ new Set();
    state.fixedItems = [];
    resetInspectionLayout();
  }
  function newProject() {
    const blank = findBlankExperiment(workspace);
    if (blank === activeExperiment) {
      toast("\u5F53\u524D\u5B9E\u9A8C\u5DF2\u7ECF\u662F\u7A7A\u767D\u5B9E\u9A8C", "info");
      return;
    }
    if (blank !== "") {
      requestExperimentSwitch(openExperiment.bind(null, blank));
      return;
    }
    requestExperimentSwitch(createBlankExperiment);
  }
  function createBlankExperiment() {
    const project = emptyProject();
    const count = Object.keys(workspace.projects).length + 1;
    project.name = "\u7A7A\u767D\u5B9E\u9A8C " + count;
    openNewExperiment(project);
  }
  function renameProject(event) {
    if (editingLocked()) {
      render();
      return;
    }
    state.project.name = event.currentTarget.value;
    stageChanges();
    renderExperiments();
  }
  function createCircuitFile(format) {
    if (format !== "json") {
      return createBoardImage(format);
    }
    const content = JSON.stringify(state.project, null, PROJECT_JSON_INDENT);
    return new Blob([content], { type: "application/json" });
  }
  function createWorkspaceFile() {
    const content = JSON.stringify(savedExperiments, null, PROJECT_JSON_INDENT);
    return new Blob([content], { type: "application/json" });
  }
  async function openSharedWorkbench() {
    try {
      await window.breadboardWorkspace.openWeb();
    } catch (error) {
      toast(error.message, "warning");
    }
  }
  async function writeImportedWorkspace(candidate) {
    try {
      if (sharedRevision !== "" || dirtyExperiments.size > 0) {
        throw new Error("\u5171\u4EAB\u5DE5\u4F5C\u533A\u5DF2\u88AB\u4FEE\u6539\uFF0C\u8BF7\u7528\u300C\u5BFC\u5165\u7535\u8DEF\u300D\u8FFD\u52A0\u5907\u4EFD");
      }
      await persistWorkspace(candidate);
      applySharedWorkspace(candidate, candidate.activeId);
      toast("\u6D4F\u89C8\u5668\u5B58\u6863\u5DF2\u8FC1\u5165\u5171\u4EAB\u5DE5\u4F5C\u533A", "info");
    } catch (error) {
      reportSaveFailure(error);
    }
  }
  async function migrateBrowserWorkspace(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    input.value = "";
    if (!file) {
      return;
    }
    try {
      if (file.size > SHARED_WORKSPACE.maxBytes) {
        throw new Error("\u5DE5\u4F5C\u533A\u5907\u4EFD\u8D85\u51FA\u4E86\u5171\u4EAB\u5B58\u6863\u7684\u5927\u5C0F\u9650\u5236");
      }
      const source = await file.text();
      const candidate = validateWorkspace(JSON.parse(source));
      if (sharedRevision !== "" || pendingWrites > 0 || dirtyExperiments.size > 0) {
        throw new Error("\u5F53\u524D\u5DF2\u6709\u5171\u4EAB\u5B58\u6863\u6216\u672A\u4FDD\u5B58\u6539\u52A8\uFF0C\u8BF7\u7528\u300C\u5BFC\u5165\u7535\u8DEF\u300D\u8FFD\u52A0\u5907\u4EFD");
      }
      await queueWorkspaceWrite(writeImportedWorkspace.bind(null, candidate));
    } catch (error) {
      toast(error.message, "warning");
    }
  }
  function chooseImport() {
    element("import-file").click();
  }
  function openNewExperiment(project) {
    activeExperiment = newExperimentId();
    state.project = project;
    state.saveFailed = false;
    stageChanges();
    resetExperiment();
  }
  async function importWorkspaceBackup(parsed) {
    const imported = validateWorkspace(parsed);
    for (const id of Object.keys(imported.projects)) {
      const newId = newExperimentId();
      const project = imported.projects[id];
      workspace.projects[newId] = copyProject(project);
      importedExperiments.add(newId);
      dirtyExperiments.add(newId);
    }
    let saved = false;
    if (autoSave) {
      saved = await saveLocal();
    }
    render();
    if (saved) {
      toast("\u5B9E\u9A8C\u5907\u4EFD\u5DF2\u5BFC\u5165\u5E76\u4FDD\u5B58\uFF0C\u53EF\u5728\u201C\u6211\u7684\u5B9E\u9A8C\u201D\u4E2D\u67E5\u770B", "info");
    } else if (autoSave) {
      recordPendingImport("\u5B9E\u9A8C\u5907\u4EFD\u5DF2\u5BFC\u5165\uFF0C\u4F46\u81EA\u52A8\u4FDD\u5B58\u5931\u8D25\u3002\u8BF7\u91CD\u8BD5\u4FDD\u5B58", "warning");
    } else {
      recordPendingImport("\u5B9E\u9A8C\u5907\u4EFD\u5DF2\u5BFC\u5165\uFF0C\u53EF\u5728\u201C\u6211\u7684\u5B9E\u9A8C\u201D\u4E2D\u67E5\u770B\u3002\u6309 Ctrl+S \u4FDD\u5B58\u5C1A\u672A\u5199\u5165\u7684\u5907\u4EFD", "info");
    }
  }
  async function importProject(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) {
      return;
    }
    try {
      if (file.size > LIMITS.fileBytes) {
        throw new Error("\u7535\u8DEF\u6587\u4EF6\u8FC7\u5927\uFF0C\u6700\u591A\u652F\u6301 " + LIMITS.fileBytes + " \u5B57\u8282");
      }
      const content = await file.text();
      const parsed = JSON.parse(content);
      if (parsed.projects) {
        await importWorkspaceBackup(parsed);
      } else {
        const candidate = validateProject(parsed);
        requestExperimentSwitch(openNewExperiment.bind(null, candidate));
      }
    } catch (error) {
      let message = "\u7535\u8DEF\u6587\u4EF6\u65E0\u6CD5\u89E3\u6790\uFF0C\u8BF7\u68C0\u67E5 JSON \u683C\u5F0F";
      if (!(error instanceof SyntaxError)) {
        message = error.message;
      }
      toast(message, "error");
    }
    input.value = "";
  }
  function recordPendingImport(message, kind) {
    dismissToast(saveToastId);
    saveToastId = showToast(message, kind);
  }
  function createBoardImage(format) {
    renderBoard(canvas, state, endpoints);
    return encodeCanvasImage(canvas, format);
  }
  function applyZoom(value) {
    state.zoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    element("canvas-size").style.width = BOARD.width * state.zoom + "px";
    element("canvas-size").style.height = BOARD.height * state.zoom + "px";
    canvas.style.transform = "scale(" + state.zoom + ")";
    element("zoom-label").textContent = Math.round(state.zoom * 100) + "%";
    if (zoomAnchor) {
      const viewport = element("board-viewport");
      const bounds = canvas.getBoundingClientRect();
      viewport.scrollLeft = viewport.scrollLeft + bounds.left + zoomAnchor.x * state.zoom - zoomAnchor.clientX;
      viewport.scrollTop = viewport.scrollTop + bounds.top + zoomAnchor.y * state.zoom - zoomAnchor.clientY;
    }
  }
  function changeZoom(value, anchor2) {
    zoomAnchor = anchor2;
    state.targetZoom = Math.max(SETTINGS.zoomMinimum, Math.min(SETTINGS.zoomMaximum, value));
    tween("zoom", state.zoom, state.targetZoom, applyZoom, MOTION.zoomDuration);
  }
  function wheelBoard(event) {
    if (!event.ctrlKey) {
      return;
    }
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    const anchor2 = { x: (event.clientX - bounds.left) / state.zoom, y: (event.clientY - bounds.top) / state.zoom, clientX: event.clientX, clientY: event.clientY };
    const viewport = element("board-viewport");
    const scale = wheelZoomFactor(event, viewport);
    changeZoom(state.targetZoom * scale, anchor2);
  }
  function fitBoard() {
    const width = element("board-viewport").clientWidth - SETTINGS.fitPadding;
    changeZoom(width / BOARD.width, null);
  }
  function zoomIn() {
    changeZoom(state.targetZoom + SETTINGS.zoomStep, null);
  }
  function zoomOut() {
    changeZoom(state.targetZoom - SETTINGS.zoomStep, null);
  }
  function changeDisplayOptions() {
    state.showInternals = element("show-internals").checked;
    state.showLevels = element("show-levels").checked;
    animateBoard();
    renderBoard(canvas, state, endpoints);
  }
  function connectByName() {
    const first = element("from-endpoint").value.trim();
    const second = element("to-endpoint").value.trim();
    connectWire(first, second, []);
  }
  function changeTab(event) {
    state.activeTab = event.currentTarget.id.slice(4);
    renderPanels();
  }
  function appendPinRow(table, chip, pin) {
    const model = CHIP_MODELS[chip.model];
    const row = document.createElement("tr");
    const hole = pinHole(chip, pin);
    const value = readEndpoint(state.result, hole);
    row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""));
    let levelClass = "logic-level";
    if (value === 1) {
      levelClass = levelClass + " high";
    } else if (value === "X" || value === "Z") {
      levelClass = levelClass + " unknown";
    }
    const levelCell = node("td", String(value), levelClass);
    levelCell.dataset.pin = String(pin);
    row.append(levelCell);
    const positionCell = document.createElement("td");
    const button = node("button", endpointLabel(hole), "");
    button.dataset.endpoint = hole;
    button.addEventListener("click", inspectPin);
    positionCell.append(button);
    row.append(positionCell);
    table.append(row);
  }
  function inspectPin(event) {
    const endpoint = event.currentTarget.dataset.endpoint;
    inspectEndpoint(endpoint);
  }
  function createChipHeading(title, buttonId, target, handler) {
    const heading = node("div", "", "inspection-heading");
    heading.append(node("h2", title, ""));
    const pin = node("button", "", "icon-button");
    pin.id = buttonId;
    pin.dataset.model = target;
    pin.addEventListener("click", handler);
    updatePinButton(pin, target);
    heading.append(pin);
    return heading;
  }
  function renderChipPanel(container, chip, prefix = "") {
    const model = CHIP_MODELS[chip.model];
    const title = chip.id + " \xB7 " + chip.model;
    const heading = createChipHeading(title, prefix + "pin-chip-info", chip.id, togglePinnedChip);
    heading.lastElementChild.dataset.chip = chip.id;
    const locate = node("button", "", "icon-button");
    const bounds = chipBounds(chip);
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    locate.setAttribute("aria-label", "\u5B9A\u4F4D\u82AF\u7247");
    locate.dataset.tip = "\u5B9A\u4F4D\u82AF\u7247";
    locate.append(icon("locate-fixed"));
    locate.addEventListener("click", locateBoardPoint.bind(null, center));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "\u5220\u9664\u82AF\u7247");
    remove.append(icon("trash-2"));
    remove.dataset.chip = chip.id;
    remove.addEventListener("click", deletePanelChip);
    heading.insertBefore(locate, heading.lastElementChild);
    heading.insertBefore(remove, heading.lastElementChild);
    container.append(heading, node("p", model.title + " \xB7 DIP-" + model.count, "object-subtitle"));
    appendChipOverview(container, chip);
    const pins = objectSection("\u5B9E\u65F6\u5F15\u811A");
    appendChipPinTable(pins, chip);
    container.append(pins);
    appendChipPositionEditor(container, chip, prefix);
    const reference = objectSection("\u5F15\u811A\u56FE\u4E0E\u8D44\u6599");
    appendChipReference(reference, chip);
    container.append(reference);
    remove.disabled = readOnly;
  }
  function appendChipOverview(container, chip) {
    const model = CHIP_MODELS[chip.model];
    const lastColumn = chip.column + model.count / 2 - 1;
    const position = "\u7B2C " + (chip.section + 1) + " \u5757 \xB7 " + chip.column + "\u2013" + lastColumn + " \u5217";
    const facts = node("dl", "", "object-facts");
    const supply = objectFact("\u4F9B\u7535", "");
    supply.lastElementChild.className = "chip-supply";
    facts.append(objectFact("\u677F\u4E0A\u4F4D\u7F6E", position), supply);
    container.append(facts);
    refreshChipSupply(container, chip);
  }
  function refreshChipSupply(container, chip) {
    const target = container.querySelector(".chip-supply");
    const model = CHIP_MODELS[chip.model];
    const power = readEndpoint(state.result, pinHole(chip, model.power));
    const ground = readEndpoint(state.result, pinHole(chip, model.ground));
    let text2 = "\u4F9B\u7535\u5F02\u5E38";
    if (!state.project.power) {
      text2 = "\u7535\u6E90\u5173\u95ED";
    } else if (power === 1 && ground === 0) {
      text2 = "\u4F9B\u7535\u6B63\u5E38";
    }
    target.textContent = text2;
    target.dataset.supply = text2;
  }
  function appendChipPositionEditor(container, chip, prefix) {
    const panel = objectSection("\u8C03\u6574\u4F4D\u7F6E");
    const controls2 = node("div", "", "move-fields");
    controls2.dataset.chip = chip.id;
    const sectionLabel = node("label", "\u677F\u5757", "");
    const section = document.createElement("select");
    section.id = prefix + "move-section";
    section.dataset.field = "section";
    for (let index = 0; index < BOARD.sections; index = index + 1) {
      const option = node("option", "\u7B2C " + (index + 1) + " \u5757", "");
      option.value = String(index);
      section.append(option);
    }
    section.value = String(chip.section);
    sectionLabel.append(section);
    const columnLabel = node("label", "\u8D77\u59CB\u5217", "");
    const column = document.createElement("input");
    column.id = prefix + "move-column";
    column.dataset.field = "column";
    column.type = "number";
    column.min = "1";
    column.max = String(BOARD.columns);
    column.value = String(chip.column);
    columnLabel.append(column);
    const move = objectAction("move", "\u79FB\u52A8\u82AF\u7247", moveChip);
    controls2.append(sectionLabel, columnLabel, move);
    move.disabled = readOnly;
    section.disabled = readOnly;
    column.disabled = readOnly;
    panel.append(controls2);
    container.append(panel);
    section.setAttribute("aria-label", "\u82AF\u7247\u6240\u5728\u677F\u5757");
    refreshSelect(section);
  }
  function appendChipPinTable(container, chip) {
    const table = node("table", "", "pin-table object-pin-table");
    const head = document.createElement("tr");
    for (const label2 of ["\u811A", "\u540D\u79F0", "\u7535\u5E73", "\u4F4D\u7F6E"]) {
      const cell = node("th", label2, "");
      cell.scope = "col";
      head.append(cell);
    }
    table.append(head);
    for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
      appendPinRow(table, chip, pin);
    }
    container.append(table);
  }
  function moveChip(event) {
    if (editingLocked()) {
      return;
    }
    const controls2 = event.currentTarget.closest(".move-fields");
    const chip = findChip(controls2.dataset.chip);
    const section = Number(controls2.querySelector("[data-field='section']").value);
    const column = Number(controls2.querySelector("[data-field='column']").value);
    const candidate = { id: chip.id, model: chip.model, section, column };
    let error = placementError(state.project.chips, candidate, chip.id);
    for (const wire of state.project.wires) {
      for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
        const hole = pinHole(candidate, pin);
        if (wire.from === hole || wire.to === hole) {
          error = "\u65B0\u4F4D\u7F6E\u7684\u82AF\u7247\u5B54\u88AB\u5BFC\u7EBF\u5360\u7528\uFF0C\u8BF7\u5148\u79FB\u8D70\u5BFC\u7EBF";
        }
      }
    }
    if (error !== "") {
      toast(error, "error");
      return;
    }
    remember();
    chip.section = candidate.section;
    chip.column = candidate.column;
    lastPinnedChip = "";
    delete state.runtime.registers[chip.id];
    delete state.runtime.devices[chip.id];
    commit();
  }
  function catalogAlreadyShown() {
    if (hasFixedItem("model", catalogModel)) {
      return true;
    }
    if (state.fixedItems.length > 0 || element("pinned-chip").hidden) {
      return false;
    }
    const selected = state.selected;
    if (!selected || selected.kind !== "chip") {
      return false;
    }
    const chip = findChip(selected.id);
    return chip !== null && chip.model === catalogModel;
  }
  function renderSelectedWire(container, wire) {
    const level = readEndpoint(state.result, wire.from);
    const hidden = state.hiddenWires.has(wire.id);
    let visibility = "\u5B9E\u7EBF\u663E\u793A";
    if (hidden) {
      visibility = "\u5DF2\u9690\u85CF \xB7 \u865A\u7EBF";
    }
    const heading = node("div", "", "object-heading");
    heading.append(icon("cable"), node("h2", wire.id, ""), objectLevel(level, true));
    const facts = node("dl", "", "object-facts");
    const color = objectFact("\u7EBF\u8272", wire.color);
    const swatch = node("span", "", "object-swatch");
    swatch.style.backgroundColor = wire.color;
    color.lastElementChild.prepend(swatch);
    facts.append(color, objectFact("\u663E\u793A\u72B6\u6001", visibility));
    container.append(heading, facts, wireInspectionActions(wire, hidden));
    container.append(wireEndpoints(wire, state.result, inspectEndpoint));
    appendNetworkDetails(container, state, wire.from, wire.id, inspectNetworkWire);
  }
  function wireInspectionActions(wire, hidden) {
    const actions = node("div", "", "object-actions");
    const locate = objectAction("locate-fixed", "\u677F\u9762\u5B9A\u4F4D", locateBoardPoint.bind(null, wireCenter(wire)));
    const target = { kind: "wire", id: wire.id };
    let visibility = objectAction("eye-off", "\u9690\u85CF\u5BFC\u7EBF", hideWires.bind(null, [target]));
    if (hidden) {
      visibility = objectAction("eye", "\u663E\u793A\u5BFC\u7EBF", restoreHiddenWire.bind(null, wire.id, false));
    }
    const remove = node("button", "", "icon-button object-remove object-wire-delete");
    remove.type = "button";
    remove.setAttribute("aria-label", "\u5220\u9664\u5BFC\u7EBF");
    remove.dataset.tip = "\u5220\u9664\u5BFC\u7EBF";
    remove.append(icon("trash-2"));
    remove.addEventListener("click", deleteSelected);
    remove.disabled = readOnly;
    actions.append(locate, visibility, remove);
    return actions;
  }
  function inspectNetworkWire(id) {
    const wire = findWire(id);
    state.selection = [];
    state.selected = null;
    selectTarget({ kind: "wire", id }, false);
    element("inspect-panel").scrollTop = 0;
    render();
    locateBoardPoint(wireCenter(wire));
  }
  function inspectEndpoint(endpoint) {
    catalogModel = "";
    state.selected = { kind: "node", id: endpoint };
    state.selection = [];
    element("inspect-panel").scrollTop = 0;
    render();
    const point = endpointPosition(endpoint);
    locateBoardPoint(point);
  }
  function renderSelectedNode(container, name) {
    const value = readEndpoint(state.result, name);
    const heading = node("div", "", "object-heading");
    const level = objectLevel(value, true);
    level.classList.add("node-value");
    heading.append(icon("circle-dot"), node("h2", endpointLabel(name), ""), level);
    const hasPullUp = state.project.pullUps.includes(name);
    let pullUpState = "\u672A\u6DFB\u52A0";
    let pullUpLabel = "\u6DFB\u52A0\u4E0A\u62C9";
    if (hasPullUp) {
      pullUpState = "\u5DF2\u6DFB\u52A0";
      pullUpLabel = "\u79FB\u9664\u4E0A\u62C9";
    }
    const facts = node("dl", "", "object-facts");
    facts.append(objectFact("\u5B54\u4F4D\u7F16\u53F7", name), objectFact("\u4E0A\u62C9\u8BBE\u7F6E", pullUpState));
    const actions = node("div", "", "object-actions");
    const point = endpointPosition(name);
    const locate = objectAction("locate-fixed", "\u677F\u9762\u5B9A\u4F4D", locateBoardPoint.bind(null, point));
    const pullUp = objectAction("arrow-up-to-line", pullUpLabel, togglePullUp);
    pullUp.disabled = readOnly;
    pullUp.dataset.endpoint = name;
    actions.append(locate, pullUp);
    container.append(heading, facts, actions);
    appendNetworkDetails(container, state, name, "", inspectNetworkWire);
  }
  function renderInspectionSummary(container) {
    const empty = node("div", "", "empty-inspector");
    empty.append(icon("scan-line"), node("strong", "\u672A\u9009\u62E9\u5BF9\u8C61", ""), node("p", "\u82AF\u7247 " + state.project.chips.length + " \u7247 \xB7 \u5BFC\u7EBF " + state.project.wires.length + " \u6839", ""));
    container.append(empty);
    const summary = node("table", "", "pin-table");
    for (const chip of state.project.chips) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      const button = node("button", chip.id + "  " + chip.model, "");
      button.dataset.chip = chip.id;
      button.addEventListener("click", selectChipFromList);
      cell.append(button);
      row.append(cell, node("td", "\u7B2C" + (chip.section + 1) + "\u5757", ""));
      summary.append(row);
    }
    container.append(summary);
  }
  function renderInspection() {
    const container = element("inspect-panel");
    const scrollTop = container.scrollTop;
    container.replaceChildren();
    container.classList.remove("inspection-duplicate");
    if (catalogModel !== "") {
      if (catalogAlreadyShown()) {
        container.classList.add("inspection-duplicate");
      } else {
        renderCatalogInfo(container, catalogModel);
      }
      return;
    }
    if (state.selection.length > 1) {
      renderMultiInspection(container);
      container.scrollTop = scrollTop;
      return;
    }
    const selected = state.selected;
    if (selected && selected.kind === "chip") {
      const chip = findChip(selected.id);
      if (chip) {
        if (hasFixedItem("chip", chip.id) || state.fixedItems.length === 0) {
          container.classList.add("inspection-duplicate");
        } else {
          renderChipPanel(container, chip, "selected-");
          container.scrollTop = scrollTop;
        }
        return;
      }
    } else if (selected && selected.kind === "wire") {
      const wire = findWire(selected.id);
      if (wire) {
        renderSelectedWire(container, wire);
        container.scrollTop = scrollTop;
        return;
      }
    } else if (selected && selected.kind === "node") {
      renderSelectedNode(container, selected.id);
      container.scrollTop = scrollTop;
      return;
    }
    renderInspectionSummary(container);
  }
  function togglePullUp(event) {
    if (editingLocked()) {
      return;
    }
    remember();
    const endpoint = event.currentTarget.dataset.endpoint;
    const index = state.project.pullUps.indexOf(endpoint);
    if (index >= 0) {
      state.project.pullUps.splice(index, 1);
    } else {
      state.project.pullUps.push(endpoint);
    }
    commit();
  }
  function renderCatalogInfo(container, modelName, prefix = "") {
    const model = CHIP_MODELS[modelName];
    const buttonId = prefix + "pin-catalog-info";
    const heading = createChipHeading(modelName, buttonId, modelName, togglePinnedModel);
    container.append(heading, node("p", model.title + " \xB7 DIP-" + model.count, "inspection-meta"));
    appendChipReference(container, { model: modelName });
    const place = node("button", "", "button catalog-place");
    place.id = prefix + "place-catalog-chip";
    place.dataset.model = modelName;
    place.append(icon("microchip"), node("span", "\u653E\u7F6E\u82AF\u7247", ""));
    place.disabled = readOnly;
    place.addEventListener("click", placeCatalogChip);
    container.append(place);
    const table = node("table", "", "pin-table catalog-pin-table");
    const header = document.createElement("tr");
    header.append(node("th", "\u811A\u53F7", ""), node("th", "\u540D\u79F0", ""), node("th", "\u7C7B\u578B", ""));
    table.append(header);
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
      let kind = "\u8F93\u5165";
      if (pin === model.power) {
        kind = "+5V \u7535\u6E90";
      } else if (pin === model.ground) {
        kind = "\u5730";
      } else if (model.bidirectional && model.bidirectional.includes(pin)) {
        kind = "\u8F93\u5165/\u8F93\u51FA";
      } else if (model.outputs.includes(pin)) {
        kind = "\u8F93\u51FA";
      } else if (!model.inputs.includes(pin)) {
        kind = "\u7A7A\u811A NC";
      }
      const row = document.createElement("tr");
      row.append(node("td", String(pin), ""), node("td", model.labels[pin], ""), node("td", kind, ""));
      table.append(row);
    }
    container.append(table);
  }
  function deselectFromInspection(event) {
    const kind = event.currentTarget.dataset.kind;
    const id = event.currentTarget.dataset.id;
    removeSelectedTarget({ kind, id });
    render();
  }
  function toggleSelectionDetails(event) {
    const details = event.currentTarget;
    if (details.open) {
      expandedSelection.add(details.dataset.chip);
    } else {
      expandedSelection.delete(details.dataset.chip);
    }
  }
  function selectionHeading(container, target, title) {
    const heading = node("div", "", "selection-heading");
    heading.append(node("h3", title, ""));
    const remove = node("button", "", "icon-button");
    remove.setAttribute("aria-label", "\u53D6\u6D88\u9009\u62E9 " + target.id);
    remove.dataset.kind = target.kind;
    remove.dataset.id = target.id;
    remove.append(icon("x"));
    remove.addEventListener("click", deselectFromInspection);
    heading.append(remove);
    container.append(heading);
  }
  function appendSelectedWire(container, target, wire) {
    selectionHeading(container, target, wire.id + " \xB7 \u5BFC\u7EBF");
    const swatch = node("span", "", "selection-wire-color");
    swatch.style.backgroundColor = wire.color;
    swatch.setAttribute("aria-label", "\u989C\u8272 " + wire.color);
    const color = node("div", "", "selection-wire-meta");
    color.append(swatch, node("span", wire.color, ""));
    container.append(color);
    const list = node("dl", "", "selection-wire-endpoints");
    for (const endpoint of [wire.from, wire.to]) {
      const row = node("div", "", "selection-endpoint");
      const value = readEndpoint(state.result, endpoint);
      row.append(node("dt", endpointLabel(endpoint), ""), node("dd", String(value), "logic-level"));
      list.append(row);
    }
    container.append(list);
  }
  function appendSelectedChip(container, target, chip) {
    const model = CHIP_MODELS[chip.model];
    selectionHeading(container, target, chip.id + " \xB7 " + chip.model);
    const lastColumn = chip.column + model.count / 2 - 1;
    container.append(node("p", model.title + " \xB7 \u7B2C " + (chip.section + 1) + " \u5757 \xB7 " + chip.column + "\uFF5E" + lastColumn + " \u5217", "selection-location"));
    container.append(node("p", CHIP_REFERENCES[chip.model].summary, "chip-summary"));
    const details = node("details", "", "selection-chip-details");
    details.dataset.chip = chip.id;
    details.open = expandedSelection.has(chip.id);
    details.append(node("summary", "\u5F15\u811A\u56FE\u4E0E\u5B9E\u65F6\u7535\u5E73", ""));
    const body = node("div", "", "selection-chip-body");
    appendChipReference(body, chip);
    appendChipPinTable(body, chip);
    details.append(body);
    details.addEventListener("toggle", toggleSelectionDetails);
    container.append(details);
  }
  function renderMultiInspection(container) {
    const heading = node("div", "", "object-heading");
    heading.append(icon("layers"), node("h2", "\u5DF2\u9009 " + state.selection.length + " \u9879", ""));
    const facts = node("dl", "", "object-facts");
    let wires = 0;
    for (const target of state.selection) {
      if (target.kind === "wire") {
        wires = wires + 1;
      }
    }
    facts.append(objectFact("\u5668\u4EF6", String(state.selection.length - wires) + " \u7247"), objectFact("\u5BFC\u7EBF", String(wires) + " \u6839"));
    const actions = node("div", "", "object-actions");
    const hide = objectAction("eye-off", "\u9690\u85CF\u6240\u9009\u5BFC\u7EBF", hideSelectedWires);
    hide.disabled = !hasVisibleWires(state.selection);
    const remove = objectAction("trash-2", "\u5220\u9664\u6240\u9009\u5BF9\u8C61", deleteSelected);
    remove.classList.add("object-remove");
    remove.disabled = readOnly;
    actions.append(hide, remove);
    container.append(heading, facts, actions);
    const list = node("div", "", "selection-list");
    for (const target of state.selection) {
      const section = node("section", "", "selection-item");
      section.dataset.kind = target.kind;
      section.dataset.id = target.id;
      section.setAttribute("aria-label", target.id + " \u68C0\u67E5\u4FE1\u606F");
      if (target.kind === "wire") {
        const wire = findWire(target.id);
        if (wire) {
          appendSelectedWire(section, target, wire);
          list.append(section);
        }
      } else if (target.kind === "chip") {
        const chip = findChip(target.id);
        if (chip) {
          appendSelectedChip(section, target, chip);
          list.append(section);
        }
      }
    }
    container.append(list);
  }
  function selectChipFromList(event) {
    selectTarget({ kind: "chip", id: event.currentTarget.dataset.chip }, event.ctrlKey || event.metaKey);
    render();
  }
  function selectWireFromList(event) {
    selectTarget({ kind: "wire", id: event.currentTarget.dataset.wire }, event.ctrlKey || event.metaKey);
    state.activeTab = "inspect";
    render();
  }
  function deleteWireFromList(event) {
    const target = { kind: "wire", id: event.currentTarget.dataset.wire };
    if (!editingLocked()) {
      confirmAction("\u5220\u9664\u5BFC\u7EBF\uFF1F", "\u786E\u8BA4\u5220\u9664 " + target.id + "\uFF1F", removeTargets.bind(null, [target]));
    }
  }
  function renderWireList() {
    const container = element("wires-panel");
    container.replaceChildren();
    for (const wire of state.project.wires) {
      if (state.hiddenWires.has(wire.id)) {
        continue;
      }
      const row = node("div", "", "wire-row");
      const swatch = node("span", "", "");
      swatch.style.backgroundColor = wire.color;
      const select = node("button", "", "");
      select.dataset.wire = wire.id;
      select.append(node("small", wire.id + " \xB7 " + readEndpoint(state.result, wire.from), ""), node("span", endpointLabel(wire.from) + " \u2192 " + endpointLabel(wire.to), ""));
      select.addEventListener("click", selectWireFromList);
      const remove = node("button", "", "icon-button");
      remove.dataset.wire = wire.id;
      remove.setAttribute("aria-label", "\u5220\u9664 " + wire.id);
      remove.append(icon("x"));
      remove.addEventListener("click", deleteWireFromList);
      remove.disabled = readOnly;
      row.append(swatch, select, remove);
      container.append(row);
    }
    if (container.childElementCount === 0) {
      let message = "\u6682\u65E0\u5BFC\u7EBF";
      if (state.hiddenWires.size > 0) {
        message = "\u5BFC\u7EBF\u5DF2\u5168\u90E8\u9690\u85CF";
      }
      container.append(node("p", message, "empty-inspector"));
    }
  }
  function renderDiagnostics() {
    const container = element("diagnostics-panel");
    container.replaceChildren();
    container.append(node("h2", "\u5F53\u524D\u7535\u8DEF\u8BCA\u65AD", ""));
    container.append(node("p", "\u4F9B\u7535\u3001\u8F93\u5165\u3001\u9A71\u52A8\u51B2\u7A81\u3001\u77ED\u8DEF\u4E0E\u79BB\u6563\u65F6\u5E8F\u72B6\u6001\uFF1B\u4E0D\u8BC4\u4F30\u7EB3\u79D2\u7EA7\u5EFA\u7ACB\u4FDD\u6301\u65F6\u95F4", "inspection-meta"));
    if (circuitDiagnostics.issues.length === 0) {
      const item = node("div", "", "diagnostic success");
      let message = "\u5F53\u524D\u672A\u53D1\u73B0\u4F9B\u7535\u3001\u51B2\u7A81\u3001\u77ED\u8DEF\u6216\u903B\u8F91\u72B6\u6001\u5F02\u5E38";
      if (!state.project.power) {
        message = "\u7535\u6E90\u5DF2\u5173\u95ED";
      } else if (state.project.chips.length === 0) {
        message = "\u5F53\u524D\u6CA1\u6709\u82AF\u7247";
      }
      item.append(icon("circle-check"), node("span", message, ""));
      container.append(item);
    }
    for (const issue of circuitDiagnostics.issues) {
      const item = node("div", "", "diagnostic " + issue.severity);
      item.dataset.code = issue.code;
      item.append(icon("triangle-alert"), node("span", issue.message, ""));
      container.append(item);
    }
    for (const chip of circuitDiagnostics.chips) {
      const item = node("section", "", "diagnostic-chip");
      item.dataset.chip = chip.id;
      const heading = node("div", "", "diagnostic-chip-heading");
      heading.append(node("h3", chip.id + " \xB7 " + chip.model, ""), node("span", chip.status, "logic-level " + chip.severity));
      item.append(heading, node("p", chip.detail, "inspection-meta"));
      container.append(item);
    }
  }
  function renderPanels() {
    element("inspection-stack").hidden = state.activeTab !== "inspect";
    renderPinnedChip();
    for (const name of INSPECTOR_TABS) {
      const active = name === state.activeTab;
      element(name + "-panel").hidden = !active;
      element("tab-" + name).classList.toggle("active", active);
      element("tab-" + name).setAttribute("aria-selected", String(active));
    }
    renderInspection();
    const inspection = element("inspect-panel");
    const pinned = element("pinned-chip");
    const onlyPinned = inspection.classList.contains("inspection-duplicate");
    const divider = element("inspection-divider");
    divider.hidden = pinned.hidden || onlyPinned || state.activeTab !== "inspect";
    if (!divider.hidden) {
      configureInspectionDivider(divider, pinned.lastElementChild, inspection);
    }
    applyInspectionSizes();
    if (state.activeTab === "wires") {
      renderWireList();
    }
    if (state.activeTab === "diagnostics") {
      renderDiagnostics();
    }
    if (state.activeTab === "notes") {
      renderNotes();
    }
    if (state.activeTab === "timing") {
      renderTimingPanel(state);
    }
    refreshIcons();
  }
  function findFixedItem(kind, id) {
    for (const item of state.fixedItems) {
      if (item.kind === kind && item.id === id) {
        return item;
      }
    }
    return null;
  }
  function hasFixedItem(kind, id) {
    return findFixedItem(kind, id) !== null;
  }
  function removeFixedItem(kind, id) {
    const kept = [];
    for (const item of state.fixedItems) {
      if (item.kind !== kind || item.id !== id) {
        kept.push(item);
      }
    }
    state.fixedItems = kept;
  }
  function visiblePinnedItems() {
    const items = [];
    for (const item of state.fixedItems) {
      if (item.kind === "model" || findChip(item.id)) {
        items.push(item);
      }
    }
    state.fixedItems = items;
    const shown = items.slice();
    if (shown.length === 0 && state.selection.length <= 1 && state.selected && state.selected.kind === "chip") {
      const chip = findChip(state.selected.id);
      if (chip) {
        shown.push({ kind: "chip", id: chip.id });
      }
    }
    return shown;
  }
  function rebuildPinnedPanes(container, items) {
    const scrollPositions = {};
    for (const pane of container.querySelectorAll(".inspection-pane")) {
      scrollPositions[pane.dataset.key] = pane.scrollTop;
    }
    container.replaceChildren();
    let previous = null;
    for (const item of items) {
      const pane = node("section", "", "inspection-pane");
      pane.dataset.key = item.kind + ":" + item.id;
      pane.dataset.kind = item.kind;
      pane.dataset.id = item.id;
      pane.id = "pane-" + item.kind + "-" + item.id;
      if (previous) {
        const divider = node("div", "", "");
        configureInspectionDivider(divider, previous, pane);
        container.append(divider);
      }
      container.append(pane);
      let prefix = "fixed-" + item.id + "-";
      if (item.kind === "chip") {
        if (!container.querySelector("#pin-chip-info")) {
          prefix = "";
        }
        renderChipPanel(pane, findChip(item.id), prefix);
      } else {
        renderCatalogInfo(pane, item.id, prefix);
      }
      if (Object.hasOwn(scrollPositions, pane.dataset.key)) {
        pane.scrollTop = scrollPositions[pane.dataset.key];
      }
      previous = pane;
    }
  }
  function refreshPinnedLevels(container) {
    for (const pane of container.querySelectorAll(".inspection-pane[data-kind='chip']")) {
      const chip = findChip(pane.dataset.id);
      refreshChipSupply(pane, chip);
      for (const cell of pane.querySelectorAll("[data-pin]")) {
        const pin = Number(cell.dataset.pin);
        const value = readEndpoint(state.result, pinHole(chip, pin));
        cell.textContent = String(value);
        cell.classList.toggle("high", value === 1);
        cell.classList.toggle("unknown", value === "X" || value === "Z");
      }
    }
  }
  function renderPinnedChip() {
    const container = element("pinned-chip");
    if (state.activeTab !== "inspect") {
      container.hidden = true;
      return;
    }
    const items = visiblePinnedItems();
    container.hidden = items.length === 0;
    if (container.hidden) {
      container.replaceChildren();
      lastPinnedChip = "";
      return;
    }
    let key = String(readOnly);
    for (const item of items) {
      const fixed = hasFixedItem(item.kind, item.id);
      key = key + ":" + item.kind + ":" + item.id + ":" + fixed;
    }
    if (lastPinnedChip !== key) {
      rebuildPinnedPanes(container, items);
      lastPinnedChip = key;
    }
    refreshPinnedLevels(container);
  }
  function updatePinButton(button, chipId) {
    const fixed = hasFixedItem("chip", chipId) || hasFixedItem("model", chipId);
    let label2 = "\u56FA\u5B9A\u5F15\u811A\u4FE1\u606F";
    let symbol = "pin";
    if (fixed) {
      label2 = "\u53D6\u6D88\u56FA\u5B9A\u5F15\u811A\u4FE1\u606F";
      symbol = "pin-off";
    }
    button.setAttribute("aria-label", label2);
    button.setAttribute("aria-pressed", String(fixed));
    button.dataset.tip = label2;
    button.classList.toggle("selected", fixed);
    button.replaceChildren(icon(symbol));
  }
  function toggleFixedItem(kind, id) {
    if (hasFixedItem(kind, id)) {
      removeFixedItem(kind, id);
    } else {
      state.fixedItems.push({ kind, id });
    }
    lastPinnedChip = "";
    render();
  }
  function togglePinnedModel(event) {
    const modelName = event.currentTarget.dataset.model;
    toggleFixedItem("model", modelName);
  }
  function togglePinnedChip(event) {
    const chipId = event.currentTarget.dataset.chip;
    toggleFixedItem("chip", chipId);
  }
  function changeIoCount(event) {
    if (editingLocked()) {
      renderBoardIo(state.project, state.result, toggleSwitch, state.runtime.triState);
      return;
    }
    const count = Number(event.currentTarget.value);
    if (!validIoCount(count)) {
      toast("\u663E\u793A\u4F4D\u6570\u5FC5\u987B\u4E3A 1\uFF5E" + IO_LIMIT + "\uFF0C\u8BF7\u8F93\u5165\u6574\u6570", "warning");
      renderBoardIo(state.project, state.result, toggleSwitch, state.runtime.triState);
      return;
    }
    remember();
    if (event.currentTarget.id === "input-count") {
      state.project.inputCount = count;
    } else {
      state.project.outputCount = count;
    }
    commit();
  }
  function renderNotes() {
    const editor = element("notes-editor");
    if (editor.value !== state.project.notes) {
      editor.value = state.project.notes;
    }
    editor.hidden = !state.notesEditing;
    element("notes-editor-label").hidden = !state.notesEditing;
    element("notes-preview").hidden = state.notesEditing;
    element("notes-edit-button").classList.toggle("selected", state.notesEditing);
    element("notes-edit-button").setAttribute("aria-pressed", String(state.notesEditing));
    element("notes-preview-button").classList.toggle("selected", !state.notesEditing);
    element("notes-preview-button").setAttribute("aria-pressed", String(!state.notesEditing));
    if (!state.notesEditing) {
      element("notes-preview").replaceChildren(markdownFragment(state.project.notes));
    }
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " \xB7 \u968F\u7535\u8DEF\u4FDD\u5B58";
  }
  function editNotes() {
    if (editingLocked()) {
      return;
    }
    state.notesEditing = true;
    renderNotes();
    element("notes-editor").focus({ preventScroll: true });
  }
  function previewNotes() {
    state.notesEditing = false;
    renderNotes();
  }
  function rememberNotes() {
    remember();
  }
  function updateNotes(event) {
    if (editingLocked()) {
      renderNotes();
      return;
    }
    state.project.notes = event.currentTarget.value;
    stageChanges();
    element("notes-status").textContent = state.project.notes.length + " / " + NOTES_LIMIT + " \xB7 \u6309 Ctrl+S \u4FDD\u5B58";
    element("undo").disabled = !canRestoreHistory(state.undo);
    element("redo").disabled = !canRestoreHistory(state.redo);
  }
  function renderPulseButtons() {
    for (const button of document.querySelectorAll(".pulse-button")) {
      const pressed = button.dataset.pulse === state.pressedPulse;
      button.classList.toggle("pressed", pressed);
      button.setAttribute("aria-pressed", String(pressed));
    }
    element("reset-inputs").classList.toggle("pressed", state.pressedPulse === "reset");
    let positiveLabel = "P+ \u5355\u8109\u51B2";
    let negativeLabel = "P\u2212 \u5355\u8109\u51B2";
    let positiveName = "P\u6B63\u5355\u8109\u51B2";
    let negativeName = "P\u8D1F\u5355\u8109\u51B2";
    if (continuousMode) {
      let action = "\u542F\u52A8";
      if (continuousTimer !== null) {
        action = "\u505C\u6B62";
      }
      positiveLabel = "P+ " + action;
      negativeLabel = "P\u2212 " + action;
      positiveName = action + "\u8FDE\u7EED\u8109\u51B2\uFF08P+\uFF09";
      negativeName = action + "\u8FDE\u7EED\u8109\u51B2\uFF08P\u2212\uFF09";
    }
    element("pulse-positive-label").textContent = positiveLabel;
    element("pulse-positive").setAttribute("aria-label", positiveName);
    element("pulse-negative-label").textContent = negativeLabel;
    element("pulse-negative").setAttribute("aria-label", negativeName);
    let settingsLabel = "\u8109\u51B2\u8BBE\u7F6E";
    if (continuousMode) {
      settingsLabel = settingsLabel + " \xB7 " + pulseFrequency + " Hz";
    }
    if (state.runtime.triState) {
      settingsLabel = settingsLabel + " \xB7 \u4E09\u6001";
    }
    element("pulse-options").textContent = settingsLabel;
  }
  function renderBoardControls() {
    element("read-only-toggle").checked = readOnly;
    element("project-name").readOnly = readOnly;
    for (const id of READ_ONLY_CONTROLS) {
      element(id).disabled = readOnly;
    }
    const arrangement = element("arrange-wires");
    arrangement.disabled = readOnly || routingBusy;
    arrangement.setAttribute("aria-busy", String(routingBusy));
    element("connect-endpoints").disabled = readOnly || routingBusy;
    element("project-name").value = state.project.name;
    element("power-toggle").checked = state.project.power;
    element("undo").disabled = !canRestoreHistory(state.undo);
    element("redo").disabled = !canRestoreHistory(state.redo);
    element("cancel-wire").disabled = !state.pending && state.placing === "";
    element("hide-selected").disabled = !hasVisibleWires(state.selection);
    const hiddenCount = state.hiddenWires.size;
    const hiddenButton = element("hidden-objects");
    hiddenButton.setAttribute("aria-label", "\u5DF2\u9690\u85CF\u5BFC\u7EBF\uFF1A" + hiddenCount);
    element("hidden-object-count").textContent = String(hiddenCount);
    for (const name of BOARD_TOOLS) {
      const active = state.tool === name;
      const button = element("tool-" + name);
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    }
    for (const button of element("wire-palette").children) {
      const active = button.dataset.color === state.wireColor;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    element("custom-color").value = state.wireColor;
    const angle = element("wire-angle");
    angle.value = "free";
    if (state.wireAngle === 45) {
      angle.value = "45";
    }
    refreshSelect(angle);
  }
  function canRestoreHistory(history2) {
    if (history2.length === 0) {
      return false;
    }
    const entry = history2[history2.length - 1];
    return !readOnly || !entry.project;
  }
  function renderCircuitStatus() {
    element("wire-count").textContent = String(state.project.wires.length);
    element("issue-count").textContent = String(circuitDiagnostics.issues.length);
    element("circuit-count").textContent = state.project.chips.length + " \u7247\u82AF\u7247 \xB7 " + state.project.wires.length + " \u6839\u5BFC\u7EBF";
    let status = "\u7535\u8DEF\u7A33\u5B9A";
    if (!state.project.power) {
      status = "\u7535\u6E90\u5173\u95ED";
    } else if (circuitDiagnostics.issues.length > 0) {
      status = circuitDiagnostics.issues.length + " \u9879\u8BCA\u65AD";
    }
    if (state.pending) {
      status = "\u63A5\u7EBF\u8D77\u70B9\uFF1A" + endpointLabel(state.pending.from);
    } else if (state.placing) {
      status = "\u5F85\u653E\u7F6E " + state.placing;
    }
    element("simulation-status").textContent = status;
  }
  function render() {
    updateActionStatus();
    renderPulseButtons();
    renderSaveStatus();
    renderBoardControls();
    renderCircuitStatus();
    renderBoardIo(state.project, state.result, toggleSwitch, state.runtime.triState);
    renderExperiments();
    renderPanels();
    cleanSelectPanels();
    renderBoard(canvas, state, endpoints);
  }
  function updateActionStatus() {
    let message = "\u5C31\u7EEA";
    if (recentAction !== "") {
      message = recentAction;
    }
    if (state.pressedPulse === "reset") {
      message = "\u8F93\u5165\u5DF2\u590D\u4F4D";
    } else if (state.pressedPulse !== "") {
      message = state.pressedPulse + " \u8109\u51B2";
    } else if (state.placing !== "") {
      message = "\u5F85\u653E\u7F6E " + state.placing;
    } else if (state.pending) {
      message = "\u63A5\u7EBF\u8D77\u70B9\uFF1A" + endpointLabel(state.pending.from);
    } else if (catalogModel !== "") {
      message = "\u6B63\u5728\u67E5\u770B " + catalogModel;
    } else if (state.selection.length > 1) {
      message = "\u5DF2\u9009\u62E9 " + state.selection.length + " \u4E2A\u5BF9\u8C61";
    } else if (state.selected) {
      message = "\u5DF2\u9009\u62E9 " + state.selected.id;
    }
    element("action-status").textContent = message;
  }
  function showHelp() {
    element("help-dialog").showModal();
  }
  function closeHelp() {
    element("help-dialog").close();
  }
  function showLogicDiagram() {
    openLogicDiagram(state.project, state.result);
  }
  function keyDown(event) {
    if (element("announcement-dialog").open) {
      return;
    }
    if (element("export-dialog").open || element("hidden-objects-dialog").open || element("pulse-dialog").open) {
      return;
    }
    const tag = event.target.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (element("switch-dialog").open) {
        saveAndSwitch();
        return;
      }
      saveCurrentExperiment();
      return;
    }
    if (element("confirm-dialog").open || element("switch-dialog").open) {
      return;
    }
    if (element("logic-diagram-dialog").open) {
      return;
    }
    if (event.key === "Escape") {
      cancelWire();
      return;
    }
    if (editing || element("help-dialog").open) {
      return;
    }
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "h" && !event.altKey) {
      event.preventDefault();
      if (!event.repeat) {
        if (event.shiftKey || state.selection.length === 0) {
          openHiddenWires();
        } else {
          hideSelectedWires();
        }
      }
    } else if ((event.ctrlKey || event.metaKey) && key === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redoEdit();
      } else {
        undoEdit();
      }
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
    }
  }
  function bindBoardEvents() {
    const viewport = element("board-viewport");
    boardPan = bindViewportPan(viewport, BOARD_PAN_OPTIONS);
    boardSelection = bindViewportSelection(viewport, BOARD_SELECTION_OPTIONS);
    openHiddenWires = bindHiddenWires(state, restoreFromHiddenList, restoreAllHiddenWires);
    element("hide-selected").addEventListener("click", hideSelectedWires);
    for (const name of BOARD_TOOLS) {
      element("tool-" + name).addEventListener("click", chooseTool);
    }
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", cancelPointer);
    canvas.addEventListener("lostpointercapture", releasePointerPulse);
    canvas.addEventListener("click", clickBoard);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerleave", leaveBoard);
    viewport.addEventListener("wheel", wheelBoard, { passive: false });
    element("arrange-wires").addEventListener("click", requestWireRouting);
    element("connect-endpoints").addEventListener("click", connectByName);
    element("chip-search").addEventListener("input", renderLibrary);
    element("custom-color").addEventListener("input", chooseCustomColor);
    element("wire-angle").addEventListener("change", changeWireAngle);
    element("cancel-wire").addEventListener("click", cancelWire);
    element("zoom-in").addEventListener("click", zoomIn);
    element("zoom-out").addEventListener("click", zoomOut);
    element("fit-board").addEventListener("click", fitBoard);
    element("show-internals").addEventListener("change", changeDisplayOptions);
    element("show-levels").addEventListener("change", changeDisplayOptions);
  }
  function bindWorkspaceEvents() {
    element("save-project").addEventListener("click", saveCurrentExperiment);
    element("autosave-toggle").addEventListener("change", changeAutoSave);
    element("quick-delete").addEventListener("click", quickDelete);
    element("confirm-cancel").addEventListener("click", cancelConfirmation);
    element("confirm-accept").addEventListener("click", acceptConfirmation);
    element("switch-cancel").addEventListener("click", cancelExperimentSwitch);
    element("switch-dialog").addEventListener("cancel", cancelExperimentSwitch);
    element("switch-without-saving").addEventListener("click", switchWithoutSaving);
    element("switch-save").addEventListener("click", saveAndSwitch);
    window.addEventListener("beforeunload", beforeLeave);
    element("read-only-toggle").addEventListener("change", changeReadOnly);
    element("new-experiment").addEventListener("click", newProject);
    element("experiment-picker").addEventListener("change", switchExperiment);
    element("undo").addEventListener("click", undoEdit);
    element("redo").addEventListener("click", redoEdit);
    element("new-project").addEventListener("click", newProject);
    bindFileExport("export-project", "circuit", createCircuitFile);
    bindFileExport("export-workspace", "workspace", createWorkspaceFile);
    element("open-shared-workbench").addEventListener("click", openSharedWorkbench);
    const migration = element("import-workspace");
    element("migrate-workspace").addEventListener("click", migration.click.bind(migration));
    migration.addEventListener("change", migrateBrowserWorkspace);
    element("import-project").addEventListener("click", chooseImport);
    element("import-file").addEventListener("change", importProject);
    element("project-name").addEventListener("input", renameProject);
    bindFileExport("export-image", "board", createBoardImage);
  }
  function bindPulseEvents() {
    for (const button of document.querySelectorAll(".pulse-button")) {
      button.addEventListener("pointerdown", pressPulseButton);
      button.addEventListener("pointerup", releasePointerPulse);
      button.addEventListener("pointercancel", releasePointerPulse);
      button.addEventListener("lostpointercapture", releasePointerPulse);
      button.addEventListener("click", clickPulseButton);
    }
    window.addEventListener("blur", finishPulse);
    document.addEventListener("visibilitychange", stopHiddenClock);
    const frequency = element("pulse-frequency");
    frequency.min = String(PULSE_SETTINGS.minimumHz);
    frequency.max = String(PULSE_SETTINGS.maximumHz);
    frequency.step = "1";
    element("pulse-frequency-range").textContent = "\u8BF7\u8F93\u5165 " + frequency.min + "\uFF5E" + frequency.max + " \u4E4B\u95F4\u7684\u6574\u6570\u3002";
    element("reset-inputs").addEventListener("click", resetInputs);
    element("pulse-options").addEventListener("click", openPulseSettings);
    element("cancel-pulse-settings").addEventListener("click", closePulseSettings);
    element("pulse-form").addEventListener("submit", applyPulseSettings);
    element("power-toggle").addEventListener("change", changePower);
    element("input-count").addEventListener("change", changeIoCount);
    element("output-count").addEventListener("change", changeIoCount);
  }
  function bindPanelEvents() {
    for (const name of INSPECTOR_TABS) {
      element("tab-" + name).addEventListener("click", changeTab);
    }
    element("diagnose-circuit").addEventListener("click", diagnoseCurrentCircuit);
    element("notes-edit-button").addEventListener("click", editNotes);
    element("notes-preview-button").addEventListener("click", previewNotes);
    element("notes-editor").addEventListener("focus", rememberNotes);
    element("notes-editor").addEventListener("input", updateNotes);
    element("help-button").addEventListener("click", showHelp);
    element("close-help").addEventListener("click", closeHelp);
    element("view-logic-diagram").addEventListener("click", showLogicDiagram);
    bindLogicDiagram();
    bindTimingPanel(state);
  }
  function bindEvents() {
    bindExportDialog();
    bindTooltips();
    bindBoardEvents();
    bindWorkspaceEvents();
    bindPulseEvents();
    bindPanelEvents();
    document.addEventListener("keydown", keyDown);
  }
  function initializeDefaultPreset() {
    const resetValue = state.project.switches[COMPLEMENT_RESET_INPUT];
    state.project.switches[COMPLEMENT_RESET_INPUT] = 0;
    calculate(false);
    state.project.switches[COMPLEMENT_RESET_INPUT] = resetValue;
    calculate(false);
  }
  function prepareWorkbench() {
    canvas = element("board-canvas");
    element("project-name").maxLength = LIMITS.nameLength;
    element("notes-editor").maxLength = NOTES_LIMIT;
    element("input-count").max = String(IO_LIMIT);
    element("output-count").max = String(IO_LIMIT);
    canvas.width = BOARD.width * DRAW.pixelRatio;
    canvas.height = BOARD.height * DRAW.pixelRatio;
    canvas.style.height = BOARD.height + "px";
  }
  function applySharedWorkspace(value, preferredId = activeExperiment) {
    const incoming = validateWorkspace(value);
    let id = preferredId;
    if (!Object.hasOwn(incoming.projects, id) || sharedRevision === "") {
      id = incoming.activeId;
    }
    const changed = id !== activeExperiment || JSON.stringify(incoming.projects[id]) !== JSON.stringify(state.project);
    savedExperiments = copyProject(incoming);
    workspace = incoming;
    if (changed) {
      openExperiment(id);
    } else {
      workspace.activeId = id;
      renderExperiments();
    }
    state.saveFailed = false;
  }
  async function refreshSharedWorkspace() {
    if (readingShared || pendingWrites > 0) {
      return;
    }
    readingShared = true;
    const requestedRevision = sharedRevision;
    try {
      const result = await sharedClient.read();
      sharedReady = true;
      sharedNotice = "\u5171\u4EAB\u5B58\u6863\u5DF2\u8FDE\u63A5";
      if (pendingWrites === 0 && requestedRevision === sharedRevision && result.workspace && result.revision !== sharedRevision) {
        if (dirtyExperiments.size > 0 || drag || switchAction || confirmationAction) {
          sharedNotice = "\u5171\u4EAB\u5B58\u6863\u6709\u66F4\u65B0\uFF0C\u5F53\u524D\u6539\u52A8\u5DF2\u4FDD\u7559";
        } else {
          applySharedWorkspace(result.workspace);
          sharedRevision = result.revision;
        }
      }
    } catch {
      sharedReady = false;
      sharedNotice = "\u5171\u4EAB\u5B58\u6863\u6682\u672A\u8FDE\u63A5";
    } finally {
      readingShared = false;
      element("migrate-workspace").hidden = !sharedReady || sharedRevision !== "";
      renderSaveStatus();
    }
  }
  async function readInitialSharedWorkspace(restored) {
    const current = await sharedClient.read();
    if (current.workspace || !window.breadboardWorkspace) {
      return current;
    }
    let snapshot = null;
    if (restored.hasSavedWorkspace && restored.warning === "") {
      snapshot = restored.workspace;
    } else if (!restored.hasSavedWorkspace) {
      snapshot = await sharedClient.readSnapshot();
    }
    if (snapshot) {
      return sharedClient.write({ revision: current.revision, workspace: snapshot });
    }
    return current;
  }
  async function restoreInitialWorkspace(restored) {
    try {
      sharedClient = sharedWorkspaceClient();
    } catch {
      restored.warning = "\u6D4F\u89C8\u5668\u672A\u5141\u8BB8\u8BFB\u53D6\u5171\u4EAB\u914D\u5BF9\u8BBE\u7F6E";
    }
    if (!sharedClient) {
      return restored;
    }
    try {
      const result = await readInitialSharedWorkspace(restored);
      if (result.workspace) {
        const saved = validateWorkspace(result.workspace);
        restored.workspace = saved;
        restored.project = copyProject(saved.projects[saved.activeId]);
        restored.initializePreset = restored.project.power && isComplementPreset(restored.project);
      }
      sharedRevision = result.revision;
      sharedReady = true;
      sharedNotice = "\u5171\u4EAB\u5B58\u6863\u5DF2\u8FDE\u63A5";
    } catch {
      sharedNotice = "\u5171\u4EAB\u5B58\u6863\u6682\u672A\u8FDE\u63A5";
    }
    element("open-shared-workbench").hidden = !window.breadboardWorkspace;
    element("migrate-workspace").hidden = !sharedReady || sharedRevision !== "";
    window.setInterval(refreshSharedWorkspace, SHARED_WORKSPACE.refreshInterval);
    return restored;
  }
  function restorePackagedSnapshot(local) {
    if (local.hasSavedWorkspace || !window.breadboardSnapshot) {
      return;
    }
    try {
      const snapshot = validateWorkspace(JSON.parse(window.breadboardSnapshot));
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot));
      local.workspace = snapshot;
      local.project = copyProject(snapshot.projects[snapshot.activeId]);
      local.initializePreset = local.project.power && isComplementPreset(local.project);
    } catch {
      local.warning = "\u4E2A\u4EBA\u5FEB\u7167\u65E0\u6CD5\u6253\u5F00\uFF0C\u5DF2\u663E\u793A\u5185\u7F6E\u793A\u4F8B";
    }
  }
  async function start() {
    prepareWorkbench();
    const local = loadWorkspace(window);
    restorePackagedSnapshot(local);
    const restored = await restoreInitialWorkspace(local);
    workspace = restored.workspace;
    readOnly = restored.readOnly;
    activeExperiment = workspace.activeId;
    state.project = restored.project;
    savedExperiments = copyProject(workspace);
    bindEvents();
    createPalette();
    calculate(false);
    if (restored.initializePreset) {
      initializeDefaultPreset();
    }
    renderLibrary();
    fitBoard();
    render();
    const inspectionObserver = new ResizeObserver(applyInspectionSizes);
    inspectionObserver.observe(element("inspection-stack"));
    const ioObserver = new ResizeObserver(updateIoLayout);
    ioObserver.observe(document.querySelector(".io-strip"));
    refreshIcons();
    updateClock();
    window.setInterval(updateClock, SETTINGS.clockInterval);
    if (restored.warning !== "") {
      toast(restored.warning, "warning");
    }
    if (restored.removedCount > 0) {
      toast("\u5DF2\u6574\u7406 " + restored.removedCount + " \u4EFD\u91CD\u590D\u7A7A\u767D\u6216\u8865\u7801\u5B9E\u9A8C\uFF0C\u6574\u7406\u524D\u7684\u5217\u8868\u5DF2\u5907\u4EFD", "info");
    }
    startAnnouncement();
  }
  start();
})();
/*! Bundled license information:

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE *)
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
