import * as React from 'react'
import Head from 'next/head';

class MainLayout extends React.Component {
    public render() {
        return (
            <>
                <Head>
                    <title>A decentralized forum | Home</title>
                </Head>
                {this.props.children}
            </>
        );
    }
}

export default MainLayout
