interface ISorting {
    key: string;
    dir: 'asc' | 'desc';
    isServerSide: boolean;
}

interface IObj {
    [k: string | number | symbol]: unknown;
}

type TSorter<T> = (a: T, b: T) => number;

type TSelector<T> = (src: T) => T[keyof T];

function multiSorter<T>(
    sorts: ISorting[],
    selector?: TSelector<T>
): TSorter<T> {
    const dirs: number[] = [];

    const fields: string[] = sorts.map((s, i) => {
        if (s.dir === 'desc') {
            dirs[i] = -1;
        } else {
            dirs[i] = 1;
        }

        return s.key;
    });

    return function sorter(s1, s2) {
        let a = s1 as IObj;
        let b = s2 as IObj;

        if (selector) {
            a = selector(s1) as IObj;
            b = selector(s2) as IObj;
        }

        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];

            let aVal = a[f];
            let bVal = b[f];
            if (
                typeof aVal === 'string' &&
                typeof bVal === 'string' &&
                !isNaN(Date.parse(aVal)) &&
                !isNaN(Date.parse(bVal))
            ) {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (!aVal && !bVal) {
                return 0;
            } else if (!aVal) {
                return 1;
            } else if (!bVal) {
                return -1;
            }

            if (aVal > bVal) {
                return dirs[i];
            }

            if (aVal < bVal) {
                return -dirs[i];
            }
        }

        return 0;
    };
}

export type {ISorting};
export {multiSorter};
