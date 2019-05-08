import * as ERC20TokenArtifact from '@nexex/contract/dist/artifacts/ERC20Token.json';
import * as ExchangeArtifact from '@nexex/contract/dist/artifacts/Exchange.json';
import * as TokenRegistryArtifact from '@nexex/contract/dist/artifacts/TokenRegistry.json';
import * as TokenTransferProxyArtifact from '@nexex/contract/dist/artifacts/TokenTransferProxy.json';
import * as PortalArtifact from '@nexex/contract/dist/artifacts/Portal.json';
import * as WETHArtifact from '@nexex/contract/dist/artifacts/WETH9.json';
import {Artifact} from '@nexex/types';

export const artifacts = {
    ExchangeArtifact: <Artifact>(<any>ExchangeArtifact),
    ERC20TokenArtifact: <Artifact>(<any>ERC20TokenArtifact),
    TokenTransferProxyArtifact: <Artifact>(<any>TokenTransferProxyArtifact),
    TokenRegistryArtifact: <Artifact>(<any>TokenRegistryArtifact),
    WETHArtifact: <Artifact>(<any>WETHArtifact),
    PortalArtifact: <Artifact>(<any>PortalArtifact)
};
