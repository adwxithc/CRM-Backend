export const ActionEnum = Object.freeze({
    ADD: 'ADD',
    EDIT: 'EDIT',
    DELETE: 'DELETE'
});

export const StatusEnum = Object.freeze({
    LEAD: 'Lead',
    PROSPECT: 'Prospect',
    CUSTOMER: 'Customer',
});

export const STATUS_VALUES = Object.values(StatusEnum) as [string, ...string[]];
