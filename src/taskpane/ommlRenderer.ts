import type {
    MathNode,
    TextNode,
    SequenceNode,
    FractionNode,
    RadicalNode,
    ScriptNode,
    NaryNode,
    DelimiterNode,
    MatrixNode,
    FunctionNode,
    CasesNode,
    StyleNode
} from "./equationModel";



export interface MathRenderOptions {
    fontName: string;
    fontSize: number;
}

export class OmmlRenderer {
    constructor(
        private readonly options: MathRenderOptions
    ) {}

    public render(node: MathNode): string {
        switch (node.type) {
    case "text":
        return this.renderText(node);

    case "sequence":
        return this.renderSequence(node);

    case "fraction":
        return this.renderFraction(node);

    case "radical":
        return this.renderRadical(node);

    case "script":
        return this.renderScript(node);

    case "nary":
        return this.renderNary(node);

    case "delimiter":
        return this.renderDelimiter(node);

    case "matrix":
        return this.renderMatrix(node);

    case "function":
        return this.renderFunction(node);

    case "cases":
        return this.renderCases(node);
    case "style":
        return this.renderStyle(node);
    
   
    default:
        return assertNever(node);
}
    }

  
    private renderFunction(
    node: FunctionNode
): string {
    const font =
        escapeXml(this.options.fontName);

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const functionRun = `
        <m:r>
            <m:rPr>
                <m:scr m:val="roman"/>
                <m:sty m:val="p"/>
            </m:rPr>

            <w:rPr>
                <w:rFonts
                    w:ascii="${font}"
                    w:hAnsi="${font}"
                    w:eastAsia="${font}"
                    w:cs="${font}"/>
                <w:sz w:val="${size}"/>
                <w:szCs w:val="${size}"/>
            </w:rPr>

            <m:t>${escapeXml(node.name)}</m:t>
        </m:r>
    `;

    let functionName = functionRun;

    /*
     * Function superscript/subscript
     *
     * sin²
     * sin₁
     * sin₁²
     */
    if (
        node.subscript !== null &&
        node.superscript !== null
    ) {
        functionName = `
            <m:sSubSup>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sub>
                    ${this.render(
                        node.subscript
                    )}
                </m:sub>
                <m:sup>
                    ${this.render(
                        node.superscript
                    )}
                </m:sup>
            </m:sSubSup>
        `;
    } else if (
        node.subscript !== null
    ) {
        functionName = `
            <m:sSub>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sub>
                    ${this.render(
                        node.subscript
                    )}
                </m:sub>
            </m:sSub>
        `;
    } else if (
        node.superscript !== null
    ) {
        functionName = `
            <m:sSup>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sup>
                    ${this.render(
                        node.superscript
                    )}
                </m:sup>
            </m:sSup>
        `;
    }

    return `
        <m:func>
            <m:fName>
                ${functionName}
            </m:fName>

            <m:e>
                ${this.renderFunctionArgument(
                    node.argument
                )}
            </m:e>
        </m:func>
    `;
}

    private renderText(
    node: TextNode,
    style: "bold" | "roman" | "italic" = "roman"
): string {
    const font =
        escapeXml(this.options.fontName);

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const bold =
        style === "bold"
            ? `
                <w:b/>
                <w:bCs/>
            `
            : "";

    const italic =
        style === "italic"
            ? `
                <w:i/>
                <w:iCs/>
            `
            : "";

    return `
        <m:r>
            <m:rPr>
                <m:sty m:val="p"/>
            </m:rPr>

            <w:rPr>
                <w:rFonts
                    w:ascii="${font}"
                    w:hAnsi="${font}"
                    w:eastAsia="${font}"
                    w:cs="${font}"/>

                ${bold}
                ${italic}

                <w:sz w:val="${size}"/>
                <w:szCs w:val="${size}"/>
            </w:rPr>

            <m:t>${escapeXml(node.value)}</m:t>
        </m:r>
    `.trim();
}


private renderStyle(
    node: StyleNode
): string {
    return this.renderWithStyle(
        node.content,
        node.style
    );
}


