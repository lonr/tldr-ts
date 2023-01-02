import { projectDirs, projectToString } from 'directories-js';

interface Project {
  qualifier: string;
  organization: string;
  application: string;
}

function directories(project: Project) {
  const projectString = projectToString(project);
  function wrap(resolver: (p: string) => string | null) {
    return () => resolver(projectString);
  }
  return {
    config: wrap(projectDirs.config),
    data: wrap(projectDirs.data),
  };
}

export default directories;
