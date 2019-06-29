import { extendObservable, observable } from 'mobx'
import { TagModel } from '@models/tagModel'
import { SubModel } from '@models/subModel'

const defaultState = {
    activeTag: null,
    activeSub: null,
    tags: [],
}

export default class Tag {
    @observable activeTag: TagModel | null = null
    @observable activeSub: SubModel | null = null
    @observable tags = observable.map<string, TagModel>()
    @observable subs = observable.map<string, TagModel>()

    constructor(Tag = null) {
        extendObservable(this, Tag || defaultState)

        // set top level tags
        this.setTopLevelTags()

        // hard code tags
        ;[
            {
                name: 'faq',
                url: '/tag/faq',
            },
            {
                name: 'novusphere',
                url: '/tag/novusphere',
            },
            {
                name: 'bounties',
                url: '/tag/bounties',
            },
            {
                name: 'eos',
                url: '/tag/eos',
            },
            {
                name: 'eoscafe',
                url: '/tag/eoscafe',
            },
            {
                name: 'enumivo',
                url: '/tag/enumivo',
            },
            {
                name: 'pixeos',
                url: '/tag/pixeos',
            },
            {
                name: 'B1June',
                url: '/tag/B1June',
            },
            {
                name: 'airdropsdac',
                url: '/tag/airdropsdac',
            },
            {
                name: 'unlimitedtower',
                url: '/tag/unlimitedtower',
            },
            {
                name: 'parsl',
                url: '/tag/parsl',
            },
            {
                name: 'scatter',
                url: '/tag/scatter',
            },
            {
                name: 'eva',
                url: '/tag/eva',
            },
            {
                name: 'publyto',
                url: '/tag/publyto',
            },
            {
                name: 'boid',
                url: '/tag/boid',
            },
            {
                name: 'trybe',
                url: '/tag/trybe',
            },
            {
                name: 'emanate',
                url: '/tag/emanate',
            },
            {
                name: 'meetone',
                url: '/tag/meetone',
            },
            {
                name: 'teamgreymass',
                url: '/tag/teamgreymass',
            },
            {
                name: 'eosswedenorg',
                url: '/tag/eosswedenorg',
            },
            {
                name: 'cryptolions1',
                url: '/tag/cryptolions1',
            },
            {
                name: 'eostribeprod',
                url: '/tag/eostribeprod',
            },
            {
                name: 'eoscanadacom',
                url: '/tag/eoscanadacom',
            },
            {
                name: 'rex',
                url: '/tag/rex',
            },
            {
                name: 'boscore',
                url: '/tag/boscore',
            },
            {
                name: 'eosforce',
                url: '/tag/eosforce',
            },
            {
                name: 'worbli',
                url: '/tag/worbli',
            },
            {
                name: 'newdex',
                url: '/tag/newdex',
            },
            {
                name: 'prospectors',
                url: '/tag/prospectors',
            },
            {
                name: 'patreos',
                url: '/tag/patreos',
            },
            {
                name: 'trybe',
                url: '/tag/trybe',
            },
            {
                name: 'karma',
                url: '/tag/karma',
            },
            {
                name: 'general',
                url: '/tag/general',
            },
            {
                name: 'telos',
                url: '/tag/telos',
            },
            {
                name: 'everipedia',
                url: '/tag/everipedia',
            },
            {
                name: 'eosdac',
                url: '/tag/eosdac',
            },
            {
                name: 'anon-r-eos',
                url: '/tag/anon-r-eos',
            },
            {
                name: 'atticlab',
                url: '/tag/atticlab',
            },
            {
                name: 'liquiddapps',
                url: '/tag/liquiddapps',
            },
            {
                name: 'dabble',
                url: '/tag/dabble',
            },
            {
                name: 'eoshash',
                url: '/tag/eoshash',
            },
            {
                name: 'eoslynx',
                url: '/tag/eoslynx',
            },
            {
                name: 'rovegas',
                url: '/tag/rovegas',
            },
            {
                name: 'franceos',
                url: '/tag/franceos',
            },
            {
                name: 'genereos',
                url: '/tag/genereos',
            },
            {
                name: 'switcheo',
                url: '/tag/switcheo',
            },
            {
                name: 'peosone',
                url: '/tag/peosone',
            },
            {
                name: 'travel',
                url: '/tag/travel',
            },
            {
                name: 'infiniverse',
                url: '/tag/infiniverse',
            },
            {
                name: 'eosvenezuela',
                url: '/tag/eosvenezuela',
            },
            {
                name: 'onessus',
                url: '/tag/onessus',
            },
            {
                name: 'catchthefrog',
                url: '/tag/catchthefrog',
            },
            {
                name: 'steemit',
                url: '/tag/steemit',
            },
            {
                name: 'steem',
                url: '/tag/steem',
            },
            {
                name: 'whaleshares',
                url: '/tag/whaleshares',
            },
            {
                name: 'itamgames',
                url: '/tag/itamgames',
            },
            {
                name: 'anoxio',
                url: '/tag/anoxio',
            },
            {
                name: 'betking',
                url: '/tag/betking',
            },
            {
                name: 'sense',
                url: '/tag/sense',
            },
            {
                name: 'metalpackagingtoken',
                url: '/tag/metalpackagingtoken',
            },
            {
                name: 'escapeteamgame',
                url: '/tag/escapeteamgame',
            },
            {
                name: 'stakemine',
                url: '/tag/stakemine',
            },
            {
                name: 'dmail',
                url: '/tag/dmail',
            },
            {
                name: 'effectai',
                url: '/tag/effectai',
            },
            {
                name: 'diceone',
                url: '/tag/diceone',
            },
            {
                name: 'lumeos',
                url: '/tag/lumeos',
            },
            {
                name: 'eosnation',
                url: '/tag/eosnation',
            },
            {
                name: 'eosnewyork',
                url: '/tag/eosnewyork',
            },
            {
                name: 'instar',
                url: '/tag/instar',
            },
            {
                name: 'UXfyre',
                url: '/tag/UXfyre',
            },
            {
                name: 'mothereos',
                url: '/tag/mothereos',
            },
            {
                name: 'eoswriterio',
                url: '/tag/eoswriterio',
            },
            {
                name: 'teameos',
                url: '/tag/teameos',
            },
            {
                name: 'pumlhealthio',
                url: '/tag/pumlhealthio',
            },
            {
                name: 'paytomat',
                url: '/tag/paytomat',
            },
            {
                name: 'Voice',
                url: '/tag/Voice',
            },
        ].map(tag => {
            this.tags.set(tag.name, new TagModel(tag, ''))
        })
    }

    public setActiveTag = (tagName: string) => {
        let tagModel

        if (!this.tags.get(tagName)) {
            tagModel = new TagModel(tagName, '')
            this.tags.set(tagName, tagModel)
        } else {
            tagModel = this.tags.get(tagName)
        }

        this.activeTag = tagModel
    }

    public setActiveSub = (subName: string) => {
        let subModel

        if (!this.subs.get(subName)) {
            subModel = new TagModel(subName, '')
            this.subs.set(subName, subModel)
        } else {
            subModel = this.tags.get(subName)
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
                new TagModel(topLevelTag, '', {
                    root: true,
                    url: topLevelTag.url,
                })
            )
        })
    }
}
