import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { 
  type Node, type Edge, Controls, Background, 
  useNodesState, useEdgesState, addEdge, type Connection, 
  useReactFlow, ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import { Box, Paper, Typography, Button, TextField, Divider } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// --- IMPORTS ---
import { BusStopNode } from '../../components/flow/BusStopNode';
import { Sidebar } from '../../components/flow/Sidebar';
import { EditStopDialog } from '../../components/flow/EditStopDialog'; // <--- Imported
import { EditEdgeDialog } from '../../components/flow/EditEdgeDialog'; // <--- Imported
import { OperatorService } from '../../services/api/services/OperatorService';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const RouteCreatorContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();
  const navigate = useNavigate();
  const nodeTypes = useMemo(() => ({ busStop: BusStopNode }), []);

  // Header State
  const [routeName, setRouteName] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editEdgeOpen, setEditEdgeOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, animated: true, label: '0 km', type: 'default', style: { strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      const newNode: Node = {
          id: `node-${Date.now()}`,
          type,
          position,
          data: { label: `New Stop`, isTerminus: false },
      };
      setNodes((nds) => nds.concat(newNode));
  }, [project, setNodes]);

  // --- Handlers for Opening Dialogs ---
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditDialogOpen(true);
  }, []);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setEditEdgeOpen(true);
  }, []);

  // --- Handlers for Saving Dialog Data ---
  const onSaveNode = (newData: any) => {
    if (!selectedNode) return;
    setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, ...newData } } : n)));
  };

  const onSaveEdge = (newLabel: string) => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.map((e) => (e.id === selectedEdge.id ? { ...e, label: newLabel } : e)));
    setEditEdgeOpen(false);
  };

  const handleSaveRoute = async () => {
    if(!routeName || !routeDuration) {
        alert("Please enter Route Name and Total Duration.");
        return;
    }
    if (nodes.length === 0) return;

    const targetNodeIds = new Set(edges.map((e) => e.target));
    const startNode = nodes.find((n) => !targetNodeIds.has(n.id));

    if (!startNode) {
      alert("Error: No Start Node found!");
      return;
    }

    const sortedStops = [];
    let currentNode: Node | undefined = startNode;
    let order = 1;
    let totalCalculatedDistance = 0;

    while (currentNode) {
      // Priority: Node Box -> Fallback: Edge Line
      let finalDistance = Number(currentNode.data.distance) || 0;
      if (finalDistance === 0) {
          const incomingEdge = edges.find(e => e.target === currentNode?.id);
          if (incomingEdge && incomingEdge.label) {
             finalDistance = parseInt((incomingEdge.label as string).replace(/\D/g, '')) || 0;
          }
      }

      totalCalculatedDistance += finalDistance;

      sortedStops.push({
        stop_name: currentNode.data.label,
        order_id: order,
        distance: finalDistance, 
        price: Number(currentNode.data.price) || 0,
        estimated_time: currentNode.data.estimated_time || '00:00',
        stop_type: currentNode.data.stop_type || 'Both'
      });

      const outgoingEdge = edges.find((e) => e.source === currentNode?.id);
      if (outgoingEdge) {
        currentNode = nodes.find((n) => n.id === outgoingEdge.target);
        order++;
      } else {
        currentNode = undefined;
      }
    }

    const finalPayload = {
        route_name: routeName,
        total_distance: totalCalculatedDistance, 
        estimated_time: routeDuration,
        stops: sortedStops
    };

    try {
        await OperatorService.createRoute(finalPayload);
        navigate('/operator/dashboard');
    } catch (err) {
        console.error(err);
        alert("Error connecting to server");
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>Creator</Typography>
        <Divider orientation="vertical" flexItem />
        <TextField label="Route Name" size="small" value={routeName} onChange={(e) => setRouteName(e.target.value)} sx={{ width: 250 }} />
        <TextField label="Total Duration" size="small" value={routeDuration} onChange={(e) => setRouteDuration(e.target.value)} sx={{ width: 150 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" size="large" startIcon={<SaveIcon />} onClick={handleSaveRoute} sx={{ fontWeight: 'bold', px: 4 }}>
            Save Route
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', flexGrow:1, height: '100%'}}>
            <Sidebar />
            <Paper elevation={3} sx={{ flexGrow: 1, border: '1px solid #ddd' }}>
                <div style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes} edges={edges}
                        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onConnect={onConnect} nodeTypes={nodeTypes}
                        onDrop={onDrop} onDragOver={onDragOver}
                        onNodeDoubleClick={onNodeDoubleClick} onEdgeDoubleClick={onEdgeDoubleClick}
                        fitView
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                    </ReactFlow>
                </div> 
            </Paper>
      </Box>

      <EditStopDialog 
          open={editDialogOpen} 
          handleClose={() => setEditDialogOpen(false)}
          initialData={selectedNode?.data}
          onSave={onSaveNode}
      />

      <EditEdgeDialog 
          open={editEdgeOpen}
          handleClose={() => setEditEdgeOpen(false)}
          initialLabel={selectedEdge?.label as string || ''}
          onSave={onSaveEdge}
      />
    </Box>
  );
};

export const RouteCreator = () => (
    <ReactFlowProvider>
        <RouteCreatorContent />
    </ReactFlowProvider>
);