import { Injectable } from '@nestjs/common';
import { TOTP, Secret, URI } from 'otpauth';
import { toDataURL } from 'qrcode';

@Injectable()
export class TotpService {
  totp = new TOTP({
    issuer: 'Montrack',
    algorithm: 'SHA1',
    digits: 6,
  });
  secret = Secret;
  uri = URI;

  async CreateTotp(username: string) {
    const base32_secret = new this.secret({ size: 20 }).base32;

    this.totp.label = username;
    this.totp.secret = this.secret.fromBase32(base32_secret);

    const otpAuthUrl = this.uri.stringify(this.totp);
    const QR = await toDataURL(otpAuthUrl);

    return {
      qr_code: QR,
      base32_secret,
    };
  }

  VerifyTotp(totp_secret: string) {
    this.totp.secret = this.secret.fromBase32(totp_secret);
    const TokenOTP = this.totp.generate();

    return {
      token_otp: TokenOTP,
    };
  }
}
