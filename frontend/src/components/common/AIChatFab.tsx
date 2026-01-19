import React, { useState } from 'react';
import { Fab, Badge, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Robot Icon
import CloseIcon from '@mui/icons-material/Close';
import { ChatWindow } from '../chat/ChatWindow'; // Adjust path to your existing component

export const AIChatFab = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* 1. The Floating Button */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                <Tooltip title={isOpen ? "Close Support" : "Ask AI Assistant"}>
                    <Fab 
                        color="primary" 
                        aria-label="chat"
                        onClick={() => setIsOpen(!isOpen)}
                        sx={{ 
                            width: 64, height: 64,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            background: isOpen ? '#d32f2f' : '#1976d2' 
                        }}
                    >
                        {isOpen ? <CloseIcon /> : <SmartToyIcon fontSize="large" />}
                    </Fab>
                </Tooltip>
            </div>

            {/* 2. The Chat Window (In AI Mode) */}
            {isOpen && (
                <div style={{ 
                    position: 'fixed', bottom: 100, right: 24, 
                    zIndex: 1000, width: '350px', height: '500px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: '12px',
                    overflow: 'hidden', background: 'white'
                }}>
                    {/* We pass a special prop 'mode' or 'isAI' to tell it to use the API */}
                    <ChatWindow 
                        mode="ai" 
                        onClose={() => setIsOpen(false)} 
                    />
                </div>
            )}
        </>
    );
};