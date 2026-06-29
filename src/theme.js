const diceThemes = {
    standard: {
        // background: "#c4c427",
        foreground: "#ffffff",
        texture: "none",
        material: "metal"
    },
    regular: {
        background: "#202020",
        foreground: "#ffffff",
        texture: "none",
        material: "metal"
    },
    hunger: {
        background: "#FF0000",
        foreground: "#ffffff",
        texture: "none",
        material: "metal"
    },
    DiceBox: {
        assetPath: `${import.meta.env.BASE_URL}assets/dice/`,
        light_intensity: 1,
        gravity_multiplier: 600,
        baseScale: 100,
        strength: 3,
    }
};

export {
    // boardTheme,
    diceThemes
};
