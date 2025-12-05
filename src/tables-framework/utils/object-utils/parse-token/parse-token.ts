interface ISeps {
    obj?: string;
    arr?: [string, string];
}

type TOutput = (string | number)[];

function parseToken(token: string, seps: ISeps = {}): TOutput {
    const output: TOutput = [];

    const obj = seps.obj || '.';
    const arr = seps.arr || ['[', ']'];

    let acc = '';

    for (let i = 0; i < token.length; i++) {
        const char = token.charAt(i);

        if (char === obj || char === arr[0]) {
            if (acc) {
                output.push(acc);
                acc = '';
            }
        } else if (char === arr[1]) {
            if (acc) {
                output.push(Number.parseInt(acc));
                acc = '';
            }
        } else {
            acc += char;
        }
    }

    if (acc) {
        output.push(acc);
    }

    return output;
}

export {parseToken};
