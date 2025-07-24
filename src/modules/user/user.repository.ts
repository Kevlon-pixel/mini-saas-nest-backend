import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(CreateUserDto: any) {
    const user = this.prisma.user.create({
      data: {
        email: CreateUserDto.email,
        password: CreateUserDto.password,
      },
    });

    return user;
  }
}
