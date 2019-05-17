import {FocusStyleManager} from '@blueprintjs/core';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {LocalizeContextProps, withLocalize} from 'react-localize-redux';
import {connect} from 'react-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Dispatch} from 'redux';
import ConnectToWalletDialog from './components/ConnectToWalletDialog/ConnectToWalletDialog';
import TokenEnableDialog from './components/TokenEnableDialog/TokenEnableDialog';
import {THEME} from './constants';
import Exchange from './containers/Exchange/Exchange';
import {Footer} from './containers/Footer/Footer';
import {Header} from './containers/Header/Header';
import cnTranslations from './i18n/cn.global.json';
import enTranslations from './i18n/en.global.json';
import {initApp, initAppFail} from './redux/actions/global.action';
import './theme/base.scss';

FocusStyleManager.onlyShowFocusOnTabs();

export interface AppProps extends LocalizeContextProps {
    dispatch: Dispatch;
    theme?: THEME;
    exchangeInited: boolean;
}

const localizationConfig = {
    languages: [
        {name: 'English', code: 'en'},
        {name: '中文', code: 'cn'}
    ],
    options: {
        renderToStaticMarkup,
        renderInnerHtml: true
    }
};

class App extends React.PureComponent<AppProps, {}> {
    constructor(props) {
        super(props);

        this.props.initialize(localizationConfig);
        this.props.addTranslationForLanguage(cnTranslations, 'cn');
        this.props.addTranslationForLanguage(enTranslations, 'en');
    }

    componentWillMount() {
        if (window.config) {
            this.props.dispatch(initApp(window.config));
        } else {
            this.props.dispatch(initAppFail(new Error('window.config not found')));
        }
    }

    // componentDidMount() {
    //     this.props.dispatch(appInitComplete());
    // }

    render() {
        const {theme = THEME.DARK, exchangeInited} = this.props;

        return (
            <div className={theme}>
                {exchangeInited && <Header/>}
                <Switch>
                    <Route exact path="/trade/:marketId" component={Exchange}/>
                    <Route exact path="/trade" component={Exchange}/>
                    {/*<Route exact path="/"*/}
                    {/*render={() => <Redirect to={`/trade`}/>}*/}
                    {/*/>*/}
                    <Redirect to="/trade"/>
                </Switch>
                <Footer/>
                <ConnectToWalletDialog/>
                {exchangeInited && <TokenEnableDialog/>}
            </div>
        );
    }
}

const mapStateToProps = (store: any) => ({
    exchangeInited: store.global.exchangeInited
});

export default connect(mapStateToProps)(withLocalize(App));
