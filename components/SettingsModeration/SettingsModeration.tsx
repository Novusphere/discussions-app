import { RootStore, useStores } from '@stores'
import { useObserver } from 'mobx-react-lite'
import { Avatar, Button, Table } from 'antd'
import { getIdenticon } from '@utils'
import React from 'react'
import { Link } from 'react-router-dom'

const Moderation = () => {
    const { userStore, tagStore, authStore }: RootStore = useStores()

    if (!authStore.hasAccount) {
        return <span className={'f6 gray'}>Please sign in to view this option</span>
    }

    const dataSource = useObserver(() =>
        [...userStore.delegated.toJS()].map(([delegated, date]) => {
            const [name, key, tag] = delegated.split(':')
            return {
                key: delegated,
                name: name,
                tag: tag,
                uidw: key,
            }
        })
    )

    const columns = [
        {
            title: 'Display Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: React.ReactNode, record: { uidw: string }) => {
                return (
                    <>
                        <Avatar src={getIdenticon(record.uidw)} />
                        <span className={'ml3'}>
                            <Link to={`/u/${name}-${record.uidw}`}>{name}</Link>
                        </span>
                    </>
                )
            },
            sortDirections: ['descend', 'ascend'],
            sorter: (a: { name: number }, b: { name: number }) =>
                a.name === b.name ? 0 : a.name < b.name ? -1 : 1,
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag',
            render: (tag: React.ReactNode, record: any) => {
                const tagModel = tagStore.tagModelFromObservables(tag)
                return (
                    <>
                        <Avatar src={tagModel.logo} />
                        <span className={'ml3'}>
                            <Link to={`/tag/${tag}`}>#{tag}</Link>
                        </span>
                    </>
                )
            },

            sortDirections: ['descend', 'ascend'],
            sorter: (a: { tag: number }, b: { tag: number }) =>
                a.tag === b.tag ? 0 : a.tag < b.tag ? -1 : 1,
        },
        {
            key: 'action',
            render: (text: any, record: { name: any; uidw: any; tag: string }) => (
                <>
                    <Button
                        size={'small'}
                        type={'danger'}
                        key={'unblock'}
                        onClick={() =>
                            userStore.setModerationMemberByTag(
                                `${record.name}:${record.uidw}`,
                                record.tag
                            )
                        }
                    >
                        remove
                    </Button>
                </>
            ),
        },
    ] as any

    return useObserver(() => (
        <>
            <span className={'f6 gray'}>Here you can set the moderators you have delegated.</span>
            <Table
                locale={{
                    emptyText: <span>You have no delegated users</span>,
                }}
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                className={'mt4'}
            />
        </>
    ))
}

export default Moderation
