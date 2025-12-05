import type {ElementType, FC, ReactNode} from 'react';

interface IBaseHeaderProps {
    component?: ElementType;
    children: ReactNode;
}

const BaseHeader: FC<IBaseHeaderProps> = ({
    component: Component = 'thead',
    children
}) => {
    return <Component>{children}</Component>;
};

export type {IBaseHeaderProps};
export {BaseHeader};
