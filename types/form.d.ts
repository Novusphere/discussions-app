declare interface Form$ {
    id: string
    label: string
    bind: () => HTMLAttributes<any> | any
    error: string
    set: (...args: any) => void
    $extra?: any
    value?: any
    validate?: any

    update(value: any): void
}

declare interface IForm {
    fields: FormField[]
    types: { [name: string]: string }
    onSubmit: (event?: FormEvent<HTMLFormElement>) => void
    onClear: (event?: FormEvent<HTMLFormElement>) => void
    form: {
        values: () => any
        fields: any[]
        validate?: any
        onSubmit: (event?: FormEvent<HTMLFormElement>) => void
        onError: (event?: FormEvent<HTMLFormElement>, message?: string) => void
        select: (key: string) => any
        $: (key: string) => Form$
        size: number
        submitting: boolean
        validating: boolean
        isValid: boolean
        isDirty: boolean
        isPristine: boolean
        isDefault: boolean
        isEmpty: boolean
        disabled: boolean
        autoFocus: boolean
        focused: boolean
        touched: boolean
        changed: boolean
        blurred: boolean
        hasError: boolean
        error: string
        validatedValues: any
        hasNestedFields: boolean
        hasIncrementalKeys: boolean
    }

}

declare interface FormField {
    name: string
    label?: string
    placeholder?: string
    description?: string
    rules?: string
    readonly?: boolean
    autoComplete?: "off" | "on"
    disabled?: boolean
    accessor?: Form$
    hideLabels?: boolean
    containerClassName?: string
    hide?: boolean
    onSelect?: (props) => void
    input?: (value) => any
    output?: (value) => any
    type?: string | 'password' | 'text' | 'checkbox' | 'button' | 'dropdown' | 'textarea' | 'richtext' | 'radiogroup' | 'switch'
    render?: boolean
    defaultValue?: any
    checked?: boolean
    observers?: any[]
    extra?: any
    intervals?: string[]
    key?: string
    path?: string
    size?: number
    bindings?: string
    validating?: boolean
    submitting?: boolean
    value?: string | { value: string; className?: string }[] | boolean
    onChange?: any
    onFocus?: any
    onBlur?: any
    onComplete?: (form: any) => void

    options?: {
        validateOnChange?: boolean
    }

    hooks?: {
        onToggle?: (field) => any
        onChange?: (field) => any
        onInit?: (form) => any
    }
}

declare type FormFields = FormField[]
