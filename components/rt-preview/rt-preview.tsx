import * as React from 'react'
import Markdown from 'markdown-to-jsx'

import './style.scss'

interface IRtPreviewProps {}

const RtPreview: React.FC<IRtPreviewProps> = ({ children }) => (
    <Markdown
        options={{
            createElement(type, props, children) {
                return (
                    <div
                        className={
                            'black lh-copy measure-wide pt0 post-preview-content content-fade overflow-break-word'
                        }
                    >
                        {React.createElement(type, props, children)}
                    </div>
                )
            },
        }}
    >
        {children}
    </Markdown>
)

export default RtPreview
