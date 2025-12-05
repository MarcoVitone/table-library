const status = {
    init: 'init',
    idle: 'idle',
    loading: 'loading',
    failed: 'failed'
} as const;

type TStatus = (typeof status)[keyof typeof status];

interface IStyleFromProps {
    shouldForwardProp: (prop: string) => boolean;
}

interface IOption {
    id: string;
    value: string;
    code?: string;
}
interface IOptionRest {
    id: string;
    name: string;
    roleId?: number;
    description?: string;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    deletedBy?: string;
    deletedAt?: string;
}

interface IRestResponseCommon {
    code: string;
    message: string;
    text?: string;
}
interface IOptionRestResponse {
    id: number;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
    deletedBy?: string;
    deletedAt?: string;
}

interface IOptionLegalEntity {
    id: string;
    code?: string;
    description: string;
}

interface RestResponse<T> {
    totalCount?: number;
    limit?: number;
    offset?: number;
    info?: IRestResponseCommon;
    error?: IRestResponseCommon;
    message?: string;
    item?: T;
    items?: T[];
}

interface RestResponseUsers<T> {
    totalCount?: number;
    limit?: number;
    offset?: number;
    info?: IRestResponseCommon;
    error?: IRestResponseCommon;
    message?: string;
    item?: T[];
    items?: T[];
}
type TAppStatus = 'LOADING' | 'ERROR' | 'UPDATING' | 'READY';
type TSize = 'small' | 'medium' | 'large';

interface IFlatData {
    id: string;
    flat: Record<string, unknown>;
    full: Record<string, unknown>;
}

type TPageMode = 'EDIT' | 'CREATE';

type TWizardMode = 'SALES_ORDER' | 'TRANSFER_ORDER';

interface IRestResponseCommon {
    code: string;
    message: string;
    text?: string;
}

interface IEnumDTO {
    id: number;
    name: string;
    description: string;
}

export type {
    IEnumDTO,
    IFlatData,
    IOption,
    IOptionLegalEntity,
    IOptionRest,
    IOptionRestResponse,
    IRestResponseCommon,
    IStyleFromProps,
    RestResponse,
    RestResponseUsers,
    TAppStatus,
    TPageMode,
    TSize,
    TStatus,
    TWizardMode
};
export {status};
