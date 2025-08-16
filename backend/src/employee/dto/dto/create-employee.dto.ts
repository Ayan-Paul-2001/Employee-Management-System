import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateEmployeeDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    department: string;

    @IsNotEmpty()
    position: string;
  }
  