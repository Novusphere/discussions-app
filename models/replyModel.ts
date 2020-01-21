import { action, computed, observable, set } from 'mobx'
import { task } from 'mobx-task'
import { getAuthStore, getUiStore, IStores } from '@stores'
import PostModel from '@models/postModel'
import { CreateForm } from '@components'
import EditModel from '@models/editModel'
import { Messages, ModalOptions } from '@globals'
import { discussions } from '@novuspherejs'
import { transformTipsToTransfers } from '@utils'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: PostModel }

    public readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly authStore: IStores['authStore'] = getAuthStore()

    // the post replying to
    @observable post: PostModel = null

    @observable editing = false

    constructor(post: PostModel, map: { [p: string]: PostModel }) {
        this.post = post
        this.uid = post.uuid
        this.map = map
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
    }

    @action.bound
    toggleEditing(overwriteValue?: boolean) {
        if (overwriteValue) {
            this.editing = overwriteValue
            return
        }

        this.editing = !this.editing

        if (this.editing) {
            this.content = this.post.content
        }
    }

    @computed get canEditPost() {
        return this.post.pub === this.authStore.activePublicKey
    }

    @task.resolved
    @action.bound
    async saveEdits(form) {
        if (!form.hasError) {
            const { content } = form.values()
            const { postPriv, posterType, posterName } = this.authStore

            const editModel = new EditModel({
                content: content,
                posterName: posterName,
                posterType: posterType,
                postPriv: postPriv,
                cached: this.post,
            })

            try {
                const reply = await editModel.submitEdits()

                this.post.content = reply.content
                this.post.pub = reply.pub
                this.post.editedAt = new Date(Date.now())
                this.post.transaction = reply.transaction
                this.post.edit = true

                this.uiStore.showToast('Your post has been edited!', 'success')
                this.toggleEditing()
            } catch (error) {
                this.post.content = editModel.cached.content
                this.uiStore.showToast('There was an error editing your post', 'error')
            }
        }
    }

    get editForm() {
        return new CreateForm({}, [
            {
                name: 'content',
                label: 'Content',
                value: this.content,
                hideLabels: true,
                type: 'richtext',
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                extra: {
                    options: [
                        {
                            value: 'Cancel',
                            className: 'white bg-red',
                            title: 'Cancel changes to your post',
                            onClick: () => {
                                this.editing = false
                            },
                        },
                        {
                            value: 'Save',
                            title: 'Save changes to your post',
                            onClick: this.saveEdits,
                        },
                    ],
                },
            },
        ])
    }

    @action.bound
    private waitForUserInput(cb: any) {
        const int = setInterval(() => {
            const { temporaryWalletPrivateKey, hasRenteredPassword } = this.authStore

            if (temporaryWalletPrivateKey) {
                clearInterval(int)
                return cb(temporaryWalletPrivateKey, hasRenteredPassword)
            }
        }, 100)
    }

    @task.resolved
    @action.bound
    async onSubmit(activeThread: any) {
        if (!this.authStore.hasAccount) {
            this.uiStore.showToast('You must be logged in to comment', 'error')
            return
        }

        if (!this.content) {
            this.uiStore.showToast(Messages.ERROR.POST_EMPTY, 'error')
            return
        }

        const {
            postPriv,
            posterType,
            posterName,
            activeUidWalletKey,
            supportedTokensForUnifiedWallet,
        } = this.authStore

        const instance = new EditModel({
            content: this.content,
            posterName: posterName,
            posterType: posterType,
            postPriv: postPriv,
            cached: {
                ...this.post,
                content: this.content,
            },
        })

        const reply = instance.createPostObject()
        reply.uidw = activeUidWalletKey

        try {
            if (activeThread) {
                const askForPassAndSubmit = async () => {
                    return new Promise((resolve, reject) => {
                        return this.waitForUserInput(async (key, hasRenteredPassword) => {
                            if (!key) {
                                reply.transfers = []
                                return reject(
                                    new Error(
                                        "Skipping tips as you currently don't have a wallet key. Please re-login to generate one."
                                    )
                                )
                            }

                            this.authStore.hasRenteredPassword = false

                            if (key === 'false') {
                                this.uiStore.hideModal()
                                this.authStore.clearWalletPrivateKey()
                                this.uiStore.showToast('The password you have entered is invalid.', 'error')
                                return reject(
                                    new Error('The password you have entered is invalid.')
                                )
                            }

                            // cache key
                            const privateKey = `${key}`
                            // clear key from app
                            this.authStore.clearWalletPrivateKey()

                            if (privateKey) {
                                reply.transfers = transformTipsToTransfers(
                                    reply.transfers,
                                    this.post.uidw,
                                    privateKey,
                                    supportedTokensForUnifiedWallet
                                )

                                try {
                                    await finishSubmitting()
                                    resolve()
                                } catch (error) {
                                    return reject(error.message)
                                }
                            }
                        })
                    })
                }

                const finishSubmitting = async () => {
                    try {
                        const model = new PostModel(reply as any)
                        const signedReply = model.sign(this.authStore.postPriv)
                        const confirmedReply = await discussions.post(signedReply as any)

                        const confirmedModel = new PostModel({
                            ...confirmedReply,
                        })

                        set(activeThread, {
                            map: {
                                ...activeThread.map,
                                [reply.id]: confirmedModel,
                            },
                        })

                        if (confirmedReply.parentUuid === this.post.threadUuid) {
                            set(activeThread, {
                                openingPostReplies: [
                                    ...activeThread.openingPostReplies,
                                    confirmedModel,
                                ],
                            })
                        } else {
                            this.toggleOpen()
                        }

                        this.clearContent()
                        this.uiStore.showToast('Your reply has been submitted!', 'success')
                    } catch (error) {
                        this.uiStore.showToast(error.message, 'error')
                        throw error
                    }
                }

                // deal with tips
                if (reply.transfers) {
                    // prompt user to enter password
                    this.uiStore.showModal(ModalOptions.walletActionPasswordReentry)
                    await askForPassAndSubmit()
                } else {
                    await finishSubmitting()
                }
            } else {
                this.uiStore.showToast('Failed to submit your reply', 'error')
            }
        } catch (error) {
            // this.uiStore.showToast(error.message, 'error')
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
