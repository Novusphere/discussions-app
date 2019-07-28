import * as React from 'react'
import { Collapse as ReactCollapse, CollapseProps } from 'react-collapse'
import { presets } from 'react-motion'

interface ICollapseProps extends CollapseProps {}

const Collapse: React.FC<ICollapseProps> = ({ children, ...props }) => (
    <ReactCollapse {...props} springConfig={presets.stiff} forceInitialAnimation={true}>
        {children}
    </ReactCollapse>
)

export default Collapse
