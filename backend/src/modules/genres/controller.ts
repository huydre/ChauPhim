import { Request, Response } from 'express';
import { GenreService, CreateGenreRequest, UpdateGenreRequest } from './service';
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

  getGenresWithStats = asyncHandler(async (req: Request, res: Response) => {
    const genres = await this.genreService.getGenresWithStats();
    
    res.json({
      success: true,
      data: genres,
    });
  });

  getGenreById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Genre ID is required',
      });
      return;
    }
    
    const genre = await this.genreService.getGenreById(id);
    
    res.json({
      success: true,
      data: genre,
    });
  });

  createGenre = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateGenreRequest = req.body;
    const genre = await this.genreService.createGenre(data);
    
    res.status(201).json({
      success: true,
      message: 'Genre created successfully',
      data: genre,
    });
  });

  updateGenre = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Genre ID is required',
      });
      return;
    }
    
    const data: UpdateGenreRequest = req.body;
    const genre = await this.genreService.updateGenre(id, data);
    
    res.json({
      success: true,
      message: 'Genre updated successfully',
      data: genre,
    });
  });

  deleteGenre = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Genre ID is required',
      });
      return;
    }
    
    const result = await this.genreService.deleteGenre(id);
    
    res.json({
      success: true,
      message: result.message,
    });
  });
}
