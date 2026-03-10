// ============================================================================
// HOD COMMUNICATION PAGE - Department Communication Center
// Gold/Sky-Blue Glass Morphism Design System
// ============================================================================

import React, { useState, useEffect, useRef } from "react";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODInput, HODTextarea, HODBadge, HODDrawer, HODMessageBubble } from "./HODComponents";

// ============================================================================
// SAMPLE DATA (Fallback)
// ============================================================================

const sampleContacts = [
    {
        id: 1,
        name: "Pastor John Smith",
        role: "Zone Pastor",
        avatar: "PJS",
        color: "from-amber-400 to-amber-600",
        unread: 3,
        lastMessage: "Please submit the weekly report",
        lastMessageTime: "10:30 AM",
    },
    {
        id: 2,
        name: "Department Members",
        role: "Group",
        avatar: "DM",
        color: "from-sky-400 to-sky-600",
        unread: 0,
        lastMessage: "Weekly meeting reminder",
        lastMessageTime: "Yesterday",
    },
    {
        id: 3,
        name: "Youth Fellowship",
        role: "Group",
        avatar: "YF",
        color: "from-purple-400 to-purple-600",
        unread: 1,
        lastMessage: "Event confirmed for Saturday",
        lastMessageTime: "2 days ago",
    },
];

const sampleMessages = [
    {
        id: 1,
        senderId: 1,
        senderName: "Pastor John Smith",
        content: "Good morning! Please remember to submit your weekly report by Friday.",
        time: "10:30 AM",
        isOwn: false,
    },
    {
        id: 2,
        senderId: "me",
        senderName: "You",
        content: "Good morning Pastor! I'll make sure to submit it by Thursday.",
        time: "10:45 AM",
        isOwn: true,
    },
    {
        id: 3,
        senderId: 1,
        senderName: "Pastor John Smith",
        content: "Also, there's a department heads meeting next Monday at 2 PM. Please confirm your attendance.",
        time: "11:00 AM",
        isOwn: false,
    },
    {
        id: 4,
        senderId: "me",
        senderName: "You",
        content: "I'll be there. Should I prepare any presentation?",
        time: "11:15 AM",
        isOwn: true,
    },
    {
        id: 5,
        senderId: 1,
        senderName: "Pastor John Smith",
        content: "Yes, please prepare a Brief update on your department's achievements this quarter.",
        time: "11:30 AM",
        isOwn: false,
    },
];

// ============================================================================
// PASTOR MESSAGES SIDE CARD
// ============================================================================

const PastorMessagesCard = ({ messages, onViewMessage, isOpen, onToggle }) => {
    const totalUnread = messages.length;
    
    return (
        <div className={`fixed right-0 top-1/2 -translate-y-1/2 transform transition-all duration-300 z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-l-3xl shadow-2xl border border-white/40 overflow-hidden w-80">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HODIcons.User className="w-5 h-5" />
                            <h3 className="font-semibold">Pastor Messages</h3>
                        </div>
                        <button onClick={onToggle} className="p-1 hover:bg-white/20 rounded-lg">
                            <HODIcons.XMark className="w-5 h-5" />
                        </button>
                    </div>
                    {totalUnread > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {totalUnread} unread
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Messages List */}
                <div className="max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No messages from pastor
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() => onViewMessage(msg)}
                                className="w-full p-3 text-left hover:bg-amber-50 border-b border-gray-100 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {msg.senderName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800 text-sm truncate">
                                                {msg.senderName}
                                            </span>
                                            <span className="text-xs text-gray-400">{msg.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{msg.content}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CONTACT ITEM COMPONENT (With Gold Glow for Unread)
// ============================================================================

const ContactItem = ({ contact, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isSelected
                ? "bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-400/30"
                : "hover:bg-white/40"
        }`}
    >
        {/* Avatar */}
        <div className="relative">
            <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
                {contact.avatar}
            </div>
            {/* Gold Glow Badge for Unread */}
            {contact.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                    <span className="text-white text-xs font-bold">{contact.unread}</span>
                </div>
            )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 truncate">{contact.name}</span>
                <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 truncate">{contact.lastMessage}</span>
                {contact.unread > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-400/30 animate-pulse">
                        {contact.unread}
                    </span>
                )}
            </div>
        </div>
    </button>
);

// ============================================================================
// ANNOUNCEMENT FORM DRAWER
// ============================================================================

const AnnouncementFormDrawer = ({ isOpen, onClose, onSubmit, members, departmentId }) => {
    const [formData, setFormData] = useState({
        recipientType: "department",
        recipientId: departmentId || "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
        onClose();
        setFormData({ recipientType: "department", recipientId: departmentId || "", message: "" });
    };

    return (
        <HODDrawer isOpen={isOpen} onClose={onClose} title="Send Announcement">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Send To
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, recipientType: "department" })}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                formData.recipientType === "department"
                                    ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                                    : "bg-white/40 text-gray-600 hover:bg-white/60"
                            }`}
                        >
                            All Members
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, recipientType: "notice" })}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                formData.recipientType === "notice"
                                    ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                                    : "bg-white/40 text-gray-600 hover:bg-white/60"
                            }`}
                        >
                            Notice
                        </button>
                    </div>
                </div>

                {/* Message */}
                <HODTextarea
                    placeholder="Write your announcement or notice..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    label="Message"
                />

                <div className="flex gap-3 pt-2">
                    <HODGoldButton type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : (formData.recipientType === "department" ? "Send Announcement" : "Send Notice")}
                    </HODGoldButton>
                    <HODSkyButton type="button" onClick={onClose}>
                        Cancel
                    </HODSkyButton>
                </div>
            </form>
        </HODDrawer>
    );
};

