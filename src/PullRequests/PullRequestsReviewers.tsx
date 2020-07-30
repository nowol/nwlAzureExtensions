import React from 'react';
import {IdentityRefWithVote} from "azure-devops-extension-api/Git/Git";
import * as WebApi from "azure-devops-extension-api/WebApi/WebApi";
import {PullRequestPersona} from "./PullRequestPersona";

export interface IPullRequestsReviewersProps {
    reviewers: IdentityRefWithVote[];
}

interface IPullRequestsReviewerProps {
    reviewer: IdentityRefWithVote;
}

class PullRequestsReviewer extends React.Component<IPullRequestsReviewerProps, {}> {

    private static getClassName(reviewer: IdentityRefWithVote): string | undefined {
        switch (reviewer.vote) {
            case 10:
                return "pull-request-approved";
            case 5:
                return "pull-request-approved-with-suggestions";
            case -5:
                return "pull-request-waiting-for-author";
            case -10:
                return "pull-request-rejected";
            default:
                return undefined;
        }
    }

    render(): JSX.Element {
        const {reviewer} = this.props;

        return (
                <span className="pull-request-reviewer" title={reviewer.displayName}>
                    <span className={PullRequestsReviewer.getClassName(reviewer)}>
                        <PullRequestPersona identity={reviewer} size={"small"} />
                    </span>
                </span>
        );
    }
}

export class PullRequestsReviewers extends React.Component<IPullRequestsReviewersProps, {}> {
    render(): JSX.Element {
        return (<div className="flex-row flex-wrap" key="abc" >{this.props.reviewers.map(value => <PullRequestsReviewer key={"icon-" + value.id}  reviewer={value}/>)}</div>);
    }
}