import { useEditorStore } from "../store/editorStore";

export function RightPanel() {
  const state = useEditorStore();

  const exportJSON = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.download = "map.json";
    a.href = URL.createObjectURL(blob);
    a.click();
  };

  return (
    <div className="w-80 bg-[#222] text-white p-2.5">
      <button onClick={exportJSON}>Export</button>
    </div>
  );
}
