import type {
    MathNode,
    SequenceNode,
    TextNode
} from "./equationModel";

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
    

};

const NARY_COMMANDS: Record<string, string> = {
    "\\int": "∫",
    "\\oint": "∮",
    "\\sum": "∑",
    "\\prod": "∏",
    "\\bigcup": "⋃",
    "\\bigcap": "⋂"
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
    "\\Vert"
    
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
    "\\inf": "inf"
};

const STYLE_COMMANDS: Record<
    string,
    "bold" | "roman" | "italic"
> = {
    "\\mathbf": "bold",
    "\\mathrm": "roman",
    "\\mathit": "italic"
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

function parseStyle(
    expression: string,
    startIndex: number
): {
    node: MathNode;
    nextIndex: number;
} {
    const command =
        readCommand(
            expression,
            startIndex
        );

    if (!command) {
        throw new Error(
            `Invalid style command near position ${startIndex}.`
        );
    }

    const style =
        STYLE_COMMANDS[
            command.command
        ];

    if (!style) {
        throw new Error(
            `Unsupported style command: ${command.command}`
        );
    }

    let index =
        command.nextIndex;

    while (
        index < expression.length &&
        /\s/.test(
            expression[index] ?? ""
        )
    ) {
        index++;
    }

    if (
        expression[index] !== "{"
    ) {
        throw new Error(
            `${command.command} requires a grouped argument.`
        );
    }

    const group =
        readGroup(
            expression,
            index
        );

    return {
        node: {
            type: "style",
            style,
            content:
                parseSequence(
                    group.content
                )
        },

        nextIndex:
            group.nextIndex
    };
}

function parseFunction(
    expression: string,
    startIndex: number
): {
    node: MathNode;
    nextIndex: number;
} {
    const command = readCommand(
        expression,
        startIndex
    );

    if (!command) {
        throw new Error(
            `Invalid function near position ${startIndex}.`
        );
    }

    const functionName =
        FUNCTION_COMMANDS[command.command];

    const isInverseTrig =
    command.command === "\\arcsin" ||
    command.command === "\\arccos" ||
    command.command === "\\arctan";

    if (!functionName) {
        throw new Error(
            `Unsupported function: ${command.command}`
        );
    }

    let index = command.nextIndex;

    // Ignore spaces after the function name.
    while (
        index < expression.length &&
        /\s/.test(expression[index] ?? "")
    ) {
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
        value: "-1"
    };
}

    while (
        index < expression.length &&
        (
            expression[index] === "^" ||
            expression[index] === "_"
        )
    ) {
        const marker = expression[index];

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

        if (marker === "^") {
            if (superscript !== null) {
                throw new Error(
                    "A function cannot have two superscripts."
                );
            }

            superscript =
                scriptNode;
        } else {
            if (subscript !== null) {
                throw new Error(
                    "A function cannot have two subscripts."
                );
            }

            subscript =
                scriptNode;
        }

        // Allow spaces between the script and argument.
        while (
            index < expression.length &&
            /\s/.test(expression[index] ?? "")
        ) {
            index++;
        }
    }

    /*
     * A function still needs an argument.
     */
    if (index >= expression.length) {
        throw new Error(
            `${command.command} requires an argument.`
        );
    }

    let argument: MathNode;

    /*
     * -----------------------------------------------------
     * \sin{x^2+1}
     * -----------------------------------------------------
     */
    if (expression[index] === "{") {
        const group =
            readGroup(
                expression,
                index
            );

        argument =
            parseSequence(
                group.content
            );

        index =
            group.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * \sin\left(x\right)
     * -----------------------------------------------------
     */
    else if (
        expression.startsWith(
            "\\left",
            index
        )
    ) {
        const delimiter =
            parseDelimiter(
                expression,
                index
            );

        argument =
            delimiter.node;

        index =
            delimiter.nextIndex;
    }

    /*
     * -----------------------------------------------------
     * \sin x
     *
     * Read one mathematical atom.
     *
     * \sin x^2
     * means:
     *
     * sin(x²)
     * -----------------------------------------------------
     */
    else {
        const atom =
            readSingleAtom(
                expression,
                index
            );

        argument =
            atom.node;

        index =
            atom.nextIndex;

        /*
         * Scripts here belong to the ARGUMENT,
         * not to the function.
         *
         * \sin x^2
         *       ^
         *       |
         *       argument script
         */

        let argumentSubscript:
            MathNode | null = null;

        let argumentSuperscript:
            MathNode | null = null;

        while (
            index < expression.length &&
            (
                expression[index] === "^" ||
                expression[index] === "_"
            )
        ) {
            const marker =
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

            if (marker === "^") {
                if (
                    argumentSuperscript !== null
                ) {
                    throw new Error(
                        "An argument cannot have two superscripts."
                    );
                }

                argumentSuperscript =
                    scriptNode;
            } else {
                if (
                    argumentSubscript !== null
                ) {
                    throw new Error(
                        "An argument cannot have two subscripts."
                    );
                }

                argumentSubscript =
                    scriptNode;
            }
        }

        if (
            argumentSubscript !== null ||
            argumentSuperscript !== null
        ) {
            argument = {
                type: "script",
                base: argument,
                subscript:
                    argumentSubscript,
                superscript:
                    argumentSuperscript
            };
        }
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
            superscript
        },

        nextIndex: index
    };
}

