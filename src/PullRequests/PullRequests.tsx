import "./PullRequests.scss";
import "azure-devops-ui/Core/override.css";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import {GitServiceIds, IVersionControlRepositoryService} from "azure-devops-extension-api/Git/GitServices";
import {Header, TitleSize} from "azure-devops-ui/Header";
import {Page} from "azure-devops-ui/Page";
import {showRootComponent} from "../Common";
import * as Git from "azure-devops-extension-api/Git/Git";
import {PullRequestStatus} from "azure-devops-extension-api/Git/Git";
import {
    CommonServiceIds,
    getClient,
    IHostNavigationService,
    ILocationService,
    IProjectPageService
} from "azure-devops-extension-api";
import {GitPullRequestSearchCriteria, GitRestClient} from "azure-devops-extension-api/Git";
import {ArrayItemProvider} from "azure-devops-ui/Utilities/Provider";
import {Card} from "azure-devops-ui/Card";
import {ColumnSorting, sortItems, SortOrder, Table} from "azure-devops-ui/Table";
import {IPullRequestDetail} from "./IPullRequestDetail";
import {PullRequestTableRendering} from "./PullRequestTableRendering";
import {IRepositoryServiceHubContentState} from "./IRepositoryServiceHubContentState";
import {ObservableArray, ObservableValue} from "azure-devops-ui/Core/Observable";

const showDebug: boolean = false;

class RepositoryServiceHubContent extends React.Component<{}, IRepositoryServiceHubContentState> {

    navService: IHostNavigationService | undefined;
    gitClient: GitRestClient | undefined;
    columnRendering: PullRequestTableRendering = new PullRequestTableRendering();

    // Create the sorting behavior (delegate that is called when a column is sorted).
    private sortingBehavior = new ColumnSorting<IPullRequestDetail>(
            (
                    columnIndex: number,
                    proposedSortOrder: SortOrder,
                    event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>
            ) => {

                this.itemProvider.value = sortItems<IPullRequestDetail>(
                        columnIndex,
                        proposedSortOrder,
                        this.columnRendering?.sortDefinitions!,
                        this.columnRendering?.columns!,
                        this.itemProvider.value as []
                );

            }
    );

    // https://developer.microsoft.com/en-us/azure-devops/develop/extensions

    constructor(props: {}) {
        super(props);

        this.state = {repository: null};
    }

    public async componentDidMount() {
        await SDK.init();
        const repoSvc = await SDK.getService<IVersionControlRepositoryService>(GitServiceIds.VersionControlRepositoryService);
        const repository = await repoSvc.getCurrentGitRepository();

        this.setState({
            repository
        });
        const locationService = await SDK.getService<ILocationService>(CommonServiceIds.LocationService);
        const hostUrl = await locationService.getServiceLocation();

        this.navService = await SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);
        this.gitClient = getClient(GitRestClient);
        this.columnRendering.setNavService(this.navService);

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        if (project) {
            const criteria: GitPullRequestSearchCriteria = {
                creatorId: "",
                includeLinks: true,
                repositoryId: "",
                reviewerId: "",
                sourceRefName: "",
                sourceRepositoryId: "",
                status: PullRequestStatus.Active,
                targetRefName: ""
            };
            const pullRequests = await this.gitClient.getPullRequestsByProject(project!.name, criteria);
            if (showDebug) {
                console.log("hostUrl", hostUrl); // https://dev.azure.com/<orgname>/
                console.log("project", project);
                console.log("pullRequests", pullRequests);
            }

            this.itemProvider.value = pullRequests.map((value, index) => {
                var details: IPullRequestDetail = {
                    pullRequestUrl: this.buildPullRequestUrl(hostUrl, project!.name, value),
                    createdBy: value.createdBy,
                    creationDate: value.creationDate,
                    isDraft: value.isDraft,
                    mergeFailureMessage: value.mergeFailureMessage,
                    mergeFailureType: value.mergeFailureType,
                    mergeStatus: value.mergeStatus,
                    pullRequestId: value.pullRequestId,
                    repository: value.repository,
                    reviewers: value.reviewers,
                    sourceRefName: value.sourceRefName,
                    status: value.status,
                    targetRefName: value.targetRefName,
                    title: value.title,
                };
                return details;
            });
        }
    }

    private itemProvider = new ObservableArray<IPullRequestDetail | ObservableValue<IPullRequestDetail | undefined>>(new Array(5).fill(new ObservableValue<IPullRequestDetail | undefined>(undefined)));


    public render(): JSX.Element {
        return (
                <Page className="flex-grow">
                    <Header title="Pull Requests Hub" titleSize={TitleSize.Large}/>
                    <div className="page-content page-content-top ">
                        <Card className="page-content flex-grow" contentProps={{contentPadding: false}}>
                            <Table<IPullRequestDetail>
                                    behaviors={[this.sortingBehavior]}
                                    columns={this.columnRendering.columns}
                                    itemProvider={this.itemProvider}
                                    role="table"
                                    onSelect={(event, tableRow) => this.navService!.navigate(tableRow.data.pullRequestUrl)}
                                    onActivate={(event, row) => { /* onActivate is only used to have the pointer on the row */
                                    }}
                            />
                        </Card>
                    </div>
                </Page>
        );
    }

    private buildPullRequestUrl(hostUrl: string, projectName: string, pullRequest: Git.GitPullRequest): string {
        return `${hostUrl + encodeURIComponent(projectName)}/_git/${pullRequest.repository.id}/pullRequest/${pullRequest.pullRequestId}`;
    }
}

showRootComponent(<RepositoryServiceHubContent/>);