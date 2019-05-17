import {Spinner} from '@blueprintjs/core';
import * as React from 'react';

export type SpinProps = {
    spin: boolean;
    size: number;
    children?: JSX.Element;
};

export class Spin extends React.PureComponent<SpinProps, {}> {
    static defaultProps = {
        spin: true,
    };

    render() {
        return (<>
            {this.props.spin ? <Spinner size={this.props.size}/> : this.props.children}
        </>);
    }
}
