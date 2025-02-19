export interface TNreviewDTO {
  reviewId?: number;
  memberId?: number;
  memberName?: string;
  productId?: number;
  reviewContent?: string;
  reviewRating: number;
  createdDate?: Date; // or Date
}
