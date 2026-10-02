import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { getApiBaseUrl } from '../utils/network.js';
import { FileChunker } from '../services/fileChunker.js';
import { useSocket } from './SocketContext.jsx';
import { useSettings } from './SettingsContext.jsx';

const TransferContext = createContext();

export function TransferProvider({ children }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetDevice, setTargetDevice] = useState(null);

  const [sendingState, setSendingState] = useState({
    status: 'idle',
    transferId: null,
    filesProgress: {},
    totalBytes: 0,
    bytesTransferred: 0,
    overallSpeed: 0,
    overallEta: 0,
    overallPercent: 0,
    error: null
  });

  const [receivingState, setReceivingState] = useState({
    isReceiving: true,
    activeTransfers: {},
  });

  const [transferHistory, setTransferHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { socket } = useSocket();
  const { settings } = useSettings();

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/transfers');
      if (res.data.success) {
        setTransferHistory(res.data.transfers);
      }
    } catch (err) {
      console.error('Error fetching transfer history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAccepted = (data) => {
      console.log('Transfer request accepted:', data);
      if (sendingState.transferId === data.transferId || sendingState.status === 'requesting') {
        setSendingState(prev => ({
          ...prev,
          status: 'accepted',
          transferId: data.transferId
        }));
      }
    };

    const handleRejected = (data) => {
      console.log('Transfer request rejected:', data);
      setSendingState(prev => ({
        ...prev,
        status: 'rejected',
        error: data.reason || 'Receiver declined the approval'
      }));
    };

    const handleProgress = (data) => {
      const { transferId, progressPercent, bytesTransferred, totalBytes } = data;
      setReceivingState(prev => {
        const updatedTransfers = { ...prev.activeTransfers };
        if (!updatedTransfers[transferId]) {
          updatedTransfers[transferId] = { bytesTransferred: 0, totalBytes, percent: 0 };
        }
        updatedTransfers[transferId].bytesTransferred = bytesTransferred;
        updatedTransfers[transferId].percent = progressPercent;
        return { ...prev, activeTransfers: updatedTransfers };
      });
    };

    const handleCompleted = (data) => {
      console.log('Transfer completed:', data);
      fetchHistory();
      setReceivingState(prev => {
        const updated = { ...prev.activeTransfers };
        delete updated[data.transferId];
        return { ...prev, activeTransfers: updated };
      });
    };

    socket.on('transfer:accepted', handleAccepted);
    socket.on('transfer:rejected', handleRejected);
    socket.on('transfer:progress', handleProgress);
    socket.on('transfer:completed', handleCompleted);

    return () => {
      socket.off('transfer:accepted', handleAccepted);
      socket.off('transfer:rejected', handleRejected);
      socket.off('transfer:progress', handleProgress);
      socket.off('transfer:completed', handleCompleted);
    };
  }, [socket, sendingState.transferId, sendingState.status]);

  const addFiles = (filesArray) => {
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name + f.size));
      const newUniqueFiles = filesArray.filter(f => !existingNames.has(f.name + f.size));
      return [...prev, ...newUniqueFiles];
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const initiateTransfer = async (targetPayload = null) => {
    const target = targetPayload || targetDevice;
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to send.');
      return;
    }

    const fileMetaList = selectedFiles.map((file, idx) => ({
      id: `file_${idx}_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      totalChunks: Math.ceil(file.size / (4 * 1024 * 1024))
    }));

    const totalBytes = fileMetaList.reduce((acc, f) => acc + f.size, 0);

    setSendingState({
      status: 'requesting',
      transferId: null,
      filesProgress: {},
      totalBytes,
      bytesTransferred: 0,
      overallSpeed: 0,
      overallEta: 0,
      overallPercent: 0,
      error: null
    });

    try {
      const requestBody = {
        senderDevice: settings.deviceName || 'AnySend Sender',
        senderSocketId: socket ? socket.id : null,
        files: fileMetaList,
        sessionId: target ? target.sessionId : null,
        token: target ? target.token : null
      };

      const isHttps = window.location.protocol === 'https:';
      const targetHostUrl = (target && target.host && !isHttps) ? `http://${target.host}:${target.port}` : null;
      const requestEndpoint = targetHostUrl ? `${targetHostUrl}/api/transfer/request` : `${getApiBaseUrl()}/api/transfer/request`;

      const response = await fetch(requestEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Transfer request declined by server');
      }

      const transferId = resData.transferId;

      setSendingState(prev => ({
        ...prev,
        transferId,
        status: target ? 'requesting' : 'accepted'
      }));

      await executeChunkUploads(transferId, fileMetaList, targetHostUrl);

    } catch (err) {
      console.error('Initiate transfer error:', err);
      setSendingState(prev => ({
        ...prev,
        status: 'failed',
        error: err.message
      }));
    }
  };

  const executeChunkUploads = async (transferId, fileMetaList, targetHostUrl) => {
    setSendingState(prev => ({ ...prev, status: 'transferring' }));

    let totalTransferred = 0;
    const grandTotalBytes = fileMetaList.reduce((acc, f) => acc + f.size, 0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const rawFile = selectedFiles[i];
        const meta = fileMetaList[i];

        await FileChunker.uploadFile({
          transferId,
          fileObj: rawFile,
          fileMeta: meta,
          targetHostUrl,
          onProgress: (p) => {
            const fileProgress = p.bytesTransferred;
            const currentTotal = totalTransferred + fileProgress;
            const overallPercent = Math.min(100, Math.round((currentTotal / grandTotalBytes) * 100));

            setSendingState(prev => ({
              ...prev,
              bytesTransferred: currentTotal,
              overallSpeed: p.speed,
              overallEta: p.etaSeconds,
              overallPercent,
              filesProgress: {
                ...prev.filesProgress,
                [meta.id]: p
              }
            }));
          }
        });

        totalTransferred += rawFile.size;
      }

      setSendingState(prev => ({
        ...prev,
        status: 'completed',
        overallPercent: 100
      }));

      fetchHistory();
    } catch (err) {
      console.error('Chunk upload loop error:', err);
      setSendingState(prev => ({
        ...prev,
        status: 'failed',
        error: err.message
      }));
    }
  };

  const cancelTransfer = async () => {
    if (sendingState.transferId) {
      try {
        await api.post(`/transfer/${sendingState.transferId}/cancel`, { reason: 'Cancelled by sender' });
      } catch (e) {
        console.warn('Error sending cancel request:', e);
      }
    }
    setSendingState(prev => ({ ...prev, status: 'cancelled' }));
  };

  const resetSendingState = () => {
    setSendingState({
      status: 'idle',
      transferId: null,
      filesProgress: {},
      totalBytes: 0,
      bytesTransferred: 0,
      overallSpeed: 0,
      overallEta: 0,
      overallPercent: 0,
      error: null
    });
    setSelectedFiles([]);
  };

  return (
    <TransferContext.Provider value={{
      selectedFiles,
      addFiles,
      removeFile,
      clearFiles,
      targetDevice,
      setTargetDevice,
      sendingState,
      receivingState,
      initiateTransfer,
      cancelTransfer,
      resetSendingState,
      transferHistory,
      loadingHistory,
      fetchHistory
    }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  return useContext(TransferContext);
}
