import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import {
  SignInResponse,
  SingUpResponse,
} from './interface/authResponse.interface';
import {
  SignInBodyDTO,
  SignUpBodyDTO,
  RefreshTokenBodyDTO,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private walletService: WalletService,
  ) {}

  async SignIn(payload: SignInBodyDTO): Promise<SignInResponse> {
    const userInDB = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    const isPasswordMatch = await bcrypt.compare(
      payload.password,
      userInDB ? userInDB.password : '',
    );

    if (!userInDB || !isPasswordMatch) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const jwtPayload = {
      sub: userInDB.user_id,
      user_id: userInDB.user_id,
      name: userInDB.name,
      email: userInDB.email,
    };

    const access_token = await this.jwtService.signAsync(jwtPayload);
    const refresh_token = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: '10d',
    });

    return {
      name: userInDB.name,
      email: userInDB.email,
      is2FA: userInDB.is_2fa_active,
      access_token,
      refresh_token,
    };
  }

  async SignUp(payload: SignUpBodyDTO): Promise<SingUpResponse> {
    const userInDB = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (userInDB) {
      throw new UnprocessableEntityException('User has been registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashValue = await bcrypt.hash(payload.password, salt);

    const createdValue = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashValue,
      },
    });

    // Create new wallet when user signup
    const walletPayload = {
      wallet_name: 'Main Wallet',
      wallet_amount: 0,
    };

    await this.walletService.CreateWallet(
      walletPayload,
      createdValue.user_id,
      true,
    );

    return {
      name: payload.name,
      email: payload.email,
    };
  }

  async refreshToken(payload: RefreshTokenBodyDTO) {
    await this.jwtService
      .verifyAsync(payload.refresh_token, {
        secret: process.env.JWT_SECRET,
      })
      .catch((error) => {
        throw new InternalServerErrorException(error);
      });

    const jwtValue = await this.jwtService
      .decode(payload.refresh_token)
      .catch((error: any) => {
        throw new InternalServerErrorException(error);
      });

    const jwtPayload = {
      sub: jwtValue.user_id,
      user_id: jwtValue.user_id,
      name: jwtValue.name,
      email: jwtValue.email,
    };

    const access_token = await this.jwtService.signAsync(jwtPayload);
    const refresh_token = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: '10d',
    });

    return {
      access_token,
      refresh_token,
    };
  }
}
