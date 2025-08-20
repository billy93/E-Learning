"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "../dashboard/layout"
import { 
  MessageSquare, 
  Send, 
  Search,
  User,
  Clock,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react"

interface Message {
  id: string
  fromId: string
  toId: string
  fromName: string
  toName: string
  body: string
  createdAt: string
  isRead: boolean
}

interface User {
  id: string
  name: string
  role: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (session) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session && selectedUser) {
      fetchMessages(selectedUser.id)
    }
  }, [session, selectedUser])

  if (!session) {
    return <div>Loading...</div>
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/messages/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toId: selectedUser.id,
          body: newMessage
        })
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(selectedUser.id)
        fetchUsers() // Refresh users to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Baru saja'
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-400px)] flex gap-6">
      {/* Users List */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pesan</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{user.name}</h3>
                      <p className="text-xs text-gray-600">{user.role}</p>
                      {user.lastMessage && (
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {user.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {user.lastMessageTime && (
                      <p className="text-xs text-gray-500 mb-1">
                        {formatTime(user.lastMessageTime)}
                      </p>
                    )}
                    {user.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.role}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromId === session.user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.fromId === session.user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.body}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {formatTime(message.createdAt)}
                      </p>
                      {message.fromId === session.user.id && (
                        <div className="ml-2">
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3 opacity-70" />
                          ) : (
                            <Check className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Pilih pengguna untuk memulai percakapan</p>
            </div>
          </CardContent>
        )}
      </Card>
      </div>
    </DashboardLayout>
  )
}