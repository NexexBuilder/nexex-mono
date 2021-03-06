import {Card} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import {pure} from 'recompose';
import './style.scss';

export interface WidgetProps {
    children: any;
    className?: string;
    title: string | JSX.Element;
    hideTitle?: boolean;
}

export const Widget = pure<WidgetProps>((props) =>
    <Card interactive={false} className={classNames('ex-widget', props.className)}>
        {props.hideTitle ? undefined :
            <div className="widget-title">{props.title}</div>
        }
        <div className="widget-content">
            {props.children}
        </div>
    </Card>
);
