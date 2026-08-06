import * as Phaser from "phaser";
import { useGameStore } from "@/store/gameStore";
import { socket } from "@/lib/ws/ws-manager"
import { GameMap, TILE_SIZE } from "@/lib/schema/map";
import { Op, PlayerJoinedData, PlayerLeftData, PlayerMovedData, PlayersInRoomData } from "@/types/protocol";

const SPEED = 2.4;

export class PlayScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Sprite;
  remotePlayers: Record<string, Phaser.GameObjects.Sprite> = {}
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    keys!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }

  frameCount = 0
  lastX = 0;
  lastY = 0;
  lastMoving = false
  lastDir: "up" | "down" | "left" | "right" = "down";

  constructor() {
    super("PlayScene");
  }

  private handleMove = (p: PlayerMovedData) => {
    const sprite = this.remotePlayers[p.id];
    if (!sprite) return

    this.tweens.add({
      targets: sprite,
      x: p.x,
      y: p.y,
      duration: 66,
      ease: "Linear",
    });

    if (p.moving) {
      sprite.play(`walk-${p.direction}`, true);
    } else {
      const key = sprite.anims.currentAnim?.key;
      if (key) sprite.play(key.replace("walk", "idle"), true);
    }

    // old approach, updates 60 fps
    // if (sprite) sprite.setPosition(p.x, p.y);
  };

  private handlePlayerJoined = (p: PlayerJoinedData) => {
    useGameStore.getState().updatePlayer(p);
    if (!this.remotePlayers[p.id]) {
      this.remotePlayers[p.id] = this.add.sprite(p.x, p.y, "avatar");
    }
  };

  private handlePlayerLeft = ({ id }: PlayerLeftData) => {
    useGameStore.getState().removePlayer(id);
    this.remotePlayers[id]?.destroy();
    delete this.remotePlayers[id];
  };

  private handlePlayersInRoom = (list: PlayersInRoomData) => {
    list.forEach((p) => {
      useGameStore.getState().updatePlayer(p);
      if (!this.remotePlayers[p.id]) {
        this.remotePlayers[p.id] = this.add.sprite(p.x, p.y, "avatar");
      }
    });
  };

  preload() {
    this.load.atlas("objects", "/objects_atlas.png", "/objects_atlas.json");
    this.load.spritesheet("floor", "/floor.png", { 
      frameWidth: 32,
      frameHeight: 32 
    });
    this.load.spritesheet("avatar", "/light_male_pkmn_black.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  shutdown() {
    socket.off(Op.MOVE, this.handleMove);
    socket.off(Op.PLAYER_JOINED, this.handlePlayerJoined);
    socket.off(Op.PLAYER_LEFT, this.handlePlayerLeft);
    socket.off(Op.PLAYERS_IN_ROOM, this.handlePlayersInRoom);
  }


  create() {
    const gameState = useGameStore.getState();
    if (!gameState.myId || !gameState.room) {
      console.warn("No ID/room found — cannot join!");
      return;
    }

    const map = gameState.map
    if (!map) return;
    
    this.drawFloor(map);
    this.drawObjects(map);
    this.player = this.add.sprite(map.spawn.x, map.spawn.y, "avatar", 0);

    
    // add socket handlers
    socket.send(Op.JOIN, {})

    socket.on(Op.PLAYERS_IN_ROOM, this.handlePlayersInRoom)
    socket.on(Op.MOVE, this.handleMove);
    socket.on(Op.PLAYER_JOINED, this.handlePlayerJoined);
    socket.on(Op.PLAYER_LEFT, this.handlePlayerLeft);
    

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      W: Phaser.Input.Keyboard.Key
      A: Phaser.Input.Keyboard.Key
      S: Phaser.Input.Keyboard.Key
      D: Phaser.Input.Keyboard.Key
    }

    this.createAnimations();
  }


  update() {
    let moving = false;
    let direction = this.lastDir
    this.frameCount++

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    // movement
    let nextX = this.player.x;
    let nextY = this.player.y;

    if (left) { nextX -= SPEED; direction = "left"; moving = true; }
    else if (right) { nextX += SPEED; direction = "right"; moving = true; }
    else if (up) { nextY -= SPEED; direction = "up"; moving = true; }
    else if (down) { nextY += SPEED; direction = "down"; moving = true; }

    if (moving && !this.isBlocked(nextX, nextY)) {
      this.player.x = nextX;
      this.player.y = nextY;
      this.player.play(`walk-${direction}`, true);
    } else if (!moving) {
      const key = this.player.anims.currentAnim?.key;
      if (key) this.player.play(key.replace("walk", "idle"));
    }

    if (moving) this.lastDir = direction;
    
    // emit event
    if (this.frameCount % 4 === 0) {
      if (this.player.x !== this.lastX || 
        this.player.y !== this.lastY ||
        moving !== this.lastMoving) {
          
          socket.send(Op.MOVE, {
            x: this.player.x,
            y: this.player.y,
            moving,
            direction
          })

        this.lastX = this.player.x;
        this.lastY = this.player.y;
        this.lastMoving = moving;
        this.lastDir = direction
      }
    }
    
  }

  createAnimations() {
    this.anims.create({ key: "idle-down", frames: [{ key: "avatar", frame: 0 }] });
    this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("avatar", { frames: [1, 2] }), frameRate: 6, repeat: -1 });

    this.anims.create({ key: "idle-left", frames: [{ key: "avatar", frame: 3 }] });
    this.anims.create({ key: "walk-left", frames: this.anims.generateFrameNumbers("avatar", { frames: [4, 5] }), frameRate: 6, repeat: -1 });

    this.anims.create({ key: "idle-up", frames: [{ key: "avatar", frame: 6 }] });
    this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("avatar", { frames: [7, 8] }), frameRate: 6, repeat: -1 });

    this.anims.create({ key: "idle-right", frames: [{ key: "avatar", frame: 9 }] });
    this.anims.create({ key: "walk-right", frames: this.anims.generateFrameNumbers("avatar", { frames: [10, 11] }), frameRate: 6, repeat: -1 });
  }


  drawFloor(map: GameMap) {
    if (!map) return;

    const tilemap = this.make.tilemap({
      data: map.floor,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const tileset = tilemap.addTilesetImage("floor")!;
    tilemap.createLayer(0, tileset, 0, 0);
  }

  drawObjects(map: GameMap) {
    if (!map) return
    const { objects } = map
    const layer = this.add.container();

    objects.forEach((o) => {
      const img = this.add.image(o.x, o.y, "objects", o.sprite);
      img.setOrigin(0.5);
      layer.add(img);
    });
  }

  private isBlocked(x: number, y: number): boolean {
    const map = useGameStore.getState().map;
    if (!map) return false;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    return map.collision[row]?.[col] ?? false;
  }


}
