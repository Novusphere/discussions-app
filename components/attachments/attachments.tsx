import * as React from 'react'
import { IAttachment } from '@stores/posts'

interface IAttachments {
    attachment: IAttachment
}

const Attachments: React.FC<IAttachments> = ({ attachment }) => {
    switch (attachment.display) {
        case 'html':
            return <div dangerouslySetInnerHTML={{ __html: attachment.value }} />
        default:
            return <span>Add more attachment options in attachments.tsx</span>
    }
}

export default Attachments
