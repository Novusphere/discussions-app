import * as React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Select from 'react-select'
import { Editor } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
    form: IForm
    className?: string
    hideSubmitButton?: boolean
}

class Form extends React.Component<FormProps> {
    private enterKeyEventListener = (e: KeyboardEvent) => {
        const key = e.code

        if (key.match(/NumpadEnter|Enter/)) {
            e.preventDefault()
            this.props.form.onSubmit(e)
        }
    }

    componentDidMount(): void {
        window.addEventListener('keypress', this.enterKeyEventListener)
    }

    componentWillMount(): void {
        window.removeEventListener('keypress', this.enterKeyEventListener)
    }

    render() {
        const { form, children, hideSubmitButton, ...props } = this.props
        const renderButton = (field, type, rest) => {
            if (Array.isArray(field.accessor.$extra.options)) {
                return field.accessor.$extra.options.map(
                    ({ value, disabled, title, className, onClick }) => (
                        <button
                            datatype={type}
                            onClick={e => {
                                form.onSubmit(e)

                                if (onClick) {
                                    onClick(form.form)
                                }

                                e.preventDefault()
                            }}
                            disabled={
                                disabled ||
                                (onClick && onClick['state'] && onClick['state'] === 'pending') ||
                                false
                            }
                            key={`${field.name}-${value}`}
                            title={title || null}
                            className={classNames([
                                'mt3 f6 link dim ph3 pv2 dib mr2 pointer',
                                {
                                    'white bg-green': !className,
                                    [className]: className,
                                },
                            ])}
                        >
                            {onClick && onClick['state'] && onClick['state'] === 'pending' ? (
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faSpinner}
                                    spin
                                    className={'mr1'}
                                />
                            ) : null}
                            {value}
                        </button>
                    )
                )
            }

            return (
                <button
                    datatype={type}
                    type={'button'}
                    key={field.accessor.value}
                    {...rest}
                    className={classNames({
                        'button button-light dim pointer db f6 pv1 mh1 flex-auto': true,
                    })}
                >
                    {field.accessor.value}
                </button>
            )
        }

        const renderFields = fields => {
            return fields.map(field => {
                const bind = field.accessor.bind()

                if (field.accessor.$extra && field.accessor.$extra.render === false) {
                    return null
                }

                switch (form.types[field.name]) {
                    case 'dropdown':
                        return (
                            <React.Fragment key={field.name}>
                                <div className={'field-container pb3 inline-labels'}>
                                    <label htmlFor={field.accessor.id} className={'w-40'}>
                                        {field.accessor.label}
                                    </label>
                                    <div className={'w-60 flex flex-column'}>
                                        <Select
                                            className={'db f6 react-select-dropdown'}
                                            classNamePrefix={'rs'}
                                            options={field.accessor.$extra.options}
                                            {...bind}
                                        />
                                        <span className={'error f6 db pv2'}>
                                            {field.accessor.error}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    case 'textarea':
                        return (
                            <React.Fragment key={field.name}>
                                <div className={'field-container pb3 inline-labels'}>
                                    <label htmlFor={field.accessor.id} className={'w-40'}>
                                        {field.accessor.label}
                                    </label>
                                    <div className={'w-60 flex flex-column'}>
                                        <textarea
                                            rows="4"
                                            cols="50"
                                            {...bind}
                                            className={'db f6 form-input'}
                                        />
                                        <span className={'error f6 db pv2 tl'}>
                                            {field.accessor.error}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    case 'richtext':
                        return (
                            <React.Fragment key={field.name}>
                                <div className={'field-container pb3 inline-labels'}>
                                    <label htmlFor={field.accessor.id} className={'w-40'}>
                                        {field.accessor.label}
                                    </label>
                                    <div className={'w-60 h-100 flex flex-column'}>
                                        <Editor
                                            placeholder={field.placeholder}
                                            className={'db f6'}
                                            {...bind}
                                        />
                                        <span className={'error f6 db pv2'}>
                                            {field.accessor.error}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    case 'button':
                        const { type, ...rest } = bind as any
                        return (
                            <div
                                className={'field-container pb3 db flex justify-end items-center'}
                                key={field.name}
                            >
                                <div className={'w-80'}>{renderButton(field, type, rest)}</div>
                            </div>
                        )
                    case 'radiogroup':
                        return (
                            <div key={field.name} className={'flex self-end w-80 mb3'}>
                                {field.accessor.$extra.options.map(option => (
                                    <div className={'flex items-center'} key={option.value}>
                                        <input
                                            type={'radio'}
                                            id={option.value}
                                            name={option.value}
                                            value={option.value}
                                            checked={field.accessor.value === option.value}
                                            onChange={e => {
                                                field.accessor.onChange(e)

                                                if (option.onClick) {
                                                    option.onClick(form)
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={option.value}
                                            className={'pl1 mr3 f6 lh-copy'}
                                        >
                                            {option.value}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )
                    default:
                        return (
                            <React.Fragment key={field.name}>
                                <div className={'field-container pb3 inline-labels'}>
                                    <label htmlFor={field.accessor.id} className={'w-40'}>
                                        {field.accessor.label}
                                    </label>
                                    <div className={'w-60 flex flex-column'}>
                                        <input {...bind} className={'db f6 form-input'} />
                                        <span className={'error f6 db pv2 tl'}>
                                            {field.accessor.error}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                }
            })
        }

        return (
            <form {...props}>
                {renderFields(form.fields)}
                {!hideSubmitButton && (
                    <button
                        className={'mt3 f6 link dim ph3 pv2 dib white bg-green pointer'}
                        type="submit"
                        onClick={form.onSubmit}
                    >
                        Submit
                    </button>
                )}
                {children}
            </form>
        )
    }
}

export default observer(Form)