function parseMatrixEnvironment(
    expression: string,
    startIndex: number
): {
    node: MathNode;
    nextIndex: number;
} {
    const remaining =
        expression.slice(startIndex);

    const beginMatch = remaining.match(
    /^\\begin\{(matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|cases)\}/
);

    if (!beginMatch) {
        throw new Error(
            `Invalid matrix environment near position ${startIndex}.`
        );
    }

    const environment =
        beginMatch[1] as
            | "matrix"
            | "pmatrix"
            | "bmatrix"
            | "Bmatrix"
            | "vmatrix"
            | "Vmatrix"
            | "cases";

    const bodyStart =
        startIndex + beginMatch[0].length;

    const endToken =
        `\\end{${environment}}`;

    const endIndex =
        expression.indexOf(
            endToken,
            bodyStart
        );

    if (endIndex === -1) {
        throw new Error(
            `Missing ${endToken}.`
        );
    }

    const body =
        expression.slice(
            bodyStart,
            endIndex
        );

    /*
     * Matrix syntax:
     *
     * &  = next column
     * \\ = next row
     */
    const rows = body
        .split(/\\\\/)
        .map((row) =>
            row
                .split("&")
                .map((cell) => cell.trim())
        );

    if (rows.length === 0) {
        throw new Error(
            "Matrix must contain at least one row."
        );
    }

    if (environment === "cases") {
    if (rows.length === 0) {
        throw new Error(
            "Cases must contain at least one row."
        );
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
            expression:
                parseSequence(row[0]),
            condition:
                parseSequence(row[1])
        }))
    };

    return {
        node: casesNode,
        nextIndex:
            endIndex + endToken.length
    };
}

    const columnCount =
        rows[0].length;

    if (columnCount === 0) {
        throw new Error(
            "Matrix must contain at least one column."
        );
    }

    for (const row of rows) {
        if (row.length !== columnCount) {
            throw new Error(
                "All matrix rows must have the same number of columns."
            );
        }
    }

    const matrixNode: MathNode = {
        type: "matrix",
        environment,
        rows: rows.map((row) =>
            row.map((cell) =>
                parseSequence(cell)
            )
        )
    };

    return {
        node: matrixNode,
        nextIndex:
            endIndex + endToken.length
    };
}

function readDelimiterToken(
    expression: string,
    startIndex: number
): {
    token: string;
    nextIndex: number;
} {
    const remaining =
        expression.slice(startIndex);

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
        { input: "\\Vert", output: "‖" }
    ];

    for (const delimiter of namedDelimiters) {
        if (remaining.startsWith(delimiter.input)) {
            return {
                token: delimiter.output,
                nextIndex:
                    startIndex +
                    delimiter.input.length
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
            nextIndex: startIndex + 2
        };
    }

    if (remaining.startsWith("\\}")) {
        return {
            token: "}",
            nextIndex: startIndex + 2
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
            nextIndex: startIndex + 2
        };
    }

    const character =
        expression[startIndex];

    const simpleDelimiters:
        Record<string, string> = {
        "(": "(",
        ")": ")",
        "[": "[",
        "]": "]",
        "|": "|",
        "<": "⟨",
        ">": "⟩",
        ".": ""
    };

    if (
        Object.prototype.hasOwnProperty.call(
            simpleDelimiters,
            character
        )
    ) {
        return {
            token:
                simpleDelimiters[character],
            nextIndex:
                startIndex + 1
        };
    }

    throw new Error(
        `Unsupported delimiter near position ${startIndex}.`
    );
}

