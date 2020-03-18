(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("quill"));
	else if(typeof define === 'function' && define.amd)
		define(["quill"], factory);
	else if(typeof exports === 'object')
		exports["QuillAutoformat"] = factory(require("quill"));
	else
		root["QuillAutoformat"] = factory(root["Quill"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_quill__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./modules/quill-autoformat/src/quill-autoformat.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./modules/quill-autoformat/src/formats/hashtag.js":
/*!*********************************************************!*\
  !*** ./modules/quill-autoformat/src/formats/hashtag.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Hashtag; });\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n\nconst Embed = quill__WEBPACK_IMPORTED_MODULE_0___default.a.import('blots/embed');\n\nclass Hashtag extends Embed {\n  static create(value) {\n    let node = super.create(value);\n    let _value = value;\n\n    const checkValueRegexResult = _value.match(/([a-zA-Z0-9_])+/i);\n\n    if (value !== '#' && checkValueRegexResult && checkValueRegexResult.length) {\n      console.log(checkValueRegexResult);\n      _value = \"/tag/\".concat(checkValueRegexResult[0]);\n      node.setAttribute('href', _value);\n      node.setAttribute('spellcheck', false);\n      node.textContent = '#' + value;\n      return node;\n    }\n  }\n\n  static formats(domNode) {\n    return domNode.getAttribute('href').substr(this.BASE_URL.length);\n  }\n\n  format(name, value) {\n    this.domNode.setAttribute('href', value);\n  }\n\n  static value(domNode) {\n    return domNode.textContent.substr(1);\n  }\n\n}\n\nHashtag.blotName = 'hashtag';\nHashtag.className = 'ql-hashtag';\nHashtag.tagName = 'A';\nHashtag.BASE_URL = '#';\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/formats/hashtag.js?");

/***/ }),

/***/ "./modules/quill-autoformat/src/formats/mention.js":
/*!*********************************************************!*\
  !*** ./modules/quill-autoformat/src/formats/mention.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n\nconst Embed = quill__WEBPACK_IMPORTED_MODULE_0___default.a.import('blots/embed');\n\nclass Mention extends Embed {\n  static create(value) {\n    const node = super.create(value);\n    node.setAttribute('title', value);\n    node.setAttribute('href', this.BASE_URL + value);\n    node.textContent = '@' + value;\n    return node;\n  }\n\n  static value(domNode) {\n    return domNode.textContent.substr(1);\n  }\n\n}\n\nMention.blotName = 'mention';\nMention.className = 'ql-mention';\nMention.tagName = 'A';\nMention.BASE_URL = '/';\n/* harmony default export */ __webpack_exports__[\"default\"] = (Mention);\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/formats/mention.js?");

/***/ }),

/***/ "./modules/quill-autoformat/src/formats/tip.js":
/*!*****************************************************!*\
  !*** ./modules/quill-autoformat/src/formats/tip.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Tip; });\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n\nconst Embed = quill__WEBPACK_IMPORTED_MODULE_0___default.a.import('blots/embed');\n\nclass Tip extends Embed {\n  static create(value) {\n    console.log(value);\n    let node = super.create(value); // node.setAttribute('href', `https://beta.discussions.app/tags/${value}`)\n    // node.setAttribute('spellcheck', false)\n    // node.textContent = '#tip' + value\n\n    return node;\n  }\n\n  static formats(domNode) {\n    return domNode.getAttribute('href').substr(this.BASE_URL.length);\n  }\n\n  format(name, value) {\n    this.domNode.setAttribute('href', this.BASE_URL + value);\n  }\n\n  static value(domNode) {\n    console.log('textContent: ', domNode.textContent);\n    return domNode.textContent.substr(1);\n  }\n\n}\n\nTip.blotName = 'tip';\nTip.className = 'ql-tip';\nTip.tagName = 'A';\nTip.BASE_URL = '#';\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/formats/tip.js?");

/***/ }),

