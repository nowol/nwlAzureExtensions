import * as WebApi from "azure-devops-extension-api/WebApi/WebApi";
import {
    GitRepository,
    IdentityRefWithVote,
    PullRequestAsyncStatus,
    PullRequestMergeFailureType,
    PullRequestStatus
} from "azure-devops-extension-api/Git/Git";

export interface IPullRequestDetail {
    /**
     * The URL to see the details of the pull request.
     */
    pullRequestUrl: string;
    /**
     * The identity of the user who created the pull request.
     */
    createdBy: WebApi.IdentityRef;
    /**
     * The date when the pull request was created.
     */
    creationDate: Date;
    /**
     * Draft / WIP pull request.
     */
    isDraft: boolean;
    /**
     * If set, pull request merge failed for this reason.
     */
    mergeFailureMessage: string;
    /**
     * The type of failure (if any) of the pull request merge.
     */
    mergeFailureType: PullRequestMergeFailureType;
    /**
     * The current status of the pull request merge.
     */
    mergeStatus: PullRequestAsyncStatus;
    /**
     * The ID of the pull request.
     */
    pullRequestId: number;
    /**
     * The repository containing the target branch of the pull request.
     */
    repository: GitRepository;
    /**
     * A list of reviewers on the pull request along with the state of their votes.
     */
    reviewers: IdentityRefWithVote[];
    /**
     * The name of the source branch of the pull request.
     */
    sourceRefName: string;
    /**
     * The status of the pull request.
     */
    status: PullRequestStatus;
    /**
     * The name of the target branch of the pull request.
     */
    targetRefName: string;
    /**
     * The title of the pull request.
     */
    title: string;
}