export interface TCcourse {

    OrderId: number;
  MemberId: number | null;
  MemberName?: string;
  CourseId: number | null;
  CourseName?: string;
  CoursePrice?: number;
  Quantity?: number;
  OrderDate?: Date;
  OrderStatus?: boolean;
  CategoryName?: string;
  LevelName?: string;
  CoachName?: string;
  StartAt?: Date;
}
