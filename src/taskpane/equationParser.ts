import type { MathNode, SequenceNode, AccentNode } from "./equationModel";

const MATH_SYMBOLS: Record<string, string> = {
  // Lowercase Greek
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ϵ",
  "\\varepsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\vartheta": "ϑ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\varkappa": "ϰ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\omicron": "ο",
  "\\pi": "π",
  "\\varpi": "ϖ",
  "\\rho": "ρ",
  "\\varrho": "ϱ",
  "\\sigma": "σ",
  "\\varsigma": "ς",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "ϕ",
  "\\varphi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",

  // Uppercase Greek
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Theta": "Θ",
  "\\Lambda": "Λ",
  "\\Xi": "Ξ",
  "\\Pi": "Π",
  "\\Sigma": "Σ",
  "\\Upsilon": "Υ",
  "\\Phi": "Φ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",

  // Arithmetic
  "\\pm": "±",
  "\\mp": "∓",
  "\\times": "×",
  "\\div": "÷",
  "\\cdot": "⋅",
  "\\ast": "∗",
  "\\star": "⋆",
  "\\circ": "∘",
  "\\bullet": "∙",
  "\\oplus": "⊕",
  "\\ominus": "⊖",

  // Relations
  "\\neq": "≠",
  "\\ne": "≠",
  "\\leq": "≤",
  "\\le": "≤",
  "\\geq": "≥",
  "\\ge": "≥",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\sim": "∼",
  "\\propto": "∝",
  "\\ll": "≪",
  "\\gg": "≫",
  "\\prec": "≺",
  "\\succ": "≻",
  "\\preceq": "≼",
  "\\succeq": "≽",
  "\\parallel": "∥",
  "\\perp": "⊥",

  // Set / logic
  "\\in": "∈",
  "\\notin": "∉",
  "\\subset": "⊂",
  "\\subseteq": "⊆",
  "\\supset": "⊃",
  "\\supseteq": "⊇",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\emptyset": "∅",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\neg": "¬",
  "\\not\\subset": "⊄",
  "\\not\\subseteq": "⊈",
  "\\not\\supset": "⊅",
  "\\not\\supseteq": "⊉",
  "\\setminus": "∖",
  "\\bigcup": "⋃",
  "\\bigcap": "⋂",

  // Common symbols
  "\\infty": "∞",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\ell": "ℓ",
  "\\Re": "ℜ",
  "\\Im": "ℑ",
  "\\aleph": "ℵ",
  "\\prime": "′",

  // Arrows
  "\\rightarrow": "→",
  "\\to": "→",
  "\\leftarrow": "←",
  "\\leftrightarrow": "↔",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
  "\\mapsto": "↦",
  "\\hookrightarrow": "↪",
  "\\hookleftarrow": "↩",
  "\\uparrow": "↑",
  "\\downarrow": "↓",
  "\\updownarrow": "↕",
  "\\nearrow": "↗",
  "\\searrow": "↘",
  "\\swarrow": "↙",
  "\\nwarrow": "↖",

  "\\,": "\u2009",
};

const MATH_SPACES: Record<string, string> = {
  "\\,": "\u2009", // Thin space
  "\\:": "\u205F", // Medium mathematical space
  "\\;": "\u2004", // Three-per-em / thick space
  "\\!": "\u200B", // Zero-width space (negative spacing approximation)

  "\\enspace": "\u2002", // En space
  "\\quad": "\u2003", // Em space
  "\\qquad": "\u2003\u2003", // Double em space

  "\\medspace": "\u205F",
  "\\thickspace": "\u2004",
};

const NARY_COMMANDS: Record<string, string> = {
  "\\int": "∫",
  "\\oint": "∮",
  "\\sum": "∑",
  "\\prod": "∏",
  "\\bigcup": "⋃",
  "\\bigcap": "⋂",
};

const DELIMITER_COMMANDS = new Set([
  "\\left",
  "\\right",
  "\\langle",
  "\\rangle",
  "\\lceil",
  "\\rceil",
  "\\lfloor",
  "\\rfloor",
  "\\lvert",
  "\\rvert",
  "\\Vert",
]);

const FUNCTION_COMMANDS: Record<string, string> = {
  "\\sin": "sin",
  "\\cos": "cos",
  "\\tan": "tan",
  "\\cot": "cot",
  "\\sec": "sec",
  "\\csc": "csc",

  "\\sinh": "sinh",
  "\\cosh": "cosh",
  "\\tanh": "tanh",
  "\\coth": "coth",

  "\\arcsin": "sin",
  "\\arccos": "cos",
  "\\arctan": "tan",

  "\\log": "log",
  "\\ln": "ln",
  "\\lg": "lg",
  "\\exp": "exp",

  "\\det": "det",
  "\\gcd": "gcd",
  "\\lcm": "lcm",

  "\\lim": "lim",
  "\\max": "max",
  "\\min": "min",
  "\\sup": "sup",
  "\\inf": "inf",
};

const STYLE_COMMANDS: Record<string, "bold" | "roman" | "italic"> = {
  "\\mathbf": "bold",
  "\\mathrm": "roman",
  "\\mathit": "italic",
};

const ACCENT_COMMANDS: Record<string, AccentNode["accent"]> = {
  "\\hat": "hat",
  "\\bar": "bar",
  "\\vec": "vec",
  "\\dot": "dot",
  "\\ddot": "ddot",
  "\\overline": "overline",
  "\\underline": "underline",
};

const BOX_COMMANDS = new Set(["\\boxed"]);

const TEXT_COMMANDS = new Set(["\\text"]);

const BINOMIAL_COMMANDS = new Set(["\\binom"]);

const BRACE_COMMANDS: Record<string, "top" | "bottom"> = {
  "\\overbrace": "top",
  "\\underbrace": "bottom",
};

const OVERSET_COMMANDS: Record<string, "top" | "bottom"> = {
  "\\overset": "top",
  "\\underset": "bottom",
};

function readCommand(
  expression: string,
  startIndex: number
): {
  command: string;
  nextIndex: number;
} | null {
  if (expression[startIndex] !== "\\") {
    return null;
  }

  const remaining = expression.slice(startIndex);

  const match = remaining.match(/^\\(?:[A-Za-z]+|[,;:!])/);

  if (!match) {
    return null;
  }

  return {
    command: match[0],
    nextIndex: startIndex + match[0].length,
  };
}

function parseSpacing(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} | null {
  const command = readCommand(expression, startIndex);

  if (!command) {
    return null;
  }

  const spacing = MATH_SPACES[command.command];

  if (spacing === undefined) {
    return null;
  }

  return {
    node: {
      type: "text",
      value: spacing,
    },

    nextIndex: command.nextIndex,
  };
}

