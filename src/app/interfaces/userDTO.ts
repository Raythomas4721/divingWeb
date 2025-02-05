export interface UserDTO {
  memberId: number;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  memberAddress?: string;
  memberGender?: string;
  recentLogin?: string;
  urgentContact?: string;
  urgentPhone?: string;
}
