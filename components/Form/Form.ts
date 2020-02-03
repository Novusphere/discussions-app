import MobxReactForm from 'mobx-react-form'
import dvr from 'mobx-react-form/lib/validators/DVR'
import validatorjs from 'validatorjs'

const plugins = {
    dvr: dvr(validatorjs),
}

const Form = (hooks, fields) => new MobxReactForm({ fields }, { plugins, hooks })

export default Form
