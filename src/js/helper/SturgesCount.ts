export function sturgesCount(n:number): number {
    return Math.max(1, Math.ceil(Math.log2(n) + 1));
}