import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient({
  id: process.env.EDGE_CONFIG_ID,
});

export async function getConfigValue(key) {
  return await edgeConfig.get(key);
}
