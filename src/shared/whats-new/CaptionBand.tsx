import { colors } from "../theme";
import { BAND } from "./layout";

// the band behind the StepCaption: the panned phone slides under it
export const CaptionBand = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: BAND,
      background: `linear-gradient(${colors.paper} 82%, ${colors.paper}00)`,
    }}
  />
);