function parseDelimiter(
    expression: string,
    startIndex: number
): {
    node: MathNode;
    nextIndex: number;
} {
    let index =
        startIndex + "\\left".length;

    while (
        index < expression.length &&
        /\s/.test(expression[index])
    ) {
        index++;
    }

    const begin =
        readDelimiterToken(
            expression,
            index
        );

    index =
        begin.nextIndex;

    const contentStart =
        index;

    let depth = 1;

    while (index < expression.length) {
        /*
         * Nested \left...\right
         */
        if (
            expression.startsWith(
                "\\left",
                index
            )
        ) {
            depth++;
            index += "\\left".length;
            continue;
        }

        if (
            expression.startsWith(
                "\\right",
                index
            )
        ) {
            depth--;

            if (depth === 0) {
                const content =
                    expression.slice(
                        contentStart,
                        index
                    );

                index +=
                    "\\right".length;

                while (
                    index < expression.length &&
                    /\s/.test(
                        expression[index]
                    )
                ) {
                    index++;
                }

                const end =
                    readDelimiterToken(
                        expression,
                        index
                    );

                return {
                    node: {
                        type: "delimiter",
                        begin: begin.token,
                        end: end.token,
                        content:
                            parseSequence(
                                content
                            )
                    },

                    nextIndex:
                        end.nextIndex
                };
            }

            index +=
                "\\right".length;

            continue;
        }

        index++;
    }

    throw new Error(
        "Missing matching \\right delimiter."
    );
}

