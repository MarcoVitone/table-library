function shuffle<T>(array: T[]): T[] {
    let current = array.length;

    while (current !== 0) {
        const random = Math.floor(Math.random() * current);

        current--;

        [array[current], array[random]] = [array[random], array[current]];
    }

    return array;
}

export {shuffle};
