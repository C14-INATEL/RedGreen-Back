import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { User, UserType } from '../src/modules/auth/domain/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let MockUserRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let MockJwtService: Partial<JwtService>;

  const ValidUser: User = {
    UserId: 'user-123',
    Name: 'Jane Doe',
    BirthDate: new Date('1990-12-29'),
    Nickname: 'janed',
    Email: 'jane.doe@example.com',
    Password: 'hashed-password',
    ChipBalance: 1000,
    DailyLoginStreak: 3,
    LastLoginDate: new Date('2026-04-08T00:00:00Z'),
    CreatedAt: new Date('2025-10-01T12:00:00Z'),
    Active: true,
    UserType: UserType.USER,
  };

  beforeEach(async () => {
    MockUserRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    MockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: MockUserRepo,
        },
        {
          provide: JwtService,
          useValue: MockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return the user profile without Password', async () => {
    MockUserRepo.findOne.mockResolvedValue(ValidUser);

    const Result = await service.GetProfile(ValidUser.UserId);

    expect(Result).toEqual(
      expect.objectContaining({
        UserId: ValidUser.UserId,
        Name: ValidUser.Name,
        Email: ValidUser.Email,
        Active: ValidUser.Active,
        UserType: ValidUser.UserType,
      })
    );
    expect(Result).not.toHaveProperty('Password');
  });

  it('should throw BadRequestException when user does not exist', async () => {
    MockUserRepo.findOne.mockResolvedValue(null);

    await expect(service.GetProfile('MissingUser')).rejects.toThrow(
      BadRequestException
    );
    await expect(service.GetProfile('MissingUser')).rejects.toThrow(
      'User not found'
    );
  });

  it('should update allowed user fields correctly', async () => {
    const ExistingUser = { ...ValidUser };
    const UpdateDto = {
      Name: 'Jane Smith',
      BirthDate: '1991-01-15',
    };
    const UpdatedUser = {
      ...ExistingUser,
      Name: UpdateDto.Name,
      BirthDate: new Date(UpdateDto.BirthDate),
    };

    MockUserRepo.findOne.mockResolvedValue(ExistingUser);
    MockUserRepo.save.mockResolvedValue(UpdatedUser);

    const Result = await service.UpdateProfile(ExistingUser.UserId, UpdateDto);

    expect(Result).toEqual(
      expect.objectContaining({
        UserId: ExistingUser.UserId,
        Name: UpdateDto.Name,
        BirthDate: new Date(UpdateDto.BirthDate),
      })
    );
    expect(Result).not.toHaveProperty('Password');
  });

  it('should deactivate the user account', async () => {
    const ExistingUser = { ...ValidUser, Active: true };
    const DeactivatedUser = { ...ExistingUser, Active: false };

    MockUserRepo.findOne.mockResolvedValue(ExistingUser);
    MockUserRepo.save.mockResolvedValue(DeactivatedUser);

    const Result = await service.DeleteAccount(ExistingUser.UserId);

    expect(MockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        UserId: ExistingUser.UserId,
        Active: false,
      })
    );
    expect(Result).toEqual({ message: 'Account deleted successfully' });
  });
});
