import * as React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
// import './style.scss';

interface RecentTradeWidgetProps {
    dispatch: Dispatch;
}

export class RecentTradeWidget extends React.PureComponent<RecentTradeWidgetProps, {}> {
    static defaultProps = {
    };

    render() {
        return <Widget title={<Translate id="recent_trade_widget.title"/>}>
            TO-DO
        </Widget>;
    }
}

const mapStateToProps = store => ({
});

export default connect(mapStateToProps)(RecentTradeWidget);
