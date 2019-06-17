import * as React from 'react';
import {inject, observer} from "mobx-react";
import TagStore from '../../stores/tag'

interface ITitleHeaderProps {
    tagStore: TagStore
}

@inject('tagStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps> {
    public render(): React.ReactNode {
        return <div className={'title-header flex items-center'}>
            <div className={'container flex justify-between'}>
                <span className={'f4'}>
                    {this.props.tagStore.activeTag || 'home'}
                </span>
                <div className={'flex'}>
                    <a className="f5 link dim br3 ph3 pv2 mb2 dib white bg-black mr2" href="#0">Login</a>
                    <a className="f5 link dim br3 ph3 pv2 mb2 dib white bg-black" href="#0">Set ID</a>
                </div>
            </div>
        </div>
    }
}

export default TitleHeader as any
