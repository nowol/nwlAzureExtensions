import {GitRepository} from "azure-devops-extension-api/Git/Git";

export interface IRepositoryServiceHubContentState {
    repository: GitRepository | null;
}