function parseNary(
    expression: string,
    startIndex: number
): {
    node: MathNode;
    nextIndex: number;
} {
    const command =
        readCommand(
            expression,
            startIndex
        );

    if (!command) {
        throw new Error(
            "Invalid n-ary command."
        );
    }

    const operator =
        NARY_COMMANDS[command.command];

    if (!operator) {
        throw new Error(
            `Unsupported n-ary command: ${command.command}`
        );
    }

    let index =
        command.nextIndex;

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

    while (
        index < expression.length &&
        (
            expression[index] === "_" ||
            expression[index] === "^"
        )
    ) {
        const marker =
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

        if (marker === "_") {
            if (lower !== null) {
                throw new Error(
                    "An n-ary operator cannot have two lower limits."
                );
            }

            lower = scriptNode;
        } else {
            if (upper !== null) {
                throw new Error(
                    "An n-ary operator cannot have two upper limits."
                );
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
        throw new Error(
            `${command.command} is missing its body.`
        );
    }

    let body: MathNode;

    if (expression[index] === "{") {
        const group =
            readGroup(
                expression,
                index
            );

        body =
            parseSequence(
                group.content
            );

        index =
            group.nextIndex;
    } else {
        const bodyAtom =
            readSingleAtom(
                expression,
                index
            );

        body =
            bodyAtom.node;

        index =
            bodyAtom.nextIndex;

        /*
         * Allow a script directly on the body:
         *
         * \sum_{i=1}^{n} a_i
         */
        let subscript: MathNode | null = null;
        let superscript: MathNode | null = null;

        while (
            index < expression.length &&
            (
                expression[index] === "_" ||
                expression[index] === "^"
            )
        ) {
            const marker =
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

            if (marker === "_") {
                subscript =
                    scriptNode;
            } else {
                superscript =
                    scriptNode;
            }
        }

        if (
            subscript !== null ||
            superscript !== null
        ) {
            body = {
                type: "script",
                base: body,
                subscript,
                superscript
            };
        }
    }

    return {
        node: {
            type: "nary",
            operator,
            lower,
            upper,
            body
        },

        nextIndex: index
    };

    function skipWhitespace(): void {
        while (
            index < expression.length &&
            /\s/.test(expression[index])
        ) {
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
    const index = startIndex;

    /*
     * -----------------------------------------------------
     * GROUPED ATOM
     *
     * {x+1}
     * -----------------------------------------------------
     */
    if (expression[index] === "{") {
        const group =
            readGroup(
                expression,
                index
            );

        return {
            node:
                parseSequence(
                    group.content
                ),

            nextIndex:
                group.nextIndex
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

        while (
            endIndex < expression.length &&
            depth > 0
        ) {
            if (expression[endIndex] === "(") {
                depth++;
            } else if (
                expression[endIndex] === ")"
            ) {
                depth--;
            }

            endIndex++;
        }

        if (depth !== 0) {
            throw new Error(
                "Unmatched opening parenthesis."
            );
        }

        const content =
            expression.slice(
                index + 1,
                endIndex - 1
            );

        return {
            node: {
                type: "delimiter",
                begin: "(",
                end: ")",
                content:
                    parseSequence(
                        content
                    )
            },

            nextIndex: endIndex
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
        const command =
            readCommand(
                expression,
                index
            );

        if (!command) {
            throw new Error(
                `Invalid command near position ${index}.`
            );
        }

        const symbol =
            MATH_SYMBOLS[
                command.command
            ];

        if (symbol) {
            return {
                node: {
                    type: "text",
                    value: symbol
                },

                nextIndex:
                    command.nextIndex
            };
        }

        throw new Error(
            `Unsupported command inside function argument: ${command.command}`
        );
    }

    /*
     * -----------------------------------------------------
     * ORDINARY TEXT ATOM
     *
     * Read one character.
     * -----------------------------------------------------
     */
    if (
        index >= expression.length
    ) {
        throw new Error(
            "Expected a mathematical expression."
        );
    }

    return {
        node: {
            type: "text",
            value:
                expression[index]
        },

        nextIndex:
            index + 1
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
        if (expression[index] === "}") {
            break;
        }

        let base: MathNode;

        /*
 * -----------------------------------------------------
 * MATRIX ENVIRONMENT
 * -----------------------------------------------------
 */
if (
    expression.startsWith(
        "\\begin{matrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{pmatrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{bmatrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{Bmatrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{vmatrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{Vmatrix}",
        index
    ) ||
    expression.startsWith(
        "\\begin{cases}",
        index
    )

) {
    const matrix =
        parseMatrixEnvironment(
            expression,
            index
        );

    base = matrix.node;

    index =
        matrix.nextIndex;
}





        /*
         * -----------------------------------------------------
         * DYNAMIC DELIMITER
         * -----------------------------------------------------
         */
        else if (
            expression.startsWith(
                "\\left",
                index
            )
        ) {
            const delimiter =
                parseDelimiter(
                    expression,
                    index
                );

            base = delimiter.node;

            index =
                delimiter.nextIndex;
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
            const nary =
                parseNary(
                    expression,
                    index
                );

            base = nary.node;

            index =
                nary.nextIndex;
        }

        /*
         * -----------------------------------------------------
         * RADICAL
         *
         * \sqrt{x}
         * \sqrt[3]{x}
         * -----------------------------------------------------
         */
        else if (
            expression.startsWith(
                "\\sqrt",
                index
            )
        ) {
            index +=
                "\\sqrt".length;

            skipWhitespace();

            let degree: MathNode | null =
                null;

            if (expression[index] === "[") {
                const degreeGroup =
                    readSquareBracketGroup(
                        expression,
                        index
                    );

                degree =
                    parseSequence(
                        degreeGroup.content
                    );

                index =
                    degreeGroup.nextIndex;

                skipWhitespace();
            }

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
                radicand:
                    parseSequence(
                        radicandGroup.content
                    )
            };
        }

        /*
         * -----------------------------------------------------
         * FRACTION
         *
         * \frac{a}{b}
         * -----------------------------------------------------
         */
        else if (
            expression.startsWith(
                "\\frac",
                index
            )
        ) {
            index +=
                "\\frac".length;

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

                numerator:
                    parseSequence(
                        numeratorGroup.content
                    ),

                denominator:
                    parseSequence(
                        denominatorGroup.content
                    )
            };
        }

        /*
         * -----------------------------------------------------
         * GROUP
         *
         * {x+1}
         * -----------------------------------------------------
         */
        else if (
            expression[index] === "{"
        ) {
            const group =
                readGroup(
                    expression,
                    index
                );

            base =
                parseSequence(
                    group.content
                );

            index =
                group.nextIndex;
        }

        else if (
    expression[index] === "\\" &&
    Object.prototype.hasOwnProperty.call(
        STYLE_COMMANDS,
        readCommand(
            expression,
            index
        )?.command ?? ""
    )
) {
    const styleResult =
        parseStyle(
            expression,
            index
        );

    base =
        styleResult.node;

    index =
        styleResult.nextIndex;
}

        else if (
    expression[index] === "\\" && Object.prototype.hasOwnProperty.call(
        FUNCTION_COMMANDS,
        readCommand(
            expression,
            index
        )?.command ?? ""
    )
) {
    const functionResult =
        parseFunction(
            expression,
            index
        );

    base =
        functionResult.node;

    index =
        functionResult.nextIndex;
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
        else if (
    expression[index] === "\\"
) {
    const command =
        readCommand(
            expression,
            index
        );

    if (!command) {
        throw new Error(
            `Invalid command near position ${index}.`
        );
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
        index =
            command.nextIndex;

        while (
            index < expression.length &&
            /\s/.test(
                expression[index] ?? ""
            )
        ) {
            index++;
        }

        if (
            index >= expression.length
        ) {
            throw new Error(
                "\\not requires a symbol or relation."
            );
        }

        /*
         * Read the symbol after \not.
         */
        let nextCommand:
            {
                command: string;
                nextIndex: number;
            } | null = null;

        if (
            expression[index] === "\\"
        ) {
            nextCommand =
                readCommand(
                    expression,
                    index
                );
        }

        /*
         * Named commands such as:
         *
         * \not\in
         * \not\subset
         */
        if (nextCommand) {
            const negatedSymbols:
                Record<string, string> = {
                "\\in": "∉",
                "\\subset": "⊄",
                "\\subseteq": "⊈",
                "\\supset": "⊅",
                "\\supseteq": "⊉"
            };

            const negated =
                negatedSymbols[
                    nextCommand.command
                ];

            if (!negated) {
                throw new Error(
                    `Cannot negate command: ${nextCommand.command}`
                );
            }

            base = {
                type: "text",
                value: negated
            };

            index =
                nextCommand.nextIndex;
        }

        /*
         * Single-character relations:
         *
         * \not=
         * \not<
         * \not>
         */
        else {
            const character =
                expression[index];

            const negatedCharacters:
                Record<string, string> = {
                "=": "≠",
                "<": "≮",
                ">": "≯"
            };

            const negated =
                negatedCharacters[
                    character
                ];

            if (!negated) {
                throw new Error(
                    `Cannot negate symbol: ${character}`
                );
            }

            base = {
                type: "text",
                value: negated
            };

            index++;
        }
    }

    else {
        const symbol =
            MATH_SYMBOLS[
                command.command
            ];

        if (!symbol) {
            throw new Error(
                `Unsupported command: ${command.command}`
            );
        }

        base = {
            type: "text",
            value: symbol
        };

        index =
            command.nextIndex;
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
                throw new Error(
                    `Unexpected character '${expression[index]}' at position ${index}.`
                );
            }

            base = {
                type: "text",
                value: expression.slice(
                    start,
                    index
                )
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

while (
    index < expression.length &&
    (
        expression[index] === "^" ||
        expression[index] === "_"
    )
) {
    const marker = expression[index];

    index++;

    const script = readScript(
        expression,
        index
    );

    index = script.nextIndex;

    const scriptNode = parseSequence(
        script.content
    );

    if (marker === "^") {
        if (superscript !== null) {
            throw new Error(
                "An element cannot have two superscripts."
            );
        }

        superscript = scriptNode;
    } else {
        if (subscript !== null) {
            throw new Error(
                "An element cannot have two subscripts."
            );
        }

        subscript = scriptNode;
    }
}

if (
    subscript === null &&
    superscript === null
) {
    children.push(base);
    continue;
}

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

    function skipWhitespace(): void {
        while (
            index < expression.length &&
            /\s/.test(
                expression[index]
            )
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