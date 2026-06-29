class DiceThemes {
    get standard() {
        return {
            background: [
                '#f8d84f',
                '#f9b02d',
                '#f43c04',
                '#910200',
                '#4c1009',
                "#00ffcb",
                "#ff6600",
                "#1d66af",
                "#7028ed",
                "#c4c427",
                "#d81128"
            ],
            foreground: "#ffffff",
            texture: "none",
            material: "metal"
        }
    }
    get regular() {
        return {
            background: "#202020",
            foreground: "#ffffff",
            texture: "none",
            material: "metal"
        }
    }
    get hunger() {
        return {
            background: "#FF0000",
            foreground: "#ffffff",
            texture: "none",
            material: "metal" // metal | glass | plastic | wood
        }
    }
    get DiceBox() {
        return {
            assetPath: `${import.meta.env.BASE_URL}assets/dice/`,
            light_intensity: 1.5,
            gravity_multiplier: 600,
            baseScale: 100,
            strength: 3,

            // framerate: (1/60),
            sounds: true,
            volume: 100,
            // color_spotlight: 0xefdfd5,
            shadows: true,
            // theme_surface:  "green-felt",
            // sound_dieMaterial: 'plastic',
            // theme_customColorset: null,
            // theme_colorset: "white", // see available colorsets in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/colorsets.js
            // theme_texture: "", // see available textures in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/texturelist.js
            // theme_material: "glass", // "none" | "metal" | "wood" | "glass" | "plastic"
        }
    }
};

const diceThemes = new DiceThemes();

export {
    diceThemes
};
