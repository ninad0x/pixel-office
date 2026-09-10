// import * as Phaser from "phaser";
// import { useEditorStore } from "../../store/editorStore";
// import { MAP_H, MAP_W, TILE_SIZE } from "@/lib/schema/map";

// export class EditorScene extends Phaser.Scene {
//   map!: Phaser.Tilemaps.Tilemap;
//   floorLayer!: Phaser.Tilemaps.TilemapLayer;
//   objectsLayer!: Phaser.GameObjects.Container;
//   zoneLayer!: Phaser.GameObjects.Container;
//   overlayLayer!: Phaser.GameObjects.Container;
//   collisionGraphics!: Phaser.GameObjects.Graphics;
//   previewObj: Phaser.GameObjects.Image | null = null;
//   zoneDragStart: { x: number; y: number } | null = null;
//   zonePreview: Phaser.GameObjects.Graphics | null = null;
  
//   unsubscribe?: () => void;
//   unsubscribeStore?: () => void;

//   constructor() {
//     super("EditorScene");
//   }

//   preload() {
//     this.load.spritesheet("floor", "/floor.png", {
//       frameWidth: TILE_SIZE,
//       frameHeight: TILE_SIZE,
//     });
//     this.load.atlas("objects", "/objects_atlas.png", "/objects_atlas.json");
//   }

//   create() {
//     this.map = this.make.tilemap({
//       width: MAP_W,
//       height: MAP_H,
//       tileWidth: TILE_SIZE,
//       tileHeight: TILE_SIZE,
//     });

//     const tileset = this.map.addTilesetImage("floor", "floor")!;
//     this.floorLayer = this.map.createBlankLayer("floor", tileset)!;
//     this.collisionGraphics = this.add.graphics(); // created right after floor, so it sits below zones/objects

//     this.zoneLayer = this.add.container();
//     this.objectsLayer = this.add.container();

//     this.redrawFloorFromStore();
//     this.drawZones();
//     this.drawObjects();

//     this.input.on("pointerdown", this.handlePointerDown, this);
//     this.input.on("pointermove", this.handlePointerMove, this);
//     this.input.on("pointerup", this.handlePointerUp, this);
//     this.input.on("drag", this.handleDrag, this);

//     this.unsubscribe = useEditorStore.subscribe((state, prevState) => {
//       if (state.floor !== prevState.floor || state.collision !== prevState.collision) {
//         this.redrawFloorFromStore();
//       }
//       if (state.objects !== prevState.objects) this.drawObjects();
//       if (state.zones !== prevState.zones) this.drawZones();
//     });

//     // covers both scene-stop and full component/game teardown
//     this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
//     this.events.once(Phaser.Scenes.Events.DESTROY, () => this.unsubscribe?.());
//   }

//   redrawFloorFromStore() {
//     const { floor, collision } = useEditorStore.getState();
//     this.collisionGraphics.clear();

//     for (let y = 0; y < MAP_H; y++) {
//       for (let x = 0; x < MAP_W; x++) {
//         const id = floor[y]?.[x] ?? -1;
//         this.floorLayer.putTileAt(id >= 0 ? id : -1, x, y);

//         // grid outline — was missing
//         this.collisionGraphics.lineStyle(1, 0x888888, 0.3);
//         this.collisionGraphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

//         if (collision[y]?.[x]) {
//           this.collisionGraphics.fillStyle(0xff0000, 0.3);
//           this.collisionGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
//         }
//       }
//     }
//   }
  
//   shutdown() {
//     this.unsubscribe?.();
//   }


//   private redrawAll() {
//     this.drawFloor();
//     this.drawObjects();
//     this.drawZones();
//     this.drawSpawn();
//   }

//   private getGridPos(pointer: Phaser.Input.Pointer) {
//     return {
//       x: Math.floor(pointer.worldX / TILE_SIZE),
//       y: Math.floor(pointer.worldY / TILE_SIZE),
//     };
//   }

//   private inBounds(x: number, y: number) {
//     return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
//   }

//   private applyTool(pointer: Phaser.Input.Pointer) {
//     const store = useEditorStore.getState();
//     const { x, y } = this.getGridPos(pointer);

//     switch (store.activeTool) {
//       case "tile":
//         if (this.inBounds(x, y) && store.selectedTile !== null) {
//           store.setTile(x, y, store.selectedTile);
//           this.drawFloor();
//         }
//         break;

//       case "collision":
//         if (this.inBounds(x, y)) {
//           store.setCollision(x, y, true);
//           this.drawFloor();
//         }
//         break;

//       case "eraser":
//         if (this.inBounds(x, y)) {
//           store.setTile(x, y, -1);
//           store.setCollision(x, y, false);

//           const clickedObj = store.objects.find(
//             (o) => Math.abs(o.x - pointer.worldX) < 16 && Math.abs(o.y - pointer.worldY) < 16
//           );
//           if (clickedObj) store.removeObject(clickedObj.id);

//           this.redrawAll();
//         }
//         break;
//     }
//   }

//   private handlePointerDown(pointer: Phaser.Input.Pointer) {
//     const store = useEditorStore.getState();

//     if (["tile", "collision", "eraser"].includes(store.activeTool)) {
//       this.applyTool(pointer);
//       return;
//     }