    private renderFunctionArgument(
    argument: MathNode
): string {
    /*
     * Explicit parentheses/delimiters are already
     * represented by the AST.
     */
    if (
        argument.type === "delimiter"
    ) {
        return this.render(argument);
    }

    /*
     * A multi-term sequence should be grouped
     * visually when used as a function argument.
     *
     * Example:
     *
     * \sin{x+a}
     *
     * becomes:
     *
     * sin(x+a)
     */
    if (
        argument.type === "sequence" &&
        argument.children.length > 1
    ) {
        return `
            <m:d>
                <m:dPr>
                    <m:begChr m:val="("/>
                    <m:endChr m:val=")"/>
                    <m:sepChr m:val=","/>
                </m:dPr>

                <m:e>
                    ${this.render(argument)}
                </m:e>
            </m:d>
        `;
    }

    return this.render(argument);
}

    private renderSequence(
        node: SequenceNode
    ): string {
        return node.children
            .map((child) => this.render(child))
            .join("");
    }

    private renderFraction(
        node: FractionNode
    ): string {
        return `
            <m:f>
                <m:num>
                    <m:e>
                        ${this.render(
                            node.numerator
                        )}
                    </m:e>
                </m:num>

                <m:den>
                    <m:e>
                        ${this.render(
                            node.denominator
                        )}
                    </m:e>
                </m:den>
            </m:f>
        `;
    }

    private renderFractionWithStyle(
    node: FractionNode,
    style: "bold" | "roman" | "italic"
): string {
    return `
        <m:f>
            <m:num>
                <m:e>
                    ${this.renderWithStyle(
                        node.numerator,
                        style
                    )}
                </m:e>
            </m:num>

            <m:den>
                <m:e>
                    ${this.renderWithStyle(
                        node.denominator,
                        style
                    )}
                </m:e>
            </m:den>
        </m:f>
    `;
}



    private renderRadical(
        node: RadicalNode
    ): string {
        const degree = node.degree
            ? `
                <m:deg>
                    ${this.render(node.degree)}
                </m:deg>
            `
            : `
                <m:deg/>
            `;

        const degreeProperties = node.degree
            ? ""
            : `
                <m:radPr>
                    <m:degHide m:val="1"/>
                </m:radPr>
            `;

        return `
            <m:rad>
                ${degreeProperties}

                ${degree}

                <m:e>
                    ${this.render(
                        node.radicand
                    )}
                </m:e>
            </m:rad>
        `;
    }

    private renderRadicalWithStyle(
    node: RadicalNode,
    style: "bold" | "roman" | "italic"
): string {
    const degree = node.degree
        ? `
            <m:deg>
                ${this.renderWithStyle(
                    node.degree,
                    style
                )}
            </m:deg>
        `
        : `
            <m:deg/>
        `;

    const degreeProperties = node.degree
        ? ""
        : `
            <m:radPr>
                <m:degHide m:val="1"/>
            </m:radPr>
        `;

    return `
        <m:rad>
            ${degreeProperties}

            ${degree}

            <m:e>
                ${this.renderWithStyle(
                    node.radicand,
                    style
                )}
            </m:e>
        </m:rad>
    `;
}

    private renderScript(
        node: ScriptNode
    ): string {
        const base = this.render(node.base);

        if (
            node.subscript &&
            node.superscript
        ) {
            return `
                <m:sSubSup>
                    <m:e>
                        ${base}
                    </m:e>

                    <m:sub>
                        ${this.render(
                            node.subscript
                        )}
                    </m:sub>

                    <m:sup>
                        ${this.render(
                            node.superscript
                        )}
                    </m:sup>
                </m:sSubSup>
            `;
        }

        if (node.superscript) {
            return `
                <m:sSup>
                    <m:e>
                        ${base}
                    </m:e>

                    <m:sup>
                        ${this.render(
                            node.superscript
                        )}
                    </m:sup>
                </m:sSup>
            `;
        }

        if (node.subscript) {
            return `
                <m:sSub>
                    <m:e>
                        ${base}
                    </m:e>

                    <m:sub>
                        ${this.render(
                            node.subscript
                        )}
                    </m:sub>
                </m:sSub>
            `;
        }

        return base;
    }



