import {GitRepository} from "azure-devops-extension-api/Git/Git";
import {IPullRequestDetail} from "./IPullRequestDetail";

export interface IRepositoryServiceHubContentState {
    repository: GitRepository | null;
    pullRequests?: IPullRequestDetail[] | null;
}