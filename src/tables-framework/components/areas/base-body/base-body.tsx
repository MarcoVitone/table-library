import type {ElementType, FC, ReactNode} from 'react';

interface IBaseBodyProps {
    component?: ElementType;
    className?: string;
    children: ReactNode;
}

const BaseBody: FC<IBaseBodyProps> = ({
    component: Component = 'tbody',
    className,
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

export type {IBaseBodyProps};
export {BaseBody};