    private renderWithStyle(
    node: MathNode,
    style: "bold" | "roman" | "italic"
): string {
    switch (node.type) {
        case "text":
            return this.renderText(
                node,
                style
            );

        case "sequence":
            return node.children
                .map((child) =>
                    this.renderWithStyle(
                        child,
                        style
                    )
                )
                .join("");
        case "fraction":
    return this.renderFractionWithStyle(
        node,
        style
    );
        case "radical":
    return this.renderRadicalWithStyle(
        node,
        style
    );

        case "matrix":
    return this.renderMatrixWithStyle(
        node,
        style

    );

        case "cases":
    return this.renderCasesWithStyle(
        node,
        style
    );

        case "script": {
            const base =
                this.renderWithStyle(
                    node.base,
                    style
                );

            const sub =
                node.subscript
                    ? this.renderWithStyle(
                        node.subscript,
                        style
                    )
                    : null;

            const sup =
                node.superscript
                    ? this.renderWithStyle(
                        node.superscript,
                        style
                    )
                    : null;

            if (sub && sup) {
                return `
                    <m:sSubSup>
                        <m:e>${base}</m:e>
                        <m:sub>${sub}</m:sub>
                        <m:sup>${sup}</m:sup>
                    </m:sSubSup>
                `;
            }

            if (sup) {
                return `
                    <m:sSup>
                        <m:e>${base}</m:e>
                        <m:sup>${sup}</m:sup>
                    </m:sSup>
                `;
            }

            if (sub) {
                return `
                    <m:sSub>
                        <m:e>${base}</m:e>
                        <m:sub>${sub}</m:sub>
                    </m:sSub>
                `;
            }

            return base;
        }

        

        default:
            return this.render(node);
    }
}

    private renderNary(
        node: NaryNode
    ): string {
        const font =
            escapeXml(this.options.fontName);

        const size = Math.round(
            this.options.fontSize * 2
        );

        const lower =
            node.lower
                ? `
                    <m:sub>
                        ${this.render(
                            node.lower
                        )}
                    </m:sub>
                `
                : "";

        const upper =
            node.upper
                ? `
                    <m:sup>
                        ${this.render(
                            node.upper
                        )}
                    </m:sup>
                `
                : "";

        return `
            <m:nary>
                <m:naryPr>
                    <m:chr
                        m:val="${escapeXml(node.operator)}"/>

                    <m:ctrlPr>
                        <w:rPr>
                            <w:rFonts
                                w:ascii="${font}"
                                w:hAnsi="${font}"
                                w:eastAsia="${font}"
                                w:cs="${font}"/>

                            <w:sz w:val="${size}"/>
                            <w:szCs w:val="${size}"/>
                        </w:rPr>
                    </m:ctrlPr>

                    <m:limLoc m:val="subSup"/>
                    <m:grow m:val="1"/>
                </m:naryPr>

                ${lower}
                ${upper}

                <m:e>
                    ${this.render(node.body)}
                </m:e>
            </m:nary>
        `;
    }

    private renderDelimiter(
    node: DelimiterNode
): string {
    const font =
        escapeXml(this.options.fontName);

    const size = Math.round(
        this.options.fontSize * 2
    );

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(
                        node.begin
                    )}"/>

                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>

