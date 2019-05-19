import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
// import './style.scss';

interface TradeChartWidgetProps {
    dispatch: Dispatch;
}

export class TradeChartWidget extends React.PureComponent<TradeChartWidgetProps, {}> {
    static defaultProps = {
    };

    render() {
        return <Widget title={<Translate id="trade_chart_widget.title"/>}>
            TO-DO
        </Widget>;
    }
}

const mapStateToProps = store => ({
});

export default connect(mapStateToProps)(TradeChartWidget);
