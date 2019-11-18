// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'
import ReactGA from "react-ga";

function trackPageView() {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return;
    }
    
    if (!(window as any).GA_INITIALIZED) {
        ReactGA.initialize("UA-152897893-1");
        (window as any).GA_INITIALIZED = true;
    }
    
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
}

export default class MyDocument extends Document {
    componentDidMount(): void {
        trackPageView()
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
                    <link rel="manifest" href="/static/site.webmanifest" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />
                </Head>
                <body style={{ margin: 0 }}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
