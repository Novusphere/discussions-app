import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { action, observable } from 'mobx'
import { task } from 'mobx-task'
import { discussions } from '@novuspherejs'
import { getNewAuthStore, getUiStore, IStores } from '@stores/index'

export default class SignUpStore extends BaseStore {
    // signup object
    @observable signUpObject = {
        brianKey: '',
        username: '',
        password: '',
        passwordVerify: '',

        brianKeyVerify: '',
    }

    @observable uiForm = {
        currentStep: 1,
    }

    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()

    /**
     * Ui Controls
     */
    @action.bound
    public goNext() {
        this.uiForm.currentStep++
    }

    @action.bound
    public goBack() {
        this.uiForm.currentStep--
    }

    /**
     * Signup forms
     */
    get signUpForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { displayName, password } = form.values()

                    if (!form.hasError) {
                        this.signUpObject.username = displayName
                        this.signUpObject.password = password
                    }
                },
            },
            [
                {
                    name: 'displayName',
                    label: 'Display Name',
                    type: 'text',
                    value: this.signUpObject.username,
                    placeholder: 'Your display name',
                    rules: 'required|string|between:3,25',
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    value: this.signUpObject.password,
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
                {
                    name: 'passwordConfirm',
                    label: 'Password Confirmation',
                    type: 'password',
                    value: this.signUpObject.passwordVerify,
                    placeholder: 'Confirm Password',
                    onComplete: form => {
                        if (!form.hasError) {
                            this.goNext()
                        }
                    },
                    rules: 'required|string|same:password',
                },
            ]
        )
    }

    get verifyBKForm() {
        return new CreateForm(
            {
                onSubmit: this.onSubmitVerifyBkForm,
            },
            [
                {
                    name: 'bkVerify',
                    label: 'Verify your brain key',
                    type: 'textarea',
                    rules: 'required|string',
                    options: {
                        validateOnChange: true,
                    },
                },
            ]
        )
    }

    @task.resolved
    @action.bound
    private async onSubmitVerifyBkForm(form) {
        const { bkVerify } = form.values()

        if (!form.hasError) {
            this.signUpObject.brianKeyVerify = bkVerify

            const { password, brianKey, username, brianKeyVerify } = this.signUpObject

            if (brianKey === brianKeyVerify) {
                await this.authStore.signUpWithBK(brianKeyVerify, username, password)
                await this.authStore.loginWithBK(brianKeyVerify, username, password, {
                    hideSuccessModal: true,
                })
            } else {
                this.uiStore.showToast(
                    'The key you entered does not match the one we generated. Please try again.',
                    'error'
                )
            }
        }
    }

    @task.resolved
    @action.bound
    public async generateBrianKey() {
        const key = discussions.bkCreate()
        console.log('Class: SignUpStore, Function: generateBrianKey, Line 111 key: ', key)
        this.signUpObject.brianKey = key
        return key
    }
}

export const getSignUpStore = getOrCreateStore('signUpStore', SignUpStore)
