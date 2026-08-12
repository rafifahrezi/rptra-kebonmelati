export interface IKnowledge {
  _id?: string;
  title: string;
  category: string;
  content: string;
  embedding?: number[];
  sourceId?: string;
  createdAt?: Date;
}
