import {IHostNavigationService} from "azure-devops-extension-api";
import {ITableColumn, SimpleTableCell, TwoLineTableCell} from "azure-devops-ui/Table";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import * as WebApi from "azure-devops-extension-api/WebApi/WebApi";
import * as React from "react";
import {Link} from "azure-devops-ui/Link";
import {PullRequestAsyncStatus} from "azure-devops-extension-api/Git/Git";
import {IPullRequestDetail} from "./IPullRequestDetail";
import {IPullRequestTableColumnDefinition} from "./IPullRequestTableColumnDefinition";
import {VssPersona} from "azure-devops-ui/VssPersona";
import {Pill, PillSize, PillVariant} from "azure-devops-ui/Pill";
import {Status, Statuses, StatusSize} from "azure-devops-ui/Status";
import {IColor} from "azure-devops-ui/Utilities/Color";
import {PullRequestStatus} from "./PullRequestStatus";


const draftColor: IColor = {
    red: 0,
    green: 90,
    blue: 158
};

export class PullRequestTableRendering {
    private navService: IHostNavigationService;

    constructor(navService: IHostNavigationService) {
        this.navService = navService;
        const columnsDef = this.buildColumns();

        this.columns = columnsDef.map(value => value.tableColumnDefinition);
        this.sortDefinitions = columnsDef.map(value => value.sortDefinition);
    }

    public columns: ITableColumn<IPullRequestDetail>[];
    public sortDefinitions: (((item1: IPullRequestDetail, item2: IPullRequestDetail) => number) | null)[];

    private onSize(event: MouseEvent, index: number, width: number) {
        (this.columns[index].width as ObservableValue<number>).value = width;
    }

    private buildColumns(): IPullRequestTableColumnDefinition[] {
        return [
            {
                tableColumnDefinition: {
                    id: "id",
                    minWidth: 60,
                    name: "ID",
                    onSize: this.onSize,
                    readonly: true,
                    renderCell: this.renderIdCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted low to high",
                        ariaLabelDescending: "Sorted high to low"
                    },
                    width: new ObservableValue(60)
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.pullRequestId - item2.pullRequestId;
                }
            },
            {
                tableColumnDefinition: {
                    id: "createdBy",
                    minWidth: 50,
                    name: "Created By",
                    onSize: this.onSize,
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderCreatedByCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted A to Z",
                        ariaLabelDescending: "Sorted Z to A"
                    },
                    width: new ObservableValue(180)
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.createdBy.displayName!.localeCompare(item2.createdBy.displayName!);
                }
            },
            {
                tableColumnDefinition: {
                    id: "title",
                    minWidth: 50,
                    name: "Title",
                    onSize: this.onSize,
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderTitleCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted A to Z",
                        ariaLabelDescending: "Sorted Z to A"
                    },
                    width: -100 // 100% of remaining space
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.title!.localeCompare(item2.title!);
                }
            },
            {
                tableColumnDefinition: {
                    id: "status",
                    minWidth: 50,
                    name: "Status",
                    onSize: this.onSize,
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderStatusCell,
                    width: new ObservableValue(100)
                },
                sortDefinition: null
            },
            {
                tableColumnDefinition: {
                    id: "reviewers",
                    minWidth: 50,
                    name: "Reviewers",
                    onSize: this.onSize,
                    readonly: true,
                    renderCell: this.renderReviewersCell,
                    width: new ObservableValue(150)
                },
                sortDefinition: null
            }
        ];
    }

    private static renderSimpleStringCell<T>(value: number | string | JSX.Element | JSX.Element[] | null, rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, contentClassName: string = ""): JSX.Element {
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName={contentClassName}
            >
                {value}
            </SimpleTableCell>
        )
    }

    private static renderIdentityIcon(identity: WebApi.IdentityRef): JSX.Element {
        return (
            <React.Fragment>
                <VssPersona key={"icon-" + identity.id} imageUrl={identity.imageUrl} size={"small"}
                            imgAltText={identity.displayName}/>
            </React.Fragment>
        );
    }

    private static renderIdentity(identity: WebApi.IdentityRef): JSX.Element {
        return (
            <React.Fragment>
                {PullRequestTableRendering.renderIdentityIcon(identity)}&nbsp;{identity.displayName}
            </React.Fragment>
        );
    }

    private static renderCreatedByCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        return (
            <TwoLineTableCell
                className="bolt-table-cell-content-with-inline-link"
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                line1={PullRequestTableRendering.renderIdentity(tableItem.createdBy)}
                line2={
                    <span className="fontSize font-size secondary-text">
                        {tableItem.creationDate.toLocaleString()}
                    </span>
                }
            />
        )
    }

    private renderIdCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        const link = <Link href={tableItem.pullRequestUrl}
                           onClick={() => this.navService!.navigate(tableItem.pullRequestUrl)}>{tableItem.pullRequestId}</Link>;
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName="bolt-table-cell-content-with-link"
            >
                {link}
                {tableItem.mergeStatus === PullRequestAsyncStatus.Conflicts
                 && (<React.Fragment>
                        &nbsp;
                        <Status
                            {...Statuses.Failed}
                            ariaLabel="Conflict"
                            className="icon-large-margin"
                            size={StatusSize.m}
                        />
                 </React.Fragment>)}
            </SimpleTableCell>
        );
    }

    private static renderTitleCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        return (
            <TwoLineTableCell
                className="bolt-table-cell-content-with-inline-link no-v-padding"
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                line1={
                    <span className="flex-row scroll-hidden">
                        {tableItem.isDraft && <React.Fragment><Pill color={draftColor} size={PillSize.compact} variant={PillVariant.colored}>Draft</Pill>&nbsp;</React.Fragment>}
                        {tableItem.title}
                    </span>
                }
                line2={
                    <span className="fontSize font-size secondary-text">
                        {tableItem.repository.name}
                    </span>
                }
            />
        );
    }

    private static renderStatusCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<IPullRequestDetail>, tableItem: IPullRequestDetail, ariaRowIndex?: number): JSX.Element {
        return ( <PullRequestStatus columnIndex={columnIndex} tableColumn={tableColumn} pullRequest={tableItem} /> );
    }

    private renderReviewersCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        const reviewers: JSX.Element[] = tableItem.reviewers.map(value => PullRequestTableRendering.renderIdentityIcon(value));
        return PullRequestTableRendering.renderSimpleStringCell(reviewers, rowIndex, columnIndex, tableColumn);
    }
}