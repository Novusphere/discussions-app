import { RootStore, useStores } from '@stores'
import React, { useCallback, useState } from 'react'
import { eos } from '@novuspherejs'
import mapSeries from 'async/mapSeries'
import { checkIfNameIsValid, openInNewTab } from '@utils'
import axios from 'axios'
import fileDownload from 'js-file-download'
import { Button, Form, Input, InputNumber, Select, Typography } from 'antd'
import ecc from 'eosjs-ecc'

const { TextArea } = Input
const { Option } = Select

const UnwrappedAirdrop = ({ form }) => {
    const { getFieldDecorator } = form
    const { authStore, walletStore, uiStore }: RootStore = useStores()

    if (!authStore.hasAccount) {
        return <span className={'f6 gray'}>Please sign in to view this option</span>
    }

    const [airdropSubmitLoading, setAirdropSubmitLoading] = useState(false)
    const [downloadAirdropSubmitLoading, setDownloadAirdropSubmitLoading] = useState(false)

    /**
     * Used so the component can get the current selected
     * token's decimals and fee object.
     *
     * By default it is null.
     */
    const [tokenVals, setTokenVals] = useState(null)

    const handleTokenChange = useCallback(val => {
        if (val) {
            setTokenVals(walletStore.tokenFromAllAvailableTokens(val))
        } else {
            setTokenVals(null)
        }
    }, [])

    // validate names and show in the UI which account you are validating (numerical)
    const [totalNumberOfAccountsToValidate, setTotalNumberOfAccountsToValidate] = useState(0)
    const [currentIndexDuringAccountValidation, setCurrentIndexDuringAccountValidation] = useState(
        0
    )
    const [areAllAccountsValid, setAreAllAccountsValid] = useState(false)

    const clearStates = () => {
        setAirdropSubmitLoading(false)
        setDownloadAirdropSubmitLoading(false)
        setAreAllAccountsValid(false)
        setTotalNumberOfAccountsToValidate(0)
        setCurrentIndexDuringAccountValidation(0)
    }

    const methodicallyGetAirdropFormValues = async ({
        token,
        results,
        accountNamesAsArray,
        amount,
        triggerP2k,
        value,
        symbol,
        values,
    }) => {
        /**
         * Check if results have invalid names
         * results = string[]
         */
        if (results.length > 0) {
            clearStates()
            return form.setFields({
                accountNames: {
                    value: accountNamesAsArray.join(),
                    errors: [
                        new Error(
                            `Invalid account names:\n\n ${results.join(
                                '\n'
                            )}.\n\n Ensure you are entering valid EOS usernames or public keys.`
                        ),
                    ],
                },
            })
        }

        values.token = walletStore.tokenFromAllAvailableTokens(token)

        // no invalid account names, continue
        const precision = await eos.getTokenPrecision(values.token.value, values.token.name)
        const amountAsString = amount.toFixed(precision)
        const actor = authStore.displayName

        values.amount = Number(amountAsString).toFixed(precision)
        values.actor = actor

        if (triggerP2k) {
            const token = walletStore.supportedTokensForUnifiedWallet.find(
                q => q.label === values.token.symbol
            )

            if (!token) {
                return form.setFields({
                    token: {
                        value: token,
                        errors: [
                            new Error(`Token ${symbol} does not support public key transfers!`),
                        ],
                    },
                })
            }

            values.p2k = token
        }

        return values
    }

    /**
     * @param {Event} e
     * @param {type} 'airdrop' | 'downloadAirdrop'
     */
    const handleAirdropSubmit = useCallback(
        (e, type = 'airdrop') => {
            e.preventDefault()
            form.validateFields(async (err, values) => {
                if (!err) {
                    if (type === 'airdrop') {
                        setAirdropSubmitLoading(true)
                    } else {
                        setDownloadAirdropSubmitLoading(true)
                    }

                    const { token, amount, accountNames } = values
                    const { value, symbol } = tokenVals

                    // validate account names or addresses
                    const accountNamesAsArray = accountNames.match(/[^\,\;\n\s]+/gi)

                    // set the initial amount
                    setTotalNumberOfAccountsToValidate(accountNamesAsArray.length)

                    let triggerP2k = false

                    mapSeries(
                        accountNamesAsArray,
                        (accountName, cb) => {
                            setCurrentIndexDuringAccountValidation(prevState => prevState + 1)
                            checkIfNameIsValid(accountName)
                                .then(isValidAccountName => {
                                    // we don't set anything in cb() because we only care for invalid names
                                    if (Array.isArray(isValidAccountName)) {
                                        triggerP2k = true
                                        return cb()
                                    }

                                    return cb()
                                })
                                .catch(err => {
                                    // return a resolved promise otherwise mapSeries will stop iteration
                                    return cb(null, err.message)
                                })
                        },
                        async (err, results) => {
                            const result = await methodicallyGetAirdropFormValues({
                                token,
                                results: results.filter(q => typeof q !== 'undefined'),
                                accountNamesAsArray,
                                amount,
                                triggerP2k,
                                value,
                                symbol,
                                values,
                            })

                            const message = 'Failed to detect EOS wallet'

                            if (result) {
                                // deal with download airdrop click
                                if (type === 'downloadAirdrop') {
                                    clearStates()

                                    try {
                                        const { data } = await axios.get('/api/writeFile', {
                                            params: result,
                                        })

                                        fileDownload(JSON.stringify(data), 'airdrop.json')
                                        uiStore.showToast(
                                            'Success',
                                            'Your airdrop file has been downloaded.',
                                            'success'
                                        )
                                        return
                                    } catch (error) {
                                        uiStore.showToast('Transaction Failed', message, 'error')
                                        return
                                    }
                                }

                                // we don't clear states because we need the UI to hide the # of accs being validated
                                setTotalNumberOfAccountsToValidate(0)
                                setCurrentIndexDuringAccountValidation(0)
                                setAreAllAccountsValid(true)

                                const actions = []

                                // check if user has EOS wallet account
                                // https://github.com/Novusphere/discussions-app/issues/102

                                if (!authStore.hasEOSWallet) {
                                    await eos.logout()
                                    await eos.detectWallet()
                                    await eos.login()
                                }

                                if (typeof eos.auth !== 'undefined') {
                                    // iteratee order not required
                                    accountNamesAsArray.map(async recipient => {
                                        const isRecipientAPublicKey = ecc.isValidPublic(recipient)

                                        if (values.hasOwnProperty('p2k') && isRecipientAPublicKey) {
                                            actions.push({
                                                account: result.token.value,
                                                name: 'transfer',
                                                data: {
                                                    from: eos.auth.accountName,
                                                    to: result.p2k.contract,
                                                    quantity: `${result.amount} ${result.token.symbol}`,
                                                    memo: recipient,
                                                },
                                            })
                                        } else {
                                            actions.push({
                                                account: result.token.value,
                                                name: 'transfer',
                                                data: {
                                                    from: eos.auth.accountName,
                                                    to: recipient,
                                                    quantity: `${result.amount} ${result.token.symbol}`,
                                                    memo: result.memoId,
                                                },
                                            })
                                        }
                                    })

                                    try {
                                        const transaction_id = await eos.transact(actions)
                                        clearStates()

                                        uiStore.showToast(
                                            'Transaction Success',
                                            'Your transaction was successfully submitted!',
                                            'success',
                                            {
                                                btn: (
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            openInNewTab(
                                                                `https://bloks.io/transaction/${transaction_id}`
                                                            )
                                                        }
                                                    >
                                                        View transaction
                                                    </Button>
                                                ),
                                            }
                                        )
                                    } catch (error) {
                                        uiStore.showToast(
                                            'Transaction Failed',
                                            error.message || message,
                                            'error'
                                        )
                                        clearStates()
                                    }
                                } else {
                                    uiStore.showToast('Transaction Failed', message, 'error')
                                    clearStates()
                                    return
                                }
                            }
                        }
                    )
                }
            })
        },
        [tokenVals]
    )

    return (
        <>
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16, offset: 4 }}
                onSubmit={() => console.log('hey')}
                className={'center'}
            >
                <Form.Item label="Token">
                    {getFieldDecorator('token', {
                        rules: [
                            {
                                required: true,
                                message: 'Please select a token',
                            },
                        ],
                    })(
                        <Select
                            size={'large'}
                            showSearch
                            className={'w-100'}
                            placeholder={'Select a token'}
                            onChange={handleTokenChange}
                        >
                            {walletStore.eosTokens.map(option => {
                                return (
                                    <Option
                                        key={option.value}
                                        value={option.value}
                                        className={'flex flex-row items-center'}
                                    >
                                        {option.label}
                                    </Option>
                                )
                            })}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label="Amount">
                    {getFieldDecorator('amount', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter an amount',
                            },
                        ],
                    })(
                        <InputNumber
                            disabled={!tokenVals}
                            size={'large'}
                            style={{ width: '100%' }}
                        />
                    )}
                </Form.Item>
                <Form.Item
                    label="Account Names"
                    extra={
                        'Enter alphanumeric account names (that can also contain a period) followed by a comma, a space or a line break.'
                    }
                >
                    {getFieldDecorator('accountNames', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter at least one valid account name',
                            },
                        ],
                    })(<TextArea disabled={!tokenVals} rows={4} />)}
                </Form.Item>
                <Form.Item label="Memo ID">
                    {getFieldDecorator('memoId', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter a memo ID',
                            },
                        ],
                    })(<Input disabled={!tokenVals} size={'large'} style={{ width: '100%' }} />)}
                </Form.Item>
            </Form>

            <div className={'mt3 flex flex-row items-center justify-between'}>
                <span>
                    {totalNumberOfAccountsToValidate > 0 && (
                        <span className={'f6 gray'}>
                            Currently validating: {currentIndexDuringAccountValidation} /{' '}
                            {totalNumberOfAccountsToValidate} accounts
                        </span>
                    )}
                    {areAllAccountsValid && (
                        <span className={'f6 green'}>
                            All accounts are valid, continuing with transaction.
                        </span>
                    )}
                </span>
                <span>
                    <Button
                        type={'primary'}
                        onClick={e => handleAirdropSubmit(e, 'downloadAirdrop')}
                        disabled={!tokenVals || airdropSubmitLoading}
                        loading={downloadAirdropSubmitLoading}
                    >
                        Download Airdrop
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={e => handleAirdropSubmit(e, 'airdrop')}
                        disabled={!tokenVals || downloadAirdropSubmitLoading}
                        loading={airdropSubmitLoading}
                        className={'ml2'}
                    >
                        Airdrop
                    </Button>
                </span>
            </div>
        </>
    )
}

const Airdrop = Form.create({ name: 'airdropForm' })(UnwrappedAirdrop)

export default Airdrop
