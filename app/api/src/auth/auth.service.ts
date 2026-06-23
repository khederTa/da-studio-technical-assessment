import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    // Type safety guaranteed by using User.name and Model<UserDocument>
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ id: string; name: string; email: string; role: string; scopeUserId: string }> {
    const { email, name, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      email,
      name,
      password: hashedPassword,
      scopeUserId: undefined,
    });

    newUser.scopeUserId = String(newUser._id);
    await newUser.save();

    return {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      scopeUserId: String(newUser.scopeUserId),
    };
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    user: { id: string; name: string; email: string; role: string; scopeUserId: string };
  }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Force strict conversion to primitive types to completely satisfy ESLint properties
    const payload = {
      sub: String(user._id),
      email: String(user.email),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        scopeUserId: String(user.scopeUserId || user._id),
      },
    };
  }
}
