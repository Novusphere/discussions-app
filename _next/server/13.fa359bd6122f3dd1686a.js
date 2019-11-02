exports.ids = [13];
exports.modules = {

/***/ "Rsc6":
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
  if (true) module.exports = factory(__webpack_require__("bIHf"));else {}
})(window, function (__WEBPACK_EXTERNAL_MODULE_quill__) {
  return (
    /******/
    function (modules) {
      // webpackBootstrap

      /******/
      // The module cache

      /******/
      var installedModules = {};
      /******/

      /******/
      // The require function

      /******/

      function __webpack_require__(moduleId) {
        /******/

        /******/
        // Check if module is in cache

        /******/
        if (installedModules[moduleId]) {
          /******/
          return installedModules[moduleId].exports;
          /******/
        }
        /******/
        // Create a new module (and put it into the cache)

        /******/


        var module = installedModules[moduleId] = {
          /******/
          i: moduleId,

          /******/
          l: false,

          /******/
          exports: {}
          /******/

        };
        /******/

        /******/
        // Execute the module function

        /******/

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/

        /******/
        // Flag the module as loaded

        /******/

        module.l = true;
        /******/

        /******/
        // Return the exports of the module

        /******/

        return module.exports;
        /******/
      }
      /******/

      /******/

      /******/
      // expose the modules object (__webpack_modules__)

      /******/


      __webpack_require__.m = modules;
      /******/

      /******/
      // expose the module cache

      /******/

      __webpack_require__.c = installedModules;
      /******/

      /******/
      // define getter function for harmony exports

      /******/

      __webpack_require__.d = function (exports, name, getter) {
        /******/
        if (!__webpack_require__.o(exports, name)) {
          /******/
          Object.defineProperty(exports, name, {
            enumerable: true,
            get: getter
          });
          /******/
        }
        /******/

      };
      /******/

      /******/
      // define __esModule on exports

      /******/


      __webpack_require__.r = function (exports) {
        /******/
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          /******/
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
          });
          /******/
        }
        /******/


        Object.defineProperty(exports, '__esModule', {
          value: true
        });
        /******/
      };
      /******/

      /******/
      // create a fake namespace object

      /******/
      // mode & 1: value is a module id, require it

      /******/
      // mode & 2: merge all properties of value into the ns

      /******/
      // mode & 4: return value when already ns object

      /******/
      // mode & 8|1: behave like require

      /******/


      __webpack_require__.t = function (value, mode) {
        /******/
        if (mode & 1) value = __webpack_require__(value);
        /******/

        if (mode & 8) return value;
        /******/

        if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value;
        /******/

        var ns = Object.create(null);
        /******/

        __webpack_require__.r(ns);
        /******/


        Object.defineProperty(ns, 'default', {
          enumerable: true,
          value: value
        });
        /******/

        if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) {
          return value[key];
        }.bind(null, key));
        /******/

        return ns;
        /******/
      };
      /******/

      /******/
      // getDefaultExport function for compatibility with non-harmony modules

      /******/


      __webpack_require__.n = function (module) {
        /******/
        var getter = module && module.__esModule ?
        /******/
        function getDefault() {
          return module['default'];
        } :
        /******/
        function getModuleExports() {
          return module;
        };
        /******/

        __webpack_require__.d(getter, 'a', getter);
        /******/


        return getter;
        /******/
      };
      /******/

      /******/
      // Object.prototype.hasOwnProperty.call

      /******/


      __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/

      /******/
      // __webpack_public_path__

      /******/


      __webpack_require__.p = "";
      /******/

      /******/

      /******/
      // Load entry module and return exports

      /******/

      return __webpack_require__(__webpack_require__.s = "./modules/quill-autoformat/src/quill-autoformat.js");
      /******/
    }(
    /************************************************************************/

    /******/
    {
      /***/
      "./modules/quill-autoformat/src/formats/hashtag.js":
      /*!*********************************************************!*\
        !*** ./modules/quill-autoformat/src/formats/hashtag.js ***!
        \*********************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Hashtag; });\n/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/get */ \"./node_modules/@babel/runtime/helpers/esm/get.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nvar Embed = quill__WEBPACK_IMPORTED_MODULE_6___default.a[\"import\"]('blots/embed');\n\nvar Hashtag =\n/*#__PURE__*/\nfunction (_Embed) {\n  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(Hashtag, _Embed);\n\n  function Hashtag() {\n    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this, Hashtag);\n\n    return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(this, Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Hashtag).apply(this, arguments));\n  }\n\n  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(Hashtag, [{\n    key: \"format\",\n    value: function format(name, value) {\n      this.domNode.setAttribute('href', this.BASE_URL + value);\n    }\n  }], [{\n    key: \"create\",\n    value: function create(value) {\n      var node = Object(_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Hashtag), \"create\", this).call(this, value);\n\n      node.setAttribute('href', \"\".concat(window.location.origin, \"/tags/\").concat(value));\n      node.setAttribute('spellcheck', false);\n      node.textContent = \"#\" + value;\n      return node;\n    }\n  }, {\n    key: \"formats\",\n    value: function formats(domNode) {\n      return domNode.getAttribute('href').substr(this.BASE_URL.length);\n    }\n  }, {\n    key: \"value\",\n    value: function value(domNode) {\n      return domNode.textContent.substr(1);\n    }\n  }]);\n\n  return Hashtag;\n}(Embed);\n\nHashtag.blotName = 'hashtag';\nHashtag.className = 'ql-hashtag';\nHashtag.tagName = 'A';\nHashtag.BASE_URL = '#';\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/formats/hashtag.js?");
        /***/
      },

      /***/
      "./modules/quill-autoformat/src/formats/mention.js":
      /*!*********************************************************!*\
        !*** ./modules/quill-autoformat/src/formats/mention.js ***!
        \*********************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/get */ \"./node_modules/@babel/runtime/helpers/esm/get.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nvar Embed = quill__WEBPACK_IMPORTED_MODULE_6___default.a[\"import\"]('blots/embed');\n\nvar Mention =\n/*#__PURE__*/\nfunction (_Embed) {\n  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(Mention, _Embed);\n\n  function Mention() {\n    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this, Mention);\n\n    return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(this, Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Mention).apply(this, arguments));\n  }\n\n  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(Mention, null, [{\n    key: \"create\",\n    value: function create(value) {\n      var node = Object(_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Mention), \"create\", this).call(this, value);\n\n      node.setAttribute('title', value);\n      node.setAttribute('href', this.BASE_URL + value);\n      node.textContent = '@' + value;\n      return node;\n    }\n  }, {\n    key: \"value\",\n    value: function value(domNode) {\n      return domNode.textContent.substr(1);\n    }\n  }]);\n\n  return Mention;\n}(Embed);\n\nMention.blotName = 'mention';\nMention.className = 'ql-mention';\nMention.tagName = 'A';\nMention.BASE_URL = '/';\n/* harmony default export */ __webpack_exports__[\"default\"] = (Mention);\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/formats/mention.js?");
        /***/
      },

      /***/
      "./modules/quill-autoformat/src/modules/autoformat.js":
      /*!************************************************************!*\
        !*** ./modules/quill-autoformat/src/modules/autoformat.js ***!
        \************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Autoformat; });\n/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ \"./node_modules/@babel/runtime/helpers/esm/slicedToArray.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ \"./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_7__);\n\n\n\n\n\n\n\n\nvar Module = quill__WEBPACK_IMPORTED_MODULE_7___default.a[\"import\"]('core/module');\nvar Delta = quill__WEBPACK_IMPORTED_MODULE_7___default.a[\"import\"]('delta'); // const { Attributor, Scope } = Quill.import('parchment')\n// Binds autoformat transforms to typing and pasting\n\nvar Autoformat =\n/*#__PURE__*/\nfunction (_Module) {\n  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(Autoformat, _Module);\n\n  function Autoformat(quill, options) {\n    var _this;\n\n    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(this, Autoformat);\n\n    _this = Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this, Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(Autoformat).call(this, quill, options));\n    _this.transforms = options;\n\n    _this.registerTypeListener();\n\n    _this.registerPasteListener();\n\n    return _this;\n  }\n\n  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Autoformat, [{\n    key: \"registerPasteListener\",\n    value: function registerPasteListener() {\n      var _this2 = this;\n\n      var _loop = function _loop(name) {\n        var transform = _this2.transforms[name];\n\n        _this2.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {\n          if (typeof node.data !== 'string') {\n            return;\n          }\n\n          delta.ops.forEach(function (op, index, deltaOps) {\n            // Find insert string ops\n            if (typeof op.insert === 'string') {\n              var changeDelta = makeTransformedDelta(transform, op.insert);\n              var composedDelta = new Delta([op]).compose(changeDelta); // Replace the current op with transformed ops\n\n              deltaOps.splice.apply(deltaOps, [index, 1].concat(Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(composedDelta.ops)));\n            }\n          });\n          return delta;\n        });\n      };\n\n      for (var name in this.transforms) {\n        _loop(name);\n      }\n    }\n  }, {\n    key: \"registerTypeListener\",\n    value: function registerTypeListener() {\n      var _this3 = this;\n\n      this.quill.keyboard.addBinding({\n        key: 38,\n        // Arrow Up\n        collapsed: true,\n        format: ['autoformat-helper']\n      }, this.forwardKeyboardUp.bind(this));\n      this.quill.keyboard.addBinding({\n        key: 40,\n        // Arrow Down\n        collapsed: true,\n        format: ['autoformat-helper']\n      }, this.forwardKeyboardDown.bind(this));\n      this.quill.on(quill__WEBPACK_IMPORTED_MODULE_7___default.a.events.TEXT_CHANGE, function (delta, oldDelta, source) {\n        var ops = delta.ops;\n\n        if (source !== 'user' || !ops || ops.length < 1) {\n          return;\n        } // Check last insert\n\n\n        var lastOpIndex = ops.length - 1;\n        var lastOp = ops[lastOpIndex];\n\n        while (!lastOp.insert && lastOpIndex > 0) {\n          lastOpIndex--;\n          lastOp = ops[lastOpIndex];\n        }\n\n        if (!lastOp.insert || typeof lastOp.insert !== 'string') {\n          return;\n        }\n\n        var isEnter = lastOp.insert === '\\n'; // Get selection\n\n        var sel = _this3.quill.getSelection();\n\n        if (!sel) {\n          return;\n        }\n\n        var endSelIndex = _this3.quill.getLength() - sel.index - (isEnter ? 1 : 0); // Get leaf\n\n        var checkIndex = sel.index;\n\n        var _this3$quill$getLeaf = _this3.quill.getLeaf(checkIndex),\n            _this3$quill$getLeaf2 = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(_this3$quill$getLeaf, 1),\n            leaf = _this3$quill$getLeaf2[0];\n\n        if (!leaf || !leaf.text) {\n          return;\n        }\n\n        var leafIndex = leaf.offset(leaf.scroll);\n        var leafSelIndex = checkIndex - leafIndex;\n        var transformed = false; // Check transforms\n\n        for (var name in _this3.transforms) {\n          var transform = _this3.transforms[name]; // Check helper trigger\n\n          if (transform.helper && transform.helper.trigger) {\n            if (lastOp.insert.match(transform.helper.trigger)) {\n              // TODO: check leaf/atindex instead\n              _this3.quill.formatText(checkIndex, 1, 'autoformat-helper', name, quill__WEBPACK_IMPORTED_MODULE_7___default.a.sources.API);\n\n              _this3.openHelper(transform, checkIndex);\n\n              continue;\n            }\n          } // Check transform trigger\n\n\n          if (lastOp.insert.match(transform.trigger || /./)) {\n            _this3.closeHelper(transform);\n\n            var _ops = new Delta().retain(leafIndex);\n\n            var transformOps = makeTransformedDelta(transform, leaf.text, leafSelIndex);\n\n            if (transformOps) {\n              _ops = _ops.concat(transformOps);\n            }\n\n            _this3.quill.updateContents(_ops, 'api');\n\n            transformed = true;\n          }\n        } // Restore cursor position\n        // if(transformed) {\n        //   setTimeout(() => {\n        //     const quillLength = this.quill.getLength()\n        //     console.log({\n        //       quillLength,\n        //       endSelIndex,\n        //     })\n        //     this.quill.setSelection(quillLength - endSelIndex, 'api')\n        //   }, 0);\n        // }\n\n      });\n    }\n  }, {\n    key: \"forwardKeyboard\",\n    value: function forwardKeyboard(range, context) {\n      if (this.currentHelper && this.currentHelper.container) {\n        var target = this.currentHelper.container.querySelector('.dropdown-menu');\n        console.log('keyboard', target, context.event);\n        target.dispatchEvent(context.event);\n      }\n    }\n  }, {\n    key: \"forwardKeyboardUp\",\n    value: function forwardKeyboardUp(range, context) {\n      var e = new KeyboardEvent('keydown', {\n        key: 'ArrowUp',\n        keyCode: 38,\n        which: 38,\n        bubbles: true,\n        cancelable: true\n      });\n      context.event = e;\n      this.forwardKeyboard(range, context);\n    }\n  }, {\n    key: \"forwardKeyboardDown\",\n    value: function forwardKeyboardDown(range, context) {\n      var e = new KeyboardEvent('keydown', {\n        key: 'ArrowDown',\n        keyCode: 40,\n        which: 40,\n        bubbles: true,\n        cancelable: true\n      });\n      context.event = e;\n      this.forwardKeyboard(range, context);\n    }\n  }, {\n    key: \"openHelper\",\n    value: function openHelper(transform, index) {\n      if (transform.helper) {\n        this.currentHelper = transform.helper;\n\n        if (typeof transform.helper.open === 'function') {\n          console.log('openHelper', index, this.quill.getFormat(index));\n          var pos = this.quill.getBounds(index);\n          var helperNode = this.quill.addContainer('ql-helper');\n          helperNode.style.position = 'absolute';\n          helperNode.style.top = pos.top + 'px';\n          helperNode.style.left = pos.left + 'px';\n          helperNode.style.width = pos.width + 'px';\n          helperNode.style.height = pos.height + 'px';\n          console.log('openHelper', pos, helperNode);\n          transform.helper.container = helperNode;\n          transform.helper.open(helperNode);\n        }\n      }\n    }\n  }, {\n    key: \"closeHelper\",\n    value: function closeHelper(transform) {\n      if (transform.helper) {\n        if (typeof transform.helper.close === 'function') {\n          transform.helper.close(transform.helper.container);\n        }\n      }\n    }\n  }]);\n\n  return Autoformat;\n}(Module);\n\nfunction getFormat(transform, match) {\n  var format = {};\n\n  if (typeof transform.format === 'string') {\n    format[transform.format] = match;\n  } else if (typeof transform.format === 'object') {\n    format = transform.format;\n  }\n\n  return format;\n}\n\nfunction transformMatch(transform, match) {\n  var find = new RegExp(transform.extract || transform.find);\n  return transform.transform ? match.replace(find, transform.transform) : match;\n}\n\nfunction applyExtract(transform, match) {\n  // Extract\n  if (transform.extract) {\n    var extract = new RegExp(transform.extract);\n    var extractMatch = extract.exec(match[0]);\n\n    if (!extractMatch || !extractMatch.length) {\n      return match;\n    }\n\n    extractMatch.index += match.index;\n    return extractMatch;\n  }\n\n  return match;\n}\n\nfunction makeTransformedDelta(transform, text, atIndex) {\n  if (!transform.find.global) {\n    transform.find = new RegExp(transform.find, transform.find.flags + 'g');\n  }\n\n  transform.find.lastIndex = 0;\n  var ops = new Delta();\n  var findResult = null;\n  var checkAtIndex = atIndex !== undefined && atIndex !== null;\n\n  if (checkAtIndex) {\n    // find match at index\n    findResult = transform.find.exec(text);\n\n    while (findResult && findResult.length && findResult.index < atIndex) {\n      if (findResult.index < atIndex && findResult.index + findResult[0].length + 1 >= atIndex) {\n        ops = ops.concat(transformedMatchOps(transform, findResult).ops);\n        break;\n      } else {\n        findResult = transform.find.exec(text);\n      }\n    }\n  } else {\n    // find all matches\n    while ((findResult = transform.find.exec(text)) !== null) {\n      var transformedMatch = transformedMatchOps(transform, findResult);\n      ops = ops.concat(transformedMatch.ops);\n      text = text.substr(transformedMatch.rightIndex);\n      transform.find.lastIndex = 0;\n    }\n  }\n\n  return ops;\n}\n\nfunction transformedMatchOps(transform, result) {\n  result = applyExtract(transform, result);\n  var resultIndex = result.index;\n  var transformedMatch = transformMatch(transform, result[0]);\n  var insert = transformedMatch;\n\n  if (transform.insert) {\n    insert = {};\n    insert[transform.insert] = transformedMatch;\n  }\n\n  var format = getFormat(transform, transformedMatch);\n  var ops = new Delta();\n  ops.retain(resultIndex)[\"delete\"](result[0].length).insert(insert, format);\n  var rightIndex = resultIndex + result[0].length;\n  return {\n    ops: ops,\n    rightIndex: rightIndex\n  };\n} // TRANSFORM {\n//   trigger:     RegExp for matching text input characters to trigger the match. Defaults to /./ which is matching any character\n//   find:        Global RegExp to search for in the text\n//   extract:     Additional RegExp to finetune and override the found text match\n//   transform:   String or function passed to String.replace() to rewrite find/extract results\n//   insert:      Insert name string or embed insert object.\n//   format:      Format name string or attributes object.\n// }\n// Reference:\n// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions\n// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace\n// https://github.com/quilljs/delta/#insert\n\n\nAutoformat.DEFAULTS = {\n  hashtag: {\n    trigger: /[\\s.,;:!?]/,\n    find: /(?:^|\\s)#[^\\s.,;:!?]+/i,\n    extract: /#([^\\s.,;:!?]+)/i,\n    transform: '$1',\n    // transform: function(value, raw) {\n    //     return value\n    // },\n    insert: 'hashtag' // helper: {\n    //   trigger: /(?:^|\\s)#/,\n    //   open: function(target) {\n    //     console.log(\"hashtag search\", target)\n    //   },\n    //   select: function(target, callback) {\n    //     callback()\n    //   },\n    //   close: function(target) {\n    //     console.log(\"hashtag search canceled\")\n    //     if (target) {\n    //       target.innerHTML = \"\";\n    //     }\n    //   }\n    // }\n\n  } // mention: {\n  //   trigger: /[\\s.,;:!?]/,\n  //   find: /(?:^|\\s)@[^\\s.,;:!?]+/i,\n  //   extract: /@([^\\s.,;:!?]+)/i,\n  //   transform: '$1',\n  //   insert: 'mention'\n  // },\n  // link: {\n  //   trigger: /[\\s]/,\n  //   find: /https?:\\/\\/[\\S]+|(www\\.[\\S]+)/gi,\n  //   transform: function (value, noProtocol) {\n  //     return noProtocol ? \"http://\" + value : value;\n  //   },\n  //   format: 'link'\n  // }\n\n}; // const AutoformatHelperAttribute = new Attributor('autoformat-helper', 'data-helper', {\n//     scope: Scope.INLINE,\n// })\n\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/modules/autoformat.js?");
        /***/
      },

      /***/
      "./modules/quill-autoformat/src/quill-autoformat.js":
      /*!**********************************************************!*\
        !*** ./modules/quill-autoformat/src/quill-autoformat.js ***!
        \**********************************************************/

      /*! exports provided: default, Hashtag, Mention */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! quill */ \"quill\");\n/* harmony import */ var quill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(quill__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formats/hashtag */ \"./modules/quill-autoformat/src/formats/hashtag.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Hashtag\", function() { return _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n/* harmony import */ var _formats_mention__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./formats/mention */ \"./modules/quill-autoformat/src/formats/mention.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Mention\", function() { return _formats_mention__WEBPACK_IMPORTED_MODULE_2__[\"default\"]; });\n\n/* harmony import */ var _modules_autoformat__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/autoformat */ \"./modules/quill-autoformat/src/modules/autoformat.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _modules_autoformat__WEBPACK_IMPORTED_MODULE_3__[\"default\"]; });\n\n\n\n\n\n\nif (quill__WEBPACK_IMPORTED_MODULE_0___default.a.version && parseInt(quill__WEBPACK_IMPORTED_MODULE_0___default.a.version[0]) < 2) {\n  console.warn(\"quill-autoformat requires Quill 2.0 or higher to work properly\");\n}\n\nquill__WEBPACK_IMPORTED_MODULE_0___default.a.register({\n  'modules/autoformat': _modules_autoformat__WEBPACK_IMPORTED_MODULE_3__[\"default\"],\n  'formats/hashtag': _formats_hashtag__WEBPACK_IMPORTED_MODULE_1__[\"default\"] // 'formats/mention': Mention,\n  // 'formats/autoformat-helper': AutoformatHelperAttribute\n\n});\n\n\n//# sourceURL=webpack://QuillAutoformat/./modules/quill-autoformat/src/quill-autoformat.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
      /*!*******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
        \*******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _arrayWithHoles; });\nfunction _arrayWithHoles(arr) {\n  if (Array.isArray(arr)) return arr;\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
      /*!**********************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
        \**********************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _arrayWithoutHoles; });\nfunction _arrayWithoutHoles(arr) {\n  if (Array.isArray(arr)) {\n    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {\n      arr2[i] = arr[i];\n    }\n\n    return arr2;\n  }\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
      /*!**************************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
        \**************************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _assertThisInitialized; });\nfunction _assertThisInitialized(self) {\n  if (self === void 0) {\n    throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n  }\n\n  return self;\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
      /*!*******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
        \*******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _classCallCheck; });\nfunction _classCallCheck(instance, Constructor) {\n  if (!(instance instanceof Constructor)) {\n    throw new TypeError(\"Cannot call a class as a function\");\n  }\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/classCallCheck.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/createClass.js":
      /*!****************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
        \****************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _createClass; });\nfunction _defineProperties(target, props) {\n  for (var i = 0; i < props.length; i++) {\n    var descriptor = props[i];\n    descriptor.enumerable = descriptor.enumerable || false;\n    descriptor.configurable = true;\n    if (\"value\" in descriptor) descriptor.writable = true;\n    Object.defineProperty(target, descriptor.key, descriptor);\n  }\n}\n\nfunction _createClass(Constructor, protoProps, staticProps) {\n  if (protoProps) _defineProperties(Constructor.prototype, protoProps);\n  if (staticProps) _defineProperties(Constructor, staticProps);\n  return Constructor;\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/createClass.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/get.js":
      /*!********************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/get.js ***!
        \********************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _get; });\n/* harmony import */ var _getPrototypeOf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var _superPropBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./superPropBase */ \"./node_modules/@babel/runtime/helpers/esm/superPropBase.js\");\n\n\nfunction _get(target, property, receiver) {\n  if (typeof Reflect !== \"undefined\" && Reflect.get) {\n    _get = Reflect.get;\n  } else {\n    _get = function _get(target, property, receiver) {\n      var base = Object(_superPropBase__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(target, property);\n      if (!base) return;\n      var desc = Object.getOwnPropertyDescriptor(base, property);\n\n      if (desc.get) {\n        return desc.get.call(receiver);\n      }\n\n      return desc.value;\n    };\n  }\n\n  return _get(target, property, receiver || target);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/get.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
      /*!*******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
        \*******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _getPrototypeOf; });\nfunction _getPrototypeOf(o) {\n  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {\n    return o.__proto__ || Object.getPrototypeOf(o);\n  };\n  return _getPrototypeOf(o);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/inherits.js":
      /*!*************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
        \*************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _inherits; });\n/* harmony import */ var _setPrototypeOf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js\");\n\nfunction _inherits(subClass, superClass) {\n  if (typeof superClass !== \"function\" && superClass !== null) {\n    throw new TypeError(\"Super expression must either be null or a function\");\n  }\n\n  subClass.prototype = Object.create(superClass && superClass.prototype, {\n    constructor: {\n      value: subClass,\n      writable: true,\n      configurable: true\n    }\n  });\n  if (superClass) Object(_setPrototypeOf__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(subClass, superClass);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/inherits.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
      /*!********************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
        \********************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _iterableToArray; });\nfunction _iterableToArray(iter) {\n  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/iterableToArray.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
      /*!*************************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
        \*************************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _iterableToArrayLimit; });\nfunction _iterableToArrayLimit(arr, i) {\n  var _arr = [];\n  var _n = true;\n  var _d = false;\n  var _e = undefined;\n\n  try {\n    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {\n      _arr.push(_s.value);\n\n      if (i && _arr.length === i) break;\n    }\n  } catch (err) {\n    _d = true;\n    _e = err;\n  } finally {\n    try {\n      if (!_n && _i[\"return\"] != null) _i[\"return\"]();\n    } finally {\n      if (_d) throw _e;\n    }\n  }\n\n  return _arr;\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
      /*!********************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
        \********************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _nonIterableRest; });\nfunction _nonIterableRest() {\n  throw new TypeError(\"Invalid attempt to destructure non-iterable instance\");\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
      /*!**********************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
        \**********************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _nonIterableSpread; });\nfunction _nonIterableSpread() {\n  throw new TypeError(\"Invalid attempt to spread non-iterable instance\");\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
      /*!******************************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
        \******************************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _possibleConstructorReturn; });\n/* harmony import */ var _helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../helpers/esm/typeof */ \"./node_modules/@babel/runtime/helpers/esm/typeof.js\");\n/* harmony import */ var _assertThisInitialized__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized */ \"./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js\");\n\n\nfunction _possibleConstructorReturn(self, call) {\n  if (call && (Object(_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(call) === \"object\" || typeof call === \"function\")) {\n    return call;\n  }\n\n  return Object(_assertThisInitialized__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(self);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
      /*!*******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
        \*******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _setPrototypeOf; });\nfunction _setPrototypeOf(o, p) {\n  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {\n    o.__proto__ = p;\n    return o;\n  };\n\n  return _setPrototypeOf(o, p);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
      /*!******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
        \******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _slicedToArray; });\n/* harmony import */ var _arrayWithHoles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles */ \"./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js\");\n/* harmony import */ var _iterableToArrayLimit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit */ \"./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js\");\n/* harmony import */ var _nonIterableRest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./nonIterableRest */ \"./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js\");\n\n\n\nfunction _slicedToArray(arr, i) {\n  return Object(_arrayWithHoles__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(arr) || Object(_iterableToArrayLimit__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(arr, i) || Object(_nonIterableRest__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/slicedToArray.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/superPropBase.js":
      /*!******************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/superPropBase.js ***!
        \******************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _superPropBase; });\n/* harmony import */ var _getPrototypeOf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n\nfunction _superPropBase(object, property) {\n  while (!Object.prototype.hasOwnProperty.call(object, property)) {\n    object = Object(_getPrototypeOf__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(object);\n    if (object === null) break;\n  }\n\n  return object;\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/superPropBase.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
      /*!**********************************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
        \**********************************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _toConsumableArray; });\n/* harmony import */ var _arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles */ \"./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js\");\n/* harmony import */ var _iterableToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray */ \"./node_modules/@babel/runtime/helpers/esm/iterableToArray.js\");\n/* harmony import */ var _nonIterableSpread__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./nonIterableSpread */ \"./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js\");\n\n\n\nfunction _toConsumableArray(arr) {\n  return Object(_arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(arr) || Object(_iterableToArray__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(arr) || Object(_nonIterableSpread__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js?");
        /***/
      },

      /***/
      "./node_modules/@babel/runtime/helpers/esm/typeof.js":
      /*!***********************************************************!*\
        !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
        \***********************************************************/

      /*! exports provided: default */

      /***/
      function (module, __webpack_exports__, __webpack_require__) {
        "use strict";

        eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return _typeof; });\nfunction _typeof2(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof2(obj); }\n\nfunction _typeof(obj) {\n  if (typeof Symbol === \"function\" && _typeof2(Symbol.iterator) === \"symbol\") {\n    _typeof = function _typeof(obj) {\n      return _typeof2(obj);\n    };\n  } else {\n    _typeof = function _typeof(obj) {\n      return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : _typeof2(obj);\n    };\n  }\n\n  return _typeof(obj);\n}\n\n//# sourceURL=webpack://QuillAutoformat/./node_modules/@babel/runtime/helpers/esm/typeof.js?");
        /***/
      },

      /***/
      "quill":
      /*!**************************************************************************************!*\
        !*** external {"commonjs":"quill","commonjs2":"quill","amd":"quill","root":"Quill"} ***!
        \**************************************************************************************/

      /*! no static exports found */

      /***/
      function (module, exports) {
        eval("module.exports = __WEBPACK_EXTERNAL_MODULE_quill__;\n\n//# sourceURL=webpack://QuillAutoformat/external_%7B%22commonjs%22:%22quill%22,%22commonjs2%22:%22quill%22,%22amd%22:%22quill%22,%22root%22:%22Quill%22%7D?");
        /***/
      }
      /******/

    })
  );
});

/***/ })

};;