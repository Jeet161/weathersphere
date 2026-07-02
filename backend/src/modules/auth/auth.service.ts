import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;
const MAX_REFRESH_TOKENS = 5; // per user — revoke oldest when exceeded

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Registration ─────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName ?? null,
        settings: { create: {} }, // default settings
      },
      select: { id: true, email: true, displayName: true, avatarUrl: true, createdAt: true },
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { user, ...tokens };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, ...safeUser } = user;
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: safeUser, ...tokens };
  }

  // ─── Token Refresh ────────────────────────────────────────────────────────

  async refresh(userId: string, rawRefreshToken: string) {
    const tokenHash = await bcrypt.hash(rawRefreshToken, SALT_ROUNDS);

    // Find a valid token for this user
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    // Verify one of them matches the raw token
    let matchedToken: (typeof storedTokens)[0] | undefined;
    for (const t of storedTokens) {
      if (await bcrypt.compare(rawRefreshToken, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      // Possible token reuse — revoke all tokens for this user (security measure)
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });
      throw new ForbiddenException('Refresh token invalid or reused — please log in again');
    }

    // Revoke the used token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, avatarUrl: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user.id, user.email);
    return { user, ...tokens };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(userId: string, rawRefreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    for (const t of storedTokens) {
      if (await bcrypt.compare(rawRefreshToken, t.tokenHash)) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out from all devices' };
  }

  // ─── Token Issuance ───────────────────────────────────────────────────────

  private async issueTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
      },
    );

    const rawRefreshToken = uuidv4() + '-' + uuidv4(); // opaque random token
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, SALT_ROUNDS);

    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const expiresAt = this.parseExpiresIn(refreshExpiresIn);

    // Prune old tokens if user has too many
    const existingCount = await this.prisma.refreshToken.count({
      where: { userId, revokedAt: null },
    });

    if (existingCount >= MAX_REFRESH_TOKENS) {
      const oldest = await this.prisma.refreshToken.findMany({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'asc' },
        take: existingCount - MAX_REFRESH_TOKENS + 1,
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: { in: oldest.map((t) => t.id) } },
        data: { revokedAt: new Date() },
      });
    }

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: refreshTokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private parseExpiresIn(expiresIn: string): Date {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);
    const now = new Date();
    if (unit === 'd') now.setDate(now.getDate() + value);
    else if (unit === 'h') now.setHours(now.getHours() + value);
    else if (unit === 'm') now.setMinutes(now.getMinutes() + value);
    return now;
  }
  async googleLogin(googleUser: { email: string; displayName: string; avatarUrl: string | null }) {
  let user = await this.prisma.user.findUnique({ where: { email: googleUser.email } });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        email: googleUser.email,
        passwordHash: '',
        displayName: googleUser.displayName,
        avatarUrl: googleUser.avatarUrl,
        settings: { create: {} },
      },
    });
  }

  const tokens = await this.issueTokens(user.id, user.email);
  return { user, ...tokens };
}
}
