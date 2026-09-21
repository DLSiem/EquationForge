/* global Office, Word, document */

import { buildEquationOoxml } from "./equationEngine";

Office.onReady((info) => {
    if (info.host !== Office.HostType.Word) {
        return;
    }

    setupEditor();
});

function setupEditor(): void {
    const equationInput =
        document.getElementById("equation-input") as HTMLTextAreaElement;

    const equationPreview =
        document.getElementById("equation-preview") as HTMLDivElement;

    const fontSelect =
        document.getElementById("font-select") as HTMLSelectElement;

    const fontSize =
        document.getElementById("font-size") as HTMLSelectElement;

    const insertButton =
        document.getElementById("insert-equation") as HTMLButtonElement;
    const fractionButton =
    document.getElementById("fraction-button") as HTMLButtonElement;

    const radicalButton =
    document.getElementById("radical-button") as HTMLButtonElement;

    const statusMessage =
        document.getElementById("status-message") as HTMLParagraphElement;

    updatePreview();

    equationInput.addEventListener("input", updatePreview);
    fontSelect.addEventListener("change", updatePreview);
    fontSize.addEventListener("change", updatePreview);

    insertButton.addEventListener("click", insertEquation);
    fractionButton.addEventListener(
    "click",
    insertFractionTemplate
);
radicalButton.addEventListener(
    "click",
    insertRadicalTemplate
);
  function insertRadicalTemplate(): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    const selectedText = equationInput.value.slice(
        start,
        end
    );

    const replacement = selectedText
        ? `\\sqrt{${selectedText}}`
        : "\\sqrt{}";

    equationInput.setRangeText(
        replacement,
        start,
        end,
        "end"
    );

    updatePreview();
    equationInput.focus();
}

   

    function insertFractionTemplate(): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    const selectedText = equationInput.value.slice(
        start,
        end
    );

    const replacement = selectedText
        ? `\\frac{${selectedText}}{}`
        : "\\frac{}{}";

    equationInput.setRangeText(
        replacement,
        start,
        end,
        "end"
    );

    updatePreview();
    equationInput.focus();
}

    function updatePreview(): void {
        equationPreview.textContent =
            equationInput.value || "Equation preview";

        equationPreview.style.fontFamily = fontSelect.value;
        equationPreview.style.fontSize = `${fontSize.value}px`;
    }

    async function insertEquation(): Promise<void> {
        const equation = equationInput.value.trim();

        if (!equation) {
            statusMessage.textContent = "Please enter an equation.";
            return;
        }

        statusMessage.textContent = "Inserting...";

        try {
            const ooxml = buildEquationOoxml(
                equation,
                fontSelect.value,
                Number(fontSize.value)
            );

            await Word.run(async (context) => {
                const selection = context.document.getSelection();

                selection.insertOoxml(
                    ooxml,
                    Word.InsertLocation.replace
                );

                await context.sync();
            });

            statusMessage.textContent = "Equation inserted.";
        } catch (error) {
            console.error(error);

            statusMessage.textContent =
                "Could not insert the equation.";
        }
    }
}
