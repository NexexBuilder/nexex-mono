import * as React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
// import './style.scss';

interface MyTradeWidgetProps {
    dispatch: Dispatch;
}

export class MyTradeWidget extends React.PureComponent<MyTradeWidgetProps, {}> {
    static defaultProps = {
    };

    render() {
        return <Widget title={<Translate id="my_trade_widget.title"/>}>
            TO-DO
        </Widget>;
    }
}

const mapStateToProps = store => ({
});

export default connect(mapStateToProps)(MyTradeWidget);
