import React, { FunctionComponent } from 'react'
import { Button } from 'antd'

interface INsfwContentBlurProps {
    onRevealClick?: () => void
}

const NsfwContentBlur: FunctionComponent<INsfwContentBlurProps> = ({ onRevealClick }) => {
    return (
        <div
            className={
                'w-100 h-100 absolute z-2 left-0 right-0 flex flex-column justify-center items-center'
            }
            style={{
                'backdrop-filter': 'blur(30px)',
                'background-color': 'rgba(200, 200, 200, 0.5)',
            }}
        >
            <span
                className={'f6 white'}
                style={{
                    'text-shadow': '1px 1px 4px rgba(150, 150, 150, 1)',
                }}
            >
                This post has been marked NSFW
            </span>
            {typeof onRevealClick !== 'undefined' && (
                <Button
                    onClick={onRevealClick}
                    className={'mt1'}
                    type={'primary'}
                    size={'small'}
                >
                    Reveal
                </Button>
            )}
        </div>
    )
}

NsfwContentBlur.defaultProps = {}

export default NsfwContentBlur
