import * as React from "react";
import Svg, { SvgProps, Rect, G, Path, Defs, ClipPath } from "react-native-svg";
const BankCodesarrow = (props: SvgProps) => (
  <Svg width={26} height={26} fill="none" {...props}>
    <Rect width={26} height={26} fill="#F7F7F7" rx={13} />
    <G clipPath="url(#a)">
      <Path
        fill="#212427"
        d="M10.305 18.255a.729.729 0 0 0 1.033 0l4.847-4.847a.58.58 0 0 0 0-.823l-4.847-4.847a.729.729 0 0 0-1.033 0 .729.729 0 0 0 0 1.032L14.528 13 10.3 17.229c-.28.28-.28.746.006 1.026Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M6 6h14v14H6z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default BankCodesarrow;
