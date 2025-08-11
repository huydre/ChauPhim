import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clean up database before each test
  await prisma.watchHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.videoCast.deleteMany();
  await prisma.videoGenre.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.movieSource.deleteMany();
  await prisma.video.deleteMany();
  await prisma.castMember.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
