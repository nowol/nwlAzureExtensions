import {IHostNavigationService} from "azure-devops-extension-api";
import {ITableBreakpoint, ITableColumn, SimpleTableCell, TwoLineTableCell} from "azure-devops-ui/Table";
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
import {BreakPointNames} from "./BreakPointNames";
import {PullRequestsReviewers} from "./PullRequestsReviewers";
import {Ago} from "azure-devops-ui/Ago";
import {Icon, IconSize} from "azure-devops-ui/Icon";

const draftColor: IColor = {
    red: 0,
    green: 90,
    blue: 158
};

interface BreakPointDefinition {
    name: BreakPointNames;
    width: number;
}

export class PullRequestTableRendering {
    private navService: IHostNavigationService;

    constructor(navService: IHostNavigationService) {
        this.navService = navService;
        const columnsDef = this.buildColumns();

        this.columns = columnsDef.map(value => value.tableColumnDefinition);
        this.sortDefinitions = columnsDef.map(value => value.sortDefinition);
        this.breakPoints = this.computeBreakPoints(columnsDef);
    }

    public breakPoints: ITableBreakpoint[];
    public columns: ITableColumn<IPullRequestDetail>[];
    public sortDefinitions: (((item1: IPullRequestDetail, item2: IPullRequestDetail) => number) | null)[];

    private breakPointDefinitions: BreakPointDefinition[] = [
        {
            name: BreakPointNames.Small,
            width: 1
        },
        {
            name: BreakPointNames.Medium,
            width: 800
        },
        {
            name: BreakPointNames.Large,
            width: 1100
        }
    ]

    private computeBreakPoints(columnDefs: IPullRequestTableColumnDefinition[]): ITableBreakpoint[] {
        const breakPoints: ITableBreakpoint[] = [];

        for (let breakPointDefinition of this.breakPointDefinitions) {
            breakPoints.push({
                breakpoint: breakPointDefinition.width,
                columnWidths: columnDefs.map(value => {
                    if (value.breakpoints.some(bpName => bpName == breakPointDefinition.name)
                        && typeof value.tableColumnDefinition.width === "number") {
                        return value.tableColumnDefinition.width;
                    }
                    return 0;
                })
            })
        }
        console.log(breakPoints);
        return breakPoints;
    }


    private buildColumns(): IPullRequestTableColumnDefinition[] {

        return [
            {
                tableColumnDefinition: {
                    id: "id",
                    minWidth: 60,
                    name: "ID",
                    readonly: true,
                    renderCell: this.renderIdCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted low to high",
                        ariaLabelDescending: "Sorted high to low"
                    },
                    width: 60
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.pullRequestId - item2.pullRequestId;
                },
                breakpoints: [BreakPointNames.Medium, BreakPointNames.Large]
            },
            {
                tableColumnDefinition: {
                    id: "createdBy",
                    minWidth: 50,
                    name: "Created By",
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderCreatedByCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted A to Z",
                        ariaLabelDescending: "Sorted Z to A"
                    },
                    width: 180
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.createdBy.displayName!.localeCompare(item2.createdBy.displayName!);
                },
                breakpoints: [BreakPointNames.Small, BreakPointNames.Medium, BreakPointNames.Large]
            },
            {
                tableColumnDefinition: {
                    id: "title",
                    minWidth: 50,
                    name: "Title",
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderTitleCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted A to Z",
                        ariaLabelDescending: "Sorted Z to A"
                    },
                    width: -50
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.title!.localeCompare(item2.title!);
                },
                breakpoints: [BreakPointNames.Small, BreakPointNames.Medium]
            },
            {
                tableColumnDefinition: {
                    id: "repository",
                    minWidth: 50,
                    name: "Repository",
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderRepositoryCell,
                    sortProps: {
                        ariaLabelAscending: "Sorted A to Z",
                        ariaLabelDescending: "Sorted Z to A"
                    },
                    width: -50
                },
                sortDefinition: (item1: IPullRequestDetail, item2: IPullRequestDetail): number => {
                    return item1.repository.name.localeCompare(item2.repository.name);
                },
                breakpoints: [BreakPointNames.Large]
            },
            {
                tableColumnDefinition: {
                    id: "status",
                    minWidth: 50,
                    name: "Status",
                    readonly: true,
                    renderCell: PullRequestTableRendering.renderStatusCell,
                    width: 100
                },
                sortDefinition: null,
                breakpoints: [BreakPointNames.Medium, BreakPointNames.Large]
            },
            {
                tableColumnDefinition: {
                    id: "reviewers",
                    minWidth: 50,
                    name: "Reviewers",
                    readonly: true,
                    renderCell: this.renderReviewersCell,
                    width: 150
                },
                sortDefinition: null,
                breakpoints: [BreakPointNames.Small, BreakPointNames.Medium, BreakPointNames.Large]
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
                        <Ago date={tableItem.creationDate} tooltipProps={{text: tableItem.creationDate.toLocaleString()}} />
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

    private static cleanUpBranchName(ref: string): string {
        return ref.split('/').slice(2).join('/');
    }

    private static renderRepositoryCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        return (
            <TwoLineTableCell
                className="bolt-table-cell-content-with-inline-link no-v-padding"
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                line1={tableItem.repository.name}
                line2={
                    <span className="fontSize font-size secondary-text">
                        {PullRequestTableRendering.cleanUpBranchName(tableItem.sourceRefName)}
                        &nbsp;
                        <Icon iconName="DoubleChevronRight" style={{fontSize: "0.5rem", lineHeight: "0.5rem"}} />
                        &nbsp;
                        {PullRequestTableRendering.cleanUpBranchName(tableItem.targetRefName)}
                    </span>
                }
            />
        );
    }

    private static renderTitleText(tableItem: IPullRequestDetail): JSX.Element {
        return (
                <span className="flex-row scroll-hidden">
                    {tableItem.isDraft && <React.Fragment><Pill color={draftColor} size={PillSize.compact} variant={PillVariant.colored}>Draft</Pill>&nbsp;</React.Fragment>}
                    {tableItem.title}
                </span>
        );
    }

    private static renderTitleCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        return (<SimpleTableCell columnIndex={columnIndex}>
                    {PullRequestTableRendering.renderTitleText(tableItem)}
                </SimpleTableCell>);
    }

    private static renderStatusCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<IPullRequestDetail>, tableItem: IPullRequestDetail, ariaRowIndex?: number): JSX.Element {
        return ( <PullRequestStatus columnIndex={columnIndex} tableColumn={tableColumn} pullRequest={tableItem} /> );
    }

    private renderReviewersCell<T extends IPullRequestDetail>(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<T>, tableItem: T, ariaRowIndex?: number): JSX.Element {
        return <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}>
                <PullRequestsReviewers reviewers={tableItem.reviewers} />
               </SimpleTableCell>
    }
}