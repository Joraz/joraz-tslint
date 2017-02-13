import * as ts from "typescript";
import * as Lint from "tslint";


/**
 * Rule that checks the number of parameters in various declarations and expressions.
 * If over a certain amount, will error
 * 
 * @export
 * @class Rule
 * @extends {Lint.Rules.AbstractRule}
 */
export class Rule extends Lint.Rules.AbstractRule
{
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "max-params",
        type: "maintainability",
        description: "Checks the number of parameters in a function or method declaration",
        options: null/*{
            type: "number",
            minimum: 0
        }*/,
        optionsDescription: ""/*"You can configure the maximum number of allowable parameters. If not configured, the default value of '3' is used."*/,
        typescriptOnly: false,
        rationale: "Too many parameters is a sign of code that does too much. More than 3 is discouraged"
    };

    /**
     * Applies the MaxParamsWalker to the supplied source file
     * 
     * @param {ts.SourceFile} sourceFile The file that will be walked for rule violations
     * 
     * @returns {Array<Lint.RuleFailure>} An array of failures caused by too many parameters
     * 
     * @memberOf Rule
     */
    public apply(sourceFile: ts.SourceFile): Array<Lint.RuleFailure>
    {
        return this.applyWithWalker(new MaxParamsWalker(sourceFile, this.getOptions()));
    }
}

class MaxParamsWalker extends Lint.RuleWalker
{
    public static readonly DEFAULT_MAX_NUMBER: number = 3;

    public visitFunctionDeclaration(node: ts.FunctionDeclaration)
    {
        this.checkParameters(node);
        super.visitFunctionDeclaration(node);
    }

    public visitFunctionExpression(node: ts.FunctionExpression)
    {
        this.checkParameters(node);
        super.visitFunctionExpression(node);
    }

    public visitConstructorDeclaration(node: ts.ConstructorDeclaration): void
    {
        this.checkParameters(node);
        super.visitConstructorDeclaration(node);
    }

    public visitMethodDeclaration(node: ts.MethodDeclaration): void
    {
        this.checkParameters(node);
        super.visitMethodDeclaration(node);
    }

    public visitMethodSignature(node: ts.SignatureDeclaration): void
    {
        this.checkParameters(node);
        super.visitMethodSignature(node);
    }

    public visitArrowFunction(node: ts.FunctionLikeDeclaration): void
    {
        this.checkParameters(node);
        super.visitArrowFunction(node);
    }

    private checkParameters(node: ts.SignatureDeclaration): void
    {
        if (node.parameters.length > MaxParamsWalker.DEFAULT_MAX_NUMBER)
        {
            this.applyFailure(node);
        }
    }

    private applyFailure(node: ts.SignatureDeclaration): void
    {
        // Work out the beginning of the failure
        const index = MaxParamsWalker.DEFAULT_MAX_NUMBER;
        const paramNode = node.parameters[index];
        const startOfFailure = paramNode.getStart();

        // Get the width of the failure
        const lastNode = node.parameters[node.parameters.length - 1]
        const endOfFailure = lastNode.end;
        const failureWidth = endOfFailure - startOfFailure;
        this.addFailureAt(startOfFailure, failureWidth, `Number of parameters (${node.parameters.length}) exceeds the maximum allowed of ${MaxParamsWalker.DEFAULT_MAX_NUMBER}.`);
    }
}