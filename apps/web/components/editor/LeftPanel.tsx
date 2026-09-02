// import { loadObjectFrames } from "../helper/loadObjects";
import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { AtlasFrame } from "../../common/getThumbnail";

export function LeftPanel() {

  const [frames, setFrames] = useState<Record<string, AtlasFrame>>({});

  useEffect(() => {
    fetch("/objects_atlas.json")
      .then(r => r.json())
      .then(data => setFrames(data.frames));
  }, []);

  const selectedObject = useEditorStore((s) => s.selectedObject);
  const setSelectedObject = useEditorStore((s) => s.setSelectedObject);
  const selectedTile = useEditorStore((s) => s.selectedTile);
  const setSelectedTile = useEditorStore((s) => s.setSelectedTile);
  const selectedArea = useEditorStore((s) => s.selectedZoneType)
  const setSelectedArea = useEditorStore((s) => s.setSelectedZoneType)

  return (
    <div className="min-w-30 max-w-30">

    <h4 className="mt-4 mb-2 text-sm font-semibold">Tiles</h4>

    <div className="grid grid-cols-2 gap-1 p-2 overflow-y-auto h-64">
      {Array.from({ length: (17*18) }).map((_, i) => {
        const col = i % 18;
        const row = Math.floor(i / 18);

        return (
          <div
            key={i}
            onClick={() => setSelectedTile(i)}
            className={`cursor-pointer ${
              selectedTile === i
                ? "ring-2 ring-yellow-400"
                : "border border-gray-600"
            }`}
            style={{
              width: 32,
              height: 32,
              backgroundImage: "url(/floor.png)",
              backgroundPosition: `-${col * 32}px -${row * 32}px`,
              backgroundSize: `${18 * 32}px ${18 * 32}px`,
              imageRendering: "pixelated",
            }}
          />
        );
      })}
    </div>




      <h4 className="mt-4 mb-2 text-sm font-semibold">Objects</h4>

      <div className="h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 p-2">
          {Object.entries(frames).map(([name, frame]) => (
            <div
              key={name}
              onClick={() => setSelectedObject(name)}
              className={`cursor-pointer ${selectedObject === name ? "ring-2 ring-blue-500" : "border border-gray-600"} bg-[#222] p-1`}
              style={{
                width: frame.frame.w + 8, // +8 for padding
                height: frame.frame.h + 8,
              }}
            >
              <div
                style={{
                  width: frame.frame.w,
                  height: frame.frame.h,
                  backgroundImage: "url(/objects_atlas.png)",
                  backgroundPosition: `-${frame.frame.x}px -${frame.frame.y}px`,
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          ))}
        </div>
      </div>


      <h4 className="mt-4 mb-2 text-sm font-semibold">Areas</h4>
      <div className="flex gap-2 p-2">
        <div
          onClick={() => setSelectedArea(1)}
          className={`w-8 h-8 cursor-pointer ${
            selectedArea === 1 ? "ring-2 ring-red-500" : "border border-gray-600"
          } bg-red-600/60`}
        />
        <div
          onClick={() => setSelectedArea(2)}
          className={`w-8 h-8 cursor-pointer ${
            selectedArea === 2 ? "ring-2 ring-yellow-400" : "border border-gray-600"
          } bg-yellow-400/60`}
        />
        <div
          onClick={() => setSelectedArea(0)}
          className={`w-8 h-8 cursor-pointer ${
            selectedArea === 0 ? "ring-2 ring-white" : "border border-gray-600"
          } bg-gray-400/40`}
        />
      </div>

          
      <button 
        onClick={() => useEditorStore.getState().setAllTiles(selectedTile!)}
        className="m-2 cursor-pointer bg-gray-700 text-white px-2 py-1 mb-2"
      >Fill Map
      </button>



    </div>
  );
}
