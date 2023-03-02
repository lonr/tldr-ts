import envPaths from 'env-paths';

function directories(name: string) {
  return envPaths(name, { suffix: '' });
}

export default directories;
