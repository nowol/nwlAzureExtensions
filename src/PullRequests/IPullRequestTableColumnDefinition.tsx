import {ITableColumn} from "azure-devops-ui/Table";
import {IPullRequestDetail} from "./IPullRequestDetail";

export interface IPullRequestTableColumnDefinition {
    tableColumnDefinition: ITableColumn<IPullRequestDetail>;
    sortDefinition: ((item1: IPullRequestDetail, item2: IPullRequestDetail) => number) | null;
}