import React, { useCallback, useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import { RootStore, useStores } from '@stores'
import { useObserver } from 'mobx-react-lite'
import { Editor, RichTextPreview, UserNameWithIcon } from '@components'
import {
    createPostObject,
    encodeId,
    generateUuid,
    generateVoteObject,
    getIdenticon,
    openInNewTab,
    pushToThread,
    signPost,
} from '@utils'
import { discussions } from '@novuspherejs'
import Helmet from 'react-helmet'
import { useHistory } from 'react-router-dom';

const { Option } = Select

const NewPageNoSSRUnwrapped = ({ form, prefilledTag }: any) => {
    const { getFieldDecorator } = form
    const { tagStore, authStore, uiStore, userStore }: RootStore = useStores()
    const [loading, setLoading] = useState(false)
    const [isPreviewing, setPreview] = useState(false)
    const [options, setOptions] = useState(tagStore.tagsWithoutBaseOptions)
    const [newOption, setNewOption] = useState(null)
    const togglePreview = useCallback(() => setPreview(!isPreviewing), [])
    const history = useHistory()

    const handleSubmit = useCallback(e => {
        setLoading(true)
        e.preventDefault()
        form.validateFields(async (err: any, values: { tag: any; title: any; content: any }) => {
            if (!err) {
                setPreview(false)
                let { tag, title, content } = values

                // make sure tag doesn't have a hashtag in nit
                if (tag[0] === '#') {
                    let [, tagPreHas] = tag.split('#')
                    tag = tagPreHas
                }

                const uuid = generateUuid()

                const { data: vote } = generateVoteObject({
                    uuid: uuid,
                    postPriv: authStore.postPriv,
                    value: 1,
                })

                const post = createPostObject({
                    title,
                    content,
                    sub: tag,
                    parentUuid: '',
                    uuid: uuid,
                    threadUuid: uuid,
                    uidw: authStore.uidwWalletPubKey,
                    pub: '',
                    posterName: authStore.displayName,
                    skipId: true,
                    postPub: authStore.postPub,
                    postPriv: authStore.postPriv,
                })

                const { sig } = signPost({
                    privKey: authStore.postPriv,
                    uuid: post.uuid,
                    content: post.content,
                })

                post.vote = vote
                post.sig = sig

                try {
                    const submittedPost = await discussions.post(post as any)

                    const isPostValid = discussions.checkIfPostIsValid(submittedPost)

                    return new Promise((resolve, reject) => {
                        if (isPostValid) {
                            const id = encodeId(submittedPost)

                            const int = setInterval(async () => {
                                const getThread = await discussions.getThread(id, authStore.postPub)

                                if (getThread) {
                                    if (int) {
                                        clearInterval(int)
                                        setLoading(false)
                                        const url = await pushToThread(submittedPost)
                                        const newId = encodeId(submittedPost.openingPost as any)
                                        userStore.toggleThreadWatch(newId, 0, true)
                                        uiStore.showToast(
                                            'Success',
                                            'Your post has been successfully created',
                                            'success',
                                            {
                                                btn: (
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            openInNewTab(
                                                                `https://bloks.io/transaction/${submittedPost.transaction}`
                                                            )
                                                        }
                                                    >
                                                        View transaction
                                                    </Button>
                                                ),
                                            }
                                        )
                                        history.push(url)
                                        resolve()
                                    }
                                }
                            }, 2000)
                        }
                    })
                } catch (error) {
                    let message = error.message || 'Failed to create a new post'
                    uiStore.showToast('Failed', message, 'error')
                    setLoading(false)
                    return error
                }
            }
        })
    }, [])

    const handleOnSearch = useCallback(value => {
        if (value && value.length > 0) {
            if (options.find(option => option.value === value)) {
                return
            }

            if (value[0] !== '#') {
                value = `#${value}`
            }

            setNewOption(value)
        }
    }, [])

    return useObserver(() => (
        <div className={'w-100 bg-white card pa4'}>
            <span className={'f5 b db mb3'}>Create a new post in</span>
            <Form onSubmit={() => console.log('hey')}>
                <Form.Item>
                    {getFieldDecorator('tag', {
                        initialValue: prefilledTag,
                        rules: [
                            {
                                required: true,
                                message: 'Please select a tag',
                            },
                        ],
                    })(
                        <Select
                            size={'large'}
                            // mode={'tags'}
                            showSearch
                            style={{ width: '100%' }}
                            placeholder={'Enter a tag i.e. #eos'}
                            onSearch={handleOnSearch}
                        >
                            {newOption && options.filter(o => o === newOption).length === 0 && (
                                <Option key={newOption} value={newOption}>
                                    <img
                                        src={'https://cdn.novusphere.io/static/atmos.svg'}
                                        title={`${newOption} icon`}
                                        className={'mr2 dib'}
                                        width={15}
                                    />
                                    {newOption}
                                </Option>
                            )}
                            {options.map(option => {
                                const tag = tagStore.tagModelFromObservables(option.value)
                                if (!tag) return null
                                return (
                                    <Option key={option.value} value={option.value}>
                                        <img
                                            src={tag.logo}
                                            title={`${tag.name} icon`}
                                            className={'mr2 dib'}
                                            width={15}
                                        />
                                        {option.label}
                                    </Option>
                                )
                            })}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('title', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter a title for your post',
                            },
                        ],
                    })(<Input size={'large'} placeholder={'Post title'} />)}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('content', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter content for your post',
                            },
                        ],
                    })(<Editor />)}
                </Form.Item>
            </Form>
            <div className={'mt3 flex flex-row justify-end'}>
                <Button className={'mr2'} onClick={togglePreview} disabled={loading}>
                    Preview
                </Button>
                <Button type={'primary'} onClick={handleSubmit} loading={loading}>
                    Create new post
                </Button>
            </div>
            {form.getFieldValue('content') && isPreviewing && (
                <div className={'mt3 w-100 ba b--light-gray pa4 br3 relative'}>
                    <div className={'flex flex-row items-center'}>
                        <UserNameWithIcon
                            imageData={getIdenticon(authStore.postPub)}
                            pub={authStore.postPub}
                            name={authStore.displayName}
                        />
                        <div className={'w-100 ml3 bg-near-white pa2 mv1'} />
                    </div>
                    {form.getFieldValue('title') && (
                        <span className={'db mt3 b f4'}>{form.getFieldValue('title')}</span>
                    )}
                    <RichTextPreview hideFade className={'mt3'}>
                        {form.getFieldValue('content')}
                    </RichTextPreview>
                </div>
            )}
        </div>
    ))
}

const NewPageNoSSR = Form.create({ name: 'NewPost' })(NewPageNoSSRUnwrapped) as any

const NewPage: React.FC<any> = ({ prefilledTag }) => {
    return (
        <>
            <Helmet>
                <title>Discussions App - Create New Post</title>
            </Helmet>
            <NewPageNoSSR prefilledTag={prefilledTag} />
        </>
    )
}

// TODO: Move this to useEffect
// NewPage.getInitialProps = async ({ query }) => {
//     const prefilledTag = query.tag
//     return {
//         prefilledTag,
//     }
// }

export default NewPage
