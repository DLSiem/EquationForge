/**
 * EquationForge equation engine.
 *
 * This file is responsible for understanding our simple
 * mathematical input syntax and converting it into OMML.
 *
 * word.ts should not need to understand mathematical
 * structures directly.
 */

/**
 * LaTeX-style mathematical commands supported by EquationForge.
 *
 * The value is the Unicode character that Word will receive
 * inside the OMML math run.
 */
const MATH_COMMANDS: Record<string, string> = {
    // Greek letters
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
    "\\lambda": "λ",
    "\\mu": "μ",
    "\\nu": "ν",
    "\\xi": "ξ",
    "\\pi": "π",
    "\\varpi": "ϖ",
    "\\rho": "ρ",
    "\\sigma": "σ",
    "\\varsigma": "ς",
    "\\tau": "τ",
    "\\upsilon": "υ",
    "\\phi": "ϕ",
    "\\varphi": "φ",
    "\\chi": "χ",
    "\\psi": "ψ",
    "\\omega": "ω",

    // Capital Greek letters
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

    // Arithmetic operators
    "\\pm": "±",
    "\\mp": "∓",
    "\\times": "×",
    "\\div": "÷",
    "\\cdot": "·",

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

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Reads a LaTeX-style command beginning with "\".
 *
 * Example:
 *     \alpha
 *
 * returns:
 *     command = "\alpha"
 *     nextIndex = position after "alpha"
 */
function readCommand(
    expression: string,
    startIndex: number
): { command: string; nextIndex: number } | null {
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
        nextIndex: startIndex + match[0].length
    };
}

/**
 * Creates the WordprocessingML run properties used
 * inside an OMML mathematical run.
 */
function createRunProperties(
    fontName: string,
    fontSize: number
): string {
    const safeFont = escapeXml(fontName);

    // WordprocessingML font sizes are stored in half-points.
    const halfPointSize = Math.round(fontSize * 2);

    return `
        <m:rPr>
            <m:sty m:val="p"/>
        </m:rPr>

        <w:rPr>
            <w:rFonts
                w:ascii="${safeFont}"
                w:hAnsi="${safeFont}"
                w:eastAsia="${safeFont}"
                w:cs="${safeFont}"/>
            <w:sz w:val="${halfPointSize}"/>
            <w:szCs w:val="${halfPointSize}"/>
        </w:rPr>
    `;
}

/**
 * Creates one ordinary mathematical run.
 */
function createMathRun(
    text: string,
    fontName: string,
    fontSize: number
): string {
    return `
        <m:r>
            ${createRunProperties(fontName, fontSize)}
            <m:t xml:space="preserve">${escapeXml(text)}</m:t>
        </m:r>
    `;
}

/**
 * Creates an OMML fraction.
 *
 * Example:
 *
 * \frac{a}{b}
 *
 * becomes:
 *
 * <m:f>
 *     <m:num>...</m:num>
 *     <m:den>...</m:den>
 * </m:f>
 */
function createFraction(
    numerator: string,
    denominator: string,
    fontName: string,
    fontSize: number
): string {
    return `
        <m:f>
            <m:num>
                <m:e>
                    ${parseExpression(
                        numerator,
                        fontName,
                        fontSize
                    )}
                </m:e>
            </m:num>

            <m:den>
                <m:e>
                    ${parseExpression(
                        denominator,
                        fontName,
                        fontSize
                    )}
                </m:e>
            </m:den>
        </m:f>
    `;
}

/**
 * Creates an OMML square root or nth root.
 *
 * Square root:
 *     \sqrt{x}
 *
 * Nth root:
 *     \sqrt[n]{x}
 */
function createRadical(
    expression: string,
    degree: string | null,
    fontName: string,
    fontSize: number
): string {
    const degreeXml = degree
        ? `
            <m:deg>
                ${parseExpression(
                    degree,
                    fontName,
                    fontSize
                )}
            </m:deg>
        `
        : `
            <m:deg/>
        `;

    const radicalProperties = degree
        ? ""
        : `
            <m:radPr>
                <m:degHide m:val="1"/>
            </m:radPr>
        `;

    return `
        <m:rad>
            ${radicalProperties}

            ${degreeXml}

            <m:e>
                ${parseExpression(
                    expression,
                    fontName,
                    fontSize
                )}
            </m:e>
        </m:rad>
    `;
}
/**
 * Creates an OMML n-ary operator.
 *
 * Examples:
 *
 * \int_0^1 x
 * \sum_{i=1}^{n} i
 * \prod_{i=1}^{n} a_i
 */
