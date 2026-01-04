import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

let socketInstance = null;
let currentToken = null;
let currentOrgId = null;
let currentBranch = null;

export const getSocket = (accessToken, orgId, branch = null) => {
  // Check if we need to create a new connection or reconnect
  const tokenChanged = currentToken !== accessToken;
  const orgChanged = currentOrgId !== orgId;
  const branchChanged = currentBranch !== branch;
  
  // If token, org, or branch changed, disconnect and create new connection
  if (socketInstance && (tokenChanged || orgChanged)) {
    console.log('Socket: Token or org changed, disconnecting old socket');
    socketInstance.disconnect();
    socketInstance = null;
    currentToken = null;
    currentOrgId = null;
    currentBranch = null;
  }

  // If socket exists and is connected, just update branch room if needed
  if (socketInstance && socketInstance.connected) {
    if (branchChanged && branch) {
      console.log('Socket: Branch changed, joining new branch room:', branch);
      socketInstance.emit('join_branch', { branch });
      currentBranch = branch;
    }
    return socketInstance;
  }

  // Create new socket connection
  console.log('Socket: Creating new connection');
  socketInstance = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: {
      token: accessToken,
    },
    query: {
      org_id: orgId,
      ...(branch && { branch }),
    },
  });

  currentToken = accessToken;
  currentOrgId = orgId;
  currentBranch = branch;

  socketInstance.on('connect', () => {
    console.log('Socket connected:', socketInstance.id);
    // Join organization room
    if (orgId) {
      socketInstance.emit('join_org', { org_id: orgId });
      console.log('Socket: Joined org room:', `org:${orgId}`);
    }
    // Join branch room if branch is provided
    if (branch) {
      socketInstance.emit('join_branch', { branch });
      console.log('Socket: Joined branch room:', `branch:${branch}`);
    }
  });

  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

