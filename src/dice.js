import './style.css'
import DiceBox from '@3d-dice/dice-box-threejs'
import { diceThemes } from "./theme.js"

// Dice Type

/**
 * @typedef {DiceType: string}
 */

/**
 * @type {{
 *      BestialFailure: DiceType
 *      Failure: DiceType
 *      Success: DiceType
 *      MessyCritical: DiceType
 *      Critical: DiceType
 * }}
 */
const diceTypeList = {
    BestialFailure: "BestialFailure", // 1 on hunger
    Failure: "Failure", // 2-5 on hunger or 1-5 on regular
    Success: "Success", // 6-9
    MessyCritical: "MessyCritical", // 10 on hunger
    Critical: "Critical" // 10 on regular
}

/**
 * 
 * @param {DiceType} diceType 
 * @returns {number}
 */
function diceTypeToNumber(diceType) {
    switch (diceType) {
        case diceTypeList.BestialFailure: return 1;
        case diceTypeList.Failure: return 2;
        case diceTypeList.Success: return 6;
        case diceTypeList.MessyCritical: return 10;
        case diceTypeList.Critical: return 10;
    }
}

/**
 * 
 * @param {number} value 
 * @returns {DiceType}
 */
function numberToHungerDice(value) {
    switch (value) {
        case 1: return diceTypeList.BestialFailure;
        case 2: return diceTypeList.Failure;
        case 3: return diceTypeList.Failure;
        case 4: return diceTypeList.Failure;
        case 5: return diceTypeList.Failure;
        case 6: return diceTypeList.Success;
        case 7: return diceTypeList.Success;
        case 8: return diceTypeList.Success;
        case 9: return diceTypeList.Success;
        case 10: return diceTypeList.MessyCritical;
    }
}

/**
 * 
 * @param {number} value 
 * @returns {DiceType}
 */
function numberToRegularDice(value) {
    switch (value) {
        case 1: return diceTypeList.Failure;
        case 2: return diceTypeList.Failure;
        case 3: return diceTypeList.Failure;
        case 4: return diceTypeList.Failure;
        case 5: return diceTypeList.Failure;
        case 6: return diceTypeList.Success;
        case 7: return diceTypeList.Success;
        case 8: return diceTypeList.Success;
        case 9: return diceTypeList.Success;
        case 10: return diceTypeList.Critical;
    }
}

/** @type {Array<string>} */
let hungerDiceLastResult = [];
/** @type {Array<string>} */
let regularDiceLastResult = [];
/** @type {((hunger: Array<string>, regular: Array<string>) => undefined) | null} */
let diceCompleteCB = null;

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

async function createHungerD10(box) {
    const images = await Promise.all([
        "/assets/dice/faces/Dice_Hunger_BestialFailure.png",
        "/assets/dice/faces/Dice_Hunger_Failure.png",
        "/assets/dice/faces/Dice_Hunger_Failure.png",
        "/assets/dice/faces/Dice_Hunger_Failure.png",
        "/assets/dice/faces/Dice_Hunger_Failure.png",
        "/assets/dice/faces/Dice_Hunger_Success.png",
        "/assets/dice/faces/Dice_Hunger_Success.png",
        "/assets/dice/faces/Dice_Hunger_Success.png",
        "/assets/dice/faces/Dice_Hunger_Success.png",
        "/assets/dice/faces/Dice_Hunger_MessyCritical.png"
    ].map(loadImage));

    const original = box.DiceFactory.get("d10");

    const custom = Object.create(Object.getPrototypeOf(original));

    Object.assign(custom, original, {
        name: "Custom Icon D10",
        type: "dhunger10",
        shape: "d10",
        labels: [],
        values: [...original.values],
        normals: [...original.normals],
        valueMap: [...original.valueMap]
    });

    custom.registerFaces(images);

    box.DiceFactory.constructor.dice.dhunger10 = custom;
    box.DiceFactory.materials_cache = {};
}
async function createRegularD10(box) {
    const images = await Promise.all([
        "/assets/dice/faces/Dice_Regular_Failure.png",
        "/assets/dice/faces/Dice_Regular_Failure.png",
        "/assets/dice/faces/Dice_Regular_Failure.png",
        "/assets/dice/faces/Dice_Regular_Failure.png",
        "/assets/dice/faces/Dice_Regular_Failure.png",
        "/assets/dice/faces/Dice_Regular_Success.png",
        "/assets/dice/faces/Dice_Regular_Success.png",
        "/assets/dice/faces/Dice_Regular_Success.png",
        "/assets/dice/faces/Dice_Regular_Success.png",
        "/assets/dice/faces/Dice_Regular_Critical.png"
    ].map(loadImage));

    const original = box.DiceFactory.get("d10");

    const custom = Object.create(Object.getPrototypeOf(original));

    Object.assign(custom, original, {
        name: "Custom Icon D10",
        type: "dregular10",
        shape: "d10",
        labels: [],
        values: [...original.values],
        normals: [...original.normals],
        valueMap: [...original.valueMap]
    });

    custom.registerFaces(images);

    box.DiceFactory.constructor.dice.dregular10 = custom;
    box.DiceFactory.materials_cache = {};
}

