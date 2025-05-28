import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { BoardComponent } from './pages/board/board.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TeamComponent } from './pages/profile/team/team.component';
import { PersonInfoComponent } from './pages/profile/person-info/person-info.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { StatisticComponent } from './pages/statistic/statistic.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: "full"
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      {
        path: '',
        component: PersonInfoComponent
      },
      {
        path: 'team',
        component: TeamComponent
      }
    
    ]
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'board',
        component: BoardComponent
      }

    ]
  },
  {
    path: 'statistic',
    component: StatisticComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
