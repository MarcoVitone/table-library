import type {ElementType, FC, ReactNode} from 'react';

interface IBaseTableProps {
    component?: ElementType;
    children: ReactNode;
    className?: string;
}

const BaseTable: FC<IBaseTableProps> = ({
    component: Component = 'table',
    children
}) => {
    return (
        <Component style={{borderCollapse: 'collapse', width: '100%'}}>
            {children}
        </Component>
    );
};

export type {IBaseTableProps};
export {BaseTable};
