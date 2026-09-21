/**
 * EquationForge equation engine.
 *
 * This file is responsible for understanding our simple
 * mathematical input syntax and converting it into OMML.
 *
 * word.ts should not need to understand mathematical
 * structures directly.
 */

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
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