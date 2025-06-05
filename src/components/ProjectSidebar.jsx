import React from 'react';

const ProjectSidebar = ({ projects, currentProject, onProjectSelect, onNewProject, onNewChat }) => {
  return (
    <div className="project-sidebar">
      <div className="sidebar-header">
        <h2>Proyectos</h2>
        <button className="new-btn" onClick={onNewProject}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      
      <div className="project-list">
        {projects.map(project => (
          <div
            key={project.id}
            className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
            onClick={() => onProjectSelect(project)}
          >
            <span className="project-icon">📁</span>
            <span className="project-name">{project.name}</span>
          </div>
        ))}
      </div>
      
      {currentProject && (
        <div className="sidebar-footer">
          <button className="new-chat-btn" onClick={onNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;