function createNary(
    operator: string,
    lower: string | null,
    upper: string | null,
    expressionXml: string,
    fontName: string,
    fontSize: number
): string {
    const safeFont = escapeXml(fontName);
    const halfPointSize = Math.round(fontSize * 2);

    const lowerXml =
        lower !== null
            ? `
                <m:sub>
                    ${parseExpression(
                        lower,
                        fontName,
                        fontSize
                    )}
                </m:sub>
            `
            : "";

    const upperXml =
        upper !== null
            ? `
                <m:sup>
                    ${parseExpression(
                        upper,
                        fontName,
                        fontSize
                    )}
                </m:sup>
            `
            : "";

    return `
        <m:nary>
            <m:naryPr>

                <m:chr m:val="${escapeXml(operator)}"/>

                <!--
                    The n-ary operator itself (∫, ∑, ∏, etc.)
                    is a control character, so its font must
                    be specified through m:ctrlPr.
                -->
                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${safeFont}"
                            w:hAnsi="${safeFont}"
                            w:eastAsia="${safeFont}"
                            w:cs="${safeFont}" />

                        <w:sz w:val="${halfPointSize}" />
                        <w:szCs w:val="${halfPointSize}" />
                    </w:rPr>
                </m:ctrlPr>

                <m:limLoc m:val="subSup"/>

                <m:grow m:val="1"/>

            </m:naryPr>

            ${lowerXml}

            ${upperXml}

            <m:e>
                ${expressionXml}
            </m:e>

        </m:nary>
    `;
}
/**
 * Read one group:
 *
 * {abc}
 *
 * returns:
 *   content = abc
 *   nextIndex = position after }
 *
 * If there is no {}, a single character is returned.
 */


function readScriptContent(
    expression: string,
    startIndex: number
): { content: string; nextIndex: number } {
    if (expression[startIndex] === "{") {
        let depth = 0;

        for (
            let index = startIndex;
            index < expression.length;
            index++
        ) {
            const character = expression[index];

            if (character === "{") {
                depth++;
            } else if (character === "}") {
                depth--;

                if (depth === 0) {
                    return {
                        content: expression.slice(
                            startIndex + 1,
                            index
                        ),
                        nextIndex: index + 1,
                    };
                }
            }
        }

        throw new Error("Unclosed { in equation.");
    }

    if (startIndex >= expression.length) {
        throw new Error("Missing script content.");
    }

    return {
        content: expression[startIndex],
        nextIndex: startIndex + 1,
    };
}

/**
 * Reads a limited/subscripted n-ary expression.
 *
 * Example:
 *
 *     \int_0^1 x
 *
 * The result contains:
 *     lower = "0"
 *     upper = "1"
 *     expression = "x"
 */
