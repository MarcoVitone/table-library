import type {ElementType} from 'react';

interface IPrototype {
    prototype: Record<string | number | symbol, unknown>;
}

function isElement(input: ElementType): true;

function isElement(input: unknown): false;

function isElement(input: unknown | ElementType): boolean {
    if (input) {
        if (typeof input === 'string' || typeof input === 'function') {
            return true;
        } else {
            if (typeof input === 'object' && 'prototype' in input) {
                if ('isReactComponent' in (input as IPrototype).prototype) {
                    return true;
                }
            }
        }
    }

    return false;
}

export {isElement};
