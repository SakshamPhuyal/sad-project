export interface Comment {
  id: string;
  text: string;
  author: string;
}

export interface Answer {
  id: string;
  text: string;
  author: string;
  votes: number;
  comments: Comment[];
}

export interface Question {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  votes: number;
  answers: Answer[];
  comments: Comment[];
}