function readNaryExpression(
    expression: string,
    startIndex: number,
    fontName: string,
    fontSize: number
): {
    lower: string | null;
    upper: string | null;
    expression: string;
    nextIndex: number;
} {
    let index = startIndex;

    let lower: string | null = null;
    let upper: string | null = null;

    while (
        index < expression.length &&
        (expression[index] === "_" ||
            expression[index] === "^")
    ) {
        const operator = expression[index];
        index++;

        const script = readScriptContent(
            expression,
            index
        );

        index = script.nextIndex;

        if (operator === "_") {
            if (lower !== null) {
                throw new Error(
                    "An n-ary operator cannot have two lower limits."
                );
            }

            lower = script.content;
        } else {
            if (upper !== null) {
                throw new Error(
                    "An n-ary operator cannot have two upper limits."
                );
            }

            upper = script.content;
        }
    }

    /*
     * We currently bind the n-ary operator to the next
     * mathematical atom, including its own subscript/
     * superscript.
     *
     * Example:
     *
     * \int_0^1 x^2
     *
     * becomes:
     *
     * Integral
     * └── x^2
     */

    if (index >= expression.length) {
        throw new Error(
            "The n-ary operator is missing its expression."
        );
    }

    const base = readBase(
        expression,
        index,
        fontName,
        fontSize
    );

    index = base.nextIndex;

    let subscript: string | null = null;
    let superscript: string | null = null;

    while (
        index < expression.length &&
        (expression[index] === "_" ||
            expression[index] === "^")
    ) {
        const operator = expression[index];
        index++;

        const script = readScriptContent(
            expression,
            index
        );

        index = script.nextIndex;

        if (operator === "_") {
            if (subscript !== null) {
                throw new Error(
                    "The expression cannot have two subscripts."
                );
            }

            subscript = script.content;
        } else {
            if (superscript !== null) {
                throw new Error(
                    "The expression cannot have two superscripts."
                );
            }

            superscript = script.content;
        }
    }

    let expressionXml = base.omml;

    if (
        subscript !== null &&
        superscript !== null
    ) {
        expressionXml = `
            <m:sSubSup>
                <m:e>
                    ${base.omml}
                </m:e>

                <m:sub>
                    ${parseExpression(
                        subscript,
                        fontName,
                        fontSize
                    )}
                </m:sub>

                <m:sup>
                    ${parseExpression(
                        superscript,
                        fontName,
                        fontSize
                    )}
                </m:sup>
            </m:sSubSup>
        `;
    } else if (superscript !== null) {
        expressionXml = `
            <m:sSup>
                <m:e>
                    ${base.omml}
                </m:e>

                <m:sup>
                    ${parseExpression(
                        superscript,
                        fontName,
                        fontSize
                    )}
                </m:sup>
            </m:sSup>
        `;
    } else if (subscript !== null) {
        expressionXml = `
            <m:sSub>
                <m:e>
                    ${base.omml}
                </m:e>

                <m:sub>
                    ${parseExpression(
                        subscript,
                        fontName,
                        fontSize
                    )}
                </m:sub>
            </m:sSub>
        `;
    }

    return {
        lower,
        upper,
        expression: expressionXml,
        nextIndex: index
    };
}

/**
 * Reads the next base element.
 *
 * Examples:
 *
 * x
 * {
 *   x+1
 * }
 */
function readBase(
    expression: string,
    startIndex: number,
    fontName: string,
    fontSize: number
): { omml: string; nextIndex: number } {
    if (expression[startIndex] === "{") {
        const group = readScriptContent(expression, startIndex);

        return {
            omml: parseExpression(
                group.content,
                fontName,
                fontSize
            ),
            nextIndex: group.nextIndex,
        };
    }

    return {
        omml: createMathRun(
            expression[startIndex],
            fontName,
            fontSize
        ),
        nextIndex: startIndex + 1,
    };
}

/**
 * Converts a normal mathematical expression into OMML.
 *
 * At this stage the parser understands:
 *
 *   x
 *   x^2
 *   x_1
 *   x_1^2
 *   x^{n+1}
 *   x_{i+1}
 */
