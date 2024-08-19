import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id?: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  username: string;

  @Column({
    nullable: false,
  })
  password?: string;

  @Field(() => GraphQLISODateTime)
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at?: Date;

  @Field(() => GraphQLISODateTime)
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at?: Date;
}
