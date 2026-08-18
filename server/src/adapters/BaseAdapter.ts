export interface IRawJob {
  externalId: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  url: string;
  postedAt: Date;
}

export interface ISourceAdapter {
  fetchAndParse(): Promise<IRawJob[]>;
  getSourceName(): string;
}