/***/ "./modules/quill-autoformat/src/modules/autoformat.js":
/*!************************************************************!*\
  !*** ./modules/quill-autoformat/src/modules/autoformat.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Autoformat; });\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n\nconst Module = quill__WEBPACK_IMPORTED_MODULE_0___default.a.import('core/module');\nconst Delta = quill__WEBPACK_IMPORTED_MODULE_0___default.a.import('delta'); // const { Attributor, Scope } = Quill.import('parchment')\n// Binds autoformat transforms to typing and pasting\n\nclass Autoformat extends Module {\n  constructor(quill, options) {\n    super(quill, options);\n    this.transforms = options;\n    this.registerTypeListener();\n    this.registerPasteListener();\n  }\n\n  registerPasteListener() {\n    for (const name in this.transforms) {\n      const transform = this.transforms[name];\n      this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {\n        if (typeof node.data !== 'string') {\n          return;\n        }\n\n        delta.ops.forEach((op, index, deltaOps) => {\n          // Find insert string ops\n          if (typeof op.insert === 'string') {\n            let changeDelta = makeTransformedDelta(transform, op.insert);\n            let composedDelta = new Delta([op]).compose(changeDelta); // Replace the current op with transformed ops\n\n            deltaOps.splice(index, 1, ...composedDelta.ops);\n          }\n        });\n        return delta;\n      });\n    }\n  }\n\n  registerTypeListener() {\n    this.quill.keyboard.addBinding({\n      key: 38,\n      // Arrow Up\n      collapsed: true,\n      format: ['autoformat-helper']\n    }, this.forwardKeyboardUp.bind(this));\n    this.quill.keyboard.addBinding({\n      key: 40,\n      // Arrow Down\n      collapsed: true,\n      format: ['autoformat-helper']\n    }, this.forwardKeyboardDown.bind(this));\n    this.quill.on(quill__WEBPACK_IMPORTED_MODULE_0___default.a.events.TEXT_CHANGE, (delta, oldDelta, source) => {\n      let ops = delta.ops;\n\n      if (source !== 'user' || !ops || ops.length < 1) {\n        return;\n      } // Check last insert\n\n\n      let lastOpIndex = ops.length - 1;\n      let lastOp = ops[lastOpIndex];\n\n      while (!lastOp.insert && lastOpIndex > 0) {\n        lastOpIndex--;\n        lastOp = ops[lastOpIndex];\n      }\n\n      if (!lastOp.insert || typeof lastOp.insert !== 'string') {\n        return;\n      }\n\n      let isEnter = lastOp.insert === '\\n'; // Get selection\n\n      let sel = this.quill.getSelection();\n\n      if (!sel) {\n        return;\n      }\n\n      let endSelIndex = this.quill.getLength() - sel.index - (isEnter ? 1 : 0); // Get leaf\n\n      let checkIndex = sel.index;\n      let [leaf] = this.quill.getLeaf(checkIndex);\n\n      if (!leaf || !leaf.text) {\n        return;\n      }\n\n      let leafIndex = leaf.offset(leaf.scroll);\n      let leafSelIndex = checkIndex - leafIndex;\n      let transformed = false; // Check transforms\n\n      for (const name in this.transforms) {\n        const transform = this.transforms[name]; // Check helper trigger\n\n        if (transform.helper && transform.helper.trigger) {\n          if (lastOp.insert.match(transform.helper.trigger)) {\n            // TODO: check leaf/atindex instead\n            this.quill.formatText(checkIndex, 1, 'autoformat-helper', name, quill__WEBPACK_IMPORTED_MODULE_0___default.a.sources.API);\n            this.openHelper(transform, checkIndex);\n            continue;\n          }\n        } // Check transform trigger\n\n\n        if (lastOp.insert.match(transform.trigger || /./)) {\n          this.closeHelper(transform);\n          let ops = new Delta().retain(leafIndex);\n          let transformOps = makeTransformedDelta(transform, leaf.text, leafSelIndex);\n\n          if (transformOps) {\n            ops = ops.concat(transformOps);\n          }\n\n          this.quill.updateContents(ops, 'api');\n          transformed = true;\n        }\n      } // Restore cursor position\n      // if(transformed) {\n      //   setTimeout(() => {\n      //     const quillLength = this.quill.getLength()\n      //     console.log({\n      //       quillLength,\n      //       endSelIndex,\n      //     })\n      //     this.quill.setSelection(quillLength - endSelIndex, 'api')\n      //   }, 0);\n      // }\n\n    });\n  }\n\n  forwardKeyboard(range, context) {\n    if (this.currentHelper && this.currentHelper.container) {\n      let target = this.currentHelper.container.querySelector('.dropdown-menu');\n      console.log('keyboard', target, context.event);\n      target.dispatchEvent(context.event);\n    }\n  }\n\n  forwardKeyboardUp(range, context) {\n    var e = new KeyboardEvent('keydown', {\n      key: 'ArrowUp',\n      keyCode: 38,\n      which: 38,\n      bubbles: true,\n      cancelable: true\n    });\n    context.event = e;\n    this.forwardKeyboard(range, context);\n  }\n\n  forwardKeyboardDown(range, context) {\n    var e = new KeyboardEvent('keydown', {\n      key: 'ArrowDown',\n      keyCode: 40,\n      which: 40,\n      bubbles: true,\n      cancelable: true\n    });\n    context.event = e;\n    this.forwardKeyboard(range, context);\n  }\n\n  openHelper(transform, index) {\n    if (transform.helper) {\n      this.currentHelper = transform.helper;\n\n      if (typeof transform.helper.open === 'function') {\n        console.log('openHelper', index, this.quill.getFormat(index));\n        let pos = this.quill.getBounds(index);\n        let helperNode = this.quill.addContainer('ql-helper');\n        helperNode.style.position = 'absolute';\n        helperNode.style.top = pos.top + 'px';\n        helperNode.style.left = pos.left + 'px';\n        helperNode.style.width = pos.width + 'px';\n        helperNode.style.height = pos.height + 'px';\n        console.log('openHelper', pos, helperNode);\n        transform.helper.container = helperNode;\n        transform.helper.open(helperNode);\n      }\n    }\n  }\n\n  closeHelper(transform) {\n    if (transform.helper) {\n      if (typeof transform.helper.close === 'function') {\n        transform.helper.close(transform.helper.container);\n      }\n    }\n  }\n\n}\n\nfunction getFormat(transform, match) {\n  let format = {};\n\n  if (typeof transform.format === 'string') {\n    format[transform.format] = match;\n  } else if (typeof transform.format === 'object') {\n    format = transform.format;\n  }\n\n  return format;\n}\n\nfunction transformMatch(transform, match) {\n  let find = new RegExp(transform.extract || transform.find);\n  return transform.transform ? match.replace(find, transform.transform) : match;\n}\n\nfunction applyExtract(transform, match) {\n  // Extract\n  if (transform.extract) {\n    let extract = new RegExp(transform.extract);\n    let extractMatch = extract.exec(match[0]);\n\n    if (!extractMatch || !extractMatch.length) {\n      return match;\n    }\n\n    extractMatch.index += match.index;\n    return extractMatch;\n  }\n\n  return match;\n}\n\nfunction makeTransformedDelta(transform, text, atIndex) {\n  if (!transform.find.global) {\n    transform.find = new RegExp(transform.find, transform.find.flags + 'g');\n  }\n\n  transform.find.lastIndex = 0;\n  let ops = new Delta();\n  let findResult = null;\n  let checkAtIndex = atIndex !== undefined && atIndex !== null;\n\n  if (checkAtIndex) {\n    // find match at index\n    findResult = transform.find.exec(text);\n\n    while (findResult && findResult.length && findResult.index < atIndex) {\n      if (findResult.index < atIndex && findResult.index + findResult[0].length + 1 >= atIndex) {\n        ops = ops.concat(transformedMatchOps(transform, findResult).ops);\n        break;\n      } else {\n        findResult = transform.find.exec(text);\n      }\n    }\n  } else {\n    // find all matches\n    while ((findResult = transform.find.exec(text)) !== null) {\n      let transformedMatch = transformedMatchOps(transform, findResult);\n      ops = ops.concat(transformedMatch.ops);\n      text = text.substr(transformedMatch.rightIndex);\n      transform.find.lastIndex = 0;\n    }\n  }\n\n  return ops;\n}\n\nfunction transformedMatchOps(transform, result) {\n  result = applyExtract(transform, result);\n  let resultIndex = result.index;\n  let transformedMatch = transformMatch(transform, result[0]);\n  let insert = transformedMatch;\n\n  if (transform.insert) {\n    insert = {};\n    insert[transform.insert] = transformedMatch;\n  }\n\n  let format = getFormat(transform, transformedMatch);\n  const ops = new Delta();\n  ops.retain(resultIndex).delete(result[0].length).insert(insert, format);\n  let rightIndex = resultIndex + result[0].length;\n  return {\n    ops,\n    rightIndex\n  };\n} // TRANSFORM {\n//   trigger:     RegExp for matching text input characters to trigger the match. Defaults to /./ which is matching any character\n//   find:        Global RegExp to search for in the text\n//   extract:     Additional RegExp to finetune and override the found text match\n//   transform:   String or function passed to String.replace() to rewrite find/extract results\n//   insert:      Insert name string or embed insert object.\n//   format:      Format name string or attributes object.\n// }\n// Reference:\n// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions\n// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace\n// https://github.com/quilljs/delta/#insert\n\n\nAutoformat.DEFAULTS = {\n  hashtag: {\n    trigger: /[\\s.,;:!?]/,\n    find: /(?:^|\\s)#[^\\s.,;:!?]+/i,\n    extract: /#([^\\s.,;:!?]+)/i,\n    transform: '$1',\n    // transform: function(value, raw) {\n    //     return value\n    // },\n    insert: 'hashtag' // helper: {\n    //   trigger: /(?:^|\\s)#/,\n    //   open: function(target) {\n    //     console.log(\"hashtag search\", target)\n    //   },\n    //   select: function(target, callback) {\n    //     callback()\n    //   },\n    //   close: function(target) {\n    //     console.log(\"hashtag search canceled\")\n    //     if (target) {\n    //       target.innerHTML = \"\";\n    //     }\n    //   }\n    // }\n\n  } // mention: {\n  //   trigger: /[\\s.,;:!?]/,\n  //   find: /(?:^|\\s)@[^\\s.,;:!?]+/i,\n  //   extract: /@([^\\s.,;:!?]+)/i,\n  //   transform: '$1',\n  //   insert: 'mention'\n  // },\n  // link: {\n  //   trigger: /[\\s]/,\n  //   find: /https?:\\/\\/[\\S]+|(www\\.[\\S]+)/gi,\n  //   transform: function (value, noProtocol) {\n  //     return noProtocol ? \"http://\" + value : value;\n  //   },\n  //   format: 'link'\n  // }\n\n}; // const AutoformatHelperAttribute = new Attributor('autoformat-helper', 'data-helper', {\n//     scope: Scope.INLINE,\n// })\n\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/modules/autoformat.js?");

/***/ }),

