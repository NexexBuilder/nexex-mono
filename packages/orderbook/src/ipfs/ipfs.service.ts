import {Injectable} from '@nestjs/common';
import IPFS from 'ipfs';
import {ObConfig} from '../global/global.model';
import {defer, Defer} from '../utils/defer';

const defaultOptions = {
    EXPERIMENTAL: {
        pubsub: true
    },
    repo: 'ipfs-private',
    init: true,
    config: {
        Addresses: {
            Swarm: [
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                '/dns4/wstar.nexex.info/tcp/443/wss/p2p-websocket-star/'
            ]
        }
    }
};

export interface IPFSMessage {
    data: Buffer;
    from: string;
    seqno: Buffer;
    topicIDs: string[];
}

@Injectable()
export class IpfsService {
    ipfsNode;
    id: string;
    private ready: Defer<void> = defer();

    constructor(private config: ObConfig) {
        if (config.ipfs.enabled) {
            this.ipfsNode = new IPFS({...defaultOptions, repo: config.ipfs.repo});
            this.ipfsNode.on('ready', () => {
                this.ipfsNode.id((err, {id}) => {
                    this.id = id;
                    this.ready.resolve();
                });
            });
        }
    }

    async subscribe(topic: string, handler: (msg: IPFSMessage) => void): Promise<void> {
        if (this.config.ipfs.enabled) {
            await this.ready.promise;
            return this.ipfsNode.pubsub.subscribe(topic, handler);
        }
    }

    async unsubscribe(topic: string): Promise<void> {
        if (this.config.ipfs.enabled) {
            await this.ready.promise;
            return this.ipfsNode.pubsub.unsubscribe(topic);
        }
    }

    async publish(topic: string, data: any): Promise<void> {
        if (this.config.ipfs.enabled) {
            await this.ready.promise;
            const Buffer = this.ipfsNode.types.Buffer;
            this.ipfsNode.pubsub.publish(topic, Buffer.from(data));
        }
    }

    getTopic(marketId: string): string {
        return `${this.config.ipfs.prefix}${marketId}`;
    }
}
