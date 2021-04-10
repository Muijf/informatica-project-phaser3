import Phaser from "phaser";

import SoundFadePlugin from "phaser3-rex-plugins/plugins/soundfade-plugin.js";

import GameScene from "./scenes/GameScene";
import HudScene from "./scenes/HudScene";
import MenuScene from "./scenes/MenuScene";

const config = {
	type: Phaser.AUTO,
	audio: {
		disableWebAudio: true
	},
	plugins: {
		global: [{
			key: "rexSoundFade",
			plugin: SoundFadePlugin,
			start: true
		}]
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 240,
        height: 160
	},
	pixelArt: true,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 500 },
			debug: false
		}
	},
	scene: [MenuScene, GameScene, HudScene]
};

export default new Phaser.Game(config);
