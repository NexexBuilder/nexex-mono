import React from 'react';
import {Layout, Layouts, Responsive, WidthProvider} from 'react-grid-layout';
import {pure} from 'recompose';

const ResponsiveGridLayout = WidthProvider(Responsive);

const gridCols = {
    lg: 4,
    md: 3,
    sm: 1,
    xs: 1,
    xxs: 1,
};
const breakpoints = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0};
const layout: Layout[] = [
    {i: '1',x: 0, y: 0, w: 1, h: 4, static: true},
    {i: '2',x: 1, y: 0, w: 2, h: 6, static: true},
    {i: '3',x: 3, y: 0, w: 1, h: 6, static: true},
    {i: '4',x: 0, y: 4, w: 1, h: 5, static: true},
    {i: '5',x: 1, y: 6, w: 2, h: 6, static: true},
    {i: '6',x: 3, y: 6, w: 1, h: 6, static: true},
    {i: '7',x: 0, y: 9, w: 1, h: 3, static: true},
];
const layouts: Layouts = {
    lg: layout,
    md: layout,
    sm: layout,
    xs: layout,
    xxs: layout
};

export const GridLayout = pure(props => <div className="main-content">
    <ResponsiveGridLayout cols={gridCols} breakpoints={breakpoints} layouts={layouts} rowHeight={55} width={1200}>
        {props.children}
    </ResponsiveGridLayout>
</div>);
