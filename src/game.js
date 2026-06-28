import { DiceTypeList, DicesBox } from "./dice.js"

const diceLabels = {
    [DiceTypeList.BestialFailure]: "bestial failure",
    [DiceTypeList.Failure]: "failure",
    [DiceTypeList.Success]: "success",
    [DiceTypeList.MessyCritical]: "messy critical",
    [DiceTypeList.Critical]: "critical"
};

const resultFacePaths = {
    hunger: {
        [DiceTypeList.BestialFailure]: "/assets/dice/result_faces/Dice_Hunger_BestialFailure.png",
        [DiceTypeList.Failure]: "/assets/dice/result_faces/Dice_Hunger_Failure.png",
        [DiceTypeList.Success]: "/assets/dice/result_faces/Dice_Hunger_Success.png",
        [DiceTypeList.MessyCritical]: "/assets/dice/result_faces/Dice_Hunger_MessyCritical.png"
    },
    regular: {
        [DiceTypeList.Failure]: "/assets/dice/result_faces/Dice_Regular_Failure.png",
        [DiceTypeList.Success]: "/assets/dice/result_faces/Dice_Regular_Success.png",
        [DiceTypeList.Critical]: "/assets/dice/result_faces/Dice_Regular_Critical.png"
    }
};

const successTypes = new Set([
    DiceTypeList.Success,
    DiceTypeList.MessyCritical,
    DiceTypeList.Critical
]);

function clampDiceCount(value, min, max) {
    const count = Number.parseInt(value, 10);
    if (Number.isNaN(count)) return min;
    return Math.min(Math.max(count, min), max);
}

function countSuccesses(results) {
    return [...results.regular, ...results.hunger]
        .filter((result) => successTypes.has(result))
        .length;
}

function setResultMessage(resultFaces, message) {
    resultFaces.textContent = message;
    resultFaces.classList.add("result-faces--message");
}

function setRerollButtonState(rerollButton, selectedDiceIndexes) {
    rerollButton.disabled = selectedDiceIndexes.size === 0;
    rerollButton.textContent = selectedDiceIndexes.size > 0
        ? `Reroll selected (${selectedDiceIndexes.size})`
        : "Reroll selected";
}

function appendResultFace(resultFaces, die, selectedDiceIndexes, rerollButton) {
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.type = "button";
    button.className = "result-face-button";
    button.setAttribute("aria-pressed", "false");
    button.title = `Select ${die.type} ${diceLabels[die.result] ?? die.result}`;
    button.dataset.diceIndex = die.index;

    image.src = resultFacePaths[die.type][die.result];
    image.alt = `${die.type} ${diceLabels[die.result] ?? die.result}`;
    image.className = "result-face";

    button.append(image);
    button.addEventListener("click", () => {
        const isSelected = selectedDiceIndexes.has(die.index);

        if (isSelected) {
            selectedDiceIndexes.delete(die.index);
        } else {
            selectedDiceIndexes.add(die.index);
        }

        button.classList.toggle("result-face-button--selected", !isSelected);
        button.setAttribute("aria-pressed", String(!isSelected));
        setRerollButtonState(rerollButton, selectedDiceIndexes);
    });

    resultFaces.append(button);
}

function renderResult(results, successCount, resultFaces, selectedDiceIndexes, rerollButton) {
    successCount.value = countSuccesses(results);
    selectedDiceIndexes.clear();
    setRerollButtonState(rerollButton, selectedDiceIndexes);
    resultFaces.replaceChildren();
    resultFaces.classList.remove("result-faces--message");

    results.dice.forEach((die) =>
        appendResultFace(resultFaces, die, selectedDiceIndexes, rerollButton)
    );
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#roll-panel");
    const regularInput = document.querySelector("#regular-dice");
    const hungerInput = document.querySelector("#hunger-dice");
    const rollButton = document.querySelector("#roll-button");
    const rerollButton = document.querySelector("#reroll-button");
    const successCount = document.querySelector("#success-count");
    const resultFaces = document.querySelector("#result-faces");

    const box = new DicesBox("#dice-box");
    const selectedDiceIndexes = new Set();

    setResultMessage(resultFaces, "Loading dice...");
    rollButton.disabled = true;
    rerollButton.disabled = true;

    await box.initialize();

    setResultMessage(resultFaces, "Choose dice and roll.");
    rollButton.disabled = false;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const regular = clampDiceCount(regularInput.value, 0, 30);
        const hunger = clampDiceCount(hungerInput.value, 0, 5);

        regularInput.value = regular;
        hungerInput.value = hunger;

        if (regular + hunger === 0) {
            successCount.value = 0;
            selectedDiceIndexes.clear();
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            setResultMessage(resultFaces, "Add at least one die.");
            return;
        }

        rollButton.disabled = true;
        rerollButton.disabled = true;
        setResultMessage(resultFaces, "Rolling...");

        try {
            const results = await box.roll(hunger, regular);
            renderResult(results, successCount, resultFaces, selectedDiceIndexes, rerollButton);
        } catch (error) {
            console.error(error);
            successCount.value = 0;
            selectedDiceIndexes.clear();
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            setResultMessage(resultFaces, "Could not roll dice.");
        } finally {
            rollButton.disabled = false;
        }
    });

    rerollButton.addEventListener("click", async () => {
        if (selectedDiceIndexes.size === 0) return;

        const diceIndexes = [...selectedDiceIndexes].sort((a, b) => a - b);

        rollButton.disabled = true;
        rerollButton.disabled = true;

        try {
            const results = await box.reroll(diceIndexes);
            renderResult(results, successCount, resultFaces, selectedDiceIndexes, rerollButton);
        } catch (error) {
            console.error(error);
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            resultFaces.classList.add("result-faces--message");
            resultFaces.textContent = "Could not reroll selected dice.";
        } finally {
            rollButton.disabled = false;
        }
    });
})
