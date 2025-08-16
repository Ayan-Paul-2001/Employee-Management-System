import { IsInt, Min, Max, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  employeeId: number;

  @IsString()
  @IsNotEmpty()
  review_text: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsDateString()
  review_date: string;
} 