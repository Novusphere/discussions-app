import React, { FunctionComponent, useState } from 'react'

import styles from './ReplyingPostPreview.module.scss'
import { useObserver } from 'mobx-react-lite'
import { Replies } from '@components'
import { RootStore, useStores } from '@stores'
import { getIdenticon } from '@utils'
import cx from 'classnames'

interface IReplyingPostPreviewProps {
    className?: string
    content: string
}

const ReplyingPostPreview: FunctionComponent<IReplyingPostPreviewProps> = ({ className, content }) => {
    const { authStore }: RootStore = useStores()

    return useObserver(() => (
        <div className={cx(['bg-white mt3 pa3 shadow-1 br2', className])}>
            <Replies
                preview
                highlightedPostUUID={''}
                threadUsers={[]}
                setHighlightedPosUUID={null}
                reply={
                    {
                        id: 47618898822,
                        transaction:
                            '8d36efc560ad3401059b26691245865dd7200283c1d7be35e4d9559a8d96d068',
                        blockApprox: 103755609,
                        chain: 'eos',
                        parentUuid: 'ee5798b4-d795-4a3e-bf40-43529ff10429',
                        threadUuid: 'ee5798b4-d795-4a3e-bf40-43529ff10429',
                        editUuid: '',
                        uuid: '40f80eb3-6c70-4695-93bc-6aa8f836074a',
                        title: '',
                        poster: 'eosforumanon',
                        displayName: authStore.displayName,
                        content: content,
                        createdAt: '2020-02-06T11:19:03.000Z',
                        editedAt: '1970-01-01T00:00:00.000Z',
                        sub: 'crypto',
                        tags: ['crypto', 'atmos', 'tip'],
                        mentions: [],
                        edit: false,
                        uidw: 'EOS7YrEup7dQ82v3wF3RjxXe7RG3yosz1SXVRjMwgT1fdHsgHZ8MJ',
                        tips: null,
                        imageData: getIdenticon(authStore.postPub),
                        pub: 'EOS5JRFmNRpb8f4kBeFfVVU8Kgu7vdPHQhgaE29R7qijZLS2m8Ug3',
                        sig:
                            'SIG_K1_KfqBNhi5Y2VBgudjEid6va8L2Uog1NSuLXogpE9h76b26jSLq6LL7kBR25HCgQVH3UshiNdtDJyXyGCkYS9NcxMf54VCXS',
                        verifySig: '',
                        replies: [],
                        totalReplies: 1,
                        score: 0,
                        upvotes: 1,
                        downvotes: 0,
                        depth: 1,
                        myVote: [],
                        pinned: false,
                    } as any
                }
            />
        </div>
    ))
}

ReplyingPostPreview.defaultProps = {}

export default ReplyingPostPreview
