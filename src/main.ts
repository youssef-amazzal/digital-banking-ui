import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Chart.js imports and registration
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  PieController,
  BarController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  PieController,
  BarController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
