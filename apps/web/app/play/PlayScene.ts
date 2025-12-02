import * as Phaser from "phaser";
import { BaseMapData, PlayerData, TILE_SIZE } from "../../common/types";
import { useGameStore } from "../../store/gameStore";
import { socket } from "../../common/socket";

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

  lastX = 0;
  lastY = 0;
  lastMoving = false
  lastDir = "down"

  constructor() {
    super("PlayScene");
  }

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
    
    socket.emit("join", { id: gameState.myId, room: gameState.room });
    gameState.updatePlayer({
      id: gameState.myId,
      x: this.player.x,
      y: this.player.y,
      direction: "down",
      moving: false,
      avatar: "avatar"
    })

    console.log("id is", gameState.myId);

    socket.on("players-in-room", (list: PlayerData[]) => {
      list.forEach(p => gameState.updatePlayer(p) )
    })

    socket.on("player-joined", p => {
      gameState.updatePlayer(p);
    });

    socket.on("move", p => {
      gameState.updatePlayer(p);
    });

    socket.on("player-left", ({ id }) => {
      gameState.removePlayer(id);
    });


    

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
    const speed = 2.4;
    let moving = false;
    let direction = this.lastDir
    const gameState = useGameStore.getState()

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    if (left) {
      this.player.x -= speed;
      this.player.play("walk-left", true);
      moving = true;
      direction = "left"

    } else if (right) {
      this.player.x += speed;
      this.player.play("walk-right", true);
      moving = true;
      direction = "right"

    } else if (up) {
      this.player.y -= speed;
      this.player.play("walk-up", true);
      moving = true;
      direction = "up"

    } else if (down) {
      this.player.y += speed;
      this.player.play("walk-down", true);
      moving = true;
      direction = "down"

    }

    if (!moving) {
      const key = this.player.anims.currentAnim?.key;
      if (key) this.player.play(key.replace("walk", "idle"));
    }

    // emit event
    if (this.player.x !== this.lastX || 
        this.player.y !== this.lastY ||
        moving !== this.lastMoving
      ) {
      socket.emit("move", {
        id: gameState.myId,
        room: gameState.room,
        x: this.player.x,
        y: this.player.y,
        direction,
        moving
      });

      this.lastX = this.player.x;
      this.lastY = this.player.y;
      this.lastMoving = moving;
      this.lastDir = direction
    }


    // other players
    const players = useGameStore.getState().players;
      for (const id in players) {
        if (id === gameState.myId) continue
        const p = players[id];

        if (!this.remotePlayers[id]) {
          this.remotePlayers[id] = this.add.sprite(p.x, p.y, "avatar");
        }

        const sprite = this.remotePlayers[id];
        sprite.setPosition(p.x, p.y);

        if (p.moving) {
          this.remotePlayers[id].play(`walk-${p.direction}`, true);
        } else {
          this.remotePlayers[id].stop();
          this.remotePlayers[id].play(`idle-${p!.direction}`, true);
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


  drawFloor(map: BaseMapData) {
    if (!map) return
    const layer = this.add.container();
    for (let y = 0; y < map.floor.length; y++) {
      for (let x = 0; x < map.floor[0].length; x++) {
        const id = map.floor[y][x];
        if (id >= 0) {
          const img = this.add.image(x * TILE_SIZE, y * TILE_SIZE, "floor", id);
          img.setOrigin(0, 0);
          layer.add(img);
        }
      }
    }
  }

  drawObjects(map: BaseMapData) {
    const layer = this.add.container();
    map.objects.forEach((o) => {
      // console.log(o.sprite);
      const img = this.add.image(o.x, o.y, "objects", o.sprite);
      img.setOrigin(0.5);
      layer.add(img);
    });
  }
}
