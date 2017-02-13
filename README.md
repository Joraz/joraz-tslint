# Sigma TSLint

A collection of additional rules that can be used by an existing TSLint installation.

## Rules

| Name | Options | Description | Rationale |
| ---- | ---- | ---- | ---- |
| `max-params` | None | Checks function and method declarations and expressions to see if more than 3 parameters are used, and flags them accordingly | Having a large number of parameters is a warning sign of a method that is doing too much |

### Coming soon

Add configuration option to set the maximum allowed parameters in `max-params` rule.