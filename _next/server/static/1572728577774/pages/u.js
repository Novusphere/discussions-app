module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
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
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("jYWu");


/***/ }),

/***/ "3Pfn":
/***/ (function(module, exports) {

module.exports = require("aes-js");

/***/ }),

/***/ "4vsW":
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),

/***/ "65ip":
/***/ (function(module, exports) {

module.exports = require("react-tabs");

/***/ }),

/***/ "6MBa":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isDeleted */
/* unused harmony export isRemoved */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RedditService; });
/* harmony import */ var _post__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("sclD");
// https://www.reddit.com/prefs/apps
// https://github.com/JubbeArt/removeddit/blob/master/src/api/reddit/auth.js
// https://api.pushshift.io/reddit/search/comment?sort=asc&link_id=....&limit=10000
// https://api.pushshift.io/reddit/search/submission?ids=....
const fetch = __webpack_require__("4vsW");

 //import { AttachmentType, AttachmentDisplay, Attachment } from "../attachment";

let clientId = 'Gu4d7t1AglWJVg';
let token = undefined;

const toBase36 = number => parseInt(number, 10).toString(36);

const toBase10 = numberString => parseInt(numberString, 36); // Reddits way of indicating that something is deleted (the '\\' is for Reddit and the other is for pushshift)


const isDeleted = textBody => textBody === '\\[deleted\\]' || textBody === '[deleted]'; // Reddits way of indicating that something is deleted

const isRemoved = textBody => textBody === '\\[removed\\]' || textBody === '[removed]';
class RedditService {
  redditDataToPost(data) {
    let p = new _post__WEBPACK_IMPORTED_MODULE_0__[/* Post */ "a"]('reddit');
    p.id = toBase10(data.id);
    p.transaction = data.id;
    p.uuid = 'reddit-' + data.id;

    if (data.parent_id) {
      p.parentUuid = 'reddit-' + data.parent_id.substring(3);
    }

    p.poster = data.author;
    p.title = data.title;
    p.content = data.selftext || data.body;
    p.createdAt = new Date(data.created_utc * 1000);
    p.upvotes = data.ups;
    return p;
  }

  async getThread(owner, subreddit, threadId) {
    console.log(subreddit + ' ' + threadId);
    let posts = [];
    let auth = await this.getAuth();
    let response = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${threadId}/_/`, auth);
    let json = await response.json();
    posts.push(this.redditDataToPost(json[0].data.children[0].data));
    const replies = [json[1].data.children];

    while (replies.length > 0) {
      const children = replies.shift();

      for (let i = 0; i < children.length; i++) {
        const child = children[i].data;
        posts.push(this.redditDataToPost(child));

        if (child.replies) {
          replies.unshift(child.replies.data.children);
        }
      }
    }

    for (let i = 0; i < posts.length; i++) {
      posts[i].sub = owner.sub;
      posts[i].threadUuid = owner.threadUuid;
    }

    return posts;
  }

  async getThreadPushShift(subreddit, threadId) {
    let post = await this.getPost(subreddit, threadId);

    if (isDeleted(post.selftext) || isRemoved(post.selftext)) {
      let removedPost = await this.getPostPushShift(threadId);

      if (isRemoved(post.selftext)) {
        removedPost.removed = true;
      } else {
        removedPost.deleted = true;
      }
    } // Get comment ids from pushshift


    let pushshiftComments = await this.getCommentsPushShift(threadId); // Extract ids from pushshift response

    const ids = pushshiftComments.map(comment => comment.id); // Get all the comments from reddit

    let redditComments = await this.getComments(ids); // Temporary lookup for updating score

    const redditCommentLookup = {};
    redditComments.forEach(comment => {
      redditCommentLookup[comment.id] = comment;
    }); // Replace pushshift score with reddit (its usually more accurate)

    pushshiftComments.forEach(comment => {
      const redditComment = redditCommentLookup[comment.id];

      if (redditComment !== undefined) {
        comment.score = redditComment.score;
      }
    });
    const removed = [];
    const deleted = []; // Check what as removed / deleted according to reddit

    redditComments.forEach(comment => {
      if (isRemoved(comment.body)) {
        removed.push(comment.id);
      } else if (isDeleted(comment.body)) {
        deleted.push(comment.id);
      }
    });
    return {
      comments: pushshiftComments,
      removed: removed,
      deleted: deleted
    };
  }

  async getAuth() {
    let token = await this.getToken();
    return {
      headers: {
        Authorization: `bearer ${token}`
      }
    };
  }

  async getToken() {
    if (token) {
      return token;
    } // Headers for getting reddit api token


    const tokenInit = {
      headers: {
        Authorization: `Basic ${window.btoa(`${clientId}:`)}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      method: 'POST',
      body: `grant_type=${encodeURIComponent('https://oauth.reddit.com/grants/installed_client')}&device_id=DO_NOT_TRACK_THIS_DEVICE`
    };
    let response = await fetch('https://www.reddit.com/api/v1/access_token', tokenInit);
    let json = await response.json();
    token = json.access_token;
    return token || '';
  }

  async getPost(subreddit, threadId) {
    let auth = await this.getAuth();
    let response = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${threadId}/_/`, auth);
    let json = await response.json(); // let post = json[0].data.children[0].data;

    return json;
  }

  async getPostPushShift(threadId) {
    const elasticQuery = {
      query: {
        term: {
          id: toBase10(threadId)
        }
      }
    };
    let response = await fetch('https://elastic.pushshift.io/rs/submissions/_search?source=' + JSON.stringify(elasticQuery));
    let json = await response.json();
    let post = json.hits.hits[0]._source;
    post.id = toBase36(post.id);
    return post;
  }

  async getComments(commentIds) {
    let auth = await this.getAuth();
    let promises = [];

    for (let i = 0; i < commentIds.length; i += 100) {
      let ids = commentIds.slice(i, i + 100);
      promises.push(new Promise(async resolve => {
        let response = await fetch(`https://oauth.reddit.com/api/info?id=${ids.map(id => `t1_${id}`).join()}`, auth);
        let json = await response.json();
        let commentsData = json.data.children;
        return resolve(commentsData.map(commentData => commentData.data));
      }));
    }

    return (await Promise.all(promises)).reduce((a, v) => a.concat(v), []);
  }

  async getCommentsPushShift(threadId) {
    const elasticQuery = {
      query: {
        match: {
          link_id: toBase10(threadId)
        }
      },
      size: 20000,
      _source: ['author', 'body', 'created_utc', 'parent_id', 'score', 'subreddit', 'link_id']
    };
    let response = await fetch('https://elastic.pushshift.io/rc/comments/_search?source=' + JSON.stringify(elasticQuery));
    let json = await response.json();
    const comments = json.hits.hits;
    return comments.map(comment => {
      comment._source.id = toBase36(comment._id);
      comment._source.link_id = toBase36(comment._source.link_id); // Missing parent id === direct reply to thread

      if (!comment._source.parent_id) {
        comment._source.parent_id = threadId;
      } else {
        comment._source.parent_id = toBase36(comment._source.parent_id);
      }

      return comment._source;
    });
  }

}

/***/ }),

/***/ "DNEE":
/***/ (function(module, exports) {

module.exports = require("bip39");

/***/ }),

/***/ "KMQM":
/***/ (function(module, exports) {

module.exports = require("eosjs-ecc");

/***/ }),

/***/ "Kl7Q":
/***/ (function(module, exports) {

module.exports = require("eosjs");

/***/ }),

/***/ "No/t":
/***/ (function(module, exports) {

module.exports = require("@fortawesome/free-solid-svg-icons");

/***/ }),

/***/ "QqrO":
/***/ (function(module, exports) {

module.exports = require("eosjs/dist/eosjs-jssig");

/***/ }),

/***/ "SBLk":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./novusphere-js/discussions/service/reddit.ts
var reddit = __webpack_require__("6MBa");

// EXTERNAL MODULE: ./novusphere-js/discussions/post.ts
var discussions_post = __webpack_require__("sclD");

// EXTERNAL MODULE: ./novusphere-js/discussions/thread.ts
var discussions_thread = __webpack_require__("Y/Ji");

// EXTERNAL MODULE: external "bip32"
var external_bip32_ = __webpack_require__("dEbC");

// EXTERNAL MODULE: external "eosjs-ecc"
var external_eosjs_ecc_ = __webpack_require__("KMQM");
var external_eosjs_ecc_default = /*#__PURE__*/__webpack_require__.n(external_eosjs_ecc_);

// EXTERNAL MODULE: external "axios"
var external_axios_ = __webpack_require__("zr5I");
var external_axios_default = /*#__PURE__*/__webpack_require__.n(external_axios_);

// CONCATENATED MODULE: ./novusphere-js/discussions/service/discussions.ts




const aesjs = __webpack_require__("3Pfn"); //const crypto = require('crypto');


const bip39 = __webpack_require__("DNEE");




class discussions_DiscussionsService {
  constructor() {}

  bkCreate() {
    return bip39.generateMnemonic();
  }

  bkIsValid(bk) {
    return bip39.validateMnemonic(bk);
  }
  /*private bkGetBitcoin(node: bip32.BIP32Interface) {
        function hash160(data: Buffer) {
          var hash = crypto.createHash('ripemd160');
          let res = hash.update(data);
          return res.digest();
      }
        return;
  }*/


