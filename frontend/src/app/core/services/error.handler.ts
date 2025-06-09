import {ErrorHandler, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ApiLoggerService} from '../../api/services/api-logger.service';
import {ERROR_SNACKBAR} from '../../util/snackbar-consts';


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private snackBar: MatSnackBar,
    private logApi: ApiLoggerService
  ) {
  }

  handleError(error: Error): void {
    console.error(error);
    const stack = `${error.stack}`;
    const message = error.message || 'An unexpected error occurred';
    this.logApi.log({body: {message: error.message, stack}}).subscribe({
      next: () => {
        this.snackBar.open(message, 'Ok', ERROR_SNACKBAR);
      },
      error: (err) => {
        this.snackBar.open(err, 'Ok', ERROR_SNACKBAR);
      }
    });

  }
}
