import type {
    MathNode,
    TextNode,
    SequenceNode,
    FractionNode,
    RadicalNode,
    ScriptNode,
    NaryNode,
    DelimiterNode,
    MatrixNode
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

            default:
                return assertNever(node);
        }
    }

    private renderText(node: TextNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(
        this.options.fontSize * 2
    );

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
        <w:sz w:val="${size}"/>
        <w:szCs w:val="${size}"/>
    </w:rPr>
    <m:t>${escapeXml(node.value)}</m:t>
</m:r>
`.trim();
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