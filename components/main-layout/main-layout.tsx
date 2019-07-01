import * as React from 'react'
import Head from 'next/head'
import { inject, observer } from 'mobx-react'
import { AppModals, Sidebar, TitleHeader } from '@components'
import { TagModel } from '@models/tagModel'

import '../../styles/style.scss'
import { IStores } from '@stores/index'

interface IMainLayoutProps {
    activeBanner: string
    tagStore: IStores['tagStore']
    tags: IStores['tagStore']['tags']
}

@inject('tagStore')
@observer
class MainLayout extends React.Component<IMainLayoutProps> {
    public onClickTag = (tag: TagModel) => {
        this.props.tagStore.setActiveTag(tag.name)
    }

    public render() {
        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>

                <div className={'w-100 header-image o-50'}>{this.props.activeBanner}</div>
                <TitleHeader />
                <AppModals />
                <div className={'content'}>
                    <div className={'container flex pv3'}>
                        <div className={'w-30 card sidebar mr3'}>
                            <Sidebar tags={this.props.tags} onClick={this.onClickTag} />
                        </div>
                        <div className={'w-70'}>{this.props.children}</div>
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
