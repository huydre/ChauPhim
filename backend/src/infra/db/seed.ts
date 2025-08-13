import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils';
import logger from '../../config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  // Create genres
  logger.info('Creating genres...');
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { slug: 'action' },
      update: {},
      create: {
        slug: 'action',
        nameVi: 'Hành động',
        nameEn: 'Action',
      },
    }),
    prisma.genre.upsert({
      where: { slug: 'comedy' },
      update: {},
      create: {
        slug: 'comedy',
        nameVi: 'Hài kịch',
        nameEn: 'Comedy',
      },
    }),
    prisma.genre.upsert({
      where: { slug: 'drama' },
      update: {},
      create: {
        slug: 'drama',
        nameVi: 'Chính kịch',
        nameEn: 'Drama',
      },
    }),
    prisma.genre.upsert({
      where: { slug: 'horror' },
      update: {},
      create: {
        slug: 'horror',
        nameVi: 'Kinh dị',
        nameEn: 'Horror',
      },
    }),
    prisma.genre.upsert({
      where: { slug: 'romance' },
      update: {},
      create: {
        slug: 'romance',
        nameVi: 'Lãng mạn',
        nameEn: 'Romance',
      },
    }),
    prisma.genre.upsert({
      where: { slug: 'sci-fi' },
      update: {},
      create: {
        slug: 'sci-fi',
        nameVi: 'Khoa học viễn tưởng',
        nameEn: 'Science Fiction',
      },
    }),
  ]);

  // Create cast members
  logger.info('Creating cast members...');
  const castMembers = await Promise.all([
    prisma.castMember.upsert({
      where: { id: 'cast-1' },
      update: {},
      create: {
        id: 'cast-1',
        name: 'Tom Hanks',
        avatarUrl: 'https://example.com/tom-hanks.jpg',
      },
    }),
    prisma.castMember.upsert({
      where: { id: 'cast-2' },
      update: {},
      create: {
        id: 'cast-2',
        name: 'Scarlett Johansson',
        avatarUrl: 'https://example.com/scarlett-johansson.jpg',
      },
    }),
    prisma.castMember.upsert({
      where: { id: 'cast-3' },
      update: {},
      create: {
        id: 'cast-3',
        name: 'Leonardo DiCaprio',
        avatarUrl: 'https://example.com/leonardo-dicaprio.jpg',
      },
    }),
    prisma.castMember.upsert({
      where: { id: 'cast-4' },
      update: {},
      create: {
        id: 'cast-4',
        name: 'Emma Stone',
        avatarUrl: 'https://example.com/emma-stone.jpg',
      },
    }),
  ]);

  // Create admin user
  logger.info('Creating admin user...');
  const adminPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chauphim.com' },
    update: {},
    create: {
      id: 'admin-user-id',
      email: 'admin@chauphim.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create test user
  logger.info('Creating test user...');
  const userPassword = await hashPassword('user123');
  const testUser = await prisma.user.upsert({
    where: { email: 'user@chauphim.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'user@chauphim.com',
      passwordHash: userPassword,
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  // Create sample movies
  logger.info('Creating sample movies...');
  const movie1 = await prisma.video.upsert({
    where: { slug: 'the-sample-movie' },
    update: {},
    create: {
      id: 'movie-1',
      slug: 'the-sample-movie',
      titleVi: 'Bộ Phim Mẫu',
      titleEn: 'The Sample Movie',
      descriptionVi: 'Đây là mô tả cho bộ phim mẫu bằng tiếng Việt.',
      descriptionEn: 'This is a description for the sample movie in English.',
      type: 'MOVIE',
      year: 2023,
      posterUrl: 'https://example.com/movie1-poster.jpg',
      backdropUrl: 'https://example.com/movie1-backdrop.jpg',
      ageRating: 'PG13',
      durationMinutes: 120,
      isPublished: true,
      viewsCount: 1500,
    },
  });

  const movie2 = await prisma.video.upsert({
    where: { slug: 'another-great-film' },
    update: {},
    create: {
      id: 'movie-2',
      slug: 'another-great-film',
      titleVi: 'Một Bộ Phim Tuyệt Vời Khác',
      titleEn: 'Another Great Film',
      descriptionVi: 'Mô tả cho bộ phim tuyệt vời khác.',
      descriptionEn: 'Description for another great film.',
      type: 'MOVIE',
      year: 2024,
      posterUrl: 'https://example.com/movie2-poster.jpg',
      backdropUrl: 'https://example.com/movie2-backdrop.jpg',
      ageRating: 'R',
      durationMinutes: 95,
      isPublished: true,
      viewsCount: 2300,
    },
  });

  // Create sample series
  logger.info('Creating sample series...');
  const series1 = await prisma.video.upsert({
    where: { slug: 'the-sample-series' },
    update: {},
    create: {
      id: 'series-1',
      slug: 'the-sample-series',
      titleVi: 'Bộ Phim Truyền Hình Mẫu',
      titleEn: 'The Sample Series',
      descriptionVi: 'Đây là mô tả cho bộ phim truyền hình mẫu.',
      descriptionEn: 'This is a description for the sample series.',
      type: 'SERIES',
      year: 2023,
      posterUrl: 'https://example.com/series1-poster.jpg',
      backdropUrl: 'https://example.com/series1-backdrop.jpg',
      ageRating: 'PG13',
      isPublished: true,
      viewsCount: 5000,
    },
  });

  // Create seasons and episodes for the series
  logger.info('Creating seasons and episodes...');
  const season1 = await prisma.season.upsert({
    where: { 
      videoId_seasonNumber: {
        videoId: series1.id,
        seasonNumber: 1,
      },
    },
    update: {},
    create: {
      id: 'season-1',
      videoId: series1.id,
      seasonNumber: 1,
      nameVi: 'Mùa 1',
      nameEn: 'Season 1',
    },
  });

  const episodes = await Promise.all([
    prisma.episode.upsert({
      where: {
        seasonId_episodeNumber: {
          seasonId: season1.id,
          episodeNumber: 1,
        },
      },
      update: {},
      create: {
        id: 'episode-1',
        seasonId: season1.id,
        episodeNumber: 1,
        titleVi: 'Tập 1: Khởi đầu',
        titleEn: 'Episode 1: The Beginning',
        synopsisVi: 'Tập đầu tiên của loạt phim.',
        synopsisEn: 'The first episode of the series.',
        runtimeMinutes: 45,
        hlsManifestKey: 'videos/series-1/season-1/episode-1/master.m3u8',
        isPublished: true,
        subtitlesJson: [
          {
            lang: 'vi',
            label: 'Tiếng Việt',
            key: 'videos/series-1/season-1/episode-1/subtitles/vi.vtt',
          },
          {
            lang: 'en',
            label: 'English',
            key: 'videos/series-1/season-1/episode-1/subtitles/en.vtt',
          },
        ],
      },
    }),
    prisma.episode.upsert({
      where: {
        seasonId_episodeNumber: {
          seasonId: season1.id,
          episodeNumber: 2,
        },
      },
      update: {},
      create: {
        id: 'episode-2',
        seasonId: season1.id,
        episodeNumber: 2,
        titleVi: 'Tập 2: Phát triển',
        titleEn: 'Episode 2: Development',
        synopsisVi: 'Tập thứ hai của loạt phim.',
        synopsisEn: 'The second episode of the series.',
        runtimeMinutes: 48,
        hlsManifestKey: 'videos/series-1/season-1/episode-2/master.m3u8',
        isPublished: true,
        subtitlesJson: [
          {
            lang: 'vi',
            label: 'Tiếng Việt',
            key: 'videos/series-1/season-1/episode-2/subtitles/vi.vtt',
          },
          {
            lang: 'en',
            label: 'English',
            key: 'videos/series-1/season-1/episode-2/subtitles/en.vtt',
          },
        ],
      },
    }),
  ]);

  // Create movie sources
  logger.info('Creating movie sources...');
  await Promise.all([
    prisma.movieSource.upsert({
      where: { videoId: movie1.id },
      update: {},
      create: {
        id: 'movie-source-1',
        videoId: movie1.id,
        hlsManifestKey: 'videos/movie-1/master.m3u8',
        trailerHlsManifestKey: 'videos/movie-1/trailer/master.m3u8',
        isPublished: true,
        subtitlesJson: [
          {
            lang: 'vi',
            label: 'Tiếng Việt',
            key: 'videos/movie-1/subtitles/vi.vtt',
          },
          {
            lang: 'en',
            label: 'English',
            key: 'videos/movie-1/subtitles/en.vtt',
          },
        ],
      },
    }),
    prisma.movieSource.upsert({
      where: { videoId: movie2.id },
      update: {},
      create: {
        id: 'movie-source-2',
        videoId: movie2.id,
        hlsManifestKey: 'videos/movie-2/master.m3u8',
        isPublished: true,
        subtitlesJson: [
          {
            lang: 'vi',
            label: 'Tiếng Việt',
            key: 'videos/movie-2/subtitles/vi.vtt',
          },
        ],
      },
    }),
  ]);

  // Assign genres to videos
  logger.info('Assigning genres to videos...');
  await Promise.all([
    // Movie 1: Action + Drama
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: movie1.id,
          genreId: genres[0].id, // Action
        },
      },
      update: {},
      create: {
        videoId: movie1.id,
        genreId: genres[0].id,
      },
    }),
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: movie1.id,
          genreId: genres[2].id, // Drama
        },
      },
      update: {},
      create: {
        videoId: movie1.id,
        genreId: genres[2].id,
      },
    }),
    // Movie 2: Comedy + Romance
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: movie2.id,
          genreId: genres[1].id, // Comedy
        },
      },
      update: {},
      create: {
        videoId: movie2.id,
        genreId: genres[1].id,
      },
    }),
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: movie2.id,
          genreId: genres[4].id, // Romance
        },
      },
      update: {},
      create: {
        videoId: movie2.id,
        genreId: genres[4].id,
      },
    }),
    // Series 1: Sci-Fi + Drama
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: series1.id,
          genreId: genres[5].id, // Sci-Fi
        },
      },
      update: {},
      create: {
        videoId: series1.id,
        genreId: genres[5].id,
      },
    }),
    prisma.videoGenre.upsert({
      where: {
        videoId_genreId: {
          videoId: series1.id,
          genreId: genres[2].id, // Drama
        },
      },
      update: {},
      create: {
        videoId: series1.id,
        genreId: genres[2].id,
      },
    }),
  ]);

  // Assign cast to videos
  logger.info('Assigning cast to videos...');
  await Promise.all([
    prisma.videoCast.upsert({
      where: {
        videoId_castId: {
          videoId: movie1.id,
          castId: castMembers[0].id,
        },
      },
      update: {},
      create: {
        videoId: movie1.id,
        castId: castMembers[0].id,
        roleName: 'Main Character',
      },
    }),
    prisma.videoCast.upsert({
      where: {
        videoId_castId: {
          videoId: movie1.id,
          castId: castMembers[1].id,
        },
      },
      update: {},
      create: {
        videoId: movie1.id,
        castId: castMembers[1].id,
        roleName: 'Supporting Character',
      },
    }),
    prisma.videoCast.upsert({
      where: {
        videoId_castId: {
          videoId: movie2.id,
          castId: castMembers[2].id,
        },
      },
      update: {},
      create: {
        videoId: movie2.id,
        castId: castMembers[2].id,
        roleName: 'Lead Role',
      },
    }),
  ]);

  // Create sample ratings
  logger.info('Creating sample ratings...');
  await Promise.all([
    prisma.rating.upsert({
      where: {
        userId_videoId: {
          userId: testUser.id,
          videoId: movie1.id,
        },
      },
      update: {},
      create: {
        id: 'rating-1',
        userId: testUser.id,
        videoId: movie1.id,
        score: 8,
        reviewText: 'Great movie! Really enjoyed it.',
      },
    }),
    prisma.rating.upsert({
      where: {
        userId_videoId: {
          userId: testUser.id,
          videoId: series1.id,
        },
      },
      update: {},
      create: {
        id: 'rating-2',
        userId: testUser.id,
        videoId: series1.id,
        score: 9,
        reviewText: 'Amazing series, can\'t wait for the next season!',
      },
    }),
  ]);

  // Create sample comments
  logger.info('Creating sample comments...');
  await Promise.all([
    prisma.comment.upsert({
      where: { id: 'comment-1' },
      update: {},
      create: {
        id: 'comment-1',
        userId: testUser.id,
        videoId: movie1.id,
        content: 'This movie is absolutely fantastic! The acting is superb.',
      },
    }),
    prisma.comment.upsert({
      where: { id: 'comment-2' },
      update: {},
      create: {
        id: 'comment-2',
        userId: adminUser.id,
        videoId: movie1.id,
        content: 'I agree! The cinematography is also outstanding.',
        parentId: 'comment-1',
      },
    }),
    prisma.comment.upsert({
      where: { id: 'comment-3' },
      update: {},
      create: {
        id: 'comment-3',
        userId: testUser.id,
        videoId: series1.id,
        content: 'Best series I\'ve watched this year!',
      },
    }),
  ]);

  // Add to favorites
  logger.info('Creating favorites...');
  await prisma.favorite.upsert({
    where: {
      userId_videoId: {
        userId: testUser.id,
        videoId: series1.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      videoId: series1.id,
    },
  });

  // Create sample watch history
  logger.info('Creating watch history...');
  await Promise.all([
    prisma.watchHistory.upsert({
      where: { id: 'watch-1' },
      update: {},
      create: {
        id: 'watch-1',
        userId: testUser.id,
        videoId: movie1.id,
        progressSeconds: 3600, // 1 hour
        completed: false,
        lastWatchedAt: new Date(),
      },
    }),
    prisma.watchHistory.upsert({
      where: { id: 'watch-2' },
      update: {},
      create: {
        id: 'watch-2',
        userId: testUser.id,
        videoId: series1.id,
        episodeId: episodes[0].id,
        progressSeconds: 2700, // 45 minutes (completed)
        completed: true,
        lastWatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
    }),
    prisma.watchHistory.upsert({
      where: { id: 'watch-3' },
      update: {},
      create: {
        id: 'watch-3',
        userId: testUser.id,
        videoId: series1.id,
        episodeId: episodes[1].id,
        progressSeconds: 1200, // 20 minutes
        completed: false,
        lastWatchedAt: new Date(),
      },
    }),
  ]);

  logger.info('✅ Database seeding completed successfully!');
  logger.info('📧 Admin user: admin@chauphim.com / admin123');
  logger.info('📧 Test user: user@chauphim.com / user123');
}

main()
  .catch((e) => {
    logger.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
