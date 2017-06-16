import * as Lint from "tslint";
import * as ts from "typescript";

import { MaxParamsWalker } from "./walkers/MaxParamsWalker";

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

    /**
     * Metadata about the rule
     *
     * @static
     * @type {Line.IRuleMetadata}
     * @memberOf Rule
     */
    public static metadata: Lint.IRuleMetadata = {
        description: "Checks the number of parameters in a function or method declaration",
        optionExamples: ["true", "[true, 4]"],
        options: {
            minimum: 0,
            type: "number"
        },
        optionsDescription: "An optional maximum number of parameters allowed. If not provided a default value of 3 is used.",
        rationale: "Too many parameters is a sign of code that does too much.",
        ruleName: "max-params",
        type: "maintainability",
        typescriptOnly: false,
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
    }

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
        return this.applyWithWalker(new MaxParamsWalker(sourceFile, Rule.metadata.ruleName, this.getOptions(), this.maximum));
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
