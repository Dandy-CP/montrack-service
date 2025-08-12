import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { TotpService } from '../totp/totp.service';
import { RedisService } from '../redis/redis.service';
import {
  SignInBodyDTO,
  SignUpBodyDTO,
  RefreshTokenBodyDTO,
  VerifyNew2FABodyDTO,
  Validate2FABodyDTO,
  Disable2FABodyDTO,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private walletService: WalletService,
    private totpService: TotpService,
    private redisService: RedisService,
  ) {}

  async getLogedUser(userId: string) {
    const userInCache = await this.redisService.get(`session:${userId}`);

    if (userInCache) {
      return userInCache;
    }

    throw new UnauthorizedException('User not authenticated');
  }

  async logOutUser(userId: string) {
    const userInCache = await this.redisService.get(`session:${userId}`);

    if (userInCache) {
      // get all cache key value
      const allCacheKey = await this.redisService.getAllKeys(userId);

      // loop array of string value to delete each keys
      for (const value of allCacheKey) {
        await this.redisService.delete(value);
      }

      return {
        message: 'Success Logout',
      };
    }

    throw new UnauthorizedException('User not authenticated');
  }

  async SignIn(payload: SignInBodyDTO) {
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

    if (userInDB.is_2fa_active) {
      return {
        message: '2FA is enabled please validate',
        userId: userInDB.user_id,
      };
    }

    const jwtPayload = {
      sub: userInDB.user_id,
      user_id: userInDB.user_id,
      name: userInDB.name,
      email: userInDB.email,
      is_2fa_active: userInDB.is_2fa_active,
    };

    const access_token = await this.jwtService.signAsync(jwtPayload);
    const refresh_token = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED,
    });

    await this.redisService.setUserSession({
      user_id: userInDB.user_id,
      name: userInDB.name,
      email: userInDB.email,
      is_2fa_active: userInDB.is_2fa_active,
      access_token,
      refresh_token,
    });

    return {
      message: 'Success login',
      name: userInDB.name,
      email: userInDB.email,
      access_token,
      refresh_token,
    };
  }

  async SignUp(payload: SignUpBodyDTO) {
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

    const jwtValue = this.jwtService.decode(payload.refresh_token);

    const jwtPayload = {
      sub: jwtValue.user_id,
      user_id: jwtValue.user_id,
      name: jwtValue.name,
      email: jwtValue.email,
      is_2fa_active: jwtValue.is_2fa_active,
    };

    const access_token = await this.jwtService.signAsync(jwtPayload);
    const refresh_token = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED,
    });

    await this.redisService.delete(`session:${jwtValue.user_id}`);
    await this.redisService.setUserSession({
      user_id: jwtValue.user_id,
      name: jwtValue.name,
      email: jwtValue.email,
      is_2fa_active: jwtValue.is_2fa_active,
      access_token,
      refresh_token,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async enable2FA(userId: string) {
    const userInDB = await this.prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!userInDB) {
      throw new NotFoundException('User not found');
    }

    if (userInDB.is_2fa_active) {
      throw new UnprocessableEntityException('User has been enabled 2FA');
    }

    const { qr_code, base32_secret } = await this.totpService.CreateTotp(
      userInDB.name,
    );

    return {
      qrCode: qr_code,
      secret: base32_secret,
    };
  }

  async verifyNew2FA(payload: VerifyNew2FABodyDTO, userId: string) {
    const userInDB = await this.prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!userInDB) {
      throw new NotFoundException('User not found');
    }

    if (userInDB.is_2fa_active) {
      throw new UnprocessableEntityException('User has been enabled 2FA');
    }

    const { token_otp } = this.totpService.VerifyTotp(payload.totp_secret);

    if (payload.token_pin === token_otp) {
      const updatedValue = await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          is_2fa_active: true,
          totp_secrete: payload.totp_secret,
        },
      });

      return {
        message: 'Success actived 2FA',
        updatedValue,
      };
    } else {
      throw new UnprocessableEntityException('Inputed pin not valid');
    }
  }

  async validate2FA(payload: Validate2FABodyDTO) {
    const userInDB = await this.prisma.user.findUnique({
      where: {
        user_id: payload.user_id,
      },
    });

    if (!userInDB) {
      throw new NotFoundException('User not found');
    }

    if (!userInDB.is_2fa_active) {
      throw new UnprocessableEntityException('User has not enabled 2FA');
    }

    const { token_otp } = this.totpService.VerifyTotp(userInDB.totp_secrete!);

    if (payload.token_pin === token_otp) {
      const jwtPayload = {
        sub: userInDB.user_id,
        user_id: userInDB.user_id,
        name: userInDB.name,
        email: userInDB.email,
      };

      const access_token = await this.jwtService.signAsync(jwtPayload);
      const refresh_token = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRED,
      });

      await this.redisService.setUserSession({
        user_id: userInDB.user_id,
        name: userInDB.name,
        email: userInDB.email,
        is_2fa_active: userInDB.is_2fa_active,
        access_token,
        refresh_token,
      });

      return {
        message: 'Success login',
        name: userInDB.name,
        email: userInDB.email,
        access_token,
        refresh_token,
      };
    } else {
      throw new UnprocessableEntityException('Inputed pin not valid');
    }
  }

  async disable2FA(payload: Disable2FABodyDTO, userId: string) {
    const userInDB = await this.prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!userInDB) {
      throw new NotFoundException('User not found');
    }

    if (!userInDB.is_2fa_active) {
      throw new UnprocessableEntityException('User has not enabled 2FA');
    }

    const { token_otp } = this.totpService.VerifyTotp(userInDB.totp_secrete!);

    if (payload.token_pin === token_otp) {
      await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          is_2fa_active: false,
          totp_secrete: null,
        },
      });

      return {
        message: 'Success disable 2FA',
      };
    } else {
      throw new UnprocessableEntityException('Inputed pin not valid');
    }
  }
}
