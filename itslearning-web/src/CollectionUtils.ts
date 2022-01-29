export function addIfNotPresent<T>(list: T[], item: T): void {
  if (list.indexOf(item) == -1) {
    list.push(item);
  }
}