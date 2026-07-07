import { Client } from '@notionhq/client';

export default class NotionService {
  constructor() {
    this.client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });
  }

  async getInfo() {
    const database = process.env.NOTION_BLOG_DATABASE_ID ?? '';
    try {
      // list blog posts
      const response = await this.client.databases.query({
        database_id: database,
      });
      return response.results?.map((res) => res.properties) ?? [];
    } catch (err) {
      // ponytail: bad/missing Notion token → render empty instead of crashing the page
      console.error('Notion getInfo failed:', err.message);
      return [];
    }
  }
}
