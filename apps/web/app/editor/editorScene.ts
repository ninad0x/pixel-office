import * as Phaser from "phaser";
import { TILE_SIZE, MAP_W, MAP_H } from "../../common/types";
import { useEditorStore } from "../../store/editorStore";

export class EditorScene extends Phaser.Scene {
  floorLayer!: Phaser.GameObjects.Container;
  objectsLayer!: Phaser.GameObjects.Container;
  previewObj: Phaser.GameObjects.Image | null = null;

  constructor() {
    super("EditorScene");
  }

  preload() {
    this.load.spritesheet("floor", "/floor.png", {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });

    this.load.atlas("objects", "/objects_atlas.png", "/objects_atlas.json");
  }

  create() {
    this.floorLayer = this.add.container();
    this.objectsLayer = this.add.container();

    this.input.on("pointerdown", this.handleClick, this);
    this.input.on("drag", this.handleDrag, this);
    this.input.on("pointermove", this.updatePreview, this);

    this.drawFloor();
    this.drawObjects();
  }

  updatePreview(pointer: Phaser.Input.Pointer) {
    const store = useEditorStore.getState();
    const frame = store.selectedObject;

    if (!frame) {
      this.previewObj?.destroy();
      this.previewObj = null;
      return;
    }

    if (!this.previewObj) {
      this.previewObj = this.add.image(0, 0, "objects", frame)
        .setAlpha(0.5)
        .setDepth(9999);
    }

    this.previewObj.x = pointer.worldX;
    this.previewObj.y = pointer.worldY;
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    const store = useEditorStore.getState();
    const x = Math.floor(pointer.worldX / TILE_SIZE);
    const y = Math.floor(pointer.worldY / TILE_SIZE);

    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;

    if (store.selectedTile !== null) {
      store.setTile(x, y, store.selectedTile);
      this.drawFloor();
      return;
    }

    if (store.selectedObject !== null) {
      const tooClose = store.objects.some(o =>
        Math.abs(o.x - pointer.worldX) < 32 &&
        Math.abs(o.y - pointer.worldY) < 32
      );
      if (tooClose) return;

      store.placeObject(store.selectedObject, pointer.worldX, pointer.worldY);
      this.drawObjects();
      this.previewObj?.destroy();
      this.previewObj = null;
    }

    if (store.selectedArea !== null) {
      store.setArea(x, y, store.selectedArea);
      this.drawFloor();
      return;
    }
    
  }

  handleDrag(_ptr: Phaser.Input.Pointer, img: Phaser.GameObjects.Image, dragX: number, dragY: number) {
    const store = useEditorStore.getState();
    img.x = dragX;
    img.y = dragY;
    store.moveObject(img.name, dragX, dragY);
  }

  drawFloor() {
    console.log("floor drawn");
    const { floor, areaType } = useEditorStore.getState();

    this.floorLayer.removeAll(true);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const id = floor[y][x];


        if (id >= 0) {
          const tile = this.add.image(x * TILE_SIZE, y * TILE_SIZE, "floor", id);
          tile.setOrigin(0, 0);
          this.floorLayer.add(tile);
        }

        const g = this.add.graphics();
        g.lineStyle(1, 0x888888, 0.3);
        g.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);


        if (areaType[y][x] === 1) {
          console.log("aT", areaType[y][x]);
          const o = this.add.graphics();
          o.fillStyle(0xff0000, 0.28);
          o.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          this.floorLayer.add(o);
        }

        if (areaType[y][x] === 2) {
          const o = this.add.graphics();
          o.fillStyle(0xffff00, 0.28);
          o.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          this.floorLayer.add(o);
        }


        this.floorLayer.add(g);
      }
    }
  }


  drawObjects() {
    const store = useEditorStore.getState();
    this.objectsLayer.removeAll(true);

    store.objects.forEach((o) => {
      const img = this.add.image(o.x, o.y, "objects", o.sprite);
      img.setName(o.id);
      img.setOrigin(0.5);
      img.setInteractive({ draggable: true });
      // this.input.setDraggable(img);
      this.objectsLayer.add(img);
    });
  }
}
