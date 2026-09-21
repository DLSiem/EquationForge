/* global Office, Word, document */
import { parseEquation } from "./equationParser";
import { OmmlRenderer } from "./ommlRenderer";

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

    const matrixButton =
    document.getElementById(
        "matrix-button"
    ) as HTMLButtonElement;

    const statusMessage =
        document.getElementById("status-message") as HTMLParagraphElement;
        
        updatePreview();    
        
            const alphaButton =
            document.getElementById("alpha-button") as HTMLButtonElement;
        
        const betaButton =
            document.getElementById("beta-button") as HTMLButtonElement;
        
        const thetaButton =
            document.getElementById("theta-button") as HTMLButtonElement;
        
        const piButton =
            document.getElementById("pi-button") as HTMLButtonElement;
        
        const infinityButton =
            document.getElementById("infinity-button") as HTMLButtonElement;
        
        const pmButton =
            document.getElementById("pm-button") as HTMLButtonElement;
        
        const timesButton =
            document.getElementById("times-button") as HTMLButtonElement;
        
        const neqButton =
            document.getElementById("neq-button") as HTMLButtonElement;

        const integralButton =
    document.getElementById("integral-button") as HTMLButtonElement;

const sumButton =
    document.getElementById("sum-button") as HTMLButtonElement;

const productButton =
    document.getElementById("product-button") as HTMLButtonElement;
        
        equationInput.addEventListener("input", updatePreview);
    fontSelect.addEventListener("change", updatePreview);
    fontSize.addEventListener("change", updatePreview);

    insertButton.addEventListener("click", insertEquation);
    fractionButton.addEventListener(
    "click",  
    insertFractionTemplate
);   

matrixButton.addEventListener(
    "click",
    insertMatrixTemplate
);

radicalButton.addEventListener(
    "click",
    insertRadicalTemplate
);    

alphaButton.addEventListener(
    "click",
    () => insertAtCursor("\\alpha")
);

betaButton.addEventListener(
    "click",
    () => insertAtCursor("\\beta")
);

thetaButton.addEventListener(
    "click",
    () => insertAtCursor("\\theta")
);

piButton.addEventListener(
    "click",
    () => insertAtCursor("\\pi")
);

infinityButton.addEventListener(
    "click",
    () => insertAtCursor("\\infty")
);

pmButton.addEventListener(
    "click",
    () => insertAtCursor("\\pm")
);

timesButton.addEventListener(
    "click",
    () => insertAtCursor("\\times")
);

neqButton.addEventListener(
    "click",
    () => insertAtCursor("\\neq")
);

integralButton.addEventListener(
    "click",
    () => insertAtCursor("\\int_{}^{} ")
);

sumButton.addEventListener(
    "click",
    () => insertAtCursor("\\sum_{}^{} ")
);

productButton.addEventListener(
    "click",
    () => insertAtCursor("\\prod_{}^{} ")
);

function insertMatrixTemplate(): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    const matrixTemplate =
        "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}";

    equationInput.setRangeText(
        matrixTemplate,
        start,
        end,
        "end"
    );

    updatePreview();
    equationInput.focus();
}


function insertAtCursor(text: string): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    equationInput.setRangeText(
        text,
        start,
        end,
        "end"
    );

    updatePreview();
    equationInput.focus();
}
    


    
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
            

            const equationTree =
    parseEquation(equation);

const renderer =
    new OmmlRenderer({
        fontName: fontSelect.value,
        fontSize: Number(
            fontSize.value
        )
    });

const ooxml = renderer.renderDocumentOoxml(
        equationTree
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
    console.error("Equation insertion failed:", error);

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    statusMessage.textContent =
        `Insert failed: ${message}`;
}
    }
}
