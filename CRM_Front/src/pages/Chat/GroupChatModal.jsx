import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { chatService } from '../../lib/chatService';

const GroupChatModal = ({ users, org_id, onClose, onCreate }) => {
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  // Convert base64 image to data URL
  const getImageSrc = (base64Image) => {
    if (base64Image && base64Image.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${base64Image}`;
    }
    return null;
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError(t('chat.group_name_required'));
      return;
    }
    if (selectedUsers.length === 0) {
      setError(t('chat.select_users'));
      return;
    }

    try {
      const { chat_id } = await chatService.createGroupChat(groupName, selectedUsers, org_id);
      const newChat = { _id: chat_id, type: 'group', name: groupName, members: selectedUsers.map(id => ({ user_id: id })) };
      console.log('Created group chat:', newChat);
      onCreate(newChat);
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError(err.message || t('chat.create_group_error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {t('chat.create_group')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="absolute top-0 right-0 px-4 py-3"
              aria-label={t('common.dismiss_error')}
            >
              <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            {t('chat.group_name')}
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('chat.group_name_placeholder')}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            {t('chat.select_users')}
          </label>
          <div className="max-h-40 overflow-y-auto">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  {user.user_image ? (
                    <img src={getImageSrc(user.user_image)} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                      <span className="text-gray-600">{user.name?.[0] || '?'}</span>
                    </div>
                  )}
                  <span className="text-gray-800 dark:text-gray-100">{user.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreateGroup}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            {t('chat.create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;