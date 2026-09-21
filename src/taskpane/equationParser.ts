import type {
    MathNode,
    SequenceNode,
    TextNode
} from "./equationModel";

export const MATH_SYMBOLS: Record<string, string> = {
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

    // Common symbols
    "\\infty": "∞",
    "\\partial": "∂",
    "\\nabla": "∇",

    // Arrows
    "\\rightarrow": "→",
    "\\to": "→",
    "\\leftarrow": "←",
    "\\leftrightarrow": "↔",
    "\\Rightarrow": "⇒",
    "\\Leftarrow": "⇐",
    "\\Leftrightarrow": "⇔"
};
export function canParseWithNewEngine(
    expression: string
): boolean {
    const commands = expression.match(
        /\\[A-Za-z]+/g
    );

    if (!commands) {
        return true;
    }

    const supportedCommands = new Set([
        "\\frac",
        "\\sqrt",
        ...Object.keys(MATH_SYMBOLS)
    ]);

    return commands.every(
        (command) =>
            supportedCommands.has(command)
    );
}

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

    const match = expression
        .slice(startIndex)
        .match(/^\\[A-Za-z]+/);

    if (!match) {
        return null;
    }

    return {
        command: match[0],
        nextIndex:
            startIndex + match[0].length
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
export function parseEquation(
    expression: string
): MathNode {
    return parseSequence(expression);
}

/**
 * Parses a sequence of mathematical atoms.
 */
function parseSequence(
    expression: string
): SequenceNode {
    const children: MathNode[] = [];

    let index = 0;

    while (index < expression.length) {
        const character = expression[index];

        /*
         * A closing brace means the current group has ended.
         */
        if (character === "}") {
            break;
        }

        let base: MathNode;

                /*
         * -----------------------------------------------------
         * RADICAL
         *
         * \sqrt{x}
         * \sqrt[n]{x}
         * -----------------------------------------------------
         */
        if (expression.startsWith("\\sqrt", index)) {
            index += "\\sqrt".length;

            skipWhitespace();

            let degree: MathNode | null = null;

            /*
             * Optional root degree:
             *
             * \sqrt[3]{x}
             */
            if (expression[index] === "[") {
                const degreeGroup =
                    readSquareBracketGroup(
                        expression,
                        index
                    );

                degree = parseSequence(
                    degreeGroup.content
                );

                index =
                    degreeGroup.nextIndex;

                skipWhitespace();
            }

            /*
             * The radicand must be enclosed
             * in { }.
             */
            if (expression[index] !== "{") {
                throw new Error(
                    "\\sqrt requires an expression in { }."
                );
            }

            const radicandGroup =
                readGroup(
                    expression,
                    index
                );

            index =
                radicandGroup.nextIndex;

            base = {
                type: "radical",

                degree,

                radicand: parseSequence(
                    radicandGroup.content
                )
            };
        } else

        /*
         * -----------------------------------------------------
         * FRACTION
         *
         * \frac{numerator}{denominator}
         * -----------------------------------------------------
         */
        if (expression.startsWith("\\frac", index)) {
            index += "\\frac".length;

            skipWhitespace();

            if (expression[index] !== "{") {
                throw new Error(
                    "\\frac requires a numerator in { }."
                );
            }

            const numeratorGroup =
                readGroup(
                    expression,
                    index
                );

            index =
                numeratorGroup.nextIndex;

            skipWhitespace();

            if (expression[index] !== "{") {
                throw new Error(
                    "\\frac requires a denominator in { }."
                );
            }

            const denominatorGroup =
                readGroup(
                    expression,
                    index
                );

            index =
                denominatorGroup.nextIndex;

            base = {
                type: "fraction",

                numerator: parseSequence(
                    numeratorGroup.content
                ),

                denominator: parseSequence(
                    denominatorGroup.content
                )
            };

        /*
         * -----------------------------------------------------
         * GROUP
         *
         * {x+1}
         * -----------------------------------------------------
         */
        } else if (character === "{") {
            const group =
                readGroup(
                    expression,
                    index
                );

            base = parseSequence(
                group.content
            );

            index = group.nextIndex;

        /*
         * -----------------------------------------------------
         * UNSUPPORTED COMMAND
         *
         * Any backslash command other than \frac is rejected.
         * The old engine will handle those commands temporarily.
         * -----------------------------------------------------
         */
        }   else if (character === "\\") {
            const commandToken =
                readCommand(
                    expression,
                    index
                );

            if (!commandToken) {
                throw new Error(
                    `Invalid command near position ${index}.`
                );
            }

            const symbol =
                MATH_SYMBOLS[
                    commandToken.command
                ];

            if (!symbol) {
                throw new Error(
                    `Unsupported command: ${commandToken.command}`
                );
            }

            base = {
                type: "text",
                value: symbol
            };

            index =
                commandToken.nextIndex;

        /*
         * -----------------------------------------------------
         * ORDINARY TEXT
         * -----------------------------------------------------
         */
        } else {
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
                throw new Error(
                    `Unexpected character '${expression[index]}' at position ${index}.`
                );
            }

            const text: TextNode = {
                type: "text",
                value: expression.slice(
                    start,
                    index
                )
            };

            base = text;
        }

        /*
         * -----------------------------------------------------
         * SCRIPTS
         *
         * x^2
         * x_1
         * x_1^2
         *
         * Importantly, scripts can now attach to a fraction too:
         *
         * \frac{a}{b}^2
         * -----------------------------------------------------
         */

        let subscript: MathNode | null = null;
        let superscript: MathNode | null = null;

        while (
            index < expression.length &&
            (
                expression[index] === "^" ||
                expression[index] === "_"
            )
        ) {
            const operator =
                expression[index];

            index++;

            const script =
                readScript(
                    expression,
                    index
                );

            index =
                script.nextIndex;

            const scriptNode =
                parseSequence(
                    script.content
                );

            if (operator === "^") {
                if (superscript !== null) {
                    throw new Error(
                        "An element cannot have two superscripts."
                    );
                }

                superscript =
                    scriptNode;
            } else {
                if (subscript !== null) {
                    throw new Error(
                        "An element cannot have two subscripts."
                    );
                }

                subscript =
                    scriptNode;
            }
        }

        /*
         * No scripts.
         */
        if (
            subscript === null &&
            superscript === null
        ) {
            children.push(base);
            continue;
        }

        /*
         * Create one ScriptNode around the base.
         */
        children.push({
            type: "script",
            base,
            subscript,
            superscript
        });
    }

    return {
        type: "sequence",
        children
    };

    /*
     * Skip whitespace after commands such as \frac.
     */
    function skipWhitespace(): void {
        while (
            index < expression.length &&
            /\s/.test(expression[index])
        ) {
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

    for (
        let index = startIndex;
        index < expression.length;
        index++
    ) {
        const character =
            expression[index];

        if (character === "{") {
            depth++;
            continue;
        }

        if (character === "}") {
            depth--;

            if (depth === 0) {
                return {
                    content: expression.slice(
                        startIndex + 1,
                        index
                    ),

                    nextIndex:
                        index + 1
                };
            }
        }
    }

    throw new Error(
        "Unclosed { in equation."
    );
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

    for (
        let index = startIndex;
        index < expression.length;
        index++
    ) {
        const character =
            expression[index];

        if (character === "[") {
            depth++;
            continue;
        }

        if (character === "]") {
            depth--;

            if (depth === 0) {
                return {
                    content: expression.slice(
                        startIndex + 1,
                        index
                    ),

                    nextIndex:
                        index + 1
                };
            }
        }
    }

    throw new Error(
        "Unclosed [ in radical degree."
    );
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
    if (
        expression[startIndex] === "{"
    ) {
        return readGroup(
            expression,
            startIndex
        );
    }

    if (
        startIndex >= expression.length ||
        expression[startIndex] === "}"
    ) {
        throw new Error(
            "Missing script content."
        );
    }

    return {
        content:
            expression[startIndex],

        nextIndex:
            startIndex + 1
    };
}