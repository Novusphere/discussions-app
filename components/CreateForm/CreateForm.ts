import validatorjs from 'validatorjs'
import MobxReactForm from 'mobx-react-form'
import dvr from 'mobx-react-form/lib/validators/DVR'

interface Fields extends FormField {}

interface MappedFields {
    name: string
    accessor: Form$
}

const rules = {
    alpha_with_underscore: {
        function: value => value.match(/^[\d]*[a-z_][a-z\d_]*$/i),
        message: 'The :attribute field must contain only letters, numbers or underscores.',
    },
}

class CreateForm {
    static plugins = {
        dvr: dvr({
            package: validatorjs,
            extend: ({ validator, form }) => {
                // here we can access the `validatorjs` instance (validator)
                // and we can add the rules using the `register()` method.
                Object.keys(rules).forEach(key =>
                    validator.register(key, rules[key].function, rules[key].message)
                )
            },
        }),
    }
    // static plugins = { dvr: dvr(validatorjs) }

    form: IForm['form']
    fields: MappedFields[]
    onSubmit: IForm['form']['onSubmit']
    onError: IForm['form']['onError']
    validate: IForm['form']['validate']
    onClear: IForm['onClear']
    types: IForm['types']

    constructor(hooks: any, fields: Fields[]) {
        const _form = new MobxReactForm(
            { fields },
            {
                plugins: CreateForm.plugins,
                hooks,
            }
        )
        // _form.init(fields)
        this.fields = fields.map(field => ({
            name: field.name,
            accessor: _form.$(field.name),
            ...field,
        }))
        this.form = _form
        this.onSubmit = _form.onSubmit
        this.onClear = _form.onClear
        this.types = _form.types()
    }
}

export default CreateForm
