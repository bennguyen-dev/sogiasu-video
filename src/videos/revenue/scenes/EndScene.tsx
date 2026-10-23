import { Interactive } from "remotion";
import { EndCard } from "../../create-class/scenes/EndScene";

const EndSceneInner = () => (
  <EndCard
    episode="Tập 11 · Xem doanh thu"
    title={
      <>
        Đã thu, chưa thu
        <br />
        trên một trang.
      </>
    }
    titleSize={100}
    next={{ episode: "Tập 12", title: "Cài đặt và kết nối" }}
  />
);

export const EndScene = Interactive.create({ Component: EndSceneInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
