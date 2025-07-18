import { UserCourseBuyDto } from '../dto/user.dto';

export class User {
  id: string;
  walletAddress: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  chainId: number;
  firstLogin: Date;
  isInitialized: boolean;
  profileId?: string;
  courseBuy?: UserCourseBuyDto[];
}

export interface UserCourseBuy {
  id: string;
  courseId: string;
  userId: string;
  createAt: Date;
  isFinished: boolean;
  course?: Course;
  user?: User;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  badge?: string;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  finishReward: number;
  type?: CourseType;
  chapters?: Chapter[];
  userCourseBuy?: UserCourseBuy[];
  userProgress?: UserProgress[];
  courseLength?: number;
  userProgressLength?: number;
  userBrought?: boolean;
}

export interface CourseType {
  id: string;
  name: string;
  description?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
  course?: Course;
  userProgress?: UserProgress[];
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  course?: Course;
  chapter?: Chapter;
}
