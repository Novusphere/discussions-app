import validatorjs from 'validatorjs'
import MobxReactForm from 'mobx-react-form'
import dvr from 'mobx-react-form/lib/validators/DVR'

interface Fields extends FormField {}

interface MappedFields {
    name: string
    accessor: Form$
}

class CreateForm {
    static plugins = { dvr: dvr(validatorjs) }

    form: IForm['form']
    fields: MappedFields[]
    onSubmit: IForm['form']['onSubmit']
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
        _form.init(fields)
        this.fields = fields.map((field) => ({
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
