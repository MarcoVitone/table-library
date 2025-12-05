import type {ElementType, FC, ReactNode} from 'react';

interface IBaseFooterProps {
    component?: ElementType;
    children: ReactNode;
}

const BaseFooter: FC<IBaseFooterProps> = ({
    component: Component = 'tfoot',
    children
}) => {
    return <Component>{children}</Component>;
};

export type {IBaseFooterProps};
export {BaseFooter};
