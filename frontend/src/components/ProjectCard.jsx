function ProjectCard({ project }) {
  return (
    <div>
      <h3>{project.name}</h3>
      <p>Sector: {project.sector}</p>
      <p>State: {project.state}</p>
    </div>
  );
}

export default ProjectCard;