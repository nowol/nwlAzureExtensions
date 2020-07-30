import {VssPersona} from "azure-devops-ui/VssPersona";
import React from "react";
import * as WebApi from "azure-devops-extension-api/WebApi/WebApi";
import {VssPersonaSize} from "azure-devops-ui/Components/VssPersona/VssPersona.Props";
import {css} from "azure-devops-ui/Util";


export interface IPullRequestPersonaProps {
    identity: WebApi.IdentityRef;
    size: VssPersonaSize
}

interface IPullRequestPersonaState {
    imageError: boolean
}

export class PullRequestPersona extends React.Component<IPullRequestPersonaProps, IPullRequestPersonaState> {
    state = {imageError: false};

    render(): JSX.Element {
        const {identity, size} = this.props;
        const {imageError} = this.state;

        if (imageError) {
            const initialsIdentityProvider = {
                getDisplayName() {
                    return identity.displayName;
                },
                getIdentityImageUrl(size: number) {
                    return undefined;
                }
            };

            return (<VssPersona key={"icon-" + identity.id}
                                size={size}
                                identityDetailsProvider={initialsIdentityProvider}
                                imgAltText={identity.displayName}/>);
        }

        const that = this;

        return (<div className={css("vss-Persona flex-noshrink", size)}>
            <img key={"icon-" + identity.id}
                 className="vss-Persona-content using-image"
                 src={this.getReviewerImage(identity)}
                 alt={identity.displayName}
                 onError={() => that.onImageError()}/>
        </div>);
    }

    private getReviewerImage(reviewer: WebApi.IdentityRef): string {
        if (reviewer._links?.["avatar"]?.href) {
            return reviewer._links?.["avatar"].href;
        }

        return reviewer.imageUrl;
    }

    private onImageError() {
        //console.log("error loading image")
        this.setState({imageError: true})
    }
}