import {InputGroup, Slider} from '@blueprintjs/core';
import BigNumber from 'bignumber.js';
import React, {ChangeEvent, EventHandler} from 'react';
import {AmountUnit} from '../../constants';
import {Amount} from '../../utils/Amount';

interface AmountInputProps {
    decimals: number;
    max?: Amount;
    slider: boolean;
    rightElement: JSX.Element;
    value?: Amount;

    onChange?(value: Amount): void;
}

interface AmountInputState {
    value?: string;
    isValid: boolean;
}

class AmountInput extends React.PureComponent<AmountInputProps, AmountInputState> {
    static defaultProps = {
        slider: true
        // max: 0,
        // decimals: 18
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value && this.props.value.toEther().toString(10) || '',
            isValid: false
        };
    }

    componentWillReceiveProps(nextProps: AmountInputProps) {
        if ('value' in nextProps && nextProps.value &&
            !nextProps.value.toEther().eq(this.state.value) ) {
            this.setState({value: nextProps.value.toEther().toString(10)});
        }
    }

    handleSliderChange = (percentage: number) => {
        const {max, decimals} = this.props;
        const newVal = max.toEther().times(percentage).div(100).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
        this.triggerChange(newVal.toString(10));
    };

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
            if (this.props.max && value.gt(this.props.max.toEther())) {
                valueAmount = this.props.max.toEther().toString(10);
            } else if (value.lt(0)) {
                valueAmount = '0';
            } else {
                valueAmount = event.target.value;
            }
            this.triggerChange(valueAmount);
        }
    };

    triggerChange = (changedValue: string) => {
        // Should provide an event to pass value to Form.
        const {onChange, decimals} = this.props;
        // if (!('value' in this.props)) {
        this.setState({value: changedValue});
        // }
        if (onChange && !new BigNumber(this.state.value).eq(changedValue)) {
            setTimeout(()=>onChange(new Amount(changedValue, AmountUnit.ETHER, decimals)), 0);
        }
    };

    render() {
        const {max} = this.props;
        const {value} = this.state;
        let percentage;
        if (value) {
            try {
                percentage = new BigNumber(value).div(max.toEther()).times(100)
                    .decimalPlaces(0, BigNumber.ROUND_FLOOR).toNumber();
            } catch (e) {
                percentage = NaN;
            }
        }
        if (isNaN(percentage)) percentage = 0;
        return (
            <div className="dex-amount-input">
                <div className="input-row">
                    <InputGroup type="text" onChange={this.handelInputChange}
                                value={value} rightElement={this.props.rightElement}
                    />

                </div>
                {this.props.slider &&
                <div className="slider-row">
                    <Slider min={0} max={100} initialValue={0} labelRenderer={false} onChange={this.handleSliderChange}
                            value={percentage}/>
                </div>
                }
            </div>
        );
    }
}

export default AmountInput;
