import { extendObservable } from 'mobx'
import { CreateForm } from '@components'

const defaultState = {}

export default class Settings {
    /**
     * Must have constructor to set default state from SSR
     * @param Settings
     */
    constructor(Settings = null) {
        extendObservable(this, Settings || defaultState)
    }

    get setIdForm() {
        return new CreateForm(
            {
                onSuccess: form => {
                    console.log(form)
                },
            },
            [
                {
                    name: 'name',
                    label: `Name`,
                    placeholder: 'Enter your desired ID',
                    rules: 'required|string',
                    extra: {
                        leftLabel: 'Name',
                    },
                },
                {
                    name: 'key',
                    label: `Key`,
                    value: '123123123',
                    rules: 'required|string',
                    extra: {
                        leftLabel: 'Key',
                    },
                },
            ]
        )
    }

    get moderationForm() {
        return new CreateForm(
            {
                onSuccess: form => {
                    console.log(form)
                },
            },
            [
                {
                    name: 'known',
                    label: `Known`,
                    placeholder: 'Select a url',
                    rules: 'required|string',
                    type: 'dropdown',
                    extra: {
                        options: [
                            {
                                value: 'novusphere',
                                label: 'novusphereio (forum.novusphere.io)',
                            },
                            {
                                value: 'rama3wi4o324',
                                label: 'rama3wi4o324 (spacefun.github.io)',
                            },
                        ],
                    },
                },
                {
                    name: 'key',
                    label: null,
                    placeholder: 'endpoint',
                    rules: 'required|string',
                },
            ]
        )
    }

    get rawForm() {
        return new CreateForm(
            {
                onSuccess: form => {
                    console.log(form)
                },
            },
            [
                {
                    name: 'key',
                    label: null,
                    type: 'textarea',
                    value: `{
                              "atmos_upvotes": true,
                              "scatter_timeout": 3000,
                              "theme": "https://eos-forum.org/static/css/theme/day.css",
                              "novusphere_api": "https://db.novusphere.io",
                              "eos_api": {
                                "host": "eos.greymass.com",
                                "port": "443",
                                "protocol": "https"
                              }
                            }`,
                    rules: 'required|string',
                },
            ]
        )
    }
}
