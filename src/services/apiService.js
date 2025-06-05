import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const sendGuestChatMessage = async (content) => {
  try {
    const response = await axios.post(
      `${API_URL}/guest-chat`,
      { content }
    );
    return response.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const sendAuthenticatedMessage = async (projectId, chatId, content, options = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const formData = new FormData();
    formData.append('content', content);
    formData.append('project_id', projectId);
    if (chatId) formData.append('chat_id', chatId);
    if (options.deep_research) formData.append('deep_research', 'true');
    if (options.file) formData.append('file', options.file);
    
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/chat`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const searchInvestors = async (projectId, params) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/search-investors`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const searchEmployees = async (projectId, investorIds) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/search-employees`,
      { investor_ids: investorIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const generateTemplate = async (projectId, params) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/templates/generate`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
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