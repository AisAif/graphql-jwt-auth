import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, Length } from "class-validator";

@InputType()
export class RegisterInput {
    @IsNotEmpty()
    @Length(3, 50)
    @Field()
    name: string;
    
    @IsNotEmpty()
    @Length(3, 20)
    @Field()
    username: string;
    
    @Length(8, 255)
    @IsNotEmpty()
    @Field()
    password: string;
    
    @Length(8, 255)
    @IsNotEmpty()
    @Field()
    password_confirmation: string;
}