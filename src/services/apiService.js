import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const sendGuestChatMessage = async (messageContent) => {
  try {
    const response = await axios.post(
      `${API_URL}/guest-chat`,
      { content: messageContent }
    );
    return response.data;
  } catch (err) {
    console.error('Error sending guest chat message:', err);
    return { error: true, message: err.message };
  }
};

export const createUserProfile = async (userId, email, fullName = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/profile`,
      { user_id: userId, email, full_name: fullName }
    );
    return response.data;
  } catch (err) {
    console.error('Error creating user profile:', err);
    return { error: true, message: err.message };
  }
}; 