function parseBrace(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid brace command near position ${startIndex}.`);
  }

  const position = BRACE_COMMANDS[command.command];

  if (!position) {
    throw new Error(`Unsupported brace command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  /*
   * First argument:
   *
   * \overbrace{a+b+c}
   */

  if (expression[index] !== "{") {
    throw new Error(`${command.command} requires a grouped expression.`);
  }

  const contentGroup = readGroup(expression, index);

  index = contentGroup.nextIndex;

  /*
   * Optional annotation:
   *
   * \overbrace{a+b+c}^{\text{sum}}
   *
   * \underbrace{x+x+x}_{3x}
   */

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  let annotation: MathNode | null = null;

  const expectedMarker = position === "top" ? "^" : "_";

  if (expression[index] === expectedMarker) {
    index++;

    const annotationScript = readScript(expression, index);

    index = annotationScript.nextIndex;

    annotation = parseSequence(annotationScript.content);
  }

  return {
    node: {
      type: "brace",
      position,
      content: parseSequence(contentGroup.content),
      annotation,
    },

    nextIndex: index,
  };
}

function parseOverset(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid overset command near position ${startIndex}.`);
  }

  const position = OVERSET_COMMANDS[command.command];

  if (!position) {
    throw new Error(`Unsupported centered annotation command: ${command.command}`);
  }

  let index = command.nextIndex;

  /*
   * -----------------------------------------------------
   * ANNOTATION
   *
   * \overset{!}{=}
   *          ^ annotation
   * -----------------------------------------------------
   */

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error(`${command.command} requires a grouped annotation.`);
  }

  const annotationGroup = readGroup(expression, index);

  const annotation = parseSequence(annotationGroup.content);

  index = annotationGroup.nextIndex;

  /*
   * -----------------------------------------------------
   * CONTENT
   *
   * \overset{!}{=}
   *             ^ content
   * -----------------------------------------------------
   */

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (index >= expression.length) {
    throw new Error(`${command.command} requires content.`);
  }

  let content: MathNode;

  /*
   * Grouped content:
   *
   * \overset{def}{=}
   */

  if (expression[index] === "{") {
    const contentGroup = readGroup(expression, index);

    content = parseSequence(contentGroup.content);

    index = contentGroup.nextIndex;
  }

  /*
   * Single mathematical atom:
   *
   * \overset{!}{=}
   */
  else {
    const atom = readSingleAtom(expression, index);

    content = atom.node;

    index = atom.nextIndex;
  }

  return {
    node: {
      type: "overset",
      position,
      annotation,
      content,
    },
    nextIndex: index,
  };
}

function parseBinomial(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid binomial command near position ${startIndex}.`);
  }

  if (!BINOMIAL_COMMANDS.has(command.command)) {
    throw new Error(`Unsupported binomial command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  /*
   * \binom{upper}{lower}
   */

  if (expression[index] !== "{") {
    throw new Error("\\binom requires an upper argument in { }.");
  }

  const upperGroup = readGroup(expression, index);

  index = upperGroup.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error("\\binom requires a lower argument in { }.");
  }

  const lowerGroup = readGroup(expression, index);

  return {
    node: {
      type: "binomial",

      upper: parseSequence(upperGroup.content),

      lower: parseSequence(lowerGroup.content),
    },

    nextIndex: lowerGroup.nextIndex,
  };
}

function parseTextBlock(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid text command near position ${startIndex}.`);
  }

  if (!TEXT_COMMANDS.has(command.command)) {
    throw new Error(`Unsupported text command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error("\\text requires a grouped argument.");
  }

  const group = readGroup(expression, index);

  return {
    node: {
      type: "textBlock",
      content: group.content,
    },

    nextIndex: group.nextIndex,
  };
}

function parseBox(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid box command near position ${startIndex}.`);
  }

  if (!BOX_COMMANDS.has(command.command)) {
    throw new Error(`Unsupported box command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error("\\boxed requires a grouped argument.");
  }

  const group = readGroup(expression, index);

  return {
    node: {
      type: "box",
      content: parseSequence(group.content),
    },

    nextIndex: group.nextIndex,
  };
}

function parseStyle(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid style command near position ${startIndex}.`);
  }

  const style = STYLE_COMMANDS[command.command];

  if (!style) {
    throw new Error(`Unsupported style command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error(`${command.command} requires a grouped argument.`);
  }

  const group = readGroup(expression, index);

  return {
    node: {
      type: "style",
      style,
      content: parseSequence(group.content),
    },

    nextIndex: group.nextIndex,
  };
}

function parseAccent(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid accent command near position ${startIndex}.`);
  }

  const accent = ACCENT_COMMANDS[command.command];

  if (!accent) {
    throw new Error(`Unsupported accent command: ${command.command}`);
  }

  let index = command.nextIndex;

  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (expression[index] !== "{") {
    throw new Error(`${command.command} requires a grouped argument.`);
  }

  const group = readGroup(expression, index);

  return {
    node: {
      type: "accent",
      accent,
      content: parseSequence(group.content),
    },

    nextIndex: group.nextIndex,
  };
}

