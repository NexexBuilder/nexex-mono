import {Inject} from '@nestjs/common';

export function getCollectionToken(name: string) {
    return `${name}Collection`;
}

export const InjectCollection = (name: string) => Inject(getCollectionToken(name));
