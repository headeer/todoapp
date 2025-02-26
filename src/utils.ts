export const generateId = (prefix: string = "item", projectId: string = "") => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${projectId}-${timestamp}-${random}`;
};