function parseFunctionArgument(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  let index = startIndex;

  /*
   * Ignore whitespace before the argument.
   */
  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  if (index >= expression.length) {
    throw new Error("Function requires an argument.");
  }

  /*
   * --------------------------------------------------
   * GROUPED ARGUMENT
   * --------------------------------------------------
   *
   * \sin{x^2+1}
   */
  if (expression[index] === "{") {
    const group = readGroup(expression, index);

    return {
      node: parseSequence(group.content),
      nextIndex: group.nextIndex,
    };
  }

  /*
   * --------------------------------------------------
   * DYNAMIC DELIMITER
   * --------------------------------------------------
   *
   * \cos\left(\frac{a}{b}\right)
   */
  if (expression.startsWith("\\left", index)) {
    return parseDelimiter(expression, index);
  }

  /*
   * --------------------------------------------------
   * FRACTION
   * --------------------------------------------------
   *
   * \sin\frac{a}{b}
   */
  if (expression.startsWith("\\frac", index)) {
    index += "\\frac".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\frac requires a numerator in { }.");
    }

    const numerator = readGroup(expression, index);

    index = numerator.nextIndex;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\frac requires a denominator in { }.");
    }

    const denominator = readGroup(expression, index);

    index = denominator.nextIndex;

    return {
      node: {
        type: "fraction",

        numerator: parseSequence(numerator.content),

        denominator: parseSequence(denominator.content),
      },

      nextIndex: index,
    };
  }

  /*
   * --------------------------------------------------
   * RADICAL
   * --------------------------------------------------
   *
   * \sin\sqrt{x}
   * \log\sqrt[3]{x}
   */
  if (expression.startsWith("\\sqrt", index)) {
    index += "\\sqrt".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    let degree: MathNode | null = null;

    if (expression[index] === "[") {
      const degreeGroup = readSquareBracketGroup(expression, index);

      degree = parseSequence(degreeGroup.content);

      index = degreeGroup.nextIndex;

      while (index < expression.length && /\s/.test(expression[index] ?? "")) {
        index++;
      }
    }

    if (expression[index] !== "{") {
      throw new Error("\\sqrt requires an expression in { }.");
    }

    const radicand = readGroup(expression, index);

    index = radicand.nextIndex;

    return {
      node: {
        type: "radical",

        degree,

        radicand: parseSequence(radicand.content),
      },

      nextIndex: index,
    };
  }

  /*
   * --------------------------------------------------
   * BOXED
   * --------------------------------------------------
   *
   * \sin\boxed{x}
   */
  if (expression.startsWith("\\boxed", index)) {
    index += "\\boxed".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\boxed requires an expression in { }.");
    }

    const group = readGroup(expression, index);

    return {
      node: {
        type: "box",

        content: parseSequence(group.content),
      },

      nextIndex: group.nextIndex,
    };
  }

  /*
   * --------------------------------------------------
   * BINOMIAL
   * --------------------------------------------------
   *
   * \log\binom{n}{r}
   */
  if (expression.startsWith("\\binom", index)) {
    index += "\\binom".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\binom requires an upper expression in { }.");
    }

    const upper = readGroup(expression, index);

    index = upper.nextIndex;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\binom requires a lower expression in { }.");
    }

    const lower = readGroup(expression, index);

    return {
      node: {
        type: "binomial",

        upper: parseSequence(upper.content),

        lower: parseSequence(lower.content),
      },

      nextIndex: lower.nextIndex,
    };
  }

  /*
   * --------------------------------------------------
   * OVERBRACE / UNDERBRACE
   * --------------------------------------------------
   *
   * \sin\overbrace{x+y}
   * \cos\underbrace{x+y}
   */
  if (expression.startsWith("\\overbrace", index) || expression.startsWith("\\underbrace", index)) {
    const command = expression.startsWith("\\overbrace", index) ? "\\overbrace" : "\\underbrace";

    index += command.length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error(`${command} requires an expression in { }.`);
    }

    const group = readGroup(expression, index);

    return {
      node: {
        type: "brace",

        position: command === "\\overbrace" ? "top" : "bottom",

        content: parseSequence(group.content),

        annotation: null,
      },

      nextIndex: group.nextIndex,
    };
  }

  /*
   * --------------------------------------------------
   * OVERSET / UNDERSET
   * --------------------------------------------------
   *
   * \sin\overset{!}{x}
   */
  if (expression.startsWith("\\overset", index) || expression.startsWith("\\underset", index)) {
    const command = expression.startsWith("\\overset", index) ? "\\overset" : "\\underset";

    index += command.length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error(`${command} requires an annotation in { }.`);
    }

    const annotation = readGroup(expression, index);

    index = annotation.nextIndex;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error(`${command} requires a base expression in { }.`);
    }

    const content = readGroup(expression, index);

    return {
      node: {
        type: "overset",

        position: command === "\\overset" ? "top" : "bottom",

        annotation: parseSequence(annotation.content),

        content: parseSequence(content.content),
      },

      nextIndex: content.nextIndex,
    };
  }

  /*
   * --------------------------------------------------
   * MATRIX / CASES / ETC.
   * --------------------------------------------------
   *
   * \det\begin{pmatrix}a&b\\c&d\end{pmatrix}
   */
  if (expression.startsWith("\\begin{", index)) {
    return parseMatrixEnvironment(expression, index);
  }

  /*
   * --------------------------------------------------
   * NORMAL UNGROUPED ATOM
   * --------------------------------------------------
   *
   * \sin x
   * \cos x
   */
  return readSingleAtom(expression, index);
}

function parseFunction(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error(`Invalid function near position ${startIndex}.`);
  }

  const functionName = FUNCTION_COMMANDS[command.command];

  const isInverseTrig =
    command.command === "\\arcsin" ||
    command.command === "\\arccos" ||
    command.command === "\\arctan";

  if (!functionName) {
    throw new Error(`Unsupported function: ${command.command}`);
  }

  let index = command.nextIndex;

  /*
   * Ignore spaces after the function name.
   */
  while (index < expression.length && /\s/.test(expression[index] ?? "")) {
    index++;
  }

  /*
   * -----------------------------------------------------
   * FUNCTION-LEVEL SUBSCRIPT / SUPERSCRIPT
   *
   * \sin^2 x
   * \sin_1 x
   * \sin_1^2 x
   * -----------------------------------------------------
   */

  let subscript: MathNode | null = null;

  let superscript: MathNode | null = null;

  if (isInverseTrig) {
    superscript = {
      type: "text",
      value: "-1",
    };
  }

  while (index < expression.length && (expression[index] === "^" || expression[index] === "_")) {
    const marker = expression[index];

    index++;

    const script = readScript(expression, index);

    index = script.nextIndex;

    const scriptNode = parseSequence(script.content);

    if (marker === "^") {
      if (superscript !== null) {
        throw new Error("A function cannot have two superscripts.");
      }

      superscript = scriptNode;
    } else {
      if (subscript !== null) {
        throw new Error("A function cannot have two subscripts.");
      }

      subscript = scriptNode;
    }

    /*
     * Allow spaces between the script
     * and the function argument.
     */
    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }
  }

  /*
   * --------------------------------------------------
   * FUNCTION ARGUMENT
   * --------------------------------------------------
   *
   * The argument may be any valid mathematical
   * structure:
   *
   * \sin x
   * \sin\frac{x}{2}
   * \sin\boxed{x}
   * \log\binom{n}{r}
   * \sin\overbrace{x+y}
   * \cos\left(\frac{a}{b}\right)
   * \det\begin{pmatrix}a&b\\c&d\end{pmatrix}
   *
   * --------------------------------------------------
   */

  const parsedArgument = parseFunctionArgument(expression, index);

  let argument = parsedArgument.node;

  index = parsedArgument.nextIndex;

  /*
   * Scripts here belong to the
   * FUNCTION ARGUMENT.
   *
   * \sin x^2
   *       ^
   *
   * \sin\frac{x}{y}^2
   *             ^
   */

  let argumentSubscript: MathNode | null = null;

  let argumentSuperscript: MathNode | null = null;

  while (index < expression.length && (expression[index] === "^" || expression[index] === "_")) {
    const marker = expression[index];

    index++;

    const script = readScript(expression, index);

    index = script.nextIndex;

    const scriptNode = parseSequence(script.content);

    if (marker === "^") {
      if (argumentSuperscript !== null) {
        throw new Error("An argument cannot have two superscripts.");
      }

      argumentSuperscript = scriptNode;
    } else {
      if (argumentSubscript !== null) {
        throw new Error("An argument cannot have two subscripts.");
      }

      argumentSubscript = scriptNode;
    }

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }
  }

  if (argumentSubscript !== null || argumentSuperscript !== null) {
    argument = {
      type: "script",

      base: argument,

      subscript: argumentSubscript,

      superscript: argumentSuperscript,
    };
  }

  /*
   * -----------------------------------------------------
   * FUNCTION NODE
   * -----------------------------------------------------
   */

  return {
    node: {
      type: "function",

      name: functionName,

      argument,

      subscript,

      superscript,
    },

    nextIndex: index,
  };
}