class DicesBox {
    /**
     * @param {string} tag 
     * @param {(hunger: Array<DiceType>, regular: Array<DiceType>) => undefined} cb 
     */
    constructor(tag, cb) {
        this._diceCompleteCB = cb;
        this._Box = new DiceBox(tag, {
            ...diceThemes.DiceBox,
            onRollComplete: (results) => {
                // console.log(`I've got results :>> `, results);
            },
            onAddDiceComplete: () => {
                let res = Box.getDiceResults();
                console.log(`I've got results after add :>> `, res);

                hungerDiceLastResult = [];
                if (res.sets.length > 1) {
                    hungerDiceLastResult = res.sets[1].rolls.map((value) =>
                        numberToHungerDice(value.value));
                }
                regularDiceLastResult = res.sets[0].rolls.map((value) =>
                    numberToRegularDice(value.value));

                if (this._diceCompleteCB) this._diceCompleteCB(hungerDiceLastResult, regularDiceLastResult);
            }
        });

    }

    /**
     * initialize
     */
    async initialize() {
        await this._Box.initialize();
        await createHungerD10(this._Box);
        await createRegularD10(this._Box);
    }

    /**
     * roll hunger + regular dices
     * @param {number} hunger 
     * @param {number} regular
     * @param {Array<DiceType>} listOfHungerValues
     * @param {Array<DiceType>} listOfRegularValues
     */
    async roll(hunger, regular, listOfHungerValues = [], listOfRegularValues = []) {
        await this._Box.clearDice();

        if (regular > 0) {
            await this._Box.updateConfig({
                theme_customColorset: diceThemes.regular
            });

            await this._Box.add(`${regular}dregular10@${listOfRegularValues.map(value => diceTypeToNumber(value)).join(",")}`);
        }

        if (hunger > 0) {
            await this._Box.updateConfig({
                theme_customColorset: diceThemes.hunger
            });

            await this._Box.add(`${hunger}dhunger10@${listOfHungerValues.map(value => diceTypeToNumber(value)).join(",")}`);
        }
    }

    async reroll() {
        console.log("reroll");
        this._Box.reroll([1, 2, 3]).then(() => {
            console.log("reroll");
            console.log("Total size: ", this._Box.diceList)
            let i = this._Box.getDiceResults(0);
            console.log(`result: `, i);
            i = this._Box.getDiceResults(1);
            console.log(`result: `, i);
            i = this._Box.getDiceResults(2);
            console.log(`result: `, i);
            i = this._Box.getDiceResults(3);
            console.log(`result: `, i);
        }).catch(() => {
            console.log("reroll catch")
        });
    }

    async newRoll() {
        return new Promise(async (resolve, reject) => {
            this._Box.clearDice();
            let diceLength = 0;
            let n;

            const cb = () => {
                console.log("Total size: ", this._Box.diceList)
                let i = this._Box.getDiceResults(0);
                console.log(`result: `, i);
                i = this._Box.getDiceResults(1);
                console.log(`result: `, i);
                i = this._Box.getDiceResults(2);
                console.log(`result: `, i);
                i = this._Box.getDiceResults(3);
                console.log(`result: `, i);

                resolve();
            }

            await this._Box.updateConfig({
                theme_customColorset: diceThemes.hunger
            });

            const notationVectors1 = this._Box.startClickThrow("2dhunger10@1,9");
            for (let t = 0, n = notationVectors1.vectors.length; t < n; ++t)
                this._Box.spawnDice(notationVectors1.vectors[t]);
            diceLength = this._Box.diceList.length;

            await this._Box.updateConfig({
                theme_customColorset: diceThemes.regular
            });

            const notationVectors2 = this._Box.startClickThrow("2dregular10@1,10");
            for (let t = 0, n = notationVectors2.vectors.length; t < n; ++t)
                this._Box.spawnDice(notationVectors2.vectors[t]);


            this._Box.simulateThrow(); this._Box.steps = 0; this._Box.iteration = 0;

            for (let t = 0, n = diceLength; t < n; ++t)
                !this._Box.diceList[t] || this._Box.spawnDice(notationVectors1.vectors[t], this._Box.diceList[t]);

            if (notationVectors1.result && notationVectors1.result.length > 0)
                for (let s = 0; s < notationVectors1.result.length; s++) {
                    let r = this._Box.diceList[s];
                    !r || r.getLastValue().value != notationVectors1.result[s] && this._Box.swapDiceFace(r, notationVectors1.result[s]);
                }


            for (let t = 0, n = this._Box.diceList.length - diceLength; t < n; ++t)
                !this._Box.diceList[t] || this._Box.spawnDice(notationVectors2.vectors[t], this._Box.diceList[t + diceLength]);


            if (notationVectors2.result && notationVectors2.result.length > 0)
                for (let s = 0; s < notationVectors2.result.length; s++) {
                    let r = this._Box.diceList[s + diceLength];
                    !r || r.getLastValue().value != notationVectors2.result[s] && this._Box.swapDiceFace(r, notationVectors2.result[s]);
                }

            this._Box.rolling = !0, this._Box.running = Date.now(), this._Box.last_time = 0, this._Box.animateThrow(this._Box.running, cb);

        });
    }
}

export {
    diceTypeList,
    DicesBox
}
