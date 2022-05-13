export enum AppCode {
    VertexNotFound = "VertexNotFound"
}

export function getAppCodeMessage(appCode: AppCode, arg1?): string {
    switch (appCode) {
        case AppCode.VertexNotFound:
            return `Vertex ${arg1} not found`;
        default:
            neverReached(appCode);
    }
}

// tslint:disable-next-line:no-empty
const neverReached = (never: never) => {
    //
};
