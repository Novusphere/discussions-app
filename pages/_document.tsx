import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
	render() {
		return (
			<html>
				<Head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
					<link rel="icon" href="./static/images/atmos2.png" data-vue-meta="true" />
					<meta charSet="utf-8" />
				</Head>
				<style jsx global>{`
				  body {
					padding: 0;
					margin: 0;
				  }
				`}</style>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		)
	}
}
