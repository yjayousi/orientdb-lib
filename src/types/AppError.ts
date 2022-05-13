import { AppCode, getAppCodeMessage } from "./AppCode";

export class AppError extends Error {
    public readonly appCode: AppCode;
    public readonly data: any;
    constructor(appCode: AppCode, data?: any) {
        super(getAppCodeMessage(appCode));
        this.name = AppError.name;
        this.appCode = appCode;
        this.data = data;
    }
}
