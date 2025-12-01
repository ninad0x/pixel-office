export type AtlasFrame = {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};


export function getThumbStyle(frame: AtlasFrame) {
  const { x, y } = frame.frame;

  return {
    width: 32,
    height: 32,
    backgroundImage: "/objects_atlas.png",
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: `2048px auto`,        // atlas width
  };
}
