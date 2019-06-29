import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'

interface ITagProps {
    tagStore: IStores['tagStore']
    tagName: undefined | string
}

@inject('tagStore')
@observer
class Tag extends React.Component<ITagProps> {
    static async getInitialProps({ router }) {
        return {
            tagName: router.query.name,
        }
    }

    componentWillMount(): void {
        if (this.props.tagName && this.props.tagStore.tags.has(this.props.tagName)) {
            this.props.tagStore.setActiveTag(this.props.tagName)
        }
    }

    public render() {
        if (!this.props.tagStore.activeTag) {
            return <span>Tag: {this.props.tagName} not found</span>
        }

        return <span>{this.props.tagStore.activeTag.name}</span>
    }
}

export default Tag
