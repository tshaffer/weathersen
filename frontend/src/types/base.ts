export const getServerUrl = (): string => {
  return (window as any).__ENV__?.BACKEND_URL || 'http://localhost:8080';
};

export const apiUrlFragment = '/api/v1/';

