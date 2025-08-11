import { Request, Response } from 'express';
import { GenreService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class GenreController {
  private genreService: GenreService;

  constructor() {
    this.genreService = new GenreService();
  }

  getGenres = asyncHandler(async (req: Request, res: Response) => {
    const genres = await this.genreService.getGenres();
    
    res.json({
      success: true,
      data: genres,
    });
  });
}
