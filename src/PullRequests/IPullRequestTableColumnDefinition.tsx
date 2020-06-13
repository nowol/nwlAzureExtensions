import {ITableColumn} from "azure-devops-ui/Table";
import {IPullRequestDetail} from "./IPullRequestDetail";
import {BreakPointNames} from "./BreakPointNames";

export interface IPullRequestTableColumnDefinition {
    tableColumnDefinition: ITableColumn<IPullRequestDetail>;
    sortDefinition: ((item1: IPullRequestDetail, item2: IPullRequestDetail) => number) | null;
    breakpoints: BreakPointNames[];
}