type TObj = Record<string, unknown>;

function shallowEqual(obj1: object, obj2: object): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length === keys2.length) {
        return keys1.every((k) => {
            if (k in obj1 && k in obj2) {
                return (obj1 as TObj)[k] === (obj2 as TObj)[k];
            }

            return false;
        });
    }

    return false;
}

export {shallowEqual};
