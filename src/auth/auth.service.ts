import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SignInResponse,
  SingUpResponse,
} from './interface/authResponse.interface';
import { SignInBodyDTO } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { SignUpBodyDTO } from './dto/SignUp.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async SignIn(payload: SignInBodyDTO): Promise<SignInResponse> {
    const { email, password } = payload;

    const userInDB = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!userInDB) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const isPasswordMatch = await bcrypt.compare(password, userInDB.password);

    if (isPasswordMatch) {
      const JWTpayload = {
        sub: userInDB.user_id,
        user_id: userInDB.user_id,
        name: userInDB.name,
        email: userInDB.email,
      };

      const tokenValue = await this.jwtService.signAsync(JWTpayload);
      const refreshTokenValue = await this.jwtService.signAsync(JWTpayload, {
        expiresIn: '10d',
      });

      return {
        name: userInDB.name,
        email: userInDB.email,
        is2FA: userInDB.is_2fa_active,
        access_token: tokenValue,
        refresh_token: refreshTokenValue,
      };
    } else {
      throw new UnauthorizedException('Wrong email or password');
    }
  }

  async SignUp(payload: SignUpBodyDTO): Promise<SingUpResponse> {
    const { name, email, password } = payload;

    const userInDB = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userInDB) {
      throw new ConflictException('User has been registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashValue = await bcrypt.hash(password, salt);

    await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashValue,
      },
    });

    return {
      message: 'Success SignUp',
      name: name,
      email: email,
    };
  }
}
