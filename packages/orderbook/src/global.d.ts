declare module 'sorted-array' {
    export default class SortedArray<T> {
        public array: Array<T>;
        constructor(array: Array<T>, compareFn: (a: T, b: T) => number);
        public search(element: T): number;
        public insert(element: T): Array<T>;
        public remove(element: T): Array<T>;
    }
}
