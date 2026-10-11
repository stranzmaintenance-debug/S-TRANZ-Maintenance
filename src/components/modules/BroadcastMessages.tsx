import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Bell,
  CheckCircle2,
  Shield,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { BroadcastMessage } from '../../types';
import { ReportToolbar } from '../common/ReportToolbar';

export const BroadcastMessages: React.FC = () => {
  const {
    currentUser,
    users,
    broadcastMessages,
    sendBroadcastMessage,
    markMessageAsRead
  } = useData();

  const isAdmin = currentUser?.role === 'Admin';

  // State for composing message
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected message for viewing
  const [readingMessage, setReadingMessage] = useState<BroadcastMessage | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only authorized Admin users can broadcast messages.');
      return;
    }
    if (!title || !message) {
      alert('Please provide both message title and body content.');
      return;
    }
    sendBroadcastMessage(title, message, priority);
    setTitle('');
    setMessage('');
    setPriority('Normal');
  };

  const handleOpenMessage = (msg: BroadcastMessage) => {
    markMessageAsRead(msg.id);
    setReadingMessage(msg);
  };

  // Filter messages
  const filteredMessages = broadcastMessages.filter(m => {
    if (dateFrom && m.sentAt < dateFrom) return false;
    if (dateTo && m.sentAt > dateTo) return false;
    return true;
  });

  const reportHeaders = ['Timestamp', 'Title', 'Priority', 'Sender', 'Total Users Read', 'Content Summary'];
  const reportRows = filteredMessages.map(m => [
    m.sentAt,
    m.title,
    m.priority,
    m.senderName,
    `${m.readByUsers.length} of ${users.length} Users`,
    m.message.slice(0, 80)
  ]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-400" />
            <span>Broadcast Messages & In-App Announcements</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-user communication system. Admin announcements are delivered immediately to all registered users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Registered Users:</span>
          <span className="font-mono font-bold text-orange-400 text-sm px-2.5 py-1 bg-[#060a12] border border-[#1e2f50] rounded-lg">
            {users.length} Users
          </span>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Broadcast Communications Audit Report"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onResetDates={() => {
          setDateFrom('');
          setDateTo('');
        }}
        headers={reportHeaders}
        rows={reportRows}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (ADMIN ONLY): COMPOSE BROADCAST MESSAGE */}
        {isAdmin ? (
          <div className="lg:col-span-1 bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 sm:p-5 shadow-lg h-fit space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1b2b48]">
              <Shield className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Broadcast New Announcement
              </h3>
            </div>

            <form onSubmit={handleSend} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Tyre Inspection / Highway Advisory"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 focus:border-orange-500 focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Action Required</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Broadcast Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type message to broadcast to all registered staff, managers, and drivers..."
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast to All Users</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-1 bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 shadow-lg text-xs space-y-3">
            <h3 className="font-bold text-white uppercase text-xs">Broadcast Feed Info</h3>
            <p className="text-slate-400">
              You are logged in as a normal user. You can receive and read announcements broadcast by management in this feed.
            </p>
          </div>
        )}

        {/* RIGHT COLUMN: USER INBOX & PREVIOUS BROADCASTS */}
        <div className={`space-y-4 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
          <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48] mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Announcements Inbox ({filteredMessages.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any message to read full announcement
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredMessages.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No broadcast messages at this time.
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isRead = currentUser ? msg.readByUsers.includes(currentUser.id) : true;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        !isRead
                          ? 'bg-[#101b33] border-orange-500/70 shadow-md'
                          : 'bg-[#070c17] border-[#18263e] hover:border-[#223554]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              !isRead ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'
                            }`}
                          />
                          <h4 className="text-xs font-bold text-white truncate max-w-sm">
                            {msg.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              msg.priority === 'Urgent'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : msg.priority === 'High'
                                ? 'bg-orange-950 text-orange-400 border border-orange-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {msg.priority}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {msg.sentAt}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-[#142036] flex items-center justify-between text-[10px] text-slate-500">
                        <span>Sender: <strong className="text-slate-400">{msg.senderName}</strong></span>
                        <div className="flex items-center gap-3">
                          {isAdmin && (
                            <span>Read by: <strong className="text-orange-400 font-mono">{msg.readByUsers.length}</strong> users</span>
                          )}
                          <span className="text-orange-400 font-semibold hover:underline">
                            Read Announcement →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* READING MESSAGE MODAL */}
      {readingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-[#1a2a46]">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      readingMessage.priority === 'Urgent'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : readingMessage.priority === 'High'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {readingMessage.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{readingMessage.sentAt}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{readingMessage.title}</h3>
                <p className="text-[11px] text-slate-400">Broadcast by: {readingMessage.senderName}</p>
              </div>
              <button
                type="button"
                onClick={() => setReadingMessage(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-200 leading-relaxed bg-[#070c17] p-4 rounded-lg my-3 border border-[#16233a] whitespace-pre-wrap">
              {readingMessage.message}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marked as Read
              </span>
              <button
                type="button"
                onClick={() => setReadingMessage(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-[#142036] hover:bg-[#1b2b48] rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
