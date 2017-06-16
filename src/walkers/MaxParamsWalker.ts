import * as Lint from "tslint";
import * as ts from "typescript";

import { Rule } from "../maxParamsRule";

/**
 * Walker that searches for nodes containing parameters.
 * Once found, checks the number of parameters against either the configured amount or the default
 */
export class MaxParamsWalker extends Lint.AbstractWalker<Lint.IOptions>
{
    /**
     *
     * @param {ts.SourceFile} source The sourcefile to examine
     * @param {string} ruleName The name of the rule that triggers this walker
     * @param {Lint.IOptions} options The configured options
     * @param {number} maximum The maximum allowed parameters
     */
    constructor(source: ts.SourceFile, ruleName: string, options: Lint.IOptions, private maximum: number)
    {
        super(source, ruleName, options);
    }

    /**
     * Implementation of the AbstractWalker method. Calls .checkNode() on all child nodes
     * @param {ts.SourceFile} sourceFile The sourcefile to check
     */
    public walk(sourceFile: ts.SourceFile): void
    {
        ts.forEachChild(sourceFile, (node: ts.Node) =>
        {
            this.checkNode(node);
        });
    }

    /**
     * Checks a node for parameter correctness, then checks each child node
     * @param {ts.Node} node The node to check
     */
    private checkNode(node: ts.Node): void
    {
        if (this.isApplicableNode(node))
        {
            if (this.parametersExceedMaximum(node as ts.SignatureDeclaration))
            {
                this.applyFailure((node as ts.SignatureDeclaration).parameters);
            }
        }

        ts.forEachChild(node, this.checkNode.bind(this));
    }

    /**
     * Returns a boolean indicating whether or not the node can be checked for parameters
     * @param {ts.Node} node The node to check
     * @returns {boolean} Whether or not the node is applicable
     */
    private isApplicableNode(node: ts.Node): boolean
    {
        // Check if the node has parameters
        return !!(node as ts.SignatureDeclaration).parameters;
    }

    /**
     * Checks whether the parameters on the node exceed the configured maximum
     * @param node
     */
    private parametersExceedMaximum(node: ts.SignatureDeclaration): boolean
    {
        return node.parameters.length > this.maximum;
    }

    /**
     * Applies a failure at the positions of the excess parameters
     * @param {ts.NodeArray<ts.ParameterDeclaration>} parameters The parameter array that have triggered the failure
     */
    private applyFailure(parameters: ts.NodeArray<ts.ParameterDeclaration>): void
    {
        const parameterLength = parameters.length;

        // Work out the beginning and width of the failure
        const firstFailureNode: ts.ParameterDeclaration = parameters[this.maximum];
        const lastFailureNode: ts.ParameterDeclaration = parameters[parameterLength - 1];

        const startOfFailure: number = firstFailureNode.getStart();
        const endOfFailure: number = lastFailureNode.end;

        const failureWidth: number = endOfFailure - startOfFailure;

        this.addFailureAt(startOfFailure, failureWidth, Rule.FAILURE_STRING(this.maximum, parameterLength));
    }
}
