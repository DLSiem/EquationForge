/* global Office, Word, document */
import { parseEquation } from "./equationParser";
import { OmmlRenderer } from "./ommlRenderer";
import { PreviewRenderer } from "./previewRenderer";

Office.onReady((info) => {
  if (info.host !== Office.HostType.Word) {
    return;
  }

  setupEditor();
});

function setupEditor(): void {
  const equationInput = document.getElementById("equation-input") as HTMLTextAreaElement;

  const equationPreview = document.getElementById("equation-preview") as HTMLDivElement;

  const fontSelect = document.getElementById("font-select") as HTMLSelectElement;

  const fontSize = document.getElementById("font-size") as HTMLSelectElement;

  const insertButton = document.getElementById("insert-equation") as HTMLButtonElement;

  const clearButton = document.getElementById("clear-equation") as HTMLButtonElement;

  const newEquationButton = document.getElementById("new-equation") as HTMLButtonElement;

  const fractionButton = document.getElementById("fraction-button") as HTMLButtonElement;

  const radicalButton = document.getElementById("radical-button") as HTMLButtonElement;

  const matrixButton = document.getElementById("matrix-button") as HTMLButtonElement;

  const statusMessage = document.getElementById("status-message") as HTMLParagraphElement;

  const previewRenderer = new PreviewRenderer();

  updatePreview();

  const integralButton = document.getElementById("integral-button") as HTMLButtonElement;

  const sumButton = document.getElementById("sum-button") as HTMLButtonElement;

  const productButton = document.getElementById("product-button") as HTMLButtonElement;

  const editEquationButton = document.getElementById("edit-equation") as HTMLButtonElement;

  const replaceEquationButton = document.getElementById("replace-equation") as HTMLButtonElement;

  const editSelectedButton = document.getElementById("edit-selected") as HTMLButtonElement;

  const toolTabs = document.querySelectorAll(".tool-tab") as NodeListOf<HTMLButtonElement>;

  const toolPanels = document.querySelectorAll(".tool-panel") as NodeListOf<HTMLDivElement>;

  const symbolButtons = document.querySelectorAll("[data-symbol]") as NodeListOf<HTMLButtonElement>;

  symbolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const symbol = button.dataset.symbol;

      if (!symbol) {
        return;
      }

      const suffix = button.dataset.symbolSuffix;

      if (suffix) {
        insertDynamicDelimiter(symbol, suffix);
        return;
      }

      insertAtCursor(symbol);
    });
  });

  toolTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.toolCategory;

      if (!category) {
        return;
      }

      toolTabs.forEach((item) => {
        item.classList.toggle("active", item === tab);
      });

      toolPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.toolPanel === category);
      });
    });
  });

  wireCommandButton("sin-button", "\\sin ");

  wireCommandButton("cos-button", "\\cos ");

  wireCommandButton("tan-button", "\\tan ");

  wireCommandButton("cot-button", "\\cot ");

  wireCommandButton("sec-button", "\\sec ");

  wireCommandButton("csc-button", "\\csc ");

  wireCommandButton("log-button", "\\log ");

  wireCommandButton("ln-button", "\\ln ");

  wireCommandButton("exp-button", "\\exp ");

  wireCommandButton("lim-button", "\\lim_{} ");

  wireCommandButton("max-button", "\\max ");

  wireCommandButton("min-button", "\\min ");

  wireCommandButton("det-button", "\\det ");

  wireCommandButton("gcd-button", "\\gcd ");

  wireCommandButton("lcm-button", "\\lcm ");

  wireTemplateButton("hat-button", "\\hat{}", "\\hat{".length);

  wireTemplateButton("bar-button", "\\bar{}", "\\bar{".length);

  wireTemplateButton("vec-button", "\\vec{}", "\\vec{".length);

  wireTemplateButton("dot-button", "\\dot{}", "\\dot{".length);

  wireTemplateButton("ddot-button", "\\ddot{}", "\\ddot{".length);

  wireTemplateButton("overline-button", "\\overline{}", "\\overline{".length);

  wireTemplateButton("underline-button", "\\underline{}", "\\underline{".length);

  wireTemplateButton("overbrace-button", "\\overbrace{}", "\\overbrace{".length);

  wireTemplateButton("underbrace-button", "\\underbrace{}", "\\underbrace{".length);

  wireTemplateButton("overset-button", "\\overset{}{}", "\\overset{".length);

  wireTemplateButton("underset-button", "\\underset{}{}", "\\underset{".length);

  wireTemplateButton("boxed-button", "\\boxed{}", "\\boxed{".length);

  wireTemplateButton("binomial-button", "\\binom{}{}", "\\binom{".length);

  wireTemplateButton(
    "cases-button",
    "\\begin{cases}\n  & \\\\\n  & \\\\\n\\end{cases}",
    "\\begin{cases}\n  ".length
  );

  wireTemplateButton(
    "aligned-button",
    "\\begin{aligned}\n  & \\\\\n  & \\\\\n\\end{aligned}",
    "\\begin{aligned}\n  ".length
  );

  wireTemplateButton(
    "gathered-button",
    "\\begin{gathered}\n  \\\\\n  \\\\\n\\end{gathered}",
    "\\begin{gathered}\n  ".length
  );

  wireTemplateButton("bold-button", "\\mathbf{}", "\\mathbf{".length);

  wireTemplateButton("roman-button", "\\mathrm{}", "\\mathrm{".length);

  wireTemplateButton("italic-button", "\\mathit{}", "\\mathit{".length);

  wireTemplateButton("text-button", "\\text{}", "\\text{".length);

  wireCommandButton("contour-integral-button", "\\oint_{}^{} ");

  wireCommandButton("bigcup-button", "\\bigcup_{}^{} ");

  wireCommandButton("bigcap-button", "\\bigcap_{}^{} ");

  const symbolsPalette = document.getElementById("symbols-palette") as HTMLDivElement;

  let lastEquationSource: string | null = null;
  let lastEquationControlId: number | null = null;

  editEquationButton.addEventListener("click", editLastEquation);

  replaceEquationButton.addEventListener("click", replaceLastEquation);

  equationInput.addEventListener("input", updatePreview);
  fontSelect.addEventListener("change", updatePreview);
  fontSize.addEventListener("change", updatePreview);

  insertButton.addEventListener("click", insertEquation);
  fractionButton.addEventListener("click", insertFractionTemplate);

  clearButton.addEventListener("click", clearEquation);

  newEquationButton.addEventListener("click", newEquation);

  matrixButton.addEventListener("click", insertMatrixTemplate);

  radicalButton.addEventListener("click", insertRadicalTemplate);

  integralButton.addEventListener("click", () => insertAtCursor("\\int_{}^{} "));

  sumButton.addEventListener("click", () => insertAtCursor("\\sum_{}^{} "));

  productButton.addEventListener("click", () => insertAtCursor("\\prod_{}^{} "));

  equationInput.addEventListener("keydown", handleEditorKeydown);

  editSelectedButton.addEventListener("click", editSelectedEquation);

  function insertDynamicDelimiter(opening: string, closing: string): void {
    const start = equationInput.selectionStart;

    const end = equationInput.selectionEnd;

    const selectedText = equationInput.value.slice(start, end);

    const content = selectedText || "";

    const replacement = `${opening} ${content} ${closing}`;

    equationInput.setRangeText(replacement, start, end, "end");

    if (!selectedText) {
      const cursorPosition = start + opening.length + 1;

      equationInput.selectionStart = cursorPosition;

      equationInput.selectionEnd = cursorPosition;
    }

    updatePreview();

    equationInput.focus();
  }

  function insertTemplate(template: string, cursorOffset: number): void {
    const start = equationInput.selectionStart;

    const end = equationInput.selectionEnd;

    equationInput.setRangeText(template, start, end, "end");

    const cursorPosition = start + cursorOffset;

    equationInput.selectionStart = cursorPosition;

    equationInput.selectionEnd = cursorPosition;

    updatePreview();

    equationInput.focus();
  }

  async function editSelectedEquation(): Promise<void> {
    statusMessage.textContent = "Checking selection...";

    try {
      await Word.run(async (context) => {
        const selection = context.document.getSelection();

        const contentControls = selection.contentControls;

        contentControls.load("items/id,items/tag");

        await context.sync();

        if (contentControls.items.length === 0) {
          statusMessage.textContent = "Please select an EquationForge equation.";

          return;
        }

        const control = contentControls.items[0];

        const tag = control.tag;

        if (!tag.startsWith("EquationForge:")) {
          statusMessage.textContent = "The selected item is not an EquationForge equation.";

          return;
        }

        const source = tag.substring("EquationForge:".length);

        equationInput.value = source;

        lastEquationControlId = control.id;

        lastEquationSource = source;

        updatePreview();

        statusMessage.textContent = "Equation loaded for editing.";

        equationInput.focus();
      });
    } catch (error) {
      console.error("Selected equation could not be loaded:", error);

      const message = error instanceof Error ? error.message : String(error);

      statusMessage.textContent = `Edit failed: ${message}`;
    }
  }

  function handleEditorKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();

      void insertEquation();
    }
  }

  function editLastEquation(): void {
    if (lastEquationSource === null) {
      statusMessage.textContent = "No EquationForge equation to edit.";

      return;
    }

    equationInput.value = lastEquationSource;

    updatePreview();

    statusMessage.textContent = "Editing last equation.";

    equationInput.focus();
  }

  async function replaceLastEquation(): Promise<void> {
    if (lastEquationControlId === null) {
      statusMessage.textContent = "No EquationForge equation to replace.";

      return;
    }

    const equation = equationInput.value.trim();

    if (!equation) {
      statusMessage.textContent = "Please enter an equation.";

      return;
    }

    statusMessage.textContent = "Replacing...";

    try {
      const equationTree = parseEquation(equation);

      const renderer = new OmmlRenderer({
        fontName: fontSelect.value,
        fontSize: Number(fontSize.value),
      });

      const ooxml = renderer.renderDocumentOoxml(equationTree);

      const controlId = lastEquationControlId;

      if (controlId === null) {
        statusMessage.textContent = "No EquationForge equation to replace.";

        return;
      }

      await Word.run(async (context) => {
        const contentControl = context.document.contentControls.getItem(controlId);

        contentControl.insertOoxml(ooxml, Word.InsertLocation.replace);

        contentControl.tag = `EquationForge:${equation}`;

        await context.sync();

        lastEquationSource = equation;
      });

      statusMessage.textContent = "Equation replaced.";
    } catch (error) {
      console.error("Equation replacement failed:", error);

      const message = error instanceof Error ? error.message : String(error);

      statusMessage.textContent = `Replace failed: ${message}`;
    }
  }

  function clearEquation(): void {
    equationInput.value = "";

    updatePreview();

    statusMessage.textContent = "Equation cleared.";

    equationInput.focus();
  }

  function newEquation(): void {
    equationInput.value = "";

    updatePreview();

    statusMessage.textContent = "Ready for a new equation.";

    equationInput.focus();
  }

  function insertMatrixTemplate(): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    const matrixTemplate = "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}";

    equationInput.setRangeText(matrixTemplate, start, end, "end");

    updatePreview();
    equationInput.focus();
  }

  function insertAtCursor(text: string): void {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;

    equationInput.setRangeText(text, start, end, "end");

    updatePreview();
    equationInput.focus();
  }

  function wireCommandButton(buttonId: string, command: string): void {
    const button = document.getElementById(buttonId) as HTMLButtonElement | null;

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      insertAtCursor(command);
    });
  }

  function wireTemplateButton(buttonId: string, template: string, cursorOffset: number): void {
    const button = document.getElementById(buttonId) as HTMLButtonElement | null;

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const start = equationInput.selectionStart;

      const end = equationInput.selectionEnd;

      equationInput.setRangeText(template, start, end, "end");

      const cursorPosition = start + cursorOffset;

      equationInput.selectionStart = cursorPosition;

      equationInput.selectionEnd = cursorPosition;

      updatePreview();

      equationInput.focus();
    });
  }

  function insertRadicalTemplate(): void {
    const start = equationInput.selectionStart;

    const end = equationInput.selectionEnd;

    const selectedText = equationInput.value.slice(start, end);

    if (selectedText) {
      const replacement = `\\sqrt{${selectedText}}`;

      equationInput.setRangeText(replacement, start, end, "end");

      updatePreview();
      equationInput.focus();

      return;
    }

    const replacement = "\\sqrt{}";

    equationInput.setRangeText(replacement, start, end, "end");

    const cursorPosition = start + "\\sqrt{".length;

    equationInput.selectionStart = cursorPosition;

    equationInput.selectionEnd = cursorPosition;

    updatePreview();
    equationInput.focus();
  }

  function insertFractionTemplate(): void {
    const start = equationInput.selectionStart;

    const end = equationInput.selectionEnd;

    const selectedText = equationInput.value.slice(start, end);

    if (selectedText) {
      const replacement = `\\frac{${selectedText}}{}`;

      equationInput.setRangeText(replacement, start, end, "end");

      updatePreview();
      equationInput.focus();

      return;
    }

    const replacement = "\\frac{}{}";

    equationInput.setRangeText(replacement, start, end, "end");

    // Put cursor inside numerator.
    const cursorPosition = start + "\\frac{".length;

    equationInput.selectionStart = cursorPosition;

    equationInput.selectionEnd = cursorPosition;

    updatePreview();
    equationInput.focus();
  }

  async function isInlineInsertion(context: Word.RequestContext): Promise<boolean> {
    const selection = context.document.getSelection();

    const paragraph = selection.paragraphs.getFirst();

    paragraph.load("text");

    await context.sync();

    const text = paragraph.text.trim();

    /*
     * Non-empty paragraph means the equation is being
     * inserted into surrounding text.
     */
    return text.length > 0;
  }

  function updatePreview(): void {
    const source = equationInput.value.trim();

    equationPreview.style.fontFamily = fontSelect.value;

    equationPreview.style.fontSize = `${fontSize.value}px`;

    if (!source) {
      equationPreview.textContent = "Equation preview";

      return;
    }

    try {
      const equationTree = parseEquation(source);

      equationPreview.innerHTML = previewRenderer.render(equationTree);
    } catch (error) {
      equationPreview.textContent = "Preview unavailable";

      console.error("Preview failed:", error);
    }
  }

  async function insertEquation(): Promise<void> {
    const equation = equationInput.value.trim();

    if (!equation) {
      statusMessage.textContent = "Please enter an equation.";

      return;
    }

    statusMessage.textContent = "Inserting...";

    try {
      const equationTree = parseEquation(equation);

      await Word.run(async (context) => {
        const inline = await isInlineInsertion(context);

        const renderer = new OmmlRenderer({
          fontName: fontSelect.value,
          fontSize: Number(fontSize.value),
        });

        const ooxml = renderer.renderDocumentOoxml(equationTree, inline);

        const selection = context.document.getSelection();

        const insertedRange = selection.insertOoxml(ooxml, Word.InsertLocation.replace);

        await context.sync();

        const contentControl = insertedRange.insertContentControl();

        contentControl.title = "EquationForge Equation";

        contentControl.tag = `EquationForge:${equation}`;

        await context.sync();

        lastEquationControlId = contentControl.id;

        lastEquationSource = equation;
      });
    } catch (error) {
      console.error("Equation insertion failed:", error);

      const message = error instanceof Error ? error.message : String(error);

      statusMessage.textContent = `Insert failed: ${message}`;
    }
  }
}
