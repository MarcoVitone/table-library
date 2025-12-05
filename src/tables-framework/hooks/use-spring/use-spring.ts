import type { UseSpringProps } from "@react-spring/web";
import { useSpring as _useSpring } from "@react-spring/web";

function useSpring<TProps extends object>(
  props:
    | (TProps & UseSpringProps<TProps>)
    | UseSpringProps
    | (() => (TProps & UseSpringProps<TProps>) | UseSpringProps),
  deps: unknown[] = []
) {
  return _useSpring(
    {
      ...props,
      config: {
        mass: 1,
        tension: 170,
        friction: 26,
      },
    },
    [...deps]
  );
}

export { useSpring };
