const diceThemes = {
    regular: {
        background: "#202020",
        foreground: "#ffffff",
        texture: "none",
        material: "glass"
    },
    hunger: {
        background: "#D00000",
        foreground: "#ffffff",
        texture: "none",
        material: "glass"
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
