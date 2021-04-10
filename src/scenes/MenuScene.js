import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene
{
	constructor()
	{
		super("menuScene");
	}

	preload()
    {
        this.initControls();
        this.initAssets();
    }

    update()
    {
        if(this.cursors.space.isDown)
        {
            this.startGame();
        }
    }

    create()
    {
        this.add.image(0, 0, "background_full")
            .setOrigin(0);

        const playButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2, "hud_controls", "play")
            .setScale(2.5)
            .setInteractive();

        playButton.on("pointerup", () =>
        {
            this.startGame();
        });
    }

    startGame()
    {
        if(this.scene.isPaused("gameScene"))
        { 
            this.scene.pause();
            this.scene.resume("gameScene");
            this.scene.resume("hudScene");
            this.scene.sendToBack("gameScene");
            this.scene.sendToBack();
        }
        else
        {
            this.scene.start("gameScene");
        }
    }

    initAssets()
    {
        // Hud graphics
        this.load.atlas("hud_controls", "assets/hud/controls/controls.png", "assets/hud/controls/controls.json");

        this.load.image("background_full", "assets/background/full.png");
    }

    initControls()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
    }
}
