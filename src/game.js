import { DiceTypeList, DicesBox } from "./dice.js"

function assetPath(path) {
    return `${import.meta.env.BASE_URL}${path}`;
}

const diceLabels = {
    [DiceTypeList.BestialFailure]: "bestial failure",
    [DiceTypeList.Failure]: "failure",
    [DiceTypeList.Success]: "success",
    [DiceTypeList.MessyCritical]: "messy critical",
    [DiceTypeList.Critical]: "critical"
};

const resultFacePaths = {
    hunger: {
        [DiceTypeList.BestialFailure]: assetPath("assets/dice/result_faces/Dice_Hunger_BestialFailure.png"),
        [DiceTypeList.Failure]: assetPath("assets/dice/result_faces/Dice_Hunger_Failure.png"),
        [DiceTypeList.Success]: assetPath("assets/dice/result_faces/Dice_Hunger_Success.png"),
        [DiceTypeList.MessyCritical]: assetPath("assets/dice/result_faces/Dice_Hunger_MessyCritical.png")
    },
    regular: {
        [DiceTypeList.Failure]: assetPath("assets/dice/result_faces/Dice_Regular_Failure.png"),
        [DiceTypeList.Success]: assetPath("assets/dice/result_faces/Dice_Regular_Success.png"),
        [DiceTypeList.Critical]: assetPath("assets/dice/result_faces/Dice_Regular_Critical.png")
    }
};

const successTypes = new Set([
    DiceTypeList.Success
]);

const criticalTypes = new Set([
    DiceTypeList.MessyCritical,
    DiceTypeList.Critical
])

function clampDiceCount(value, min, max) {
    const count = Number.parseInt(value, 10);
    if (Number.isNaN(count)) return min;
    return Math.min(Math.max(count, min), max);
}

const standardNotationPattern = /^\s*(?:\d*)d(?:4|6|8|10|12|20|100)(?:\s*[+-]\s*(?:(?:\d*)d(?:4|6|8|10|12|20|100)|\d+))*\s*$/i;

function normalizeStandardNotation(value) {
    return value.replace(/\s+/g, "").toLowerCase();
}

function countNotationDice(notation) {
    return [...notation.matchAll(/(\d*)d(?:4|6|8|10|12|20|100)/gi)]
        .reduce((total, match) => total + (match[1] === "" ? 1 : Number.parseInt(match[1], 10)), 0);
}

function isValidStandardNotation(notation) {
    return standardNotationPattern.test(notation) && countNotationDice(notation) <= 30;
}

function countSuccesses(results) {
    const allResults = [...results.regular, ...results.hunger];
    const successes = allResults.filter((result) => successTypes.has(result)).length;
    const criticals = allResults.filter((result) => criticalTypes.has(result)).length;

    return successes + criticals + Math.floor(criticals / 2) * 2;
}

function getOutcome(results, difficulty) {
    const successes = countSuccesses(results);
    const isPassed = successes >= difficulty;
    const hasHungerCritical = results.hunger.includes(DiceTypeList.MessyCritical);
    const criticals = [...results.regular, ...results.hunger]
        .filter((result) => criticalTypes.has(result))
        .length;

    if (!isPassed && results.hunger.includes(DiceTypeList.BestialFailure)) {
        return "Bestial Failure";
    }

    if (!isPassed) {
        return "Failed";
    }

    if (hasHungerCritical && criticals >= 2) {
        return "Messy Critical";
    }

    return "Passed";
}

function getOutcomeRange(results) {
    return `${getOutcome(results, 9)} / ${getOutcome(results, 1)}`;
}

function setResultMessage(resultFaces, message) {
    resultFaces.textContent = message;
    resultFaces.classList.add("result-faces--message");
}

