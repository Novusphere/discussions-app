import * as React from 'react'
import { inject, observer } from 'mobx-react'
import TagStore from '../../stores/tag'
import { Link } from '@router'

interface ITitleHeaderProps {
    tagStore: TagStore
}

@inject('tagStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps> {
    public render(): React.ReactNode {
        return (
            <div className={'title-header flex items-center z-999'}>
                <div className={'container flex items-center justify-between'}>
                    <span className={'f4 black'}>
                        {this.props.tagStore.activeTag
                            ? this.props.tagStore.activeTag.name
                            : 'home'}
                    </span>
                    <div className={'flex'}>
                        <a className="f6 link dim br2 ph3 pv2 dib white bg-green mr2" href="#0">
                            Login
                        </a>
                        <Link route={'/settings'}>
                            <a className="f6 link dim br2 ph3 pv2 dib white bg-green mr2">Set ID</a>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}

export default TitleHeader as any
