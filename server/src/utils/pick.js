/**
 * Returns a shallow copy of `obj` containing only the given keys.
 * Used on update endpoints to stop clients from setting fields like
 * _id, owner, createdAt, updatedAt, or __v via the request body.
 */
export function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
