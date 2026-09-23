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
  StyleNode,
  AccentNode,
  BoxNode,
  TextBlockNode,
  BinomialNode,
  BraceNode,
  OversetNode,
  AlignedNode,
  GatheredNode,
} from "./equationModel";

export interface MathRenderOptions {
  fontName: string;
  fontSize: number;
}

export class OmmlRenderer {
  constructor(private readonly options: MathRenderOptions) {}

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

      case "aligned":
        return this.renderAligned(node);

      case "function":
        return this.renderFunction(node);

      case "cases":
        return this.renderCases(node);
      case "style":
        return this.renderStyle(node);

      case "accent":
        return this.renderAccent(node);

      case "box":
        return this.renderBox(node);

      case "textBlock":
        return this.renderTextBlock(node);

      case "binomial":
        return this.renderBinomial(node);

      case "brace":
        return this.renderBrace(node);

      case "overset":
        return this.renderOverset(node);

      case "gathered":
        return this.renderGathered(node);

      default:
        return assertNever(node);
    }
  }

  private renderFunction(node: FunctionNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

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
     * Limit notation
     *
     * \lim_{x\to0} f(x)
     *
     * The condition belongs directly below
     * the "lim" operator rather than as a
     * normal subscript.
     */
    if (node.name === "lim" && node.subscript !== null) {
      functionName = `
        <m:limLow>
            <m:e>
                ${functionRun}
            </m:e>

            <m:lim>
                ${this.render(node.subscript)}
            </m:lim>
        </m:limLow>
    `;

      return `
    <m:func>
        <m:fName>
            ${functionName}
        </m:fName>

        <m:e>
            ${this.renderFunctionArgument(node.argument)}
        </m:e>
    </m:func>
`;
    }

    /*
     * Function superscript/subscript
     *
     * sin²
     * sin₁
     * sin₁²
     */
    if (node.subscript !== null && node.superscript !== null) {
      functionName = `
            <m:sSubSup>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sub>
                    ${this.render(node.subscript)}
                </m:sub>
                <m:sup>
                    ${this.render(node.superscript)}
                </m:sup>
            </m:sSubSup>
        `;
    } else if (node.subscript !== null) {
      functionName = `
            <m:sSub>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sub>
                    ${this.render(node.subscript)}
                </m:sub>
            </m:sSub>
        `;
    } else if (node.superscript !== null) {
      functionName = `
            <m:sSup>
                <m:e>
                    ${functionRun}
                </m:e>
                <m:sup>
                    ${this.render(node.superscript)}
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
            ${this.renderFunctionArgument(node.argument)}
        </m:e>
    </m:func>
`;
  }

  private renderNormalSizeBoundary(content: string): string {
    return `
        <m:box>

            <m:boxPr>
                <m:noBreak m:val="0"/>
            </m:boxPr>

            <m:e>

                <m:argPr>
                    <m:argSz m:val="1"/>
                </m:argPr>

                ${content}

            </m:e>

        </m:box>
    `;
  }

  private shouldNormalizeFunctionArgument(argument: MathNode): boolean {
    switch (argument.type) {
      case "text":
      case "textBlock":
      case "script":
        return false;

      case "sequence":
        return argument.children.length > 1;

      case "fraction":
      case "radical":
      case "delimiter":
      case "matrix":
      case "aligned":
      case "gathered":
      case "function":
      case "cases":
      case "style":
      case "accent":
      case "box":
      case "binomial":
      case "brace":
      case "overset":
      case "nary":
        return true;

      default:
        return false;
    }
  }

  private renderGathered(node: GatheredNode): string {
    const rows = node.rows
      .map(
        (row) => `
            <m:mr>
                <m:e>
                    ${this.render(row)}
                </m:e>
            </m:mr>
        `
      )
      .join("");

    return `
        <m:m>
            ${rows}
        </m:m>
    `;
  }

  private renderOverset(node: OversetNode): string {
    const annotation = this.render(node.annotation);

    const content = this.render(node.content);

    /*
     * ---------------------------------------------------------
     * OVERSET
     *
     * \overset{annotation}{content}
     *
     * Example:
     *
     * \overset{!}{=}
     * ---------------------------------------------------------
     */

    if (node.position === "top") {
      return `
            <m:limUpp>

                <m:e>
                    ${content}
                </m:e>

                <m:lim>
                    ${annotation}
                </m:lim>

            </m:limUpp>
        `;
    }

    /*
     * ---------------------------------------------------------
     * UNDERSET
     *
     * \underset{annotation}{content}
     *
     * Example:
     *
     * \underset{x\to0}{f(x)}
     * ---------------------------------------------------------
     */

    return `
        <m:limLow>

            <m:e>
                ${content}
            </m:e>

            <m:lim>
                ${annotation}
            </m:lim>

        </m:limLow>
    `;
  }

  private renderBrace(node: BraceNode): string {
    const braceCharacter = node.position === "top" ? "⏞" : "⏟";

    const position = node.position === "top" ? "top" : "bot";

    const groupCharacter = `
    <m:groupChr>

        <m:groupChrPr>

            <m:chr
                m:val="${escapeXml(braceCharacter)}"
            />

            <m:pos
                m:val="${position}"
            />

            <m:vertJc
                m:val="${node.position === "top" ? "bot" : "top"}"
            />

        </m:groupChrPr>

        <m:e>
            ${this.render(node.content)}
        </m:e>

    </m:groupChr>
`;
    /*
     * ---------------------------------------------------------
     * NO ANNOTATION
     * ---------------------------------------------------------
     */

    if (node.annotation === null) {
      return groupCharacter;
    }

    /*
     * ---------------------------------------------------------
     * OVERBRACE
     *
     * \overbrace{x+y}^{annotation}
     * ---------------------------------------------------------
     */

    if (node.position === "top") {
      return `
            <m:limUpp>

                <m:e>
                    ${groupCharacter}
                </m:e>

                <m:lim>
                    ${this.render(node.annotation)}
                </m:lim>

            </m:limUpp>
        `;
    }

    /*
     * ---------------------------------------------------------
     * UNDERBRACE
     *
     * \underbrace{x+y}_{annotation}
     * ---------------------------------------------------------
     */

    return `
        <m:limLow>

            <m:e>
                ${groupCharacter}
            </m:e>

            <m:lim>
                ${this.render(node.annotation)}
            </m:lim>

        </m:limLow>
    `;
  }

  private renderBinomial(node: BinomialNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    return `
        <m:d>

            <m:dPr>
                <m:begChr m:val="("/>
                <m:endChr m:val=")"/>
                <m:grow m:val="1"/>

                <m:ctrlPr>
                    <w:rPr>
                        <w:rFonts
                            w:ascii="${font}"
                            w:hAnsi="${font}"
                            w:eastAsia="${font}"
                            w:cs="${font}"
                        />

                        <w:sz w:val="${size}"/>
                        <w:szCs w:val="${size}"/>
                    </w:rPr>
                </m:ctrlPr>
            </m:dPr>

            <m:e>

                <m:m>

                    <m:mr>
                        <m:e>
                            ${this.render(node.upper)}
                        </m:e>
                    </m:mr>

                    <m:mr>
                        <m:e>
                            ${this.render(node.lower)}
                        </m:e>
                    </m:mr>

                </m:m>

            </m:e>

        </m:d>
    `;
  }

  private renderTextBlock(node: TextBlockNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

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
                    w:cs="${font}"
                />

                <w:sz w:val="${size}"/>
                <w:szCs w:val="${size}"/>
            </w:rPr>

            <m:t xml:space="preserve">${escapeXml(node.content)}</m:t>

        </m:r>
    `.trim();
  }

  private renderBox(node: BoxNode): string {
    return `
        <m:borderBox>

            <m:borderBoxPr>
                <m:hideTop m:val="0"/>
                <m:hideBot m:val="0"/>
                <m:hideLeft m:val="0"/>
                <m:hideRight m:val="0"/>
            </m:borderBoxPr>

            <m:e>
                ${this.render(node.content)}
            </m:e>

        </m:borderBox>
    `;
  }

  private renderFunctionWithStyle(node: FunctionNode, style: "bold" | "roman" | "italic"): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

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

    const functionRun = `
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

            <m:t>${escapeXml(node.name)}</m:t>
        </m:r>
    `;

    let functionName = functionRun;

    /*
     * Limit notation
     *
     * Keep the limit condition centered
     * underneath "lim" even when the
     * function is inside a style command.
     */
    if (node.name === "lim" && node.subscript !== null) {
      functionName = `
        <m:limLow>
            <m:e>
                ${functionRun}
            </m:e>

            <m:lim>
                ${this.renderWithStyle(node.subscript, style)}
            </m:lim>
        </m:limLow>
    `;

      return `
        ${functionName}
        ${this.renderFunctionArgumentWithStyle(node.argument, style)}
    `;
    }

    if (node.subscript !== null && node.superscript !== null) {
      functionName = `
            <m:sSubSup>
                <m:e>
                    ${functionRun}
                </m:e>

                <m:sub>
                    ${this.renderWithStyle(node.subscript, style)}
                </m:sub>

                <m:sup>
                    ${this.renderWithStyle(node.superscript, style)}
                </m:sup>
            </m:sSubSup>
        `;
    } else if (node.subscript !== null) {
      functionName = `
            <m:sSub>
                <m:e>
                    ${functionRun}
                </m:e>

                <m:sub>
                    ${this.renderWithStyle(node.subscript, style)}
                </m:sub>
            </m:sSub>
        `;
    } else if (node.superscript !== null) {
      functionName = `
            <m:sSup>
                <m:e>
                    ${functionRun}
                </m:e>

                <m:sup>
                    ${this.renderWithStyle(node.superscript, style)}
                </m:sup>
            </m:sSup>
        `;
    }

    return `
        ${functionName}
        ${this.renderFunctionArgumentWithStyle(node.argument, style)}
    `;
  }

  private renderFunctionArgumentWithStyle(
    argument: MathNode,
    style: "bold" | "roman" | "italic"
  ): string {
    let content: string;

    if (argument.type === "delimiter") {
      content = this.renderDelimiterWithStyle(argument, style);
    } else if (argument.type === "sequence" && argument.children.length > 1) {
      content = `
            <m:d>

                <m:dPr>
                    <m:begChr m:val="("/>
                    <m:endChr m:val=")"/>
                    <m:sepChr m:val=","/>
                </m:dPr>

                <m:e>
                    ${this.renderWithStyle(argument, style)}
                </m:e>

            </m:d>
        `;
    } else {
      content = this.renderWithStyle(argument, style);
    }

    if (this.shouldNormalizeFunctionArgument(argument)) {
      return this.renderNormalSizeBoundary(content);
    }

    return content;
  }

  private renderText(node: TextNode, style: "bold" | "roman" | "italic" = "roman"): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

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

  private renderStyle(node: StyleNode): string {
    return this.renderWithStyle(node.content, node.style);
  }

  private renderAccent(node: AccentNode): string {
    /*
     * ---------------------------------------------------------
     * OVERLINE / BAR / UNDERLINE
     * ---------------------------------------------------------
     *
     * m:bar automatically follows the width of its content.
     *
     * This is better than using ¯ as an accent character,
     * because ¯ has a fixed glyph width.
     */

    if (node.accent === "bar" || node.accent === "overline") {
      return `
            <m:bar>
                <m:barPr>
                    <m:pos m:val="top"/>
                </m:barPr>

                <m:e>
                    ${this.render(node.content)}
                </m:e>
            </m:bar>
        `;
    }

    /*
     * ---------------------------------------------------------
     * UNDERLINE
     * ---------------------------------------------------------
     */

    if (node.accent === "underline") {
      return `
            <m:bar>
                <m:barPr>
                    <m:pos m:val="bot"/>
                </m:barPr>

                <m:e>
                    ${this.render(node.content)}
                </m:e>
            </m:bar>
        `;
    }

    /*
     * ---------------------------------------------------------
     * MATHEMATICAL ACCENTS
     * ---------------------------------------------------------
     */

    let accentCharacter: string;

    switch (node.accent) {
      case "hat":
        // Combining circumflex
        accentCharacter = "̂";
        break;

      case "vec":
        // Combining right arrow above
        accentCharacter = "⃗";
        break;

      case "dot":
        // Combining dot above
        accentCharacter = "̇";
        break;

      case "ddot":
        // Combining diaeresis above
        accentCharacter = "̈";
        break;

      default:
        throw new Error(`Unsupported accent: ${node.accent}`);
    }

    return `
        <m:acc>

            <m:accPr>

                <m:chr
                    m:val="${escapeXml(accentCharacter)}"
                />

                <m:grow
                    m:val="1"
                />

            </m:accPr>

            <m:e>
                ${this.render(node.content)}
            </m:e>

        </m:acc>
    `;
  }

  private renderFunctionArgument(argument: MathNode): string {
    let content: string;

    /*
     * Explicit parentheses/delimiters are already
     * represented by the AST.
     */
    if (argument.type === "delimiter") {
      content = this.render(argument);
    }

    /*
     * Multi-term sequence:
     *
     * \sin{x+a}
     *
     * becomes:
     *
     * sin(x+a)
     */
    else if (argument.type === "sequence" && argument.children.length > 1) {
      content = `
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
    } else {
      content = this.render(argument);
    }

    /*
     * Word may enter a reduced mathematical size level
     * when a structured object is used as a function
     * argument.
     *
     * The invisible box provides a real OMML size boundary.
     */
    if (this.shouldNormalizeFunctionArgument(argument)) {
      return this.renderNormalSizeBoundary(content);
    }

    return content;
  }

  private renderSequence(node: SequenceNode): string {
    return node.children.map((child) => this.render(child)).join("");
  }

  private renderFraction(node: FractionNode): string {
    return `
        <m:f>

            <m:num>
                <m:e>
                    ${this.render(node.numerator)}
                </m:e>
            </m:num>

            <m:den>
                <m:e>
                    ${this.render(node.denominator)}
                </m:e>
            </m:den>

        </m:f>
    `;
  }

  private renderFractionWithStyle(node: FractionNode, style: "bold" | "roman" | "italic"): string {
    return `
        <m:f>
            <m:num>
                <m:e>
                    ${this.renderWithStyle(node.numerator, style)}
                </m:e>
            </m:num>

            <m:den>
                <m:e>
                    ${this.renderWithStyle(node.denominator, style)}
                </m:e>
            </m:den>
        </m:f>
    `;
  }

  private renderRadical(node: RadicalNode): string {
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
                ${this.render(node.radicand)}
            </m:e>
        </m:rad>
    `;
  }

  private renderRadicalWithStyle(node: RadicalNode, style: "bold" | "roman" | "italic"): string {
    const degree = node.degree
      ? `
            <m:deg>
                ${this.renderWithStyle(node.degree, style)}
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
                ${this.renderWithStyle(node.radicand, style)}
            </m:e>
        </m:rad>
    `;
  }

  private renderScript(node: ScriptNode): string {
    const base = this.render(node.base);

    if (node.subscript && node.superscript) {
      return `
                <m:sSubSup>
                    <m:e>
                        ${base}
                    </m:e>

                    <m:sub>
                        ${this.render(node.subscript)}
                    </m:sub>

                    <m:sup>
                        ${this.render(node.superscript)}
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
                        ${this.render(node.superscript)}
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
                        ${this.render(node.subscript)}
                    </m:sub>
                </m:sSub>
            `;
    }

    return base;
  }

  private renderWithStyle(node: MathNode, style: "bold" | "roman" | "italic"): string {
    switch (node.type) {
      case "text":
        return this.renderText(node, style);

      case "sequence":
        return node.children.map((child) => this.renderWithStyle(child, style)).join("");
      case "fraction":
        return this.renderFractionWithStyle(node, style);
      case "radical":
        return this.renderRadicalWithStyle(node, style);

      case "matrix":
        return this.renderMatrixWithStyle(node, style);

      case "cases":
        return this.renderCasesWithStyle(node, style);

      case "function":
        return this.renderFunctionWithStyle(node, style);

      case "script": {
        const base = this.renderWithStyle(node.base, style);

        const sub = node.subscript ? this.renderWithStyle(node.subscript, style) : null;

        const sup = node.superscript ? this.renderWithStyle(node.superscript, style) : null;

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

  private renderNary(node: NaryNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    const lower = node.lower
      ? `
                    <m:sub>
                        ${this.render(node.lower)}
                    </m:sub>
                `
      : "";

    const upper = node.upper
      ? `
                    <m:sup>
                        ${this.render(node.upper)}
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

  private renderDelimiter(node: DelimiterNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(node.begin)}"/>

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
                    m:val="${escapeXml(node.end)}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${this.render(node.content)}
            </m:e>

        </m:d>
    `;
  }

  private renderDelimiterWithStyle(
    node: DelimiterNode,
    style: "bold" | "roman" | "italic"
  ): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(node.begin)}"/>

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
                    m:val="${escapeXml(node.end)}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${this.renderWithStyle(node.content, style)}
            </m:e>

        </m:d>
    `;
  }

  private renderCases(node: CasesNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

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

  private renderCasesWithStyle(node: CasesNode, style: "bold" | "roman" | "italic"): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    const rows = node.rows
      .map((row) => {
        return `
                <m:mr>
                    <m:e>
                        ${this.renderWithStyle(row.expression, style)}
                    </m:e>

                    <m:e>
                        ${this.renderWithStyle(row.condition, style)}
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

  private renderMatrix(node: MatrixNode): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    const rows = node.rows
      .map((row) => {
        const cells = row
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

    const delimiters: Record<
      string,
      {
        begin: string;
        end: string;
      } | null
    > = {
      matrix: null,

      pmatrix: {
        begin: "(",
        end: ")",
      },

      bmatrix: {
        begin: "[",
        end: "]",
      },

      Bmatrix: {
        begin: "{",
        end: "}",
      },

      vmatrix: {
        begin: "|",
        end: "|",
      },

      Vmatrix: {
        begin: "‖",
        end: "‖",
      },
    };

    const delimiter = delimiters[node.environment];

    if (!delimiter) {
      return matrixXml;
    }

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(delimiter.begin)}"/>

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
                    m:val="${escapeXml(delimiter.end)}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${matrixXml}
            </m:e>
        </m:d>
    `;
  }

  private renderAligned(node: AlignedNode): string {
    const rows = node.rows
      .map((row) => {
        const cells = row
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

    return `
        <m:m>
            ${rows}
        </m:m>
    `;
  }

  private renderMatrixWithStyle(node: MatrixNode, style: "bold" | "roman" | "italic"): string {
    const font = escapeXml(this.options.fontName);

    const size = Math.round(this.options.fontSize * 2);

    const rows = node.rows
      .map((row) => {
        const cells = row
          .map(
            (cell) => `
                                <m:e>
                                    ${this.renderWithStyle(cell, style)}
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

    const delimiters: Record<
      string,
      {
        begin: string;
        end: string;
      } | null
    > = {
      matrix: null,

      pmatrix: {
        begin: "(",
        end: ")",
      },

      bmatrix: {
        begin: "[",
        end: "]",
      },

      Bmatrix: {
        begin: "{",
        end: "}",
      },

      vmatrix: {
        begin: "|",
        end: "|",
      },

      Vmatrix: {
        begin: "‖",
        end: "‖",
      },
    };

    const delimiter = delimiters[node.environment];

    if (!delimiter) {
      return matrixXml;
    }

    return `
        <m:d>
            <m:dPr>

                <m:begChr
                    m:val="${escapeXml(delimiter.begin)}"/>

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
                    m:val="${escapeXml(delimiter.end)}"/>

                <m:grow m:val="1"/>

            </m:dPr>

            <m:e>
                ${matrixXml}
            </m:e>
        </m:d>
    `;
  }

  public renderDocumentOoxml(node: MathNode): string {
    const mathContent = this.render(node);

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function assertNever(value: never): never {
  throw new Error(`Unsupported math node: ${String(value)}`);
}
