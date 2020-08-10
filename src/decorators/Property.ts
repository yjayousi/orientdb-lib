const propertiesMetadataKey = Symbol("properties");

export function Property(): (target: any, propertyKey: string) => void {
    return registerProperty;
}

function registerProperty(target: object, propertyKey: string): void {
    let properties: string[] = Reflect.getMetadata(propertiesMetadataKey, target);

    if (properties) {
        properties.push(propertyKey);
    } else {
        properties = [propertyKey];
        Reflect.defineMetadata(propertiesMetadataKey, properties, target);
    }
}

export function getProperties(origin: any): object {
    const properties: string[] = Reflect.getMetadata(propertiesMetadataKey, origin) || [];
    const result = {};
    properties.forEach(key => (result[key] = origin[key]));
    return result;
}