function setRerollButtonState(rerollButton, selectedDiceIndexes) {
    rerollButton.disabled = selectedDiceIndexes.size === 0;
    rerollButton.textContent = selectedDiceIndexes.size > 0
        ? `Reroll selected dice (${selectedDiceIndexes.size})`
        : "Reroll selected dice";
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

function renderResult(results, successCount, rollOutcome, resultFaces, selectedDiceIndexes, rerollButton) {
    successCount.value = countSuccesses(results);
    rollOutcome.value = getOutcomeRange(results);
    selectedDiceIndexes.clear();
    setRerollButtonState(rerollButton, selectedDiceIndexes);
    resultFaces.replaceChildren();
    resultFaces.classList.remove("result-faces--message");

    results.dice.forEach((die) =>
        appendResultFace(resultFaces, die, selectedDiceIndexes, rerollButton)
    );
}

function renderStandardResult(results, standardResult) {
    const rollText = results.rolls
        .map((roll) => `${roll.type}: ${roll.value}`)
        .join(", ");

    standardResult.textContent = [
        `Notation: ${results.notation}`,
        `Total: ${results.total}`,
        `Rolls: ${rollText}`
    ].join("\n");
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#roll-panel");
    const vtmTab = document.querySelector("#vtm-tab");
    const standardTab = document.querySelector("#standard-tab");
    const vtmPanel = document.querySelector("#vtm-panel");
    const standardPanel = document.querySelector("#standard-panel");
    const regularInput = document.querySelector("#regular-dice");
    const hungerInput = document.querySelector("#hunger-dice");
    const standardNotationInput = document.querySelector("#standard-notation");
    const rollButton = document.querySelector("#roll-button");
    const standardRollButton = document.querySelector("#standard-roll-button");
    const rerollButton = document.querySelector("#reroll-button");
    const helpButton = document.querySelector("#help-button");
    const helpOverlay = document.querySelector("#help-overlay");
    const helpCloseButton = document.querySelector("#help-close-button");
    const successCount = document.querySelector("#success-count");
    const rollOutcome = document.querySelector("#roll-outcome");
    const resultFaces = document.querySelector("#result-faces");
    const standardResult = document.querySelector("#standard-result");

    const box = new DicesBox("#dice-box");
    const selectedDiceIndexes = new Set();
    let isRolling = false;

    function setRollingState(isActive) {
        isRolling = isActive;
        rollButton.disabled = isActive;
        standardRollButton.disabled = isActive;
        rerollButton.disabled = isActive || selectedDiceIndexes.size === 0;
    }

    setResultMessage(resultFaces, "Loading dice...");
    rollButton.disabled = true;
    standardRollButton.disabled = true;
    rerollButton.disabled = true;

    await box.initialize();

    setResultMessage(resultFaces, "Choose dice and roll.");
    rollButton.disabled = false;
    standardRollButton.disabled = false;

    function activateTab(tabName) {
        const isVtm = tabName === "vtm";

        vtmTab.classList.toggle("roll-tab--active", isVtm);
        standardTab.classList.toggle("roll-tab--active", !isVtm);
        vtmTab.setAttribute("aria-selected", String(isVtm));
        standardTab.setAttribute("aria-selected", String(!isVtm));
        vtmPanel.hidden = !isVtm;
        standardPanel.hidden = isVtm;
    }

    vtmTab.addEventListener("click", () => activateTab("vtm"));
    standardTab.addEventListener("click", () => activateTab("standard"));

    function closeHelp() {
        helpOverlay.classList.remove("help-overlay--open");
        helpOverlay.setAttribute("aria-hidden", "true");
    }

    helpButton.addEventListener("click", () => {
        helpOverlay.classList.add("help-overlay--open");
        helpOverlay.setAttribute("aria-hidden", "false");
    });

    helpCloseButton.addEventListener("click", closeHelp);

    helpOverlay.addEventListener("click", (event) => {
        if (event.target === helpOverlay) closeHelp();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeHelp();
    });

    async function rollVtm() {
        if (isRolling) return;

        const regular = clampDiceCount(regularInput.value, 0, 30);
        const hunger = clampDiceCount(hungerInput.value, 0, 5);

        regularInput.value = regular;
        hungerInput.value = hunger;

        if (regular + hunger === 0) {
            successCount.value = 0;
            rollOutcome.value = "-";
            selectedDiceIndexes.clear();
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            setResultMessage(resultFaces, "Add at least one die.");
            return;
        }

        setRollingState(true);
        setResultMessage(resultFaces, "Rolling...");

        try {
            const results = await box.roll(hunger, regular);
            renderResult(results, successCount, rollOutcome, resultFaces, selectedDiceIndexes, rerollButton);
        } catch (error) {
            console.error(error);
            successCount.value = 0;
            rollOutcome.value = "-";
            selectedDiceIndexes.clear();
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            setResultMessage(resultFaces, "Could not roll dice.");
        } finally {
            setRollingState(false);
        }
    }

    async function rollStandard() {
        if (isRolling) return;

        const notation = normalizeStandardNotation(standardNotationInput.value);

        standardNotationInput.value = notation;

        if (!isValidStandardNotation(notation)) {
            standardResult.textContent = "Use notation like 1d10+1d20. Up to 30 dice.";
            return;
        }

        setRollingState(true);
        standardResult.textContent = "Rolling...";

        try {
            const results = await box.rollStandard(notation);
            selectedDiceIndexes.clear();
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            renderStandardResult(results, standardResult);
        } catch (error) {
            console.error(error);
            standardResult.textContent = "Could not roll standard dice.";
        } finally {
            setRollingState(false);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (standardPanel.hidden) {
            await rollVtm();
        } else {
            await rollStandard();
        }
    });

    standardRollButton.addEventListener("click", rollStandard);

    standardNotationInput.addEventListener("keydown", async (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        await rollStandard();
    });

    rerollButton.addEventListener("click", async () => {
        if (isRolling || selectedDiceIndexes.size === 0) return;

        const diceIndexes = [...selectedDiceIndexes].sort((a, b) => a - b);

        setRollingState(true);

        try {
            const results = await box.reroll(diceIndexes);
            renderResult(results, successCount, rollOutcome, resultFaces, selectedDiceIndexes, rerollButton);
        } catch (error) {
            console.error(error);
            setRerollButtonState(rerollButton, selectedDiceIndexes);
            resultFaces.classList.add("result-faces--message");
            resultFaces.textContent = "Could not reroll selected dice.";
        } finally {
            setRollingState(false);
        }
    });
})
