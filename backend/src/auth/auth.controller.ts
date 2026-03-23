import { Body, Controller, ForbiddenException, Get, Headers, NotFoundException, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('profiles')
  profiles() {
    return this.authService.getPublicProfiles();
  }

  @Get('profiles/:id')
  async profileById(@Param('id') id: string) {
    const user = await this.authService.getPublicProfileById(id);
    if (!user) throw new NotFoundException('Profil nebyl nalezen.');
    return user;
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromAuthHeader(authorization);
    if (!user) throw new UnauthorizedException('Nejste přihlášeni.');
    return user;
  }

  @Patch('me')
  async updateMe(@Body() body: UpdateProfileDto, @Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromAuthHeader(authorization);
    if (!user) throw new UnauthorizedException('Nejste přihlášeni.');
    return this.authService.updateProfile(user.id, { ...body, role: undefined });
  }

  @Get('admin/users')
  async listUsers(@Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromAuthHeader(authorization);
    if (!user) throw new UnauthorizedException('Nejste přihlášeni.');
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('Pouze pro admina.');
    return this.authService.listUsersForAdmin();
  }

  @Patch('admin/users/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateProfileDto, @Headers('authorization') authorization?: string) {
    const user = await this.authService.getUserFromAuthHeader(authorization);
    if (!user) throw new UnauthorizedException('Nejste přihlášeni.');
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('Pouze pro admina.');
    return this.authService.updateUserForAdmin(id, body);
  }
}
