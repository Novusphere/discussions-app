import * as React from 'react';
import {observer} from 'mobx-react';
import {Feed} from "@components";

@observer
class Index extends React.Component<any, any> {
    public render(): React.ReactNode {
        return <Feed/>
    }
}

export default Index;