function parseMatrixEnvironment(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const remaining = expression.slice(startIndex);

  const beginMatch = remaining.match(
    /^\\begin\{(matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|cases)\}/
  );

  if (!beginMatch) {
    throw new Error(`Invalid matrix environment near position ${startIndex}.`);
  }

  const environment = beginMatch[1] as
    "matrix" | "pmatrix" | "bmatrix" | "Bmatrix" | "vmatrix" | "Vmatrix" | "cases";

  const bodyStart = startIndex + beginMatch[0].length;

  const endToken = `\\end{${environment}}`;

  const endIndex = expression.indexOf(endToken, bodyStart);

  if (endIndex === -1) {
    throw new Error(`Missing ${endToken}.`);
  }

  const body = expression.slice(bodyStart, endIndex);

  /*
   * Matrix syntax:
   *
   * &  = next column
   * \\ = next row
   */
  const rows = body.split(/\\\\/).map((row) => row.split("&").map((cell) => cell.trim()));

  if (rows.length === 0) {
    throw new Error("Matrix must contain at least one row.");
  }

  if (environment === "cases") {
    if (rows.length === 0) {
      throw new Error("Cases must contain at least one row.");
    }

    for (const row of rows) {
      if (row.length !== 2) {
        throw new Error(
          "Each cases row must contain an expression and a condition separated by &."
        );
      }
    }

    const casesNode: MathNode = {
      type: "cases",
      rows: rows.map((row) => ({
        expression: parseSequence(row[0]),
        condition: parseSequence(row[1]),
      })),
    };

    return {
      node: casesNode,
      nextIndex: endIndex + endToken.length,
    };
  }

  const columnCount = rows[0].length;

  if (columnCount === 0) {
    throw new Error("Matrix must contain at least one column.");
  }

  for (const row of rows) {
    if (row.length !== columnCount) {
      throw new Error("All matrix rows must have the same number of columns.");
    }
  }

  const matrixNode: MathNode = {
    type: "matrix",
    environment,
    rows: rows.map((row) => row.map((cell) => parseSequence(cell))),
  };

  return {
    node: matrixNode,
    nextIndex: endIndex + endToken.length,
  };
}

function parseAlignedEnvironment(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const remaining = expression.slice(startIndex);

  const beginMatch = remaining.match(/^\\begin\{aligned\}/);

  if (!beginMatch) {
    throw new Error(`Invalid aligned environment near position ${startIndex}.`);
  }

  const bodyStart = startIndex + beginMatch[0].length;

  const endToken = "\\end{aligned}";

  const endIndex = expression.indexOf(endToken, bodyStart);

  if (endIndex === -1) {
    throw new Error(`Missing ${endToken}.`);
  }

  const body = expression.slice(bodyStart, endIndex);

  const rows = body.split(/\\\\/).map((row) => row.split("&").map((cell) => cell.trim()));

  if (rows.length === 0) {
    throw new Error("Aligned environment must contain at least one row.");
  }

  for (const row of rows) {
    if (row.length !== 2) {
      throw new Error("Each aligned row must contain exactly one & alignment point.");
    }
  }

  const alignedNode: MathNode = {
    type: "aligned",
    rows: rows.map((row) => row.map((cell) => parseSequence(cell))),
  };

  return {
    node: alignedNode,
    nextIndex: endIndex + endToken.length,
  };
}

function parseGatheredEnvironment(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const remaining = expression.slice(startIndex);

  const beginMatch = remaining.match(/^\\begin\{gathered\}/);

  if (!beginMatch) {
    throw new Error(`Invalid gathered environment near position ${startIndex}.`);
  }

  const bodyStart = startIndex + beginMatch[0].length;

  const endToken = "\\end{gathered}";

  const endIndex = expression.indexOf(endToken, bodyStart);

  if (endIndex === -1) {
    throw new Error(`Missing ${endToken}.`);
  }

  const body = expression.slice(bodyStart, endIndex);

  const rows = body.split(/\\\\/).map((row) => row.trim());

  if (rows.length === 0) {
    throw new Error("Gathered environment must contain at least one row.");
  }

  const gatheredNode: MathNode = {
    type: "gathered",
    rows: rows.map((row) => parseSequence(row)),
  };

  return {
    node: gatheredNode,
    nextIndex: endIndex + endToken.length,
  };
}

function readDelimiterToken(
  expression: string,
  startIndex: number
): {
  token: string;
  nextIndex: number;
} {
  const remaining = expression.slice(startIndex);

  const namedDelimiters: Array<{
    input: string;
    output: string;
  }> = [
    { input: "\\langle", output: "⟨" },
    { input: "\\rangle", output: "⟩" },
    { input: "\\lceil", output: "⌈" },
    { input: "\\rceil", output: "⌉" },
    { input: "\\lfloor", output: "⌊" },
    { input: "\\rfloor", output: "⌋" },
    { input: "\\lvert", output: "|" },
    { input: "\\rvert", output: "|" },
    { input: "\\Vert", output: "‖" },
  ];

  for (const delimiter of namedDelimiters) {
    if (remaining.startsWith(delimiter.input)) {
      return {
        token: delimiter.output,
        nextIndex: startIndex + delimiter.input.length,
      };
    }
  }

  /*
   * Escaped brace delimiters:
   *
   * \left\{
   * \right\}
   */
  if (remaining.startsWith("\\{")) {
    return {
      token: "{",
      nextIndex: startIndex + 2,
    };
  }

  if (remaining.startsWith("\\}")) {
    return {
      token: "}",
      nextIndex: startIndex + 2,
    };
  }

  /*
   * Escaped vertical bar:
   *
   * \left\|
   */
  if (remaining.startsWith("\\|")) {
    return {
      token: "|",
      nextIndex: startIndex + 2,
    };
  }

  const character = expression[startIndex];

  const simpleDelimiters: Record<string, string> = {
    "(": "(",
    ")": ")",
    "[": "[",
    "]": "]",
    "|": "|",
    "<": "⟨",
    ">": "⟩",
    ".": "",
  };

  if (Object.prototype.hasOwnProperty.call(simpleDelimiters, character)) {
    return {
      token: simpleDelimiters[character],
      nextIndex: startIndex + 1,
    };
  }

  throw new Error(`Unsupported delimiter near position ${startIndex}.`);
}

