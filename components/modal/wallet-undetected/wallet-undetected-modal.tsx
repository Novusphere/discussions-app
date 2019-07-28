import * as React from 'react'
import { Modal } from '@components'

const WalletUndetectedModal: React.FC = () => (
    <Modal>
        {({ CloseButton }) => (
            <>
                <div className={'modal-header'}>Unable to detect wallet</div>
                <div className={'modal-body'}>
                    Failed to detect a compatible EOS wallet! If your wallet is open, and we failed
                    to detect it try refreshing the page. However if you don't have a compatible EOS
                    wallet, you can still post to the forum anonymously for free!
                </div>
                <div className={'modal-footer'}>
                    <CloseButton />
                </div>
            </>
        )}
    </Modal>
)

export default WalletUndetectedModal
