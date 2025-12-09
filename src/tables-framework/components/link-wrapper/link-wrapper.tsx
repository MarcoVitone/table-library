import type { ReactNode } from "react";
import type { ILinkConfig, ILinkObject } from "../../defines/common.types";

interface ILinkWrapperProps {
  config?: ILinkConfig<ILinkObject>;
  row: ILinkObject;
  children: ReactNode;
}

const LinkWrapper = ({ config, row, children }: ILinkWrapperProps) => {
  if (!config) {
    return <>{children}</>;
  }

  const {
    types,
    to,
    target,
    className,
    component: CustomComponent,
    style,
    textDecoration,
  } = config;
  const destination = to(row);

  const combinedStyle = {
    ...style,
    ...(textDecoration ? { textDecoration } : {}),
  };

  if (types === "native") {
    return (
      <a
        href={destination as string}
        target={target}
        className={className}
        style={combinedStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </a>
    );
  }

  if (types === "custom" && CustomComponent) {
    return (
      <CustomComponent
        to={destination}
        target={target}
        className={className}
        style={combinedStyle}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {children}
      </CustomComponent>
    );
  }

  // Generic handling for routers like React Router or Next.js if passed as 'component'
  // Usually for these you would use 'custom' type, but we can support standard prop patterns
  if ((types === "react-router" || types === "nextjs") && CustomComponent) {
    return (
      <CustomComponent
        to={destination} // React Router uses 'to', Next.js <Link> uses 'href' but effectively 'to' in wrappers usually
        href={types === "nextjs" ? destination : undefined}
        target={target}
        className={className}
        style={combinedStyle}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {children}
      </CustomComponent>
    );
  }

  // Fallback if component missing
  return <>{children}</>;
};

export { LinkWrapper };
export type { ILinkWrapperProps };