function parseDelimiter(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  let index = startIndex + "\\left".length;

  while (index < expression.length && /\s/.test(expression[index])) {
    index++;
  }

  const begin = readDelimiterToken(expression, index);

  index = begin.nextIndex;

  const contentStart = index;

  let depth = 1;

  while (index < expression.length) {
    /*
     * Nested \left...\right
     */
    if (expression.startsWith("\\left", index)) {
      depth++;
      index += "\\left".length;
      continue;
    }

    if (expression.startsWith("\\right", index)) {
      depth--;

      if (depth === 0) {
        const content = expression.slice(contentStart, index);

        index += "\\right".length;

        while (index < expression.length && /\s/.test(expression[index])) {
          index++;
        }

        const end = readDelimiterToken(expression, index);

        return {
          node: {
            type: "delimiter",
            begin: begin.token,
            end: end.token,
            content: parseSequence(content),
          },

          nextIndex: end.nextIndex,
        };
      }

      index += "\\right".length;

      continue;
    }

    index++;
  }

  throw new Error("Missing matching \\right delimiter.");
}

function parseNary(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  const command = readCommand(expression, startIndex);

  if (!command) {
    throw new Error("Invalid n-ary command.");
  }

  const operator = NARY_COMMANDS[command.command];

  if (!operator) {
    throw new Error(`Unsupported n-ary command: ${command.command}`);
  }

  let index = command.nextIndex;

  /*
   * ---------------------------------------------------------
   * Optional lower/upper limits
   *
   * \sum_{i=1}^{n}
   * \int_0^1
   * ---------------------------------------------------------
   */

  let lower: MathNode | null = null;
  let upper: MathNode | null = null;

  skipWhitespace();

  while (index < expression.length && (expression[index] === "_" || expression[index] === "^")) {
    const marker = expression[index];

    index++;

    const script = readScript(expression, index);

    index = script.nextIndex;

    const scriptNode = parseSequence(script.content);

    if (marker === "_") {
      if (lower !== null) {
        throw new Error("An n-ary operator cannot have two lower limits.");
      }

      lower = scriptNode;
    } else {
      if (upper !== null) {
        throw new Error("An n-ary operator cannot have two upper limits.");
      }

      upper = scriptNode;
    }

    skipWhitespace();
  }

  /*
   * ---------------------------------------------------------
   * Read the body.
   *
   * At this stage we support either:
   *
   * \sum_{i=1}^{n} i^2
   *
   * or:
   *
   * \sum_{i=1}^{n} {i^2 + 1}
   *
   * Grouping lets us explicitly define a multi-token body.
   * ---------------------------------------------------------
   */

  if (index >= expression.length) {
    throw new Error(`${command.command} is missing its body.`);
  }

  let body: MathNode;

  if (expression[index] === "{") {
    const group = readGroup(expression, index);

    body = parseSequence(group.content);

    index = group.nextIndex;
  } else {
    const bodyExpression = expression.slice(index);

    body = parseSequence(bodyExpression);

    index = expression.length;

    /*
     * Allow a script directly on the body:
     *
     * \sum_{i=1}^{n} a_i
     */
    let subscript: MathNode | null = null;
    let superscript: MathNode | null = null;

    while (index < expression.length && (expression[index] === "_" || expression[index] === "^")) {
      const marker = expression[index];

      index++;

      const script = readScript(expression, index);

      index = script.nextIndex;

      const scriptNode = parseSequence(script.content);

      if (marker === "_") {
        subscript = scriptNode;
      } else {
        superscript = scriptNode;
      }
    }

    if (subscript !== null || superscript !== null) {
      body = {
        type: "script",
        base: body,
        subscript,
        superscript,
      };
    }
  }

  return {
    node: {
      type: "nary",
      operator,
      lower,
      upper,
      body,
    },

    nextIndex: index,
  };

  function skipWhitespace(): void {
    while (index < expression.length && /\s/.test(expression[index])) {
      index++;
    }
  }
}

function readSingleAtom(
  expression: string,
  startIndex: number
): {
  node: MathNode;
  nextIndex: number;
} {
  let index = startIndex;

  const spacing = parseSpacing(expression, index);

  if (spacing) {
    return spacing;
  }

  /*
   * -----------------------------------------------------
   * UNGROUPED FRACTION
   * -----------------------------------------------------
   *
   * \frac{a}{b}
   *
   * Needed for n-ary bodies such as:
   *
   * \sum_{i=1}^{n}\frac{i^2+1}{\sqrt{i}}
   * -----------------------------------------------------
   */

  if (expression.startsWith("\\frac", index)) {
    index += "\\frac".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\frac requires a numerator in { }.");
    }

    const numerator = readGroup(expression, index);

    index = numerator.nextIndex;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (expression[index] !== "{") {
      throw new Error("\\frac requires a denominator in { }.");
    }

    const denominator = readGroup(expression, index);

    return {
      node: {
        type: "fraction",

        numerator: parseSequence(numerator.content),

        denominator: parseSequence(denominator.content),
      },

      nextIndex: denominator.nextIndex,
    };
  }

  /*
   * -----------------------------------------------------
   * UNGROUPED RADICAL
   * -----------------------------------------------------
   *
   * \sqrt{x}
   * \sqrt[3]{x}
   * -----------------------------------------------------
   */

  if (expression.startsWith("\\sqrt", index)) {
    index += "\\sqrt".length;

    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    let degree: MathNode | null = null;

    if (expression[index] === "[") {
      const degreeGroup = readSquareBracketGroup(expression, index);

      degree = parseSequence(degreeGroup.content);

      index = degreeGroup.nextIndex;

      while (index < expression.length && /\s/.test(expression[index] ?? "")) {
        index++;
      }
    }

    if (expression[index] !== "{") {
      throw new Error("\\sqrt requires an expression in { }.");
    }

    const radicand = readGroup(expression, index);

    return {
      node: {
        type: "radical",

        degree,

        radicand: parseSequence(radicand.content),
      },

      nextIndex: radicand.nextIndex,
    };
  }

  /*
   * -----------------------------------------------------
   * GROUPED ATOM
   *
   * {x+1}
   * -----------------------------------------------------
   */
  if (expression[index] === "{") {
    const group = readGroup(expression, index);

    return {
      node: parseSequence(group.content),

      nextIndex: group.nextIndex,
    };
  }

  /*
   * -----------------------------------------------------
   * ORDINARY PARENTHESES
   *
   * (x+a)
   *
   * We need to find the matching ")" and parse
   * everything inside as one mathematical expression.
   *
   * This is especially important for:
   *
   * \sin(x+a)
   * \cos(x^2+1)
   * \exp(x^2+1)
   * -----------------------------------------------------
   */
  if (expression[index] === "(") {
    let depth = 1;
    let endIndex = index + 1;

    while (endIndex < expression.length && depth > 0) {
      if (expression[endIndex] === "(") {
        depth++;
      } else if (expression[endIndex] === ")") {
        depth--;
      }

      endIndex++;
    }

    if (depth !== 0) {
      throw new Error("Unmatched opening parenthesis.");
    }

    const content = expression.slice(index + 1, endIndex - 1);

    return {
      node: {
        type: "delimiter",
        begin: "(",
        end: ")",
        content: parseSequence(content),
      },

      nextIndex: endIndex,
    };
  }

  /*
   * -----------------------------------------------------
   * MATHEMATICAL COMMAND
   *
   * \alpha
   * \pi
   * \times
   * etc.
   * -----------------------------------------------------
   */
  if (expression[index] === "\\") {
    const command = readCommand(expression, index);

    if (!command) {
      throw new Error(`Invalid command near position ${index}.`);
    }

    const symbol = MATH_SYMBOLS[command.command];

    if (symbol) {
      return {
        node: {
          type: "text",
          value: symbol,
        },

        nextIndex: command.nextIndex,
      };
    }

    throw new Error(`Unsupported command inside function argument: ${command.command}`);
  }

  /*
   * -----------------------------------------------------
   * ORDINARY TEXT ATOM
   *
   * Read one character.
   * -----------------------------------------------------
   */
  if (index >= expression.length) {
    throw new Error("Expected a mathematical expression.");
  }

  return {
    node: {
      type: "text",
      value: expression[index],
    },

    nextIndex: index + 1,
  };
}

