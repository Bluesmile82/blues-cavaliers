import { Client } from '@notionhq/client';

export default class NotionService {
  constructor() {
    this.client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });
  }

  async getInfo() {
    const database = process.env.NOTION_BLOG_DATABASE_ID ?? '';
    // list blog posts
    const response = await this.client.databases.query({
      database_id: database,
    });
    if (response.results) {
      return response.results.map((res) => res.properties);
    }
  }
}
