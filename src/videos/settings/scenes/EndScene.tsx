import { Interactive } from "remotion";
import { EndCard } from "../../create-class/scenes/EndScene";

const EndSceneInner = () => (
  <EndCard
    episode="Tập 12 · Cài đặt và kết nối"
    title={
      <>
        Mọi cài đặt
        <br />
        ở tab Khác.
      </>
    }
    titleSize={100}
    next={{ episode: "Đủ 12 tập", title: "Xem tất cả hướng dẫn" }}
  />
);

export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
