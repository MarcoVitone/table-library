function getEntries<T extends string>(input: T): Array<[number, string]>;

function getEntries<T extends unknown[]>(input: T): Array<[number, T[number]]>;

function getEntries<T>(input: T): Array<[keyof T, T[keyof T]]>;

function getEntries<T>(input: T): Array<[string | number, unknown]> {
    if (Array.isArray(input) || typeof input === 'string') {
        const entries = [] as Array<[number, unknown]>;

        for (let i = 0; i < input.length; i++) {
            entries.push([i, input[i]]);
        }

        return entries;
    } else if (input !== null && typeof input !== 'undefined') {
        return Object.entries(input) as Array<[string, unknown]>;
    } else {
        return [];
    }
}

export {getEntries};
