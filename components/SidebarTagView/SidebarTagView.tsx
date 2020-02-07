import React, { FunctionComponent } from 'react'

import styles from './SidebarTagView.module.scss'
import { useRouter } from 'next/router'
import { useStores } from '@stores'
import { Avatar, Button, Divider, Icon } from 'antd'
import Link from 'next/link'

interface ISidebarTagViewProps {}

const SidebarTagView: FunctionComponent<ISidebarTagViewProps> = () => {
    const router = useRouter()
    const { tagStore } = useStores()

    if (router.pathname.indexOf('/tag/') !== -1) {
        // get the name
        const [, , tag] = router.asPath.split('/')
        const tagObj = tagStore.tagModelFromObservables(tag)

        return (
            <div className={'pa4 bg-white list card mb3'}>
                <span className={'flex flex-row items-center'}>
                    <span className={'pr3 dib'}>
                        <Avatar src={tagObj.logo} size={'large'} />
                    </span>
                    <span>
                        <Link href={'/tag/[name]'} as={`/tag/${tag}`}>
                            <a className={'f5 black db'}>#{tag}</a>
                        </Link>
                        {typeof tagObj.memberCount !== 'undefined' && (
                            <span className={'f6 db gray'}>{tagObj.memberCount} members</span>
                        )}
                    </span>
                </span>
                {tagObj.tagDescription && (
                    <>
                        <Divider />
                        <span className={'f6'}>{tagObj.tagDescription}</span>
                    </>
                )}
                <div className={'mt3'}>
                    <Button block onClick={() => tagStore.toggleSubscribe(tag)}>
                        {tagStore.subscribed.indexOf(tag) !== -1 ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                </div>
                <div className={'mt3'}>
                    <Button
                        block
                        type={'primary'}
                        onClick={() =>
                            router.push(`/new?tag=${tag}`, `/new`, {
                                shallow: true,
                            })
                        }
                    >
                        Create Post
                    </Button>
                </div>
            </div>
        )
    }

    return null
}

SidebarTagView.defaultProps = {}

export default SidebarTagView