                <m:endChr
                    m:val="${escapeXml(
                        node.end
                    )}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${this.render(
                    node.content
                )}
            </m:e>

        </m:d>
    `;
}
    private renderCases(
    node: CasesNode
): string {
    const font =
        escapeXml(this.options.fontName);

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const rows = node.rows
        .map((row) => {
            return `
                <m:mr>
                    <m:e>
                        ${this.render(row.expression)}
                    </m:e>

                    <m:e>
                        ${this.render(row.condition)}
                    </m:e>
                </m:mr>
            `;
        })
        .join("");

    return `
        <m:d>
            <m:dPr>
                <m:begChr m:val="{"/>
                <m:endChr m:val=""/>
                <m:grow m:val="1"/>
                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>
                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>
            </m:dPr>

            <m:e>
                <m:m>
                    <m:mPr>
                        <m:baseJc m:val="centerGroup"/>
                        <m:plcHide m:val="0"/>
                    </m:mPr>

                    ${rows}
                </m:m>
            </m:e>
        </m:d>
    `;
}

private renderCasesWithStyle(
    node: CasesNode,
    style: "bold" | "roman" | "italic"
): string {
    const font =
        escapeXml(
            this.options.fontName
        );

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const rows = node.rows
        .map((row) => {
            return `
                <m:mr>
                    <m:e>
                        ${this.renderWithStyle(
                            row.expression,
                            style
                        )}
                    </m:e>

                    <m:e>
                        ${this.renderWithStyle(
                            row.condition,
                            style
                        )}
                    </m:e>
                </m:mr>
            `;
        })
        .join("");

    return `
        <m:d>
            <m:dPr>
                <m:begChr m:val="{"/>
                <m:endChr m:val=""/>
                <m:grow m:val="1"/>

                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>
            </m:dPr>

            <m:e>
                <m:m>
                    <m:mPr>
                        <m:baseJc m:val="centerGroup"/>
                        <m:plcHide m:val="0"/>
                    </m:mPr>

                    ${rows}
                </m:m>
            </m:e>
        </m:d>
    `;
}

    private renderMatrix(
    node: MatrixNode
): string {
    const font =
        escapeXml(
            this.options.fontName
        );

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const rows =
        node.rows
            .map((row) => {
                const cells =
                    row
                        .map(
                            (cell) => `
                                <m:e>
                                    ${this.render(cell)}
                                </m:e>
                            `
                        )
                        .join("");

                return `
                    <m:mr>
                        ${cells}
                    </m:mr>
                `;
            })
            .join("");

    const matrixXml = `
        <m:m>
            <m:mPr>
                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>
            </m:mPr>

            ${rows}
        </m:m>
    `;

    const delimiters:
        Record<
            string,
            {
                begin: string;
                end: string;
            } | null
        > = {
            matrix: null,

            pmatrix: {
                begin: "(",
                end: ")"
            },

            bmatrix: {
                begin: "[",
                end: "]"
            },

            Bmatrix: {
                begin: "{",
                end: "}"
            },

            vmatrix: {
                begin: "|",
                end: "|"
            },

            Vmatrix: {
                begin: "‖",
                end: "‖"
            }
        };

    const delimiter =
        delimiters[
            node.environment
        ];

    if (!delimiter) {
        return matrixXml;
    }

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(
                        delimiter.begin
                    )}"/>

                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>

                <m:endChr
                    m:val="${escapeXml(
                        delimiter.end
                    )}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${matrixXml}
            </m:e>
        </m:d>
    `;
}

private renderMatrixWithStyle(
    node: MatrixNode,
    style: "bold" | "roman" | "italic"
): string {
    const font =
        escapeXml(
            this.options.fontName
        );

    const size =
        Math.round(
            this.options.fontSize * 2
        );

    const rows =
        node.rows
            .map((row) => {
                const cells =
                    row
                        .map(
                            (cell) => `
                                <m:e>
                                    ${this.renderWithStyle(
                                        cell,
                                        style
                                    )}
                                </m:e>
                            `
                        )
                        .join("");

                return `
                    <m:mr>
                        ${cells}
                    </m:mr>
                `;
            })
            .join("");

    const matrixXml = `
        <m:m>
            <m:mPr>
                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>
            </m:mPr>

            ${rows}
        </m:m>
    `;

    const delimiters:
        Record<
            string,
            {
                begin: string;
                end: string;
            } | null
        > = {
            matrix: null,

            pmatrix: {
                begin: "(",
                end: ")"
            },

            bmatrix: {
                begin: "[",
                end: "]"
            },

            Bmatrix: {
                begin: "{",
                end: "}"
            },

            vmatrix: {
                begin: "|",
                end: "|"
            },

            Vmatrix: {
                begin: "‖",
                end: "‖"
            }
        };

    const delimiter =
        delimiters[
            node.environment
        ];

    if (!delimiter) {
        return matrixXml;
    }

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(
                        delimiter.begin
                    )}"/>

                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"/>

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>

                <m:endChr
                    m:val="${escapeXml(
                        delimiter.end
                    )}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${matrixXml}
            </m:e>
        </m:d>
    `;
}

    public renderDocumentOoxml(
    node: MathNode
): string {
    const mathContent =
        this.render(node);

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

    
}

function escapeXml(
    value: string
): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function assertNever(
    value: never
): never {
    throw new Error(
        `Unsupported math node: ${String(value)}`
    );
}