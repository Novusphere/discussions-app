import * as React from 'react'
import Head from 'next/head'
import { inject, observer } from 'mobx-react'
import { AppModals, Sidebar, TitleHeader } from '@components'
import classNames from 'classnames'
import { StickyContainer, Sticky } from 'react-sticky'

import { IStores } from '@stores'
import { getVersion } from '@utils'

interface IMainLayoutProps {
    tagStore: IStores['tagStore']
    uiStore: IStores['uiStore']
    settingsStore: IStores['settingsStore']
}

@inject('tagStore', 'uiStore', 'settingsStore')
@observer
class MainLayout extends React.Component<IMainLayoutProps> {
    public render() {
        const { activeTag, tags } = this.props.tagStore
        const { showBanner, showSidebar, activeBanner } = this.props.uiStore

        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>

                <StickyContainer>
                    <Sticky>
                        {({ style }) => (
                            <header
                                style={{
                                    ...style,
                                    zIndex: 9998,
                                }}
                            >
                                <TitleHeader />
                            </header>
                        )}
                    </Sticky>

                    {showBanner && (
                        <div className={'w-100 header-image'}>
                            <img
                                src={activeBanner}
                                title={'Active banner'}
                                alt={'Active banner image'}
                            />
                        </div>
                    )}
                    <AppModals />
                    <div className={'content'}>
                        <div className={'container flex pv3'}>
                            <Sidebar
                                className={classNames([
                                    'w-30 sidebar mr3',
                                    {
                                        dn: !showSidebar,
                                        'flex flex-column': showSidebar,
                                    },
                                ])}
                            />
                            <div
                                className={classNames([
                                    {
                                        'w-70': showSidebar,
                                        'w-100': !showSidebar,
                                    },
                                ])}
                            >
                                {this.props.children}
                            </div>
                        </div>
                    </div>

                    <footer>
                        <div className="tc lh-copy">
                            <p className={'b'}>
                                Version: {getVersion()} ({process.env.BUILD_ID})
                            </p>
                            <p>
                                This site is fully{' '}
                                <a href="https://github.com/Novusphere/discussions-app">
                                    open source
                                </a>
                                .
                                <br /><br />
                                The developers of this software take no responsibility for the
                                content displayed.
                                <br />
                                No images, files or media are hosted directly by the forum, please
                                contact the respective site owners hosting content in breach of DMCA
                            </p>
                        </div>
                    </footer>
                </StickyContainer>
            </>
        )
    }
}

export default MainLayout as any
