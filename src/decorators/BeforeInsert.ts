const beforeInsertHooksMetadataKey = Symbol("beforeInsertHooks");

export function BeforeInsert(): (target: any, propertyKey: string) => void {
    return registerProperty;
}

function registerProperty(target: object, propertyKey: string): void {
    let beforeInsertHooks: string[] = Reflect.getMetadata(beforeInsertHooksMetadataKey, target);

    if (beforeInsertHooks) {
        beforeInsertHooks.push(propertyKey);
    } else {
        beforeInsertHooks = [propertyKey];
        Reflect.defineMetadata(beforeInsertHooksMetadataKey, beforeInsertHooks, target);
    }
}

export function getBeforeInsertHooks(origin: any): object {
    const hocks: string[] = Reflect.getMetadata(beforeInsertHooksMetadataKey, origin) || [];
    const result = {};
    hocks.forEach(key => (result[key] = origin[key]));
    return result;
}
