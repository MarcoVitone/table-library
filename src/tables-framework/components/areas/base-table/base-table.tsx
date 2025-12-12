import type { ElementType, FC, ReactNode } from "react";

interface IBaseTableProps {
  component?: ElementType;
  children: ReactNode;
  className?: string;
}

const BaseTable: FC<IBaseTableProps> = ({
  component: Component = "table",
  children,
  className,
}) => {
  return (
    <Component
      style={{
        borderCollapse: "separate",
        borderSpacing: "0",
        width: "100%",
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

export type { IBaseTableProps };
export { BaseTable };