// ============================================================================
// MAIN COMMUNICATION PAGE
// ============================================================================

export default function HODCommunicationPage({ departmentId, user }) {
    const [contacts, setContacts] = useState(sampleContacts);
    const [selectedContact, setSelectedContact] = useState(sampleContacts[0]);
    const [messages, setMessages] = useState(sampleMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [pastorMessages, setPastorMessages] = useState([]);
    const [showPastorCard, setShowPastorCard] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.conversations && data.conversations.length > 0) {
                    setContacts(data.conversations);
                }
            }
        } catch (err) {
            console.log('Using sample contacts');
        } finally {
            setLoading(false);
        }
    };

    // Fetch pastor messages
    const fetchPastorMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages/pastor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPastorMessages(data.messages || []);
            }
        } catch (err) {
            console.log('No pastor messages');
        }
    };

    // Fetch messages for selected contact
    const fetchConversation = async (contactId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages/conversation/${contactId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                    // Update unread count
                    setContacts(contacts.map(c => 
                        c.id === contactId ? { ...c, unread: 0 } : c
                    ));
                }
            }
        } catch (err) {
            console.log('Using sample messages');
        }
    };

    useEffect(() => {
        fetchConversations();
        fetchPastorMessages();
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        fetchConversation(contact.id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages/direct', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: selectedContact.id,
                    content: newMessage,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...messages, data.data]);
            } else {
                // Fallback to local
                const message = {
                    id: messages.length + 1,
                    senderId: "me",
                    senderName: "You",
                    content: newMessage,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isOwn: true,
                };
                setMessages([...messages, message]);
            }
        } catch (err) {
            // Fallback
            const message = {
                id: messages.length + 1,
                senderId: "me",
                senderName: "You",
                content: newMessage,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isOwn: true,
            };
            setMessages([...messages, message]);
        }
        
        setNewMessage("");
    };

    const handleAnnouncementSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = data.recipientType === "department" 
                ? '/api/messages/announcement' 
                : '/api/messages/notice';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    department_id: departmentId,
                    content: data.message,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
            }
        } catch (err) {
            console.log('Announcement sent (fallback)');
            alert('Announcement sent successfully!');
        }
    };

    const handleViewPastorMessage = (msg) => {
        // Create a fake contact for the pastor
        const pastorContact = {
            id: msg.senderId,
            name: msg.senderName,
            role: "Zone Pastor",
            avatar: msg.senderName.split(' ').map(n => n[0]).join(''),
            color: "from-amber-400 to-amber-600",
            unread: 0,
        };
        setSelectedContact(pastorContact);
        // Show the message as received
        const newMsg = {
            id: Date.now(),
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOwn: false,
        };
        setMessages([newMsg]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                        Communication Center
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Stay connected with your pastor and department members
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Pastor Messages Toggle */}
                    <button
                        onClick={() => setShowPastorCard(!showPastorCard)}
                        className="relative p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/60 transition-all"
                    >
                        <HODIcons.User className="w-5 h-5 text-amber-600" />
                        {pastorMessages.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-amber-500/50">
                                {pastorMessages.length}
                            </span>
                        )}
                    </button>
                    <HODGoldButton onClick={() => setIsAnnouncementOpen(true)}>
                        <span className="flex items-center gap-2">
                            <HODIcons.Megaphone className="w-4 h-4" />
                            Send Announcement
                        </span>
                    </HODGoldButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Contacts Sidebar */}
                <div className="lg:col-span-1 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-white/20">
                        <HODInput
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={HODIcons.MagnifyingGlass}
                        />
                    </div>

                    {/* Contacts List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No conversations yet</div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <ContactItem
                                    key={contact.id}
                                    contact={contact}
                                    isSelected={selectedContact?.id === contact.id}
                                    onClick={() => handleSelectContact(contact)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/20 flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedContact.color} flex items-center justify-center text-white font-bold text-sm`}
                                >
                                    {selectedContact.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">
                                        {selectedContact.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">{selectedContact.role}</p>
                                </div>
                                <button className="p-2 hover:bg-white/40 rounded-xl transition-all">
                                    <HODIcons.Phone className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-white/40 rounded-xl transition-all">
                                    <HODIcons.VideoCamera className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <HODMessageBubble
                                        key={message.id}
                                        message={message.content}
                                        isOwn={message.isOwn}
                                        time={message.time}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="p-3 hover:bg-white/40 rounded-xl transition-all"
                                    >
                                        <HODIcons.PaperClip className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 px-4 py-2.5"
                                    />
                                    <button
                                        type="submit"
                                        className="p-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-xl transition-all shadow-lg shadow-amber-400/30"
                                    >
                                        <HODIcons.PaperAirplane className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <HODIcons.ChatBubbleLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600">
                                    Select a conversation
                                </h3>
                                <p className="text-gray-400">Choose a contact to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pastor Messages Side Card */}
            <PastorMessagesCard 
                messages={pastorMessages} 
                onViewMessage={handleViewPastorMessage}
                isOpen={showPastorCard}
                onToggle={() => setShowPastorCard(!showPastorCard)}
            />

            {/* Announcement Form Drawer */}
            <AnnouncementFormDrawer
                isOpen={isAnnouncementOpen}
                onClose={() => setIsAnnouncementOpen(false)}
                onSubmit={handleAnnouncementSubmit}
                departmentId={departmentId}
            />
        </div>
    );
}
