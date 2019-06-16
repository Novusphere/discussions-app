export const YOUTUBE_URL = /https?:\/\/(www\.)?youtu(\.)?be(\.com)?\//i;
export const IMGUR_IMG_URL = /https?:\/\/(www\.)?i\.imgur\.com\//i;
export const REDDIT_URL = /https?:\/\/(www\.)?reddit\.com\//i;
export const TWITTER_URL = /https?:\/\/(www\.)?twitter\.com\//i;
export const DTUBE_URL = /https?:\/\/(www\.)?d\.tube\//;
export const SOUNDCLOUD_URL = /https?:\/\/(www\.)?soundcloud\.com\//;
export const BITCHUTE_URL = /https?:\/\/(www\.)?bitchute\.com\//;
export const TRYBE_URL = /https?:\/\/(www\.)?trybe\.one\//;
export const WHALESHARES_URL = /https?:\/\/(www\.)?whaleshares\.io\//;
export const STEEMIT_URL = /https?:\/\/(www\.)?steemit\.com\//;

export const IMAGE_TYPES = /\.(png|jpg|jpeg|gif)$/i;

import { nsdb } from '../index';

export enum AttachmentType {
    Undefined = '',
    IPFS = 'ipfs',
    Url = 'url',
    Text = 'text'
}

export enum AttachmentDisplay {
    Undefined = '',
    HTML = 'html',
    Markdown = 'md',
    Link = 'link',
    IFrame = 'iframe',
    MP4 = 'mp4',
    Image = 'img',
}

export class Attachment {
    value: string;
    type: AttachmentType;
    display: AttachmentDisplay;
    trust_provider: string | undefined;

    private async setFromOEmbed(url: string) {
        try {
            let oembed = JSON.parse(await nsdb.cors(url));

            this.trust_provider = oembed.provider_url;
            this.value = oembed.html;
            this.type = AttachmentType.Text;
            this.display = AttachmentDisplay.HTML;
        }
        catch (ex) {
            //console.log(ex);    
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
                await this.setFromOEmbed(`https://publish.twitter.com/oembed?format=json&url=${this.value}`);
            }
            else if (this.value.match(DTUBE_URL)) {
                await this.setFromOEmbed(`https://api.d.tube/oembed?url=${this.value.replace('/#!/', '/')}`);
            } else if (this.value.match(REDDIT_URL)) {
                await this.setFromOEmbed(`https://www.reddit.com/oembed?url=${this.value}`);
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
    }
}