//     if (store.activeTool === "object" && store.selectedObject) {
//       const tooClose = store.objects.some(
//         (o) => Math.abs(o.x - pointer.worldX) < 32 && Math.abs(o.y - pointer.worldY) < 32
//       );
//       if (!tooClose) {
//         store.placeObject(store.selectedObject, pointer.worldX, pointer.worldY, 1, 1);
//         this.drawObjects();
//         this.previewObj?.destroy();
//         this.previewObj = null;
//       }
//     } else if (store.activeTool === "zone") {
//       this.zoneDragStart = { x: pointer.worldX, y: pointer.worldY };
//     } else if (store.activeTool === "spawn") {
//       store.setSpawn(pointer.worldX, pointer.worldY);
//       this.drawSpawn();
//     }
//   }

//   private handlePointerMove(pointer: Phaser.Input.Pointer) {
//     const store = useEditorStore.getState();

//     // Brush stroke on drag
//     if (pointer.isDown && ["tile", "collision", "eraser"].includes(store.activeTool)) {
//       this.applyTool(pointer);
//     }

//     if (store.activeTool === "object") {
//       this.updateObjectPreview(pointer);
//     }

//     if (store.activeTool === "zone" && this.zoneDragStart) {
//       this.drawZonePreview(this.zoneDragStart, { x: pointer.worldX, y: pointer.worldY });
//     }
//   }

//   private handlePointerUp(pointer: Phaser.Input.Pointer) {
//     const store = useEditorStore.getState();

//     if (store.activeTool === "zone" && this.zoneDragStart && store.selectedZoneType) {
//       const x = Math.min(this.zoneDragStart.x, pointer.worldX);
//       const y = Math.min(this.zoneDragStart.y, pointer.worldY);
//       const width = Math.abs(pointer.worldX - this.zoneDragStart.x);
//       const height = Math.abs(pointer.worldY - this.zoneDragStart.y);

//       if (width > 4 && height > 4) {
//         store.addZone({
//           id: crypto.randomUUID(),
//           x,
//           y,
//           width,
//           height,
//           type: store.selectedZoneType,
//         });
//         this.drawZones();
//       }
//     }

//     this.zoneDragStart = null;
//     this.zonePreview?.destroy();
//     this.zonePreview = null;
//   }

//   private handleDrag(_ptr: Phaser.Input.Pointer, img: Phaser.GameObjects.Image, dragX: number, dragY: number) {
//     img.x = dragX;
//     img.y = dragY;
//     useEditorStore.getState().moveObject(img.name, dragX, dragY);
//   }

//   private updateObjectPreview(pointer: Phaser.Input.Pointer) {
//     const frame = useEditorStore.getState().selectedObject;

//     if (!frame) {
//       this.previewObj?.destroy();
//       this.previewObj = null;
//       return;
//     }

//     if (!this.previewObj) {
//       this.previewObj = this.add.image(0, 0, "objects", frame).setAlpha(0.5).setDepth(9999);
//     }

//     this.previewObj.x = pointer.worldX;
//     this.previewObj.y = pointer.worldY;
//   }

//   private drawZonePreview(start: { x: number; y: number }, current: { x: number; y: number }) {
//     this.zonePreview?.destroy();
//     this.zonePreview = this.add.graphics().setDepth(9999);
//     this.zonePreview.fillStyle(0x00aaff, 0.3);
//     this.zonePreview.fillRect(
//       Math.min(start.x, current.x),
//       Math.min(start.y, current.y),
//       Math.abs(current.x - start.x),
//       Math.abs(current.y - start.y)
//     );
//   }

//   private drawFloor() {
//     const { floor, collision } = useEditorStore.getState();
//     this.floorLayer.fill(-1);

//     for (let y = 0; y < MAP_H; y++) {
//       const row = floor[y];
//       if (!row) continue;

//       for (let x = 0; x < row.length; x++) {
//         const id = row[x];

//         if (id !== undefined && id >= 0) {
//           const tile = this.add.image(x * TILE_SIZE, y * TILE_SIZE, "floor", id);
//           tile.setOrigin(0, 0);
//           this.floorLayer.add(tile);
//         }

//         const g = this.add.graphics();
//         g.lineStyle(1, 0x888888, 0.3);
//         g.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
//         this.floorLayer.add(g);

//         if (collision[y]?.[x]) {
//           const c = this.add.graphics();
//           c.fillStyle(0xff0000, 0.3);
//           c.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
//           this.floorLayer.add(c);
//         }
//       }
//     }
//   }

//   private drawObjects() {
//     const { objects } = useEditorStore.getState();
//     this.objectsLayer.removeAll(true);

//     objects.forEach((o) => {
//       const img = this.add.image(o.x, o.y, "objects", o.sprite);
//       img.setName(o.id);
//       img.setOrigin(0.5);
//       img.setInteractive({ draggable: true });
//       this.objectsLayer.add(img);
//     });
//   }

//   private drawZones() {
//     const { zones } = useEditorStore.getState();
//     this.zoneLayer.removeAll(true);

//     const colors: Record<string, number> = {
//       meeting: 0x00aaff,
//       silent: 0xaaaaaa,
//       music: 0xff00ff,
//       portal: 0xffaa00,
//     };

//     zones.forEach((z) => {
//       const g = this.add.graphics();
//       g.fillStyle(colors[z.type] ?? 0xffffff, 0.25);
//       g.fillRect(z.x, z.y, z.width, z.height);
//       this.zoneLayer.add(g);
//     });
//   }

//   private drawSpawn() {
//     const { spawn } = useEditorStore.getState();
//     this.overlayLayer.removeAll(true);

//     const g = this.add.graphics();
//     g.fillStyle(0x00ff00, 0.8);
//     g.fillCircle(spawn.x, spawn.y, 8);
//     g.lineStyle(2, 0xffffff, 1);
//     g.strokeCircle(spawn.x, spawn.y, 8);
//     this.overlayLayer.add(g);
//   }
// }