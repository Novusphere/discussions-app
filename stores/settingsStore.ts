import { CreateForm } from '@components'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { observable } from 'mobx'
import { persist } from 'mobx-persist'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

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
                },
                {
                    name: 'key',
                    label: `Key`,
                    value: '123123123',
                    rules: 'required|string',
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
                    label: 'Key',
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

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
