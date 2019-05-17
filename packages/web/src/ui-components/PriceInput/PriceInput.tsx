import {InputGroup} from '@blueprintjs/core';
import BigNumber from 'bignumber.js';
import React, {ChangeEvent, EventHandler} from 'react';

interface PriceInputProps {
    value: BigNumber;
    decimals?: number;
    // actionText: string;
    rightElement: JSX.Element;
    onChange?(value: BigNumber): void;
}

interface PriceInputState {
    value?: string;
    isValid: boolean;
}

class PriceInput extends React.PureComponent<PriceInputProps, PriceInputState> {
    static defaultProps = {
        decimals: 10
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value && this.props.value.toString(10) || '',
            isValid: false
        };
    }

    componentWillReceiveProps(nextProps: PriceInputProps) {
        // Should be a controlled component.
        if ('value' in nextProps && nextProps.value &&
            !nextProps.value.eq(this.state.value)) {
            const value = nextProps.value.toString(10);
            this.setState({value});
        }
    }

    /**
     * '' . is allowed
     * @param event
     */
    handelInputChange: EventHandler<ChangeEvent<HTMLInputElement>> = (event) => {
        const value = new BigNumber(event.target.value);
        if (value.isNaN()) {
            if (event.target.value === '') {
                //won't trigger onChange
                this.setState({value: event.target.value});
            }
            return;
        } else {
            let valueAmount: string;
            if (value.lt(0)) {
                valueAmount = '0';
            } else {
                valueAmount = event.target.value;
            }
            this.triggerChange(valueAmount);
        }
    };

    triggerChange = (changedValue: string) => {
        // Should provide an event to pass value to Form.
        const {onChange} = this.props;
        // if (!('value' in this.props)) {
        this.setState({value: changedValue});
        // }
        if (onChange && !new BigNumber(this.state.value).eq(changedValue)) {
            onChange(new BigNumber(changedValue));
        }
    };

    render() {
        const {value} = this.state;
        return (
            <div className="dex-price-input">
                <div className="input-row">
                    <InputGroup type="text" onChange={this.handelInputChange}
                                value={value} rightElement={this.props.rightElement}
                    />

                </div>
            </div>
        );
    }
}

export default PriceInput;
