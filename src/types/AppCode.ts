export enum AppCode {
    VertexNotFound = "VertexNotFound",
    VertexAlreadyExists= "VertexAlreadyExists"
}

export function getAppCodeMessage(appCode: AppCode, arg1?): string {
    switch (appCode) {
        case AppCode.VertexNotFound:
            return `Vertex ${arg1} not found`;
        case AppCode.VertexAlreadyExists:
            return `Vertex ${arg1} already exists`
        default:
            neverReached(appCode);
    }
}

// tslint:disable-next-line:no-empty
const neverReached = (never: never) => {
    //
};
