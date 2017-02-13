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
    /**
     * The default value to use when no configuration is provided
     * 
     * @static
     * @type {number}
     * @memberOf Rule
     */
    public static readonly DEFAULT_MAX_NUMBER: number = 3;

    /**
     * The minimum value that could possibly be used
     * 
     * @static
     * @type {number}
     * @memberOf Rule
     */
    public static readonly MINIMUM_MAX_NUMBER: number = 0;

    public static metadata: Lint.IRuleMetadata = {
        ruleName: "max-params",
        type: "maintainability",
        description: "Checks the number of parameters in a function or method declaration",
        options: {
            type: "number",
            minimum: 0
        },
        optionsDescription: "An optional maximum number of parameters allowed. If not provided a default value of 3 is used.",
        optionExamples: ["true", "[true, 4]"],
        typescriptOnly: false,
        rationale: "Too many parameters is a sign of code that does too much."
    };

    /**
     * Retrieves the failure string based on the parameters provided and the configured maximum
     * 
     * @static
     * @param {number} expected The maximum allowable parameters
     * @param {number} actual The actual number of provided parameters
     * @returns {string} The failure string to return to the linter
     * 
     * @memberOf Rule
     */
    public static FAILURE_STRING(expected: number, actual: number): string
    {
        return `Number of parameters (${actual}) exceeds the maximum allowed of ${expected}.`;
    };

    /**
     * Applies the MaxParamsWalker to the supplied source file
     * 
     * @param {ts.SourceFile} sourceFile The file that will be walked for rule violations
     * @returns {Array<Lint.RuleFailure>} An array of failures caused by too many parameters
     * 
     * @memberOf Rule
     */
    public apply(sourceFile: ts.SourceFile): Array<Lint.RuleFailure>
    {
        return this.applyWithWalker(new MaxParamsWalker(sourceFile, this.getOptions(), this.maximum));
    }

    /**
     * Getter for the maximum number of parameters allowed.
     * 
     * Looks for a configured option, and returns the default if none is found
     * 
     * @readonly
     * @type {number}
     * @memberOf Rule
     */
    public get maximum(): number
    {
        const ruleArgs = this.getOptions().ruleArguments;

        if (ruleArgs[0] !== undefined)
        {
            return ruleArgs[0];
        }

        return Rule.DEFAULT_MAX_NUMBER;
    }

    /**
     * Indicates whether or not the rule should be enabled.
     * 
     * Will return false if the provided maximum value is not a number or is a negative number
     * 
     * @returns {boolean}
     * 
     * @memberOf Rule
     */
    public isEnabled(): boolean
    {
        const configurationIsValid: boolean = typeof this.maximum === "number" && this.maximum >= Rule.MINIMUM_MAX_NUMBER;

        return super.isEnabled() && configurationIsValid;
    }
}

/**
 * Walker that examines statements that contain parameters, and ensures that they do not exceed the maximum.
 * 
 * @class MaxParamsWalker
 * @extends {Lint.RuleWalker}
 */
class MaxParamsWalker extends Lint.RuleWalker
{
    /**
     * Creates an instance of MaxParamsWalker.
     * 
     * @param {ts.SourceFile} sourceFile The sourcefile to walk
     * @param {Lint.IOptions} options Any configured options
     * @param {number} maximum The maximum amount of parameters that should be allowed
     * 
     * @memberOf MaxParamsWalker
     */
    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, private maximum: number)
    {
        super(sourceFile, options);
    }

    /**
     * Examine a function declaration node
     * 
     * @param {ts.FunctionDeclaration} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitFunctionDeclaration(node: ts.FunctionDeclaration)
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };

        super.visitFunctionDeclaration(node);
    }

    /**
     * Examine a function expression node
     * 
     * @param {ts.FunctionExpression} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitFunctionExpression(node: ts.FunctionExpression)
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };

        super.visitFunctionExpression(node);
    }

    /**
     * Examine a constructor node
     * 
     * @param {ts.ConstructorDeclaration} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitConstructorDeclaration(node: ts.ConstructorDeclaration): void
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };
        
        super.visitConstructorDeclaration(node);
    }

    /**
     * Examine a method declaration
     * 
     * @param {ts.MethodDeclaration} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitMethodDeclaration(node: ts.MethodDeclaration): void
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };
        
        super.visitMethodDeclaration(node);
    }

    /**
     * Examine a method signature
     * 
     * @param {ts.SignatureDeclaration} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitMethodSignature(node: ts.SignatureDeclaration): void
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };
        
        super.visitMethodSignature(node);
    }

    /**
     * Examine an arrow function
     * 
     * @param {ts.ArrowFunction} node The node that may contain parameters to check
     * 
     * @memberOf MaxParamsWalker
     */
    public visitArrowFunction(node: ts.ArrowFunction): void
    {
        if (this.parametersExceedMaximum(node))
        {
            this.applyFailure(node);
        };
        
        super.visitArrowFunction(node);
    }

    /**
     * Checks the parameters contained in the supplied node against 
     * 
     * @private
     * @param {ts.SignatureDeclaration} node The node to check
     * @returns {boolean} Whether or not the maximum has been exceeded
     * 
     * @memberOf MaxParamsWalker
     */
    private parametersExceedMaximum(node: ts.SignatureDeclaration): boolean
    {
        return node.parameters.length > this.maximum
    }

    /**
     * Applies a failure that will cover from the first parameter that exceeds the maximum to the last
     * 
     * @private
     * @param {ts.SignatureDeclaration} node The node that caused the failure
     * 
     * @memberOf MaxParamsWalker
     */
    private applyFailure(node: ts.SignatureDeclaration): void
    {
        const parameterLength = node.parameters.length;

        // Work out the beginning and width of the failure
        const firstFailureNode: ts.ParameterDeclaration = node.parameters[this.maximum];
        const lastFailureNode: ts.ParameterDeclaration = node.parameters[parameterLength - 1];
       
        const startOfFailure: number = firstFailureNode.getStart();
        const endOfFailure: number = lastFailureNode.end;

        const failureWidth: number = endOfFailure - startOfFailure;

        this.addFailureAt(startOfFailure, failureWidth, Rule.FAILURE_STRING(this.maximum, parameterLength));
    }
}