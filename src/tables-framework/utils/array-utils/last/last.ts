function last<T = unknown>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

export {last};
