const YOUTUBE_URL = /https?:\/\/(www\.)?youtu(\.)?be(\.com)?\//i;
const IMGUR_IMG_URL = /https?:\/\/(www\.)?i\.imgur\.com\//i;
const REDDIT_IMG_URL = /https?:\/\/(www\.)?i\.redd\.it\//i;
const TWITTER_URL = /https?:\/\/(www\.)?twitter\.com\//i;
const DTUBE_URL = /https?:\/\/(www\.)?d\.tube\//;
const SOUNDCLOUD_URL = /https?:\/\/(www\.)?soundcloud\.com\//;
const BITCHUTE_URL = /https?:\/\/(www\.)?bitchute\.com\//;
const TRYBE_URL = /https?:\/\/(www\.)?trybe\.one\//;
const WHALESHARES_URL = /https?:\/\/(www\.)?whaleshares\.io\//;
const STEEMIT_URL = /https?:\/\/(www\.)?steemit\.com\//;

const IMAGE_TYPES = /\.(png|jpg|jpeg|gif)$/i;

export enum AttachmentType {
    Undefined = '',
    IPFS = 'ipfs',
    Url = 'url',
    Text = 'text'
}

export enum AttachmentDisplay {
    Undefined = '',
    HTML = 'html',
    Link = 'link',
    IFrame = 'iframe',
    MP4 = 'mp4',
    Image = 'img',
    Tweet = 'tweet'
}

export class Attachment {
    value: string;
    type: AttachmentType;
    display: AttachmentDisplay;
    trusted: boolean;

    private setFromOEmbed(url: string) {
        let oembed;
        try {
            oembed = JSON.parse(url);
            this.value = oembed.html;
            this.type = AttachmentType.Text;
            this.display = AttachmentDisplay.HTML;
            this.trusted = true;

        }
        catch (ex) {
            return;
        }
    }

    private isNormalizedImage(): boolean {
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
        }
        else if (this.type == AttachmentType.Url) {
            if (this.value.match(YOUTUBE_URL)) {
                await this.setFromOEmbed(`https://www.youtube.com/oembed?format=json&url=${this.value}`);
            }
            else if (this.value.match(TWITTER_URL)) {
                this.display = AttachmentDisplay.Tweet;
            }
            else if (this.value.match(DTUBE_URL)) {
                await this.setFromOEmbed(`https://api.d.tube/oembed?url=${this.value.replace('/#!/', '/')}`);
            }
            else if (this.value.match(SOUNDCLOUD_URL)) {
                await this.setFromOEmbed(`https://soundcloud.com/oembed?format=json&url=${this.value}`);
            }
            else if (this.value.match(BITCHUTE_URL)) {
                const vid = this.value.match(/video\/[a-zA-Z0-9]+/);
                if (vid && vid.length > 0) {
                    this.value = 'https://www.bitchute.com/embed/' + vid[0].substring(6);
                    this.display = AttachmentDisplay.IFrame;
                }
            }
            else if (this.isNormalizedImage()) {
                this.display = AttachmentDisplay.Image;
            }

            // TO-DO: inliners (trybe, steem, etc.)

            // always HTTPS iframe, HTTP will be rejeted by most browsers
            if (this.display == AttachmentDisplay.IFrame) {
                if (this.value.indexOf('http:') == 0) {
                    this.value = 'https:' + this.value.substring(5);
                }
            }
        }
    }

    constructor() {
        this.value = '';
        this.type = AttachmentType.Undefined;
        this.display = AttachmentDisplay.Undefined;
        this.trusted = false;
    }
}