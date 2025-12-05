import React from 'react';
import type {IRow} from '../../../../defines/common.types';

function renderRows(rows: IRow[]): (React.ReactElement | null)[] {
    return rows.map((row) => {
        if (!row.component) {
            return null;
        }

        let isEmptyRow = true;

        const children = row.cells.map((cell, index) => {
            if (!cell.component) {
                return null;
            }

            const [Cell, props] = cell.component;

            if (isEmptyRow && cell.value !== null) {
                isEmptyRow = false;
            }

            if (typeof Cell === 'string') {
                return (
                    <Cell key={cell.id} colSpan={cell.colSpan}>
                        {cell.value}
                    </Cell>
                );
            } else {
                return (
                    <Cell
                        {...props}
                        key={cell.id}
                        colSpan={cell.colSpan}
                        width={cell.column.props.width}
                        data={cell}
                        area={row.area}
                        index={index}
                    >
                        {cell.value}
                    </Cell>
                );
            }
        });

        if (isEmptyRow && row.area === 'footer') {
            return null;
        }

        const [Row, props] = row.component;

        if (typeof Row === 'string') {
            return <Row key={row.id}>{children}</Row>;
        } else {
            return (
                <Row {...props} key={row.id} data={row}>
                    {children}
                </Row>
            );
        }
    });
}

export {renderRows};
