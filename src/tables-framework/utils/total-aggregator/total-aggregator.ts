import type { IColumn } from '../../defines/common.types.ts';

const totalAggregator = (column: IColumn): string => {
    const total = column.data.reduce<number>((acc, { value }) => {
        if (typeof value === 'number') {
            return acc + value;
        } else if (typeof value === 'string') {
            const parsed = Number.parseFloat(value);

            if (!Number.isNaN(parsed)) {
                return acc + parsed;
            }
        }

        return acc;
    }, 0);

    return total.toString();
};

export { totalAggregator };