/**
 * Parses the mathematical syntax currently handled
 * by the new EquationForge engine.
 *
 * Supported at this stage:
 *
 * x
 * x + y
 * x^2
 * x_1
 * x_1^2
 * x^{n+1}
 * x_{i+1}
 *
 * \frac{a}{b}
 * \frac{x^2+1}{x+1}
 *
 * More advanced commands such as \sqrt, \sum, matrices,
 * etc. will be migrated later.
 */
export function parseEquation(expression: string): MathNode {
  return parseSequence(expression);
}

/**
 * Parses a sequence of mathematical atoms.
 */
function parseSequence(expression: string): SequenceNode {
  const children: MathNode[] = [];

  let index = 0;

  while (index < expression.length) {
    /*
     * Ignore ordinary whitespace in math mode.
     *
     * Explicit spacing commands such as:
     *
     * \,
     * \:
     * \;
     * \quad
     * \qquad
     *
     * are handled separately and are preserved.
     */
    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    if (index >= expression.length) {
      break;
    }
    if (expression[index] === "}") {
      break;
    }

    let base: MathNode;

    if (
      expression.startsWith("\\begin{matrix}", index) ||
      expression.startsWith("\\begin{pmatrix}", index) ||
      expression.startsWith("\\begin{bmatrix}", index) ||
      expression.startsWith("\\begin{Bmatrix}", index) ||
      expression.startsWith("\\begin{vmatrix}", index) ||
      expression.startsWith("\\begin{Vmatrix}", index) ||
      expression.startsWith("\\begin{cases}", index) ||
      expression.startsWith("\\begin{aligned}", index) ||
      expression.startsWith("\\begin{gathered}", index)
    ) {
      if (expression.startsWith("\\begin{aligned}", index)) {
        const aligned = parseAlignedEnvironment(expression, index);

        base = aligned.node;

        index = aligned.nextIndex;
      } else if (expression.startsWith("\\begin{gathered}", index)) {
        const gathered = parseGatheredEnvironment(expression, index);

        base = gathered.node;
        index = gathered.nextIndex;
      } else {
        const matrix = parseMatrixEnvironment(expression, index);

        base = matrix.node;
        index = matrix.nextIndex;
      }
    } else if (
      expression[index] === "\\" &&
      MATH_SPACES[readCommand(expression, index)?.command ?? ""] !== undefined
    ) {
      const spacing = parseSpacing(expression, index);

      if (!spacing) {
        throw new Error(`Invalid spacing command near position ${index}.`);
      }

      base = spacing.node;
      index = spacing.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * DYNAMIC DELIMITER
     * -----------------------------------------------------
     */
    else if (expression.startsWith("\\left", index)) {
      const delimiter = parseDelimiter(expression, index);

      base = delimiter.node;

      index = delimiter.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * N-ARY OPERATOR
     * -----------------------------------------------------
     */
    else if (
      expression.startsWith("\\int", index) ||
      expression.startsWith("\\oint", index) ||
      expression.startsWith("\\sum", index) ||
      expression.startsWith("\\prod", index) ||
      expression.startsWith("\\bigcup", index) ||
      expression.startsWith("\\bigcap", index)
    ) {
      const nary = parseNary(expression, index);

      base = nary.node;

      index = nary.nextIndex;
    } else if (
      expression[index] === "\\" &&
      BOX_COMMANDS.has(readCommand(expression, index)?.command ?? "")
    ) {
      const boxResult = parseBox(expression, index);

      base = boxResult.node;

      index = boxResult.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * RADICAL
     *
     * \sqrt{x}
     * \sqrt[3]{x}
     * -----------------------------------------------------
     */
    else if (expression.startsWith("\\sqrt", index)) {
      index += "\\sqrt".length;

      skipWhitespace();

      let degree: MathNode | null = null;

      if (expression[index] === "[") {
        const degreeGroup = readSquareBracketGroup(expression, index);

        degree = parseSequence(degreeGroup.content);

        index = degreeGroup.nextIndex;

        skipWhitespace();
      }

      if (expression[index] !== "{") {
        throw new Error("\\sqrt requires an expression in { }.");
      }

      const radicandGroup = readGroup(expression, index);

      index = radicandGroup.nextIndex;

      base = {
        type: "radical",
        degree,
        radicand: parseSequence(radicandGroup.content),
      };
    } else if (
      expression[index] === "\\" &&
      BINOMIAL_COMMANDS.has(readCommand(expression, index)?.command ?? "")
    ) {
      const binomialResult = parseBinomial(expression, index);

      base = binomialResult.node;

      index = binomialResult.nextIndex;
    } else if (
      expression[index] === "\\" &&
      TEXT_COMMANDS.has(readCommand(expression, index)?.command ?? "")
    ) {
      const textResult = parseTextBlock(expression, index);

      base = textResult.node;

      index = textResult.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * FRACTION
     *
     * \frac{a}{b}
     * -----------------------------------------------------
     */
    else if (expression.startsWith("\\frac", index)) {
      index += "\\frac".length;

      skipWhitespace();

      if (expression[index] !== "{") {
        throw new Error("\\frac requires a numerator in { }.");
      }

      const numeratorGroup = readGroup(expression, index);

      index = numeratorGroup.nextIndex;

      skipWhitespace();

      if (expression[index] !== "{") {
        throw new Error("\\frac requires a denominator in { }.");
      }

      const denominatorGroup = readGroup(expression, index);

      index = denominatorGroup.nextIndex;

      base = {
        type: "fraction",

        numerator: parseSequence(numeratorGroup.content),

        denominator: parseSequence(denominatorGroup.content),
      };
    }

    /*
     * -----------------------------------------------------
     * GROUP
     *
     * {x+1}
     * -----------------------------------------------------
     */
    else if (expression[index] === "{") {
      const group = readGroup(expression, index);

      base = parseSequence(group.content);

      index = group.nextIndex;
    } else if (
      expression[index] === "\\" &&
      Object.prototype.hasOwnProperty.call(
        STYLE_COMMANDS,
        readCommand(expression, index)?.command ?? ""
      )
    ) {
      const styleResult = parseStyle(expression, index);

      base = styleResult.node;

      index = styleResult.nextIndex;
    } else if (
      expression[index] === "\\" &&
      Object.prototype.hasOwnProperty.call(
        FUNCTION_COMMANDS,
        readCommand(expression, index)?.command ?? ""
      )
    ) {
      const functionResult = parseFunction(expression, index);

      base = functionResult.node;

      index = functionResult.nextIndex;
    } else if (
      expression[index] === "\\" &&
      Object.prototype.hasOwnProperty.call(
        BRACE_COMMANDS,
        readCommand(expression, index)?.command ?? ""
      )
    ) {
      const braceResult = parseBrace(expression, index);

      base = braceResult.node;

      index = braceResult.nextIndex;
    } else if (
      expression[index] === "\\" &&
      Object.prototype.hasOwnProperty.call(
        OVERSET_COMMANDS,
        readCommand(expression, index)?.command ?? ""
      )
    ) {
      const oversetResult = parseOverset(expression, index);

      base = oversetResult.node;

      index = oversetResult.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * MATHEMATICAL COMMAND
     *
     * \alpha
     * \beta
     * \pi
     * \times
     * etc.
     * -----------------------------------------------------
     */
    else if (expression[index] === "\\") {
      const command = readCommand(expression, index);

      if (!command) {
        throw new Error(`Invalid command near position ${index}.`);
      }

      /*
       * \not is a modifier.
       *
       * Example:
       *
       * \not=      → ≠
       * \not\in   → ∉
       * \not<     → ≮
       */
      if (command.command === "\\not") {
        index = command.nextIndex;

        while (index < expression.length && /\s/.test(expression[index] ?? "")) {
          index++;
        }

        if (index >= expression.length) {
          throw new Error("\\not requires a symbol or relation.");
        }

        /*
         * Read the symbol after \not.
         */
        let nextCommand: {
          command: string;
          nextIndex: number;
        } | null = null;

        if (expression[index] === "\\") {
          nextCommand = readCommand(expression, index);
        }

        /*
         * Named commands such as:
         *
         * \not\in
         * \not\subset
         */
        if (nextCommand) {
          const negatedSymbols: Record<string, string> = {
            "\\in": "∉",
            "\\subset": "⊄",
            "\\subseteq": "⊈",
            "\\supset": "⊅",
            "\\supseteq": "⊉",
          };

          const negated = negatedSymbols[nextCommand.command];

          if (!negated) {
            throw new Error(`Cannot negate command: ${nextCommand.command}`);
          }

          base = {
            type: "text",
            value: negated,
          };

          index = nextCommand.nextIndex;
        }

        /*
         * Single-character relations:
         *
         * \not=
         * \not<
         * \not>
         */
        else {
          const character = expression[index];

          const negatedCharacters: Record<string, string> = {
            "=": "≠",
            "<": "≮",
            ">": "≯",
          };

          const negated = negatedCharacters[character];

          if (!negated) {
            throw new Error(`Cannot negate symbol: ${character}`);
          }

          base = {
            type: "text",
            value: negated,
          };

          index++;
        }
      } else if (
        expression[index] === "\\" &&
        Object.prototype.hasOwnProperty.call(
          ACCENT_COMMANDS,
          readCommand(expression, index)?.command ?? ""
        )
      ) {
        const accentResult = parseAccent(expression, index);

        base = accentResult.node;

        index = accentResult.nextIndex;
      } else {
        const symbol = MATH_SYMBOLS[command.command];

        if (!symbol) {
          throw new Error(`Unsupported command: ${command.command}`);
        }

        base = {
          type: "text",
          value: symbol,
        };

        index = command.nextIndex;
      }
    }

    /*
     * -----------------------------------------------------
     * ORDINARY TEXT
     * -----------------------------------------------------
     */
    else {
      const start = index;

      while (
        index < expression.length &&
        expression[index] !== "^" &&
        expression[index] !== "_" &&
        expression[index] !== "{" &&
        expression[index] !== "}" &&
        expression[index] !== "\\"
      ) {
        index++;
      }

      if (index === start) {
        throw new Error(`Unexpected character '${expression[index]}' at position ${index}.`);
      }

      base = {
        type: "text",
        value: expression.slice(start, index),
      };
    }

    /*
     * -----------------------------------------------------
     * OPTIONAL SUBSCRIPT / SUPERSCRIPT
     *
     * This applies to ANY base:
     *
     * x^2
     * \frac{a}{b}^2
     * \sqrt{x}_1
     * \left(x+1\right)^2
     * -----------------------------------------------------
     */
    /*
     * -----------------------------------------------------
     * OPTIONAL SUBSCRIPT / SUPERSCRIPT
     *
     * Functions handle their own scripts inside
     * parseFunction().
     *
     * Therefore the generic script parser must NOT
     * process FunctionNode again.
     * -----------------------------------------------------
     */

    if (base.type === "function") {
      children.push(base);
      continue;
    }

    let subscript: MathNode | null = null;
    let superscript: MathNode | null = null;

    while (index < expression.length && (expression[index] === "^" || expression[index] === "_")) {
      const marker = expression[index];

      index++;

      const script = readScript(expression, index);

      index = script.nextIndex;

      const scriptNode = parseSequence(script.content);

      if (marker === "^") {
        if (superscript !== null) {
          throw new Error("An element cannot have two superscripts.");
        }

        superscript = scriptNode;
      } else {
        if (subscript !== null) {
          throw new Error("An element cannot have two subscripts.");
        }

        subscript = scriptNode;
      }
    }

    if (subscript === null && superscript === null) {
      children.push(base);
      continue;
    }

    children.push({
      type: "script",
      base,
      subscript,
      superscript,
    });
  }

  return {
    type: "sequence",
    children,
  };

  function skipWhitespace(): void {
    while (index < expression.length && /\s/.test(expression[index])) {
      index++;
    }
  }
}
/**
 * Reads a balanced {...} group.
 */
function readGroup(
  expression: string,
  startIndex: number
): {
  content: string;
  nextIndex: number;
} {
  let depth = 0;

  for (let index = startIndex; index < expression.length; index++) {
    const character = expression[index];

    if (character === "{") {
      depth++;
      continue;
    }

    if (character === "}") {
      depth--;

      if (depth === 0) {
        return {
          content: expression.slice(startIndex + 1, index),

          nextIndex: index + 1,
        };
      }
    }
  }

  throw new Error("Unclosed { in equation.");
}
/**
 * Reads a balanced [...] group.
 *
 * Used for:
 *
 * \sqrt[3]{x}
 */
function readSquareBracketGroup(
  expression: string,
  startIndex: number
): {
  content: string;
  nextIndex: number;
} {
  let depth = 0;

  for (let index = startIndex; index < expression.length; index++) {
    const character = expression[index];

    if (character === "[") {
      depth++;
      continue;
    }

    if (character === "]") {
      depth--;

      if (depth === 0) {
        return {
          content: expression.slice(startIndex + 1, index),

          nextIndex: index + 1,
        };
      }
    }
  }

  throw new Error("Unclosed [ in radical degree.");
}

/**
 * Reads the contents of a superscript/subscript.
 *
 * x^2
 * x^{n+1}
 */
function readScript(
  expression: string,
  startIndex: number
): {
  content: string;
  nextIndex: number;
} {
  /*
   * ---------------------------------------------------------
   * GROUPED SCRIPT
   *
   * x^{n+1}
   * x_{i+1}
   * ---------------------------------------------------------
   */
  if (expression[startIndex] === "{") {
    return readGroup(expression, startIndex);
  }

  if (startIndex >= expression.length || expression[startIndex] === "}") {
    throw new Error("Missing script content.");
  }

  /*
   * ---------------------------------------------------------
   * COMMAND SCRIPT
   *
   * A command is a single mathematical token.
   *
   * Examples:
   *
   * x^\alpha
   * x^\frac{a}{b}
   * x^\sqrt{a}
   * x^\binom{n}{r}
   *
   * ---------------------------------------------------------
   */
  if (expression[startIndex] === "\\") {
    const command = readCommand(expression, startIndex);

    if (!command) {
      throw new Error(`Invalid script command near position ${startIndex}.`);
    }

    /*
     * -----------------------------------------------------
     * DYNAMIC DELIMITER
     *
     * x^\left(\frac{a}{b}\right)
     * -----------------------------------------------------
     */
    if (command.command === "\\left") {
      const delimiter = parseDelimiter(expression, startIndex);

      return {
        content: expression.slice(startIndex, delimiter.nextIndex),

        nextIndex: delimiter.nextIndex,
      };
    }

    /*
     * -----------------------------------------------------
     * MATRIX / ALIGNED / GATHERED
     *
     * x^\begin{pmatrix}...\end{pmatrix}
     * -----------------------------------------------------
     */
    if (expression.startsWith("\\begin{aligned}", startIndex)) {
      const result = parseAlignedEnvironment(expression, startIndex);

      return {
        content: expression.slice(startIndex, result.nextIndex),

        nextIndex: result.nextIndex,
      };
    }

    if (expression.startsWith("\\begin{gathered}", startIndex)) {
      const result = parseGatheredEnvironment(expression, startIndex);

      return {
        content: expression.slice(startIndex, result.nextIndex),

        nextIndex: result.nextIndex,
      };
    }

    if (
      expression.startsWith("\\begin{matrix}", startIndex) ||
      expression.startsWith("\\begin{pmatrix}", startIndex) ||
      expression.startsWith("\\begin{bmatrix}", startIndex) ||
      expression.startsWith("\\begin{Bmatrix}", startIndex) ||
      expression.startsWith("\\begin{vmatrix}", startIndex) ||
      expression.startsWith("\\begin{Vmatrix}", startIndex) ||
      expression.startsWith("\\begin{cases}", startIndex)
    ) {
      const result = parseMatrixEnvironment(expression, startIndex);

      return {
        content: expression.slice(startIndex, result.nextIndex),

        nextIndex: result.nextIndex,
      };
    }

    let index = command.nextIndex;

    /*
     * Skip whitespace after
     * the command name.
     */
    while (index < expression.length && /\s/.test(expression[index] ?? "")) {
      index++;
    }

    /*
     * -----------------------------------------------------
     * SQRT
     *
     * \sqrt{x}
     * \sqrt[3]{x}
     *
     * -----------------------------------------------------
     */
    if (command.command === "\\sqrt") {
      if (expression[index] === "[") {
        const degree = readSquareBracketGroup(expression, index);

        index = degree.nextIndex;

        while (index < expression.length && /\s/.test(expression[index] ?? "")) {
          index++;
        }
      }

      if (expression[index] !== "{") {
        throw new Error("\\sqrt requires an expression in { }.");
      }

      const radicand = readGroup(expression, index);

      return {
        content: expression.slice(startIndex, radicand.nextIndex),

        nextIndex: radicand.nextIndex,
      };
    }

    /*
     * -----------------------------------------------------
     * TWO-GROUP COMMANDS
     *
     * \frac{a}{b}
     * \binom{n}{r}
     * \overset{a}{b}
     * \underset{a}{b}
     *
     * -----------------------------------------------------
     */
    const twoGroupCommands = new Set(["\\frac", "\\binom", "\\overset", "\\underset"]);

    if (twoGroupCommands.has(command.command)) {
      if (expression[index] !== "{") {
        throw new Error(`${command.command} requires its first argument in { }.`);
      }

      const firstGroup = readGroup(expression, index);

      index = firstGroup.nextIndex;

      while (index < expression.length && /\s/.test(expression[index] ?? "")) {
        index++;
      }

      if (expression[index] !== "{") {
        throw new Error(`${command.command} requires its second argument in { }.`);
      }

      const secondGroup = readGroup(expression, index);

      return {
        content: expression.slice(startIndex, secondGroup.nextIndex),

        nextIndex: secondGroup.nextIndex,
      };
    }

    /*
     * -----------------------------------------------------
     * ONE-GROUP COMMANDS
     *
     * \boxed{x}
     * \text{abc}
     * \mathbf{x}
     * \mathrm{x}
     * \mathit{x}
     * \hat{x}
     * \bar{x}
     * \vec{x}
     * \dot{x}
     * \ddot{x}
     * \overline{x}
     * \underline{x}
     * \overbrace{x}
     * \underbrace{x}
     *
     * -----------------------------------------------------
     */
    const oneGroupCommands = new Set([
      "\\boxed",
      "\\text",

      "\\mathbf",
      "\\mathrm",
      "\\mathit",

      "\\hat",
      "\\bar",
      "\\vec",
      "\\dot",
      "\\ddot",
      "\\overline",
      "\\underline",

      "\\overbrace",
      "\\underbrace",
    ]);

    if (oneGroupCommands.has(command.command)) {
      if (expression[index] !== "{") {
        throw new Error(`${command.command} requires an expression in { }.`);
      }

      const group = readGroup(expression, index);

      return {
        content: expression.slice(startIndex, group.nextIndex),

        nextIndex: group.nextIndex,
      };
    }

    /*
     * -----------------------------------------------------
     * ORDINARY COMMAND
     *
     * \alpha
     * \beta
     * \infty
     * \to
     *
     * A plain command itself is one script token.
     * -----------------------------------------------------
     */
    return {
      content: expression.slice(startIndex, command.nextIndex),

      nextIndex: command.nextIndex,
    };
  }

  /*
   * ---------------------------------------------------------
   * ORDINARY ONE-CHARACTER SCRIPT
   *
   * x^2
   * x_i
   * ---------------------------------------------------------
   */
  return {
    content: expression[startIndex],

    nextIndex: startIndex + 1,
  };
}
