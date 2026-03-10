<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     */
    public function conversations(Request $request)
    {
        $userId = Auth::id();
        
        // Get all unique conversations (sent and received)
        $sentMessages = Message::where('sender_id', $userId)
            ->where('recipient_type', 'user')
            ->select('receiver_id')
            ->distinct()
            ->get()
            ->pluck('receiver_id');
            
        $receivedMessages = Message::where('receiver_id', $userId)
            ->where('recipient_type', 'user')
            ->select('sender_id')
            ->distinct()
            ->get()
            ->pluck('sender_id');
        
        $contactIds = $sentMessages->merge($receivedMessages)->unique();
        
        $conversations = [];
        foreach ($contactIds as $contactId) {
            $contact = User::find($contactId);
            if (!$contact) continue;
            
            $lastMessage = Message::where(function ($query) use ($userId, $contactId) {
                $query->where(function ($q) use ($userId, $contactId) {
                    $q->where('sender_id', $userId)->where('receiver_id', $contactId);
                })->orWhere(function ($q) use ($userId, $contactId) {
                    $q->where('sender_id', $contactId)->where('receiver_id', $userId);
                });
            })->latest()->first();
            
            $unreadCount = Message::where('sender_id', $contactId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();
            
            // Get role display
            $role = $contact->role ?? 'Member';
            $roleLabel = match($role) {
                'hod' => 'Department HOD',
                'pastor' => 'Zone Pastor',
                'leader' => 'Home Group Leader',
                default => 'Member'
            };
            
            $conversations[] = [
                'id' => $contact->id,
                'name' => $contact->first_name . ' ' . $contact->last_name,
                'role' => $roleLabel,
                'avatar' => strtoupper(substr($contact->first_name ?? 'U', 0, 1) . substr($contact->last_name ?? 'U', 0, 1)),
                'color' => $role === 'pastor' ? 'from-amber-400 to-amber-600' : 'from-sky-400 to-sky-600',
                'unread' => $unreadCount,
                'lastMessage' => $lastMessage ? $lastMessage->content : '',
                'lastMessageTime' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '',
            ];
        }
        
        // Sort by last message time
        usort($conversations, function ($a, $b) {
            return strcmp($b['lastMessageTime'], $a['lastMessageTime']);
        });
        
        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get messages for a specific conversation.
     */
    public function conversation(Request $request, $contactId)
    {
        $userId = Auth::id();
        
        $messages = Message::where(function ($query) use ($userId, $contactId) {
            $query->where(function ($q) use ($userId, $contactId) {
                $q->where('sender_id', $userId)->where('receiver_id', $contactId);
            })->orWhere(function ($q) use ($userId, $contactId) {
                $q->where('sender_id', $contactId)->where('receiver_id', $userId);
            });
        })->orderBy('created_at', 'asc')->get();
        
        // Mark messages as read
        Message::where('sender_id', $contactId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
        
        $formattedMessages = $messages->map(function ($msg) use ($userId) {
            return [
                'id' => $msg->id,
                'senderId' => $msg->sender_id,
                'senderName' => $msg->sender->first_name . ' ' . $msg->sender->last_name,
                'content' => $msg->content,
                'time' => $msg->created_at->format('h:i A'),
                'isOwn' => $msg->sender_id === $userId,
                'created_at' => $msg->created_at->toISOString(),
            ];
        });
        
        return response()->json([
            'messages' => $formattedMessages,
        ]);
    }

    /**
     * Send a direct message.
     */
    public function sendDirect(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);
        
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'content' => $validated['content'],
            'type' => 'direct',
            'recipient_type' => 'user',
            'is_read' => false,
        ]);
        
        return response()->json([
            'message' => 'Message sent successfully',
            'data' => [
                'id' => $message->id,
                'senderId' => $message->sender_id,
                'senderName' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                'content' => $message->content,
                'time' => $message->created_at->format('h:i A'),
                'isOwn' => true,
                'created_at' => $message->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Send an announcement to department members.
     */
    public function sendAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'content' => 'required|string',
        ]);
        
        // Get all members of the department
        $departmentMembers = User::where('department_id', $validated['department_id'])->get();
        
        $messages = [];
        foreach ($departmentMembers as $member) {
            $message = Message::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $member->id,
                'department_id' => $validated['department_id'],
                'content' => $validated['content'],
                'type' => 'announcement',
                'recipient_type' => 'department',
                'is_read' => false,
            ]);
            $messages[] = $message;
        }
        
        return response()->json([
            'message' => 'Announcement sent to ' . count($messages) . ' members',
            'recipients_count' => count($messages),
        ], 201);
    }

    /**
     * Send a notice to department.
     */
    public function sendNotice(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'content' => 'required|string',
        ]);
        
        // Similar to announcement but marked as notice
        $departmentMembers = User::where('department_id', $validated['department_id'])->get();
        
        $messages = [];
        foreach ($departmentMembers as $member) {
            $message = Message::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $member->id,
                'department_id' => $validated['department_id'],
                'content' => $validated['content'],
                'type' => 'notice',
                'recipient_type' => 'department',
                'is_read' => false,
            ]);
            $messages[] = $message;
        }
        
        return response()->json([
            'message' => 'Notice sent to ' . count($messages) . ' members',
            'recipients_count' => count($messages),
        ], 201);
    }

    /**
     * Get total unread messages count.
     */
    public function unreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->count();
        
        return response()->json([
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);
        
        if ($message->receiver_id === Auth::id()) {
            $message->update(['is_read' => true]);
        }
        
        return response()->json([
            'message' => 'Message marked as read',
        ]);
    }

    /**
     * Get pastor messages (from users with pastor role).
     */
    public function pastorMessages()
    {
        $pastorIds = User::where('role', 'pastor')->pluck('id');
        
        $messages = Message::whereIn('sender_id', $pastorIds)
            ->where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'senderId' => $msg->sender_id,
                    'senderName' => $msg->sender->first_name . ' ' . $msg->sender->last_name,
                    'content' => $msg->content,
                    'time' => $msg->created_at->diffForHumans(),
                    'created_at' => $msg->created_at->toISOString(),
                ];
            });
        
        return response()->json([
            'messages' => $messages,
            'count' => $messages->count(),
        ]);
    }

    /**
     * Get department members for messaging.
     */
    public function departmentMembers(Request $request)
    {
        $departmentId = $request->get('department_id');
        
        $members = User::where('department_id', $departmentId)
            ->where('id', '!=', Auth::id())
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'role' => $user->role ?? 'Member',
                    'avatar' => strtoupper(substr($user->first_name ?? 'U', 0, 1) . substr($user->last_name ?? 'U', 0, 1)),
                ];
            });
        
        return response()->json([
            'members' => $members,
        ]);
    }
}
