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
    | MatrixNode;

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
    environment:
        | "matrix"
        | "pmatrix"
        | "bmatrix"
        | "Bmatrix"
        | "vmatrix"
        | "Vmatrix";
    rows: MathNode[][];
}