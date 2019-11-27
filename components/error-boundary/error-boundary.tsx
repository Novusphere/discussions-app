import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'

interface IErrorBoundaryProps {}

interface IErrorBoundaryState {}

class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    state = { error: null, errorInfo: null };

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <div>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: "pre-wrap" }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary
