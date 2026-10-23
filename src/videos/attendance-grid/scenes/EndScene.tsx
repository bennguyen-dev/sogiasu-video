import { Interactive } from "remotion";
import { EndCard } from "../../create-class/scenes/EndScene";

const EndSceneInner = () => (
  <EndCard
    episode="Tập 10 · Bảng điểm danh"
    title={
      <>
        Cả tháng, mọi lớp
        <br />
        trên một bảng.
      </>
    }
    titleSize={100}
    next={{ episode: "Tập 11", title: "Xem doanh thu" }}
  />
);

export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
