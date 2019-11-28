import * as React from 'react'
import { IAttachment } from '@stores/postsStore'

interface IAttachments {
    attachment: IAttachment
}

const Attachments: React.FC<IAttachments> = ({ attachment }) => {
    switch (attachment.display) {
        case '':
            return null
        case 'html':
            return <div dangerouslySetInnerHTML={{ __html: attachment.value }} />
        default:
            return <span>Add more attachment options in attachments.tsx</span>
    }
}

export default Attachments
