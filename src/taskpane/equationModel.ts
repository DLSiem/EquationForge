/**
 * Internal representation of a mathematical equation.
 *
 * IMPORTANT:
 * These objects do not know anything about Word or OMML.
 * They describe mathematics only.
 */

export type MathNode =
  | TextNode
  | SequenceNode
  | FractionNode
  | RadicalNode
  | ScriptNode
  | NaryNode
  | DelimiterNode
  | MatrixNode
  | FunctionNode
  | CasesNode
  | StyleNode
  | AccentNode
  | BoxNode
  | TextBlockNode
  | BinomialNode
  | BraceNode
  | OversetNode
  | AlignedNode
  | GatheredNode;

export interface BraceNode {
  type: "brace";
  position: "top" | "bottom";
  content: MathNode;
  annotation: MathNode | null;
}

export interface GatheredNode {
  type: "gathered";
  rows: MathNode[];
}

export interface AlignedNode {
  type: "aligned";
  rows: MathNode[][];
}

export interface OversetNode {
  type: "overset";
  position: "top" | "bottom";
  annotation: MathNode;
  content: MathNode;
}

export interface BinomialNode {
  type: "binomial";
  upper: MathNode;
  lower: MathNode;
}

export interface TextBlockNode {
  type: "textBlock";
  content: string;
}

export interface BoxNode {
  type: "box";
  content: MathNode;
}

export interface AccentNode {
  type: "accent";
  accent: "hat" | "bar" | "vec" | "dot" | "ddot" | "overline" | "underline";
  content: MathNode;
}

export interface StyleNode {
  type: "style";
  style: "bold" | "roman" | "italic";
  content: MathNode;
}

export interface CasesNode {
  type: "cases";
  rows: Array<{
    expression: MathNode;
    condition: MathNode;
  }>;
}

export interface FunctionNode {
  type: "function";
  name: string;
  argument: MathNode;
  subscript: MathNode | null;
  superscript: MathNode | null;
}

export interface TextNode {
  type: "text";
  value: string;
}

export interface SequenceNode {
  type: "sequence";
  children: MathNode[];
}

export interface FractionNode {
  type: "fraction";
  numerator: MathNode;
  denominator: MathNode;
}

export interface RadicalNode {
  type: "radical";
  degree: MathNode | null;
  radicand: MathNode;
}

export interface ScriptNode {
  type: "script";
  base: MathNode;
  subscript: MathNode | null;
  superscript: MathNode | null;
}

export interface NaryNode {
  type: "nary";
  operator: string;
  lower: MathNode | null;
  upper: MathNode | null;
  body: MathNode;
}

export interface DelimiterNode {
  type: "delimiter";
  begin: string;
  end: string;
  content: MathNode;
}

export interface MatrixNode {
  type: "matrix";
  environment: "matrix" | "pmatrix" | "bmatrix" | "Bmatrix" | "vmatrix" | "Vmatrix";
  rows: MathNode[][];
}
