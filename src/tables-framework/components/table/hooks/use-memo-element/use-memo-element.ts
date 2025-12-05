import type {
  TCellCombo,
  TRowCombo,
} from "../../../../defines/common.types.ts";

type TElementCombo = TCellCombo | TRowCombo;

const useMemoElement = (latest: TElementCombo): TElementCombo => {
  // const ref = useRef<TElementCombo>(latest);

  // if (latest[0] !== ref.current[0]) {
  //     ref.current = [latest[0], ref.current[1]];
  // }

  // if (latest[1] !== ref.current[1]) {
  //         ref.current = [ref.current[0], latest[1]];
  // }

  // return ref.current;
  return latest;
};

export { useMemoElement };