  aesEncrypt(data, password) {
    var key = aesjs.utils.hex.toBytes(external_eosjs_ecc_default.a.sha256(password));
    var textBytes = aesjs.utils.utf8.toBytes(data);
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);
    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
  }

  aesDecrypt(data, password) {
    var key = aesjs.utils.hex.toBytes(external_eosjs_ecc_default.a.sha256(password));
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesjs.utils.hex.toBytes(data);
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  }

  bkFromStatusJson(statusJson, password) {
    console.log('bkFromStatusJSON un-parsed:', statusJson);
    let status;

    if (statusJson === 'test') {
      status = statusJson;
    } else {
      status = JSON.parse(statusJson);
    }

    console.log('bkFromStatusJSON parsed:', status);
    let bkc = status['bkc'];
    let bk = status['bk'];
    if (!bkc || !bk) throw new Error('No brian key found');
    let test = this.aesDecrypt(bkc, password);
    if (test != 'test') throw new Error('Incorrect brian key pasword');
    return this.aesDecrypt(bk, password);
  }

  async bkToStatusJson(bk, displayName, password, status) {
    if (!status) status = {};
    const keys = await this.bkToKeys(bk);

    for (var k in keys) {
      status[k] = keys[k].pub;
    }

    status['displayName'] = displayName;
    status['bk'] = this.aesEncrypt(bk, password);
    status['bkc'] = this.aesEncrypt('test', password);
    return JSON.stringify(status);
  }

  bkGetEOS(node, n) {
    let child = node.derivePath(`m/80'/0'/0'/${n}`);
    const wif = child.toWIF();
    return {
      priv: wif,
      pub: external_eosjs_ecc_default.a.privateToPublic(wif)
    };
  }

  async bkToKeys(bk) {
    const seed = await bip39.mnemonicToSeed(bk);
    const node = await external_bip32_["fromSeed"](seed);
    const keys = {
      post: null,
      tip: null
    }; //keys['BTC'] = this.bkGetBitcoin(node);

    keys['post'] = this.bkGetEOS(node, 0);
    keys['tip'] = this.bkGetEOS(node, 1);
    return keys;
  }

  async getPostsForSearch(search) {
    const query = await nsdb.search({
      query: {
        $text: {
          $search: search
        }
      },
      sort: {
        createdAt: -1
      },
      account: eos.accountName || ''
    });
    return query.payload.map(o => discussions_post["a" /* Post */].fromDbObject(o));
  }

  async bkRetrieveStatusEOS(account) {
    let result = await eos.api.rpc.get_table_rows({
      code: 'discussionsx',
      scope: 'discussionsx',
      table: 'status',
      lower_bound: account,
      upper_bound: account
    });
    if (result.rows.length == 0) return undefined;
    return result.rows[0].content;
  }

  async bkUpdateStatusEOS(statusJson) {
    try {
      if (eos.auth && eos.auth.accountName) {
        return await eos.transact({
          account: 'discussionsx',
          name: 'status',
          data: {
            account: eos.auth.accountName,
            content: statusJson
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async vote(uuid, value) {
    try {
      if (eos.auth && eos.auth.accountName) {
        return await eos.transact({
          account: 'discussionsx',
          name: 'vote',
          data: {
            voter: eos.auth.accountName,
            uuid: uuid,
            value: value
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async post(p) {
    if (p.chain != 'eos') throw new Error('Unknown chain');
    const tags = new Set();
    [p.sub, ...p.tags].forEach(t => tags.add(t.toLowerCase()));
    const mentions = new Set();
    p.mentions.forEach(u => mentions.add(u));
    const metadata = {};
    if (p.title) metadata.title = p.title;
    if (p.attachment.value) metadata.attachment = p.attachment;

    if (p.pub && p.sig) {
      metadata.pub = p.pub;
      metadata.sig = p.sig;
    }

    metadata.displayName = p.displayName || p.poster;
    metadata.mentions = Array.from(mentions);
    const post = {
      poster: p.poster,
      content: p.content,
      uuid: p.uuid,
      threadUuid: p.threadUuid,
      parentUuid: p.parentUuid,
      tags: Array.from(tags),
      mentions: [],
      metadata: JSON.stringify(metadata),
      transaction: ''
    };

    try {
      if (!p.poster) {
        console.log('no poster found, posting as anon');
        const {
          data
        } = await external_axios_default.a.get(`${nsdb.api}/discussions/post`, {
          params: {
            data: JSON.stringify(post)
          }
        });
        console.log('Class: DiscussionsService, Function: post, Line 219 data: ', data);
        p.transaction = data.transaction;
      } else {
        console.log('poster found, opening Scatter to confirm');
        const transaction = await eos.transact([{
          account: 'discussionsx',
          name: 'post',
          data: post
        }, {
          account: 'discussionsx',
          // self up vote
          name: 'vote',
          data: {
            voter: p.poster,
            uuid: p.uuid,
            value: 1
          }
        }]);
        p.transaction = transaction;
      }

      console.log('transaction set: !', p.transaction);
      p.myVote = 1;
      return p;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getThread(_id) {
    let dId = discussions_post["a" /* Post */].decodeId(_id);
    let sq = await nsdb.search({
      query: {
        createdAt: {
          $gte: dId.timeGte,
          $lte: dId.timeLte
        },
        transaction: {
          $regex: `^${dId.txid32}`
        }
      }
    });
    if (sq.payload.length == 0) return undefined;
    let posts = [];
    let op = discussions_post["a" /* Post */].fromDbObject(sq.payload[0]);
    sq = {
      query: {
        threadUuid: op.threadUuid,
        sub: op.sub
      },
      account: eos.accountName || ''
    };

    do {
      sq = await nsdb.search(sq);
      posts = [...posts, ...sq.payload.map(o => discussions_post["a" /* Post */].fromDbObject(o))];
    } while (sq.cursorId);

    let thread = new discussions_thread["a" /* default */]();
    thread.init(posts);
    thread.normalize();
    return thread;
  }

  async getPostsForSubs(subs) {
    let q = {
      $in: subs.map(sub => sub.toLowerCase())
    };

    if (subs.length == 1 && subs[0] == 'all') {
      q = {
        $nin: []
      }; // filtered subs from all sub
    }

    const query = await nsdb.search({
      query: {
        sub: q,
        parentUuid: '' // top-level only

      },
      sort: {
        createdAt: -1
      },
      account: eos.accountName || ''
    });
    return query.payload.map(o => discussions_post["a" /* Post */].fromDbObject(o));
  }

  async getPostsForTags(tags, cursorId = undefined, count = 0, limit = 20, threadOnly = true) {
    const searchQuery = {
      query: {
        tags: {
          $in: tags.map(tag => tag.toLowerCase())
        }
      },
      sort: {
        createdAt: -1
      },
      account: eos.accountName || '',
      cursorId,
      count,
      limit
    };

    if (threadOnly) {
      searchQuery.query['parentUuid'] = '';
    }

    const query = await nsdb.search(searchQuery);
    let posts = query.payload.map(o => discussions_post["a" /* Post */].fromDbObject(o));
    return {
      posts,
      cursorId: query.cursorId
    };
  }
  /**
   * Returns all the posts in which the user was
   * tagged in (mentions).
   */


  async getPostsForNotifications(postPublicKey, lastCheckedNotifications, cursorId = undefined) {
    try {
      return await nsdb.search({
        query: {
          createdAt: {
            $gte: lastCheckedNotifications
          },
          mentions: {
            $in: [postPublicKey]
          }
        },
        cursorId
      });
    } catch (error) {
      throw error;
    }
  }

}
;
// EXTERNAL MODULE: ./novusphere-js/discussions/attachment.ts
var attachment = __webpack_require__("uM3l");

// CONCATENATED MODULE: ./novusphere-js/discussions/index.ts






// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
var defineProperty = __webpack_require__("rePB");

// EXTERNAL MODULE: external "eosjs"
var external_eosjs_ = __webpack_require__("Kl7Q");

// EXTERNAL MODULE: external "eosjs/dist/eosjs-jssig"
var eosjs_jssig_ = __webpack_require__("QqrO");

// CONCATENATED MODULE: ./novusphere-js/eos/tokens.ts
const fetch = __webpack_require__("4vsW");

async function getTokens() {
  const TOKEN_ENDPOINTS = ["https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json", "https://raw.githubusercontent.com/Novusphere/eos-forum-settings/master/tokens.json"];
  let tokens = [];

  for (let i = 0; i < TOKEN_ENDPOINTS.length; i++) {
    let request = await fetch(TOKEN_ENDPOINTS[i]);
    let json = await request.json();

    for (let key in json) {
      if (key in tokens) {
        Object.assign(tokens[key], json[key]);
      } else {
        tokens[key] = json[key];
      }
    }
  }

  return tokens;
}
async function getAccountTokens(account, tokens) {
  let balances = [];
  let request = await fetch(`https://www.api.bloks.io/account/${account}?type=getAccountTokens`);
  let json = await request.json();

  for (let i = 0; i < json.tokens.length; i++) {
    let token = json.tokens[i];
    let info = tokens.find(t => t.account == token.contract && t.symbol == token.currency);
    if (info) balances.push({
      amount: token.amount,
      token: info
    });
  }

  return balances;
}
// CONCATENATED MODULE: ./novusphere-js/eos/index.ts


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const eos_fetch = __webpack_require__("4vsW");




const DEFAULT_EOS_NETWORK = {
  host: 'eos.greymass.com',
  port: 443,
  protocol: 'https',
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
};
class eos_EOS {
  get accountName() {
    return this.wallet && this.wallet.auth ? this.wallet.auth.accountName : undefined;
  }

  get auth() {
    return this.wallet ? this.wallet.auth : undefined;
  }

  get api() {
    if (this.wallet) return this.wallet.eosApi;
    if (this._api) return this._api;
    const net = DEFAULT_EOS_NETWORK;
    const rpc = new external_eosjs_["JsonRpc"](`${net.protocol}://${net.host}:${net.port}`, {
      fetch: eos_fetch
    });
    const signatureProvider = new eosjs_jssig_["JsSignatureProvider"]([]);
    const api = new external_eosjs_["Api"]({
      rpc,
      signatureProvider,
      chainId: net.chainId,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });
    this._api = api;
    return api;
  }

  constructor() {
    this.accessContext = void 0;
    this.wallet = void 0;
    this.discoveryData = void 0;
    this.tokens = void 0;
    this._api = void 0;
  }

  async init(network) {
    if (false) {}

    this.tokens = await getTokens();
  }

  async tryConnectWallet(selectedProvider) {
    if (!this.accessContext) return;
    const wallet = this.accessContext.initWallet(selectedProvider);
    await wallet.connect();
    if (this.wallet) throw new Error('Already have a wallet present');else if (!wallet.connected) throw new Error('Failed to connect');
    const discoveryData = await wallet.discover({
      pathIndexList: [0]
    }); // TO-DO: ledger

    this.wallet = wallet;
    this.discoveryData = discoveryData;
    console.log('Detected and connected to ' + selectedProvider.meta.name);

    if (discoveryData.keyToAccountMap.length > 0) {
      console.log(discoveryData);
    }
  }

  async detectWallet(attempts = 1) {
    if (!this.accessContext) return false;
    const providers = this.accessContext.getWalletProviders();

    for (let i = 0; i < attempts && !this.wallet; i++) {
      console.log('Wallet detection round ' + i);

      if (navigator.userAgent.toLowerCase().includes('meet.one')) {
        const provider = providers.find(p => p.id == 'meetone_provider');

        if (provider) {
          try {
            await this.tryConnectWallet(provider);
          } catch (ex) {
            console.log('Undetected ' + provider.id);
          }
        }
      } else {
        var promises = providers.map(p => new Promise(async resolve => {
          try {
            await this.tryConnectWallet(p);
          } catch (ex) {
            console.log('Undetected ' + p.id);
          }

          return resolve();
        }));
        await Promise.all(promises);
      }
    }

    return this.wallet;
  }

  async transact(actions) {
    if (!this.wallet) return undefined;
    const auth = this.auth;
    if (!auth) return undefined;

    if (!Array.isArray(actions)) {
      actions = [actions]; // single action
    }

    let transitActions = actions.map(a => _objectSpread({}, a, {
      authorization: [{
        actor: auth.accountName,
        permission: auth.permission
      }]
    }));

    try {
      let tx = await this.wallet.eosApi.transact({
        actions: transitActions
      }, {
        broadcast: true,
        blocksBehind: 3,
        expireSeconds: 180
      });
      return tx ? tx.transaction_id : undefined;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTransaction(txid) {
    if (!this.wallet) return undefined;
    const eos = this.wallet.eosApi;
    const tx = await eos.rpc.history_get_transaction(txid);
    return tx;
  }

  async getToken(account, symbol) {
    if (!this.tokens) return undefined;
    return this.tokens.find(t => t.account == account && t.symbol == symbol);
  }
  /**
   * Fetch a list of suggested users for mentions.
   * @param accountPartial {string} - The partial name of the account
   * @param limit 
   * @returns {string[]}
   */


  async getSuggestAccounts(accountPartial, _limit = 10) {
    let request = await eos_fetch(`https://eos.greymass.com/v1/chain/get_table_by_scope`, {
      method: 'POST',
      body: JSON.stringify({
        "code": "eosio",
        "table": "userres",
        "lower_bound": accountPartial,
        "upper_bound": accountPartial.padEnd(12, 'z'),
        "limit": 5
      })
    });
    let json = await request.json();
    return json.rows.map(d => d.scope);
  }
  /**
   * Returns non-zero balances for a given username.
   * @param account {string} - The name of the account (username)
   * @returns {IAccountBalance[]}
   */


  async getAccountTokens(account) {
    if (!this.tokens) return [];
    return getAccountTokens(account, this.tokens);
  }

  async login(account, permission) {
    if (!this.wallet) return false;
    await this.wallet.login(account, permission);

    if (this.auth) {
      window.dispatchEvent(new Event('eosAccountChange'));
      return true;
    }

    return false;
  }

  async logout() {
    if (!this.wallet) return;
    await this.wallet.logout();

    if (!this.auth) {
      window.dispatchEvent(new Event('eosAccountChange'));
    }
  }

}
// CONCATENATED MODULE: ./novusphere-js/nsdb.ts
const nsdb_fetch = __webpack_require__("4vsW");

const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io';
class NSDB {
  constructor() {
    this.api = void 0;
    this.api = DEFAULT_NSDB_ENDPOINT;
  }

  async init(apiEndpoint) {
    this.api = apiEndpoint;
  }

  async cors(url) {
    const request = await nsdb_fetch(`https://db.novusphere.io/service/cors/?${url}`);
    const result = await request.text();
    return result;
  }

  async search(sq) {
    const qs = `c=${sq.cursorId ? sq.cursorId : ''}&` + `q=${sq.query ? JSON.stringify(sq.query) : ''}&` + `s=${sq.sort ? JSON.stringify(sq.sort) : ''}&` + `u=${sq.account ? sq.account : ''}&` + `lim=${typeof sq.limit !== 'undefined' ? sq.limit : 20}&` + `p=${typeof sq.count !== 'undefined' ? sq.count : 0}`;
    const request = await nsdb_fetch(`${this.api}/discussions/search?${qs}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain'
      }
    });
    const result = await request.json();

    if (result.error) {
      console.log(result);
      throw new Error(result.error);
    }

    sq.cursorId = result.cursorId;
    sq.count = result.count;
    sq.limit = result.limit;
    sq.payload = result.payload;
    return sq;
  }

}
;
// CONCATENATED MODULE: ./novusphere-js/settings.ts


class settings_Settings {
  constructor() {
    this.novusphereEndPoint = void 0;
    this.eosNetwork = void 0;
    this.novusphereEndPoint = DEFAULT_NSDB_ENDPOINT;
    this.eosNetwork = Object.assign({}, DEFAULT_EOS_NETWORK);
  }

  async init() {}

}
// CONCATENATED MODULE: ./novusphere-js/discussions/service/dummy.ts
class DummyService {
  async getNotifications() {
    return {
      "current_page": 1,
      "pages": 1,
      "posts": [{
        "_post": null,
        "_content": "@hellodarknes",
        "score": 0.000009515066762074494,
        "parent": {
          "_post": null,
          "_content": "test",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1558303702,
          "transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "id": 6833888133,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "rexpolonorum",
            "post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "content": "test",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "test",
              "sub": "test",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": "",
                "width": 0,
                "height": 0
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "o_id": 6833888133,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": []
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1558669183,
        "transaction": "0dba68ba74d9ae2a6f2a7e8a5dbb14cb0d90ac52be8ed7fccf7c1f1c0636a832",
        "id": 6902032756,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "eosforumanon",
          "post_uuid": "d326cf1f-e203-4792-a216-cf192aa995a2",
          "content": "@hellodarknes",
          "reply_to_poster": "rexpolonorum",
          "reply_to_post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "test",
            "sub": "test",
            "parent_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "parent_poster": "",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "EOS7PdjtJvSWapkeeTHGk5teouVDVzYKK6niMcLUPK2L3T5CnzizG",
              "sig": "SIG_K1_JyWiDrzjExjALNYeQFJfp99ijucue9RnZgELw4tVS3zZQbCjhMVxGFWZYjqCXEhsYuoAA9qgcDVK3VuKYtSBfqK9VLZEZJ",
              "verified": true
            }
          }
        },
        "o_transaction": "0dba68ba74d9ae2a6f2a7e8a5dbb14cb0d90ac52be8ed7fccf7c1f1c0636a832",
        "o_id": 6902032756,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": []
      }, {
        "_post": null,
        "_content": "@hellodarknes",
        "score": 0.00000951356996309832,
        "parent": {
          "_post": null,
          "_content": "test",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1558303702,
          "transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "id": 6833888133,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "rexpolonorum",
            "post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "content": "test",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "test",
              "sub": "test",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": "",
                "width": 0,
                "height": 0
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "o_id": 6833888133,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": []
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1558668898,
        "transaction": "181e35b7b0088684b435fa38b1ed99933a1ab46accb3acc0473cba72a6e1b664",
        "id": 6901984506,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "eosforumanon",
          "post_uuid": "339c59ea-4968-401e-b15c-f9a7bf6b19ee",
          "content": "@hellodarknes",
          "reply_to_poster": "rexpolonorum",
          "reply_to_post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "test",
            "sub": "test",
            "parent_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "parent_poster": "",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "EOS7PdjtJvSWapkeeTHGk5teouVDVzYKK6niMcLUPK2L3T5CnzizG",
              "sig": "SIG_K1_JyWiDrzjExjALNYeQFJfp99ijucue9RnZgELw4tVS3zZQbCjhMVxGFWZYjqCXEhsYuoAA9qgcDVK3VuKYtSBfqK9VLZEZJ",
              "verified": true
            }
          }
        },
        "o_transaction": "181e35b7b0088684b435fa38b1ed99933a1ab46accb3acc0473cba72a6e1b664",
        "o_id": 6901984506,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": []
      }, {
        "_post": null,
        "_content": "@hellodarknes",
        "score": 0.000009508320933045889,
        "parent": {
          "_post": null,
          "_content": "test",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1558303702,
          "transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "id": 6833888133,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "rexpolonorum",
            "post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "content": "test",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "test",
              "sub": "test",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": "",
                "width": 0,
                "height": 0
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "o_id": 6833888133,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": []
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1558667898,
        "transaction": "7719f6d7dccc2a45183390837553b01707fa0908c5f1979192921e41937092e9",
        "id": 6901788618,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "eosforumanon",
          "post_uuid": "a49bccda-6a24-4b06-9562-08af23a08ff7",
          "content": "@hellodarknes",
          "reply_to_poster": "rexpolonorum",
          "reply_to_post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "test",
            "sub": "test",
            "parent_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "parent_poster": "",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "EOS6X1dXhfPep75be4KVXJ4gz8HB7yVBGhx4SedydYFHXfdRAH11k",
              "sig": "SIG_K1_Juz5dbffCo446w3X8RAmxHzvPy6c5QaE4jzjDQjYoaLmtBGRbhMRjQnPnoAQ7PYT7DqRHXgb1uzPzefxS9UPG4oJ4mecss",
              "verified": true
            }
          }
        },
        "o_transaction": "7719f6d7dccc2a45183390837553b01707fa0908c5f1979192921e41937092e9",
        "o_id": 6901788618,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": []
      }, {
        "_post": null,
        "_content": "@hellodarknes",
        "score": 0.000009507712337173731,
        "parent": {
          "_post": null,
          "_content": "test",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1558303702,
          "transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "id": 6833888133,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "rexpolonorum",
            "post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "content": "test",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "test",
              "sub": "test",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": "",
                "width": 0,
                "height": 0
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "7acb30ff01f82a3f711c4a66e457e66fc44c87553c41b5a3369171e304b25cdb",
          "o_id": 6833888133,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": []
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1558667782,
        "transaction": "d3e9548783023540606348ce33e09dbfdba3aa9cef912cf5f8b99284687ac60f",
        "id": 6901765688,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "eosforumanon",
          "post_uuid": "d5a76b6f-e48b-4578-addf-a1a5987e1d06",
          "content": "@hellodarknes",
          "reply_to_poster": "rexpolonorum",
          "reply_to_post_uuid": "cfc14444-932a-4d91-b771-706b69305557",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "test",
            "sub": "test",
            "parent_uuid": "cfc14444-932a-4d91-b771-706b69305557",
            "parent_poster": "",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "EOS6X1dXhfPep75be4KVXJ4gz8HB7yVBGhx4SedydYFHXfdRAH11k",
              "sig": "SIG_K1_Juz5dbffCo446w3X8RAmxHzvPy6c5QaE4jzjDQjYoaLmtBGRbhMRjQnPnoAQ7PYT7DqRHXgb1uzPzefxS9UPG4oJ4mecss",
              "verified": true
            }
          }
        },
        "o_transaction": "d3e9548783023540606348ce33e09dbfdba3aa9cef912cf5f8b99284687ac60f",
        "o_id": 6901765688,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": []
      }, {
        "_post": null,
        "_content": "@hellodarknes",
        "score": 0.0000094877724284353,
        "parent": {
          "_post": null,
          "_content": "We Are Change speaks about the power of cryptos and how a donation of EOS was sent to a woman and her starving children in Venezuela (May 22, 2019)\nhttps://youtu.be/lKFfJ7GDyoM",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1558659852,
          "transaction": "604e1db6957c919eb2c70e600ab613d5e0791a4b560376d61cd74d124c2fd504",
          "id": 6900250012,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "eosforumanon",
            "post_uuid": "60caaf1a-b983-4be2-bb65-2fea7a568cc0",
            "content": "We Are Change speaks about the power of cryptos and how a donation of EOS was sent to a woman and her starving children in Venezuela (May 22, 2019)\nhttps://youtu.be/lKFfJ7GDyoM",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "How a donation of EOS was sent to a woman and her starving children in Venezuela",
              "sub": "eos",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "https://www.youtube.com/embed/lKFfJ7GDyoM?feature=oembed",
                "type": "url",
                "display": "iframe",
                "width": 480,
                "height": 270,
                "thumbnail": "https://i.ytimg.com/vi/lKFfJ7GDyoM/hqdefault.jpg"
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "HelloWorld",
                "pub": "EOS7wEEJLyPVYtFMuZNcnymgxP9qChizrzdaWJyTcbqv62dq61rVj",
                "sig": "SIG_K1_Kf1ecRN9Mohs5GapXcSbydfrSc8xHQsdTBGki7zaTkbzWvqF1LbgyWSL5TV2qJ7XsUdVHpTUJZFRXgo3aMAy5AsXmJPkEn",
                "verified": true
              }
            }
          },
          "o_transaction": "604e1db6957c919eb2c70e600ab613d5e0791a4b560376d61cd74d124c2fd504",
          "o_id": 6900250012,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": []
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1558663975,
        "transaction": "5a7b44d70f0a97c6c5a31dc61075d04b7bb89648a7a0fe21997eaf8d3b682115",
        "id": 6901030917,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "eosforumanon",
          "post_uuid": "f6bc4a40-3315-4929-bae4-9dca42bc2fb6",
          "content": "@hellodarknes",
          "reply_to_poster": "eosforumanon",
          "reply_to_post_uuid": "60caaf1a-b983-4be2-bb65-2fea7a568cc0",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "How a donation of EOS was sent to a woman and her starving children in Venezuela",
            "sub": "eos",
            "parent_uuid": "60caaf1a-b983-4be2-bb65-2fea7a568cc0",
            "parent_poster": "",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "EOS7PdjtJvSWapkeeTHGk5teouVDVzYKK6niMcLUPK2L3T5CnzizG",
              "sig": "SIG_K1_JyWiDrzjExjALNYeQFJfp99ijucue9RnZgELw4tVS3zZQbCjhMVxGFWZYjqCXEhsYuoAA9qgcDVK3VuKYtSBfqK9VLZEZJ",
              "verified": true
            }
          }
        },
        "o_transaction": "5a7b44d70f0a97c6c5a31dc61075d04b7bb89648a7a0fe21997eaf8d3b682115",
        "o_id": 6901030917,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": []
      }, {
        "_post": null,
        "_content": "Testing @hellodarknes",
        "score": 0.000005919949772800304,
        "parent": {
          "_post": null,
          "_content": "https://t.me/eosgo_news/928",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1557586214,
          "transaction": "E0DD5B8DF34008685EE6145CA8C7B87A91B523543143C48E9139EA638CABE27B",
          "id": 6702467418,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": [],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "bigbluewhale",
            "post_uuid": "58ea54a1-e2ab-4238-90d2-128f7a36748e",
            "content": "https://t.me/eosgo_news/928",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "​Dan's recent hottest messages - 9/10 May, 2019.",
              "sub": "eos",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "https://t.me/eosgo_news/928",
                "type": "url",
                "display": "link",
                "width": 0,
                "height": 0
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "E0DD5B8DF34008685EE6145CA8C7B87A91B523543143C48E9139EA638CABE27B",
          "o_id": 6702467418,
          "o_attachment": {
            "value": "",
            "type": "",
            "display": "",
            "width": 0,
            "height": 0
          },
          "user_icons": ["https://novusphere.io/static/img/logo.svg"]
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1557685566,
        "transaction": "3d048bedc0cdf2b12375941b0eb1cdda604f34601d9fb68798969abfe827f176",
        "id": 6720879775,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": [],
        "tips": [],
        "replies": [],
        "data": {
          "poster": "bigbluewhale",
          "post_uuid": "535b9aa0-ea1c-4908-be01-3caf57c84727",
          "content": "Testing @hellodarknes",
          "reply_to_poster": "bigbluewhale",
          "reply_to_post_uuid": "58ea54a1-e2ab-4238-90d2-128f7a36748e",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "​Dan's recent hottest messages - 9/10 May, 2019.",
            "sub": "eos",
            "parent_uuid": "58ea54a1-e2ab-4238-90d2-128f7a36748e",
            "parent_poster": "bigbluewhale",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "",
              "sig": "",
              "verified": false
            }
          }
        },
        "o_transaction": "3d048bedc0cdf2b12375941b0eb1cdda604f34601d9fb68798969abfe827f176",
        "o_id": 6720879775,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": ["https://novusphere.io/static/img/logo.svg"]
      }, {
        "_post": null,
        "_content": "You pumped about the Dappathon?!! So are we! Let everyone you know about it through the next generation decentralized email service! Visit https://dmail.co/ and use your MAIL tokens today! \n\nWe're also looking for great questions for Kurt to answer during the Endless Dappathon, so if you got any, leave it down below and you can be sure there'll be extra MAIL coming your way!\n\nAlso, send me a hello with your new MAIL token @bigbluewhale!\n\n#tip 100 MAIL @hellodarknes<br>\n#tip 100 MAIL @melvinpearce<br>\n#tip 100 MAIL @thatguyrex2t<br>\n#tip 100 MAIL @gq3timzsgyge<br>\n#tip 100 MAIL @anditrader12<br>\n#tip 100 MAIL @gy3tsojwhage<br>\n#tip 100 MAIL @kikeeosup123<br>\n#tip 100 MAIL @vandresguzmn<br>\n#tip 100 MAIL @eosguardians<br>\n#tip 100 MAIL @ha4dsojwhage<br>\n#tip 100 MAIL @jcmarketing5<br>\n#tip 100 MAIL @chronocrypto<br>\n#tip 100 MAIL @mariana4vzla<br>\n#tip 100 MAIL @gorayii12345<br>\n#tip 100 MAIL @eosrmgcvzla1<br>\n#tip 100 MAIL @gusvzla12345<br>\n#tip 100 MAIL @gqzdmnrvgyge<br>\n#tip 100 MAIL @aleestrabitx<br>\n#tip 100 MAIL @labyrinthine<br>\n#tip 100 MAIL @mervynjadams<br>\n#tip 100 MAIL @josuepalacfn<br>\n#tip 100 MAIL @cryptofried1<br>\n#tip 100 MAIL @juanboho2423<br>\n#tip 100 MAIL @eossandrag12<br>\n#tip 100 MAIL @matucaeos123<br>\n#tip 100 MAIL @krenskistoli<br>\n#tip 100 MAIL @eoslorengame<br>\n#tip 100 MAIL @eugelysmusic<br>\n#tip 100 MAIL @melvamaeos11<br>\n#tip 100 MAIL @eos4gamesetg<br>\n#tip 100 MAIL @angelica1225<br>\n#tip 100 MAIL @eleazarvho22<br>\n#tip 100 MAIL @eliaricardo2<br>\n#tip 100 MAIL @tradingwithp<br>\n#tip 100 MAIL @megaeladio53<br>\n#tip 100 MAIL @abielarcila1<br>\n#tip 100 MAIL @pamegarrio12<br>\n#tip 100 MAIL @niklauseos22<br>\n#tip 100 MAIL @josecarrerag<br>\n#tip 100 MAIL @delibytespfd<br>\n#tip 100 MAIL @gooddeedseos<br>\n#tip 100 MAIL @conceptskip1<br>\n#tip 100 MAIL @erwansyaheos<br>\n#tip 100 MAIL @eosideas4all<br>\n#tip 100 MAIL @zielonykotek<br>\n#tip 100 MAIL @elenisortiza<br>\n#tip 100 MAIL @elenitaeos13<br>\n#tip 100 MAIL @guzdmnjvgene<br>\n#tip 100 MAIL @gyztambzhage<br>\n#tip 100 MAIL @jackiemayue1<br>\n#tip 100 MAIL @elizabeths14<br>\n#tip 100 MAIL @oboluscrypto<br>\n#tip 100 MAIL @diceteamhelp<br>\n#tip 100 MAIL @eosrockygatz<br>\n#tip 100 MAIL @magistrals25<br>\n#tip 100 MAIL @britanyeos14<br>\n#tip 100 MAIL @jeninacrypto<br>\n#tip 100 MAIL @eosmunify123<br>\n#tip 100 MAIL @marinmex1234<br>\n#tip 100 MAIL @xabachixeosx<br>\n#tip 100 MAIL @elemarg253ja<br>\n#tip 100 MAIL @seo51hzathyq<br>\n#tip 100 MAIL @laloretoeos1<br>\n#tip 100 MAIL @gaeljosser34<br>\n#tip 100 MAIL @gq3dmojvgyge<br>\n#tip 100 MAIL @jamezjamezja<br>\n#tip 100 MAIL @eoslovervzla<br>\n#tip 100 MAIL @jengleycori3<br>",
        "score": 0.000003851844505782173,
        "parent": {
          "_post": null,
          "_content": "If you still haven't heard the latest news, then get prepared! \n\n\"Buckle up your seat belts, 'cause this ain't Kansas anymore!\"\n\nOn the 5th of May, Discussions and StakeMine are holding the second Endless Dapp's series Live, where we will be hearing from Dapps around the ecosphere and you will be able to have chances to ask questions and find out what the latest is around the EOSIO Space.\n\nOne of the first projects that will be joining us is Dmail: A blockchain-based email.\n\nKurt Braget the founder of Dmail will be joining us live at the dappathon, to speak about the project's latest development and to answer some of the questions that you might have.\n\nSo without further ado:\n\n![](https://i.postimg.cc/HnK7Y3hz/dmail.jpg)\n\nTelegram: https://t.me/dmailcommunity\n\nWe recommend you to visit their telegram group, to learn more information about the project.\n\nThe event is free of charge, but the number of seats will be limited, so make sure to grab your spot first!\n\nRegister for the event via the link above, by clicking the \"Save my spot\" button! \n\nAnd make sure you follow the [#endlessdappathon](https://eos.discussions.app/tag/endlessdappathon) for the latest news and announcements!\n",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1555869348,
          "transaction": "0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "id": 6352917135,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": ["endlessdappathon"],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "discussionss",
            "post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "content": "If you still haven't heard the latest news, then get prepared! \n\n\"Buckle up your seat belts, 'cause this ain't Kansas anymore!\"\n\nOn the 5th of May, Discussions and StakeMine are holding the second Endless Dapp's series Live, where we will be hearing from Dapps around the ecosphere and you will be able to have chances to ask questions and find out what the latest is around the EOSIO Space.\n\nOne of the first projects that will be joining us is Dmail: A blockchain-based email.\n\nKurt Braget the founder of Dmail will be joining us live at the dappathon, to speak about the project's latest development and to answer some of the questions that you might have.\n\nSo without further ado:\n\nhttps://i.postimg.cc/HnK7Y3hz/dmail.jpg\n\nTelegram: https://t.me/dmailcommunity\n\nWe recommend you to visit their telegram group, to learn more information about the project.\n\nThe event is free of charge, but the number of seats will be limited, so make sure to grab your spot first!\n\nRegister for the event via the link above, by clicking the \"Save my spot\" button! \n\nAnd make sure you follow the [#endlessdappathon](https://eos.discussions.app/tag/endlessdappathon) for the latest news and announcements!\n",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "Dmail will be joining the endless Dappathon! ",
              "sub": "dmail",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "https://www.crowdcast.io/e/endless-dappathon-by-eos?navlinks=false&embed=true",
                "type": "url",
                "display": "iframe",
                "width": 560,
                "height": 315
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "o_id": 6352917135,
          "o_attachment": {
            "value": "https://www.crowdcast.io/e/endless-dappathon-by-eos?navlinks=false&embed=true",
            "type": "url",
            "display": "iframe",
            "width": 0,
            "height": 0
          },
          "user_icons": ["https://novusphere.io/static/img/logo.svg"]
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1556540958,
        "transaction": "a22a695ab940c1cddacd1b984f3405014b36d6c541487c9d8ee54fff831285cd",
        "id": 6497176787,
        "up": 0,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": ["tip"],
        "tips": [{
          "from": "bigbluewhale",
          "to": "hellodarknes",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "melvinpearce",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "thatguyrex2t",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gq3timzsgyge",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "anditrader12",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gy3tsojwhage",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "kikeeosup123",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "vandresguzmn",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eosguardians",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "ha4dsojwhage",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "jcmarketing5",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "chronocrypto",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "mariana4vzla",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gorayii12345",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eosrmgcvzla1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gusvzla12345",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gqzdmnrvgyge",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "aleestrabitx",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "labyrinthine",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "mervynjadams",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "josuepalacfn",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "cryptofried1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "juanboho2423",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eossandrag12",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "matucaeos123",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "krenskistoli",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eoslorengame",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eugelysmusic",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "melvamaeos11",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eos4gamesetg",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "angelica1225",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eleazarvho22",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eliaricardo2",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "tradingwithp",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "megaeladio53",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "abielarcila1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "pamegarrio12",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "niklauseos22",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "josecarrerag",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "delibytespfd",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gooddeedseos",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "conceptskip1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "erwansyaheos",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eosideas4all",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "zielonykotek",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "elenisortiza",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "elenitaeos13",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "guzdmnjvgene",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gyztambzhage",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "jackiemayue1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "elizabeths14",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "oboluscrypto",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "diceteamhelp",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eosrockygatz",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "magistrals25",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "britanyeos14",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "jeninacrypto",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eosmunify123",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "marinmex1234",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "xabachixeosx",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "elemarg253ja",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "seo51hzathyq",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "laloretoeos1",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gaeljosser34",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "gq3dmojvgyge",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "jamezjamezja",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "eoslovervzla",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }, {
          "from": "bigbluewhale",
          "to": "jengleycori3",
          "amount": "100.0000",
          "memo": "tip for 0e966f9a3593fefd34fff58c861ba20adeba7a8412ccb2547387d5e89cacf971",
          "symbol": "MAIL",
          "contract": "d.mail"
        }],
        "replies": [{
          "_id": "5cc6f18e69b00566026fd60c",
          "id": 6497362953,
          "account": "eosio.forum",
          "transaction": "643bca9ccdf63d2001864640535d07be3e81350bd854fa04b8afe8cde5f5f35e",
          "blockId": 55512511,
          "createdAt": 1556541832,
          "name": "post",
          "data": {
            "poster": "matucaeos123",
            "post_uuid": "0da49e18-e995-4d81-86e3-75db178ba66a",
            "content": "thanks",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "dmail",
              "parent_uuid": "b125c8d0-7e1b-4aff-8e59-2286d0b61f64",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43810
        }, {
          "_id": "5cc746ce69b005660270f553",
          "id": 6501819282,
          "account": "eosio.forum",
          "transaction": "867c52e50fa7b192257cbdd038e7c7b1ef69dc2c10acef70733492d8284d2583",
          "blockId": 55556151,
          "createdAt": 1556563657,
          "name": "post",
          "data": {
            "poster": "eosforumanon",
            "post_uuid": "04ac4c9a-a7b3-4ea2-b99a-073c4d790aff",
            "content": "Test. ",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "dmail",
              "parent_uuid": "b125c8d0-7e1b-4aff-8e59-2286d0b61f64",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "reddit": null,
              "anon_id": {
                "name": "",
                "pub": "EOS5sJzZA2fJdo3U5cuXuU5jGCn2NX16w8TnCDyNho18PMpvbcxw7",
                "sig": "SIG_K1_KUtSkcYSGaQMgkxuGHbDDnxuffPJX4ZBXUz5JJMzZxeJJWc5nJxU3yaV2Fc6nVg7pSXXW2LKxov9zqVx4RHTGkjxV3m633"
              }
            }
          },
          "offset": 43939
        }, {
          "_id": "5cc980e369b0056602776c7c",
          "id": 6530121983,
          "account": "eosio.forum",
          "transaction": "a58199a254765a11b371b3c2adbfa4dfd6597511a11e4e697da53acde5350384",
          "blockId": 55847934,
          "createdAt": 1556709592,
          "name": "post",
          "data": {
            "poster": "erwansyaheos",
            "post_uuid": "ce23c3c2-490a-4072-be19-cdb05425d19a",
            "content": "How to use MAIL token sir\nMe have 100MAIL\nThanks a lot sir/mis",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "dmail",
              "parent_uuid": "b125c8d0-7e1b-4aff-8e59-2286d0b61f64",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 44369
        }, {
          "_id": "5cc9d85b69b0056602784ff7",
          "id": 6534915880,
          "account": "eosio.forum",
          "transaction": "f9ce97ac090e342944ca804a3bfaf18a48298f3c2947287feac9a46623d203e0",
          "blockId": 55892678,
          "createdAt": 1556731985,
          "name": "post",
          "data": {
            "poster": "mariana4vzla",
            "post_uuid": "8992a82c-cfcf-44d2-9ab8-193c8cc8e4e1",
            "content": "Wooo hadn't seen this.\nThank you very much, you are very kind.",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "dmail",
              "parent_uuid": "b125c8d0-7e1b-4aff-8e59-2286d0b61f64",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 44543
        }],
        "data": {
          "poster": "bigbluewhale",
          "post_uuid": "b125c8d0-7e1b-4aff-8e59-2286d0b61f64",
          "content": "You pumped about the Dappathon?!! So are we! Let everyone you know about it through the next generation decentralized email service! Visit https://dmail.co/ and use your MAIL tokens today! \n\nWe're also looking for great questions for Kurt to answer during the Endless Dappathon, so if you got any, leave it down below and you can be sure there'll be extra MAIL coming your way!\n\nAlso, send me a hello with your new MAIL token @bigbluewhale!\n\n#tip 100 MAIL @hellodarknes<br>\n#tip 100 MAIL @melvinpearce<br>\n#tip 100 MAIL @thatguyrex2t<br>\n#tip 100 MAIL @gq3timzsgyge<br>\n#tip 100 MAIL @anditrader12<br>\n#tip 100 MAIL @gy3tsojwhage<br>\n#tip 100 MAIL @kikeeosup123<br>\n#tip 100 MAIL @vandresguzmn<br>\n#tip 100 MAIL @eosguardians<br>\n#tip 100 MAIL @ha4dsojwhage<br>\n#tip 100 MAIL @jcmarketing5<br>\n#tip 100 MAIL @chronocrypto<br>\n#tip 100 MAIL @mariana4vzla<br>\n#tip 100 MAIL @gorayii12345<br>\n#tip 100 MAIL @eosrmgcvzla1<br>\n#tip 100 MAIL @gusvzla12345<br>\n#tip 100 MAIL @gqzdmnrvgyge<br>\n#tip 100 MAIL @aleestrabitx<br>\n#tip 100 MAIL @labyrinthine<br>\n#tip 100 MAIL @mervynjadams<br>\n#tip 100 MAIL @josuepalacfn<br>\n#tip 100 MAIL @cryptofried1<br>\n#tip 100 MAIL @juanboho2423<br>\n#tip 100 MAIL @eossandrag12<br>\n#tip 100 MAIL @matucaeos123<br>\n#tip 100 MAIL @krenskistoli<br>\n#tip 100 MAIL @eoslorengame<br>\n#tip 100 MAIL @eugelysmusic<br>\n#tip 100 MAIL @melvamaeos11<br>\n#tip 100 MAIL @eos4gamesetg<br>\n#tip 100 MAIL @angelica1225<br>\n#tip 100 MAIL @eleazarvho22<br>\n#tip 100 MAIL @eliaricardo2<br>\n#tip 100 MAIL @tradingwithp<br>\n#tip 100 MAIL @megaeladio53<br>\n#tip 100 MAIL @abielarcila1<br>\n#tip 100 MAIL @pamegarrio12<br>\n#tip 100 MAIL @niklauseos22<br>\n#tip 100 MAIL @josecarrerag<br>\n#tip 100 MAIL @delibytespfd<br>\n#tip 100 MAIL @gooddeedseos<br>\n#tip 100 MAIL @conceptskip1<br>\n#tip 100 MAIL @erwansyaheos<br>\n#tip 100 MAIL @eosideas4all<br>\n#tip 100 MAIL @zielonykotek<br>\n#tip 100 MAIL @elenisortiza<br>\n#tip 100 MAIL @elenitaeos13<br>\n#tip 100 MAIL @guzdmnjvgene<br>\n#tip 100 MAIL @gyztambzhage<br>\n#tip 100 MAIL @jackiemayue1<br>\n#tip 100 MAIL @elizabeths14<br>\n#tip 100 MAIL @oboluscrypto<br>\n#tip 100 MAIL @diceteamhelp<br>\n#tip 100 MAIL @eosrockygatz<br>\n#tip 100 MAIL @magistrals25<br>\n#tip 100 MAIL @britanyeos14<br>\n#tip 100 MAIL @jeninacrypto<br>\n#tip 100 MAIL @eosmunify123<br>\n#tip 100 MAIL @marinmex1234<br>\n#tip 100 MAIL @xabachixeosx<br>\n#tip 100 MAIL @elemarg253ja<br>\n#tip 100 MAIL @seo51hzathyq<br>\n#tip 100 MAIL @laloretoeos1<br>\n#tip 100 MAIL @gaeljosser34<br>\n#tip 100 MAIL @gq3dmojvgyge<br>\n#tip 100 MAIL @jamezjamezja<br>\n#tip 100 MAIL @eoslovervzla<br>\n#tip 100 MAIL @jengleycori3<br>",
          "reply_to_poster": "discussionss",
          "reply_to_post_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "Dmail will be joining the endless Dappathon! ",
            "sub": "dmail",
            "parent_uuid": "a3bb13c1-ceff-4f61-a8db-76fb96dcfdee",
            "parent_poster": "discussionss",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "",
              "sig": "",
              "verified": false
            }
          }
        },
        "o_transaction": "a22a695ab940c1cddacd1b984f3405014b36d6c541487c9d8ee54fff831285cd",
        "o_id": 6497176787,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": ["https://novusphere.io/static/img/logo.svg"]
      }, {
        "_post": null,
        "_content": "Thanks everyone for registerating early, here is some token candy for your efforts!\n\nWe're also looking for great questions for Carlos to answer during the Endless Dappathon, so if you got any, leave it down below and you can be sure there'll be extra MPT coming your way!\n\n@rmgrmgrmgrmg @metpacktoken @rmgrmgrmgrmg\n\n\n#tip 8000 MPT @hellodarknes<br>\n#tip 8000 MPT @melvinpearce<br>\n#tip 8000 MPT @thatguyrex2t<br>\n#tip 8000 MPT @anditrader12<br>\n#tip 8000 MPT @gy3tsojwhage<br>\n#tip 8000 MPT @kikeeosup123<br>\n#tip 8000 MPT @gq3timzsgyge<br>\n#tip 8000 MPT @vandresguzmn<br>\n#tip 8000 MPT @eosguardians<br>\n#tip 8000 MPT @ha4dsojwhage<br>\n#tip 8000 MPT @jcmarketing5<br>\n#tip 8000 MPT @chronocrypto<br>\n#tip 8000 MPT @mariana4vzla<br>\n#tip 8000 MPT @gorayii12345<br>\n#tip 8000 MPT @eosrmgcvzla1<br>\n#tip 8000 MPT @gusvzla12345<br>\n#tip 8000 MPT @gqzdmnrvgyge<br>\n#tip 8000 MPT @aleestrabitx<br>\n#tip 8000 MPT @labyrinthine<br>\n#tip 8000 MPT @mervynjadams<br>\n#tip 8000 MPT @josuepalacfn<br>\n#tip 8000 MPT @cryptofried1<br>\n#tip 8000 MPT @juanboho2423<br>\n#tip 8000 MPT @eossandrag12<br>\n#tip 8000 MPT @matucaeos123<br>\n#tip 8000 MPT @krenskistoli<br>\n#tip 8000 MPT @eoslorengame<br>\n#tip 8000 MPT @eugelysmusic<br>\n#tip 8000 MPT @melvamaeos11<br>\n#tip 8000 MPT @eos4gamesetg<br>\n#tip 8000 MPT @angelica1225<br>\n#tip 8000 MPT @eleazarvho22<br>\n#tip 8000 MPT @eliaricardo2<br>\n#tip 8000 MPT @tradingwithp<br>\n#tip 8000 MPT @megaeladio53<br>\n#tip 8000 MPT @abielarcila1<br>\n#tip 8000 MPT @pamegarrio12<br>\n#tip 8000 MPT @niklauseos22<br>\n#tip 8000 MPT @josecarrerag<br>\n#tip 8000 MPT @delibytespfd<br>\n#tip 8000 MPT @gooddeedseos<br>\n#tip 8000 MPT @conceptskip1<br>\n#tip 8000 MPT @erwansyaheos<br>\n#tip 8000 MPT @eosideas4all<br>\n#tip 8000 MPT @zielonykotek<br>\n#tip 8000 MPT @elenisortiza<br>\n#tip 8000 MPT @elenitaeos13<br>\n#tip 8000 MPT @guzdmnjvgene<br>\n#tip 8000 MPT @gyztambzhage<br>\n#tip 8000 MPT @jackiemayue1<br>\n#tip 8000 MPT @elizabeths14<br>\n#tip 8000 MPT @oboluscrypto<br>\n#tip 8000 MPT @diceteamhelp<br>\n#tip 8000 MPT @eosrockygatz<br>",
        "score": 0.0000037538289825277433,
        "parent": {
          "_post": null,
          "_content": "If you still haven't heard the latest news, then get prepared! \n\n\"Buckle up your seat belts, 'cause this ain't Kansas anymore!\"\n\nOn the 5th of May, Discussions and StakeMine are holding the second Endless Dapp's series Live, where we will be hearing from Dapps around the ecosphere and you will be able to have chances to ask questions and find out what the latest is around the EOSIO Space.\n\nOne of the first projects that will be joining us is Metal Packaging Token: A blockchain-based solution to improve cost-effectiveness within the metal packaging industry.\n\nCarlos Cabanelas the founder and CEO of Metal Packaging Token will be joining us live at the dappathon, to speak about the project's latest development and to answer some of the questions that you might have.\n\nSo without further ado:\n\n![](https://i.postimg.cc/fbr74DdG/metpacktoken.jpg)\n\nWe recommend you to check Metal Packaging Token on the following links:\n\nWebsite: http://www.metpacktoken.org/ <br>\nTelegram: https://t.me/joinchat/GHpqDxLMYCvr2_g9PvwRCw\n\nThe event is free of charge, but the number of seats will be limited, so make sure to grab your spot first!\n\nRegister for the event via the link above, by clicking the \"Save my spot\" button! \n\nAnd make sure you follow the [#endlessdappathon](https://eos.discussions.app/tag/endlessdappathon) for the latest news and announcements!\n",
          "score": 0,
          "parent": null,
          "depth": 0,
          "is_pinned": false,
          "new_replies": 0,
          "children": [],
          "createdAt": 1555248761,
          "transaction": "1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "id": 6203642103,
          "up": 0,
          "total_replies": 0,
          "my_vote": null,
          "referendum": null,
          "tags": ["endlessdappathon"],
          "tips": [],
          "replies": [],
          "data": {
            "poster": "discussionss",
            "post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "content": "If you still haven't heard the latest news, then get prepared! \n\n\"Buckle up your seat belts, 'cause this ain't Kansas anymore!\"\n\nOn the 5th of May, Discussions and StakeMine are holding the second Endless Dapp's series Live, where we will be hearing from Dapps around the ecosphere and you will be able to have chances to ask questions and find out what the latest is around the EOSIO Space.\n\nOne of the first projects that will be joining us is Metal Packaging Token: A blockchain-based solution to improve cost-effectiveness within the metal packaging industry.\n\nCarlos Cabanelas the founder and CEO of Metal Packaging Token will be joining us live at the dappathon, to speak about the project's latest development and to answer some of the questions that you might have.\n\nSo without further ado:\n\nhttps://i.postimg.cc/fbr74DdG/metpacktoken.jpg\n\nWe recommend you to check Metal Packaging Token on the following links:\n\nWebsite: http://www.metpacktoken.org/ <br>\nTelegram: https://t.me/joinchat/GHpqDxLMYCvr2_g9PvwRCw\n\nThe event is free of charge, but the number of seats will be limited, so make sure to grab your spot first!\n\nRegister for the event via the link above, by clicking the \"Save my spot\" button! \n\nAnd make sure you follow the [#endlessdappathon](https://eos.discussions.app/tag/endlessdappathon) for the latest news and announcements!\n",
            "reply_to_poster": "",
            "reply_to_post_uuid": "",
            "certify": 0,
            "json_metadata": {
              "type": "novusphere-forum",
              "title": "Metal Packaging Token will be joining the Endless Dappathon",
              "sub": "metalpackagingtoken",
              "parent_uuid": "",
              "parent_poster": "",
              "edit": false,
              "attachment": {
                "value": "https://www.crowdcast.io/e/endless-dappathon-by-eos?navlinks=false&embed=true",
                "type": "url",
                "display": "iframe",
                "width": 560,
                "height": 315
              },
              "reddit": {
                "author": "",
                "permalink": ""
              },
              "anon_id": {
                "name": "",
                "pub": "",
                "sig": "",
                "verified": false
              }
            }
          },
          "o_transaction": "1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "o_id": 6203642103,
          "o_attachment": {
            "value": "https://www.crowdcast.io/e/endless-dappathon-by-eos?navlinks=false&embed=true",
            "type": "url",
            "display": "iframe",
            "width": 0,
            "height": 0
          },
          "user_icons": ["https://novusphere.io/static/img/logo.svg"]
        },
        "depth": 0,
        "is_pinned": false,
        "new_replies": 0,
        "children": [],
        "createdAt": 1556463234,
        "transaction": "1331594166e59ff7aedaad936d9f9c54a18a3a45607ba8fe208e88554ad4e1e6",
        "id": 6481629340,
        "up": 2,
        "total_replies": 0,
        "my_vote": null,
        "referendum": null,
        "tags": ["tip"],
        "tips": [{
          "from": "bigbluewhale",
          "to": "hellodarknes",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "melvinpearce",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "thatguyrex2t",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "anditrader12",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gy3tsojwhage",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "kikeeosup123",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gq3timzsgyge",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "vandresguzmn",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eosguardians",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "ha4dsojwhage",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "jcmarketing5",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "chronocrypto",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "mariana4vzla",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gorayii12345",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eosrmgcvzla1",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gusvzla12345",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gqzdmnrvgyge",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "aleestrabitx",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "labyrinthine",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "mervynjadams",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "josuepalacfn",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "cryptofried1",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "juanboho2423",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eossandrag12",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "matucaeos123",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "krenskistoli",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eoslorengame",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eugelysmusic",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "melvamaeos11",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eos4gamesetg",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "angelica1225",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eleazarvho22",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eliaricardo2",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "tradingwithp",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "megaeladio53",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "abielarcila1",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "pamegarrio12",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "niklauseos22",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "josecarrerag",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "delibytespfd",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gooddeedseos",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "conceptskip1",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "erwansyaheos",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eosideas4all",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "zielonykotek",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "elenisortiza",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "elenitaeos13",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "guzdmnjvgene",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "gyztambzhage",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "jackiemayue1",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "elizabeths14",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "oboluscrypto",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "diceteamhelp",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }, {
          "from": "bigbluewhale",
          "to": "eosrockygatz",
          "amount": "8000.0000",
          "memo": "tip for 1e7ad6264fc09b7fd7b8cf5eef726cdae7a273788ffedd0b012990bbd3e87c83",
          "symbol": "MPT",
          "contract": "metpacktoken"
        }],
        "replies": [{
          "_id": "5cc5c24569b00566026cd03e",
          "id": 6481834894,
          "account": "eosio.forum",
          "transaction": "998a07726534a7c43c0f8b88c25b4613d8665cd182d74efee29c24120f8d3e88",
          "blockId": 55357258,
          "createdAt": 1556464195,
          "name": "post",
          "data": {
            "poster": "anditrader12",
            "post_uuid": "2bcd5de1-af10-44fc-9c21-c678df7565f6",
            "content": "Haha thanks my friend @bigbluewhale ☕😃\n\nAnd I have a little question for carlos. 😁\n\nSo if someday you have success with the MPT project, did you will remember us always or you will delete your memory to forget we? ",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43626,
          "mentions": ["bigbluewhale"]
        }, {
          "_id": "5cc5c3e469b00566026cd5cd",
          "id": 6481927611,
          "account": "eosio.forum",
          "transaction": "84ef0b2d6e08e6fcb2b4904ed3a2124746803f7c6535fc4f22c47a0bfe0523b1",
          "blockId": 55358087,
          "createdAt": 1556464609,
          "name": "post",
          "data": {
            "poster": "gy3tomjvg4ge",
            "post_uuid": "55dc201b-034d-416c-9186-2434c0c9cd9e",
            "content": "thansk my friends",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43628
        }, {
          "_id": "5cc5c5bb69b00566026cdce8",
          "id": 6482024460,
          "account": "eosio.forum",
          "transaction": "0ba046c4a3bc4fac23075b6a53575bad343ca80aaea05bb9544f67d7620b58fb",
          "blockId": 55359033,
          "createdAt": 1556465082,
          "name": "post",
          "data": {
            "poster": "gorayii12345",
            "post_uuid": "65cbc340-6e30-43f0-ae79-db9acef60dea",
            "content": "Muchas gracias por los caramelitos ;) @bigbluewhale",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43630,
          "mentions": ["bigbluewhale"]
        }, {
          "_id": "5cc5d3fa69b00566026d1028",
          "id": 6482876797,
          "account": "eosio.forum",
          "transaction": "0d67484519be7c5f51622a8d5c86e191cea66e31198ccf9235b87bef14315c18",
          "blockId": 55366316,
          "createdAt": 1556468725,
          "name": "post",
          "data": {
            "poster": "chronocrypto",
            "post_uuid": "de8d467b-66c0-40ac-90ab-c1dfc8a0ae10",
            "content": "Thanks man you know Ill be there!",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43636
        }, {
          "_id": "5cc5edbd69b00566026d701c",
          "id": 6484272633,
          "account": "eosio.forum",
          "transaction": "6067e830261fa10ab25f4c87c9b44c98c4de21f84ea8f9883c1dda2a1ca77d8c",
          "blockId": 55379514,
          "createdAt": 1556475324,
          "name": "post",
          "data": {
            "poster": "ha4dsojwhage",
            "post_uuid": "dc09d10a-a07b-497b-a685-168d99d06921",
            "content": "thanks!! I can't wait!!",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43659
        }, {
          "_id": "5cc6d65b69b00566026f7d9e",
          "id": 6495759504,
          "account": "eosio.forum",
          "transaction": "930dfe0be66cff3bee67ab592b3de1b27c269b3a4f357f3612a49097b3c8f45c",
          "blockId": 55498590,
          "createdAt": 1556534870,
          "name": "post",
          "data": {
            "poster": "matucaeos123",
            "post_uuid": "6b4ae9ea-eba4-4294-8325-ad2cf72188f4",
            "content": "thanks for the tips",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 43793
        }, {
          "_id": "5cc8e10c69b005660275dbd2",
          "id": 6522066782,
          "account": "eosio.forum",
          "transaction": "6306a66868a3f2a7ad78ce0eea2db28d904437e4923c922a1f1b61648360e077",
          "blockId": 55766136,
          "createdAt": 1556668674,
          "name": "post",
          "data": {
            "poster": "eossandrag12",
            "post_uuid": "7edd1bba-7aa1-43c3-a247-d77de996fdb7",
            "content": "Ohh! Thank you, this is amazing, I did a review on this project to help Spanish-speaking users understand more quickly. ",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 44210
        }, {
          "_id": "5cc9d95569b0056602785351",
          "id": 6534954706,
          "account": "eosio.forum",
          "transaction": "05b18091bd9017cbc3a3a5ae2d2270d0c1353c41034595bab40fd64e6fe63715",
          "blockId": 55893154,
          "createdAt": 1556732235,
          "name": "post",
          "data": {
            "poster": "mariana4vzla",
            "post_uuid": "1d05923b-52c3-4794-bea7-e9941d294eb6",
            "content": "That's great. I hadn't been able to thank you before. But this is very motivating. See you on May 5.",
            "reply_to_poster": "discussionss",
            "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "certify": 0,
            "json_metadata": {
              "title": "",
              "type": "novusphere-forum",
              "sub": "metalpackagingtoken",
              "parent_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
              "parent_poster": "bigbluewhale",
              "edit": false,
              "attachment": {
                "value": "",
                "type": "",
                "display": ""
              },
              "anon_id": null
            }
          },
          "offset": 44546
        }],
        "data": {
          "poster": "bigbluewhale",
          "post_uuid": "e3cb77f6-a525-4c64-b533-a1af6c212993",
          "content": "Thanks everyone for registerating early, here is some token candy for your efforts!\n\nWe're also looking for great questions for Carlos to answer during the Endless Dappathon, so if you got any, leave it down below and you can be sure there'll be extra MPT coming your way!\n\n@rmgrmgrmgrmg @metpacktoken @rmgrmgrmgrmg\n\n\n#tip 8000 MPT @hellodarknes<br>\n#tip 8000 MPT @melvinpearce<br>\n#tip 8000 MPT @thatguyrex2t<br>\n#tip 8000 MPT @anditrader12<br>\n#tip 8000 MPT @gy3tsojwhage<br>\n#tip 8000 MPT @kikeeosup123<br>\n#tip 8000 MPT @gq3timzsgyge<br>\n#tip 8000 MPT @vandresguzmn<br>\n#tip 8000 MPT @eosguardians<br>\n#tip 8000 MPT @ha4dsojwhage<br>\n#tip 8000 MPT @jcmarketing5<br>\n#tip 8000 MPT @chronocrypto<br>\n#tip 8000 MPT @mariana4vzla<br>\n#tip 8000 MPT @gorayii12345<br>\n#tip 8000 MPT @eosrmgcvzla1<br>\n#tip 8000 MPT @gusvzla12345<br>\n#tip 8000 MPT @gqzdmnrvgyge<br>\n#tip 8000 MPT @aleestrabitx<br>\n#tip 8000 MPT @labyrinthine<br>\n#tip 8000 MPT @mervynjadams<br>\n#tip 8000 MPT @josuepalacfn<br>\n#tip 8000 MPT @cryptofried1<br>\n#tip 8000 MPT @juanboho2423<br>\n#tip 8000 MPT @eossandrag12<br>\n#tip 8000 MPT @matucaeos123<br>\n#tip 8000 MPT @krenskistoli<br>\n#tip 8000 MPT @eoslorengame<br>\n#tip 8000 MPT @eugelysmusic<br>\n#tip 8000 MPT @melvamaeos11<br>\n#tip 8000 MPT @eos4gamesetg<br>\n#tip 8000 MPT @angelica1225<br>\n#tip 8000 MPT @eleazarvho22<br>\n#tip 8000 MPT @eliaricardo2<br>\n#tip 8000 MPT @tradingwithp<br>\n#tip 8000 MPT @megaeladio53<br>\n#tip 8000 MPT @abielarcila1<br>\n#tip 8000 MPT @pamegarrio12<br>\n#tip 8000 MPT @niklauseos22<br>\n#tip 8000 MPT @josecarrerag<br>\n#tip 8000 MPT @delibytespfd<br>\n#tip 8000 MPT @gooddeedseos<br>\n#tip 8000 MPT @conceptskip1<br>\n#tip 8000 MPT @erwansyaheos<br>\n#tip 8000 MPT @eosideas4all<br>\n#tip 8000 MPT @zielonykotek<br>\n#tip 8000 MPT @elenisortiza<br>\n#tip 8000 MPT @elenitaeos13<br>\n#tip 8000 MPT @guzdmnjvgene<br>\n#tip 8000 MPT @gyztambzhage<br>\n#tip 8000 MPT @jackiemayue1<br>\n#tip 8000 MPT @elizabeths14<br>\n#tip 8000 MPT @oboluscrypto<br>\n#tip 8000 MPT @diceteamhelp<br>\n#tip 8000 MPT @eosrockygatz<br>",
          "reply_to_poster": "discussionss",
          "reply_to_post_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
          "certify": 0,
          "json_metadata": {
            "type": "novusphere-forum",
            "title": "Metal Packaging Token will be joining the Endless Dappathon",
            "sub": "metalpackagingtoken",
            "parent_uuid": "0dfbb9cb-cf9c-4838-b2f0-7d44c4263830",
            "parent_poster": "discussionss",
            "edit": false,
            "attachment": {
              "value": "",
              "type": "",
              "display": "",
              "width": 0,
              "height": 0
            },
            "reddit": {
              "author": "",
              "permalink": ""
            },
            "anon_id": {
              "name": "",
              "pub": "",
              "sig": "",
              "verified": false
            }
          }
        },
        "o_transaction": "1331594166e59ff7aedaad936d9f9c54a18a3a45607ba8fe208e88554ad4e1e6",
        "o_id": 6481629340,
        "o_attachment": {
          "value": "",
          "type": "",
          "display": "",
          "width": 0,
          "height": 0
        },
        "user_icons": ["https://novusphere.io/static/img/logo.svg"]
      }]
    };
  }

  async getUser(_username) {
    return {
      comments: [],
      // comment interface
      threads: [],
      // Post[]
      blogs: [],
      // what is this meant for?
      followers: 50,
      balances: [{
        token: 'ATMOS',
        amount: 100
      }],
      lastActivity: Date.now()
    };
  }

}
// CONCATENATED MODULE: ./novusphere-js/index.ts
/* unused harmony export reddit */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return discussions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return dummy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return nsdb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return eos; });
/* unused harmony export settings */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return init; });
/* unused harmony export sleep */
/* unused concated harmony import DiscussionService */
/* unused concated harmony import RedditService */
/* concated harmony reexport Post */__webpack_require__.d(__webpack_exports__, "a", function() { return discussions_post["a" /* Post */]; });
/* unused concated harmony import AttachmentType */
/* unused concated harmony import AttachmentDisplay */
/* unused concated harmony import Attachment */
/* unused concated harmony import Thread */
/* unused concated harmony import DEFAULT_EOS_NETWORK */
/* unused concated harmony import EOS */







const novusphere_js_reddit = new reddit["a" /* RedditService */]();
const discussions = new discussions_DiscussionsService();
const dummy = new DummyService();
const nsdb = new NSDB();
const eos = new eos_EOS();
const settings = new settings_Settings();
async function init() {
  await settings.init();
  await nsdb.init(settings.novusphereEndPoint);
  await eos.init(settings.eosNetwork);
}
function sleep(timeMilliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, timeMilliseconds);
  });
}

/***/ }),

/***/ "VBo9":
/***/ (function(module, exports) {

module.exports = require("mobx");

/***/ }),

/***/ "Y/Ji":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Thread; });
/* harmony import */ var _attachment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("uM3l");
/* harmony import */ var _service_reddit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("6MBa");


class Thread {
  constructor() {
    this.openingPost = void 0;
    this.map = void 0;
  }

  get title() {
    return this.openingPost ? this.openingPost.title : undefined;
  }

  get uuid() {
    return this.openingPost ? this.openingPost.uuid : undefined;
  }

  get totalReplies() {
    return this.openingPost ? this.openingPost.totalReplies : 0;
  }

  init(posts) {
    this.map = {};
    if (posts.length == 0) return new Error('Cannot create thread with zero posts');
    const threadUuid = posts[0].threadUuid;
    this.openingPost = posts.find(p => p.uuid == threadUuid);
    if (!this.openingPost) return new Error('No opening post found!');

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      if (p.uuid in this.map) continue; //if (!p.edit) {

      if (this.map[p.uuid] == undefined) {
        this.map[p.uuid] = p;
      } //} else if (p.parentUuid) {
      //    const parent = this.map[p.parentUuid]
      //    if (parent) {
      //        parent.applyEdit(p)
      //    }
      //}

    }
  }

  async importRedditReplies() {
    if (!this.openingPost) return;
    if (!this.openingPost.attachment.value) return;
    if (!this.openingPost.attachment.value.match(_attachment__WEBPACK_IMPORTED_MODULE_0__[/* REDDIT_URL */ "b"])) return;
    let url = this.openingPost.attachment.value.split('/');
    var r = url.findIndex(p => p == 'r');

    if (r > -1) {
      let rs = new _service_reddit__WEBPACK_IMPORTED_MODULE_1__[/* RedditService */ "a"]();
      let redditPosts = await rs.getThread(this.openingPost, url[r + 1], url[r + 3]);

      if (redditPosts.length > 0) {
        for (let i = 1; i < redditPosts.length; i++) this.map[redditPosts[i].uuid] = redditPosts[i];

        this.openingPost.uuid = redditPosts[0].uuid;
      }
    }
  }

  async normalize() {
    if (!this.openingPost) return;
    await this.importRedditReplies();
    let posts = []; // build the thread

    for (var uuid in this.map) {
      const post = this.map[uuid];

      if (post.parentUuid) {
        const parent = this.map[post.parentUuid];

        if (parent) {
          post.depth = parent.depth + 1;
          parent.replies.push(post);
        }
      }

      posts.push(post);
    } // wait for normalization


    await Promise.all(posts.map(p => p.normalize()));
  }

}

/***/ }),

/***/ "Y65e":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return _applyDecoratedDescriptor; });
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

/***/ }),

/***/ "cDcd":
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "dEbC":
/***/ (function(module, exports) {

module.exports = require("bip32");

/***/ }),

/***/ "il4H":
/***/ (function(module, exports) {

module.exports = require("big-integer");

/***/ }),

/***/ "jYWu":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_applyDecoratedDescriptor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("Y65e");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("cDcd");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _novusphere_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("SBLk");
/* harmony import */ var mobx_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("sGQ9");
/* harmony import */ var mobx_react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(mobx_react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_tabs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("65ip");
/* harmony import */ var react_tabs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_tabs__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("No/t");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("uhWA");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var mobx__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("VBo9");
/* harmony import */ var mobx__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(mobx__WEBPACK_IMPORTED_MODULE_7__);


var _dec, _class, _class2, _temp;

var __jsx = react__WEBPACK_IMPORTED_MODULE_1__["createElement"];







// TO-DO: real data
let U = (_dec = Object(mobx_react__WEBPACK_IMPORTED_MODULE_3__["inject"])('uiStore', 'userStore', 'newAuthStore'), _dec(_class = Object(mobx_react__WEBPACK_IMPORTED_MODULE_3__["observer"])(_class = (_class2 = (_temp = class U extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
  constructor(...args) {
    super(...args);

    this.renderFollowingList = () => {
      if (!this.props.userStore.following.size) {
        return __jsx("li", {
          className: 'f6',
          key: 'none'
        }, "You are not following any users.");
      }

      const pubs = Array.from(this.props.userStore.following.values());
      const following = Array.from(this.props.userStore.following.keys());
      return following.map((follow, index) => __jsx("li", {
        className: 'pa0 mb2',
        key: follow
      }, __jsx("span", {
        title: pubs[index],
        className: 'link pr2 pointer dim'
      }, follow), __jsx("span", {
        onClick: () => this.props.userStore.toggleUserFollowing(follow, pubs[index]),
        title: 'Click to unfollow'
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_6__["FontAwesomeIcon"], {
        width: 13,
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__["faMinusCircle"],
        className: 'pointer dim',
        color: 'red'
      }))));
    };

    this.renderSidebarContent = () => {
      return __jsx(react__WEBPACK_IMPORTED_MODULE_1__["Fragment"], null, __jsx("div", {
        className: 'flex flex-row items-center'
      }, __jsx("img", {
        className: 'br-100',
        src: 'https://via.placeholder.com/100x100',
        alt: 'User profile image'
      }), __jsx("div", {
        className: 'ml3 flex flex-column items-start justify-center'
      }, __jsx("span", {
        className: 'b black f5 mb2'
      }, this.props.username), __jsx("span", {
        className: 'b f6 mb2'
      }, "192 Followers"), __jsx("button", {
        className: 'button-outline'
      }, "Follow"))), __jsx("div", {
        className: 'mt4 flex flex-column'
      }, __jsx("span", {
        className: 'small-title mb2'
      }, "Contacts"), __jsx("ul", {
        className: 'list'
      }, __jsx("li", {
        className: 'pa0 mb2'
      }, "@", this.props.username), __jsx("li", {
        className: 'pa0 mb2'
      }, this.props.username), __jsx("li", {
        className: 'pa0 mb2'
      }, this.props.username), __jsx("li", {
        className: 'pa0 mb2'
      }, this.props.username, ".com"))), __jsx("div", {
        className: 'mt4 flex flex-column'
      }, __jsx("span", {
        className: 'small-title mb2'
      }, "Connected Accounts"), __jsx("ul", {
        className: 'list'
      }, __jsx("li", {
        className: 'pa0 mb2'
      }, "EOS"))), this.isSameUser && __jsx("div", {
        className: 'mt4 flex flex-column'
      }, __jsx("span", {
        className: 'small-title mb2'
      }, "Following (only visible to you)"), __jsx("ul", {
        className: 'list'
      }, this.renderFollowingList())));
    };
  }

  static async getInitialProps({
    query,
    store
  }) {
    const uiStore = store.uiStore;
    uiStore.toggleSidebarStatus(false);
    const userData = await _novusphere_js__WEBPACK_IMPORTED_MODULE_2__[/* dummy */ "c"].getUser(query.username);
    return {
      username: query.username,
      data: userData
    };
  }

  get isSameUser() {
    return this.props.username === this.props.newAuthStore.getActiveDisplayName;
  }

  render() {
    const {
      data
    } = this.props;
    return __jsx("div", {
      className: 'flex flex-row'
    }, __jsx("div", {
      className: 'card w-30 mr5 pa3'
    }, this.renderSidebarContent()), __jsx("div", {
      className: 'w-70'
    }, __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["Tabs"], null, __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["TabList"], {
      className: 'settings-tabs'
    }, __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["Tab"], {
      className: 'settings-tab'
    }, "Blog"), __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["Tab"], {
      className: 'settings-tab'
    }, "Posts"), __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["Tab"], {
      className: 'settings-tab'
    }, "Latest")), __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["TabPanel"], null, __jsx("div", {
      className: 'card settings-card'
    }, "There are no blog posts from this uer.")), __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["TabPanel"], null, __jsx("div", {
      className: 'card settings-card'
    }, "There are no posts from this user.")), __jsx(react_tabs__WEBPACK_IMPORTED_MODULE_4__["TabPanel"], null, __jsx("div", {
      className: 'card settings-card'
    }, "There are no posts from this user.")))));
  }

}, _temp), (Object(_babel_runtime_helpers_esm_applyDecoratedDescriptor__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(_class2.prototype, "isSameUser", [mobx__WEBPACK_IMPORTED_MODULE_7__["computed"]], Object.getOwnPropertyDescriptor(_class2.prototype, "isSameUser"), _class2.prototype)), _class2)) || _class) || _class);
/* harmony default export */ __webpack_exports__["default"] = (U);

/***/ }),

/***/ "rePB":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return _defineProperty; });
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/***/ }),

/***/ "sGQ9":
/***/ (function(module, exports) {

module.exports = require("mobx-react");

/***/ }),

/***/ "sclD":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Post; });
/* harmony import */ var eosjs_ecc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("KMQM");
/* harmony import */ var eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eosjs_ecc__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _attachment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("uM3l");
//@ts-ignore



const BigInt = __webpack_require__("il4H");

class Post {
  // Blockchain Specific
  // may not be the *exact* block the transaction occured in but "near" this block
  // Post Data
  // Discussion ID Post Data
  // Attachment
  // Children (thread format)
  // State Data
  // only used if isOpeningPost()
  // only used if isOpeningPost()
  // only used if Thread object created with
  // Aggregate Data
  hasAttachment() {
    return this.attachment.value != '' && this.attachment.type != '' && this.attachment.display != '';
  }

  isOpeningPost() {
    return this.parentUuid == '';
  }

  isAnonymousVerified() {
    if (!this.verifySig) {
      if (!eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.isValidPublic(this.pub)) {
        this.verifySig = 'INVALID_PUB_KEY';
        return false;
      }

      this.verifySig = eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.recover(this.sig, this.content);
    }

    return this.verifySig == this.pub;
  }

  constructor(chain) {
    this.id = void 0;
    this.transaction = void 0;
    this.blockApprox = void 0;
    this.chain = void 0;
    this.parentUuid = void 0;
    this.threadUuid = void 0;
    this.uuid = void 0;
    this.title = void 0;
    this.poster = void 0;
    this.displayName = void 0;
    this.content = void 0;
    this.createdAt = void 0;
    this.sub = void 0;
    this.tags = void 0;
    this.mentions = void 0;
    this.edit = void 0;
    this.pub = void 0;
    this.sig = void 0;
    this.verifySig = void 0;
    this.attachment = void 0;
    this.replies = void 0;
    this.totalReplies = void 0;
    this.score = void 0;
    this.upvotes = void 0;
    this.downvotes = void 0;
    this.depth = void 0;
    this.myVote = void 0;
    this.id = Math.random() * 0xFFFFFFFF | 0; // generate random string id

    this.transaction = '';
    this.blockApprox = 0;
    this.chain = chain;
    this.parentUuid = '';
    this.threadUuid = '';
    this.uuid = '';
    this.title = '';
    this.poster = '';
    this.displayName = '';
    this.content = '';
    this.createdAt = new Date(0);
    this.sub = '';
    this.tags = [];
    this.mentions = [];
    this.edit = false;
    this.pub = '';
    this.sig = '';
    this.verifySig = '';
    this.attachment = new _attachment__WEBPACK_IMPORTED_MODULE_1__[/* Attachment */ "a"]();
    this.replies = [];
    this.totalReplies = 0;
    this.score = 0;
    this.upvotes = 0;
    this.downvotes = 0;
    this.depth = 0;
    this.myVote = 0;
  }

  static fromDbObject(o) {
    let p = new Post(o.chain);
    p.id = o.id;
    p.transaction = o.transaction;
    p.blockApprox = o.blockApprox;
    p.uuid = o.uuid;
    p.parentUuid = o.parentUuid;
    p.threadUuid = o.threadUuid;
    p.title = o.title;
    p.poster = o.poster;
    p.displayName = o.displayName;
    p.content = o.content;
    p.createdAt = new Date(o.createdAt);
    p.sub = o.sub;
    p.tags = o.tags;
    p.mentions = o.mentions;
    p.edit = o.edit;
    p.pub = o.pub;
    p.sig = o.sig;

    if (o.attachment) {
      p.attachment.value = o.attachment.value || p.attachment.value;
      p.attachment.type = o.attachment.type || p.attachment.type;
      p.attachment.display = o.attachment.display || p.attachment.display;
    }

    p.totalReplies = o.totalReplies;
    p.upvotes = o.upvotes;
    p.downvotes = o.downvotes;

    if (o.myVote && o.myVote.length > 0) {
      p.myVote = o.myVote[0].value;
    }

    return p;
  }

  static decodeId(id) {
    let n = new BigInt(id, 36);
    let txid32 = n.shiftRight(32).toString(16).padStart(8, '0');
    let timeOffset = n.and(new BigInt('ffffffff', 16));
    let time = timeOffset.valueOf() * 1000 + new Date('2017/1/1').getTime();
    return {
      txid32: txid32,
      timeGte: time - 1000 * 60 * 3,
      timeLte: time + 1000 * 60 * 3
    };
  }

  static encodeId(transaction, createdAt) {
    let txid32 = new BigInt(transaction.substring(0, 8), 16);
    let timeOffset = new BigInt(Math.floor((createdAt.getTime() - new Date('2017/1/1').getTime()) / 1000), 10);
    let id = txid32.shiftLeft(32).or(timeOffset);
    return id.toString(36);
  }

  encodeId() {
    return Post.encodeId(this.transaction, this.createdAt);
  }

  sign(privKey) {
    this.pub = eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.privateToPublic(privKey); // const hash = ecc.sha256(this.uuid+ecc.sha256(this.content))

    const hash0 = eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.sha256(this.content);
    const hash1 = eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.sha256(this.uuid + hash0);
    console.log('Class: Post, Function: sign, Line 168 this.content: ', this.content);
    console.log('Class: Post, Function: sign, Line 169 this.uuid: ', this.uuid);
    console.log('Class: Post, Function: sign, Line 168 hash0: ', hash0);
    console.log('Class: Post, Function: sign, Line 169 hash1: ', hash1);
    this.sig = eosjs_ecc__WEBPACK_IMPORTED_MODULE_0___default.a.sign(hash1, privKey);
    this.verifySig = this.pub;
  }
  /*applyEdit(p: Post) {
      if (!p.edit || p.parentUuid != this.uuid) return;
      if (p.chain != this.chain) return;
      if (p.poster != this.poster) return;
      if (this.anonymousId || p.anonymousId) {
          if (p.anonymousId != this.anonymousId) return;
          if (!this.isAnonymousVerified() || !p.isAnonymousVerified()) return;
      }
        this.content = p.content;
      this.createdAt = p.createdAt;
      this.tags = p.tags;
      this.mentions = p.mentions;
      this.edit = true;
        this.anonymousId = p.anonymousId;
      this.anonymousSignature = p.anonymousSignature;
      this.verifyAnonymousSignature = p.verifyAnonymousSignature;
        this.attachment = p.attachment;
  }*/


  autoImage() {
    if (!this.content) return;
    const IMAGE_URL = /(.|)http[s]?:\/\/(\w|[:\/\.%-])+\.(png|jpg|jpeg|gif)(\?(\w|[:\/\.%-])+)?(.|)/gi;
    this.content = this.content.replace(IMAGE_URL, link => {
      let trimmedLink = link.trim();

      if (!trimmedLink.startsWith('http')) {
        return link;
      }

      return `![](${trimmedLink})`;
    });
  }

  async normalize() {
    this.autoImage();
    await this.attachment.normalize();
  }

}

/***/ }),

/***/ "uM3l":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export YOUTUBE_URL */
/* unused harmony export IMGUR_IMG_URL */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return REDDIT_URL; });
/* unused harmony export TWITTER_URL */
/* unused harmony export DTUBE_URL */
/* unused harmony export SOUNDCLOUD_URL */
/* unused harmony export BITCHUTE_URL */
/* unused harmony export TRYBE_URL */
/* unused harmony export WHALESHARES_URL */
/* unused harmony export STEEMIT_URL */
/* unused harmony export IMAGE_TYPES */
/* unused harmony export AttachmentType */
/* unused harmony export AttachmentDisplay */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Attachment; });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("SBLk");
const YOUTUBE_URL = /https?:\/\/(www\.)?youtu(\.)?be(\.com)?\//i;
const IMGUR_IMG_URL = /https?:\/\/(www\.)?i\.imgur\.com\//i;
const REDDIT_URL = /https?:\/\/(www\.)?reddit\.com\//i;
const TWITTER_URL = /https?:\/\/(www\.)?twitter\.com\//i;
const DTUBE_URL = /https?:\/\/(www\.)?d\.tube\//;
const SOUNDCLOUD_URL = /https?:\/\/(www\.)?soundcloud\.com\//;
const BITCHUTE_URL = /https?:\/\/(www\.)?bitchute\.com\//;
const TRYBE_URL = /https?:\/\/(www\.)?trybe\.one\//;
const WHALESHARES_URL = /https?:\/\/(www\.)?whaleshares\.io\//;
const STEEMIT_URL = /https?:\/\/(www\.)?steemit\.com\//;
const IMAGE_TYPES = /\.(png|jpg|jpeg|gif)$/i;

let AttachmentType;

(function (AttachmentType) {
  AttachmentType["Undefined"] = "";
  AttachmentType["IPFS"] = "ipfs";
  AttachmentType["Url"] = "url";
  AttachmentType["Text"] = "text";
})(AttachmentType || (AttachmentType = {}));

let AttachmentDisplay;

(function (AttachmentDisplay) {
  AttachmentDisplay["Undefined"] = "";
  AttachmentDisplay["HTML"] = "html";
  AttachmentDisplay["Markdown"] = "md";
  AttachmentDisplay["Link"] = "link";
  AttachmentDisplay["IFrame"] = "iframe";
  AttachmentDisplay["MP4"] = "mp4";
  AttachmentDisplay["Image"] = "img";
})(AttachmentDisplay || (AttachmentDisplay = {}));

class Attachment {
  async setFromOEmbed(url) {
    try {
      let oembed = JSON.parse((await _index__WEBPACK_IMPORTED_MODULE_0__[/* nsdb */ "f"].cors(url)));
      this.trust_provider = oembed.provider_url;
      this.value = oembed.html;
      this.type = AttachmentType.Text;
      this.display = AttachmentDisplay.HTML;
    } catch (ex) {
      //console.log(ex);    
      return;
    }
  }

  isNormalizedImage() {
    if (this.type == AttachmentType.Url) {
      if (this.value.match(IMAGE_TYPES)) {
        return true;
      }
    }

    return false;
  }

  async normalize() {
    if (!this.value) return;

    if (this.type == AttachmentType.IPFS) {
      this.type = AttachmentType.Url;
      this.value = 'https://gateway.ipfs.io/ipfs/' + this.value;
    } else if (this.type == AttachmentType.Url) {
      if (this.value.match(YOUTUBE_URL)) {
        await this.setFromOEmbed(`https://www.youtube.com/oembed?format=json&url=${this.value}`);
      } else if (this.value.match(TWITTER_URL)) {
        await this.setFromOEmbed(`https://publish.twitter.com/oembed?format=json&url=${this.value}`);
      } else if (this.value.match(DTUBE_URL)) {
        await this.setFromOEmbed(`https://api.d.tube/oembed?url=${this.value.replace('/#!/', '/')}`);
      } else if (this.value.match(REDDIT_URL)) {
        await this.setFromOEmbed(`https://www.reddit.com/oembed?url=${this.value}`);
      } else if (this.value.match(SOUNDCLOUD_URL)) {
        await this.setFromOEmbed(`https://soundcloud.com/oembed?format=json&url=${this.value}`);
      } else if (this.value.match(BITCHUTE_URL)) {
        const vid = this.value.match(/video\/[a-zA-Z0-9]+/);

        if (vid && vid.length > 0) {
          this.value = 'https://www.bitchute.com/embed/' + vid[0].substring(6);
          this.display = AttachmentDisplay.IFrame;
        }
      } else if (this.isNormalizedImage()) {
        this.display = AttachmentDisplay.Image;
      } // TO-DO: inliners (trybe, steem, etc.)
      // always HTTPS iframe, HTTP will be rejeted by most browsers


      if (this.display == AttachmentDisplay.IFrame) {
        if (this.value.indexOf('http:') == 0) {
          this.value = 'https:' + this.value.substring(5);
        }
      }
    }
  }

  constructor() {
    this.value = void 0;
    this.type = void 0;
    this.display = void 0;
    this.trust_provider = void 0;
    this.value = '';
    this.type = AttachmentType.Undefined;
    this.display = AttachmentDisplay.Undefined;
  }

}

/***/ }),

/***/ "uhWA":
/***/ (function(module, exports) {

module.exports = require("@fortawesome/react-fontawesome");

/***/ }),

/***/ "zr5I":
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ })

/******/ });