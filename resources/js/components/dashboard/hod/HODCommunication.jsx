// ============================================================================
// HOD COMMUNICATION PAGE - Department Communication Center
// Gold/Sky-Blue Glass Morphism Design System
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODInput, HODTextarea, HODBadge, HODDrawer, HODMessageBubble } from "./HODComponents";

// ============================================================================
// SAMPLE DATA
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
        content: "Yes, please prepare a brief update on your department's achievements this quarter.",
        time: "11:30 AM",
        isOwn: false,
    },
];

// ============================================================================
// CONTACT ITEM COMPONENT
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
        <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
            {contact.avatar}
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
                    <span className="ml-2 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full animate-pulse">
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

const AnnouncementFormDrawer = ({ isOpen, onClose, onSubmit, contacts }) => {
    const [formData, setFormData] = useState({
        recipient: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        setFormData({ recipient: "", subject: "", message: "" });
    };

    return (
        <HODDrawer isOpen={isOpen} onClose={onClose} title="Send Announcement">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient
                    </label>
                    <select
                        value={formData.recipient}
                        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                        className="w-full bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 px-4 py-2.5"
                    >
                        <option value="">Select recipient...</option>
                        <option value="all">All Department Members</option>
                        {contacts.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subject */}
                <HODInput
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    icon={HODIcons.PencilSquare}
                />

                {/* Message */}
                <HODTextarea
                    placeholder="Write your announcement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                />

                <div className="flex gap-3 pt-2">
                    <HODGoldButton type="submit" className="flex-1">
                        Send Announcement
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

export default function HODCommunicationPage() {
    const [selectedContact, setSelectedContact] = useState(sampleContacts[0]);
    const [messages, setMessages] = useState(sampleMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredContacts = sampleContacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: messages.length + 1,
            senderId: "me",
            senderName: "You",
            content: newMessage,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOwn: true,
        };

        setMessages([...messages, message]);
        setNewMessage("");
    };

    const handleAnnouncementSubmit = (data) => {
        console.log("Announcement sent:", data);
        // In a real app, this would send the announcement via API
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
                <HODGoldButton onClick={() => setIsAnnouncementOpen(true)}>
                    <span className="flex items-center gap-2">
                        <HODIcons.Megaphone className="w-4 h-4" />
                        Send Announcement
                    </span>
                </HODGoldButton>
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
                        {filteredContacts.map((contact) => (
                            <ContactItem
                                key={contact.id}
                                contact={contact}
                                isSelected={selectedContact?.id === contact.id}
                                onClick={() => setSelectedContact(contact)}
                            />
                        ))}
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

            {/* Announcement Form Drawer */}
            <AnnouncementFormDrawer
                isOpen={isAnnouncementOpen}
                onClose={() => setIsAnnouncementOpen(false)}
                onSubmit={handleAnnouncementSubmit}
                contacts={sampleContacts}
            />
        </div>
    );
}
