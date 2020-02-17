import React from 'react'
import { useMediaQuery } from 'react-responsive'

const Desktop = (props) => {
    const isDesktop = useMediaQuery({ minWidth: 992 })
    return isDesktop ? React.createElement(React.Fragment, props) : null
}
const Tablet = (props) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
    return isTablet ? React.createElement(React.Fragment, props) : null
}
const Mobile = (props) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? React.createElement(React.Fragment, props) : null
}
const Default = (props) => {
    const isNotMobile = useMediaQuery({ minWidth: 768 })
    return isNotMobile ? React.createElement(React.Fragment, props) : null
}

export { Desktop, Tablet, Mobile, Default }
