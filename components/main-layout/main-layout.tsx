import * as React from 'react'
import Head from 'next/head';
import {observer} from "mobx-react";

interface IMainLayoutProps {
    activeBanner: string
}

import '../../styles/style.scss';

@observer
class MainLayout extends React.Component<IMainLayoutProps> {
    public render() {
        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>

                <div className={'w-100 header-image'}>
                    {this.props.activeBanner}
                </div>
                {this.props.children}
            </>
        );
    }
}

export default MainLayout
