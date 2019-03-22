
export function includes(object: object, properties: string[] | string) {
  if (typeof properties === "string") {
    return object.hasOwnProperty(properties);
  }

  return properties.every((key) => object.hasOwnProperty(key));
}
