export interface WasmExports {
    BusinessRulesValidator: BusinessRulesValidator;
}
export interface BusinessRulesValidator {
    SetTaxonomy: (taxonomy: string) => void;
    ValidateBusinessRules: (results: string) => string;
}
export interface IRuleSetResultDTO {
    BrokenRules: IRuleDTO[];
    Criticality: CriticalityDTO;
    FieldId: string;
    FieldType: string;
    IsValid: boolean;
    Results: IRuleResult[];
    RowIndex?: number;
    TableFieldId?: string;
}
export interface IRuleResult {
    IsValid: boolean;
    Rules: IRuleResultDTO[];
    Value: IFieldValue;
}
export interface IRuleResultDTO {
    IsValid: boolean;
    Rule: IRuleDTO;
}
export interface IFieldValue {
    Value: string;
    DerivedValue: string;
}
export interface IRuleDTO {
    Name: string;
    Type: RuleTypeDTO;
    LogicalOperator: LogicalOperatorDTO;
    Expression: string;
    ComparisonOperator: ComparisonOperatorDTO;
    SetValues: string[];
}
export type CriticalityDTO = 'Must' | 'Should';
export type RuleTypeDTO = 'Mandatory' | 'IsEmpty' | 'PossibleValues' | 'Regex' | 'StartsWith' | 'EndsWith' | 'Contains' | 'FixedLength' | 'IsEmail' | 'Expression';
export type LogicalOperatorDTO = 'OR' | 'AND';
export type ComparisonOperatorDTO = 'Equals' | 'NotEquals' | 'Greater' | 'Less' | 'GreaterOrEqual' | 'LessOrEqual';
