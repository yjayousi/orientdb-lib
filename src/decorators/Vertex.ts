export const VERTEX_METADATA_KEY = Symbol("vertex");

export function Vertex(vertexName?: string) {
    return constructorFunction => {
        Reflect.defineMetadata(VERTEX_METADATA_KEY, vertexName, constructorFunction);
    };
}
