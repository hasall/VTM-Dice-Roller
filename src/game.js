import {DiceTypeList, DicesBox} from "./dice.js"

document.addEventListener("DOMContentLoaded", async () => {
    const box = new DicesBox("#dice-box", (hunger, regular) => {
        console.log(hunger);
        console.log(regular);
    });
    await box.initialize();

    await box.roll(2, 5, 
        [DiceTypeList.BestialFailure, DiceTypeList.MessyCritical], 
        [DiceTypeList.Failure, DiceTypeList.Critical, DiceTypeList.Success]
    ).then(results => {console.log(results)});
    await box.reroll([1, 2]).then(results => {console.log(results)});
})
