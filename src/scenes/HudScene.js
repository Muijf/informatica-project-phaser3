import Phaser from "phaser";

export default class HudScene extends Phaser.Scene
{
	constructor()
	{
		super("hudScene");
	}

	preload()
    {
        this.load.atlas("hud_heart", "assets/hud/heart/heart.png", "assets/hud/heart/heart.json");
        this.load.atlas("hud_controls", "assets/hud/controls/controls.png", "assets/hud/controls/controls.json");
    }

    create()
    {
        this.initGraphics();

        this.time.addEvent({
            delay: 100,
            callback: this.delayDone,
            callbackScope: this,
            loop: false
        });
    }
 
    update()
    {
        
    }

    initGraphics()
    {
        // Hearts
        const hearts = [];

        let heartX = 4;

        for(let i = 0; i < 5; ++i)
        {
            const fullHeart = this.add.sprite(heartX, 4, "hud_heart", "full")
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(1);

            fullHeart.anims.create({
                key: "lost",
                frames: this.anims.generateFrameNames("hud_heart", { prefix: "lost_", start: 0, end: 4 }),
                frameRate: 10
            });

            this.add.sprite(heartX, 4, "hud_heart", "empty")
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(0);

                heartX += (fullHeart.width + 4);

            hearts.push(fullHeart);
        }

        this.hearts = hearts;

        // Controls
        const pauseButton = this.add.sprite(this.scale.width - 4, 4, "hud_controls", "pause")
            .setOrigin(1, 0)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(1);

        pauseButton.on("pointerup", () =>
        {
            if(!this.scene.isPaused("gameScene"))
            {
                this.scene.pause("gameScene");
                this.scene.pause();
                this.scene.launch("menuScene");
                this.scene.sendToBack("gameScene");
                this.scene.sendToBack();
            }
        });

        // Coins 
        this.coinCountText = this.coinCountText = this.add.text(4, 24, "", { fontSize: "16px", fontFamily: "m6x11" })
            .setScrollFactor(0)
            .setOrigin(0);;
    }

    delayDone()
    {
        // Can't be done else
        /** @ts-ignore */
        this.coinCountText.setText("Coins: 0/" + this.scene.get("gameScene").coinLocations.length);
    }

    getHearts()
    {
        return this.hearts;
    }

    getCoinCountText()
    {
        return this.coinCountText;
    }
}