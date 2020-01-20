import Quill from 'quill'

import Hashtag from './formats/hashtag'
import Mention from './formats/mention'
import Tip from './formats/tip'

import Autoformat from // AutoformatHelperAttribute
'./modules/autoformat'

// if (Quill.version && parseInt(Quill.version[0]) < 2) {
//     console.warn('quill-autoformat requires Quill 2.0 or higher to work properly')
// }

Quill.register(
    {
        'modules/autoformat': Autoformat,
        'formats/hashtag': Hashtag,
        'formats/tip': Tip,
        // 'formats/mention': Mention,
        // 'formats/autoformat-helper': AutoformatHelperAttribute
    },
    true
)

export {
    Autoformat as default,
    Hashtag,
    Mention,
    Tip,
    // AutoformatHelperAttribute
}
