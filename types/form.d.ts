declare interface Form$ {
    id: string
    label: string
    bind: () => HTMLAttributes<any> | any
    error: string
    set: (...args: any) => void
    $extra?: any
    value?: any

    update(value: any): void
}

declare interface IForm {
    fields: FormField[]
    types: { [name: string]: string }
    onSubmit: (event?: FormEvent<HTMLFormElement>) => void
    onClear: (event?: FormEvent<HTMLFormElement>) => void
    form: {
        fields: any[]
        validate?: any
        onSubmit: (event?: FormEvent<HTMLFormElement>) => void
        select: (key: string) => string
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
    rules?: string
    readonly?: boolean
    disabled?: boolean
    accessor?: Form$

    input?: (value) => any
    output?: (value) => any
    type?: 'password' | 'text' | 'checkbox' | 'button' | 'dropdown' | 'textarea' | 'richtext' | 'radiogroup'
    render?: boolean
    observers?: any[]
    extra?: any
    intervals?: string[]
    key?: string
    path?: string
    size?: number
    bindings?: string
    validating?: boolean
    submitting?: boolean
    value?: string | { value: string; className?: string }[]

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