/***/ "./modules/quill-autoformat/src/quill-autoformat.js":
/*!**********************************************************!*\
  !*** ./modules/quill-autoformat/src/quill-autoformat.js ***!
  \**********************************************************/
/*! exports provided: default, Hashtag, Mention, Tip */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formats/hashtag */ \"./modules/quill-autoformat/src/formats/hashtag.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Hashtag\", function() { return _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n/* harmony import */ var _formats_mention__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./formats/mention */ \"./modules/quill-autoformat/src/formats/mention.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Mention\", function() { return _formats_mention__WEBPACK_IMPORTED_MODULE_2__[\"default\"]; });\n\n/* harmony import */ var _formats_tip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./formats/tip */ \"./modules/quill-autoformat/src/formats/tip.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Tip\", function() { return _formats_tip__WEBPACK_IMPORTED_MODULE_3__[\"default\"]; });\n\n/* harmony import */ var _modules_autoformat__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/autoformat */ \"./modules/quill-autoformat/src/modules/autoformat.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _modules_autoformat__WEBPACK_IMPORTED_MODULE_4__[\"default\"]; });\n\n\n\n\n\n // if (Quill.version && parseInt(Quill.version[0]) < 2) {\n//     console.warn('quill-autoformat requires Quill 2.0 or higher to work properly')\n// }\n\nquill__WEBPACK_IMPORTED_MODULE_0___default.a.register({\n  'modules/autoformat': _modules_autoformat__WEBPACK_IMPORTED_MODULE_4__[\"default\"],\n  'formats/hashtag': _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  'formats/tip': _formats_tip__WEBPACK_IMPORTED_MODULE_3__[\"default\"] // 'formats/mention': Mention,\n  // 'formats/autoformat-helper': AutoformatHelperAttribute\n\n}, true);\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/quill-autoformat.js?");

/***/ }),

/***/ "quill":
/*!**************************************************************************************!*\
  !*** external {"commonjs":"quill","commonjs2":"quill","amd":"quill","root":"Quill"} ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_quill__;\n\n//# sourceURL=webpack://QuillAutoformat/external_%7B%22commonjs%22:%22quill%22,%22commonjs2%22:%22quill%22,%22amd%22:%22quill%22,%22root%22:%22Quill%22%7D?");

/***/ })

/******/ });
});