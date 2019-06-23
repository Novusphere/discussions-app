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
            'faq',
            'novusphere',
            'bounties',
            'eos',
            'eoscafe',
            'enumivo',
            'pixeos',
            'B1June',
            'airdropsdac',
            'unlimitedtower',
            'parsl',
            'scatter',
            'eva',
            'publyto',
            'boid',
            'trybe',
            'emanate',
            'meetone',
            'teamgreymass',
            'eosswedenorg',
            'cryptolions1',
            'eostribeprod',
            'eoscanadacom',
            'rex',
            'boscore',
            'eosforce',
            'worbli',
            'newdex',
            'prospectors',
            'patreos',
            'trybe',
            'karma',
            'general',
            'telos',
            'everipedia',
            'eosdac',
            'anon-r-eos',
            'atticlab',
            'liquiddapps',
            'dabble',
            'eoshash',
            'eoslynx',
            'rovegas',
            'franceos',
            'genereos',
            'switcheo',
            'peosone',
            'travel',
            'infiniverse',
            'eosvenezuela',
            'onessus',
            'catchthefrog',
            'steemit',
            'steem',
            'whaleshares',
            'itamgames',
            'anoxio',
            'betking',
            'sense',
            'metalpackagingtoken',
            'escapeteamgame',
            'stakemine',
            'dmail',
            'effectai',
            'diceone',
            'lumeos',
            'eosnation',
            'eosnewyork',
            'instar',
            'UXfyre',
            'mothereos',
            'eoswriterio',
            'teameos',
            'pumlhealthio',
            'paytomat',
            'Voice',
        ].map(tag => {
            this.tags.set(tag, new TagModel(tag, ''))
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
        ;['home', 'feed', 'all', 'referendum'].map(topLevelTag => {
            this.tags.set(
                topLevelTag,
                new TagModel(topLevelTag, '', {
                    root: true,
                })
            )
        })
    }
}
