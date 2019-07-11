import { observable } from 'mobx'
import { TagModel } from '@models/tagModel'
import { SubModel } from '@models/subModel'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'

export default class Tag extends BaseStore {
    // the amount of subs that are base
    static baseSubLength = 4

    @observable activeTag: TagModel
    @observable activeSub: SubModel
    @observable tags = observable.map<string, TagModel>()
    @observable subs = observable.map<string, TagModel>()

    constructor() {
        super()

        // set top level tags
        this.setTopLevelTags()

        // hard code tags
        if (this.tags.size === Tag.baseSubLength) {
            ;[
                {
                    name: 'UXfyre',
                    url: '/tag/UXfyre',
                    logo: 'https://uxfyre.io/public/img/fyreicon.png',
                },
                {
                    name: 'airdropsdac',
                    url: '/tag/airdropsdac',
                    logo: 'https://i.imgur.com/slFjjhH.png',
                },
                {
                    name: 'anon-pol-econ',
                    url: '/tag/anon-pol-econ',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'anon-r-eos',
                    url: '/tag/anon-r-eos',
                    logo: 'https://spee.ch/6/eos3.png',
                },
                {
                    name: 'anoxio',
                    url: '/tag/anoxio',
                    logo: 'https://i.imgur.com/iyXIxLv.png',
                },
                {
                    name: 'atticlab',
                    url: '/tag/atticlab',
                    logo:
                        'https://pbs.twimg.com/profile_images/1083303049957908480/NPv7U6HD_400x400.jpg',
                },
                {
                    name: 'betking',
                    url: '/tag/betking',
                    logo: 'https://ndi.340wan.com/eos/betkingtoken-bkt.png',
                },
                {
                    name: 'boid',
                    url: '/tag/boid',
                    logo: 'https://ndi.340wan.com/eos/boidcomtoken-boid.png',
                },
                {
                    name: 'boscore',
                    url: '/tag/boscore',
                    logo:
                        'https://pbs.twimg.com/profile_images/1077236550377836544/5xkN5oxQ_400x400.jpg',
                },
                {
                    name: 'bounties',
                    url: '/tag/bounties',
                    logo: 'https://spee.ch/f/MesaggingLine-08-512.png',
                },
                {
                    name: 'catchthefrog',
                    url: '/tag/catchthefrog',
                    logo: 'https://ndi.340wan.com/image/frogfrogcoin-frog.png',
                },
                {
                    name: 'cryptolions1',
                    url: '/tag/cryptolions1',
                    logo: 'https://imgs.cryptolions.io/logo_256.png',
                },
                {
                    name: 'dabble',
                    url: '/tag/dabble',
                    logo: 'https://ndi.340wan.com/image/eoscafekorea-dab.png',
                },
                {
                    name: 'diceone',
                    url: '/tag/diceone',
                    logo:
                        'https://pbs.twimg.com/profile_images/1072900881123692544/jcJqAEKd_400x400.jpg',
                },
                {
                    name: 'dmail',
                    url: '/tag/dmail',
                    logo: 'https://i.imgur.com/AEbd9jX.png',
                },
                {
                    name: 'effectai',
                    url: '/tag/effectai',
                    logo:
                        'https://s3-eu-west-1.amazonaws.com/prd-effectai-website/wp-content/uploads/2019/02/14110343/logo-menu2.png',
                },
                {
                    name: 'emanate',
                    url: '/tag/emanate',
                    logo:
                        'https://s3-ap-southeast-2.amazonaws.com/emanate.live/airdrop/img/favicon.png',
                },
                {
                    name: 'enumivo',
                    url: '/tag/enumivo',
                    logo:
                        'https://enumivo.org/wp-content/themes/enumivo/assets/img/enumivo-logo-only.png',
                },
                {
                    name: 'eos',
                    url: '/tag/eos',
                    logo: 'https://spee.ch/6/eos3.png',
                },
                {
                    name: 'eoscafe',
                    url: '/tag/eoscafe',
                    logo: 'https://spee.ch/a/mBI3blJ5400x400.jpg',
                },
                {
                    name: 'eoscanadacom',
                    url: '/tag/eoscanadacom',
                    logo: 'https://www.eoscanada.com/hubfs/eos-canada-logo-square-256px.png',
                },
                {
                    name: 'eosdac',
                    url: '/tag/eosdac',
                    logo:
                        'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/eosdac.jpg',
                },
                {
                    name: 'eosforce',
                    url: '/tag/eosforce',
                    logo: 'https://i.imgur.com/syBUWFJ.jpg',
                },
                {
                    name: 'eoshash',
                    url: '/tag/eoshash',
                    logo: 'https://ndi.340wan.com/image/eoshashcoins-hash.png',
                },
                {
                    name: 'eoslynx',
                    url: '/tag/eoslynx',
                    logo: 'https://i.imgur.com/ifbwqkV.png',
                },
                {
                    name: 'eosnation',
                    url: '/tag/eosnation',
                    logo:
                        'https://cdn.steemitimages.com/DQmQ3iK5GZLomDzeNQVd54PUKzEtoRG4dp5aJXd8BtVSUaW/eosnation.png',
                },
                {
                    name: 'eosnewyork',
                    url: '/tag/eosnewyork',
                    logo: 'https://i.imgur.com/8ZHAn7N.png',
                },
                {
                    name: 'eosswedenorg',
                    url: '/tag/eosswedenorg',
                    logo:
                        'https://eossweden.se/wp-content/uploads/2018/06/Square-Leaf-Banner-Wt-bkg-256.png',
                },
                {
                    name: 'eostribeprod',
                    url: '/tag/eostribeprod',
                    logo: 'https://s3.amazonaws.com/eostribe/eos-tribe-logo-square-256px.png',
                },
                {
                    name: 'eosvenezuela',
                    url: '/tag/eosvenezuela',
                    logo: 'https://ndi.340wan.com/image/cryptopesosc-pso.png',
                },
                {
                    name: 'eoswriterio',
                    url: '/tag/eoswriterio',
                    logo: 'https://spee.ch/@bigbluewhale:7/EOSwriter-Site-Icon.png',
                },
                {
                    name: 'escapeteamgame',
                    url: '/tag/escapeteamgame',
                    logo: 'https://spee.ch/4/escapeteamgamelogo.png',
                },
                {
                    name: 'eva',
                    url: '/tag/eva',
                    logo: 'https://spee.ch/5/logooo.jpg',
                },
                {
                    name: 'everipedia',
                    url: '/tag/everipedia',
                    logo: 'https://ndi.340wan.com/image/everipediaiq-iq.png',
                },
                {
                    name: 'faq',
                    url: '/tag/faq',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'franceos',
                    url: '/tag/franceos',
                    logo:
                        'https://www.franceos.fr/wp-content/uploads/2018/07/franceos-logo-256x256.png',
                },
                {
                    name: 'general',
                    url: '/tag/general',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'genereos',
                    url: '/tag/genereos',
                    logo: 'https://ndi.340wan.com/image/poormantoken-poor.png',
                },
                {
                    name: 'infiniverse',
                    url: '/tag/infiniverse',
                    logo: 'https://ndi.340wan.com/eos/infinicoinio-inf.png',
                },
                {
                    name: 'instar',
                    url: '/tag/instar',
                    logo: 'https://i.imgur.com/748dLEP.png',
                },
                {
                    name: 'itamgames',
                    url: '/tag/itamgames',
                    logo: 'https://spee.ch/0/logoaoe.jpg',
                },
                {
                    name: 'karma',
                    url: '/tag/karma',
                    logo: 'https://ndi.340wan.com/image/therealkarma-karma.png',
                },
                {
                    name: 'liquiddapps',
                    url: '/tag/liquiddapps',
                    logo: 'https://spee.ch/7/BxrRkQ6v400x400.jpeg',
                },
                {
                    name: 'lumeos',
                    url: '/tag/lumeos',
                    logo:
                        'https://cdn.steemitimages.com/DQmWGk4D33Cg7fRNwbDZnkEN42jnpu13a2A1UJHCLx3w8aR/pDMcrrlh_400x400.jpg',
                },
                {
                    name: 'meetone',
                    url: '/tag/meetone',
                    logo: 'https://ndi.340wan.com/eos/eosiomeetone-meetone.png',
                },
                {
                    name: 'metalpackagingtoken',
                    url: '/tag/metalpackagingtoken',
                    logo: 'https://spee.ch/e/IMG5888.jpeg',
                },
                {
                    name: 'mothereos',
                    url: '/tag/mothereos',
                    logo: 'https://spee.ch/8/logomothereos.jpg',
                },
                {
                    name: 'newdex',
                    url: '/tag/newdex',
                    logo: 'https://ndi.340wan.com/image/newdexissuer-ndx.png',
                },
                {
                    name: 'novusphere',
                    url: '/tag/novusphere',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'onessus',
                    url: '/tag/onessus',
                    logo: 'https://avatars0.githubusercontent.com/u/32319680?s=200&v=4',
                },
                {
                    name: 'parsl',
                    url: '/tag/parsl',
                    logo: 'https://ndi.340wan.com/eos/parslseed123-seed.png',
                },
                {
                    name: 'patreos',
                    url: '/tag/patreos',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'peosone',
                    url: '/tag/peosone',
                    logo: 'https://ndi.340wan.com/eos/thepeostoken-peos.png',
                },
                {
                    name: 'pixeos',
                    url: '/tag/pixeos',
                    logo:
                        'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/pixeos.png',
                },
                {
                    name: 'prospectors',
                    url: '/tag/prospectors',
                    logo: 'https://ndi.340wan.com/eos/prospectorsg-pgl.png',
                },
                {
                    name: 'publyto',
                    url: '/tag/publyto',
                    logo: 'https://www.publyto.io/img/logo.svg',
                },
                {
                    name: 'rex',
                    url: '/tag/rex',
                    logo: 'https://i.imgur.com/2VQutI7.png',
                },
                {
                    name: 'rovegas',
                    url: '/tag/rovegas',
                    logo: 'https://ndi.340wan.com/image/eosvegascoin-mev.png',
                },
                {
                    name: 'scatter',
                    url: '/tag/scatter',
                    logo: 'https://ndi.340wan.com/eos/ridlridlcoin-ridl.png',
                },
                {
                    name: 'sense',
                    url: '/tag/sense',
                    logo: 'https://spee.ch/d/sense-token-icon-1.png',
                },
                {
                    name: 'stakemine',
                    url: '/tag/stakemine',
                    logo: 'https://spee.ch/1/logostakemine.png',
                },
                {
                    name: 'steem',
                    url: '/tag/steem',
                    logo:
                        'https://spee.ch/5/steem-sign-2a02004c5ed4bbbae7600a370d34c18ea850de11f237815f2b6037745cf2db3a.png',
                },
                {
                    name: 'steemit',
                    url: '/tag/steemit',
                    logo:
                        'https://upload.wikimedia.org/wikipedia/commons/9/9f/Steemit_New_Logo.png',
                },
                {
                    name: 'switcheo',
                    url: '/tag/switcheo',
                    logo: 'https://i.imgur.com/6I3Q8bB.png',
                },
                {
                    name: 'teameos',
                    url: '/tag/teameos',
                    logo: 'https://spee.ch/@bigbluewhale:7/photo2019-05-0916-44-28.jpg',
                },
                {
                    name: 'teamgreymass',
                    url: '/tag/teamgreymass',
                    logo: 'https://greymass.com/greymass_logo_256X256.png',
                },
                {
                    name: 'telos',
                    url: '/tag/telos',
                    logo: 'https://i.imgur.com/xPgXVwp.png',
                },
                {
                    name: 'test',
                    url: '/tag/test',
                    logo: 'https://cdn.novusphere.io/static/atmos.svg',
                },
                {
                    name: 'travel',
                    url: '/tag/travel',
                    logo:
                        'https://cdn2.iconfinder.com/data/icons/location-map-simplicity/512/travel_agency-512.png',
                },
                {
                    name: 'trybe',
                    url: '/tag/trybe',
                    logo: 'https://ndi.340wan.com/eos/trybenetwork-trybe.png',
                },
                {
                    name: 'unlimitedtower',
                    url: '/tag/unlimitedtower',
                    logo:
                        'https://spee.ch/c7956468ab7217f0e6b3b2bce43c752b947b4804/01267215-1f25-4847-b278-c60d1daec24a.jpeg?7eb2da6fc48240cd96561a7ca2553752b6dfb5ebde614845e3a1f727db40512b:0',
                },
                {
                    name: 'whaleshares',
                    url: '/tag/whaleshares',
                    logo: 'https://spee.ch/d/3c6d93df736e77c4df4bbc3c89f532c5cbac1621.png',
                },
                {
                    name: 'worbli',
                    url: '/tag/worbli',
                    logo: 'https://miro.medium.com/max/2400/1*8LqCOymuRAzLp4SFhj-T_Q.png',
                },
            ].map(tag => {
                this.tags.set(tag.name, new TagModel(tag))
            })
        }
    }

    public setActiveTag = (tagName: string) => {
        let tagModel

        if (!this.tags.get(tagName)) {
            tagModel = new TagModel(tagName)
            this.tags.set(tagName, tagModel)
        } else {
            tagModel = this.tags.get(tagName)
        }

        this.activeTag = tagModel
        return tagModel
    }

    public setActiveSub = (sub: string) => {
        let subModel

        if (!this.subs.get(sub)) {
            subModel = new TagModel(sub)
            this.subs.set(sub, subModel)
        } else {
            subModel = this.tags.get(sub)
        }

        this.activeTag = subModel
    }

    private setTopLevelTags = () => {
        ;[
            {
                name: 'home',
                url: '/',
            },
            {
                name: 'feed',
                url: '/feed',
            },
            {
                name: 'all',
                url: '/e/all',
            },
            {
                name: 'referendum',
                url: '/e/referendum',
            },
        ].map(topLevelTag => {
            this.tags.set(
                topLevelTag.name,
                new TagModel(topLevelTag, {
                    root: true,
                    url: topLevelTag.url,
                })
            )
        })
    }
}

export const getTagStore = getOrCreateStore('tagStore', Tag)
