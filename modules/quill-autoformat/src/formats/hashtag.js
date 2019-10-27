import Quill from 'quill';

const Embed = Quill.import('blots/embed');

class Hashtag extends Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('href', `https://testd2.discussions.app/tags/${value}`);
    node.setAttribute('spellcheck', false);
    node.textContent = "#" + value;
    return node;
  }

  static formats(domNode) {
    return domNode.getAttribute('href').substr(this.BASE_URL.length);
  }

  format(name, value) {
    this.domNode.setAttribute('href', this.BASE_URL + value);
  }
  
  static value(domNode) {
    return domNode.textContent.substr(1);
  }
}

Hashtag.blotName = 'hashtag';
Hashtag.className = 'ql-hashtag';
Hashtag.tagName = 'A';
Hashtag.BASE_URL = '#';

export { Hashtag as default };
