import React from 'react';
import {Translate} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Widget} from '../../components/Widget/Widget';
// import './style.scss';

interface MarketWidgetProps {
    dispatch: Dispatch;
}

export class MarketWidget extends React.PureComponent<MarketWidgetProps, {}> {
    static defaultProps = {
    };

    render() {
        return <Widget title={<Translate id="market_widget.title"/>}>
            TO-DO
        </Widget>;
    }
}

const mapStateToProps = store => ({
});

export default connect(mapStateToProps)(MarketWidget);
