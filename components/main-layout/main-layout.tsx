import * as React from 'react'
import Head from 'next/head'
import { observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import '../../styles/style.scss'
import { TagList, TitleHeader } from '../index'

interface IMainLayoutProps {
    activeBanner: string
    tags: TagStore['tags']
}

@observer
class MainLayout extends React.Component<IMainLayoutProps> {
    public render() {
        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>

                <div className={'w-100 header-image o-50'}>{this.props.activeBanner}</div>
                <TitleHeader />
                <div className={'content'}>
                    <div className={'container flex pv3'}>
                        <div className={'w-20'}>
                            <TagList tags={this.props.tags} />
                        </div>
                        <div className={'w-80'}>{this.props.children}</div>
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

export default MainLayout
