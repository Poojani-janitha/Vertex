import React from 'react';

const Messages = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#06402B] mb-2">Messages</h2>
        <p className="text-gray-500 text-sm">Chat directly with employers about jobs you've applied to.</p>
      </div>

      <div className="text-center py-20 bg-gray-100/30 rounded-2xl border border-gray-200 border-dashed">
        <div className="text-gray-600 text-5xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 font-semibold">No active conversations</h3>
        <p className="text-gray-550 text-xs mt-2">When an employer starts a conversation, it will show up here.</p>
      </div>
    </div>
  );
};

export default Messages;
