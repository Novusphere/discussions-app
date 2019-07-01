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
                case 'dropdown':
                    onChange = bind.onChange
                    value = bind.value
                    return (
                        <div className={'field-container pt1 pb3 inline-labels'} key={field.name}>
                            <label htmlFor={field.accessor.id}>{field.accessor.label}</label>
                            <Select
                                className={'w-80 db f6 react-select-dropdown'}
                                classNamePrefix={'rs'}
                                value={value}
                                onChange={onChange}
                                options={field.accessor.$extra.options}
                                defaultValue={field.accessor.$extra.options[0]}
                                placeholder={field.placeholder}
                            />
                        </div>
                    )
                case 'textarea':
                    return (
                        <div className={'field-container'} key={field.name}>
                            <textarea {...bind} />
                        </div>
                    )
                case 'button':
                    const { type, ...rest } = bind as any
                    return (
                        <div className={'field-container pb3 db flex'} key={field.name}>
                            {renderButton(field, type, rest)}
                        </div>
                    )
                default:
                    return (
                        <>
                            <div className={'field-container pt1 inline-labels'} key={field.name}>
                                <label htmlFor={field.accessor.id}>{field.accessor.label}</label>
                                <input {...bind} className={'db f6 w-100 form-input'} />
                            </div>
                            <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                        </>
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
                <button
                    className={'mt3 f6 link dim br2 ph3 pv2 dib white bg-green mr2 pointer'}
                    type="submit"
                >
                    Submit
                </button>
            )}
        </form>
    )
}

export default observer(Form)
