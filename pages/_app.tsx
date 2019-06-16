import App, { Container } from 'next/app'
import React from 'react'
import Stores from '../stores';
import { Provider } from 'mobx-react'

class DiscussionApp extends App {
	private stores: any;

	static async getInitialProps(ctx) {
		let userState = null;
		const isServer = !!ctx.req;

		if (isServer === true) {
			const User = Stores('__userStore__',{});
			userState = User.getUserFromCookie(ctx.req);
		}

		return {
			isServer,
			userState,
		};
	}

	constructor(props) {
		super(props);
		this.stores = {
			userStore: Stores('__userStore__', props.userState),
		}
	}

	public render() {
		const { Component, pageProps } = (this as any).props
		return (
			<Container>
				<Provider {...this.stores}>
					<Component {...pageProps} />
				</Provider>
			</Container>
		)
	}
}

export default DiscussionApp
