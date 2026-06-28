import {diceTypeList, DicesBox} from "./dice.js"

document.addEventListener("DOMContentLoaded", async () => {
    const box = new DicesBox("#dice-box", (hunger, regular) => {
        console.log(hunger);
        console.log(regular);
    });
    await box.initialize();
    // box.roll(5, 5, [
    //     diceTypeList.BestialFailure, 
    //     diceTypeList.Failure,
    //     diceTypeList.Success,
    //     diceTypeList.MessyCritical
    // ], 
    // [
    //     diceTypeList.Failure,
    //     diceTypeList.Success,
    //     diceTypeList.Critical
    // ]);
    await box.newRoll();
    await box.newRoll();
    await box.reroll();
})
