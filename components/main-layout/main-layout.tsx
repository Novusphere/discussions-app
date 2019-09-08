import * as React from 'react'
import Head from 'next/head'
import { inject, observer } from 'mobx-react'
import { AppModals, Sidebar, TitleHeader } from '@components'
import classNames from 'classnames'

import { IStores } from '@stores'

interface IMainLayoutProps {
    activeBanner: string
    tagStore: IStores['tagStore']
    uiStore: IStores['uiStore']
    tags: IStores['tagStore']['tags']
}

@inject('tagStore', 'uiStore')
@observer
class MainLayout extends React.Component<IMainLayoutProps> {
    public render() {
        const { activeTag } = this.props.tagStore
        const { showBanner, showSidebar } = this.props.uiStore

        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>

                <TitleHeader />

                {showBanner && (
                    <div className={'w-100 header-image'}>
                        <img
                            src={this.props.activeBanner}
                            title={'Active banner'}
                            alt={'Active banner image'}
                        />
                    </div>
                )}
                <AppModals />
                <div className={'content'}>
                    <div className={'container flex pv3'}>
                        {showSidebar && (
                            <div className={'w-30 card sidebar mr3'}>
                                <Sidebar tags={this.props.tags} activeTag={activeTag} />
                            </div>
                        )}
                        <div
                            className={classNames([
                                'w-70',
                                {
                                    'w-100': !showSidebar,
                                },
                            ])}
                        >
                            {this.props.children}
                        </div>
                    </div>
                </div>

                <footer>
                    <p className="tc lh-copy">
                        This site is hosted entirely from{' '}
                        <a href="https://github.com/Novusphere/novusphere-eos/tree/gh-pages">
                            GitHub Pages
                        </a>{' '}
                        and is fully{' '}
                        <a href="https://github.com/Novusphere/novusphere-eos">open source</a>.
                        <br />
                        The developers of this software take no responsibility for the content
                        displayed.
                        <br />
                        No images, files or media are hosted by the forum,
                        <br />
                        please contact the respective site owners hosting content in breach of DMCA.
                    </p>
                </footer>
            </>
        )
    }
}

export default MainLayout as any
