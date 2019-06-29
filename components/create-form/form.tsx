import * as React from 'react'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import classNames from 'classnames'
import Select from 'react-select'

interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
    form: IForm
    className?: string
    hideSubmitButton?: boolean
}

const Form: React.FC<FormProps> = ({ form, children, hideSubmitButton, ...props }) => {
    const renderButton = (field, type, rest) => {
        if (Array.isArray(field.accessor.$extra.options)) {
            return field.accessor.$extra.options.map(({ value, className }) => (
                <button
                    datatype={type}
                    type={'button'}
                    onClick={(e: any) => {
                        form.form.$(field.name).set(value)
                        form.onSubmit(e)
                    }}
                    key={value}
                    {...rest}
                    className={classNames({
                        'button button-light dim pointer db f6 pv1 mh1 flex-auto': !className,
                        [className]: className,
                    })}
                >
                    {value}
                </button>
            ))
        }

        return (
            <button
                datatype={type}
                type={'button'}
                onClick={() => console.log('add onClick handler')}
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

            if (field.render === false) {
                return null
            }

            let onChange, value

            switch (form.types[field.name]) {
                case 'checkbox':
                    return (
                        <div className={'field-container pb3 db'} key={field.name}>
                            <label htmlFor={field.accessor.id} className={'f7 lh-copy dib'}>
                                <span className={'checkbox-label'}>{field.accessor.label}</span>
                                <input {...bind} className={'db ma0 pa0'} />
                                <span className={'checkbox pointer dim'} />
                            </label>
                        </div>
                    )
                case 'slider':
                    const { id } = bind
                    onChange = bind.onChange
                    value = bind.value
                    return (
                        <div
                            className={'field-container pb3 db flex flex-column w-100'}
                            key={field.name}
                        >
                            <span className={'f6 o-50 db'}>{field.accessor.label}</span>
                            <input
                                className="slider mv3"
                                type="range"
                                min={field.accessor.$extra.options[0]}
                                max={
                                    field.accessor.$extra.options[
                                        field.accessor.$extra.options.length - 1
                                    ]
                                }
                                step="1"
                                list={`${field.name}-ticks`}
                                id={id}
                                onChange={onChange}
                            />
                            <datalist id={`${field.name}-ticks`} className={'slider-options'}>
                                {field.accessor.$extra.options.map(option => (
                                    <option key={option} label={option} value={option} />
                                ))}
                            </datalist>
                            <output id={`${field.name}-ticks`}>{value}</output>
                        </div>
                    )
                case 'dropdown':
                    onChange = bind.onChange
                    value = bind.value
                    return (
                        <div className={'field-container pb3 w-100'} key={field.name}>
                            <Select
                                className={'react-select-dropdown'}
                                classNamePrefix={'rs'}
                                value={value}
                                onChange={onChange}
                                options={field.accessor.$extra.options}
                                defaultValue={field.accessor.$extra.options[0]}
                                placeholder={field.placeholder}
                            />
                        </div>
                    )
                case 'button':
                    const { type, ...rest } = bind as any
                    return (
                        <div className={'field-container pb3 db flex'} key={field.name}>
                            {renderButton(field, type, rest)}
                        </div>
                    )
                case 'interval':
                    return (
                        <div className={'field-container pb3 db flex'} key={field.name}>
                            {field.accessor.$extra.intervals.map(interval => (
                                <button
                                    datatype={type}
                                    type={'button'}
                                    onClick={() =>
                                        field.accessor.$extra.onClick(interval, form.form)
                                    }
                                    key={interval}
                                    {...rest}
                                    className={
                                        'button button-light dim pointer db f6 pv1 mh1 flex-auto'
                                    }
                                >
                                    {interval}
                                </button>
                            ))}
                        </div>
                    )
                default:
                    if (!isNil(field.accessor.$extra) && !isNil(field.accessor.$extra.leftLabel)) {
                        return (
                            <div key={field.name}>
                                <div className={'field-container pt1 inline-labels'}>
                                    <label htmlFor={field.accessor.id}>
                                        {field.accessor.$extra.leftLabel}
                                    </label>
                                    <input {...bind} className={'db pa3 f6 w-100'} />
                                    {!isNil(field.accessor.$extra.rightLabel) && (
                                        <span className={'f6 o-50 w-20 tr'}>
                                            {field.accessor.$extra.rightLabel}
                                        </span>
                                    )}
                                </div>
                                <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                            </div>
                        )
                    }
                    if (field.accessor.$extra && field.accessor.$extra.rightComponent) {
                        return (
                            <div className={'field-container pt1'} key={field.name}>
                                {field.accessor.label ? (
                                    <label htmlFor={field.accessor.id} className={'db mb2 b f5'}>
                                        {field.accessor.label}
                                    </label>
                                ) : null}
                                <div className="flex items-start">
                                    <div className={'mr2'}>
                                        <input {...bind} className={'db pa3 f6 w-100'} />
                                    </div>
                                    {renderFields(
                                        form.fields
                                            .filter(
                                                formField =>
                                                    formField.name ===
                                                    field.accessor.$extra.rightComponent
                                            )
                                            .map(formField => ({
                                                ...formField,
                                                render: true,
                                            }))
                                    )}
                                </div>
                                <span className={'error f6 db pb3'}>{field.accessor.error}</span>
                            </div>
                        )
                    }
                    return (
                        <div className={'field-container pt1'} key={field.name}>
                            <label htmlFor={field.accessor.id} className={'db mb2 b f5'}>
                                {field.accessor.label}
                            </label>
                            <input {...bind} className={'db pa3 f6 w-100'} />
                            <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                        </div>
                    )
            }
        })
    }

    return (
        <form onSubmit={form.onSubmit} {...props}>
            {renderFields(form.fields)}
            {!isNil(children) ? (
                children
            ) : hideSubmitButton ? null : (
                <button className={'pa3 b ttu pointer dim'} type="submit">
                    Submit
                </button>
            )}
        </form>
    )
}

export default observer(Form)