function parseExpression(
    expression: string,
    fontName: string,
    fontSize: number
): string {
    let result = "";
    let index = 0;

    while (index < expression.length) {
        const character = expression[index];

        // Stop when a grouped expression reaches its closing brace.
        if (character === "}") {
            break;
        }

        /*
 * ---------------------------------------------------------
 * N-ARY OPERATORS
 *
 * \int
 * \sum
 * \prod
 * \oint
 * \bigcup
 * \bigcap
 * ---------------------------------------------------------
 */
if (
    expression.startsWith("\\int", index) ||
    expression.startsWith("\\sum", index) ||
    expression.startsWith("\\prod", index) ||
    expression.startsWith("\\oint", index) ||
    expression.startsWith("\\bigcup", index) ||
    expression.startsWith("\\bigcap", index)
) {
    let command: string;

    if (expression.startsWith("\\oint", index)) {
        command = "\\oint";
    } else if (expression.startsWith("\\int", index)) {
        command = "\\int";
    } else if (expression.startsWith("\\sum", index)) {
        command = "\\sum";
    } else if (expression.startsWith("\\prod", index)) {
        command = "\\prod";
    } else if (expression.startsWith("\\bigcup", index)) {
        command = "\\bigcup";
    } else {
        command = "\\bigcap";
    }

    index += command.length;

    const operatorMap: Record<string, string> = {
        "\\int": "∫",
        "\\sum": "∑",
        "\\prod": "∏",
        "\\oint": "∮",
        "\\bigcup": "⋃",
        "\\bigcap": "⋂"
    };

    const nary = readNaryExpression(
        expression,
        index,
        fontName,
        fontSize
    );

    index = nary.nextIndex;

    result += createNary(
        operatorMap[command],
        nary.lower,
        nary.upper,
        nary.expression,
        fontName,
        fontSize
    );

    continue;
}

        /*
 * ---------------------------------------------------------
 * GENERAL MATHEMATICAL COMMANDS
 *
 * Examples:
 * \alpha
 * \beta
 * \times
 * \neq
 * \infty
 * ---------------------------------------------------------
 */
const commandToken = readCommand(
    expression,
    index
);

if (commandToken) {
    /*
     * Special structural commands such as \frac and \sqrt
     * must be handled by their own parser sections.
     */
    if (
        commandToken.command !== "\\frac" &&
        commandToken.command !== "\\sqrt"
    ) {
        const symbol =
            MATH_COMMANDS[commandToken.command];

        if (!symbol) {
            throw new Error(
                `Unsupported mathematical command: ${commandToken.command}`
            );
        }

        result += createMathRun(
            symbol,
            fontName,
            fontSize
        );

        index = commandToken.nextIndex;

        continue;
    }
}

        /*
 * ---------------------------------------------------------
 * RADICAL
 *
 * \sqrt{x}
 * \sqrt[n]{x}
 * ---------------------------------------------------------
 */
if (expression.startsWith("\\sqrt", index)) {
    index += "\\sqrt".length;

    // Allow spaces after \sqrt.
    while (
        index < expression.length &&
        /\s/.test(expression[index])
    ) {
        index++;
    }

    let degree: string | null = null;

    /*
     * Optional degree:
     *
     * \sqrt[n]{x}
     */
    if (expression[index] === "[") {
        const closingBracket =
            expression.indexOf("]", index + 1);

        if (closingBracket === -1) {
            throw new Error(
                "\\sqrt has an unclosed degree [ ]."
            );
        }

        degree = expression.slice(
            index + 1,
            closingBracket
        );

        index = closingBracket + 1;

        while (
            index < expression.length &&
            /\s/.test(expression[index])
        ) {
            index++;
        }
    }

    /*
     * The radicand must be enclosed in { }.
     */
    if (expression[index] !== "{") {
        throw new Error(
            "\\sqrt requires an expression in { }."
        );
    }

    const radicand = readScriptContent(
        expression,
        index
    );

    index = radicand.nextIndex;

    result += createRadical(
        radicand.content,
        degree,
        fontName,
        fontSize
    );

    continue;
}

        /*
         * ---------------------------------------------------------
         * FRACTION
         *
         * \frac{numerator}{denominator}
         * ---------------------------------------------------------
         */
        if (expression.startsWith("\\frac", index)) {
            index += "\\frac".length;

            // Allow spaces between \frac and the first group.
            while (
                index < expression.length &&
                /\s/.test(expression[index])
            ) {
                index++;
            }

            if (expression[index] !== "{") {
                throw new Error(
                    "\\frac requires a numerator in { }."
                );
            }

            const numerator = readScriptContent(
                expression,
                index
            );

            index = numerator.nextIndex;

            // Allow spaces before the denominator.
            while (
                index < expression.length &&
                /\s/.test(expression[index])
            ) {
                index++;
            }

            if (expression[index] !== "{") {
                throw new Error(
                    "\\frac requires a denominator in { }."
                );
            }

            const denominator = readScriptContent(
                expression,
                index
            );

            index = denominator.nextIndex;

            result += createFraction(
                numerator.content,
                denominator.content,
                fontName,
                fontSize
            );

            continue;
        }

        /*
         * ---------------------------------------------------------
         * SCRIPT MARKERS CANNOT APPEAR BY THEMSELVES
         * ---------------------------------------------------------
         */
        if (character === "^" || character === "_") {
            throw new Error(
                `Unexpected '${character}' at position ${index}.`
            );
        }

        /*
         * ---------------------------------------------------------
         * READ THE BASE ELEMENT
         * ---------------------------------------------------------
         */
        const base = readBase(
            expression,
            index,
            fontName,
            fontSize
        );

        index = base.nextIndex;

        let subscript: string | null = null;
        let superscript: string | null = null;

        /*
         * ---------------------------------------------------------
         * READ SUBSCRIPT / SUPERSCRIPT
         *
         * x^2
         * x_1
         * x_1^2
         * x^2_1
         * ---------------------------------------------------------
         */
        while (
            index < expression.length &&
            (expression[index] === "^" ||
                expression[index] === "_")
        ) {
            const operator = expression[index];

            index++;

            const script = readScriptContent(
                expression,
                index
            );

            index = script.nextIndex;

            if (operator === "^") {
                if (superscript !== null) {
                    throw new Error(
                        "An element cannot have two superscripts."
                    );
                }

                superscript = script.content;
            } else {
                if (subscript !== null) {
                    throw new Error(
                        "An element cannot have two subscripts."
                    );
                }

                subscript = script.content;
            }
        }

        /*
         * ---------------------------------------------------------
         * ORDINARY ELEMENT
         * ---------------------------------------------------------
         */
        if (
            subscript === null &&
            superscript === null
        ) {
            result += base.omml;
            continue;
        }

        /*
         * ---------------------------------------------------------
         * SUBSCRIPT + SUPERSCRIPT
         * ---------------------------------------------------------
         */
        if (
            subscript !== null &&
            superscript !== null
        ) {
            result += `
                <m:sSubSup>
                    <m:e>
                        ${base.omml}
                    </m:e>

                    <m:sub>
                        ${parseExpression(
                            subscript,
                            fontName,
                            fontSize
                        )}
                    </m:sub>

                    <m:sup>
                        ${parseExpression(
                            superscript,
                            fontName,
                            fontSize
                        )}
                    </m:sup>
                </m:sSubSup>
            `;

            continue;
        }

        /*
         * ---------------------------------------------------------
         * SUPERSCRIPT ONLY
         * ---------------------------------------------------------
         */
        if (superscript !== null) {
            result += `
                <m:sSup>
                    <m:e>
                        ${base.omml}
                    </m:e>

                    <m:sup>
                        ${parseExpression(
                            superscript,
                            fontName,
                            fontSize
                        )}
                    </m:sup>
                </m:sSup>
            `;

            continue;
        }

        /*
         * ---------------------------------------------------------
         * SUBSCRIPT ONLY
         * ---------------------------------------------------------
         */
        result += `
            <m:sSub>
                <m:e>
                    ${base.omml}
                </m:e>

                <m:sub>
                    ${parseExpression(
                        subscript!,
                        fontName,
                        fontSize
                    )}
                </m:sub>
            </m:sSub>
        `;
    }

    return result;
}

/**
 * Builds the complete OOXML package inserted by Office.js.
 */
export function buildEquationOoxml(
    equation: string,
    fontName: string,
    fontSize: number
): string {
    const mathContent = parseExpression(
        equation,
        fontName,
        fontSize
    );

    return `
        <pkg:package
            xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">

            <pkg:part
                pkg:name="/_rels/.rels"
                pkg:contentType="application/vnd.openxmlformats-package.relationships+xml"
                pkg:padding="512">

                <pkg:xmlData>

                    <Relationships
                        xmlns="http://schemas.openxmlformats.org/package/2006/relationships">

                        <Relationship
                            Id="rId1"
                            Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
                            Target="word/document.xml"/>

                    </Relationships>

                </pkg:xmlData>

            </pkg:part>

            <pkg:part
                pkg:name="/word/document.xml"
                pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">

                <pkg:xmlData>

                    <w:document
                        xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                        xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">

                        <w:body>

                            <w:p>

                                <m:oMathPara>

                                    <m:oMath>

                                        ${mathContent}

                                    </m:oMath>

                                </m:oMathPara>

                            </w:p>

                        </w:body>

                    </w:document>

                </pkg:xmlData>

            </pkg:part>

        </pkg:package>
    `;
}