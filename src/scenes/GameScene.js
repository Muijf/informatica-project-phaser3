import Phaser from "phaser";

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
		super("gameScene");
	}

	preload()
    {
        this.initAssets();
    }

    create()
    {
        this.initAudio();
        this.initTerrain();
        this.initBackground();
        this.initPlayer();
        this.initCollectibles();
        this.initPhysics();
        this.initCamera();
        this.initControls();
        this.initState();
        this.initHud();

        this.time.addEvent({
            delay: 1,
            callback: this.delayDone,
            callbackScope: this,
            loop: false
        });
    }

    update()
    {
        this.updatePlayer();

        if(this.cursors.space.isDown)
        {
            console.log(Math.floor(this.player.x), Math.floor(this.player.y - 5));
        }

        if(this.state.coinCount === 69)
        {
            this.add.text(this.scale.width / 2, this.scale.height / 2, "JE HEBT ALLE MUNTJES VERZAMELD");
        }
    }

    initHud()
    {
        this.scene.launch("hudScene");
    }

    initAssets()
    {
        // Audio
        this.load.audio("game_music", "assets/audio/game.wav");
        this.load.audio("game_coin_pickup", "assets/audio/coin_pickup.wav");

        // Game graphics
        for(let i = 0; i < 5; ++i)
        {
            this.load.image(`game_background_${i}`, `assets/background/background_${i}.png`)
        }

        this.load.tilemapTiledJSON("game_map", "assets/terrain/terrain.json");
        this.load.image("game_terrain", "assets/terrain/terrain-extruded.png");
        this.load.image("game_terrain_flowers", "assets/terrain/flowers.png");
        this.load.image("game_terrain_bigflowers", "assets/terrain/bigflowers.png");
        this.load.image("game_terrain_vase", "assets/terrain/vase.png");
        this.load.image("game_terrain_roots", "assets/terrain/roots.png");
        this.load.image("game_terrain_grass", "assets/terrain/grass.png");
        this.load.image("game_terrain_door", "assets/terrain/door.png");
        this.load.image("game_terrain_arrow_plate_right", "assets/terrain/arrow_plate_right.png");
        this.load.image("game_terrain_tiki_torch", "assets/terrain/tiki_torch.png");

        this.load.atlas("game_player", "assets/player/character.png", "assets/player/character.json");
        this.load.atlas("game_coin", "assets/collectibles/coin.png", "assets/collectibles/coin.json");
    }

    initAudio()
    {
        this.music = this.sound.add("game_music", { volume: 0, loop: true });
        this.coinSound = this.sound.add("game_coin_pickup", { volume: 0.1 });
        
        this.music.play();

        // Fade in
        this.tweens.add({
            targets: this.music,
            volume: 0.03,
            duration: 2500
        });
    }

    takeDamage()
    {
        /** @ts-ignore */
        const hearts = this.scene.get("hudScene").getHearts();   

        if(this.state.heartCount > 0) {
            const lastHeart = hearts.slice(this.state.heartCount - 1, this.state.heartCount)[0];

            this.state.isHit = true;
            lastHeart.play("lost", true);
            this.player.setVelocityX(0);
            this.player.play("hit", true)
                .on("animationcomplete", () =>
                {
                    this.state.isHit = false;
                });

            this.state.heartCount -= 1;
        } else {
            // you died
        }
    }

    initBackground()
    {
        for(let i = 0; i < 5; ++i)
        {
            let x = 0;

            for(let a = 0; a < 10; ++a)
            {
                const bg = this.add.image(x, this.scale.height, `game_background_${i}`)
                    .setOrigin(0, 1)
                    .setScrollFactor((i + 1) * 0.05)
                    .setDepth(-1);

                x += bg.width;
            }
        }
    }

    initTerrain()
    {
        const tilemap = this.make.tilemap({ key: "game_map" });

        // Terrain
        const tileset0 = tilemap.addTilesetImage("terrain", "game_terrain", 16, 16, 1, 2);

        // Objects
        //const tileset1 = tilemap.addTilesetImage("roots", "game_terrain_roots", 16, 8);
        //const tileset2 = tilemap.addTilesetImage("vase", "game_terrain_vase", 16, 16);

        // Props
        //const tileset3 = tilemap.addTilesetImage("grass", "game_terrain_grass", 16, 8);
        //const tileset4 = tilemap.addTilesetImage("flowers", "game_terrain_flowers", 16, 8);
        //const tileset5 = tilemap.addTilesetImage("bigflowers", "game_terrain_bigflowers", 16, 8);
        //const tileset6 = tilemap.addTilesetImage("door", "game_terrain_door", 24, 24);
        //const tileset7 = tilemap.addTilesetImage("tiki_torch", "game_terrain_tiki_torch", 8, 24);
        const tileset8 = tilemap.addTilesetImage("arrow_plate_right", "game_terrain_arrow_plate_right", 16, 16);

        tilemap.createLayer("background_0", [tileset0]);
        tilemap.createLayer("background_1", [tileset0]);

        //tilemap.createLayer("objects", [tileset1, tileset2]);
        tilemap.createLayer("props", [tileset8]);
        //tilemap.createLayer("props", [tileset3, tileset4, tileset5, tileset6, tileset7, tileset8]);

        this.terrain = tilemap.createLayer("terrain", [tileset0]);
    }

    initPhysics()
    {
        this.terrain.setCollisionByExclusion([-1]);
        this.physics.world.bounds.setSize(this.terrain.width, this.terrain.height);
        this.physics.add.collider(this.terrain, this.player);
        this.physics.add.overlap(this.player, this.coins, this.pickupCoin, null, this);
    }

    pickupCoin(player, coin)
    {
        /** @ts-ignore */
        const hudText = this.scene.get("hudScene").getCoinCountText();

        this.coinSound.play();

        coin.disableBody(true, true);

        this.state.coinCount += 1;
        hudText.setText("Coins: " + this.state.coinCount + "/" + this.coinLocations.length);
    }

    initState()
    {
        this.state = {
            jumping: false,
            jumpsLeft: 2,
            heartCount: 5,
            coinCount: 0,
            isHit: false,
        }
    }

    delayDone()
    {
        this.player.body.setSize(10, 15, true);
    }

    initPlayer()
    {
        this.player = this.physics.add.sprite(110, 200, "game_player");

        this.player.anims.create({
            key: "run",
            frames: this.anims.generateFrameNames("game_player", { prefix: "running_", end: 5 }),
            frameRate: 10
        });
        this.player.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNames("game_player", { prefix: "idle_", end: 3 }),
            frameRate: 10
        });
        this.player.anims.create({
            key: "jump_up",
            frames: this.anims.generateFrameNames("game_player", { prefix: "jump_up_", end: 2 }),
            frameRate: 10
        });
        this.player.anims.create({
            key: "jump_down",
            frames: this.anims.generateFrameNames("game_player", { prefix: "jump_down_", end: 2 }),
            frameRate: 10,
        });
        this.player.anims.create({
            key: "jump_before_or_after",
            frames: this.anims.generateFrameNames("game_player", { prefix: "jump_before_or_after_", end: 1 }),
            frameRate: 10
        });
        this.player.anims.create({
            key: "jump_double",
            frames: this.anims.generateFrameNames("game_player", { prefix: "jump_double_", end: 2 }),
            frameRate: 10
        });
        this.player.anims.create({
            key: "hit",
            frames: this.anims.generateFrameNames("game_player", { prefix: "hit_", end: 2 }),
            frameRate: 10
        })
        this.player.anims.create({
            key: "death",
            frames: this.anims.generateFrameNames("game_player", { prefix: "death_", end: 7 }),
            frameRate: 10
        })
    }

    initCamera()
    {
        this.cameras.main.setBounds(0, 0, this.terrain.width, this.terrain.height);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.5);
    }

    updatePlayer()
    {
        if(!this.state.isHit) {
            const isFlying = !this.player.body.onFloor();

            // Moving left/right
            if(this.cursors.left.isDown)
            {
                if(isFlying)
                {
                    this.doFly(-100);
                }
                else
                {
                    this.doRun(-100);
                }
            }
            else if(this.cursors.right.isDown)
            {
                if(isFlying)
                {
                    this.doFly(100);
                }
                else
                {
                    this.doRun(100);
                }
            }
            else
            {
                if(isFlying)
                {
                    this.player.setVelocityX(0);
                } else {
                    this.doIdle();
                }
            }

            // Jumping
            if(this.cursors.up.isDown)
            {
                if(!isFlying)
                {
                    this.doJump(-200);
                }
            }

            // Falling
            if(isFlying)
            {
                this.player.play("jump_down", false);
            }
        }
    }

    initControls()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    initCollectibles()
    {
        this.coinLocations = [
            [24, 211],
            [56, 150],
            [192, 195],
            [381, 179],
            [167, 83],
            [108, 115],
            [298, 67],
            [231, 35],
            [279, 163],
            [463, 115],
            [447, 195],
            [587, 179],
            [549, 147],
            [587, 115],
            [549, 83],
            [632, 120],
            [632, 140],
            [632, 160],
            [632, 180],
            [632, 200],
            [681, 153],
            [757, 83],
            [695, 51],
            [629, 19],
            [760, 19],
            [917, 118],
            [919, 83],
            [935, 195],
            [873, 195],
            [1045, 99],
            [1202, 198],
            [1056, 51],
            [1132, 19],
            [1126, 83],
            [1212, 151],
            [1293, 99],
            [1228, 99],
            [1344, 83],
            [1301, 51],
            [1368, 19],
            [1415, 100],
            [1415, 120],
            [1415, 140],
            [1415, 160],
            [1415, 180],
            [1415, 200],
            [1536, 131],
            [1469, 115],
            [1558, 83],
            [1604, 51],
            [1546, 19],
            [1655, 135],
            [1590, 211],
            [1672, 195],
            [1783, 163],
            [1738, 131],
            [1785, 99],
            [1835, 83],
            [1903, 83],
            [1800, 19],
            [1876, 19],
            [2010, 19],
            [1954, 151],
            [2013, 151],
            [2081, 195],
            [2110, 135],
            [2207, 199],
            [2217, 99],
            [2272, 83]
        ];

        this.coins = this.physics.add.group({
            allowGravity: false
        });

        this.coinLocations.forEach(location => {
            const gameObject = this.physics.add.sprite(location[0], location[1], "game_coin");

            gameObject.anims.create({
                key: "coin_idle",
                frames: this.anims.generateFrameNames("game_coin", { prefix: "idle_", end: 5 }),
                frameRate: 10,
                repeat: -1
            });

            gameObject.anims.create({
                key: "coin_pickup",
                frames: this.anims.generateFrameNames("game_coin", { prefix: "pickup_", end: 5 }),
                frameRate: 10,
                repeat: -1
            });

            this.coins.add(gameObject, true);
        });

        this.coins.playAnimation("coin_idle");
    }

    setSpeed(vel)
    {
        this.player.body.setVelocityX(vel);
        this.player.setFlipX(vel !== 0 ? vel < 0 : this.player.flipX);
    }

    doRun(vel)
    {
        this.setSpeed(vel);
        this.player.play("run", true);
    }

    doFly(vel)
    {
        this.setSpeed(vel);
        this.player.play("jump_down", true);
    }

    doJump(vel)
    {
        this.player.play("jump_before_or_after", true);
        this.player.body.setVelocityY(vel);
        this.player.play("jump_up", true);
    }

    doIdle()
    {
        this.setSpeed(0);
        this.player.play("idle", true);
    }

}
