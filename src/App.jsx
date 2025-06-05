import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { sendGuestChatMessage, searchInvestors, searchEmployees } from './services/apiService';
import ProjectSidebar from './components/ProjectSidebar';
import ContentSidebar from './components/ContentSidebar';
import ChatInterface from './components/ChatInterface';
import LoginModal from './components/LoginModal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [investors, setInvestors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isDeepResearch, setIsDeepResearch] = useState(false);

  useEffect(() => {
    checkUser();
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserProjects(session.user.id);
      }
    });
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      loadUserProjects(session.user.id);
    }
  };

  const loadUserProjects = async (userId) => {
    const { data, error } = await supabase
      .table('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setProjects(data);
  };

  const handleDeepResearch = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setIsDeepResearch(!isDeepResearch);
  };

  const createNewProject = async () => {
    const name = prompt('Nombre del nuevo proyecto:');
    if (name) {
      const { data, error } = await supabase
        .table('projects')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (data) {
        setProjects([data, ...projects]);
        setCurrentProject(data);
      }
    }
  };

  const createNewChat = async () => {
    if (!currentProject) return;
    
    const { data, error } = await supabase
      .table('chats')
      .insert({ 
        project_id: currentProject.id,
        title: `Chat ${new Date().toLocaleString()}`
      })
      .select()
      .single();
    
    if (data) {
      setCurrentChat(data);
    }
  };

  return (
    <div className="app-container">
      <ProjectSidebar 
        projects={projects}
        currentProject={currentProject}
        onProjectSelect={setCurrentProject}
        onNewProject={() => user ? createNewProject() : setShowLoginModal(true)}
        onNewChat={() => user ? createNewChat() : null}
      />
      
      {currentProject && (
        <ContentSidebar
          project={currentProject}
          onChatSelect={setCurrentChat}
          investors={investors}
          employees={employees}
          user={user}
        />
      )}
      
      <div className="main-content">
        <div className="header">
          <h1>0BULLSHIT AI</h1>
          <div className="header-actions">
            <button 
              className={`deep-research-btn ${isDeepResearch ? 'active' : ''}`}
              onClick={handleDeepResearch}
              title={!user ? 'Inicia sesión para usar Deep Research' : 'Activar Deep Research'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.867 18 18 14.867 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18ZM19.485 18.071L22.314 20.899L20.899 22.314L18.071 19.485L19.485 18.071Z" fill="currentColor"/>
              </svg>
              Deep Research {isDeepResearch ? 'ON' : 'OFF'}
            </button>
            {!user ? (
              <button className="login-btn" onClick={() => setShowLoginModal(true)}>
                Iniciar Sesión
              </button>
            ) : (
              <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
        
        <ChatInterface
          currentChat={currentChat}
          currentProject={currentProject}
          user={user}
          isDeepResearch={isDeepResearch}
          onInvestorsFound={setInvestors}
          onEmployeesFound={setEmployees}
          onLoginRequired={() => setShowLoginModal(true)}
        />
      </div>
      
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default App;