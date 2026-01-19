import React, { useState, useEffect } from 'react';
import { 
    Box, Grid, List, ListItemButton, ListItemAvatar, 
    ListItemText, Avatar, Typography, Divider, Badge, Chip 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import dayjs from 'dayjs';

// 1. Import the Service
import { OperatorService } from '../../services/api/services/OperatorService';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Header } from '../../components/common/Header';

// You can keep this interface for type safety, or import 'InboxItem' from your generated models if available.
interface Conversation {
    bookingId: number;
    lastMessage: string;
    lastSender: string;
    lastTime: string;
    unreadCount: number;
    passengerName: string;
    tripDate: string;
    routeName: string;
}

export const OperatorInbox = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

    useEffect(() => {
        fetchInbox();
        // Poll every 10 seconds for new messages
        const interval = setInterval(fetchInbox, 10000); 
        return () => clearInterval(interval);
    }, []);

    const fetchInbox = async () => {
        try {
            // --- UPDATED: USE REAL SERVICE ---
            // The generated service handles the URL and Headers automatically
            const response = await OperatorService.getOperatorInbox();
            
            // Depending on how your API returns data (wrapped in 'data' or direct array)
            // Based on your previous JSON, it is wrapped in 'data'.
            // @ts-ignore - Ignoring type check temporarily in case generated types differ slightly
            setConversations(response.data || []); 

        } catch (error) {
            console.error("Failed to load inbox", error);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
            <Header />
            
            <Grid container sx={{ flexGrow: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                
                {/* --- LEFT SIDEBAR --- */}
                <Grid item xs={12} md={4} lg={3} sx={{ borderRight: '1px solid #e0e0e0', bgcolor: 'white', overflowY: 'auto' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                        <Typography variant="h6" fontWeight="bold">Inbox</Typography>
                    </Box>
                    
                    <List sx={{ p: 0 }}>
                        {conversations.map((chat) => (
                            <React.Fragment key={chat.bookingId}>
                                <ListItemButton 
                                    selected={selectedBookingId === chat.bookingId}
                                    onClick={() => setSelectedBookingId(chat.bookingId)}
                                    alignItems="flex-start"
                                    sx={{ 
                                        py: 2,
                                        '&.Mui-selected': { bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Badge badgeContent={chat.unreadCount} color="error">
                                            <Avatar sx={{ bgcolor: selectedBookingId === chat.bookingId ? 'primary.main' : 'grey.400' }}>
                                                <PersonIcon />
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                                    {chat.passengerName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(chat.lastTime).format('h:mm A')}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.primary" noWrap sx={{ display: 'block' }}>
                                                    {chat.lastSender === 'operator' && <span style={{color:'#1976d2'}}>You: </span>}
                                                    {chat.lastMessage}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                                                     <Chip 
                                                        icon={<DirectionsBusIcon style={{fontSize: 14}} />} 
                                                        label={dayjs(chat.tripDate).format('DD MMM')} 
                                                        size="small" 
                                                        sx={{ height: 20, fontSize: '0.7rem' }} 
                                                    />
                                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '120px' }}>
                                                        {chat.routeName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                </Grid>

                {/* --- RIGHT PANEL --- */}
                <Grid item xs={12} md={8} lg={9} sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
                    {selectedBookingId ? (
                        <ChatWindow 
                            bookingId={selectedBookingId} 
                            userRole="operator" 
                        />
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', flexDirection: 'column' }}>
                            <DirectionsBusIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                            <Typography variant="h6">Select a conversation to start chatting</Typography>
                        </Box>
                    )}
                </Grid>

            </Grid>
        </Box>
    );
};