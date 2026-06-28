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
const DiceTypeList = {
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
        case DiceTypeList.BestialFailure: return 1;
        case DiceTypeList.Failure: return 2;
        case DiceTypeList.Success: return 6;
        case DiceTypeList.MessyCritical: return 10;
        case DiceTypeList.Critical: return 10;
    }
}

/**
 * 
 * @param {number} value 
 * @returns {DiceType}
 */
function numberToHungerDice(value) {
    switch (value) {
        case 1: return DiceTypeList.BestialFailure;
        case 2: return DiceTypeList.Failure;
        case 3: return DiceTypeList.Failure;
        case 4: return DiceTypeList.Failure;
        case 5: return DiceTypeList.Failure;
        case 6: return DiceTypeList.Success;
        case 7: return DiceTypeList.Success;
        case 8: return DiceTypeList.Success;
        case 9: return DiceTypeList.Success;
        case 10: return DiceTypeList.MessyCritical;
    }
}

/**
 * 
 * @param {number} value 
 * @returns {DiceType}
 */
function numberToRegularDice(value) {
    switch (value) {
        case 1: return DiceTypeList.Failure;
        case 2: return DiceTypeList.Failure;
        case 3: return DiceTypeList.Failure;
        case 4: return DiceTypeList.Failure;
        case 5: return DiceTypeList.Failure;
        case 6: return DiceTypeList.Success;
        case 7: return DiceTypeList.Success;
        case 8: return DiceTypeList.Success;
        case 9: return DiceTypeList.Success;
        case 10: return DiceTypeList.Critical;
    }
}

/** @type {Array<string>} */
let hungerDiceLastResult = [];
/** @type {Array<string>} */
let regularDiceLastResult = [];
/** @type {((hunger: Array<string>, regular: Array<string>) => undefined) | null} */
let diceCompleteCB = null;

function readDiceResults(diceList) {
    return diceList.reduce((results, dice, index) => {
        const value = dice.result.at(-1).value;
        const type = dice.notation.type === "dhunger10" ? "hunger" : "regular";
        const result = type === "hunger"
            ? numberToHungerDice(value)
            : numberToRegularDice(value);
        const entry = { index, type, result };

        results.dice.push(entry);

        if (type === "hunger") {
            results.hunger.push(result);
        } else {
            results.regular.push(result);
        }

        return results;
    }, {
        dice: [],
        hunger: [],
        regular: []
    });
}

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
    constructor(tag) {
        this._Box = new DiceBox(tag, {
            ...diceThemes.DiceBox,
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
     * Put array with numbers (0-...) of dices to reroll 
     * @param {Array<number>} listOfNumbers 
     * @returns {Promise<Array<DiceTypeList>>}
     */
    async reroll(listOfNumbers) {
        return new Promise((resolve, reject) => {
            this._Box.last_time = 0;
            this._Box.steps = 0;
            this._Box.iteration = 0;

            this._Box.reroll(listOfNumbers).then(() => {
                resolve(readDiceResults(this._Box.diceList));
            }).catch((e) => {
                console.log("reroll catch", e);
                reject();
            });
        })
    }

    /**
     * roll hunger + regular dices
     * @param {number} hunger 
     * @param {number} regular
     * @param {Array<DiceType>} listOfHungerValues
     * @param {Array<DiceType>} listOfRegularValues
     * @returns {Promise<Array<DiceTypeList>>}
     */
    async roll(hunger, regular, listOfHungerValues = [], listOfRegularValues = []) {
        return new Promise(async (resolve, reject) => {
            this._Box.clearDice();

            if (hunger <= 0 && regular <= 0) {
                resolve({ dice: [], hunger: [], regular: [] });
                return;
            }

            let diceLength = 0;

            const cb = () => {
                resolve(readDiceResults(this._Box.diceList));
            }

            let notationVectors1 = { vectors: [], result: [] };

            if (hunger > 0) {
                await this._Box.updateConfig({
                    theme_customColorset: diceThemes.hunger
                });

                notationVectors1 = this._Box.startClickThrow(`${hunger}dhunger10@${listOfHungerValues.map(value => diceTypeToNumber(value)).join(",")}`);
                for (let t = 0, n = notationVectors1.vectors.length; t < n; ++t)
                    this._Box.spawnDice(notationVectors1.vectors[t]);
                diceLength = this._Box.diceList.length;
            }

            let notationVectors2 = { vectors: [], result: [] };

            if (regular > 0) {
                await this._Box.updateConfig({
                    theme_customColorset: diceThemes.regular
                });

                notationVectors2 = this._Box.startClickThrow(`${regular}dregular10@${listOfRegularValues.map(value => diceTypeToNumber(value)).join(",")}`);
                for (let t = 0, n = notationVectors2.vectors.length; t < n; ++t)
                    this._Box.spawnDice(notationVectors2.vectors[t]);
            }


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
    DiceTypeList,
    DicesBox
}
