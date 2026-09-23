import type { MathNode } from "./equationModel";

export class PreviewRenderer {
  render(node: MathNode): string {
    return this.renderNode(node);
  }

  private renderNode(node: MathNode): string {
    switch (node.type) {
      case "text":
        return this.escapeHtml(node.value);

      case "sequence":
        return node.children.map((child) => this.renderNode(child)).join("");

      case "fraction":
        return `
                    <span class="preview-fraction">
                        <span class="preview-numerator">
                            ${this.renderNode(node.numerator)}
                        </span>
                        <span class="preview-denominator">
                            ${this.renderNode(node.denominator)}
                        </span>
                    </span>
                `;

      case "radical":
        return `
                    <span class="preview-radical">
                        <span class="preview-radical-symbol">
                            √
                        </span>
                        <span class="preview-radicand">
                            ${this.renderNode(node.radicand)}
                        </span>
                    </span>
                `;

      case "script":
        return `
                    <span class="preview-script">
                        <span class="preview-script-base">
                            ${this.renderNode(node.base)}
                        </span>

                        ${
                          node.superscript
                            ? `
                                    <sup>
                                        ${this.renderNode(node.superscript)}
                                    </sup>
                                `
                            : ""
                        }

                        ${
                          node.subscript
                            ? `
                                    <sub>
                                        ${this.renderNode(node.subscript)}
                                    </sub>
                                `
                            : ""
                        }
                    </span>
                `;

      case "delimiter":
        return `
                    <span class="preview-delimiter">
                        ${this.escapeHtml(node.begin)}
                        ${this.renderNode(node.content)}
                        ${this.escapeHtml(node.end)}
                    </span>
                `;

      default:
        return this.escapeHtml(`[${node.type}]`);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
