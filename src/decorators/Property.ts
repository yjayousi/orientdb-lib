const propertiesMetadataKey = Symbol("properties");

interface PropertyOptions {
  serializer: (propValue: any) => any;
}

export function Property(options?: PropertyOptions): (target: any, propertyKey: string) => void {
  return createPropertyRegistrater(options);
}

function createPropertyRegistrater(propertyOptions: PropertyOptions) {
  return (target: object, propertyKey: string) => {
    let properties: object = Reflect.getMetadata(propertiesMetadataKey, target);

    if (properties) {
      properties[propertyKey] = propertyOptions;
    } else {
      properties = {};
      properties[propertyKey] = propertyOptions;
      Reflect.defineMetadata(propertiesMetadataKey, properties, target);
    }
  };
}

export function getProperties(origin: any): object {
  const properties: object = Reflect.getMetadata(propertiesMetadataKey, origin) || [];
  const result = {};

  for (const propName of Object.keys(properties)) {
    let propValue = origin[propName];
    const propOptions: PropertyOptions = properties[propName];
    if (propOptions) {
      if (propOptions.serializer) {
        propValue = propOptions.serializer(propValue);
      }
    }
    result[propName] = propValue;
  }
  return result;
}
