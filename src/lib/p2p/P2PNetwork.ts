import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

export class P2PNetwork {
  private peer: Peer;
  private connections: Map<string, Peer.DataConnection>;
  private nodeId: string;

  constructor() {
    this.nodeId = uuidv4();
    this.connections = new Map();
    this.peer = new Peer(this.nodeId);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('P2P Error:', err);
    });
  }

  private handleConnection(conn: Peer.DataConnection) {
    conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  private handleIncomingData(data: any) {
    // Handle incoming data from peers
    if (data.type === 'NEURAL_UPDATE') {
      // Process neural network updates
    }
  }

  public connect(peerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = this.peer.connect(peerId);
      
      conn.on('open', () => {
        this.connections.set(peerId, conn);
        resolve();
      });

      conn.on('error', (err) => {
        reject(err);
      });
    });
  }

  public broadcast(data: any) {
    this.connections.forEach((conn) => {
      conn.send(data);
    });
  }

  public getNodeId(): string {
    return this.nodeId;
  }

  public getPeerCount(): number {
    return this.connections.size;
  }

  public disconnect() {
    this.connections.forEach((conn) => conn.close());
    this.peer.destroy();
  }
}