import * as React from "react";
import {IPullRequestDetail} from "./IPullRequestDetail";
import {ITableColumn, TwoLineTableCell} from "azure-devops-ui/Table";
import {CommentThreadStatus, CommentType, PullRequestAsyncStatus} from "azure-devops-extension-api/Git/Git";
import {Pill, PillSize, PillVariant} from "azure-devops-ui/Pill";
import {IColor} from "azure-devops-ui/Utilities/Color";
import {getClient} from "azure-devops-extension-api";
import {GitRestClient} from "azure-devops-extension-api/Git";

export interface IPullRequestStatusProps {
    pullRequest: IPullRequestDetail;
    columnIndex: number;
    tableColumn: ITableColumn<IPullRequestDetail>;
}

interface IPullRequestStatusState {
    resolvedComments: number;
    totalComments: number;
}

const conflictColor: IColor = {
    red: 205,
    green: 74,
    blue: 69
};

export class PullRequestStatus extends React.Component<IPullRequestStatusProps, IPullRequestStatusState> {
    constructor(props: IPullRequestStatusProps) {
        super(props);

        this.state = {resolvedComments: 0, totalComments: 0};
    }

    private static getMergeStatusElement(tableItem: IPullRequestDetail): React.ReactNode {
        if (tableItem.mergeStatus === PullRequestAsyncStatus.Conflicts) {
            return (<Pill color={conflictColor} size={PillSize.compact} variant={PillVariant.colored}>Conflict</Pill>);
        }

        return PullRequestAsyncStatus[tableItem.mergeStatus]
    }

    public async componentDidMount() {
        const {pullRequest} = this.props;
        const gitClient = getClient(GitRestClient);

        const threads = await gitClient.getThreads(pullRequest.repository.id, pullRequest.pullRequestId);
        console.log("threads", threads);

        let totalComments = 0;
        let resolvedComments = 0;

        for (let thread of threads) {
            if (!thread.isDeleted && thread.comments) {
                let containsNormalComments = thread.comments.some(value => value.commentType == CommentType.Text);
                if (containsNormalComments) {
                    totalComments++;

                    if (thread.status == CommentThreadStatus.Closed) {
                        resolvedComments++;
                    }
                }
            }
        }

        this.setState({
            totalComments: totalComments,
            resolvedComments: resolvedComments
        });
    }

    public render() {
        const {columnIndex, tableColumn, pullRequest} = this.props;
        const {resolvedComments, totalComments} = this.state;

        return (
                <TwoLineTableCell
                        className="bolt-table-cell-content-with-inline-link no-v-padding"
                        key={"col-" + columnIndex}
                        columnIndex={columnIndex}
                        tableColumn={tableColumn}
                        line1={PullRequestStatus.getMergeStatusElement(pullRequest)}
                        line2={
                            <span className="fontSize font-size secondary-text">
                        {resolvedComments} / {totalComments}
                    </span>
                        }
                />
        );
    }
}