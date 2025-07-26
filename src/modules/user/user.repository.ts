import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User | null> {
    const user = this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.password,
        name: dto.name,
        role: dto.role,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    if (!user) {
      return false;
    }

    return true;
  }

  async updateUser(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({});
  }
}
